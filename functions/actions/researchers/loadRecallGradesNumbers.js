const { db } = require("../../admin");
const { dbReal } = require("../../admin_real");
const { ObjectToArray } = require("../../helpers/grading-recalls");

const getGrades = (logs, phrase) => {
  let sentences = [];
  let botGrades = [];
  let whyIncorect = [];
  for (let log of logs) {
    const phraseIdx = log.findIndex(p => p.rubric_item === phrase);
    if (phraseIdx !== -1) {
      sentences = sentences.concat((log[phraseIdx]?.sentences || []).map(s => s));
      botGrades.push(log[phraseIdx].correct);
      if (log[phraseIdx].why_incorrect) {
        whyIncorect.push(log[phraseIdx].why_incorrect);
      }
    }
  }

  return { sentences: Array.from(new Set(sentences)), botGrades, whyIncorect: Array.from(new Set(whyIncorect)) };
};

const reduceHelper = (acc, cur, phrase) => {
  const phraseResponseIdx = cur.findIndex(p => p.rubric_item === phrase.phrase);
  if (phraseResponseIdx !== -1) {
    if (cur[phraseResponseIdx].correct.toLowerCase() === "yes") {
      acc.push("yes");
    } else if (cur[phraseResponseIdx].correct.toLowerCase() === "no") {
      acc.push("no");
    }
  }
  return acc;
};
const countMajority = (responseLogs, phrase) => {
  const gptMajority = responseLogs.reduce((acc, cur) => reduceHelper(acc, cur, phrase), []);
  if (gptMajority.length === 0) return null;

  if (gptMajority.filter(e => e === "yes").length >= 2) {
    return true;
  }

  if (gptMajority.filter(e => e === "no").length >= 3) {
    return false;
  }
  return null;
};

const newId = () => {
  const doc = db.collection("recallGradesV2").doc();
  return doc.id;
};

const getMajority = (phrase, upvotes, downvotes) => {
  if (phrase.hasOwnProperty("majority")) {
    return phrase.majority;
  }
  if (upvotes < 3 && downvotes < 3) return null;

  return upvotes > downvotes;
};
module.exports = async (req, res) => {
  try {
    const { docId: fullname } = req.researcher;
    console.log("loadRecallGradesNumbers", fullname);
    let noMajority = [];
    let majorityDifferentThanBot = [];

    const passagesHash = {};
    const passageDocs = await db.collection("passages").get();
    passageDocs.forEach(passageDoc => {
      passagesHash[passageDoc.id] = passageDoc.data();
    });
    const logsDoc = await dbReal.ref("/recallGradesGPTLogs").once("value");

    const phrasesPassage = {};

    const passagesDocs = await db.collection("passages").get();

    for (let passageDoc of passagesDocs.docs) {
      phrasesPassage[passageDoc.id] = [...(passageDoc.data().phrases || [])];
    }

    const logs = logsDoc.val();
    console.log("loaded logs");
    const recallGradesDocs = await db.collection("recallGradesV2").get();
    console.log("loaded data");
    for (let recallDoc of recallGradesDocs.docs) {
      const recallData = recallDoc.data();
      const documentlogs = logs[recallDoc.id] || {};
      const sessionsLogs = documentlogs?.sessions || {};
      for (let session in recallData.sessions) {
        const sessionLogs = sessionsLogs[session] || {};
        for (let conditionIdx = 0; conditionIdx < recallData.sessions[session].length; conditionIdx++) {
          const conditionLogs = sessionLogs ? sessionLogs[conditionIdx] : null;
          const conditionItem = recallData.sessions[session][conditionIdx];
          const conditionIndex = recallData.sessions[session].indexOf(conditionItem);
          const gpt4Logs = ObjectToArray(conditionLogs ? conditionLogs.gpt4 : {});
          const countedPhrases = phrasesPassage[conditionItem.passage];
          for (let phraseItem of conditionItem.phrases) {
            if (phraseItem.deleted || !countedPhrases.includes(phraseItem.phrase)) continue;

            const trueVotes = phraseItem.grades.filter(grade => grade).length;
            const falseVotes = phraseItem.grades.filter(grade => !grade).length;
            const { botGrades, sentences, whyIncorect } = getGrades(gpt4Logs, phraseItem.phrase);

            const botGrade = countMajority(gpt4Logs, phraseItem);

            if (botGrade !== null) {
              let majority = getMajority(phraseItem, trueVotes, falseVotes);
              if (majority !== null && majority !== botGrade) {
                majorityDifferentThanBot.push({
                  ...phraseItem,
                  majority,
                  botGrade,
                  response: conditionItem.response,
                  session: session,
                  condition: conditionIndex,
                  docId: recallDoc.id,
                  id: newId(),
                  originalPassage: passagesHash[conditionItem.passage].text,
                  passageTitle: passagesHash[conditionItem.passage].title,
                  passageId: conditionItem.passage,
                  whyIncorect,
                  sentences,
                  botGrades
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
                id: newId(),
                originalPassage: passagesHash[conditionItem.passage].text
              });
            }
          }
        }
      }
    }

    noMajority = noMajority.filter(gradeMajority => gradeMajority.grades.length !== 0);
    majorityDifferentThanBot = majorityDifferentThanBot
      .filter(gradeMajority => gradeMajority.grades.length !== 0)
      .sort((a, b) => {
        if (a.hasOwnProperty("majority") && !b.hasOwnProperty("majority")) {
          return 1;
        }
        if (!a.hasOwnProperty("majority") && b.hasOwnProperty("majority")) {
          return -1;
        }
        return 0;
      });

    return res.status(200).send({
      noMajority,
      majorityDifferentThanBot
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error
    });
  }
};
