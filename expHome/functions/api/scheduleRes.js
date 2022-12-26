const { admin, db, commitBatch, batchSet, batchUpdate, batchDelete } = require("../admin");

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1);
}

module.exports = async (req, res) => {
  try {
    const { fullname, schedule } = req.body;
    const date = new Date();
    const scheduleRef = db.collection("resSchedule").doc();
    const newScedule = {
      researchers: [fullname],
      avaiableSchedules: {
        [fullname]: schedule
      },
      month: getFirstDayOfMonth(date.getFullYear(), date.getMonth())
    };
    await batchSet(scheduleRef, newScedule);
    await commitBatch();
  } catch (error) {}
};
