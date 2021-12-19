// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

const cors = require("cors");

require("dotenv").config();

const {
  deleteUser,
  retrieveData,
  feedbackData,
  loadContacts,
} = require("./users");
const {
  voteEndpoint,
  voteInstructorEndpoint,
  deleteActivity,
  assignExperimentSessionsPoints,
  updateNotTakenSessions,
} = require("./projectManagement");
const {
  loadImage,
  sendEventNotificationEmail,
  rescheduleEventNotificationEmail,
  sendPersonalInvitations,
} = require("./emailing");
const { schedule, allEvents, deleteEvent } = require("./scheduling");
const { card, image } = require("./misinformationExp");

process.env.TZ = "America/Detroit";

const express = require("express");

const app = express();

app.use(express.json());

app.use(cors());

app.get("/loadImage/:contactId/:randNum", loadImage);
app.get("/assignExperimentSessionsPoints", assignExperimentSessionsPoints);
app.get("/loadContacts", loadContacts);
app.get("/sendPersonalInvitations", sendPersonalInvitations);
// app.get("/retrieveData", retrieveData);
// app.get("/feedbackData", feedbackData);
app.post("/vote", voteEndpoint);
app.post("/voteInstructor", voteInstructorEndpoint);
app.post("/deleteActivity", deleteActivity);
// app.get("/loadfeedbackCodes", loadfeedbackCodes);

// Emailing
app.post("/sendEventNotificationEmail", sendEventNotificationEmail);
app.post("/rescheduleEventNotificationEmail", rescheduleEventNotificationEmail);

// Schedule UX Research appointments
app.post("/schedule", schedule);
app.post("/allEvents", allEvents);
app.post("/deleteEvent", deleteEvent);

// Misinformation Experiment
app.get("/card", card);
app.get("/image*", image);

// https://baseurl.com/api/
exports.api = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520,
  })
  .https.onRequest(app);

exports.deleteUser = functions.firestore
  .document("users/{fullname}")
  .onDelete(deleteUser);

exports.scheduledFunction = functions.pubsub
  .schedule("every 40 minutes")
  .onRun(updateNotTakenSessions);
