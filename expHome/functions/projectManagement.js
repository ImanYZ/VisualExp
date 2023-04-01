const { admin, db, commitBatch, batchUpdate } = require("./admin");
const { allPastEvents, futureEvents, pastEvents, last30DayEvents } = require("./scheduling");
const { isToday } = require("./utils");
const {
  reschEventNotificationEmail,
  researcherEventNotificationEmail,
  eventNotificationEmail,
  notAttendedEmail,
  remindResearcherToSpecifyAvailability
} = require("./emailing");
const { deleteEvent } = require("./GoogleCalendar");
const moment = require("moment");
const { delay } = require("lodash");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { getEvent } = require("./GoogleCalendar");

const voteFn = async (voter, activity, vote) => {
  try {
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
  } catch (e) {
    console.log("Transaction failure:", e);
  }
};

// This Function is used to vote the phrases in bulk
// helps to give the points accordingly to every researcher
// It updates researcher, reCallGrade and user data accordingly.
exports.GradeFreeRecall = async (req, res) => {
  if (
    "recallGrade" in req.body &&
    "fullname" in req.body &&
    "voterProject" in req.body &&
    "randomizedPhrases" in req.body
  ) {
    const recallGrade = req.body.recallGrade;
    const fullname = req.body.fullname;
    const voterProject = req.body.voterProject;
    const randomizedPhrases = req.body.randomizedPhrases;

    // const phrasesWithGrades = req.body.phrasesWithGrades || [];
    // const project = req.body.project;
    // const user = req.body.user;
    // const condition = req.body.condition;
    // const passageId = req.body.passageId;
    // const passageIdx = req.body.passageIdx;
    // const session = req.body.session;
    // const phraseNum = req.body.phraseNum;

    db.runTransaction(async t => {
      const transactionWrites = [];
      const currentResearcherRef = db.collection("researchers").doc(`${fullname}`);
      const currentResearcherDoc = await t.get(currentResearcherRef);
      const currentResearcherData = currentResearcherDoc.data();
      const currentResearcherUpdates = currentResearcherData.projects[voterProject];
      currentResearcherUpdates.gradingNum = currentResearcherUpdates.gradingNum
        ? currentResearcherUpdates.gradingNum + randomizedPhrases.length
        : randomizedPhrases.length;

      // researcher references
      const researchersDocs = await db.collection("researchers").get();
      const otherResearchersData = {};
      for (let resDoc of researchersDocs.docs) {
        otherResearchersData[resDoc.id] = { data: resDoc.data() };
      }

      //getting data from recallGrades
      const recallGradeQuery = db.collection("recallGradesV2").doc(recallGrade.docId);
      const recallGradeDoc = await t.get(recallGradeQuery);
      const recallGradesData = recallGradeDoc.data();
      const recallGradesUpdate = { ...recallGradesData };
      const indexOfResponse = recallGradesUpdate.sessions[recallGrade.session].findIndex(
        responseRecall => responseRecall.response === recallGrade.response
      );
      for (let randomPhraseGrade of randomizedPhrases) {
        const indexOfthePhrase = recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].phrases.findIndex(
          phraseObj => phraseObj.phrase === randomPhraseGrade.phrase
        );
        recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].phrases[indexOfthePhrase] = randomPhraseGrade;
      }
      for (let phraseIdx in recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].phrases) {
        const _viewers = recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].phrases[phraseIdx].viewers;

        if (!_viewers) {
          recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].phrases[phraseIdx].viewers = [fullname];
        } else if (!_viewers.includes(fullname)) {
          recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].phrases[phraseIdx].viewers.push(fullname);
        }
      }
      if (!recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].viewers) {
        recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].viewers = [fullname];
      } else if (!recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].viewers.includes(fullname)) {
        recallGradesUpdate.sessions[recallGrade.session][indexOfResponse].viewers.push(fullname);
      }
      recallGradesData.updatedAt = new Date();
      transactionWrites.push({
        type: "update",
        refObj: recallGradeQuery,
        updateObj: recallGradesUpdate
      });

      console.log("::: ::: recallGrade.docId ::: ::: ", recallGrade.docId);
      // user references
      const userRef = db.collection("users").doc(`${recallGradesData.user}`);
      const userDoc = await t.get(userRef);
      const userData = userDoc.data();
      const userUpdates = userData;

      // phraseGrade loop

      for (let randomPhraseGrade of randomizedPhrases) {
        const authenReseaGrade = randomPhraseGrade.grades[randomPhraseGrade.researchers.indexOf(fullname)];

        if (randomPhraseGrade.researchers.includes(fullname)) continue;

        const recallGradeUpdates = {};
        //we need 4 researchers to vote on a phrase
        let approveThePhrase = false;
        if (!randomPhraseGrade.researchers.length === 4) continue;
        // We need to figure out whether at least 3 out of 4 researchers marked it as: (Yes),
        // apporve the phrase
        // give points to the reseachers  and the user
        // ; (No), then it should be approved and we should
        // give points to the researchers, but not the user.
        let identifiedThePhrase = 0;
        let notIdentifiedThePhrase = 0;
        for (let thisGrade of randomPhraseGrade.grades) {
          identifiedThePhrase += thisGrade;
          notIdentifiedThePhrase += !thisGrade;
        }

        // It should be approved if more than or equal to 3 researchers have
        // unanimously identified/not identified this phrase in this free-recall
        // response.
        approveThePhrase = identifiedThePhrase >= 3 || notIdentifiedThePhrase >= 3;
        if (!approveThePhrase) continue;
        // If identified >= 3, we should give the participant their free-recall
        // point.
        if (identifiedThePhrase >= 3) {
          // Because the participant answers the free-recall questions for each
          // passage 3 time, in the 1st, 2nd, and 3rd sessions, we should
          // differentiate them when assigning their grades.
          let recallResponse;
          switch (recallGrade.session) {
            case "1st":
              recallResponse = "recallreGrade";
              break;
            case "2nd":
              recallResponse = "recall3DaysreGrade";
              break;
            case "3rd":
              recallResponse = "recall1WeekreGrade";
              break;
            default:
            // code block
          }
          // The only piece of the user data that should be modified is
          // pCondition based on the point received.
          let theGrade = 1;
          if (recallResponse && userUpdates.pConditions[recallGrade.passage][recallResponse]) {
            // We should add up points here because each free recall response
            // may get multiple points from each of the key phrases identified
            // in it.
            theGrade += userUpdates.pConditions[recallGrade.passage][recallResponse];
          }
          userUpdates.pConditions[recallGrade.passage][recallResponse] = theGrade;
          // Depending on how many key phrases were in the passage, we should
          // calculate the free-recall response ratio.
          userUpdates.pConditions[recallGrade.passage][`${recallResponse}Ratio`] =
            theGrade / recallGrade.phrases.length;
        }
        // For both identified >= 3 AND notIdentified >= 3 cases, we should give
        // a point to each of the researchers who unanimously
        // identified/notIdentified this phrase in this free recall response.
        for (let fResearcherIdx = 0; fResearcherIdx < randomPhraseGrade.researchers.length; fResearcherIdx++) {
          otherResearchersData[randomPhraseGrade.researchers[fResearcherIdx]].isOther = true;

          // fetch all the researcher projects and
          // check if it has in payload or not.

          const researcherObj = otherResearchersData[randomPhraseGrade.researchers[fResearcherIdx]];
          const researcherHasProjectFromPayloadProject = recallGrade in researcherObj.data.projects;
          if (
            (identifiedThePhrase >= 3 && randomPhraseGrade.grades[fResearcherIdx]) ||
            (notIdentifiedThePhrase >= 3 && !randomPhraseGrade.grades[fResearcherIdx])
          ) {
            // Approve the recallGrade for all the researchers who
            // unanimously identified/notIdentified this phrase in this free
            // recall response.
            recallGradeUpdates.approved = approveThePhrase;
            if (researcherHasProjectFromPayloadProject) {
              researcherObj.data.projects[recallGradesData.project].gradingPoints = researcherObj.data.projects[
                recallGradesData.project
              ].gradingPoints
                ? researcherObj.data.projects[recallGradesData.project].gradingPoints + 0.5
                : 0.5;
            }
          }
          // If there are exactly 3 researchers who graded the same, but only
          // this researcher's grade (Yes/No) is different from the majority of
          // grades; we should give the opposing researcher a negative point.
          else if (
            (identifiedThePhrase === 3 && !randomPhraseGrade.grades[fResearcherIdx]) ||
            (notIdentifiedThePhrase === 3 && randomPhraseGrade.grades[fResearcherIdx])
          ) {
            if (researcherHasProjectFromPayloadProject) {
              researcherObj.data.projects[recallGradesData.project].gradingPoints = researcherObj.data.projects[
                recallGradesData.project
              ].gradingPoints
                ? researcherObj.data.projects[recallGradesData.project].gradingPoints - 0.5
                : -0.5;
              researcherObj.data.projects[recallGradesData.project].negativeGradingPoints = researcherObj.data.projects[
                recallGradesData.project
              ].negativeGradingPoints
                ? researcherObj.data.projects[recallGradesData.project].negativeGradingPoints + 0.5
                : 0.5;
            }
          }
        }
        // If the authenticated researcher has graded the same as the majority
        // of grades:
        if ((identifiedThePhrase >= 3 && authenReseaGrade) || (notIdentifiedThePhrase >= 3 && !authenReseaGrade)) {
          // Because it's approved, we should also give the authenticated
          // researcher a point. We should update thisResearcherUpdates and
          // commit all the updates at the end to their document.
          currentResearcherUpdates.gradingPoints = currentResearcherUpdates.gradingPoints
            ? currentResearcherUpdates.gradingPoints + 0.5
            : 0.5;
        }
        // If there are exactly 3 researchers who graded the same, but only the
        // authenticated researcher's grade (Yes/No) is different from the
        // majority of grades; we should give the the authenticated researcher a
        // negative point.
        else if (
          (identifiedThePhrase === 3 && !authenReseaGrade) ||
          (notIdentifiedThePhrase === 3 && authenReseaGrade)
        ) {
          currentResearcherUpdates.gradingPoints = currentResearcherUpdates.gradingPoints
            ? currentResearcherUpdates.gradingPoints - 0.5
            : -0.5;
          currentResearcherUpdates.negativeGradingPoints = currentResearcherUpdates.negativeGradingPoints
            ? currentResearcherUpdates.negativeGradingPoints + 0.5
            : 0.5;
        }

        // Finally, we should create RecallGrade doc for this new grade.
        // this done variable if for testing if 4 researchers have voted on this
      }
      // for phrase grades loop ends above

      // write all the transactions for other researcher's data
      for (let researcherId in otherResearchersData) {
        if (otherResearchersData[researcherId].isOther) {
          const researcherRef = db.collection("researchers").doc(`${researcherId}`);
          transactionWrites.push({
            type: "update",
            refObj: researcherRef,
            updateObj: otherResearchersData[researcherId].data
          });
        }
      }

      // write user transactions
      transactionWrites.push({
        type: "update",
        refObj: userRef,
        updateObj: userUpdates
      });

      // write currentResearcherRef
      transactionWrites.push({
        type: "update",
        refObj: currentResearcherRef,
        updateObj: {
          projects: {
            ...currentResearcherData.projects,
            [voterProject]: currentResearcherUpdates
          }
        }
      });

      // After accumulating all the updates for the authenticated researcher,
      // now we can update their document's.

      for (let transactionWrite of transactionWrites) {
        if (transactionWrite.type === "update") {
          t.update(transactionWrite.refObj, transactionWrite.updateObj);
        } else if (transactionWrite.type === "set") {
          t.set(transactionWrite.refObj, transactionWrite.updateObj);
        } else if (transactionWrite.type === "delete") {
          t.delete(transactionWrite.refObj);
        }
      }
    })
      .then(() => {
        return res
          .status(200)
          .json({ success: true, endpoint: "Bulk Upload", successData: req.body.phrasesWithGrades });
      })
      .catch(err => {
        console.log({ err });
        return res.status(500).json({ errMsg: err.message, success: false });
      });
  } else {
    return res.status(500).json({ errMsg: "some parameters missing", success: false });
  }
};

