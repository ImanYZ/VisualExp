const { db } = require("../../admin");
const { FieldValue } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const { chosenPassage, newPhraseAdded } = req.body;
    const passageDocs = await db.collection("passages").where("title", "==", chosenPassage).get();
    const passageDoc = passageDocs.docs[0];
    const recallDocs = await db.collection("recallGradesV2").where("passages", "array-contains", passageDoc.id).get();
    const updateTasks = [];
    updateTasks.push(
      passageDoc.ref.update({
        phrases: FieldValue.arrayUnion(newPhraseAdded)
      })
    );
    for (const recallDoc of recallDocs.docs) {
      const recallData = recallDoc.data();
      let needUpdate = false;

      for (const session in recallData.sessions) {
        for (const conditionItem of recallData.sessions[session]) {
          if (conditionItem.passage === passageDoc.id) {
            conditionItem.researchers = [];
            const phraseIndex = conditionItem.phrases.findIndex(phraseItem => phraseItem.phrase === newPhraseAdded);
            if (phraseIndex !== -1) {
              conditionItem.phrases[phraseIndex].deleted = false;
            } else {
              conditionItem.phrases.push({ phrase: newPhraseAdded, researchers: [], grades: [] });
            }
            needUpdate = true;
          }
        }
      }

      if (needUpdate) {
        updateTasks.push(recallDoc.ref.update({ sessions: recallData.sessions }));
      }
    }

    await Promise.all(updateTasks);
    res.status(200).send({ message: "success" });
  } catch (error) {
    res.status(500).send({ message: "error" });
    console.log(error);
  }
};
