const { db } = require("../../admin");
const { FieldValue } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const { passageId, selectedPhrase } = req.body;
    const passageRef = db.collection("passages").doc(passageId);
    const recallGradesDoc = await db.collection("recallGradesV2").where("passages", "array-contains", passageId).get();
    const passageDoc = await passageRef.get();
    const passageData = passageDoc.data();
    if (passageData.hasOwnProperty("phrasesTypes")) {
      passageData.phrasesTypes.splice(passageData.phrases.indexOf(selectedPhrase), 1);
    }
    const updateTasks = [];
    updateTasks.push(
      passageDoc.ref.update({
        phrases: FieldValue.arrayRemove(selectedPhrase),
        phrasesTypes: passageData.hasOwnProperty("phrasesTypes") ? passageData.phrasesTypes : []
      })
    );

    for (let recallDoc of recallGradesDoc.docs) {
      let updateSessions = recallDoc.data().sessions;
      let needUpdate = false;
      for (let session in updateSessions) {
        for (let conditionItem of updateSessions[session]) {
          const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === selectedPhrase);
          if (conditionItem.passage === passageId && phraseIndex !== -1) {
            needUpdate = true;
            conditionItem.phrases[phraseIndex].deleted = true;
          }
        }
      }
      if (needUpdate) {
        updateTasks.push(recallDoc.ref.update({ sessions: updateSessions }));
      }
    }
    await Promise.all(updateTasks);
    res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "error" });
  }
};
