const cors = require("cors");

require("dotenv").config();

const recordAudio = require("./actions/intreview/recordAudio");
const assignThematicPoints = require("./pubsub/assignThematicPoints");

const {
  retrieveData,
  questionsData,
  feedbackCodeData,
  quotesData,
  feedbackData,
  recallData,
  keyPhrasesData
} = require("./users");
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
  trackStudentInvite,
  trackStudentEmailTemplateCopy,
  sendingEmails
} = require("./emailing");
const {
  schedule,
  scheduleSingleSession,
  allEvents,
  deleteEvent,
  scheduleLifeLog,
  getOngoingResearcherEvent,
  ongoingEvents,
  markAttended,
  scheduleInstructors,
  retrieveEvents,
  markEntreviewAttended,
  checkEntreviewStatus
} = require("./scheduling");
const { assignNodeContributorsInstitutionsStats, checkEmailInstitution, getInstitutions } = require("./knowledge");
const { saveGradesLogs, updateASA } = require("./recallGradesAI");

const signUp = require("./api/signUp");
const researchersRouter = require("./api/researchers");
const participantsRouter = require("./api/participants");
const adminRouter = require("./api/administrator");

const EST_TIMEZONE = "America/Detroit";
process.env.TZ = EST_TIMEZONE;

const express = require("express");
const recallUpload = require("./actions/recallUpload");

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
app.get("/administratorYes", administratorYes);
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
app.get("/feedbackData", feedbackData);
app.get("/feedbackCodeData", feedbackCodeData);
app.get("/quotesData", quotesData);
app.get("/recallData", recallData);
app.get("/keyPhrasesData", keyPhrasesData);
app.get("/assignNodeContributorsInstitutionsStats", assignNodeContributorsInstitutionsStats);
app.get("/getInstitutions", getInstitutions);
app.post("/checkEmailInstitution", checkEmailInstitution);
// Emailing
app.post("/sendEventNotificationEmail", sendEventNotificationEmail);
app.post("/rescheduleEventNotificationEmail", rescheduleEventNotificationEmail);

// Schedule UX Research appointments
app.post("/schedule", schedule);
app.post("/scheduleSingleSession", scheduleSingleSession);
app.post("/allEvents", allEvents);
app.post("/getOngoingResearcherEvent", getOngoingResearcherEvent);
app.post("/markAttended", markAttended);
app.post("/ongoingEvents", ongoingEvents);
app.post("/deleteEvent", deleteEvent);
app.post("/scheduleLifeLog", scheduleLifeLog);

app.post("/signUp", signUp);
app.use("/researchers", researchersRouter);
app.use("/participants", participantsRouter);
app.post("/recallUpload", recallUpload);
app.use("/administrator", adminRouter);
app.post("/scheduleInstructors", scheduleInstructors);
app.get("/sendingEmails", sendingEmails);
app.post("/retrieveEvents", retrieveEvents);
app.post("/markEntreviewAttended", markEntreviewAttended);
app.post("/checkEntreviewStatus", checkEntreviewStatus);
app.post("/recordAudio", recordAudio);
app.post("/saveGradesLogs", saveGradesLogs);
app.post("/updateASA", updateASA);
app.post("/assignThematicPoints", assignThematicPoints);
// Knowledge endpoints

// Misinformation Experiment
// app.get("/card", card);
// app.get("/image*", image);

app.get("/", (req, res) => {
  return res.status(200).json({ api: true });
});

module.exports = app;
