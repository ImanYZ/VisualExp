const express = require("express");
const moment = require("moment");
const { toOrdinal } = require("number-to-words");
const { db } = require("../admin");
const { Timestamp } = require("firebase-admin/firestore");
const firebaseAuth = require("../middlewares/firebaseAuth");
const isParticipant = require("../middlewares/isParticipant");
const { createExperimentEvent } = require("../scheduling");
const { deleteEvent } = require("../GoogleCalendar");
const { futureEvents } = require("../scheduling");
const participantsRouter = express.Router();

participantsRouter.use(firebaseAuth);
participantsRouter.use(isParticipant);

// POST /api/participants/schedule
participantsRouter.post("/schedule", async (req, res) => {
  try {
    let { sessions, project } = req.body;
    const {email } = req.userData;
    const batch = db.batch();
    
    sessions.sort((a, b) => a < b ? -1 : 1); // asc sorting

    if(!sessions || !project) {
      throw new Error("invalid request")
    }

    const researchers = {};
    const researcherDocs = await db.collection("researchers").get();
    for (let researcherDoc of researcherDocs.docs) {
      const researcherData = researcherDoc.data();
      researchers[researcherData.email] = researcherDoc.id;
    }

    const events = await futureEvents(40);
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
      const { schedules: resSchedules } = resScheduleData;

      for(const researcher in resSchedules) {
        const _schedules = resSchedules[researcher] || [];
        for(const scheduleSlot of _schedules) {
          if(!availableScheduleByResearchers[scheduleSlot]) {
            availableScheduleByResearchers[scheduleSlot] = [];
          }
          if(!availableScheduleByResearchers[scheduleSlot].includes(researcher)) {
            availableScheduleByResearchers[scheduleSlot].push(researcher);
          }
        }
      }
    }
    
    function convertDateString(dateString) {
      // Convert the date string to a Date object
      const dateObj = new Date(dateString);

      // Convert the Date object to the desired string format
      const year = dateObj.getFullYear();
      const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
      const day = ("0" + dateObj.getDate()).slice(-2);
      const hours = ("0" + dateObj.getHours()).slice(-2);
      const minutes = ("0" + dateObj.getMinutes()).slice(-2);
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

      return formattedDate;
    }
    for (let event of events) {
      const startTime = new Date(event.start.dateTime).toLocaleString();
      const endTime = new Date(new Date(event.end.dateTime) - 30 * 60 * 1000).toLocaleString();
      const duration = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime();
      const startMinus30Min = new Date(new Date(event.start.dateTime).getTime() - 30 * 60 * 1000);
      const startSlot = convertDateString(startTime);
      const endSlot = convertDateString(endTime);
      if (
        !event.attendees ||
        !event.attendees.length === 0 ||
        availableScheduleByResearchers.hasOwnProperty(convertDateString(startTime))
      )
        continue;
      if (event.attendees.some(at => at.email === email)) continue;

      const indexOfevent = events.findIndex(
        eve =>
          new Date(eve.start.dateTime).getTime() === startMinus30Min.getTime() &&
          new Date(eve.start.dateTime).getTime() + 60 * 60 * 1000 === new Date(eve.end.dateTime).getTime() &&
          eve.attendees.includes(email)
      );
      if (indexOfevent !== -1) continue;
      for (let attendee of event.attendees) {
        if (researchers.hasOwnProperty(attendee.email) && availableScheduleByResearchers.hasOwnProperty(startSlot)) {
          availableScheduleByResearchers[startSlot].filter(res => res !== researchers[attendee.email]);
        }
        if (duration >= 60 * 60 * 1000 && availableScheduleByResearchers.hasOwnProperty(endSlot)) {
          availableScheduleByResearchers[endSlot].splice(
            availableScheduleByResearchers[endSlot].indexOf(researchers[attendee.email]),
            1
          );
        }
      }
    }

    // DELETE previous schedule : if any
    const previousSchedules = await db.collection("schedule").where("email", "==", email.toLowerCase()).get();
    for (let scheduleDoc of previousSchedules.docs) {
      const scheduleData = scheduleDoc.data();
      if (scheduleData?.id) {
        await deleteEvent(scheduleData.id);
      const scheduleRef = db.collection("schedule").doc(scheduleDoc.id);
      batch.delete(scheduleRef);
      }
    }

    const bookedSlots = [];

    const researchersBySession = {};

    for (let i = 0; i < sessions.length; ++i) {
      let availableResearchers = availableScheduleByResearchers[sessions[i]] || [];
      const start = moment(sessions[i]).utcOffset(-4, true);
      const sessionDuration = (projectSpecsData.sessionDuration?.[i] || 2);
      for(let j = 0; j < sessionDuration; j++) {
       const  availableSlot = moment(start).add(j * 30, "minutes").format("YYYY-MM-DD HH:mm");
        bookedSlots.push(availableSlot);
        availableResearchers = availableResearchers.filter((availableResearcher) => (availableScheduleByResearchers[availableSlot] || []).includes(availableResearcher))
      }
      researchersBySession[start.format("YYYY-MM-DD")] = availableResearchers;
    }

  
    const selectedResearchers = {};

    for(const session in researchersBySession) {
      const availableResearchers = researchersBySession[session];
      const researcher = availableResearchers[
        Math.floor(Math.random() * availableResearchers.length)
      ];

      if(!researcher) {
        throw new Error("No researcher is available in given schedule");
      }

      selectedResearchers[session] = researcher;
    }

    for (let i = 0; i < sessions.length; ++i) {
      const sessionDate = moment(sessions[i]).utcOffset(-4, true).format("YYYY-MM-DD");
      const researcher = selectedResearchers[sessionDate];
      const rUser = await db.collection("users").doc(researcher).get();
      const rUserData = rUser.data();

      const start = moment(sessions[i]).utcOffset(-4, true);
      const sessionDuration = projectSpecsData.sessionDuration?.[i] || 2;
      // adding slotDuration * number of slots for the session
      const end = moment(start).add(slotDuration * sessionDuration, "minutes");
      // const eventCreated = await insertEvent(start, end, summary, description, [{ email }, { email: researcher }], colorId);
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
      });
    }

    await batch.commit();
    return res.status(200).json({ message: "Sessions successfully scheduled" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error occurred, please try later" });
  }
});

module.exports = participantsRouter;
