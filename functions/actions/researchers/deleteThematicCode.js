const { db } = require("../../admin");

module.exports = async (req, res) => {
  await db.runTransaction(async t => {
    const { deleteCode } = req.body;
    const codeRef = db.collection("feedbackCodeBooks").doc(deleteCode.id);
    const thematicAnalysisDocs = await t.get(db.collection("thematicAnalysis"));
    for (let thematicAnalysisDoc of thematicAnalysisDocs.docs) {
      const thematicAnalysisData = thematicAnalysisDoc.data();
      const updateCBook = thematicAnalysisData.codesBook;
      Object.keys(updateCBook).forEach(sentence => {
        const index = updateCBook[sentence].indexOf(deleteCode.code.trim());
        console.log(updateCBook[sentence], index);
        if (index !== -1) {
          updateCBook[sentence].splice(index, 1);
          if (updateCBook[sentence].length === 0) delete updateCBook[sentence];
        }
      });
      console.log(updateCBook);
      t.update(db.collection("thematicAnalysis").doc(thematicAnalysisDoc.id), { codesBook: updateCBook });
    }
    t.delete(codeRef);
  });
};
