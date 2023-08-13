const { db } = require("../../admin");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const { codesBook, transcriptId, surveyType, participant, project } = req.body;

    const { docId: fullname } = req.researcher;

    await db.runTransaction(async t => {
      const trabscriptionRef = db.collection("transcript").doc(transcriptId);
      const transcriptDoc = await t.get(trabscriptionRef);
      const transcriptData = transcriptDoc.data();
      const thematicDocs = await t.get(
        db.collection("thematicAnalysis").where("transcriptId", "==", transcriptId).where("researcher", "==", fullname)
      );

      const researcherDoc = await t.get(db.collection("researchers").doc(fullname));
      const researcherData = researcherDoc.data();

      if (!transcriptData.hasOwnProperty("coders") || !transcriptData.coders.includes(fullname)) {
        if (researcherData.projects[project].hasOwnProperty("codingNum")) {
          researcherData.projects[project].codingNum += 1;
        } else {
          researcherData.projects[project].codingNum = 1;
        }
      }

      t.update(researcherDoc.ref, researcherData);

      if (thematicDocs.docs.length > 0) {
        t.update(thematicDocs.docs[0].ref, {
          codesBook: codesBook,
          updatedAt: Timestamp.fromDate(new Date())
        });
      } else {
        const ref = db.collection("thematicAnalysis").doc();
        t.set(ref, {
          project,
          codesBook: codesBook,
          transcriptId,
          researcher: fullname,
          createdAt: Timestamp.fromDate(new Date()),
          surveyType,
          participant
        });
      }

      t.update(trabscriptionRef, {
        coders: FieldValue.arrayUnion(fullname)
      });
    });
    res.status(200).send({ message: "success" });
  } catch (error) {
    res.status(500).send({ message: "error" });
    console.log(error);
  }
};
