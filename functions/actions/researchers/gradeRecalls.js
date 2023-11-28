const { dbReal } = require("../../admin_real");
const { db } = require("../../admin");
const { incrementGradingNum } = require("../../helpers/grading-recalls");

module.exports = async (req, res) => {
  try {
    console.log("grade recalls");
    const { recallGrade, voterProject } = req.body;
    const { docId: fullname } = req.researcher;
    if (!recallGrade || !voterProject) {
      return res.status(500).send({
        message: "some parameters are missing"
      });
    }
    /*
    update the recall grades accoding to the vote of the researcher 
    */
    const { session, conditionIdx, phrases } = recallGrade;
    const recallGradeRef = dbReal.ref(`/recallGradesV2/${recallGrade.docId}/sessions/${session}/${conditionIdx}`);
    await recallGradeRef.transaction(conditionUpdates => {
      if (conditionUpdates !== null) {
        for (let phrase of phrases) {
          const researcherIdx = (phrase.researchers || []).indexOf(fullname);
          const grade = !!(phrase.grades || [])[researcherIdx];
          const phraseIdx = conditionUpdates.phrases.findIndex(p => p.phrase === phrase.phrase && !p.deleted);
          conditionUpdates.phrases[phraseIdx].researchers = [...new Set([...phrase.researchers, fullname])];
          conditionUpdates.phrases[phraseIdx].grades = [...(conditionUpdates.phrases[phraseIdx].grades || []), grade];
        }
      }
      return conditionUpdates;
    });
    const researcherDoc = await db.collection("researchers").doc(fullname).get();
    const researcherData = researcherDoc.data();
    incrementGradingNum(researcherData, recallGrade.project);
    incrementGradingNum(researcherData, "Autograding");

    const recallGradeLogRef = db.collection("recallGradesLogs").doc();
    await recallGradeLogRef.set({
      createdAt: new Date(),
      researcher: fullname,
      gradingNum: 1,
      project: recallGrade.project
    });
    await researcherDoc.ref.update(researcherData);

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

// TO-DO: move this to the pub-sub =: calculate-recall-grades-points.js

// const phrasesApproval = Object.keys(votesByPhrases).filter(
//   phrase => votesByPhrases[phrase].upVotes >= 3 || votesByPhrases[phrase].downVotes >= 3
// );
// for (let phraseApproval of phrasesApproval || []) {
//   const votesOfPhrase = votesByPhrases[phraseApproval];

//   // we are only processing points when we have 4 researchers voted on phrase
//   // if document already had 4 researchers or phrase was approve, we don't continue calculations
//   if (votesOfPhrase.researchers.length !== 4 || votesOfPhrase.previousResearcher >= 4) continue;

//   let recallResponse = getRecallResponse(session);

//   const passageIdx = (userUpdates?.pConditions || []).findIndex(
//     conditionItem => conditionItem.passage === recallGrade.passage
//   );
//   if (passageIdx !== -1) {
//     userUpdate = true;
//     // The only piece of the user data that should be modified is
//     // pCondition based on the point received.
//     let grades = 1;
//     if (userUpdates.pConditions?.[passageIdx]?.[recallResponse]) {
//       // We should add up points here because each free recall response
//       // may get multiple points from each of the key phrases identified
//       // in it.
//       grades += userUpdates.pConditions[passageIdx][recallResponse];
//     }

//     userUpdates.pConditions[passageIdx][recallResponse] = grades;

//     // Depending on how many key phrases were in the passage, we should
//     // calculate the free-recall response ratio.
//     userUpdates.pConditions[passageIdx][`${recallResponse}Ratio`] = parseFloat(
//       (grades / conditionUpdates.phrases.length).toFixed(2)
//     );
//   }
// }

// let readyRecalls = true;
// for (let recall of recallGradeData.sessions[session]) {
//   if (!(recall.researchers || []).includes(fullname)) {
//     readyRecalls = false;
//     break;
//   }
// }
// if (readyRecalls) {
//   await assignExpPoints({
//     researcher,
//     participant: recallGradeData.user,
//     session,
//     project: voterProject,
//     recallGradeData,
//     feedbackCodeData: null,
//     transactionWrites: transactionWrites,
//     researchersUpdates,
//     t
//   });
// }
