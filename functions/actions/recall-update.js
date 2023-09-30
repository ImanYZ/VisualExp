const { db } = require("../admin");

const { replaceNewLogs, ObjectToArray, ArrayToObject } = require("../helpers/grading-recalls");

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
};
const updateGrades = ({
  phrasesToGrade,
  recallGradeUpdate,
  session,
  conditionIndex,
  responseLogsGPT4,
  responseLogsGPT3_5
}) => {
  const conditionItem = recallGradeUpdate.sessions[session][conditionIndex];
  for (let _phrase of phrasesToGrade) {
    const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === _phrase.phrase && !p.deleted);

    const gpt4grade = countMajority(responseLogsGPT4, _phrase);
    const gpt3_5grade = countMajority(responseLogsGPT3_5, _phrase);

    if (gpt4grade !== null) {
      conditionItem.phrases[phraseIndex]["gpt-4-0613"] = gpt4grade;
    }
    if (gpt3_5grade !== null) {
      conditionItem.phrases[phraseIndex]["gpt-3.5-turbo-16k-0613"] = gpt3_5grade;
    }
  }
};

const updateLogs = ({ previousLogData, conditionIndex, session, responseLogsGPT4 }) => {
  if (!previousLogData.sessions.hasOwnProperty(session)) {
    previousLogData.sessions[session] = {};
  }

  const sessionItem = previousLogData.sessions[session];
  if (sessionItem.hasOwnProperty(conditionIndex)) {
    const previousPhrasesGpt4 = sessionItem[conditionIndex]["gpt-4-0613"];

    const resultLogsGpt4 = replaceNewLogs({
      prevLogs: ObjectToArray(previousPhrasesGpt4),
      newLogs: responseLogsGPT4
    });

    sessionItem[conditionIndex]["gpt-4-0613"] = ArrayToObject(resultLogsGpt4);
  } else {
    sessionItem[conditionIndex] = {
      "gpt-4-0613": ArrayToObject(responseLogsGPT4)
    };
  }
  return previousLogData;
};

module.exports = async (req, res) => {
  try {
    const { docId, recallGrade } = req.body;
    console.log("save recall logs", docId);
    console.log(req.body);
    await db.runTransaction(async t => {
      console.log("updating...");
      const recallGradeRef = db.collection("recallGradesV2").doc(docId);
      let recallGradeDoc = await t.get(recallGradeRef);
      const recallGradeUpdate = recallGradeDoc.data();

      const logsRef = db.collection("recallGradesBotLogs").doc(docId);
      const previousLogDoc = await t.get(logsRef);

      let previousLogData = { sessions: {} };
      if (previousLogDoc.exists) {
        previousLogData = previousLogDoc.data();
      }

      updateGrades({
        phrasesToGrade: recallGrade.phrasesToGrade,
        recallGradeUpdate,
        session: recallGrade.session,
        conditionIndex: recallGrade.conditionIndex,
        responseLogsGPT4: recallGrade.gpt4
      });

      console.log("updated Firebase document successfully");

      updateLogs({
        previousLogData,
        conditionIndex: recallGrade.conditionIndex,
        session: recallGrade.session,
        responseLogsGPT4: recallGrade.gpt4
      });

      console.log("updated Logs document successfully");

      t.update(recallGradeDoc.ref, recallGradeUpdate);
      if (previousLogDoc.exists) {
        t.update(logsRef, { ...previousLogData, updatedAt: new Date() });
      } else {
        t.set(logsRef, { ...previousLogData, createdAt: new Date() });
      }

      console.log("updated Logs successfully", docId);
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
