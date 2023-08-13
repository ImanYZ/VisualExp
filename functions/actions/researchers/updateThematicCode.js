const { db } = require("../../admin");

module.exports = async (req, res) => {
  try {
    await db.runTransaction(async t => {
      let { oldCodeId, newCode, mergeCode, category, title } = req.body;
      const codeRef = db.collection("feedbackCodeBooks").doc(oldCodeId);
      const thematicAnalysisDocs = await t.get(db.collection("thematicAnalysis"));
      const codeDoc = await t.get(codeRef);
      const codeData = codeDoc.data();
      if (newCode === codeData.code && !mergeCode && category === codeData.category && title === codeData.title) return;
      if (mergeCode) {
        newCode = mergeCode;
        const mergeCodeDoc = await t.get(
          db.collection("feedbackCodeBooks").where("project", "==", "OnlineCommunities").where("code", "==", mergeCode)
        );
        if (mergeCodeDoc.docs.length > 0) {
          t.delete(mergeCodeDoc.docs[0].ref);
        }
      }
      t.update(codeRef, { code: newCode, category, title });
      if (newCode === codeData.code) return;
      for (let thematicAnalysisDoc of thematicAnalysisDocs.docs) {
        const thematicAnalysisData = thematicAnalysisDoc.data();
        const updateCBook = thematicAnalysisData.codesBook;
        Object.keys(updateCBook).forEach(sentence => {
          const index = updateCBook[sentence].indexOf(codeData.code.trim());
          console.log(updateCBook[sentence], index);
          if (index !== -1) {
            updateCBook[sentence][index] = newCode;
          }
          console.log("after", updateCBook[sentence]);
        });
        console.log(updateCBook);
        t.update(db.collection("thematicAnalysis").doc(thematicAnalysisDoc.id), { codesBook: updateCBook });
      }
    });
    return res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "error", data: error });
  }
};
