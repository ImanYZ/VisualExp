const { db } = require("../../admin");
const { Timestamp } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const administrator = req.body.administrator;
    if (administrator) {
      const currentTime = Timestamp.fromDate(new Date());
      await db.runTransaction(async t => {
        const administratorRef = db.collection("administrators").doc(administrator);
        const administratorDoc = await t.get(administratorRef);
        if (administratorDoc.exists) {
          const voteQuery = db.collection("administratorVotes").where("administrator", "==", administrator);
          const voteDocs = await t.get(voteQuery);
          for (let voteDoc of voteDocs.docs) {
            const voteRef = db.collection("administratorVotes").doc(voteDoc.id);
            const newVoteData = {
              upVote: false,
              downVote: false,
              updatedAt: currentTime
            };
            t.update(voteRef, newVoteData);
            const voteLogRef = db.collection("administratorVoteLogs").doc();
            t.set(voteLogRef, {
              ...newVoteData,
              id: voteRef.id
            });
          }
          const administratorUpdates = {
            upVotes: 0,
            downVotes: 0
          };
          t.update(administratorRef, administratorUpdates);
          const administratorLogRef = db.collection("administratorLogs").doc();
          t.set(administratorLogRef, {
            id: administratorRef.id,
            updatedAt: currentTime,
            ...administratorUpdates
          });
        }
      });
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};
