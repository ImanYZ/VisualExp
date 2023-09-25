const { db } = require("../../admin");
const {
  gradeSinglePhrase,
  replaceNewLogs,
  ObjectToArray,
  ArrayToObject,
  reduceGrade
} = require("../../helpers/grading-recalls");

module.exports = async (req, res) => {
  try {
    console.log("GRADE GPT");
    const { docId, session, condition, phrase, response, passageTitle, originalPassage } = req.body.record;

    await db.runTransaction(async t => {
      const recallGradeDoc = await t.get(db.collection("recallGradesV2").doc(docId));
      const previousLogDoc = await t.get(db.collection("recallGradesBotLogs").doc(docId));
      const recallGradeData = recallGradeDoc.data();
      const previousLogData = previousLogDoc.data();
      const { response_array_gpt4 } = await gradeSinglePhrase({ phrase, response, passageTitle, originalPassage });

      //Update the phrase recalls Logs
      if (!previousLogData.sessions.hasOwnProperty(session)) {
        previousLogData.sessions[session] = {};
      }
      const sessionItem = previousLogData.sessions[session];
      if (sessionItem.hasOwnProperty(condition)) {
        const previousPhrasesGpt4 = session[condition]["gpt-4-0613"];
        const resultResponses = replaceNewLogs({
          prevLogs: ObjectToArray(previousPhrasesGpt4),
          newLogs: response_array_gpt4
        });
        session[condition]["gpt-4-0613"] = ArrayToObject(resultResponses);
      } else {
        session[condition] = {
          "gpt-4-0613": ArrayToObject(response_array_gpt4)
        };
      }

      const conditionItem = recallGradeData.sessions[session][condition];
      const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === phrase && !p.deleted);
      const gpt4grade = reduceGrade(response_array_gpt4, phrase);
      if (gpt4grade !== null) {
        conditionItem.phrases[phraseIndex]["gpt-4-0613"] = gpt4grade;
        t.update(recallGradeDoc.ref, recallGradeData);
        t.update(previousLogDoc.ref, previousLogData);
        return res.status(200).send({ grade: gpt4grade, logs: response_array_gpt4 });
      } else {
        return res.status(500).send({ error: "GPT4 grade is null" });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};
