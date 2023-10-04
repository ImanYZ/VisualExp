const { db } = require("../../admin");
const { Timestamp } = require("firebase-admin/firestore");

const { assignExpPoints } = require("../../helpers/assignExpPoints");
const { calculateViewers } = require("../../helpers/passage");

const {
  updateGradingPointsForResearchers,
  getRecallResponse,
  incrementGradingNum,
  convertToVotesByPhrasesFunction,
  separateResearchersByVotes
} = require("../../helpers/grading-recalls");

module.exports = async (req, res) => {
  try {
    console.log("grade recalls");
    const { recallGrade, voterProject } = req.body;
    const { docId: fullname } = req.researcher;

    const { researcher } = req;

    if (!recallGrade || !voterProject) {
      return res.status(500).send({
        message: "some parameters are missing"
      });
    }

    const { session, condition } = recallGrade;

    await db.runTransaction(async t => {
      let transactionWrites = [];
      // loading user data from recall grade document
      const recallGradeDoc = await t.get(db.collection("recallGradesV2").doc(recallGrade.docId));
      const recallGradeData = recallGradeDoc.data();

      // loading user data from user document
      const user = await t.get(db.collection("users").doc(recallGradeData.user));
      let userUpdates = user.data();
      let userUpdate = false;

      // updating gradingNum for the researcher for this project
      // And for autograding
      incrementGradingNum(researcher, recallGradeData.project);
      incrementGradingNum(researcher, "Autograding");

      const conditionIdx = recallGradeData.sessions[session].findIndex(
        conditionItem => conditionItem.condition === condition
      );
      if (conditionIdx === -1) {
        throw new Error("unknown condition supplied");
      }

      const conditionUpdates = recallGradeData.sessions[session][conditionIdx];

      let researchersUpdates = {};
      let updatedResearchers = [];

      //load Researchers
      const researchers = await t.get(db.collection("researchers"));

      for (const _researcher of researchers.docs) {
        const researcherData = _researcher.data();
        researchersUpdates[_researcher.id] = researcherData;
      }
      // adding gradingNum

      researchersUpdates[researcher.docId].projects = researcher.projects;
      updatedResearchers.push(researcher.docId);

      // there should be 4 down/no votes or up/yes votes to consider phrase approval
      const votesByPhrases = convertToVotesByPhrasesFunction(conditionUpdates, recallGrade, fullname);

      // phrases considered as approved
      const phrasesApproval = Object.keys(votesByPhrases).filter(
        phrase => votesByPhrases[phrase].upVotes >= 3 || votesByPhrases[phrase].downVotes >= 3
      );

      // distribute points to participants
      if (phrasesApproval.length) {
        for (let phraseApproval of phrasesApproval) {
          const votesOfPhrase = votesByPhrases[phraseApproval];

          // we are only processing points when we have 4 researchers voted on phrase
          // if document already had 4 researchers or phrase was approve, we don't continue calculations
          if (votesOfPhrase.researchers.length !== 4 || votesOfPhrase.previousResearcher >= 4) continue;

          let recallResponse = getRecallResponse(session);

          const passageIdx = (userUpdates?.pConditions || []).findIndex(
            conditionItem => conditionItem.passage === recallGrade.passage
          );
          if (passageIdx !== -1) {
            userUpdate = true;
            // The only piece of the user data that should be modified is
            // pCondition based on the point received.
            let grades = 1;
            if (userUpdates.pConditions?.[passageIdx]?.[recallResponse]) {
              // We should add up points here because each free recall response
              // may get multiple points from each of the key phrases identified
              // in it.
              grades += userUpdates.pConditions[passageIdx][recallResponse];
            }

            userUpdates.pConditions[passageIdx][recallResponse] = grades;

            // Depending on how many key phrases were in the passage, we should
            // calculate the free-recall response ratio.
            userUpdates.pConditions[passageIdx][`${recallResponse}Ratio`] = parseFloat(
              (grades / conditionUpdates.phrases.length).toFixed(2)
            );
          }
          const { upVoteResearchers, downVoteResearchers } = separateResearchersByVotes(votesOfPhrase);

          let upVotePoint = 0.5;
          let downVotePoint = -0.5;
          if (votesOfPhrase.upVotes < votesOfPhrase.downVotes) {
            upVotePoint = -0.5;
            downVotePoint = 0.5;
          }

          // updating points for researchers who upvoted or downvoted on this phrase
          updateGradingPointsForResearchers(researchersUpdates, upVoteResearchers, recallGradeData, upVotePoint);
          updateGradingPointsForResearchers(researchersUpdates, downVoteResearchers, recallGradeData, downVotePoint);

          updatedResearchers.push(...votesOfPhrase.researchers);
          updatedResearchers = [...new Set(updatedResearchers)];
        }
      }

      recallGradeData.viewers = await calculateViewers(recallGradeData);

      transactionWrites.push({
        type: "update",
        refObj: recallGradeDoc.ref,
        updateObj: recallGradeData
      });

      // updating participant points if required
      if (userUpdate) {
        const userRef = db.collection("users").doc(recallGradeData.user);
        transactionWrites.push({
          type: "update",
          refObj: userRef,
          updateObj: userUpdates
        });
      }
      const recallGradeLogRef = db.collection("recallGradesLogs").doc();
      transactionWrites.push({
        type: "set",
        refObj: recallGradeLogRef,
        updateObj: {
          createdAt: Timestamp.fromDate(new Date()),
          researcher: fullname,
          gradingNum: 1,
          project: recallGradeData.project
        }
      });

      let readyRecalls = true;
      for (let recall of recallGradeData.sessions[session]) {
        if (!recall.researchers.includes(fullname)) {
          readyRecalls = false;
          break;
        }
      }
      if (readyRecalls) {
        await assignExpPoints({
          researcher,
          participant: recallGradeData.user,
          session,
          project: voterProject,
          recallGradeData,
          feedbackCodeData: null,
          transactionWrites: transactionWrites,
          researchersUpdates,
          t
        });
      }
      // updating points for researchers if required
      for (const researcherId in researchersUpdates) {
        if (!updatedResearchers.includes(researcherId)) {
          continue;
        }
        const researcherRef = db.collection("researchers").doc(researcherId);
        transactionWrites.push({
          type: "update",
          refObj: researcherRef,
          updateObj: researchersUpdates[researcherId]
        });
      }

      for (const transactionWrite of transactionWrites) {
        if (transactionWrite.type === "update") {
          t.update(transactionWrite.refObj, transactionWrite.updateObj);
        } else if (transactionWrite.type === "set") {
          t.set(transactionWrite.refObj, transactionWrite.updateObj);
        } else if (transactionWrite.type === "delete") {
          t.delete(transactionWrite.refObj);
        }
      }
    });

    return res.status(200).json({
      message: "grade recalls updated"
    });
  } catch (e) {
    console.log(e, "error");
    res.status(500).send({
      message: "Error Occurred, please try again later."
    });
  }
};
