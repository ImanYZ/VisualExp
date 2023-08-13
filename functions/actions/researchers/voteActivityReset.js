const { db , admin} = require("../../admin");
const { Timestamp } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const activity = req.body.activity;
    if (activity) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        const currentTime = Timestamp.fromDate(new Date());
        await db.runTransaction(async t => {
          const activityRef = db.collection("activities").doc(activity);
          const activityDoc = await t.get(activityRef);
          if (activityDoc.exists) {
            const voteQuery = db.collection("votes").where("activity", "==", activity);
            const voteDocs = await t.get(voteQuery);
            for (let voteDoc of voteDocs.docs) {
              const voteRef = db.collection("votes").doc(voteDoc.id);
              const newVoteData = {
                upVote: false,
                noVote: false,
                updatedAt: currentTime
              };
              t.update(voteRef, newVoteData);
              const voteLogRef = db.collection("voteLogs").doc();
              t.set(voteLogRef, {
                ...newVoteData,
                id: voteRef.id
              });
            }
            const activityUpdates = {
              upVotes: 0,
              noVotes: 0
            };
            t.update(activityRef, activityUpdates);
            const activityLogRef = db.collection("activityLogs").doc();
            t.set(activityLogRef, {
              id: activityRef.id,
              updatedAt: currentTime,
              ...activityUpdates
            });
          }
        });
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};
