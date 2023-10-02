const { db } = require("../../admin");

const { dbReal } = require("../../admin_real");
const { filterItemsByRubric, ArrayToObject } = require("../../helpers/grading-recalls");

const replacePhraseInLogs = (array, oldphrase, newphrase) => {
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (item.hasOwnProperty("rubric_item") && (item?.rubric_item || "").trim() === oldphrase) {
      item.rubric_item = newphrase;
    }
  }
};

const replaceLogs = ({ resetGradesGPT, conditionlogs, selectedPhrase, newPhrase }) => {
  if (resetGradesGPT) {
    conditionlogs = conditionlogs.map(subarray => filterItemsByRubric(subarray, [selectedPhrase]));
  } else {
    conditionlogs = conditionlogs.map(subarray => replacePhraseInLogs(subarray, selectedPhrase, newPhrase));
  }
};

module.exports = async (req, res) => {
  try {
    console.log("updatePhraseForPassage");
    const { passagTitle, selectedPhrase, newPhrase, resetGrades, resetGradesGPT } = req.body;
    const passageQuery = db.collection("passages").where("title", "==", passagTitle);
    const passageSnapshot = await passageQuery.get();
    const passageDoc = passageSnapshot.docs[0];
    const passageUpdate = { ...passageDoc.data() };
    passageUpdate.phrases[passageUpdate.phrases.indexOf(selectedPhrase)] = newPhrase;
    const updateTasks = [];

    updateTasks.push(
      passageDoc.ref.update({
        phrases: passageUpdate.phrases
      })
    );
    const recallsDocs = await db.collection("recallGradesV2").where("passages", "array-contains", passageDoc.id).get();
    const booleanExpressionsDocs = await db.collection("booleanScratch").where("phrase", "==", selectedPhrase).get();
    console.log("got the recall query");
    for (let recallDoc of recallsDocs.docs) {
      const recallData = recallDoc.data();
      let sessions = recallData.sessions;
      let needUpdate = false;

      for (let session in sessions) {
        for (let conditionItem of sessions[session]) {
          for (let phraseItem of conditionItem.phrases) {
            if (phraseItem.phrase === selectedPhrase && !phraseItem.deleted) {
              needUpdate = true;
              phraseItem.phrase = newPhrase;
              if (resetGrades) {
                conditionItem.done = false;
                conditionItem.researchers = [];
                phraseItem.researchers = [];
                phraseItem.grades = [];
              }
            }
          }
        }
      }

      const recallGradesLogsRef = dbReal.ref(`/recallGradesGPTLogs/${recallDoc.id}`);
      const previousLogDoc = await recallGradesLogsRef.once("value");
      if (previousLogDoc.exists()) {
        const previousLogData = previousLogDoc.val() || { sessions: {} };
        console.log(previousLogData);
        const sessionsLogs = previousLogData.sessions || {};
        for (let session in sessionsLogs) {
          for (let itemIdx in sessionsLogs[session]) {
            const conditionItemLogs = sessionsLogs[session][itemIdx];
            let conditionlogs_gpt4 = (conditionItemLogs?.gpt4 || []).filter(
              item => item !== null && item !== undefined
            );
            let conditionlogs_gpt3_5 = (conditionItemLogs?.gpt35 || []).filter(
              item => item !== null && item !== undefined
            );
            replaceLogs({ resetGradesGPT, conditionlogs: conditionlogs_gpt4, selectedPhrase, newPhrase });
            replaceLogs({ resetGradesGPT, conditionlogs: conditionlogs_gpt3_5, selectedPhrase, newPhrase });

            conditionItemLogs.gpt4 = ArrayToObject(conditionlogs_gpt4);
            conditionItemLogs.gpt35 = ArrayToObject(conditionlogs_gpt3_5);
          }
        }
        updateTasks.push(
          recallGradesLogsRef.update({
            updatedAt: new Date(),
            ...previousLogData
          })
        );
      }
      if (needUpdate) {
        updateTasks.push(recallDoc.ref.update({ sessions }));
      }
    }
    for (let booleanDoc of booleanExpressionsDocs.docs) {
      updateTasks.push(booleanDoc.ref.update({ phrase: newPhrase }));
    }
    await Promise.all(updateTasks);
    res.status(200).send({ message: "success" });
  } catch (error) {
    res.status(500).send({ message: "error" });
    console.log(error);
  }
};
