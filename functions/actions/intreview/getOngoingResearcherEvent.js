const moment = require("moment");
const { getEvents } = require("../../GoogleCalendar");
const { db } = require("../../admin");
const { capitalizeFirstLetter } = require("../../utils");
module.exports = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: "Email id required" });
    const start = moment().utcOffset(0).subtract(2, "hours").toDate();
    // get events for next 10 hours.
    const end = moment().utcOffset(0).add(10, "hours").toDate();

    const events = await getEvents(start, end, "UTC");

    const filteredEvents = (events || []).filter(event => {
      return event?.attendees?.some(attendee => attendee.email.toLowerCase() === email.toLowerCase());
    });

    const responseData = [];

    for (let ev of filteredEvents) {
      const schedule = await db.collection("schedule").where("id", "==", ev.id).get();

      if (schedule.docs.length === 0) {
        continue;
      }

      const scheduleData = schedule.docs[0].data();
      const participantEmail = scheduleData.email;

      let userDocs = await db.collection("users").where("email", "==", participantEmail.toLowerCase()).get();

      if (userDocs.docs.length === 0) {
        userDocs = await db.collection("usersSurvey").where("email", "==", participantEmail.toLowerCase()).get();
      }
      if (userDocs.docs.length === 0) continue;
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
          firstname: userName,
          userId: userDocs.docs?.[0].id
        }
      });
    }

    res.send(responseData);
  } catch (error) {
    console.log("500", error);
    return res.status(500).send({ message: "Something went wrong", error });
  }
};
