const { db } = require("../../admin");
const { Timestamp } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const currentTime = Timestamp.fromDate(new Date());
    const { docId: voter } = req.researcher;

    const { administrator, vote, comment, voterProject } = req.body;

    await db.runTransaction(async t => {
      const voterRef = db.collection("researchers").doc(voter);
      const voterDoc = await t.get(voterRef);
      const administratorRef = db.collection("administrators").doc(administrator);
      const administratorDoc = await t.get(administratorRef);
      if (administratorDoc.exists && voterDoc.exists) {
        const voterData = voterDoc.data();
        const administratorData = administratorDoc.data();
        const researcherRef = db.collection("researchers").doc(administratorData.fullname);
        const researcherDoc = await t.get(researcherRef);
        const researcherData = researcherDoc.data();
        const voteQuery = db
          .collection("administratorVotes")
          .where("administrator", "==", administrator)
          .where("voter", "==", voter)
          .limit(1);
        const voteDocs = await t.get(voteQuery);
        let upVote = false;
        let downVote = false;
        let newUpVote = vote === "upVote";
        let newDownVote = vote === "downVote";
        let voteRef, voteData, newVoteData;
        if (voteDocs.docs.length > 0) {
          voteRef = db.collection("administratorVotes").doc(voteDocs.docs[0].id);
          voteData = voteDocs.docs[0].data();
          ({ upVote, downVote } = voteData);
          if (newUpVote) {
            newUpVote = !upVote;
            newDownVote = false;
          } else if (newDownVote) {
            newUpVote = false;
            newDownVote = !downVote;
          }
          newVoteData = {
            upVote: newUpVote,
            downVote: newDownVote,
            updatedAt: currentTime
          };
          if (comment) {
            newVoteData.comment = comment;
          }
          t.update(voteRef, newVoteData);
        } else {
          voteRef = db.collection("administratorVotes").doc();
          newVoteData = {
            fullname: administratorData.fullname,
            administrator,
            project: voterProject,
            upVote: newUpVote,
            downVote: newDownVote,
            voter,
            createdAt: currentTime
          };
          if (comment) {
            newVoteData.comment = comment;
          }
          t.set(voteRef, newVoteData);
        }
        const voteLogRef = db.collection("administratorVoteLogs").doc();
        t.set(voteLogRef, {
          ...newVoteData,
          id: voteRef.id
        });
        let upVoteVal = 0;
        let downVoteVal = 0;
        if (vote === "upVote") {
          upVoteVal = upVote ? -1 : 1;
          downVoteVal = downVote ? -1 : 0;
        } else if (vote === "downVote") {
          upVoteVal = upVote ? -1 : 0;
          downVoteVal = downVote ? -1 : 1;
        }
        let upVotes = 0;
        if (voterData.projects[voterProject].administratorUpVotes) {
          upVotes = voterData.projects[voterProject].administratorUpVotes;
        }
        let downVotes = 0;
        if (voterData.projects[voterProject].administratorDownVotes) {
          downVotes = voterData.projects[voterProject].administratorDownVotes;
        }
        const voterProjectUpdates = {
          projects: {
            ...voterData.projects,
            [voterProject]: {
              ...voterData.projects[voterProject],
              administratorUpVotes: upVotes + upVoteVal,
              administratorDownVotes: downVotes + downVoteVal
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
        const projectSpecsDoc = await db.collection("projectSpecs").doc(administratorData.project).get();
        const projectPoints = projectSpecsDoc.data().points;
        if ("dayAdministratorUpVotes" in projectPoints) {
          let administrators = 0;
          if (researcherData.projects[administratorData.project].administrators) {
            administrators = researcherData.projects[administratorData.project].administrators;
          }
          const researcherProjectUpdates = {
            projects: {
              ...researcherData.projects,
              [administratorData.project]: {
                ...researcherData.projects[administratorData.project],
                administrators: administrators + upVoteVal / 10
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
        }
        let administratorUpVotes = 0;
        if (administratorData.upVotes) {
          administratorUpVotes = administratorData.upVotes;
        }
        let administratorDownVotes = 0;
        if (administratorData.downVotes) {
          administratorDownVotes = administratorData.downVotes;
        }
        const administratorUpdates = {
          upVotes: administratorUpVotes + upVoteVal,
          downVotes: administratorDownVotes + downVoteVal
        };
        if (comment) {
          if (!("comments" in administratorData)) {
            administratorUpdates.comments = [comment];
          } else if (voteData && voteData.comment !== comment) {
            administratorUpdates.comments = administratorData.comments.filter(comm => comm !== voteData.comment);
            administratorUpdates.comments.push(comment);
          }
        }
        t.update(administratorRef, administratorUpdates);
        const administratorLogRef = db.collection("administratorLogs").doc();
        t.set(administratorLogRef, {
          id: administratorRef.id,
          updatedAt: currentTime,
          ...administratorUpdates
        });
      }
    });
  } catch (e) {
    console.log("Transaction failure:", e);
  }
};
