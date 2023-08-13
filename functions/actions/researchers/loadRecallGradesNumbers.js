const { db } = require("../../admin");

module.exports = async (req, res) => {
  try {
    console.log("loadRecallGradesNumbers");
    let noMajority = [];
    let majorityDifferentThanBot = [];
    const gptResearcher = "Iman YeckehZaare";
    //records that the bot should grade (remaining ) : their boolean expressions are satisfied and less than 2  researchers graded them
    let countGraded = 0;
    //number of records it's already graded : their boolean expressions are satisfied and  less than 2 researchers graded them
    let notGrades = 0;
    // # of phrases that the bot has graded and their boolean expressions are not satisfied
    let countNSatisfiedGraded = 0;
    //# of phrases that the bot has graded and their boolean expressions are satisfied and 2 or more researchers graded them
    let countSatifiedGraded = 0;
    //# of phrases that their boolean expressions are not satisfied
    let notSatisfied = 0;
    //# of phrases that their boolean expressions are satisfied and 2 or more researchers graded them
    let satisfiedThreeRes = 0;

    //Total # of phrases
    let countPairPhrases = 0;
    const passagesHash = {};
    const passageDocs = await db.collection("passages").get();
    passageDocs.forEach(passageDoc => {
      passagesHash[passageDoc.id] = passageDoc.data().text;
    });
    const recallGradesDocs = await db.collection("recallGradesV2").get();
    for (let recallDoc of recallGradesDocs.docs) {
      const recallData = recallDoc.data();

      for (let session in recallData.sessions) {
        for (let conditionItem of recallData.sessions[session]) {
          const conditionIndex = recallData.sessions[session].indexOf(conditionItem);
          for (let phraseItem of conditionItem.phrases) {
            const phraseIndex = conditionItem.phrases.indexOf(phraseItem);
            countPairPhrases++;
            const researcherIdx = phraseItem.researchers.indexOf(gptResearcher);
            let otherResearchers = phraseItem.researchers.slice();
            let otherGrades = phraseItem.grades.slice();
            if (researcherIdx !== -1) {
              otherResearchers.splice(researcherIdx, 1);
              otherGrades.splice(researcherIdx, 1);
            }
            const trueVotes = otherGrades.filter(grade => grade).length;
            const falseVotes = otherGrades.filter(grade => !grade).length;
            if (!phraseItem.hasOwnProperty("GPT4-jun") && phraseItem.satisfied && otherResearchers.length <= 2) {
              notGrades++;
            }
            if (phraseItem.hasOwnProperty("GPT4-jun") && phraseItem.satisfied && otherResearchers.length <= 2) {
              countGraded++;
            }

            if (phraseItem.hasOwnProperty("GPT4-jun") && !phraseItem.satisfied) {
              countNSatisfiedGraded++;
            }
            if (
              phraseItem.hasOwnProperty("GPT4-jun") &&
              phraseItem.satisfied /* &&
              otherResearchers.length >= 2 */
            ) {
              countSatifiedGraded++;
            }
            if (!phraseItem.satisfied) {
              notSatisfied++;
            }
            if (otherResearchers.length >= 2 && phraseItem.satisfied) {
              satisfiedThreeRes++;
            }
            const botGrade = phraseItem.hasOwnProperty("GPT4-jun") ? phraseItem["GPT4-jun"] : null;
            if (!phraseItem.hasOwnProperty("majority") && phraseItem.hasOwnProperty("GPT4-jun")) {
              if ((trueVotes >= 3 && !botGrade) || (falseVotes >= 3 && botGrade)) {
                majorityDifferentThanBot.push({
                  ...phraseItem,
                  botGrade,
                  grades: otherGrades,
                  Response: conditionItem.response,
                  session: session,
                  condition: conditionIndex,
                  id: recallDoc.id,
                  originalPassgae: passagesHash[conditionItem.passage],
                  phraseIndex
                });
              }
            }
            if (!phraseItem.hasOwnProperty("majority") && trueVotes === falseVotes && otherGrades.length >= 4) {
              noMajority.push({
                ...phraseItem,
                botGrade,
                grades: otherGrades,
                Response: conditionItem.response,
                session: session,
                condition: conditionIndex,
                id: recallDoc.id,
                originalPassgae: passagesHash[conditionItem.passage],
                phraseIndex
              });
            }
          }
        }
      }
    }

    noMajority = noMajority.filter(gradeMajority => gradeMajority.grades.length !== 0);
    majorityDifferentThanBot = majorityDifferentThanBot.filter(gradeMajority => gradeMajority.grades.length !== 0);

    return res.status(200).send({
      noMajority,
      majorityDifferentThanBot,
      notGrades,
      countGraded,
      countNSatisfiedGraded,
      countSatifiedGraded,
      notSatisfied,
      satisfiedThreeRes,
      countPairPhrases
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error
    });
  }
};
