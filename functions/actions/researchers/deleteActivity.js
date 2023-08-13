const { db } = require("../../admin");

module.exports = async (req, res) => {
  try {
    const activity = req.body.activity;
    if (activity) {
      return res.status(500).json({ error: "activity is missing" });
    }
    const { docId: fullname } = req.researcher;

    await db.runTransaction(async t => {
      const researcherRef = db.collection("researchers").doc(fullname);
      const researcherDoc = await t.get(researcherRef);
      const researcherData = researcherDoc.data();
      const activityRef = db.collection("activities").doc(activity);
      const activityDoc = await t.get(activityRef);
      const activityData = activityDoc.data();
      if (activityData.fullname === fullname) {
        const votesQuery = db.collection("votes").where("activity", "==", activity);
        const voteDocs = await t.get(votesQuery);
        const voteRefsToDelete = [];
        const voterUpdates = [];
        for (const voteDoc of voteDocs.docs) {
          const voteRef = db.collection("votes").doc(voteDoc.id);
          voteRefsToDelete.push(voteRef);
          const voteData = voteDoc.data();
          const voterRef = db.collection("researchers").doc(voteData.voter);
          const voterDoc = await t.get(voterRef);
          const voterData = voterDoc.data();
          const voterUpdateData = {
            projects: voterData.projects
          };
          if (voteData.upVote) {
            voterUpdateData.projects[voteData.project].upVotes -= 1;
          } else if (voteData.noVote) {
            voterUpdateData.projects[voteData.project].noVotes -= 1;
          }
          voterUpdates.push({
            voterRef,
            voterUpdateData
          });
        }
        for (let voteRefToDelete of voteRefsToDelete) {
          const voteLogRef = db.collection("voteLogs").doc();
          t.set(voteLogRef, {
            id: voteRefToDelete.id,
            deleted: true
          });
          t.delete(voteRefToDelete);
        }
        for (let voterUpdate of voterUpdates) {
          t.update(voterUpdate.voterRef, voterUpdate.voterUpdateData);
          const voterLogRef = db.collection("researcherLogs").doc();
          t.set(voterLogRef, {
            id: voterUpdate.voterRef.id,
            ...voterUpdate.voterUpdateData
          });
        }
        const intellectualNum = researcherData.projects[activityData.project].intellectualNum - 1;
        const pointsUpdate = {
          projects: {
            ...researcherData.projects,
            [activityData.project]: {
              ...researcherData.projects[activityData.project],
              points: researcherData.projects[activityData.project].points - activityData.upVotes,
              intellectualNum: intellectualNum > 0 ? intellectualNum : 0
            }
          }
        };
        t.update(researcherRef, pointsUpdate);
        const researcherLogRef = db.collection("researcherLogs").doc();
        t.set(researcherLogRef, {
          id: researcherRef.id,
          ...pointsUpdate
        });
        const activityLogRef = db.collection("activityLogs").doc();
        t.set(activityLogRef, {
          id: activityRef.id,
          deleted: true
        });
        t.delete(activityRef);
      }
    });
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};
