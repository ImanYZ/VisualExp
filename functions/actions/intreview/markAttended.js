const { db } = require("../../admin");
const moment = require("moment-timezone");

module.exports = async (req, res) => {
  try {
    await db.runTransaction(async t => {
      const { ev, fullname, email } = req.body;
      const { scheduleId, project } = ev.schedule;
      const participantFullname = ev.schedule.userId;
      const order = ev.schedule.order;
      const session = ev.schedule.session;
      const month = moment(session).utcOffset(-4).startOf("month").format("YYYY-MM-DD");
      const resScheduleDocs = await t.get(
        db.collection("resSchedule").where("month", "==", month).where("project", "==", project)
      );
      let resScheduleData = {};
      if (resScheduleDocs.docs.length > 0) {
        resScheduleData = resScheduleDocs.docs[0].data();
        if (!resScheduleData.hasOwnProperty("attendedSessions")) {
          resScheduleData.attendedSessions = {};
        }
        const attendedSessions = resScheduleData.attendedSessions;
        if (!attendedSessions.hasOwnProperty(fullname)) {
          attendedSessions[fullname] = {};
        }
        if (attendedSessions.hasOwnProperty(fullname)) {
          const startedSessionsByUser = attendedSessions[fullname];
          if (startedSessionsByUser.hasOwnProperty(participantFullname)) {
            if (!startedSessionsByUser[participantFullname].includes(order)) {
              startedSessionsByUser[participantFullname].push(order);
            }
          } else {
            startedSessionsByUser[participantFullname] = [order];
          }
        }
      }
      const scheduleDoc = await t.get(db.collection("schedule").doc(scheduleId));
      const scheduleData = scheduleDoc.data();
      if (project === "OnlineCommunities") {
        const meetingURL = ev.event.hangoutLink;
        let meetingId = "";
        const regex = /[a-z]{3}-[a-z]{4}-[a-z]{3}/;
        const matchResult = meetingURL.match(regex);
        if (matchResult) {
          meetingId = matchResult[0];
        }
        const transcriptDoc = await t.get(db.collection("transcript").where("mettingUrl", "==", meetingId));
        const resRef = db.collection("researchers").doc(fullname);
        const resDoc = await t.get(resRef);
        const resData = resDoc.data();
        const userRef = db.collection("usersSurvey").doc(participantFullname);
        const userDoc = await t.get(userRef);
        const userData = userDoc.data();
        if (transcriptDoc.docs.length === 0) {
          const transcriptRef = db.collection("transcript").doc();
          t.set(transcriptRef, {
            mettingUrl: meetingId,
            participant: participantFullname,
            surveyType: userData.surveyType,
            createdAt: new Date(),
            email: userData.email,
            checked: false
          });
        }
        t.update(userRef, { projectDone: true });
        const expSessionRef = db.collection("expSessions").doc();
        t.set(expSessionRef, {
          attendees: [scheduleData.email, email],
          createdAt: new Date(),
          eTime: moment.tz(ev.event.end.dateTime, ev.event.end.timeZone).toDate(),
          sTime: moment.tz(ev.event.start.dateTime, ev.event.start.timeZone).toDate(),
          points: 10,
          project: project,
          eventId: scheduleData.id,
          researcher: fullname,
          user: participantFullname
        });
        if (resData.projects.hasOwnProperty(project)) {
          resData.projects[project].expPoints = (resData.projects[project]?.expPoints || 0) + 10;
          t.update(resRef, { projects: resData.projects });
        }
      }
      t.update(db.collection("resSchedule").doc(resScheduleDocs.docs[0].id), {
        attendedSessions: resScheduleData.attendedSessions
      });
      t.update(db.collection("schedule").doc(scheduleId), { attended: true });
    });
    res.status(200).send({ message: "seccess" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong", error });
  }
};
