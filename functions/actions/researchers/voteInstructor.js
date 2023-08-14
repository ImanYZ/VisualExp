const { db } = require("../../admin");
const { Timestamp } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const { instructor, vote, comment, voterProject } = req.body;

    const { docId: voter } = req.researcher;

    const currentTime = Timestamp.fromDate(new Date());
    await db.runTransaction(async t => {
      const voterRef = db.collection("researchers").doc(voter);
      const voterDoc = await t.get(voterRef);
      const instructorRef = db.collection("instructors").doc(instructor);
      const instructorDoc = await t.get(instructorRef);
      if (instructorDoc.exists && voterDoc.exists) {
        const voterData = voterDoc.data();
        const instructorData = instructorDoc.data();
        const researcherRef = db.collection("researchers").doc(instructorData.fullname);
        const researcherDoc = await t.get(researcherRef);
        const researcherData = researcherDoc.data();
        const voteQuery = db
          .collection("instructorVotes")
          .where("instructor", "==", instructor)
          .where("voter", "==", voter)
          .limit(1);
        const voteDocs = await t.get(voteQuery);
        let upVote = false;
        let downVote = false;
        let newUpVote = vote === "upVote";
        let newDownVote = vote === "downVote";
        let voteRef, voteData, newVoteData;
        if (voteDocs.docs.length > 0) {
          voteRef = db.collection("instructorVotes").doc(voteDocs.docs[0].id);
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
          voteRef = db.collection("instructorVotes").doc();
          newVoteData = {
            fullname: instructorData.fullname,
            instructor,
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
        const voteLogRef = db.collection("instructorVoteLogs").doc();
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
        if (voterData.projects[voterProject].instructorUpVotes) {
          upVotes = voterData.projects[voterProject].instructorUpVotes;
        }
        let downVotes = 0;
        if (voterData.projects[voterProject].instructorDownVotes) {
          downVotes = voterData.projects[voterProject].instructorDownVotes;
        }
        const voterProjectUpdates = {
          projects: {
            ...voterData.projects,
            [voterProject]: {
              ...voterData.projects[voterProject],
              instructorUpVotes: upVotes + upVoteVal,
              instructorDownVotes: downVotes + downVoteVal
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
        const projectSpecsDoc = await db.collection("projectSpecs").doc(instructorData.project).get();
        const projectPoints = projectSpecsDoc.data().points;
        if ("dayInstructorUpVotes" in projectPoints) {
          let instructors = 0;

          let projectToUpdate =
            instructorData.project in researcherData?.projects
              ? instructorData.project
              : Object.keys(researcherData?.projects)[0];

          if (researcherData.projects[projectToUpdate]?.instructors) {
            instructors = researcherData.projects[projectToUpdate].instructors;
          }

          const researcherProjectUpdates = {
            projects: {
              ...researcherData.projects,
              [projectToUpdate]: {
                ...researcherData.projects[projectToUpdate],
                instructors: instructors + upVoteVal / 10
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
        let instructorUpVotes = 0;
        if (instructorData.upVotes) {
          instructorUpVotes = instructorData.upVotes;
        }
        let instructorDownVotes = 0;
        if (instructorData.downVotes) {
          instructorDownVotes = instructorData.downVotes;
        }
        const instructorUpdates = {
          upVotes: instructorUpVotes + upVoteVal,
          downVotes: instructorDownVotes + downVoteVal
        };
        if (comment) {
          if (!("comments" in instructorData)) {
            instructorUpdates.comments = [comment];
          } else if (voteData && voteData.comment !== comment) {
            instructorUpdates.comments = instructorData.comments.filter(comm => comm !== voteData.comment);
            instructorUpdates.comments.push(comment);
          }
        }
        t.update(instructorRef, instructorUpdates);
        const instructorLogRef = db.collection("instructorLogs").doc();
        t.set(instructorLogRef, {
          id: instructorRef.id,
          updatedAt: currentTime,
          ...instructorUpdates
        });
      }
    });
    return res.status(200).json({});
  } catch (e) {
    console.log("voteInstructor", e);
    return res.status(500).json({ errMsg: e });
  }
};
