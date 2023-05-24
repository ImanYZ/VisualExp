const express = require("express");
const { toOrdinal } = require("number-to-words");
const moment = require("moment");
const { db } = require("../admin");
const { Timestamp } = require("firebase-admin/firestore");
const firebaseAuth = require("../middlewares/firebaseAuth");
const isAdmin = require("../middlewares/isAdmin");
const { createExperimentEvent } = require("../scheduling");
const { deleteEvent } = require("../GoogleCalendar");
const adminRouter = express.Router();

adminRouter.use(firebaseAuth);
adminRouter.use(isAdmin);

const scheduleSingleSession = async object => {
  try {
    console.log(object);
    const { email, researcher, order, session, project, sessionIndex ,deleteEventid } = object;
    const start = new Date(session);

    const projectSpecs = await db.collection("projectSpecs").doc(project).get();
    const researcherDoc = await db.collection("researchers").doc(researcher).get();
    if (!projectSpecs.exists) {
      throw new Error("Project Specs not found.");
    }
    const projectSpecsData = projectSpecs.data();
    const researcherData = researcherDoc.data();
    // 1 hour / 2 = 30 mins
    const slotDuration = 60 / (projectSpecsData.hourlyChunks || 2);

    const end = new Date(
      start.getTime() + slotDuration * (projectSpecsData.sessionDuration?.[sessionIndex] || 1) * 60000
    );
    const eventCreated = await createExperimentEvent(email, researcherData.email, order, start, end, projectSpecsData);
    await deleteEvent(deleteEventid);
    return eventCreated;
  } catch (err) {
    console.log({ err });
  }
};

// POST /api/participants/schedule
adminRouter.post("/manageevents", async (req, res) => {
  try {
    const { participant, selectedSession, availableSessions, currentProject, events } = req.body;

    // console.log("participant",availableSessions,selectedSession[0] ,moment(selectedSession[0]).utcOffset(-4, true).toDate().toLocaleString());
    const batch = db.batch();
    // First, we get the user's data to make sure they had not previously
    // completed all the three experiment sessions.
    let userDocs = await db.collection("users").where("email", "==", participant).get();

    if (userDocs.docs.length === 0) {
      userDocs = await db.collection("instructors").where("email", "==", participant).get();
    }

    if (userDocs.docs.length === 0) {
      userDocs = await db.collection("usersSurvey").where("email", "==", participant).get();
    }

    if (userDocs.docs.length === 0) {
      return res.status(400).json({ message: "user Don't exit in the database" });
    }

      const userData = userDocs.docs[0].data();
      // If the user had previously completed all the three experiment sessions,
      // We just alert it and do nothing.
      if (userData.projectDone) {
        window.alert("This user completed the experiment before!");
        return;
      }
      // Otherwise,
      let scheduleDocs, scheduleRef;
      // We should check which of their scheduled sessions we'd like to change.
      // For each of the 1st, 2nd, and 3rd sessions:
      for(let ev of events){
        console.log("Events = order ", ev.order)
      }
      for (let i = 0; i < selectedSession.length; ++i) {
        // sessi points to the state variable corresponding to the scheduled session.
        const order = toOrdinal(i + 1);
        let sessi = selectedSession[i];
        // Find the index of the event for the participant's corresponding session
        console.log("Events = ", events[0].order)
        const eventIdx = events.findIndex(eve => eve.order === order && eve.participant === participant);
        console.log("Events = ", eventIdx , events[eventIdx]?.start,( eventIdx !== -1 && new Date(events[eventIdx].start).getTime() !== new Date(sessi).getTime()))
        // If we found their 1st/2nd/3rd session, but its start time is different
        // from the new firstSession/secondSession/thirdSession:
        if (eventIdx !== -1 && new Date(events[eventIdx].start).getTime() !== new Date(sessi).getTime()) {
          // Find this session in schedule collection.
          scheduleDocs = await db
            .collection("schedule")
            .where("email", "==", participant)
            .where("order", "==", order)
            .get();
          console.log("Schedule Docs = ", scheduleDocs.docs.length);
          // If it exists:
          if (scheduleDocs.docs.length > 0) {
            // 1) delete the schedule document from the collection.
            scheduleRef = db.collection("schedule").doc(scheduleDocs.docs[0].id);
            batch.delete(scheduleRef);
            console.log("Before Del");
            // 2) Delete the event from Google Calendar.
            const date = new Date(sessi)
            const slot = moment.utc(date).format('M/D/YYYY, h:mm:ss A');
            console.log("slot = ",slot,sessi,availableSessions)
            const eventCreated = await scheduleSingleSession({
              email: participant,
              researcher: availableSessions[slot][0],
              order,
              session: sessi,
              project: currentProject,
              sessionIndex: i,
              deleteEventid : events[eventIdx].id
            });
            // Figure out whether the new session already exists in schedule
            // for this participant.
            scheduleDocs = await db
              .collection("schedule")
              .where("email", "==", participant)
              .where("session", "==", sessi)
              .get();
            // If it exists, update it with the new event id and order.

            if (scheduleDocs.docs.length > 0) {
              scheduleRef = db.collection("schedule").doc(scheduleDocs.docs[0].id);
              batch.update(scheduleRef, {
                id: eventCreated.data.id,
                order
              });
            } else {
              // Otherwise, create a new one.
              scheduleRef = db.collection("schedule").doc();
              batch.set(scheduleRef, {
                email: participant,
                session: Timestamp.fromDate(new Date(sessi)),
                id: eventCreated.data.id,
                order
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

module.exports = adminRouter;
