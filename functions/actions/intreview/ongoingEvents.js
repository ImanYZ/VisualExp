const { getEvents } = require("../../GoogleCalendar");

// Get all the ongoing events.
module.exports = async (req, res) => {
  try {
    const now = new Date().getTime();
    const start = new Date(now - 60 * 60 * 1000);
    let end = new Date(now + 60 * 60 * 1000);
    const allEvents = await getEvents(start, end, "America/Detroit");
    if (allEvents) {
      return res.status(200).json({ events: allEvents });
    }
    return res.status(200).json({ message: "Event NOT Retrieved!" });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};
