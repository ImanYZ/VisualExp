const { db } = require("../../admin");

const updateGradingPoints = (
  upVoteResearchers,
  downVoteResearchers,
  recallData,
  upVotePoint,
  downVotePoint,
  researchersUpdates
) => {
  const updatePoints = (researcher, project, votePoint) => {
    if (researchersUpdates[researcher].projects.hasOwnProperty(project)) {
      let { gradingPoints = 0, negativeGradingPoints = 0 } = researchersUpdates[researcher].projects[project];
      gradingPoints += votePoint;
      if (votePoint < 0) {
        negativeGradingPoints += Math.abs(votePoint);
      }
      researchersUpdates[researcher].projects[project].gradingPoints = gradingPoints;
      researchersUpdates[researcher].projects[project].negativeGradingPoints = negativeGradingPoints;
    }
  };

  upVoteResearchers.forEach(researcher => {
    updatePoints(researcher, recallData.project, upVotePoint);
    updatePoints(researcher, "Autograding", upVotePoint);
  });

  downVoteResearchers.forEach(researcher => {
    updatePoints(researcher, recallData.project, downVotePoint);
    updatePoints(researcher, "Autograding", downVotePoint);
  });
};

module.exports = async (req, res) => {
  try {
    console.log("voteOnSingleRecall", req.body);
    const { session, condition, phrase, documentId } = req.body;
    const { docId: researcher } = req.researcher;
    const gptResearcher = "Iman YeckehZaare";
    await db.runTransaction(async t => {
      let transactionWrites = [];
      const recallRef = db.collection("recallGradesV2").doc(documentId);
      const recallDoc = await t.get(recallRef);
      const researchers = await t.get(db.collection("researchers"));
      let researchersUpdates = {};
      for (const researcher of researchers.docs) {
        const researcherData = researcher.data();
        researchersUpdates[researcher.id] = researcherData;
      }
      const recallData = recallDoc.data();
      const conditionItems = recallData.sessions[session];
      const conditionItem = conditionItems.find(item => item.condition === condition);
      const phraseItem = conditionItem.phrases.find(item => item.phrase === phrase);
      const researcherIndex = phraseItem.researchers.indexOf(researcher);
      const docResearchers = [...phraseItem.researchers];
      const docGrades = [...phraseItem.grades];
      const gptIdx = docResearchers.indexOf(gptResearcher);
      if (gptIdx !== -1) {
        docResearchers.splice(gptIdx, 1);
        docGrades.splice(gptIdx, 1);
      }
      if (researcherIndex === -1) {
        phraseItem.researchers.push(researcher);
        phraseItem.grades.push(req.body.grade);
        docGrades.push(req.body.grade);
        docResearchers.push(researcher);
        const previousGrades = {
          // sum of previous up votes from all researchers
          upVotes: docGrades.reduce((c, g) => c + (g === true ? 1 : 0), 0),
          // sum of previous up votes from all researchers
          downVotes: docGrades.reduce((c, g) => c + (g === false ? 1 : 0), 0)
        };
        if (previousGrades.upVotes >= 3 || previousGrades.downVotes >= 3) {
          phraseItem.previousGrades = previousGrades;
          const upVoteResearchers = [];
          const downVoteResearchers = [];
          for (let r = 0; r < docGrades.length; r++) {
            if (docResearchers[r] === gptResearcher) {
              continue;
            }
            if (docGrades[r]) {
              upVoteResearchers.push(docResearchers[r]);
            } else {
              downVoteResearchers.push(docResearchers[r]);
            }
          }
          let upVotePoint = 0.5;
          let downVotePoint = -0.5;
          if (previousGrades.upVotes < previousGrades.downVotes) {
            upVotePoint = -0.5;
            downVotePoint = 0.5;
          }
          updateGradingPoints(
            upVoteResearchers,
            downVoteResearchers,
            recallData,
            upVotePoint,
            downVotePoint,
            researchersUpdates
          );
          for (const researcherId in researchersUpdates) {
            const researcherRef = db.collection("researchers").doc(researcherId);
            transactionWrites.push({
              type: "update",
              refObj: researcherRef,
              updateObj: researchersUpdates[researcherId]
            });
          }
        }
      } else {
        phraseItem.grades[researcherIndex] = req.body.grade;
      }
      transactionWrites.push({
        type: "update",
        refObj: recallRef,
        updateObj: { sessions: recallData.sessions }
      });

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
    res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
  }
};
