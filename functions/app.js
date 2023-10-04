const cors = require("cors");

require("dotenv").config();

const recordAudio = require("./actions/intreview/recordAudio");
const assignThematicPoints = require("./pubsub/assignThematicPoints");
const scheduleInstructors = require("./actions/intreview/scheduleInstructors");
const schedule = require("./actions/intreview/schedule");
const checkEntreviewStatus = require("./actions/intreview/checkEntreviewStatus");
const markEntreviewAttended = require("./actions/intreview/markEntreviewAttended");
const retrieveEvents = require("./actions/intreview/retrieveEvents");
const markAttended = require("./actions/intreview/markAttended");
const allEvents = require("./actions/intreview/allEvents");
const getOngoingResearcherEvent = require("./actions/intreview/getOngoingResearcherEvent");
const ongoingEvents = require("./actions/intreview/ongoingEvents");
const deleteEvent = require("./actions/intreview/deleteEvent");
const scheduleLifeLog = require("./actions/intreview/scheduleLifeLog");

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
  administratorYes,
  administratorNo,
  administratorLater,
  instructorYes,
  instructorNo,
  instructorLater,
  trackStudentInvite,
  trackStudentEmailTemplateCopy
} = require("./emailing");

const signUp = require("./api/signUp");
const researchersRouter = require("./api/researchers");
const participantsRouter = require("./api/participants");
const adminRouter = require("./api/administrator");

const EST_TIMEZONE = "America/Detroit";
process.env.TZ = EST_TIMEZONE;

const express = require("express");
const recallSaveLogs = require("./actions/recall-update");

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
app.get("/administratorYes", administratorYes);
app.post("/administratorLater", administratorLater);
app.post("/administratorNo", administratorNo);
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
// Emailing
app.post("/sendEventNotificationEmail", sendEventNotificationEmail);
app.post("/rescheduleEventNotificationEmail", rescheduleEventNotificationEmail);

// Schedule UX Research appointments
app.post("/schedule", schedule);
app.post("/allEvents", allEvents);
app.post("/getOngoingResearcherEvent", getOngoingResearcherEvent);
app.post("/markAttended", markAttended);
app.post("/ongoingEvents", ongoingEvents);
app.post("/deleteEvent", deleteEvent);
app.post("/scheduleLifeLog", scheduleLifeLog);

app.post("/signUp", signUp);
app.use("/researchers", researchersRouter);
app.use("/participants", participantsRouter);
app.post("/recallSaveLogs", recallSaveLogs);
app.use("/administrator", adminRouter);
app.post("/scheduleInstructors", scheduleInstructors);
app.post("/retrieveEvents", retrieveEvents);
app.post("/markEntreviewAttended", markEntreviewAttended);
app.post("/checkEntreviewStatus", checkEntreviewStatus);
app.post("/recordAudio", recordAudio);
app.post("/assignThematicPoints", assignThematicPoints);
// Knowledge endpoints

// Misinformation Experiment
// app.get("/card", card);
// app.get("/image*", image);

app.get("/", (req, res) => {
  return res.status(200).json({ api: true });
});

module.exports = app;
