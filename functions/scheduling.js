const { admin, db } = require("./admin");

require("dotenv").config();

const {
  insertEvent,
  getEvent,
  getEvents,
  deleteEvent,
} = require("./GoogleCalendar");

// Schedule UX Research appointments
exports.schedule = async (req, res) => {
  try {
    if (
      "email" in req.body &&
      "first" in req.body &&
      "second" in req.body &&
      "third" in req.body
    ) {
      const events = [];
      for (let session = 1; session < 4; session++) {
        let orderredSession = "1st";
        let start = new Date(req.body.first);
        let end = new Date(start.getTime() + 60 * 60000);
        if (session === 2) {
          orderredSession = "2nd";
          start = new Date(req.body.second);
          end = new Date(start.getTime() + 30 * 60000);
        } else if (session === 3) {
          orderredSession = "3rd";
          start = new Date(req.body.third);
          end = new Date(start.getTime() + 30 * 60000);
        }
        const summary =
          "UX Research Experiment - " + orderredSession + " Session";
        const description =
          "This is your " +
          orderredSession +
          " session of the UX Research experiment. \n" +
          (session === 1
            ? "We've also scheduled your 2nd session 3 days later, and 3rd session one week later. \n"
            : session === 2
            ? "We've also scheduled your 3rd session 4 days later. \n"
            : "") +
          "Please confirm your attendance in this session by accepting the invitation . \n" +
          req.body.email.toLowerCase();
        const eventCreated = await insertEvent(
          start,
          end,
          summary,
          description
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

// Get all the events from the beginning of the experiment until next year!
exports.allEvents = async (req, res) => {
  try {
    const start = new Date(2021, 10, 1);
    let end = new Date();
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
