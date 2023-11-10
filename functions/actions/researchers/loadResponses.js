const { db } = require("../../admin");

module.exports = async (req, res) => {
  try {
    const _all = {};
    const { docId: researcher } = req.researcher;
    const { selectedPassageId } = req.body;
    const recallGradesDocs = await db
      .collection("recallGradesV2")
      .where("passages", "array-contains", selectedPassageId)
      .select("sessions")
      .get();
    console.log("Done Loading");
    const promises = recallGradesDocs.docs.map(async recallDoc => {
      const recallData = recallDoc.data();
      await Promise.all(
        Object.entries(recallData.sessions).map(async ([session, conditionItems]) => {
          await Promise.all(
            conditionItems.map(async conditionItem => {
              if (conditionItem.response && conditionItem.passage === selectedPassageId) {
                const votes = {};
                await Promise.all(
                  conditionItem.phrases.map(async phrase => {
                    const resIdx = phrase.researchers.indexOf(researcher);
                    votes[phrase.phrase] = {
                      vote: resIdx !== -1 ? phrase.grades[resIdx] : null
                    };
                  })
                );
                if (_all.hasOwnProperty(conditionItem.passage)) {
                  _all[conditionItem.passage].push({
                    response: conditionItem.response.trim(),
                    documentId: recallDoc.id,
                    session,
                    condition: conditionItem.condition,
                    votes
                  });
                } else {
                  _all[conditionItem.passage] = [
                    {
                      response: conditionItem.response.trim(),
                      documentId: recallDoc.id,
                      session,
                      condition: conditionItem.condition,
                      votes
                    }
                  ];
                }
              }
            })
          );
        })
      );
    });
    await Promise.all(promises);
    res.status(200).send({ message: "success", responses: _all });
  } catch (error) {
    res.status(500).send({ message: "error", data: error });
    console.log(error);
  }
};
