const cors = require("cors");

require("dotenv").config();

const {
  deleteUser,
  retrieveData,
  questionsData,
  feedbackCodeData,
  quotesData,
  feedbackData,
  recallData,
  keyPhrasesData,
  applicationReminder
} = require("./users");
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
  passagesNumberCorrection,
  handleSubmitFeebackCode,
  createTemporaryFeedbacodeCollection
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
  trackStudentInvite,
  trackStudentEmailTemplateCopy
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
const {
  assignNodeContributorsInstitutionsStats,
  updateInstitutions,
  checkEmailInstitution,
  getInstitutions
} = require("./knowledge");

const signUp = require("./api/signUp");

const EST_TIMEZONE = "America/Detroit";
process.env.TZ = EST_TIMEZONE;

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
app.post("/trackStudentEmailTemplateCopy", trackStudentEmailTemplateCopy);
app.get("/retrieveData", retrieveData);
app.get("/questionsData", questionsData);
app.get("/passagesNumberCorrection", passagesNumberCorrection);
app.get("/feedbackData", feedbackData);
app.get("/feedbackCodeData", feedbackCodeData);
app.get("/quotesData", quotesData);
app.get("/recallData", recallData);
app.get("/keyPhrasesData", keyPhrasesData);
app.get("/assignNodeContributorsInstitutionsStats", assignNodeContributorsInstitutionsStats);
app.get("/getInstitutions", getInstitutions);
app.post("/vote", voteEndpoint);
app.post("/markPaid", markPaidEndpoint);
app.post("/voteAdministrator", voteAdministratorEndpoint);
app.post("/voteAdministratorReset", voteAdministratorReset);
app.post("/voteInstructor", voteInstructorEndpoint);
app.post("/voteInstructorReset", voteInstructorReset);
app.post("/voteActivityReset", voteActivityReset);
app.post("/deleteActivity", deleteActivity);
app.post("/bulkGradeFreeRecall", bulkGradeFreeRecall);
app.post("/handleSubmitFeebackCode", handleSubmitFeebackCode);
app.post("/createTemporaryFeedbacodeCollection", createTemporaryFeedbacodeCollection);
app.post("/checkEmailInstitution", checkEmailInstitution);
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

app.post("/signUp", signUp);

// Knowledge endpoints

// Misinformation Experiment
// app.get("/card", card);
// app.get("/image*", image);

app.get("/", (req, res) => {
  return res.status(200).json({ api: true });
});

module.exports = app;