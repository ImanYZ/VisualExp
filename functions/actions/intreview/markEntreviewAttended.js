const { db } = require("../../admin");
const { getEvents } = require("../../GoogleCalendar");
const moment = require("moment-timezone");
module.exports = async (req, res) => {
  try {
    await db.runTransaction(async t => {
      const meetingURL = req.body.meetingURL;
      const researchersDocs = await t.get(db.collection("researchers"));
      const researchersHash = {};
      researchersDocs.forEach(researcherDoc => {
        researchersHash[researcherDoc.data().email] = { fullname: researcherDoc.id, ...researcherDoc.data() };
      });
      const now = new Date().getTime();
      const start = new Date(now - 4 * 60 * 60 * 1000);
      let end = new Date(now + 4 * 60 * 60 * 1000);
      const allEvents = await getEvents(start, end, "America/Detroit");
      const eventIdx = allEvents.findIndex(ev => meetingURL.includes(ev.hangoutLink));
      if (eventIdx === -1) {
        return res.status(404).json({ message: "Event not found" });
      }
      const event = allEvents[eventIdx];
      const scheduleDoc = await db.collection("schedule").where("id", "==", event.id).get();
      if (scheduleDoc.docs.length > 0) {
        const participant = scheduleDoc.docs[0].data().email;
        let meetingId = "";
        const regex = /[a-z]{3}-[a-z]{4}-[a-z]{3}/;
        const matchResult = meetingURL.match(regex);
        if (matchResult) {
          meetingId = matchResult[0];
        }
        const userDoc = await t.get(db.collection("usersSurvey").where("email", "==", participant));
        const transcriptDoc = await t.get(db.collection("transcript").where("mettingUrl", "==", meetingId));
        const scheduleId = scheduleDoc.docs[0].id;
        t.update(db.collection("schedule").doc(scheduleId), { hasStarted: true, attended: true });
        if (userDoc.docs.length > 0 && transcriptDoc.docs.length === 0) {
          const data = userDoc.docs[0].data();
          const transcriptRef = db.collection("transcript").doc();
          t.set(transcriptRef, {
            mettingUrl: meetingId,
            participant: userDoc.docs[0].id,
            surveyType: data.surveyType,
            createdAt: new Date(),
            email: data.email,
            checked: false
          });
          const userRef = db.collection("usersSurvey").doc(userDoc.docs[0].id);
          t.update(userRef, { projectDone: true });
          let researcher = "";
          for (let attendee of event.attendees) {
            if (
              researchersHash.hasOwnProperty(attendee.email) &&
              attendee.email !== "ouhrac@gmail.com" &&
              attendee.email !== "oneweb@umich.edu"
            ) {
              researcher = attendee.email;
              break;
            }
          }
          if (researcher !== "") {
            const resData = researchersHash[researcher];
            const resRef = db.collection("researchers").doc(resData.fullname);
            const expSessionRef = db.collection("expSessions").doc();
            t.set(expSessionRef, {
              attendees: [researcher, participant],
              createdAt: new Date(),
              eTime: moment.tz(event.end.dateTime, event.end.timeZone).toDate(),
              sTime: moment.tz(event.start.dateTime, event.start.timeZone).toDate(),
              points: 10,
              project: "OnlineCommunities",
              eventId: event.id,
              researcher: resData.fullname,
              user: userDoc.docs[0].id
            });
            if (resData.projects.hasOwnProperty("OnlineCommunities")) {
              resData.projects["OnlineCommunities"].expPoints =
                (resData.projects["OnlineCommunities"]?.expPoints || 0) + 10;
              t.update(resRef, { projects: resData.projects });
            }
          }
        }
      }
      res.status(200).json({ success: true });
    });
  } catch (error) {
    res.status(500).json({ success: false });
    console.log(error);
  }
};
