const { db } = require("../../admin");

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
              if (resetGradesGPT) {
                delete phraseItem["gpt-4-0613"];
                delete phraseItem["gpt-3.5-turbo-16k-0613"];
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
