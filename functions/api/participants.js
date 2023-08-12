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

const getAvailableFullname = async fullname => {
  const userCollections = ["users", "usersSurvey"];

  let _fullname = fullname;
  while (true) {
    let found = false;

    for (const userCollection of userCollections) {
      const docRef = await db.collection(userCollection).doc(_fullname).get();
      if (docRef.exists) {
        found = true;
      }
    }

    if (!found) {
      break;
    }
    const randomNum = Math.floor(Math.random() * 10);
    _fullname += randomNum;
  }

  return _fullname;
};
// POST /api/participants/schedule
participantsRouter.post("/schedule", async (req, res) => {
  try {
    let { sessions, project, surveyType, instructorId } = req.body;

    const { email } = req.userData;

    console.log("/schedule", email, surveyType);
    const batch = db.batch();

    sessions.sort((a, b) => (a < b ? -1 : 1)); // asc sorting

    if (!sessions || !project) {
      throw new Error("invalid request");
    }

    const researchers = {};
    const researcherDocs = await db.collection("researchers").get();
    for (let researcherDoc of researcherDocs.docs) {
      const researcherData = researcherDoc.data();
      if (
        "projects" in researcherData &&
        project in researcherData.projects &&
        researcherData.projects[project].active &&
        researcherData.email !== "oneweb@umich.edu"
      ) {
        researchers[researcherData.email] = researcherDoc.id;
      }
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
    const scheduleEnd = moment().utcOffset(-4).startOf("day").add(16, "days").startOf("month").format("YYYY-MM-DD");
    if (!scheduleMonths.includes(scheduleEnd)) {
      scheduleMonths.push(scheduleEnd);
    }

    // Retrieve all the researchers' avaialbilities in this project.
    const resScheduleDocs = await db
      .collection("resSchedule")
      .where("month", "in", scheduleMonths)
      .where("project", "==", project)
      .get();

    let availSessions = {};
    for (let resScheduleDoc of resScheduleDocs.docs) {
      const resScheduleData = resScheduleDoc.data();

      // date time flagged by researchers as available by them
      let _schedules = resScheduleData.schedules || {};
      for (const researcherFullname in _schedules) {
        for (const scheduleSlot of _schedules[researcherFullname]) {
          const slotDT = moment(scheduleSlot).utcOffset(-4, true).toDate();
          // if availability is expired already
          if (slotDT.getTime() < new Date().getTime()) {
            continue;
          }
          const _scheduleSlot = slotDT.toLocaleString();
          if (!availSessions[_scheduleSlot]) {
            availSessions[_scheduleSlot] = [];
          }
          if (Object.values(researchers).includes(researcherFullname)) {
            availSessions[_scheduleSlot].push(researcherFullname);
          }
        }
      }
      // date time already booked by participants
    }
    for (let event of events) {
      // First, we should figure out whether the user participated in the past:
      if (new Date(event.start.dateTime) < new Date()) {
        // Only if one of the attendees of the event is this user:
        if (
          event.attendees &&
          event.attendees.length > 0 &&
          event.attendees.findIndex(attendee => attendee.email === email) !== -1
        ) {
          // return;
        }
      }
      // Only future events
      const startTime = new Date(event.start.dateTime).toLocaleString();
      const endTime = new Date(new Date(event.end.dateTime) - 30 * 60 * 1000).toLocaleString();
      const duration = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime();
      const startMinus30Min = new Date(new Date(event.start.dateTime).getTime() - 30 * 60 * 1000);
      if (
        event.attendees &&
        event.attendees.length > 0 &&
        startTime in availSessions &&
        event.attendees.findIndex(attendee => attendee.email === email) === -1 &&
        events.findIndex(
          eve =>
            new Date(eve.start.dateTime).getTime() === startMinus30Min.getTime() &&
            new Date(eve.start.dateTime).getTime() + 60 * 60 * 1000 === new Date(eve.end.dateTime).getTime() &&
            eve.attendees.includes(email)
        ) === -1
      ) {
        for (let attendee of event.attendees) {
          if (!researchers[attendee.email]) continue;
          if (availSessions.hasOwnProperty(startTime)) {
            availSessions[startTime] = availSessions[startTime].filter(resea => resea !== researchers[attendee.email]);
          }
          if (duration >= 60 * 60 * 1000 && availSessions.hasOwnProperty(endTime)) {
            availSessions[endTime] = availSessions[endTime].filter(resea => resea !== researchers[attendee.email]);
          }
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

    const researchersBySession = {};

    for (let i = 0; i < sessions.length; ++i) {
      const start = moment(sessions[i]).utcOffset(-4, true).toDate().toLocaleString();
      let availableResearchers = availSessions[start] || [];
      let sessionDuration = projectSpecsData.sessionDuration?.[i] || 2;
      if (project === "OnlineCommunities" && surveyType === "instructor") {
        sessionDuration = 1;
      }
      for (let j = 0; j < sessionDuration; j++) {
        const availableSlot = moment(sessions[i])
          .add((j * 60) / projectSpecsData.hourlyChunks, "minutes")
          .utcOffset(-4, true)
          .toDate()
          .toLocaleString();
        availableResearchers = availableResearchers.filter(availableResearcher =>
          (availSessions[availableSlot] || []).includes(availableResearcher)
        );
      }
      researchersBySession[start] = availableResearchers;
    }

    const selectedResearchers = {};

    for (const session in researchersBySession) {
      const availableResearchers = researchersBySession[session];
      const researcher = availableResearchers[Math.floor(Math.random() * availableResearchers.length)];

      if (!researcher) {
        throw new Error("No researcher is available in given schedule");
      }

      selectedResearchers[session] = researcher;
    }
    for (let i = 0; i < sessions.length; ++i) {
      const sessionDate = moment(sessions[i]).utcOffset(-4, true).toDate().toLocaleString();
      const researcher = selectedResearchers[sessionDate];
      const rUser = await db.collection("users").doc(researcher).get();
      const rUserData = rUser.data();

      const start = moment(sessions[i]).utcOffset(-4, true);
      let sessionDuration = projectSpecsData.sessionDuration?.[i] || 2;
      if (project === "OnlineCommunities" && surveyType === "instructor") {
        sessionDuration = 1;
      }
      // adding slotDuration * number of slots for the session
      const end = moment(start).add(slotDuration * sessionDuration, "minutes");
      // const eventCreated = await insertEvent(start, end, summary, description, [{ email }, { email: researcher }], colorId);
      const eventCreated = await createExperimentEvent(
        email,
        rUserData.email,
        toOrdinal(i + 1),
        start,
        end,
        projectSpecsData,
        surveyType
      );
      events.push(eventCreated);

      const scheduleRef = db.collection("schedule").doc();
      batch.set(scheduleRef, {
        email: email.toLowerCase(),
        session: Timestamp.fromDate(start.toDate()),
        order: toOrdinal(i + 1),
        id: eventCreated.data.id,
        project
      });

      if (project === "OnlineCommunities") {
        const instructorsDocs = await db.collection("instructors").where("email", "==", email).get();
        const usersServeyDocs = await db.collection("usersSurvey").where("email", "==", email).get();
        if (instructorsDocs.docs.length > 0) {
          batch.update(instructorsDocs.docs[0].ref, {
            scheduled: true
          });
          if (usersServeyDocs.docs.length === 0) {
            const instuctorsData = instructorsDocs.docs[0].data();
            const fullName = await getAvailableFullname(`${instuctorsData.firstname} ${instuctorsData.lastname}`);
            const userSurevyRef = db.collection("usersSurvey").doc(fullName);
            batch.set(userSurevyRef, {
              email: email,
              project,
              scheduled: true,
              institution: instuctorsData.institution,
              instructorId: instructorId,
              firstname: instuctorsData.firstname,
              uid: "",
              surveyType: "instructor",
              lastname: instuctorsData.lastname,
              noRetaineData: false,
              createdAt: Timestamp.fromDate(new Date())
            });
          }
        }

        if (usersServeyDocs.docs.length === 0 && instructorsDocs.docs.length === 0) {
          const usersDocs = await db.collection("users").where("email", "==", email).get();
          if (usersDocs.docs.length > 0) {
            const userSurevyRef = db.collection("usersSurvey").doc(usersDocs.docs[0].id);
            const userData = usersDocs.docs[0].data();
            batch.set(userSurevyRef, {
              email: email,
              project,
              scheduled: true,
              institution: userData.institution,
              instructorId: "student",
              firstname: userData.firstname,
              uid: userData.uid,
              surveyType: "student",
              lastname: userData.lastname,
              noRetaineData: false,
              createdAt: Timestamp.fromDate(new Date())
            });
          }
        }
      }
    }

    await batch.commit();
    return res.status(200).json({ message: "Sessions successfully scheduled" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error occurred, please try later" });
  }
});

module.exports = participantsRouter;
