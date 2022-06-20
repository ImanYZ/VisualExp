const { admin, db } = require("./admin");

require("dotenv").config();

const {
  insertEvent,
  getEvent,
  getEvents,
  deleteEvent,
  insertLifeLogEvent,
} = require("./GoogleCalendar");

const { pad2Num } = require("./utils");

const createExperimentEvent = async (email, researcher, order, start, end) => {
  const summary = "[1Cademy] UX Research Experiment - " + order + " Session";
  const description =
    "<div><p><strong><u>IMPORTANT: On your Internet browser, please log in to Gmail using your " +
    email.toLowerCase() +
    " credentials before entering this session. If you have logged in using your other email addresses, Google Meet will not let you in!</u></strong></p><P>This is your " +
    order +
    " session of the UX Research experiment.</p>" +
    (order === "1st"
      ? "<p>We've also scheduled your 2nd session 3 days later, and 3rd session one week later.</p>"
      : order === "2nd"
      ? "<p>We've also scheduled your 3rd session 4 days later.</p>"
      : "") +
    "<p><strong><u>Please confirm your attendance in this session by accepting the invitation on Google Calendar or through the link at the bottom of the invitation email.</u></strong></p>" +
    "<p><strong><u>Note that accepting the invitation through Microsoft Outlook does not work!</u></strong></p><div>";
  const colorId = order === "1st" ? "4" : "3";
  const eventCreated = await insertEvent(
    start,
    end,
    summary,
    description,
    [{ email }, { email: researcher }],
    colorId
  );
  return eventCreated;
};

// Schedule the 3 experiment sessions
exports.schedule = async (req, res) => {
  try {
    if (
      "email" in req.body &&
      "first" in req.body &&
      "researcher1st" in req.body &&
      "second" in req.body &&
      "researcher2nd" in req.body &&
      "third" in req.body &&
      "researcher3rd" in req.body
    ) {
      const events = [];
      const email = req.body.email;
      const researcher1st = req.body.researcher1st;
      const researcher2nd = req.body.researcher2nd;
      const researcher3rd = req.body.researcher3rd;
      let order = "1st";
      let researcher = researcher1st;
      let start = new Date(req.body.first);
      let end = new Date(start.getTime() + 60 * 60000);
      for (let session = 1; session < 4; session++) {
        if (session === 2) {
          order = "2nd";
          researcher = researcher2nd;
          start = new Date(req.body.second);
          end = new Date(start.getTime() + 30 * 60000);
        } else if (session === 3) {
          order = "3rd";
          researcher = researcher3rd;
          start = new Date(req.body.third);
          end = new Date(start.getTime() + 30 * 60000);
        }
        const eventCreated = await createExperimentEvent(
          email,
          researcher,
          order,
          start,
          end
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
      "session" in req.body
    ) {
      const email = req.body.email;
      const researcher = req.body.researcher;
      const order = req.body.order;
      const start = new Date(req.body.session);
      let end;
      if (order === "1st") {
        end = new Date(start.getTime() + 60 * 60000);
      } else if (order === "2nd" || order === "3rd") {
        end = new Date(start.getTime() + 30 * 60000);
      }
      const eventCreated = await createExperimentEvent(
        email,
        researcher,
        order,
        start,
        end
      );
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

// Get all the events in the past specified number of days.
exports.pastEvents = async (previousDays) => {
  try {
    let end = new Date();
    const start = new Date(
      end.getTime() - parseInt(previousDays) * 24 * 60 * 60 * 1000
    );
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
  }
};

// Get all the events in the next specified number of days.
exports.futureEvents = async (nextDays) => {
  try {
    const start = new Date();
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
      start.getFullYear() +
        "-" +
        pad2Num(start.getMonth() + 1) +
        "-" +
        pad2Num(start.getDate()) +
        "T12:00:00.000Z"
    );
    let end = new Date();
    end = new Date(end.getTime() - 60 * 60 * 1000);
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
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

// Schedule Life Logs
exports.scheduleLifeLog = async (req, res) => {
  try {
    console.log({ body: req.body });
    const authUser = await admin
      .auth()
      .verifyIdToken(req.headers.authorization);
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
      const eventCreated = await insertLifeLogEvent(
        start,
        end,
        summary,
        description
      );
      return res.status(200).json({ done: true });
    }
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(400).json({ done: false });
};
