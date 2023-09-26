const { db } = require("../admin");

const { replaceNewLogs, ObjectToArray, ArrayToObject } = require("../helpers/grading-recalls");

const countMajority = (acc, cur, phrase) => {
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

const reduceGradeTemp = (responseLogs, phrase) => {
  const gptMajority = responseLogs.reduce((acc, cur) => countMajority(acc, cur, phrase), []);
  if (gptMajority.length === 0) return null;

  if (gptMajority.filter(e => e === "yes").length >= 2) {
    return true;
  }

  if (gptMajority.filter(e => e === "no").length >= 3) {
    return false;
  }
};
module.exports = async (req, res) => {
  try {
    const { docId, session, condition, phrases, responseLogs } = req.body;
    console.log("save recall logs", docId);
    console.log(req.body);
    await db.runTransaction(async t => {
      console.log("updating...");
      let recallGradeDoc = await t.get(db.collection("recallGradesV2").doc(docId));
      const recallGradeUpdate = recallGradeDoc.data();

      const logsRef = db.collection("recallGradesBotLogs").doc(docId);
      const previousLogDoc = await t.get(logsRef);

      const conditionItem = recallGradeUpdate.sessions[session][condition];
      conditionItem.gradedByAssistant = true;
      for (let _phrase of phrases) {
        const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === _phrase.phrase && !p.deleted);

        conditionItem.phrases[phraseIndex].satisfied = true;

        const gpt4grade = reduceGradeTemp(responseLogs, _phrase);

        if (gpt4grade !== null) {
          conditionItem.phrases[phraseIndex]["gpt-4-0613"] = gpt4grade;
        }
      }

      let previousLogData = { sessions: {} };
      if (previousLogDoc.exists) {
        previousLogData = previousLogDoc.data();
      }

      if (!previousLogData.sessions.hasOwnProperty(session)) {
        previousLogData.sessions[session] = {};
      }
      if (!previousLogData.sessions.hasOwnProperty(session)) {
        previousLogData.sessions[session] = {};
      }

      const sessionItem = previousLogData.sessions[session];

      if (sessionItem.hasOwnProperty(condition)) {
        const previousPhrasesGpt4 = session[condition]["gpt-4-0613"];

        const resultResponses = replaceNewLogs({
          prevLogs: ObjectToArray(previousPhrasesGpt4),
          newLogs: responseLogs
        });

        sessionItem[condition]["gpt-4-0613"] = ArrayToObject(resultResponses);
      } else {
        sessionItem[condition] = {
          "gpt-4-0613": ArrayToObject(responseLogs)
        };
      }

      t.update(recallGradeDoc.ref, recallGradeUpdate);
      if (previousLogDoc.exists) {
        t.update(logsRef, previousLogData);
      } else {
        t.set(logsRef, previousLogData);
      }
    });
    return res.status(200).send({ message: "updated Logs successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "error occurred",
      error
    });
  }
};
