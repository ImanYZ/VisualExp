const { admin, db } = require("./admin");
const moment = require("moment");

require("dotenv").config();

const {
  insertEvent,
  getEvent,
  getEvents,
  deleteEvent,
  getLifeLogEvents,
  insertLifeLogEvent
} = require("./GoogleCalendar");

const { pad2Num, capitalizeFirstLetter } = require("./utils");
const { toOrdinal } = require("number-to-words");

const createExperimentEvent = async (email, researcher, order, start, end, projectSpecs) => {
  const isAnnotating = projectSpecs.numberOfSessions === 1;
  const summary = isAnnotating ? "1Cademy Introduction" : "1Cademy UX Research Experiment - " + order + " Session";
  const description =
    "<div><p><strong><u>IMPORTANT: On your Internet browser, please log in to Gmail using your " +
    email.toLowerCase() +
    " credentials before entering this session. If you have logged in using your other email addresses, Google Meet will not let you in!</u></strong></p>" +
    isAnnotating
      ? ""
      : "<p>This is your " +
        order +
        " session of the UX Research experiment.</p>" +
        // projectSpecs.numberOfSessions === 3 just a temporary quick thing,
        // a proper solution will be implemented for annotating project
        (order === "1st" && projectSpecs.numberOfSessions === 3
          ? "<p>We've also scheduled your 2nd session 3 days later, and 3rd session one week later.</p>"
          : order === "2nd" && projectSpecs.numberOfSessions === 3
          ? "<p>We've also scheduled your 3rd session 4 days later.</p>"
          : "") +
        "<p><strong><u>Please confirm your attendance in this session by accepting the invitation on Google Calendar or through the link at the bottom of the invitation email.</u></strong></p>" +
        "<p><strong><u>Note that accepting the invitation through Microsoft Outlook does not work!</u></strong></p><div>";
  const colorId = order === "1st" ? "4" : "3";
  const eventCreated = await insertEvent(start, end, summary, description, [{ email }, { email: researcher }], colorId);
  return eventCreated;
};
exports.createExperimentEvent = createExperimentEvent;

// Schedule the 3 experiment sessions
exports.schedule = async (req, res) => {
  try {
    if ("email" in req.body && "sessions" in req.body && "project" in req.body) {
      const events = [];
      const email = req.body.email;

      const projectSpecs = await db.collection("projectSpecs").doc(req.body.project).get();
      if (!projectSpecs.exists) {
        throw new Error("Project Specs not found.");
      }
      const projectSpecsData = projectSpecs.data();
      // 1 hour / 2 = 30 mins
      const slotDuration = 60 / (projectSpecsData.hourlyChunks || 2);

      for (let i = 0; i < req.body.sessions.length; ++i) {
        const sess = req.body.sessions[i];
        const start = new Date(sess.startDate);
        // adding slotDuration * number of slots for the session
        const end = new Date(start.getTime() + slotDuration * (projectSpecsData.sessionDuration?.[i] || 2) * 60000);
        const eventCreated = await createExperimentEvent(
          email,
          sess.researcher,
          toOrdinal(i + 1),
          start,
          end,
          projectSpecsData
        );
        events.push(eventCreated);
      }
      return res.status(200).json({ events });
    }
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(400).json({ done: false });
};

exports.scheduleSingleSession = async (req, res) => {
  try {
    if (
      "email" in req.body &&
      req.body.email &&
      "researcher" in req.body &&
      req.body.researcher &&
      "order" in req.body &&
      req.body.order &&
      "session" in req.body &&
      "project" in req.body &&
      "sessionIndex" in req.body
    ) {
      const email = req.body.email;
      const researcher = req.body.researcher;
      const order = req.body.order;
      const start = new Date(req.body.session);

      const projectSpecs = await db.collection("projectSpecs").doc(req.body.project).get();
      if (!projectSpecs.exists) {
        throw new Error("Project Specs not found.");
      }
      const projectSpecsData = projectSpecs.data();
      // 1 hour / 2 = 30 mins
      const slotDuration = 60 / (projectSpecsData.hourlyChunks || 2);

      const end = new Date(
        start.getTime() + slotDuration * (projectSpecsData.sessionDuration?.[req.body.sessionIndex] || 1) * 60000
      );
      const eventCreated = await createExperimentEvent(email, researcher, order, start, end, projectSpecsData);
      return res.status(200).json({ events: [eventCreated] });
    }
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(400).json({ done: false });
};

// Get all the events from the beginning of the experiment until next year!
exports.allEvents = async (req, res) => {
  try {
    let end = new Date();
    const start = new Date(end.getTime() - 31 * 24 * 60 * 60 * 1000);
    end = new Date(end.getTime() + 365 * 24 * 60 * 60 * 1000);
    const allEvents = await getEvents(start, end, "America/Detroit");
    if (allEvents) {
      return res.status(200).json({ events: allEvents });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(200).json({ message: "Event NOT Retrieved!" });
};

// Get all the events from the beginning of the experiment until now!
exports.allPastEvents = async () => {
  try {
    const start = new Date(2021, 1, 1);
    let end = new Date();
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
  }
};

exports.last30DayEvents = async () => {
  try {
    const start = moment().subtract(30, "days").toDate();
    let end = new Date();
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
  }
};

// Get all the events in the past specified number of days.
exports.pastEvents = async previousDays => {
  try {
    let end = new Date();
    const start = new Date(end.getTime() - parseInt(previousDays) * 24 * 60 * 60 * 1000);
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
  }
};

// Get all the events in the next specified number of days.
exports.futureEvents = async nextDays => {
  try {
    // sometimes a user has started the session earlier and the PubSub gets fired
    // and if the user has not accepted the session, it is going to send them a reminder
    // to prevent that we start an hour and a half from now.
    const start = new Date(new Date().getTime() + 90 * 60 * 1000);
    let end = new Date();
    end = new Date(end.getTime() + nextDays * 24 * 60 * 60 * 1000);
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
  }
};

// Get all the events that are concluded today.
exports.todayPastEvents = async () => {
  try {
    let start = new Date();
    start = new Date(
      start.getFullYear() + "-" + pad2Num(start.getMonth() + 1) + "-" + pad2Num(start.getDate()) + "T12:00:00.000Z"
    );
    let end = new Date();
    end = new Date(end.getTime() - 60 * 60 * 1000);
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
  }
};

exports.getOngoingResearcherEvent = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: "Email id required" });
    const start = moment().utcOffset(0).subtract(2, "hours").toDate();
    // get events for next 10 hours.
    const end = moment().utcOffset(0).add(10, "hours").toDate();

    const events = await getEvents(start, end, "UTC");
    
    const filteredEvents = (events || []).filter(event => {
      return event.attendees.some(attendee => attendee.email.toLowerCase() === email.toLowerCase());
    });

    const responseData = [];

    for (let ev of filteredEvents) {
      const schedule = await db.collection("schedule").where("id", "==", ev.id).get();

      if (schedule.docs.length === 0) {
        continue;
      }

      const scheduleData = schedule.docs[0].data();
      const participantEmail = scheduleData.email;

      let userDocs = await db.collection("instructors").where("email", "==", participantEmail.toLowerCase()).get();

      if (userDocs.docs.length === 0) {
        userDocs = await db.collection("users").where("email", "==", participantEmail.toLowerCase()).get();
      }

      if (userDocs.docs.length === 0) {
        userDocs = await db
          .collection("usersStudentCoNoteSurvey")
          .where("email", "==", participantEmail.toLowerCase())
          .get();
      }

      const userData = userDocs.docs?.[0]?.data();

      let userName = `${userData?.firstname} ${userData?.lastname}`;

      if (userData.prefix) {
        userName =
          userData.prefix +
          ". " +
          capitalizeFirstLetter(userData.firstname) +
          " " +
          capitalizeFirstLetter(userData.lastname);
      }
      responseData.push({
        event: ev,
        schedule: {
          scheduleId: schedule.docs[0].id,
          ...scheduleData,
          session: scheduleData.session.toDate(),
          firstname: userName
        }
      });
    }

    res.send(responseData);
  } catch (error) {
    console.log("500", error);
    return res.status(500).send({ message: "Something went wrong", error });
  }
};

