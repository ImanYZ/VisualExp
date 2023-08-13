const { db } = require("../../admin");
const moment = require("moment");

module.exports = async (req, res) => {
  try {
    const scheduleIds = [];
    const batch = db.batch();
    let { project, schedule: scheduleSlots } = req.body;
    const fullname = String(req?.userData?.fullname);

    scheduleSlots.sort((s1, s2) => (moment(s1).isBefore(s2) ? -1 : 1));
    const monthlyEntries = {};
    for (const scheduleSlot of scheduleSlots) {
      const month = moment(scheduleSlot).utcOffset(-4, true).startOf("month").format("YYYY-MM-DD");
      if (!monthlyEntries[month]) {
        monthlyEntries[month] = [];
      }
      monthlyEntries[month].push(moment(scheduleSlot).utcOffset(-4, true).format("YYYY-MM-DD HH:mm"));
    }

    for (const month in monthlyEntries) {
      const resSchedules = await db
        .collection("resSchedule")
        .where("project", "==", project)
        .where("month", "==", month)
        .get();
      const resScheduleExist = resSchedules.docs.length > 0;
      const resScheduleRef = resScheduleExist
        ? db.collection("resSchedule").doc(resSchedules.docs[0].id)
        : db.collection("resSchedule").doc();
      scheduleIds.push(resScheduleRef.id);

      let scheduleData = resScheduleExist
        ? resSchedules.docs[0].data()
        : {
            researchers: [],
            project,
            month,
            schedules: {}
          };

      const schedules = monthlyEntries[month];

      scheduleData.project = project;

      if (!~scheduleData.researchers.indexOf(fullname)) {
        scheduleData.researchers.push(fullname);
      }
      scheduleData.schedules[fullname] = schedules;
      if (resScheduleExist) {
        batch.update(resScheduleRef, scheduleData);
      } else {
        batch.set(resScheduleRef, scheduleData);
      }
    }
    await batch.commit();

    return res.status(200).send({
      message: "schedule successfully updated.",
      scheduleIds
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error occurred, please try later"
    });
  }
};
