const { db } = require("../../admin");

const getGrades = (logs, phrase) => {
  let sentences = [];
  let botGrades = [];
  for (let logIdx in logs) {
    const phraseLogs = logs[logIdx];
    const phraseIdx = phraseLogs.findIndex(p => p.rubric_item === phrase);
    if (phraseIdx !== -1) {
      sentences = sentences.concat(phraseLogs[phraseIdx].sentences);
      botGrades.push(phraseLogs[phraseIdx].correct);
    }
  }

  return { sentences: Array.from(new Set(sentences)), botGrades };
};
const newId = () => {
  const doc = db.collection("recallGradesV2").doc();
  return doc.id;
};
module.exports = async (req, res) => {
  try {
    const { docId: fullname } = req.researcher;
    console.log("loadRecallGradesNumbers", fullname);
    let noMajority = [];
    let majorityDifferentThanBot = [];

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
      passagesHash[passageDoc.id] = passageDoc.data();
    });
    const logs = {};
    const logsDocs = await db.collection("recallGradesBotLogs").where("__name__", "==", "05KUJRngJzo2gPsx2Mya").get();

    logsDocs.forEach(doc => {
      logs[doc.id] = doc.data();
    });

    const recallGradesDocs = await db
      .collection("recallGradesV2")
      .where("__name__", "==", "05KUJRngJzo2gPsx2Mya")
      .get();
    for (let recallDoc of recallGradesDocs.docs) {
      const recallData = recallDoc.data();
      const documentlogs = logs[recallDoc.id] ? logs[recallDoc.id] : {};
      for (let session in recallData.sessions) {
        const sessionlogs =
          documentlogs.sessions && documentlogs.sessions[session] ? documentlogs.sessions[session] : {};
        for (let conditionIdx = 0; conditionIdx < recallData.sessions[session].length; conditionIdx++) {
          const conditionlogs = sessionlogs[conditionIdx] ? sessionlogs[conditionIdx] : {};
          const conditionItem = recallData.sessions[session][conditionIdx];
          const conditionIndex = recallData.sessions[session].indexOf(conditionItem);
          for (let phraseItem of conditionItem.phrases) {
            if (phraseItem.deleted) continue;
            const GPT4logs = conditionlogs.hasOwnProperty("gpt-4-0613") ? conditionlogs["gpt-4-0613"] : {};
            countPairPhrases++;

            const trueVotes = phraseItem.grades.filter(grade => grade).length;
            const falseVotes = phraseItem.grades.filter(grade => !grade).length;
            if (
              !phraseItem.hasOwnProperty("gpt-4-0613") &&
              phraseItem.satisfied &&
              phraseItem.researchers.length <= 2
            ) {
              notGrades++;
            }
            if (phraseItem.hasOwnProperty("gpt-4-0613") && phraseItem.satisfied && phraseItem.researchers.length <= 2) {
              countGraded++;
            }

            if (phraseItem.hasOwnProperty("gpt-4-0613") && !phraseItem.satisfied) {
              countNSatisfiedGraded++;
            }
            if (
              phraseItem.hasOwnProperty("gpt-4-0613") &&
              phraseItem.satisfied /* &&
              otherResearchers.length >= 2 */
            ) {
              countSatifiedGraded++;
            }
            if (!phraseItem.satisfied) {
              notSatisfied++;
            }
            if (phraseItem.researchers.length >= 2 && phraseItem.satisfied) {
              satisfiedThreeRes++;
            }
            const botGrade = phraseItem.hasOwnProperty("gpt-4-0613") ? phraseItem["gpt-4-0613"] : null;
            if (phraseItem.hasOwnProperty("gpt-4-0613")) {
              let inequality = false;
              if (phraseItem.hasOwnProperty("majority")) {
                if (phraseItem.majority !== botGrade) {
                  inequality = true;
                }
              } else if ((trueVotes >= 3 && !botGrade) || (falseVotes >= 3 && botGrade)) {
                inequality = true;
              }
              if (inequality) {
                majorityDifferentThanBot.push({
                  ...phraseItem,
                  botGrade,
                  response: conditionItem.response,
                  session: session,
                  condition: conditionIndex,
                  docId: recallDoc.id,
                  id: newId(),
                  originalPassage: passagesHash[conditionItem.passage].text,
                  passageTitle: passagesHash[conditionItem.passage].title,
                  passageId: conditionItem.passage,
                  ...getGrades(GPT4logs, phraseItem.phrase)
                });
              }
            }
            if (!phraseItem.hasOwnProperty("majority") && trueVotes === falseVotes && phraseItem.grades.length >= 4) {
              noMajority.push({
                ...phraseItem,
                botGrade,
                response: conditionItem.response,
                session: session,
                condition: conditionIndex,
                docId: recallDoc.id,
                originalPassage: passagesHash[conditionItem.passage].text
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
