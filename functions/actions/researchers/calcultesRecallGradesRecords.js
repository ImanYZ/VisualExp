const { db } = require("../../admin");

module.exports = async (req, res) => {
  try {
    const { passageId, selectedPhrase } = req.body;
    const recallGradesDoc = await db.collection("recallGradesV2").where("passages", "array-contains", passageId).get();
    let numberRecord = 0;
    for (let recallDoc of recallGradesDoc.docs) {
      const recallData = recallDoc.data();
      let sessions = recallData.sessions;
      for (let session in sessions) {
        for (let conditionItem of sessions[session]) {
          if (conditionItem.passage === passageId) {
            const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === selectedPhrase);
            if (phraseIndex !== -1 && conditionItem.phrases[phraseIndex].hasOwnProperty("researchers")) {
              console.log("researchers", conditionItem.phrases[phraseIndex].researchers);
            }
            if (
              phraseIndex !== -1 &&
              conditionItem.phrases[phraseIndex].hasOwnProperty("researchers") &&
              conditionItem.phrases[phraseIndex].researchers.length > 0
            ) {
              numberRecord = numberRecord + 1;
            }
          }
        }
      }
    }
    return res.status(200).send({ numberRecord });
  } catch {
    return res.status(500).send({ message: "error" });
  }
};