// Get all the ongoing events.
exports.ongoingEvents = async (req, res) => {
  try {
    const now = new Date().getTime();
    const start = new Date(now - 60 * 60 * 1000);
    let end = new Date(now + 60 * 60 * 1000);
    const allEvents = await getEvents(start, end, "America/Detroit");
    if (allEvents) {
      return res.status(200).json({ events: allEvents });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(200).json({ message: "Event NOT Retrieved!" });
};

// Delete an event with eventID
exports.deleteEvent = async (req, res) => {
  try {
    if ("eventId" in req.body) {
      const done = await deleteEvent(req.body.eventId);
      return res.status(200).json({ done });
    }
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(200).json({ done: false });
};

// ************
// Life Logging
// ************

exports.lifeLoggerScheduler = async context => {
  try {
    let end = new Date();
    const currentTime = end.getTime();
    const anHourAgo = new Date(currentTime - 60 * 60 * 1000);
    const start = new Date(currentTime - 24 * 60 * 60 * 1000);
    const allEvents = await getLifeLogEvents(start, end, "America/Detroit");
    if (allEvents) {
      let dark = 0,
        light = 0;
      const lifeLogDocs = await db.collection("lifeLog").get();
      if (lifeLogDocs.docs.length > 0) {
        const lifeLogData = lifeLogDocs.docs[0].data();
        dark += lifeLogData.dark;
        light += lifeLogData.light;
      }
      dark += 60;
      for (let ev of allEvents) {
        const startTime = new Date(ev.start.dateTime).getTime();
        const endTime = new Date(ev.end.dateTime).getTime();
        if (endTime <= currentTime && endTime >= anHourAgo && endTime > startTime) {
          const minutes = Math.floor(((endTime - startTime) * 2) / (60 * 1000));
          light += minutes;
        }
      }
      const lifeLogRef = db.collection("lifeLog").doc(lifeLogDocs.docs[0].id);
      await lifeLogRef.update({ dark, light });
    }
  } catch (err) {
    console.log({ err });
  }
  return null;
};

exports.scheduleLifeLog = async (req, res) => {
  try {
    const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
    if (authUser.email === "oneweb@umich.edu") {
      let start, end;
      if (req.body.backwards) {
        end = new Date();
        start = new Date(end.getTime() - req.body.duration * 60 * 1000);
      } else {
        start = new Date();
        end = new Date(start.getTime() + req.body.duration * 60 * 1000);
      }
      const summary = req.body.summary;
      const description = "";
      const eventCreated = await insertLifeLogEvent(start, end, summary, description);
      return res.status(200).json({ done: true });
    }
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(400).json({ done: false });
};
