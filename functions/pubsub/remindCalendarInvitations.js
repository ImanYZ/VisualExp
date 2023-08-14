const { db } = require("../admin");
const { futureEvents, pastEvents } = require("../helpers/common");
const { FieldValue } = require("firebase-admin/firestore");

const { deleteEvent } = require("../GoogleCalendar");

const {
  participantNotificationEmail,
  researcherEventNotificationEmail,
  eventNotificationEmail,
  notAttendedEmail
} = require("../emailing");

const { getUserDocsfromEmail } = require("../helpers/common");

const { isToday } = require("../utils");

// This is called in a pubsub every 4 hours.
// Email reminders to researchers and participants to do the following:
// For future Google Calendar events, to:
// - Accept their invitations
// - Reschedule if they have declined them
// For passed Google Calendar events, to:
// - Reschedule if they have missed or declined them.

module.exports = async (req, res) => {
  try {
    console.log("remindCalendarInvitations");
    // researchers = an object of emails as keys and the corresponding fullnames as values.
    const researchers = {};
    const researcherDocs = await db.collection("researchers").get();
    for (let researcherDoc of researcherDocs.docs) {
      const researcherData = researcherDoc.data();
      if (!researcherData.email) continue;
      researchers[researcherData.email.toLowerCase()] = researcherDoc.id;
    }
    // Retrieve all the scheduled sessions.
    // Having an id means the document is not just an availability, but there
    // is a corresponding Google Calendar event with the specified id.
    const scheduleDocs = await db.collection("schedule").orderBy("id").get();
    // Collect all the data for these documents in an array.
    const schedule = {};
    for (let scheduleDoc of scheduleDocs.docs) {
      const scheduleData = scheduleDoc.data();
      schedule[scheduleData.id] = {
        ...scheduleData,
        schId: scheduleDoc.id
      };
    }
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    const _futureEvents = await futureEvents(40);
    const currentTime = new Date().getTime();
    // Each Google Calendar event has {start, end, attendees}.
    // Each attendee has {email, responseStatus}
    // attendee.responseStatus can take one of these possible values:
    // 'accepted', 'needsAction', 'tentative', 'declined'
    for (let ev of _futureEvents) {
      const startTime = new Date(ev.start.dateTime).getTime();
      const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
      // Find the scheduled session corresponding to this event.
      if (ev.id in schedule && "attendees" in ev && Array.isArray(ev.attendees)) {
        // Get the participant's email and order through the scheduled session.
        const participant = {
          email: schedule[ev.id].email.toLowerCase(),
          project: schedule[ev.id].project
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          if (attendee.responseStatus !== "accepted") {
            // If the attendee is a researcher:
            if (attendee.email.toLowerCase() in researchers) {
              // Send a reminder email to a researcher that they have not accepted
              // or even declined the Google Calendar invitation and asks them to
              // accept it or ask someone else to take it.
              researcherEventNotificationEmail(
                attendee.email.toLowerCase(),
                researchers[attendee.email.toLowerCase()],
                participant.email,
                hoursLeft,
                order,
                attendee.responseStatus === "declined" || attendee.responseStatus === "tentative",
                schedule[ev.id].project
              );
            }
            // Find the attendee who corresponds to this participant:
            else if (attendee.email.toLowerCase() === participant.email) {
              // The only way to get the user data, like their firstname, which
              // sessions they have completed so far, ... is through "users"
              const userDocs = await getUserDocsfromEmail(attendee.email.toLowerCase());

              if (userDocs.length > 0) {
                for (let userDoc of userDocs) {
                  const userData = userDoc.data();
                  if (userData.project !== participant.project) continue;
                  participant.firstname = userData.firstname;
                  if (userData.course) {
                    participant.courseName = userData.course;
                  } else {
                    participant.courseName = "";
                  }
                  // If the user has answered postQ2Choice it means they have
                  // completed the 1st session.
                  if (userData.postQ2Choice) {
                    participant.firstDone = true;
                  } else {
                    participant.firstDone = false;
                  }
                  // If the user has answered post3DaysQ2Choice it means they have
                  // completed the 2nd session.
                  if (userData.post3DaysQ2Choice) {
                    participant.secondDone = true;
                  } else {
                    participant.secondDone = false;
                  }
                  // If the user has completed all the experiment sessions, then
                  // projectDone should be true.
                  if (userData.projectDone) {
                    participant.thirdDone = true;
                  } else {
                    participant.thirdDone = false;
                  }
                  // We consider "declined" and "tentative" responses as declined.
                  if (attendee.responseStatus === "declined" || attendee.responseStatus === "tentative") {
                    // If they have declined the 1st session, but they are not done
                    // with the 1st session:
                    if (order === "1st" && attendee.responseStatus === "declined") {
                      // Then, we delete all their sessions from Google Calendar and
                      // schedule them, send them an email asking them to reschedule
                      // all their sessions.
                      participantNotificationEmail(
                        participant.email,
                        participant.firstname,
                        hoursLeft,
                        attendee.responseStatus === "declined",
                        userData
                      );
                    } else if (
                      (order === "2nd" && !participant.secondDone) ||
                      (order === "3rd" && !participant.thirdDone)
                    ) {
                      // If the session is 2nd/3rd, but they have not completed the
                      // corresponding session:
                      // Then, we send them an email asking them to reschedule
                      // their 2nd/3rd session on the same day, otherwise their
                      // application would be withdrawn.
                      eventNotificationEmail(
                        participant.email,
                        participant.firstname,
                        false,
                        participant.courseName,
                        hoursLeft,
                        false,
                        "",
                        order,
                        false,
                        true,
                        userData.project
                      );
                    }
                  } else if (
                    // If they have not declined, but did not accept either, and
                    // less than 25 hours is left to the start of their experiment session:
                    hoursLeft <= 25
                  ) {
                    // If it's their 3rd session, but they did not complete their 2nd session:
                    if (order === "3rd" && !participant.secondDone) {
                      // Delete the 3rd session, because logically they should not go through
                      // the 3rd session without completing the 2nd one.
                      await deleteEvent(ev.id);
                      // Also, remove the Calendar event id and order from their schedule doc.
                      const scheduleRef = db.collection("schedule").doc(schedule[ev.id].schId);
                      await scheduleRef.update({
                        id: FieldValue.delete(),
                        order: FieldValue.delete()
                      });
                    } else {
                      // Email every four hours to remind them that they need to accept the
                      // Google Calendar invite for whichever session they have not accepted yet.
                      if (!userData.hasOwnProperty("surveyType") || userData.surveyType !== "instructor") {
                        eventNotificationEmail(
                          participant.email,
                          participant.firstname,
                          false,
                          participant.courseName,
                          hoursLeft,
                          false,
                          "",
                          order,
                          false,
                          false
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    // Look into all Google Calendar sessions in the past 40 days:
    const _pastEvents = await pastEvents(40);
    for (let ev of _pastEvents) {
      const startTime = new Date(ev.start.dateTime);
      // Because some people may spend more time in their sessions,
      // we should consider the fact that while someone has not ended their session yet,
      // this PubSub may be invoked. To prevent that we define the end time an hour after the actual end time of the session.
      const endTimeStamp = new Date(ev.end.dateTime).getTime() + 60 * 60 * 1000;
      const hoursLeft = (currentTime - startTime.getTime()) / (60 * 60 * 1000);
      if (
        endTimeStamp < currentTime &&
        // Find the scheduled session corresponding to this event.
        ev.id in schedule &&
        "attendees" in ev &&
        Array.isArray(ev.attendees)
      ) {
        // Get the participant's email and order through the scheduled session.
        const participant = {
          email: schedule[ev.id].email.toLowerCase(),
          project: schedule[ev.id].project
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          // We only need to check the past events for the participants.
          if (attendee.email.toLowerCase() === participant.email) {
            participant.responseStatus = attendee.responseStatus;
            // The only way to get the user data, like their firstname, which
            // sessions they have completed so far, ... is through "users"
            const userDocs = await getUserDocsfromEmail(attendee.email.toLowerCase());
            if (userDocs.length > 0) {
              for (let userDoc of userDocs) {
                const userData = userDoc.data();
                if (userData.project !== participant.project) continue;
                participant.firstname = userData.firstname;
                if (userData.course) {
                  participant.courseName = userData.course;
                } else {
                  participant.courseName = "";
                }
                if (userData.postQ2Choice) {
                  participant.firstDone = true;
                } else {
                  participant.firstDone = false;
                }
                if (userData.post3DaysQ2Choice) {
                  participant.secondDone = true;
                } else {
                  participant.secondDone = false;
                }
                if (userData.post1WeekQ2Choice) {
                  participant.thirdDone = true;
                } else {
                  participant.thirdDone = false;
                }
                if (userData.hasOwnProperty("surveyType")) {
                  participant.surveyType = userData.surveyType;
                }
                if (userData.hasOwnProperty("instructorId")) {
                  participant.instructorId = userData.instructorId;
                }
                // For project OnlineCommunities (survey) we will not have firstDone field in the participant
                // So if they missed they attended the first session  that means
                // the schedule object should have a attended field
                const participantAttendedFirstSession =
                  participant.project === "OnlineCommunities" ? schedule[ev.id].attended : participant.firstDone;
                if (order === "1st" && !participantAttendedFirstSession) {
                  // Then, we delete all their sessions from Google Calendar and
                  // schedule then, send them an email asking them to reschedule
                  // all their sessions.

                  participantNotificationEmail(
                    participant.email,
                    participant.firstname,
                    hoursLeft,
                    attendee.responseStatus === "declined" || attendee.responseStatus === "tentative",
                    participant
                  );
                } else if (order === "3rd" && !participant.secondDone) {
                  // If it's their 3rd session, but they did not complete their 2nd session:
                  // Delete the 3rd session, because logically they should not go through
                  // the 3rd session without completing the 2nd one .
                  await deleteEvent(ev.id);
                  // Also, remove the Calendar event id and order from their schedule doc.
                  const scheduleRef = db.collection("schedule").doc(schedule[ev.id].schId);
                  await scheduleRef.update({
                    id: FieldValue.delete(),
                    order: FieldValue.delete()
                  });
                } else if (isToday(startTime)) {
                  // Only if it is a 2nd/3rd session that was scheduled today, but they
                  // missed it, we email them to reschedule their session on the same day;
                  // otherwise, we will withdraw their application.
                  if ((order === "2nd" && !participant.secondDone) || (order === "3rd" && !participant.thirdDone)) {
                    notAttendedEmail(participant.email, participant.firstname, false, participant.courseName, order);
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log({ err });
    return null;
  }
};
