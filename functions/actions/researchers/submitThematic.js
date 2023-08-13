const { db } = require("../../admin");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const { codesBook, transcriptId, surveyType, participant, project } = req.body;

    const { docId: fullname } = req.researcher;
    
    await db.runTransaction(async t => {
      const reaserchersPoints = {};
      const trabscriptionRef = db.collection("transcript").doc(transcriptId);
      const transcriptDoc = await t.get(trabscriptionRef);
      const transcriptData = transcriptDoc.data();
      const themathicDocs = await t.get(db.collection("thematicAnalysis").where("transcriptId", "==", transcriptId));
      const researchers = {};
      const reaserchersDocs = await t.get(db.collection("researchers"));
      const thematicDocs = await t.get(
        db.collection("thematicAnalysis").where("transcriptId", "==", transcriptId).where("researcher", "==", fullname)
      );
      reaserchersDocs.docs.forEach(doc => {
        if (doc.data().projects && doc.data().projects.hasOwnProperty(project)) {
          researchers[doc.id] = doc.data();
        }
      });
      for (let doc of themathicDocs.docs) {
        const data = doc.data();
        const selectedCodes = [...new Set(Object.values(doc.data().codesBook).flatMap(x => x))];
        selectedCodes.forEach(code => {
          if (reaserchersPoints.hasOwnProperty(code)) {
            reaserchersPoints[code].push(data.researcher);
          } else {
            reaserchersPoints[code] = [data.researcher];
          }
        });
        if (data.researcher in reaserchersPoints) {
          reaserchersPoints[data.researcher] += 1;
        } else {
          reaserchersPoints[data.researcher] = 1;
        }
      }
      const selectedCodes = [...new Set(Object.values(codesBook).flatMap(x => x))];
      selectedCodes.forEach(code => {
        if (reaserchersPoints.hasOwnProperty(code)) {
          reaserchersPoints[code].push(fullname);
        } else {
          reaserchersPoints[code] = [fullname];
        }
      });
      for (let code in reaserchersPoints) {
        if (reaserchersPoints[code].length >= 3) {
          for (let researcher of reaserchersPoints[code]) {
            const resRef = db.collection("researchers").doc(researcher);
            researchers[researcher].projects[project].positiveCodingPoints += 0.4;
            t.update(resRef, researchers[researcher]);
          }
        }
      }
      if (!transcriptData.hasOwnProperty("coders") || !transcriptData.coders.includes(fullname)) {
        if (researchers[fullname].projects[project].hasOwnProperty("codingNum")) {
          researchers[fullname].projects[project].codingNum += 1;
        } else {
          researchers[fullname].projects[project].codingNum = 1;
        }
      }
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
