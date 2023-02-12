const express = require("express");
const moment = require("moment");
const { toOrdinal } = require("number-to-words");
const { db } = require("../admin");
const { Timestamp } = require("firebase-admin/firestore");
const firebaseAuth = require("../middlewares/firebaseAuth");
const isParticipant = require("../middlewares/isParticipant");
const { createExperimentEvent } = require("../scheduling");
const { deleteEvent } = require("../GoogleCalendar");
const participantsRouter = express.Router();

participantsRouter.use(firebaseAuth);
participantsRouter.use(isParticipant);

// POST /api/participants/schedule
participantsRouter.post("/schedule", async (req, res) => {
  try {
    let { sessions, project } = req.body;
    const { fullname, email } = req.userData;
    const batch = db.batch();
    
    sessions.sort((a, b) => a < b ? -1 : 1); // asc sorting

    if(!sessions || !project) {
      throw new Error("invalid request")
    }

    // const events = [];

    const projectSpecs = await db.collection("projectSpecs").doc(project).get();
    if (!projectSpecs.exists) {
      throw new Error("Project Specs not found.");
    }

    const projectSpecsData = projectSpecs.data();
    // 1 hour / 2 = 30 mins
    const slotDuration = 60 / (projectSpecsData.hourlyChunks || 2);

    const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
    const scheduleEnd = moment().utcOffset(-4).startOf("day").add(16, "days").startOf("month").format("YYYY-MM-DD")
    if(!scheduleMonths.includes(scheduleEnd)) {
      scheduleMonths.push(scheduleEnd);
    }

    const resScheduleRefsByMonth = {};
    const resScheduleDataByMonth = {};

    let availableScheduleByResearchers = {};
    const resSchedules = await db.collection("resSchedule")
      .where("project", "==", project)
      .where("month", "in", scheduleMonths).get();
    
    for(const resSchedule of resSchedules.docs) {
      const resScheduleData = resSchedule.data();
      resScheduleRefsByMonth[resScheduleData.month] = db.collection("resSchedule").doc(resSchedule.id);
      resScheduleDataByMonth[resScheduleData.month] = resScheduleData;
      // scheduled
      const { schedules: resSchedules, scheduled: resScheduled } = resScheduleData;

      for(const fullnameRes in resSchedules) {
        const _schedules = resSchedules[fullnameRes] || [];
        for(const scheduleSlot of _schedules) {
          if(!availableScheduleByResearchers[scheduleSlot]) {
            availableScheduleByResearchers[scheduleSlot] = [];
          }
          if(!availableScheduleByResearchers[scheduleSlot].includes(fullnameRes)) {
            availableScheduleByResearchers[scheduleSlot].push(fullnameRes);
          }
        }
      }
      for(const fullnameRes in resScheduled) {
        for(const participant in resScheduled[fullnameRes]) {
          const __scheduled = Object.entries(resScheduled[fullnameRes][participant]);
          for(const _scheduled of __scheduled) {

            for(const scheduledSlot of _scheduled) {
              if(!availableScheduleByResearchers[scheduledSlot] || participant === fullname ) {
                continue;
              }
              if(availableScheduleByResearchers[scheduledSlot].includes(fullnameRes)) {
                const idx = availableScheduleByResearchers[scheduledSlot].indexOf(fullnameRes);
                availableScheduleByResearchers[scheduledSlot].splice(idx, 1);
              }
            }
          }
        }
      }
    }

    const previousSchedules = await db.collection("schedule").where("email", "==", email.toLowerCase()).get();
    for (let scheduleDoc of previousSchedules.docs) {
      const scheduleData = scheduleDoc.data();
      if (scheduleData?.id) {
        await deleteEvent(scheduleData.id)
      }
      const month = moment(scheduleData.session.toDate()).utcOffset(-4, true).startOf("month").format("YYYY-MM-DD");
      const resScheduleData = resScheduleDataByMonth[month];

      for(const researcher in resScheduleData.scheduled) {
        if(resScheduleData.scheduled?.[researcher]?.[fullname]) {
          resScheduleData.scheduled[researcher][fullname] = {};
        }
      }

      const scheduleRef = db.collection("schedule").doc(scheduleDoc.id);
      batch.delete(scheduleRef);
    }

    let availableResearchers = availableScheduleByResearchers[sessions[0]] || [];

    const bookedSlots = [];

    for (let i = 0; i < sessions.length; ++i) {
      const start = moment(sessions[i]).utcOffset(-4, true);
      const sessionDuration = (projectSpecsData.sessionDuration?.[i] || 2);
      for(let j = 0; j < sessionDuration; j++) {
       const  availableSlot = moment(start).add(j * 30, "minutes").format("YYYY-MM-DD HH:mm");
        bookedSlots.push(availableSlot);
        availableResearchers = availableResearchers.filter((availableResearcher) => (availableScheduleByResearchers[availableSlot] || []).includes(availableResearcher))
      }
    }

    

    const researcher = availableResearchers[
      Math.floor(Math.random() * availableResearchers.length)
    ];

    if(!researcher) {
      throw new Error("No researcher is available in given schedule");
    }

    const rUser = await db.collection("users").doc(researcher).get();
    const rUserData = rUser.data();

    for (let i = 0; i < sessions.length; ++i) {
      const start = moment(sessions[i]).utcOffset(-4, true);
      const sessionDuration = (projectSpecsData.sessionDuration?.[i] || 2);
      // adding slotDuration * number of slots for the session
      const end = moment(start).add(slotDuration * sessionDuration, "minutes");
      const eventCreated = await createExperimentEvent(
        email,
        rUserData.email,
        toOrdinal(i + 1),
        start,
        end,
        projectSpecsData
      );
      // events.push(eventCreated);

      const scheduleRef = db.collection("schedule").doc();
      batch.set(scheduleRef, {
        email: email.toLowerCase(),
        session: Timestamp.fromDate(start.toDate()),
        order: toOrdinal(i + 1),
        id: eventCreated.data.id
      })
    }

    for(const bookedSlot of bookedSlots) {
      const month = moment(bookedSlot).utcOffset(-4, true).startOf("month").format("YYYY-MM-DD");
      const resScheduleData = resScheduleDataByMonth[month];
      if(!resScheduleData.scheduled[researcher]) {
        resScheduleData.scheduled[researcher] = {};
      }
      const scheduled = resScheduleData.scheduled[researcher];

      if(!resScheduleData.scheduled[researcher][fullname]) {
        resScheduleData.scheduled[researcher][fullname] = {};
      }
      const participantScheduled = scheduled[fullname];

      const _participantScheduled = Object.values(participantScheduled);
      _participantScheduled.push(bookedSlot);
      scheduled[fullname] = _participantScheduled.reduce((c, v, i) => ({...c, [i]: v}), {})
    }

    for(const month in resScheduleRefsByMonth) {
      const resScheduleRef = resScheduleRefsByMonth[month];
      const resScheduleData = resScheduleDataByMonth[month];
      batch.update(resScheduleRef, {
        scheduled: resScheduleData.scheduled
      })
    }

    await batch.commit();
    return res.status(200).json({ message: "Sessions successfully scheduled" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error occurred, please try later" });
  }
})

module.exports = participantsRouter;