const { getEvents } = require("../../GoogleCalendar");
const { db } = require("../../admin");

// Get events from Google Calendar based on relativeURL.
// return the data for the states corresponding to each table.
module.exports = async (req, res) => {
  try {
    let allEvents = [];
    const relativeURL = req.body.relativeURL;
    console.log(relativeURL);
    const scheduleDocs = await db.collection("schedule").orderBy("id").get();
    const availabilities = [];
    for (let scheduleDoc of scheduleDocs.docs) {
      availabilities.push(scheduleDoc.data());
    }
    if (relativeURL === "/ongoingEvents") {
      const now = new Date().getTime();
      const start = new Date(now - 60 * 60 * 1000);
      let end = new Date(now + 60 * 60 * 1000);
      allEvents = await getEvents(start, end, "America/Detroit");
    } else {
      let end = new Date();
      const start = new Date(end.getTime() - 31 * 24 * 60 * 60 * 1000);
      end = new Date(end.getTime() + 365 * 24 * 60 * 60 * 1000);
      allEvents = await getEvents(start, end, "America/Detroit");
    }
    const evs = [];
    const currentTime = new Date().getTime();

    const usersHash = {};
    const instructorsHash = {};
    const usersSurveyHash = {};

    const usersDocs = await db.collection("users").get();
    const instructorsDocs = await db.collection("instructors").get();
    const usersSurveyDocs = await db.collection("usersSurvey").get();
    usersDocs.forEach(userDoc => {
      usersHash[userDoc.data().email] = { ...userDoc.data(), id: userDoc.id };
    });

    instructorsDocs.forEach(instructorDoc => {
      instructorsHash[instructorDoc.data().email] = {
        ...instructorDoc.data(),
        id: instructorDoc.data().firstname + " " + instructorDoc.data().lastname
      };
    });
    usersSurveyDocs.forEach(userStudentCoNoteSurveyDoc => {
      usersSurveyHash[userStudentCoNoteSurveyDoc.data().email] = {
        ...userStudentCoNoteSurveyDoc.data(),
        id: userStudentCoNoteSurveyDoc.id
      };
    });

    // Each Google Calendar event has {start, end, attendees}.
    // Each attendee has {email, responseStatus}
    // attendee.responseStatus can take one of these possible values:
    // 'accepted', 'needsAction', 'tentative', 'declined'
    for (let ev of allEvents) {
      const startTime = new Date(ev.start.dateTime).getTime();
      const endTime = new Date(ev.end.dateTime).getTime();
      const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
      let weAreWaiting = false;
      //  If the event is already started and less than 30 minutes from
      // its endTime is passed:
      if (hoursLeft <= 0 && currentTime < endTime + 30 * 60 * 1000) {
        weAreWaiting = true;
      }
      const event = {
        start: new Date(ev.start.dateTime),
        end: new Date(ev.end.dateTime),
        id: ev.id,
        attendees: [],
        attendeesNum: 0,
        notAccepted: [],
        acceptedNum: 0,
        declined: [],
        declinedNum: 0,
        participant: "",
        order: "",
        firstname: "",
        fullname: "",
        hangoutLink: ev.hangoutLink,
        weAreWaiting,
        hoursLeft,
        courseName: ""
      };
      // If this event id is in one of the scheduled sessions (availabilities),
      const availabilitiesIdx = availabilities.findIndex(sch => sch.id === ev.id);
      if (availabilitiesIdx !== -1) {
        // Then, specify its participant email and the order of the
        // experiment session.
        event.participant = availabilities[availabilitiesIdx].email.toLowerCase();
        event.order = availabilities[availabilitiesIdx].order;
        let userData = {};
        if (usersHash.hasOwnProperty(event.participant)) {
          userData = usersHash[event.participant];
        } else if (instructorsHash.hasOwnProperty(event.participant)) {
          userData = instructorsHash[event.participant];
        } else if (usersSurveyHash.hasOwnProperty(event.participant)) {
          userData = usersSurveyHash[event.participant];
        }

        if (Object.keys(userData).length > 0 > 0) {
          // then, assign their firstname, and courseName, if exists.
          event.fullname = userData.id;
          event.firstname = userData.firstname;
          if (userData.course) {
            event.courseName = userData.course;
          }
        }
      }
      if ("attendees" in ev) {
        event.attendeesNum = ev.attendees.length;
        for (let attendee of ev.attendees) {
          event.attendees.push(attendee.email.toLowerCase());
          if (attendee.responseStatus === "accepted") {
            event.acceptedNum += 1;
          } else {
            event.notAccepted.push(attendee.email.toLowerCase());
            if (attendee.responseStatus === "declined" || attendee.responseStatus === "tentative") {
              event.declined.push(attendee.email);
              event.declinedNum += 1;
            }
          }
        }
      }
      evs.sort((a, b) => b.start - a.start);
      evs.push(event);
    }
    res.status(200).json({ events: evs });
  } catch (error) {}
};
