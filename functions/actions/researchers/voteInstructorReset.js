const { db } = require("../../admin");
const { Timestamp } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const instructor = req.body.instructor;
    if (instructor) {
      await db.runTransaction(async t => {
        const instructorRef = db.collection("instructors").doc(instructor);
        const instructorDoc = await t.get(instructorRef);
        if (instructorDoc.exists) {
          const voteQuery = db.collection("instructorVotes").where("instructor", "==", instructor);
          const voteDocs = await t.get(voteQuery);
          for (let voteDoc of voteDocs.docs) {
            const voteRef = db.collection("instructorVotes").doc(voteDoc.id);
            const newVoteData = {
              upVote: false,
              downVote: false,
              updatedAt: Timestamp.fromDate(new Date())
            };
            t.update(voteRef, newVoteData);
            const voteLogRef = db.collection("instructorVoteLogs").doc();
            t.set(voteLogRef, {
              ...newVoteData,
              id: voteRef.id
            });
          }
          const instructorUpdates = {
            upVotes: 0,
            downVotes: 0
          };
          t.update(instructorRef, instructorUpdates);
          const instructorLogRef = db.collection("instructorLogs").doc();
          t.set(instructorLogRef, {
            id: instructorRef.id,
            updatedAt: Timestamp.fromDate(new Date()),
            ...instructorUpdates
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
