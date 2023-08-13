// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

const remindResearchersForAvailability = require("./pubsub/remindResearchersForAvailability");
const remindCalendarInvitations = require("./pubsub/remindCalendarInvitations");
const passagesNumberCorrection = require("./pubsub/passagesNumberCorrection");
const assignThematicPoints = require("./pubsub/assignThematicPoints");

const { deleteUser, applicationReminder } = require("./users");

const { inviteAdministrators, inviteInstructors, sendingEmails } = require("./emailing");
const app = require("./app");

const EST_TIMEZONE = "America/Detroit";
process.env.TZ = EST_TIMEZONE;

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

exports.remindResearchersForAvailability = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 4 hours")
  .onRun(remindResearchersForAvailability);

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
  .pubsub.schedule("0 * * * *")
  .timeZone(EST_TIMEZONE)
  .onRun(inviteInstructors);

exports.inviteAdministrators = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("0 * * * *")
  .timeZone(EST_TIMEZONE)
  .onRun(inviteAdministrators);

exports.passagesNumberCorrection = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 25 hours")
  .onRun(passagesNumberCorrection);

exports.sendingEmails = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("*/10 * * * *")
  .timeZone(EST_TIMEZONE)
  .onRun(sendingEmails);

exports.assignThematicPoints = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520
  })
  .pubsub.schedule("every 1 week")
  .onRun(assignThematicPoints);
// Knowledge
// exports.assignNodeContributorsInstitutionsStats = functions
//   .runWith({
//     memory: "1GB",
//     timeoutSeconds: 520
//   })
//   .pubsub.schedule("every 25 hours")
//   .onRun(assignNodeContributorsInstitutionsStats);

// exports.updateInstitutions = functions
//   .runWith({
//     memory: "1GB",
//     timeoutSeconds: 520
//   })
//   .pubsub.schedule("every 25 hours")
//   .onRun(updateInstitutions);

// LifeLog:
// exports.lifeLoggerScheduler = functions.pubsub.schedule("every hour").onRun(lifeLoggerScheduler);
