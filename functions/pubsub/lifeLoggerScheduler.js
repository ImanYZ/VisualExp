const { getLifeLogEvents } = require("../../GoogleCalendar");
const { db } = require("../admin");

// ************
// Life Logging
// ************

module.exports = async (req, res) => {
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
