// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

const cors = require("cors");

require("dotenv").config();

const { deleteUser, retrieveData, feedbackData, recallData, applicationReminder } = require("./users");
const {
  voteEndpoint,
  voteActivityReset,
  deleteActivity,
  voteInstructorEndpoint,
  voteInstructorReset,
  voteAdministratorEndpoint,
  voteAdministratorReset,
  assignExperimentSessionsPoints,
  remindCalendarInvitations,
  // updateNotTakenSessions,
  bulkGradeFreeRecall,
  markPaidEndpoint,
  passagesNumberCorrection
} = require("./projectManagement");
const {
  loadImageIndividual,
  loadImageProfessor,
  loadImageAdministrator,
  sendEventNotificationEmail,
  rescheduleEventNotificationEmail,
  inviteAdministrators,
  administratorYes,
  administratorNo,
  administratorLater,
  inviteInstructors,
  instructorYes,
  instructorNo,
  instructorLater,
  sendPersonalInvitations,
  trackStudentInvite
} = require("./emailing");
const {
  schedule,
  scheduleSingleSession,
  allEvents,
  deleteEvent,
  scheduleLifeLog,
  getOngoingResearcherEvent,
  lifeLoggerScheduler,
  ongoingEvents
} = require("./scheduling");
const { card, image } = require("./misinformationExp");

process.env.TZ = "America/Detroit";

const express = require("express");

const app = express();

app.use(express.json());

app.use(cors());

const PREFIX = "api";
app.use((req, res, next) => {
  if (req.url.indexOf(`/${PREFIX}/`) === 0) {
    req.url = req.url.substring(PREFIX.length + 1);
  }
  next();
});

app.get("/loadImage/individual/:contactId/:randNum", loadImageIndividual);
app.get("/loadImage/professor/:instructorId/:randNum", loadImageProfessor);
app.get("/loadImage/administrator/:administratorId/:randNum", loadImageAdministrator);
app.get("/inviteAdministrators", inviteAdministrators);
app.post("/administratorYes", administratorYes);
app.post("/administratorLater", administratorLater);
app.post("/administratorNo", administratorNo);
app.get("/inviteInstructors", inviteInstructors);
app.post("/instructorYes", instructorYes);
app.post("/instructorLater", instructorLater);
app.post("/instructorNo", instructorNo);
app.post("/trackStudentInvite", trackStudentInvite);
app.get("/retrieveData", retrieveData);
app.get("/passagesNumberCorrection", passagesNumberCorrection);
// app.get("/feedbackData", feedbackData);
app.get("/recallData", recallData);
app.post("/vote", voteEndpoint);
app.post("/markPaid", markPaidEndpoint);
app.post("/voteAdministrator", voteAdministratorEndpoint);
app.post("/voteAdministratorReset", voteAdministratorReset);
app.post("/voteInstructor", voteInstructorEndpoint);
app.post("/voteInstructorReset", voteInstructorReset);
app.post("/voteActivityReset", voteActivityReset);
app.post("/deleteActivity", deleteActivity);
app.post("/bulkGradeFreeRecall", bulkGradeFreeRecall);

// Emailing
app.post("/sendEventNotificationEmail", sendEventNotificationEmail);
app.post("/rescheduleEventNotificationEmail", rescheduleEventNotificationEmail);

// Schedule UX Research appointments
app.post("/schedule", schedule);
app.post("/scheduleSingleSession", scheduleSingleSession);
app.post("/allEvents", allEvents);
app.post("/getOngoingResearcherEvent", getOngoingResearcherEvent);
app.post("/ongoingEvents", ongoingEvents);
app.post("/deleteEvent", deleteEvent);
app.post("/scheduleLifeLog", scheduleLifeLog);

// Knowledge endpoints

// Misinformation Experiment
app.get("/card", card);
app.get("/image*", image);

app.get("/", (req, res) => {
  return res.status(200).json({ api: true });
});

// https://baseurl.com/api/
exports.api = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .https.onRequest(app);

// Deleting a user document should trigger this function:
exports.deleteUser = functions.firestore.document("users/{fullname}").onDelete(deleteUser);

// exports.updateNotTakenSessionsScheduler = functions.pubsub
//   .schedule("every 40 minutes")
//   .onRun(updateNotTakenSessions);

exports.assignExperimentSessionsPoints = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 4 hours")
  .onRun(assignExperimentSessionsPoints);

exports.remindCalendarInvitations = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 4 hours")
  .onRun(remindCalendarInvitations);

exports.applicationReminder = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 25 hours")
  .onRun(applicationReminder);

exports.inviteInstructors = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 4 minutes")
  .onRun(inviteInstructors);

exports.inviteAdministrators = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 25 hours")
  .onRun(inviteAdministrators);

exports.passagesNumberCorrection = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 25 hours")
  .onRun(passagesNumberCorrection);

// LifeLog:
exports.lifeLoggerScheduler = functions.pubsub.schedule("every hour").onRun(lifeLoggerScheduler);