exports.voteEndpoint = async (req, res) => {
  try {
    const activity = req.body.activity;
    const vote = req.body.vote;
    if (activity && vote) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        await voteFn(userDocs.docs[0].id, activity, vote);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.voteActivityReset = async (req, res) => {
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

exports.markPaidEndpoint = async (req, res) => {
  try {
    const activities = req.body.activities;
    if (activities) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        const researcherDoc = await db.collection("researchers").doc(userDocs.docs[0].id).get();
        if (researcherDoc.exists) {
          const researcherData = researcherDoc.data();
          if (researcherData.isAdmin) {
            for (let acti of activities) {
              const activityRef = db.collection("activities").doc(acti.id);
              await batchUpdate(activityRef, { paid: true });
            }
            await commitBatch();
          }
        }
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = req.body.activity;
    if (activity) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      try {
        const currentTime = Timestamp.fromDate(new Date());
        await db.runTransaction(async t => {
          const userQuery = db.collection("users").where("uid", "==", authUser.uid).limit(1);
          const userDocs = await t.get(userQuery);
          if (userDocs.docs.length > 0) {
            const fullname = userDocs.docs[0].id;
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
              const pointsUpdate = {
                projects: {
                  ...researcherData.projects,
                  [activityData.project]: {
                    ...researcherData.projects[activityData.project],
                    points: researcherData.projects[activityData.project].points - activityData.upVotes
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
          }
        });
      } catch (e) {
        console.log("Transaction failure:", e);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

const voteInstructorFn = async (voter, instructor, vote, comment, voterProject) => {
  try {
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
  } catch (e) {
    console.log("Transaction failure:", e);
  }
};

exports.voteInstructorEndpoint = async (req, res) => {
  try {
    const instructor = req.body.instructor;
    const vote = req.body.vote;
    const comment = req.body.comment || "";
    const voterProject = req.body.voterProject;
    if (instructor && vote && voterProject) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        await voteInstructorFn(userDocs.docs[0].id, instructor, vote, comment, voterProject);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.voteInstructorReset = async (req, res) => {
  try {
    const instructor = req.body.instructor;
    if (instructor) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        const currentTime = Timestamp.fromDate(new Date());
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
                updatedAt: currentTime
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
              updatedAt: currentTime,
              ...instructorUpdates
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

const voteAdministratorFn = async (voter, administrator, vote, comment, voterProject) => {
  try {
    const currentTime = Timestamp.fromDate(new Date());
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

exports.voteAdministratorEndpoint = async (req, res) => {
  try {
    const administrator = req.body.administrator;
    const vote = req.body.vote;
    const comment = req.body.comment;
    const voterProject = req.body.voterProject;
    if (administrator && vote && voterProject) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        await voteAdministratorFn(userDocs.docs[0].id, administrator, vote, comment, voterProject);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.voteAdministratorReset = async (req, res) => {
  try {
    const administrator = req.body.administrator;
    if (administrator) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
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
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

// exports.addInstructorsNums = async (req, res) => {
//   try {
//     const instructorsNums = {};
//     const instructorDocs = await db.collection("instructors").get();
//     for (let instructorDoc of instructorDocs.docs) {
//       const instructorData = instructorDoc.data();
//       if (instructorData.fullname in instructorsNums) {
//         instructorsNums[instructorData.fullname].num += 1;
//       } else {
//         instructorsNums[instructorData.fullname] = {
//           project: instructorData.project,
//           num: 1,
//         };
//       }
//     }
//     for (let fullname in instructorsNums) {
//       const researcherRef = db.collection("researchers").doc(fullname);
//       const researcherDoc = await researcherRef.get();
//       const researcherData = researcherDoc.data();
//       const projectData =
//         researcherData.projects[[instructorsNums[fullname].project]];
//       await batchUpdate(researcherRef, {
//         projects: {
//           ...researcherData.projects,
//           [instructorsNums[fullname].project]: {
//             ...projectData,
//             instructorsNum: instructorsNums[fullname].num,
//           },
//         },
//       });
//     }
//     await commitBatch();
//     return res.status(200).json({});
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ errMsg: err.message });
//   }
// };


// exports.codeFeedbackEndpoint = async (req, res) => {
//   try {
//     const activity = req.body.activity;
//     const vote = req.body.vote;
//     if (activity && vote) {
//       const authUser = await admin
//         .auth()
//         .verifyIdToken(req.headers.authorization);
//       const userDocs = await db
//         .collection("users")
//         .where("uid", "==", authUser.uid)
//         .limit(1)
//         .get();
//       if (userDocs.docs.length > 0) {
//         await voteFn(userDocs.docs[0].id, activity, vote);
//       }
//     }
//     return res.status(200).json({});
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ errMsg: err.message });
//   }
// };

// // Load the existing codes for qualitative feedback from the CSV files to the
// // database, fill in the feedbackCodeBooks and feedbackCodes collections and
// // assign points to these old researchers in researchers.
// // The pseudocode is illustrated in
// exports.loadfeedbackCodes = async (req, res) => {
//   try {
//     // The issue with our CSV files is that we do not have the users'
//     // identifiers. So, we need to retrieve all the users, then for each
//     // explanations, we should check which user it belongs to and get the index
//     // of that user to continue with.
//     let userDocs = await db.collection("users").get();
//     const usersData = {};
//     for (let userDoc of userDocs.docs) {
//       usersData[userDoc.id] = userDoc.data();
//     }

//     // Because the CSV files are specific to a question from a session, coder,
//     // and project, before opening each, we should specify the following
//     // parameter names that the CSV file is associated with.
//     const project = "H2K2";
//     const coders = ["Zoe Dunnum", "Jasmine Wu", "Shabana Gupta"];
//     const expParameters = [
//       // {
//       //   expIdx: 0,
//       //   columnName: "explanation1",
//       //   session: "1st",
//       //   fieldName: "explanations",
//       //   choiceField: "postQ1Choice",
//       //   filePath: "datasets/Experiment Data - Copy of Coding Q1 Phase 1.csv",
//       // },
//       // {
//       //   expIdx: 0,
//       //   columnName: "explanation2",
//       //   session: "2nd",
//       //   fieldName: "explanations3Days",
//       //   choiceField: "post3DaysQ1Choice",
//       //   filePath: "datasets/Experiment Data - Copy of Coding Q1 Phase 2.csv",
//       // },
//       // {
//       //   expIdx: 1,
//       //   columnName: "explanation2",
//       //   session: "1st",
//       //   fieldName: "explanations",
//       //   choiceField: "postQ2Choice",
//       //   filePath: "datasets/Experiment Data - Copy of Coding Q2 Phase 1.csv",
//       // },
//       {
//         expIdx: 1,
//         columnName: "explanation2-3Days",
//         session: "2nd",
//         fieldName: "explanations3Days",
//         choiceField: "post3DaysQ2Choice",
//         filePath: "datasets/Experiment Data - Copy of Coding Q2 Phase 2.csv",
//       },
//     ];
//     for (let {
//       expIdx,
//       columnName,
//       session,
//       fieldName,
//       choiceField,
//       filePath,
//     } of expParameters) {
//       const ws = fs.createReadStream(filePath);
//       let rowIdx = 0;
//       const parser = csv
//         .parseStream(ws, { headers: true })
//         .on("error", (error) => {
//           console.error(error);
//           return res.status(500).json({ error });
//         })
//         .on("data", async (row) => {
//           console.log(rowIdx);
//           // We need to pause reading from the CSV file to process the row
//           // before continuing with the next row.
//           parser.pause();
//           if (row[columnName]) {
//             let explanation = row[columnName].replace(/(\r\n|\n|\r|[ ])/gm, "");
//             // We should iterate through all the users to figure out which user this
//             // explanation belongs to and identify their fullname.
//             let fullname = "";
//             for (let userId in usersData) {
//               if (
//                 fieldName in usersData[userId] &&
//                 usersData[userId][fieldName]
//               ) {
//                 if (
//                   usersData[userId][fieldName][expIdx].replace(
//                     /(\r\n|\n|\r|[ ])/gm,
//                     ""
//                   ) === explanation
//                 ) {
//                   fullname = userId;
//                   break;
//                 }
//               }
//             }
//             if (fullname === "") {
//               console.log({ explanation: row[columnName] });
//             } else {
//               explanation = usersData[fullname][fieldName][expIdx];
//               const choice = usersData[fullname][choiceField];
//               await db.runTransaction(async (t) => {
//                 // Accumulate all the transaction writes in an array to commit all of them
//                 // after all the reads to abide by the Firestore transaction law
//                 // https://firebase.google.com/docs/firestore/manage-data/transactions#transactions.
//                 const transactionWrites = [];
//                 const currentTime = admin.firestore.Timestamp.fromDate(
//                   new Date()
//                 );
//                 // We have two coders (researchers) and we need to do the rest for
//                 // each of the two coders.
//                 for (let coder of coders) {
//                   const researcherRef = db.collection("researchers").doc(coder);
//                   const researcherDoc = await t.get(researcherRef);
//                   const researcherData = researcherDoc.data();
//                   const researcherUpdates = {
//                     projects: {
//                       ...researcherData.projects,
//                       [project]: {
//                         ...researcherData.projects[project],
//                       },
//                     },
//                   };
//                   for (let code in row) {
//                     if (
//                       ![
//                         "UserIndex",
//                         "postQ1Choice",
//                         "explanation1",
//                         "explanation2",
//                         "fullname",
//                         "postQ2Choice",
//                         "postQ2Choice-3Days",
//                         "explanation2-3Days",
//                       ].includes(code) &&
//                       !["", "0", 0].includes(row[code])
//                     ) {
//                       const feedbackCodeBookQuery = db
//                         .collection("feedbackCodeBooks")
//                         .where("code", "==", code);
//                       const feedbackCodeBookDocs = await t.get(
//                         feedbackCodeBookQuery
//                       );
//                       if (feedbackCodeBookDocs.docs.length === 0) {
//                         const feedbackCodeBookRef = db
//                           .collection("feedbackCodeBooks")
//                           .doc();
//                         transactionWrites.push({
//                           type: "set",
//                           objRef: feedbackCodeBookRef,
//                           obj: {
//                             code,
//                             coder,
//                             createdAt: currentTime,
//                           },
//                         });
//                         if (
//                           "codesGenerated" in
//                           researcherUpdates.projects[project]
//                         ) {
//                           researcherUpdates.projects[
//                             project
//                           ].codesGenerated += 1;
//                         } else {
//                           researcherUpdates.projects[
//                             project
//                           ].codesGenerated = 1;
//                         }
//                       }
//                       if ("codesNum" in researcherUpdates.projects[project]) {
//                         researcherUpdates.projects[project].codesNum += 1;
//                       } else {
//                         researcherUpdates.projects[project].codesNum = 1;
//                       }
//                       const feedbackCodeQuery = db
//                         .collection("feedbackCodes")
//                         .where("explanation", "==", explanation)
//                         .where("code", "==", code)
//                         .where("choice", "==", choice)
//                         .where("expIdx", "==", expIdx)
//                         .where("session", "==", session);
//                       const feedbackCodeDocs = await t.get(feedbackCodeQuery);
//                       let approved = false;
//                       if (feedbackCodeDocs.docs.length >= 2) {
//                         approved = true;
//                         if (
//                           "codesPoints" in researcherUpdates.projects[project]
//                         ) {
//                           researcherUpdates.projects[project].codesPoints += 1;
//                         } else {
//                           researcherUpdates.projects[project].codesPoints = 1;
//                         }
//                       }
//                       const feedbackCodeRef = db
//                         .collection("feedbackCodes")
//                         .doc();
//                       transactionWrites.push({
//                         type: "set",
//                         objRef: feedbackCodeRef,
//                         obj: {
//                           coder,
//                           code,
//                           choice,
//                           approved,
//                           project,
//                           fullname,
//                           session,
//                           expIdx,
//                           explanation,
//                           quotes: [],
//                           createdAt: currentTime,
//                         },
//                       });
//                     }
//                   }
//                   transactionWrites.push({
//                     type: "update",
//                     objRef: researcherRef,
//                     obj: researcherUpdates,
//                   });
//                 }
//                 for (let transWrite of transactionWrites) {
//                   if (transWrite.type === "set") {
//                     t.set(transWrite.objRef, transWrite.obj);
//                   } else if (transWrite.type === "update") {
//                     t.update(transWrite.objRef, transWrite.obj);
//                   }
//                 }
//               });
//             }
//           }
//           rowIdx += 1;
//           parser.resume();
//         })
//         .on("end", async (row) => {});
//     }
//   } catch (err) {
//     console.log({ err });
//     return res.status(500).json({ errMsg: err.message });
//   }
//   return res.status(500).json({ done: true });
// };

// exports.loadTimesheetVotes = async (req, res) => {
//   try {
//     const project = "H2K2";
//     let researcherIdx = 0;
//     let preResearcherIdx = -1;
//     const researcherInterval = setInterval(() => {
//       if (researcherIdx < researchers.length) {
//         if (preResearcherIdx !== researcherIdx) {
//           preResearcherIdx = researcherIdx;
//           const fullname = researchers[researcherIdx].fullname;
//           let rowIdx = 0;
//           const ws = fs.createReadStream("datasets/Linear, Hybrid, or Non-linear Knowledge RCT - " + fullname + ".csv");
//           const parser = csv
//             .parseStream(ws, { headers: true })
//             .on("error", error => {
//               console.error(error);
//               return res.status(500).json({ error });
//             })
//             .on("data", async row => {
//               console.log(rowIdx);
//               parser.pause();
//               if (row["Date"] && row["Time In"] && row["Time Out"]) {
//                 const activityDate = new Date(row["Date"]);
//                 const startTime = new Date(row["Date"] + " " + row["Time In"] + ":00");
//                 const endTime = new Date(row["Date"] + " " + row["Time Out"] + ":00");
//                 const timeStamps = getIn30Minutes(startTime, endTime);
//                 for (let { sTime, eTime } of timeStamps) {
//                   const { sTimestamp, eTimestamp } = getActivityTimeStamps(activityDate, sTime, eTime);
//                   const currentTime = admin.firestore.Timestamp.fromDate(new Date());
//                   const activityRef = db.collection("activities").doc();
//                   const docObj = {
//                     fullname,
//                     project,
//                     sTime: sTimestamp,
//                     eTime: eTimestamp,
//                     description: row["Description"],
//                     tags: [],
//                     upVotes: 0,
//                     createdAt: currentTime
//                   };
//                   await activityRef.set(docObj);
//                   const activityLogRef = db.collection("activityLog").doc();
//                   await activityLogRef.set({ docObj });
//                   for (let researcher of researchers) {
//                     if (researcher.fullname in row && strToBoolean(row[researcher.fullname])) {
//                       await vote(researcher.fullname, activityRef.id, "upVote");
//                     }
//                   }
//                 }
//               }
//               rowIdx += 1;
//               parser.resume();
//             })
//             .on("end", async row => {
//               const endInterval = setInterval(() => {
//                 if (rowIdx >= 970) {
//                   clearInterval(endInterval);
//                   setTimeout(async () => {
//                     rowIdx = 0;
//                     setTimeout(() => {
//                       researcherIdx += 1;
//                     }, 4000);
//                   }, 1000);
//                 }
//               }, 1000);
//             });
//         }
//       } else {
//         clearInterval(researcherInterval);
//       }
//     }, 1000);
//   } catch (err) {
//     console.log({ err });
//     return res.status(500).json({ errMsg: err.message });
//   }
//   return res.status(500).json({ done: true });
// };

exports.remindResearchersForAvailability = async context => {
  try {
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    // let waitTime = 0;
    // const researchersInfo = [];

    // Retrieve all the researchers to check availabilities per researcher,
    // per project, only if the researcher is active in that project.
    const researchersDocs = await db.collection("researchers").get();
    for (let researcherDoc of researchersDocs.docs) {
      const researcherData = researcherDoc.data();
      if ("projects" in researcherData) {
        for (const project in researcherData.projects) {
          if (researcherData.projects[project].active && researcherData.projects[project].scheduleSessions) {
            // month for next 10 days
            const month = moment().utcOffset(-4).add(10, "day").format("YYYY-MM-DD");
            const resSchedules = await db
              .collection("resSchedule")
              .where("project", "==", project)
              .where("researchers", "array-contains", researcherDoc.id)
              .where("month", "==", month)
              .get();

            let lastAvailability = new Date();
            if (resSchedules.docs.length) {
              const resSchedule = resSchedules.docs[0];
              const resScheduleData = resSchedule.data();
              const availabilities = resScheduleData[researcherDoc.id]?.schedules || [];
              for (const availability of availabilities) {
                const _availability = moment(availability).utcOffset(-4, true).toDate();
                if (_availability.getTime() > lastAvailability.getTime()) {
                  lastAvailability = _availability;
                }
              }
            }

            let tenDaysLater = new Date();
            tenDaysLater = new Date(tenDaysLater.getTime() + 10 * 24 * 60 * 60 * 1000);
            if (lastAvailability.getTime() < tenDaysLater.getTime()) {
              // Increase waitTime by a random integer between 1 to 4 seconds.
              const waitTime = 1000 * (1 + Math.floor(Math.random() * 4));
              // Send a reminder email to a researcher that they have not specified
              // their availability for the next ten days and ask them to specify it.
              await remindResearcherToSpecifyAvailability(researcherData.email, researcherDoc.id, "ten");
              await delay(waitTime);
            }
          }
        }
        /* researchersInfo.push({
          fullname: researcherDoc.id,
          email: researcherData.email,
          projects: Object.keys(researcherData.projects)
        }); */
      }
    }

    console.log({ err });
    return null;
  } catch (e) {}
};

// Clicking the Yes or No buttons in FreeRecallGrading.js under
// ProjectManagement would trigger this function. grade can be either true,
// meaning the researcher responded Yes, or false if they responded No.


// This is called in a pubsub every 25 hours.
// Email reminders to researchers that they have not added/voted any instructors
// over the past week and ask them to add/vote instructors and administrators.
// exports.remindAddingInstructorsAdministrators = async context => {
//   try {
//     // We don't want to send many emails at once, because it may drive Gmail crazy.
//     // waitTime keeps increasing for every email that should be sent and in a setTimeout
//     // postpones sending the next email until the next waitTime.
//     let waitTime = 0;
//     // Retrieve all the researchers to check daily contributions per researcher,
//     // per project, only if the researcher is active in that project.
//     const researchersDocs = await db.collection("researchers").get();
//     for (let researcherDoc of researchersDocs.docs) {
//       const researcherData = researcherDoc.data();
//       if ("projects" in researcherData) {
//         for (let project in researcherData.projects) {
//           if (researcherData.projects[project].active) {
//             // A sorted array of days where the researcher
//             // got the point for adding new instrutors/administrators.
//             const dayInstructors = [];
//             const resScheduleDocs = await db
//               .collection("dayInstructors")
//               .where("project", "==", project)
//               .where("fullname", "==", researcherDoc.id)
//               .get();
//             let lastAvailability;
//             for (let resScheduleDoc of resScheduleDocs.docs) {
//               const resScheduleData = resScheduleDoc.data();
//               const theSession = resScheduleData.session.toDate();
//               if (!lastAvailability || theSession.getTime() > lastAvailability.getTime()) {
//                 lastAvailability = theSession;
//               }
//             }
//             let tenDaysLater = new Date();
//             tenDaysLater = new Date(tenDaysLater.getTime() + 10 * 24 * 60 * 60 * 1000);
//             if (lastAvailability.getTime() < tenDaysLater.getTime()) {
//               // Send a reminder email to a researcher that they have not accepted
//               // or even declined the Google Calendar invitation and asks them to
//               // accept it or ask someone else to take it.
//               // eslint-disable-next-line no-loop-func
//               setTimeout(() => {
//                 researcherEventNotificationEmail(
//                   attendee.email,
//                   researchers[attendee.email],
//                   participant.email,
//                   hoursLeft,
//                   order,
//                   attendee.responseStatus === "declined" || attendee.responseStatus === "tentative"
//                 );
//               }, waitTime);
//               // Increase waitTime by a random integer between 1 to 4 seconds.
//               waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
//             }
//           }
//         }
//       }
//     }
//     return null;
//   } catch (err) {
//     console.log({ err });
//     return null;
//   }
// };

const getUserDocsfromEmail = async email => {
  let userDocs = await db.collection("users").where("email", "==", email.toLowerCase()).get();

  if (userDocs.docs.length === 0) {
    userDocs = await db.collection("instructors").where("email", "==", email.toLowerCase()).get();
  }

  if (userDocs.docs.length === 0) {
    userDocs = await db.collection("usersStudentCoNoteSurvey").where("email", "==", email.toLowerCase()).get();
  }

  return userDocs;
};
exports.getUserDocsfromEmail = getUserDocsfromEmail;

// This is called in a pubsub every 4 hours.
// Email reminders to researchers and participants to do the following:
// For future Google Calendar events, to:
// - Accept their invitations
// - Reschedule if they have declined them
// For passed Google Calendar events, to:
// - Reschedule if they have missed or declined them.
exports.remindCalendarInvitations = async context => {
  try {
    // researchers = an object of emails as keys and the corresponding fullnames as values.
    const researchers = {};
    const researcherDocs = await db.collection("researchers").get();
    for (let researcherDoc of researcherDocs.docs) {
      const researcherData = researcherDoc.data();
      if (!researcherData.email) continue;
      researchers[researcherData.email.toLowerCase()] = researcherDoc.id;
    }
    // Retrieve all the scheduled sessions.
    // Having an id means the document is not just an availability, but there
    // is a corresponding Google Calendar event with the specified id.
    const scheduleDocs = await db.collection("schedule").orderBy("id").get();
    // Collect all the data for these documents in an array.
    const schedule = {};
    for (let scheduleDoc of scheduleDocs.docs) {
      const scheduleData = scheduleDoc.data();
      const scheduleEventId = scheduleData.id;
      delete scheduleData.id;
      schedule[scheduleEventId] = {
        ...scheduleData,
        schId: scheduleDoc.id
      };
    }
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    let waitTime = 0;
    const allEvents = await futureEvents(40);
    const currentTime = new Date().getTime();
    // Each Google Calendar event has {start, end, attendees}.
    // Each attendee has {email, responseStatus}
    // attendee.responseStatus can take one of these possible values:
    // 'accepted', 'needsAction', 'tentative', 'declined'
    for (let ev of allEvents) {
      const startTime = new Date(ev.start.dateTime).getTime();
      const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
      // Find the scheduled session corresponding to this event.
      if (ev.id in schedule && "attendees" in ev && Array.isArray(ev.attendees)) {
        // Get the participant's email and order through the scheduled session.
        const participant = {
          email: schedule[ev.id].email.toLowerCase()
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          if (attendee.responseStatus !== "accepted") {
            // If the attendee is a researcher:
            if (attendee.email.toLowerCase() in researchers) {
              // Send a reminder email to a researcher that they have not accepted
              // or even declined the Google Calendar invitation and asks them to
              // accept it or ask someone else to take it.
              setTimeout(() => {
                researcherEventNotificationEmail(
                  attendee.email.toLowerCase(),
                  researchers[attendee.email.toLowerCase()],
                  participant.email,
                  hoursLeft,
                  order,
                  attendee.responseStatus === "declined" || attendee.responseStatus === "tentative"
                );
              }, waitTime);
              // Increase waitTime by a random integer between 1 to 4 seconds.
              waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
            }
            // Find the attendee who corresponds to this participant:
            else if (attendee.email.toLowerCase() === participant.email) {
              // The only way to get the user data, like their firstname, which
              // sessions they have completed so far, ... is through "users"
              const userDocs = await getUserDocsfromEmail(attendee.email.toLowerCase());

              if (userDocs.docs.length > 0) {
                const userData = userDocs.docs[0].data();
                participant.firstname = userData.firstname;
                if (userData.course) {
                  participant.courseName = userData.course;
                } else {
                  participant.courseName = "";
                }
                // If the user has answered postQ2Choice it means they have
                // completed the 1st session.
                if (userData.postQ2Choice) {
                  participant.firstDone = true;
                } else {
                  participant.firstDone = false;
                }
                // If the user has answered post3DaysQ2Choice it means they have
                // completed the 2nd session.
                if (userData.post3DaysQ2Choice) {
                  participant.secondDone = true;
                } else {
                  participant.secondDone = false;
                }
                // If the user has completed all the experiment sessions, then
                // projectDone should be true.
                if (userData.projectDone) {
                  participant.thirdDone = true;
                } else {
                  participant.thirdDone = false;
                }

                // We consider "declined" and "tentative" responses as declined.
                if (attendee.responseStatus === "declined" || attendee.responseStatus === "tentative") {
                  // If they have declined the 1st session, but they are not done
                  // with the 1st session:
                  if (order === "1st" && !participant.firstDone) {
                    // Then, we delete all their sessions from Google Calendar and
                    // schedule them, send them an email asking them to reschedule
                    // all their sessions.
                    setTimeout(() => {
                      reschEventNotificationEmail(
                        participant.email,
                        participant.firstname,
                        false,
                        participant.courseName,
                        hoursLeft,
                        false,
                        true,
                        true,
                        null
                      );
                    }, waitTime);
                    // Increase waitTime by a random integer between 1 to 4 seconds.
                    waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
                  } else if (
                    (order === "2nd" && !participant.secondDone) ||
                    (order === "3rd" && !participant.thirdDone)
                  ) {
                    // If the session is 2nd/3rd, but they have not completed the
                    // corresponding session:
                    // Then, we send them an email asking them to reschedule
                    // their 2nd/3rd session on the same day, otherwise their
                    // application would be withdrawn.
                    setTimeout(() => {
                      eventNotificationEmail(
                        participant.email,
                        participant.firstname,
                        false,
                        participant.courseName,
                        hoursLeft,
                        false,
                        "",
                        order,
                        false,
                        true
                      );
                    }, waitTime);
                    // Increase waitTime by a random integer between 1 to 4 seconds.
                    waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
                  }
                } else if (
                  // If they have not declined, but did not accept either, and
                  // less than 25 hours is left to the start of their experiment session:
                  hoursLeft <= 25
                ) {
                  // If it's their 3rd session, but they did not complete their 2nd session:
                  if (order === "3rd" && !participant.secondDone) {
                    // Delete the 3rd session, because logically they should not go through
                    // the 3rd session without completing the 2nd one.
                    await deleteEvent(ev.id);
                    // Also, remove the Calendar event id and order from their schedule doc.
                    const scheduleRef = db.collection("schedule").doc(schedule[ev.id].schId);
                    await scheduleRef.update({
                      id: FieldValue.delete(),
                      order: FieldValue.delete()
                    });
                  } else {
                    setTimeout(() => {
                      // Email every four hours to remind them that they need to accept the
                      // Google Calendar invite for whichever session they have not accepted yet.
                      eventNotificationEmail(
                        participant.email,
                        participant.firstname,
                        false,
                        participant.courseName,
                        hoursLeft,
                        false,
                        "",
                        order,
                        false,
                        false
                      );
                    }, waitTime);
                    // Increase waitTime by a random integer between 1 to 4 seconds.
                    waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
                  }
                }
              }
            }
          }
        }
      }
    }
    // Look into all Google Calendar sessions in the past 40 days:
    const pastEvs = await pastEvents(40);
    for (let ev of pastEvs) {
      const startTime = new Date(ev.start.dateTime);
      // Because some people may spend more time in their sessions,
      // we should consider the fact that while someone has not ended their session yet,
      // this PubSub may be invoked. To prevent that we define the end time an hour after the actual end time of the session.
      const endTimeStamp = new Date(ev.end.dateTime).getTime() + 60 * 60 * 1000;
      const hoursLeft = (currentTime - startTime.getTime()) / (60 * 60 * 1000);
      if (
        endTimeStamp < currentTime &&
        // Find the scheduled session corresponding to this event.
        ev.id in schedule &&
        "attendees" in ev &&
        Array.isArray(ev.attendees)
      ) {
        // Get the participant's email and order through the scheduled session.
        const participant = {
          email: schedule[ev.id].email.toLowerCase()
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          // We only need to check the past events for the participants.
          if (attendee.email.toLowerCase() === participant.email) {
            participant.responseStatus = attendee.responseStatus;
            // The only way to get the user data, like their firstname, which
            // sessions they have completed so far, ... is through "users"
            const userDocs = await getUserDocsfromEmail(attendee.email.toLowerCase());

            if (userDocs.docs.length > 0) {
              const userData = userDocs.docs[0].data();
              participant.firstname = userData.firstname;
              if (userData.course) {
                participant.courseName = userData.course;
              } else {
                participant.courseName = "";
              }
              if (userData.postQ2Choice) {
                participant.firstDone = true;
              } else {
                participant.firstDone = false;
              }
              if (userData.post3DaysQ2Choice) {
                participant.secondDone = true;
              } else {
                participant.secondDone = false;
              }
              if (userData.post1WeekQ2Choice) {
                participant.thirdDone = true;
              } else {
                participant.thirdDone = false;
              }

              // For project Annotating (survey) we will not have firstDone field in the participant
              // So if they missed they attended the first session that that means
              // the schedule object should have a hasStarted field

              const participantAttendedFirstSession =
                userData.project === "Annotating" ? schedule.attended : participant.firstDone;

              if (order === "1st" && !participantAttendedFirstSession) {
                // Then, we delete all their sessions from Google Calendar and
                // schedule then, send them an email asking them to reschedule
                // all their sessions.
                setTimeout(() => {
                  reschEventNotificationEmail(
                    participant.email,
                    participant.firstname,
                    false,
                    participant.courseName,
                    hoursLeft,
                    false,
                    attendee.responseStatus === "declined" || attendee.responseStatus === "tentative",
                    null
                  );
                }, waitTime);
                waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
              } else if (order === "3rd" && !participant.secondDone) {
                // If it's their 3rd session, but they did not complete their 2nd session:
                // Delete the 3rd session, because logically they should not go through
                // the 3rd session without completing the 2nd one .
                await deleteEvent(ev.id);
                // Also, remove the Calendar event id and order from their schedule doc.
                const scheduleRef = db.collection("schedule").doc(schedule[ev.id].schId);
                await scheduleRef.update({
                  id: FieldValue.delete(),
                  order: FieldValue.delete()
                });
              } else if (isToday(startTime)) {
                // Only if it is a 2nd/3rd session that was scheduled today, but they
                // missed it, we email them to reschedule their session on the same day;
                // otherwise, we will withdraw their application.
                if ((order === "2nd" && !participant.secondDone) || (order === "3rd" && !participant.thirdDone)) {
                  setTimeout(() => {
                    notAttendedEmail(participant.email, participant.firstname, false, participant.courseName, order);
                  }, waitTime);
                  waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log({ err });
    return null;
  }
};

// Deprecated
// exports.updateNotTakenSessions = async (context) => {
//   try {
//     const eventIds = [];
//     const allEvents = await futureEvents(40);
//     if (allEvents) {
//       const currentTime = new Date().getTime();
//       // attendee.responseStatus: 'accepted', 'needsAction', 'tentative', 'declined'
//       for (let ev of allEvents) {
//         eventIds.push(ev.id);
//         const notTakenSessionsRef = db
//           .collection("notTakenSessions")
//           .doc(ev.id);
//         const notTakenSessionsDoc = await notTakenSessionsRef.get();
//         if (!("attendees" in ev) || ev.attendees.length < 2) {
//           if (!notTakenSessionsDoc.exists) {
//             const startTime = new Date(ev.start.dateTime).getTime();
//             const endTime = new Date(ev.end.dateTime).getTime();
//             const hoursLeft = Math.floor(
//               (startTime - currentTime) / (60 * 60 * 1000)
//             );
//             let points = 7;
//             if (endTime > startTime + 40 * 60 * 1000) {
//               points = 16;
//             }
//             await batchSet(notTakenSessionsRef, {
//               start: new Date(ev.start.dateTime),
//               end: new Date(ev.end.dateTime),
//               id: ev.id,
//               hoursLeft,
//               points,
//             });
//           }
//         } else {
//           if (notTakenSessionsDoc.exists) {
//             await batchDelete(notTakenSessionsRef);
//           }
//         }
//       }
//     }
//     const notTakenSessionsDocs = await db.collection("notTakenSessions").get();
//     for (let notTakenSessionDoc of notTakenSessionsDocs.docs) {
//       if (!eventIds.includes(notTakenSessionDoc.id)) {
//         const notTakenSessionsRef = db
//           .collection("notTakenSessions")
//           .doc(notTakenSessionDoc.id);
//         await batchDelete(notTakenSessionsRef);
//       }
//     }
//     await commitBatch();
//   } catch (err) {
//     console.log({ err });
//   }
//   return null;
// };

exports.passagesNumberCorrection = async context => {
  try {
    const passageNumberOfParticipant = {};
    const usersDocs = await db.collection("users").get();
  
    usersDocs.forEach((userDoc) => {
      const userData = userDoc.data();
  
      const hasRequiredData =
        userData.explanations &&
        userData.explanations1Week &&
        userData.explanations3Days &&
        !userData.damagedDocument;
  
      if (hasRequiredData) {
        userData.pConditions.forEach((cond) => {
          const { project } = userData;
          const { passage, condition } = cond;
  
          if (!passageNumberOfParticipant[passage]) {
            passageNumberOfParticipant[passage] = {};
          }
  
          if (!passageNumberOfParticipant[passage][project]) {
            passageNumberOfParticipant[passage][project] = {};
          }
  
          if (!passageNumberOfParticipant[passage][project][condition]) {
            passageNumberOfParticipant[passage][project][condition] = 0;
          }
  
          passageNumberOfParticipant[passage][project][condition]++;
        });
      }
    });
    for (const passage in passageNumberOfParticipant) {
      const passageRef = db.collection("passages").doc(passage);
      const passageData = (await passageRef.get()).data();
      const projects = passageData.projects || {};
      for (const project in passageNumberOfParticipant[passage]) {
        projects[project] = passageNumberOfParticipant[passage][project];
      }
      await passageRef.update({ projects });
    }
    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};



exports.createTemFeedback = async (req, res) => {
  try {

      const { fullname, project } = req.body;
      if (!fullname || !project) {
        return res.status(500).send({
          message: "some parameters are missing"
        });
      }

      const feedbackCodesBooksDocs = await db.collection("feedbackCodeBooks").get();

      const previousIds = [];
      const feedbackCodesOrders = await db.collection("feedbackCodeOrderV2").where("project", "==", project).get();
      for (let feedbackCodeOrder of feedbackCodesOrders.docs) {
        const feedbackCodeOrderData = feedbackCodeOrder.data();
        previousIds.concat(feedbackCodeOrderData.codeIds);
      }

      const batch = db.batch();

      const approvedCodes = new Set();
      for (let codeDoc of feedbackCodesBooksDocs.docs) {
        const codeData = codeDoc.data();
        if (codeData.approved && !approvedCodes.has(codeData.code)) {
          approvedCodes.add(codeData.code);
        }
      }
      const passages = await db.collection("passages").where("projects", "array-contains", project).get();
      const passagesMap = {};
      for (const passage of passages.docs) {
        passagesMap[passage.id] = passage.data();
      }
      /* const passagesInH2K2 = [
        "zlS4Gh2AXaLZV7HM2oXd",
        "lmGQvzSit4LBTj1Zptot",
        "97D6P4unPYqzkpVeUY2c",
        "zbcUNl5593vOeChp1G8O",
        "UowdqbVHYMJ9Hhh5zNY3",
        "qOO4Yn9oyUthKaifSIl1",
        "6rc4k1su3txN6ZK4CJ0h",
        "xuNQUYbAEFfTD1PHuLGV",
        "s1oo3G4n3jeE8fJQRs3g"
      ]; */

      const feedbackCodes = await db
        .collection("feedbackCode")
        .where("project", "==", project)
        .where("approved", "==", false)
        .get();
      const feedbackCodesByParticipant = {};

      for (const feedbackCode of feedbackCodes.docs) {
        if (previousIds.includes(feedbackCode.id)) continue;
        const feedbackCodeData = feedbackCode.data();
        if (!feedbackCodesByParticipant[feedbackCodeData.fullname]) {
          feedbackCodesByParticipant[feedbackCodeData.fullname] = [];
        }
        feedbackCodesByParticipant[feedbackCodeData.fullname].push({
          docId: feedbackCode.id,
          session: feedbackCodeData.session,
          explanation: feedbackCodeData.explanation || ""
        });
      }
      const feedbackCodeIds = [];
      const feedbackCodeOrders = await db
        .collection("feedbackCodeOrderV2")
        .where("project", "==", project)
        .where("researcher", "==", fullname)
        .get();
      let feedbackCodeOrderRef;
      if (!feedbackCodeOrders.docs.length) {
        feedbackCodeOrderRef = db.collection("feedbackCodeOrderV2").doc();
      } else {
        feedbackCodeOrderRef = db.collection("feedbackCodeOrderV2").doc(feedbackCodeOrders.docs[0].id);
      }
      const feedbackCodeData = feedbackCodeOrders.docs.length
        ? feedbackCodeOrders.docs[0].data()
        : {
            project: project.trim(),
            researcher: fullname,
            codeIds: []
          };
      console.log("feedbackCodeIds", feedbackCodeIds);
      const codeIds = Array.from(new Set([...feedbackCodeIds, ...feedbackCodeData.codeIds]));

      if (codeIds.length <= 2) {
        for (let participant in feedbackCodesByParticipant) {
          for (const feedbackCode of feedbackCodesByParticipant[participant]) {
            const explanationWords = feedbackCode.explanation.split(" ").filter(w => w.trim());
            console.log(explanationWords);
            if (explanationWords.length < 4 || codeIds.includes(feedbackCode.docId)) {
              continue;
            }
            codeIds.push(feedbackCode.docId);
            if (codeIds.length > 5) {
              break;
            }
          }
          if (codeIds.length > 5) {
            break;
          }
        }
      }
      feedbackCodeData.codeIds = codeIds;

      if (feedbackCodeOrders.docs.length) {
        batch.update(feedbackCodeOrderRef, feedbackCodeData);
      } else {
        batch.set(feedbackCodeOrderRef, feedbackCodeData);
      }

      await batch.commit();
    
  } catch (error) {
    console.log({ error }, "error----------");
  }
};
