const { getEvents } = require("../../GoogleCalendar");
const { db } = require("../../admin");

module.exports = async (req, res) => {
  try {
    const now = new Date().getTime();
    const start = new Date(now - 4 * 60 * 60 * 1000);
    let end = new Date(now + 4 * 60 * 60 * 1000);
    const allEvents = await getEvents(start, end, "America/Detroit");
    const eventIdx = allEvents.findIndex(ev => req.body.meetingURL.includes(ev.hangoutLink));
    if (eventIdx === -1) {
      return res.status(200).json({ message: false, attended: false });
    } else {
      const scheduleDoc = await db.collection("schedule").where("id", "==", allEvents[eventIdx].id).get();
      let attended = false;
      if (scheduleDoc.docs.length > 0) {
        const scheduledata = scheduleDoc.docs[0].data();
        if (scheduledata.hasOwnProperty("attended")) {
          attended = scheduledata.attended;
        }
      }
      return res.status(200).json({ message: true, attended });
    }
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
  }
};
