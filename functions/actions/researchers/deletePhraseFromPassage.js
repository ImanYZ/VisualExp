const { db } = require("../../admin");
const { FieldValue } = require("firebase-admin/firestore");
const { dbReal } = require("../../admin_real");

module.exports = async (req, res) => {
  try {
    const { passageId, selectedPhrase } = req.body;
    const { docId: fullname } = req.researcher;
    const passageRef = db.collection("passages").doc(passageId);
    const recallGradesDoc = await db.collection("recallGradesV2").where("passages", "array-contains", passageId).get();
    const passageDoc = await passageRef.get();
    const passageData = passageDoc.data();
    if (passageData.hasOwnProperty("phrasesTypes")) {
      passageData.phrasesTypes.splice(passageData.phrases.indexOf(selectedPhrase), 1);
    }
    const updateTasks = [];

    for (let recallDoc of recallGradesDoc.docs) {
      const recallRef = dbReal.ref(`/recallGradesV2/${recallDoc.id}`);
      const recallData = (await recallRef.once("value")).val();
      let updateSessions = recallData.sessions;
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
        updateTasks.push(recallRef.update({ sessions: updateSessions }));
      }
    }
    updateTasks.push(
      passageDoc.ref.update({
        phrases: FieldValue.arrayRemove(selectedPhrase),
        phrasesTypes: passageData.hasOwnProperty("phrasesTypes") ? passageData.phrasesTypes : []
      })
    );
    await Promise.all(updateTasks);

    const newLogRef = db.collection("phrasesLogs").doc();

    await newLogRef.set({
      action: "deleted phrase",
      phrase: selectedPhrase,
      passageId,
      createdAt: new Date(),
      doer: fullname
    });
    res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "error" });
  }
};
