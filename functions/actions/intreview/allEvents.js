const { getEvents } = require("../../GoogleCalendar");

// Get all the events from the beginning of the experiment until next year!
module.exports = async (req, res) => {
  try {
    console.log("first");
    let end = new Date();
    const start = new Date(end.getTime() - 31 * 24 * 60 * 60 * 1000);
    end = new Date(end.getTime() + 365 * 24 * 60 * 60 * 1000);
    const allEvents = await getEvents(start, end, "America/Detroit");
    if (allEvents) {
      return res.status(200).json({ events: allEvents });
    } else {
      return res.status(500).json({ message: "Event NOT Retrieved!" });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};
