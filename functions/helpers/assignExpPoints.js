const { db } = require("../admin");
const moment = require("moment-timezone");
const { Timestamp } = require("firebase-admin/firestore");
const { getEvent } = require("../GoogleCalendar");
const { checkFullyGradedRecall } = require("./grading-recalls");

exports.assignExpPoints = async obj => {
  try {
    const {
      researcher,
      participant,
      session,
      project,
      recallGradeData,
      feedbackCodeData,
      transactionWrites,
      t,
      eventId,
      checkRecallgrading = true,
      researchersUpdates
    } = obj;
    // TODO: change logic for searching expSession in future when most of documents would have eventId

    let points = session === "1st" ? 16 : 10;

    // this is temporary until the survey is over.
    // as this survey will have only one session
    if (project === "Annotating") {
      points = 10;
    }

    let scheduleData = {};

    const user = await t.get(db.collection("users").doc(participant));

    const schedules = await t.get(
      db
        .collection("schedule")
        .where("email", "==", user.data()?.email || "")
        .where("order", "==", session)
    );
    let _eventId = "";
    if (!eventId) {
      // schedule is not available
      if (!schedules.docs.length) {
        console.log("schedule is not available");
        return;
      }
      const schedule = schedules.docs[0];
      scheduleData = schedule.data();

      // if google calender event does not exists
      if (!scheduleData?.id) {
        console.log("google calender event does not exists");
        return;
      }

      // if schedule wasn't started
      if (!scheduleData?.hasStarted) return;

      _eventId = scheduleData?.id;
    }

    const event = await getEvent(_eventId);

    const attendees = (event.attendees || [])
      .map(attendee => attendee.email)
      .filter(email => email !== "ouhrac@gmail.com");

    const startTime = moment.tz(event.start.dateTime, event.start.timeZone).toDate();
    const endTime = moment.tz(event.end.dateTime, event.end.timeZone).toDate();

    const expSessions = await t.get(
      db
        .collection("expSessions")
        .where("attendees", "==", attendees)
        .where("sTime", "==", Timestamp.fromDate(startTime))
        .where("project", "==", project)
    );

    // if points already distributed for this session we are not going to run this logic
    if (expSessions.docs.length) {
      console.log("expSessions doc already exists");
      return;
    }

    // checking if researcher attended session
    if (!attendees.includes(researcher.email)) {
      console.log("researcher did not attend session");
      return;
    }

    if (checkRecallgrading) {
      const userRecallGrades = await t.get(
        db.collection("recallGradesV2").where("user", "==", participant).where("project", "==", project)
      );
      const userfeedbacks = await t.get(
        db
          .collection("feedbackCode")
          .where("fullname", "==", participant)
          .where("project", "==", project)
          .where("session", "==", session)
      );

      const userRecallGradeData = recallGradeData !== null ? recallGradeData : userRecallGrades.docs[0].data();

      const recallSession = userRecallGradeData.sessions[session];

      const fullyGraded = checkFullyGradedRecall(recallSession, researcher);
      if (!fullyGraded) {
        console.log("researcher did not grade recall");
        return;
      }

      let currentfeedbackId = "";
      if (feedbackCodeData !== null) {
        currentfeedbackId = feedbackCodeData.id;
      }
      for (let feedback of userfeedbacks.docs) {
        let feedbackData = feedback.data();
        console.log(feedbackData);
        if (feedback.id === currentfeedbackId) feedbackData = feedbackCodeData;
        if (!feedbackData.coders.includes(researcher.docId)) {
          console.log("researcher did not grade feedback");
          return;
        }
      }
    }

    // if any of the condition above is not met, we are not going to run this logic

    if (researchersUpdates[researcher.docId].projects[project]?.expPoints) {
      researchersUpdates[researcher.docId].projects[project].expPoints += points;
    } else {
      researchersUpdates[researcher.docId].projects[project] = {
        expPoints: points
      };
    }
    // creating exp Sessions for listing point history to researcher later
    // const expSessionRef = db.collection("expSessions").doc();
    const expSessionRef = db.collection("expSessions").doc();
    transactionWrites.push({
      type: "set",
      refObj: expSessionRef,
      updateObj: {
        attendees,
        createdAt: new Date(),
        eTime: endTime,
        sTime: startTime,
        project,
        points,
        user: participant,
        researcher: researcher.docId,
        session,
        eventId: _eventId
      }
    });
    // creating researcher log
    const researcherLogRef = db.collection("researcherLogs").doc();
    transactionWrites.push({
      type: "set",
      refObj: researcherLogRef,
      updateObj: {
        ...researchersUpdates[researcher.docId],
        id: researcher.docId,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.log(error);
  }
};
