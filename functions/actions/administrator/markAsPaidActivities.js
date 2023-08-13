const { db, batchUpdate, commitBatch } = require("../../admin");

module.exports = async (req, res) => {
  try {
    const activities = req.body.activities;
    if (activities) {
      for (let acti of activities) {
        const activityRef = db.collection("activities").doc(acti.id);
        await batchUpdate(activityRef, { paid: true });
      }
      await commitBatch();
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};
