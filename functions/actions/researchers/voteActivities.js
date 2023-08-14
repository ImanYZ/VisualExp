const { db } = require("../../admin");
const { Timestamp } = require("firebase-admin/firestore");
module.exports = async (req, res) => {
  try {
    const activity = req.body.activity;
    const vote = req.body.vote;
    const { docId: voter } = req.researcher;
    const currentTime = Timestamp.fromDate(new Date());
    await db.runTransaction(async t => {
      const voterRef = db.collection("researchers").doc(voter);
      const voterDoc = await t.get(voterRef);
      const activityRef = db.collection("activities").doc(activity);
      const activityDoc = await t.get(activityRef);
      if (activityDoc.exists && voterDoc.exists) {
        const voterData = voterDoc.data();
        const activityData = activityDoc.data();
        const researcherRef = db.collection("researchers").doc(activityData.fullname);
        const researcherDoc = await t.get(researcherRef);
        const researcherData = researcherDoc.data();
        const voteQuery = db
          .collection("votes")
          .where("activity", "==", activity)
          .where("voter", "==", voter)
          .where("project", "==", activityData.project)
          .limit(1);
        const voteDocs = await t.get(voteQuery);
        let upVote = false;
        let noVote = false;
        let newUpVote = vote === "upVote";
        let newNoVote = vote === "noVote";
        let voteRef, newVoteData;
        if (voteDocs.docs.length > 0) {
          voteRef = db.collection("votes").doc(voteDocs.docs[0].id);
          const voteData = voteDocs.docs[0].data();
          ({ upVote, noVote } = voteData);
          if (newUpVote) {
            newUpVote = !upVote;
            newNoVote = false;
          } else if (newNoVote) {
            newUpVote = false;
            newNoVote = !noVote;
          }
          newVoteData = {
            upVote: newUpVote,
            noVote: newNoVote,
            updatedAt: currentTime
          };
          t.update(voteRef, newVoteData);
        } else {
          voteRef = db.collection("votes").doc();
          newVoteData = {
            fullname: activityData.fullname,
            activity,
            project: activityData.project,
            upVote: newUpVote,
            noVote: newNoVote,
            voter,
            createdAt: currentTime
          };
          t.set(voteRef, newVoteData);
        }
        const voteLogRef = db.collection("voteLogs").doc();
        t.set(voteLogRef, {
          ...newVoteData,
          id: voteRef.id
        });
        let upVoteVal = 0;
        let noVoteVal = 0;
        if (vote === "upVote") {
          upVoteVal = upVote ? -1 : 1;
          noVoteVal = noVote ? -1 : 0;
        } else if (vote === "noVote") {
          upVoteVal = upVote ? -1 : 0;
          noVoteVal = noVote ? -1 : 1;
        }
        let upVotes = 0;
        if (voterData.projects[activityData.project].upVotes) {
          upVotes = voterData.projects[activityData.project].upVotes;
        }
        let noVotes = 0;
        if (voterData.projects[activityData.project].noVotes) {
          noVotes = voterData.projects[activityData.project].noVotes;
        }
        const voterProjectUpdates = {
          projects: {
            ...voterData.projects,
            [activityData.project]: {
              ...voterData.projects[activityData.project],
              upVotes: upVotes + upVoteVal,
              noVotes: noVotes + noVoteVal
            }
          }
        };
        t.update(voterRef, voterProjectUpdates);
        const voterLogRef = db.collection("researcherLogs").doc();
        t.set(voterLogRef, {
          ...voterProjectUpdates,
          updatedAt: currentTime,
          id: voterRef.id
        });
        let points = 0;
        if (researcherData.projects[activityData.project].points) {
          points = researcherData.projects[activityData.project].points;
        }
        const researcherProjectUpdates = {
          projects: {
            ...researcherData.projects,
            [activityData.project]: {
              ...researcherData.projects[activityData.project],
              points: points + upVoteVal
            }
          }
        };
        t.update(researcherRef, researcherProjectUpdates);
        const researcherLogRef = db.collection("researcherLogs").doc();
        t.set(researcherLogRef, {
          ...researcherProjectUpdates,
          updatedAt: currentTime,
          id: researcherRef.id
        });
        let activityUpVotes = 0;
        if (activityData.upVotes) {
          activityUpVotes = activityData.upVotes;
        }
        let activityNoVotes = 0;
        if (activityData.noVotes) {
          activityNoVotes = activityData.noVotes;
        }
        const activityUpdates = {
          upVotes: activityUpVotes + upVoteVal,
          noVotes: activityNoVotes + noVoteVal
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
    return res.status(200).send("success");
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};
