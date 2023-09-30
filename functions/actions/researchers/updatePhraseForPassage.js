const { db } = require("../../admin");

const { dbReal } = require("../../admin_real");
const { ObjectToArray, filterItemsByRubric, ArrayToObject } = require("../../helpers/grading-recalls");

const replacePhraseInLogs = (array, oldphrase, newphrase) => {
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (item.hasOwnProperty("rubric_item") && item.rubric_item === oldphrase) {
      item.rubric_item = newphrase;
    }
  }
};

module.exports = async (req, res) => {
  try {
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
              const recallGradesLogsRef = dbReal.ref(`/recallGradesGPTLogs/${recallDoc.id}`);
              const previousLogDoc = await recallGradesLogsRef.once("value");
              if (previousLogDoc.exists()) {
                const previousLogData = previousLogDoc.val() || { sessions: {} };
                const sessionItemLogs = previousLogData.sessions[session] || {};
                const conditionItemLogs = sessionItemLogs[conditionItem.condition] || {};
                if (conditionItemLogs.hasOwnProperty("gpt4")) {
                  let consitionlogs_gpt4 = ObjectToArray(conditionItemLogs.gpt4);
                  if (resetGradesGPT) {
                    consitionlogs_gpt4 = consitionlogs_gpt4.map(subarray =>
                      filterItemsByRubric(subarray, [selectedPhrase])
                    );
                    conditionItemLogs.gpt4 = ArrayToObject(consitionlogs_gpt4);
                  } else {
                    consitionlogs_gpt4 = consitionlogs_gpt4.map(subarray =>
                      replacePhraseInLogs(subarray, selectedPhrase, newPhrase)
                    );
                  }
                }
                if (conditionItemLogs.hasOwnProperty("gpt35")) {
                  let consitionlogs_gpt35 = ObjectToArray(conditionItemLogs.gpt35);
                  if (resetGradesGPT) {
                    consitionlogs_gpt35 = consitionlogs_gpt35.map(subarray =>
                      filterItemsByRubric(subarray, [selectedPhrase])
                    );
                    conditionItemLogs.gpt35 = ArrayToObject(consitionlogs_gpt35);
                  } else {
                    consitionlogs_gpt35 = consitionlogs_gpt35.map(subarray =>
                      replacePhraseInLogs(subarray, selectedPhrase, newPhrase)
                    );
                  }
                }
              }
            }
          }
        }
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
