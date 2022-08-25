const axios = require("axios");
const { app } = require("firebase-admin");
const fs = require("fs");

const {
  admin,
  db,
  commitBatch,
  batchSet,
  batchUpdate,
  batchDelete,
} = require("./admin");

exports.addRecallGradesColl = async (req, res) => {
  try {
    const recallGrades = {};
    let recallGradeDocs = await db.collection("recallGrades").get();
    for (let recallGradeDoc of recallGradeDocs.docs) {
      const recallGradeData = recallGradeDoc.data();
      recallGrades[
        [
          recallGradeData.user,
          recallGradeData.session,
          recallGradeData.project,
          recallGradeData.condition,
          recallGradeData.passage,
          recallGradeData.phrase,
        ]
      ] = recallGradeData;
    }
    console.log("*********************");
    console.log("Starting from freeRecallGrades!");
    console.log("*********************");
    let freeRecallGradeDocs = await db.collection("freeRecallGrades").get();
    for (let freeRecallGradeDoc of freeRecallGradeDocs.docs) {
      const fRData = freeRecallGradeDoc.data();
      const recallGradeKey = [
        fRData.user,
        fRData.session,
        fRData.project,
        fRData.condition,
        fRData.passageId,
        fRData.phrase,
      ];
      console.log({ researcher: fRData.researcher, grade: fRData.grade });
      if (recallGradeKey in recallGrades) {
        if (
          !recallGrades[recallGradeKey].researchers.includes(fRData.researcher)
        ) {
          const recallGradeData = recallGrades[recallGradeKey];
          recallGrades[recallGradeKey].researchers = [
            ...recallGradeData.researchers,
            fRData.researcher,
          ];
          recallGrades[recallGradeKey].researchersNum += 1;
          recallGrades[recallGradeKey].grades = [
            ...recallGradeData.grades,
            fRData.grade,
          ];
        }
      } else {
        recallGrades[recallGradeKey] = {
          ...fRData,
          approved: false,
          researchers: [fRData.researcher],
          researchersNum: 1,
          grades: [fRData.grade],
        };
        delete recallGrades[recallGradeKey]["researcher"];
        delete recallGrades[recallGradeKey]["grade"];
      }
    }

    // The issue is that every time we call this function, we start from the
    // first users document and go to the end again and again. To solve this
    // issue, I believe we should do something similar to what we did for the
    // freeRecallResponses on the users.
    console.log("*********************");
    console.log("Starting from users!");
    console.log("*********************");
    let userDocs = await db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      console.log({ user: userDoc.id });
      const userData = userDoc.data();
      if ("pConditions" in userData) {
        // Get the free-recall responses of this participant for all passages,
        // for now they are two because each participant goes through only two
        // random passages under random conditions.
        for (
          let passaIdx = 0;
          passaIdx < userData.pConditions.length;
          passaIdx++
        ) {
          // There are three types of free-recall responses:
          for (let recallResponse of [
            "recallreText",
            "recall3DaysreText",
            "recall1WeekreText",
          ]) {
            let session = "1st";
            switch (recallResponse) {
              case "recallreText":
                session = "1st";
                break;
              case "recall3DaysreText":
                session = "2nd";
                break;
              case "recall1WeekreText":
                session = "3rd";
                break;
              default:
              // code block
            }
            // There are some users who have not attended some sessions or they
            // did not answer some free-recall questions. We only need to ask
            // our researchers to grade answered free-recall responses.
            if (
              recallResponse in userData.pConditions[passaIdx] &&
              userData.pConditions[passaIdx][recallResponse]
            ) {
              // We need to retrieve the phrases for this passage from the
              // corresponding passage document.
              const passageDoc = await db
                .collection("passages")
                .doc(userData.pConditions[passaIdx].passage)
                .get();
              if (passageDoc.exists) {
                const passageData = passageDoc.data();
                // We need to do this for every key phrase in the passage that
                // we expect the participants have recalled and mentioned in
                // their free-recall response of this passage.
                if ("phrases" in passageData) {
                  for (let phras of passageData.phrases) {
                    const recallGradeKey = [
                      userDoc.id,
                      session,
                      userData.project,
                      userData.pConditions[passaIdx].condition,
                      userData.pConditions[passaIdx].passage,
                      phras,
                    ];
                    if (!(recallGradeKey in recallGrades)) {
                      recallGrades[recallGradeKey] = {
                        user: userDoc.id,
                        session,
                        project: userData.project,
                        condition: userData.pConditions[passaIdx].condition,
                        passage: userData.pConditions[passaIdx].passage,
                        response:
                          userData.pConditions[passaIdx][recallResponse],
                        phrase: phras,
                        researchers: [],
                        researchersNum: 0,
                        grades: [],
                        createdAt: new Date(),
                      };
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log("*********************");
    console.log("Done with users!");
    console.log("*********************");
    for (let rGKey in recallGrades) {
      const [user, session, project, condition, passage, phrase] = rGKey;
      // We have to update this so that it does not always create new documents,
      // but if the document already exists, it updates it.
      recallGradeDocs = await db
        .collection("recallGrades")
        .where("user", "==", user)
        .where("session", "==", session)
        .where("project", "==", project)
        .where("condition", "==", condition)
        .where("passage", "==", passage)
        .where("phrase", "==", phrase)
        .get();
      if (recallGradeDocs.docs.length > 0) {
        const recallGradeRef = db
          .collection("recallGrades")
          .doc(recallGradeDocs.docs[0].id);
        await batchUpdate(recallGradeRef, recallGrades[rGKey]);
      } else {
        const recallGradeRef = db.collection("recallGrades").doc();
        await batchSet(recallGradeRef, recallGrades[rGKey]);
      }
    }
    console.log("*********************");
    console.log("Started to commit!");
    console.log("*********************");
    await commitBatch();
    console.log("Done.");
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(200).json({ done: true });
};

exports.checkRepeatedRecallGrades = async (req, res) => {
  try {
    const recallGrades = {};
    const duplicate = [];
    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];

    console.log("Starting");
    while (lastVisibleRecallGradesDoc) {
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();

      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];

      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;

      for (let recallGradeDoc of recallGradeDocs.docs) {
        const recallGradeData = recallGradeDoc.data();
        if (
          [
            recallGradeData.user,
            recallGradeData.session,
            recallGradeData.project,
            recallGradeData.condition,
            recallGradeData.passage,
            recallGradeData.phrase,
          ] in recallGrades
        ) {
          const previousRecallGrade =
            recallGrades[
              [
                recallGradeData.user,
                recallGradeData.session,
                recallGradeData.project,
                recallGradeData.condition,
                recallGradeData.passage,
                recallGradeData.phrase,
              ]
            ];
          console.log(recallGradeDoc.id, previousRecallGrade.id);
          duplicate.push(recallGradeDoc.id);
        } else {
          recallGrades[
            [
              recallGradeData.user,
              recallGradeData.session,
              recallGradeData.project,
              recallGradeData.condition,
              recallGradeData.passage,
              recallGradeData.phrase,
            ]
          ] = { data: recallGradeData, id: recallGradeDoc.id };
        }
      }
    }

    console.log("Done.");
    return res.status(200).json({ done: true });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.deleteIncompleteRecallGrades = async (req, res) => {
  try {
    // First, retrieve all the users' data so that we don't need to repeadedly
    // retrieve them from the database every time we need one.
    let dateOfThePilotStudy = "01/21/2022 19:00:00";
    const userDocs = await db.collection("users").get();
    const deletableUsers = [];
    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();
      let allResponsesReady = true;
      if (userData.pConditions) {
        const afterPilotStudy =
          Date.parse(dateOfThePilotStudy) / 1000 <
          Date.parse(userData.createdAt.toDate()) / 1000;
        for (let pCond of userData.pConditions) {
          if (
            !("recallreText" in pCond) ||
            !("recall3DaysreText" in pCond) ||
            (!("recall1WeekreText" in pCond) && afterPilotStudy)
          ) {
            allResponsesReady = false;
          }
        }
        if (!allResponsesReady) {
          deletableUsers.push(userDoc.id);
          for (
            let pCondIdx = 0;
            pCondIdx < userData.pConditions.length;
            pCondIdx++
          ) {
            console.log({
              user: userDoc.id,
              [pCondIdx + " recallreText"]:
                userData.pConditions[pCondIdx].recallreText,
              [pCondIdx + " recall3DaysreText"]:
                userData.pConditions[pCondIdx].recall3DaysreText,
              [pCondIdx + " recall1WeekreText"]:
                userData.pConditions[pCondIdx].recall1WeekreText,
            });
          }
        }
      }
    }
    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];

    console.log("Starting");
    while (lastVisibleRecallGradesDoc) {
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();
      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;

      for (let recallGradeDoc of recallGradeDocs.docs) {
        const recallGradeData = recallGradeDoc.data();
        if (deletableUsers.includes(recallGradeData.user)) {
          let recallGradeDeleteRef = db
            .collection("recallGrades")
            .doc(recallGradeDoc.id);
          await batchDelete(recallGradeDeleteRef);
          console.log({
            responseGradeId: recallGradeDoc.id,
          });
        }
      }
      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
    }
    console.log("*********************");
    console.log("Started to commit!");
    console.log("*********************");
    await commitBatch();
    console.log("Done.");
    return res.status(200).json({ done: true });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.deleteDuplicatesWithNoVotes = async (req, res) => {
  try {
    const recallGrades = {};
    const duplicate = [];
    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];

    console.log("Starting");
    while (lastVisibleRecallGradesDoc) {
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();

      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];

      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;

      for (let recallGradeDoc of recallGradeDocs.docs) {
        const recallGradeData = recallGradeDoc.data();
        if (
          [
            recallGradeData.user,
            recallGradeData.session,
            recallGradeData.project,
            recallGradeData.condition,
            recallGradeData.passage,
            recallGradeData.phrase,
          ] in recallGrades
        ) {
          if (recallGradeData.researchersNum === 0) {
            console.log(recallGradeDoc.id);
            duplicate.push(recallGradeDoc.id);
            let recallGradeDeleteRef = db
              .collection("recallGrades")
              .doc(recallGradeDoc.id);
            await batchDelete(recallGradeDeleteRef);
          }
        } else {
          recallGrades[
            [
              recallGradeData.user,
              recallGradeData.session,
              recallGradeData.project,
              recallGradeData.condition,
              recallGradeData.passage,
              recallGradeData.phrase,
            ]
          ] = recallGradeData;
        }
      }
    }

    await commitBatch();
    console.log(duplicate.length);
    console.log("Done");
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.deleteDuplicatesWithVotes = async (req, res) => {
  try {
    const recallGrades = {};
    const duplicate = [];
    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];

    console.log("Starting");
    while (lastVisibleRecallGradesDoc) {
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();

      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];

      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;

      for (let recallGradeDoc of recallGradeDocs.docs) {
        const recallGradeData = recallGradeDoc.data();
        if (
          [
            recallGradeData.user,
            recallGradeData.session,
            recallGradeData.project,
            recallGradeData.condition,
            recallGradeData.passage,
            recallGradeData.phrase,
          ] in recallGrades
        ) {
          const previousRecallGrade =
            recallGrades[
              [
                recallGradeData.user,
                recallGradeData.session,
                recallGradeData.project,
                recallGradeData.condition,
                recallGradeData.passage,
                recallGradeData.phrase,
              ]
            ];
          let previousRecallGradeRef = db
            .collection("recallGrades")
            .doc(previousRecallGrade.id);
          let recallGradeDeleteRef = db
            .collection("recallGrades")
            .doc(recallGradeDoc.id);
          if (
            recallGradeData.researchersNum < 4 &&
            !(recallGradeData.researchersNum === 0)
          ) {
            duplicate.push(recallGradeDoc.id);
            console.log(recallGradeDoc.id, previousRecallGrade.id);
            for (
              let resIdx = 0;
              resIdx < recallGradeData.researchersNum;
              resIdx++
            ) {
              if (
                !previousRecallGrade.data.researchers.includes(
                  recallGradeData.researchers[resIdx]
                )
              ) {
                previousRecallGrade.data.researchers.push(
                  recallGradeData.researchers[resIdx]
                );
                previousRecallGrade.data.grades.push(
                  recallGradeData.grades[resIdx]
                );
                previousRecallGrade.data.researchersNum =
                  previousRecallGrade.data.researchersNum + 1;
              }
            }

            recallGrades[
              [
                recallGradeData.user,
                recallGradeData.session,
                recallGradeData.project,
                recallGradeData.condition,
                recallGradeData.passage,
                recallGradeData.phrase,
              ]
            ] = { data: previousRecallGrade.data, id: previousRecallGrade.id };
            await batchDelete(recallGradeDeleteRef);
            await batchUpdate(previousRecallGradeRef, previousRecallGrade.data);
          }
        } else {
          recallGrades[
            [
              recallGradeData.user,
              recallGradeData.session,
              recallGradeData.project,
              recallGradeData.condition,
              recallGradeData.passage,
              recallGradeData.phrase,
            ]
          ] = { data: recallGradeData, id: recallGradeDoc.id };
        }
      }
    }

    await commitBatch();
    console.log(duplicate.length);
    console.log("Done");
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.addDoneFeildToRecallGrades = async (req, res) => {
  try {
    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];

    console.log("Starting");
    while (lastVisibleRecallGradesDoc) {
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();

      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];

      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;

      for (let recallGradeDoc of recallGradeDocs.docs) {
        let recallGradeData = recallGradeDoc.data();
        let recallUpdate = {};
        if (recallGradeData.researchersNum >= 4) {
          recallUpdate = {
            done: true,
            ...recallGradeData,
          };
        } else {
          recallUpdate = {
            done: false,
            ...recallGradeData,
          };
        }
        let recallGradeRef = db
          .collection("recallGrades")
          .doc(recallGradeDoc.id);
        console.log(recallGradeDoc.id);
        await batchUpdate(recallGradeRef, recallUpdate);
      }
    }

    await commitBatch();

    console.log("Done");
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.moveResearchersPoints = async () => {
  // let researchers = [
  //   "Ethan Hiew",
  //   "Huijia Zheng",
  //   "Jiayue Mao",

  //   "Louwis Truong",

  //   "Shaobo Liang",

  //   "Shivani Lamba",

  //   "Sofia Azham",

  //   "Xiaowen Yuan",

  //   "Yizhou Chao",
  // ];

  // for (let res of researchers) {
  let docResearcherdoc = await db
    .collection("researchers")
    .doc("Ethan Hiew")
    .get();
  let data = docResearcherdoc.data();
  // let researcherUpdate = {
  //   ...data,
  //   projects: {
  //     H2L2: {
  //       ...data.projects["H2K2"],
  //     },
  //   },
  // };
  console.log(data);
  // let docResearcherRef = db.collection("researchers").doc(res);
  // await batchUpdate(docResearcherRef, researcherUpdate);
  // }

  // await commitBatch();
};

exports.restructureProjectSpecs = async (req, res) => {
  const documents = {
    H2K2: {
      points: {
        commentsPoints: 100,
        expPoints: 100,
        gradingPoints: 100,
        instructorsPoints: 100,
        intellectualPoints: 100,
        onePoints: 100,
      },
    },
    Annotating: {
      points: {
        commentsPoints: 400,
        expPoints: 400,
        gradingPoints: 400,
        instructorsPoints: 400,
        intellectualPoints: 400,
        onePoints: 400,
      },
    },
  };

  try {
    for (proj of Object.keys(documents)) {
      const projectSpecs = db.collection("projectSpecs").doc(proj);
      await batchSet(projectSpecs, documents[proj]);
    }

    await commitBatch();
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }

  return res.status(200).json({ done: true });
};

exports.restructureFeedBackCode = async (req, res) => {
  try {
    const feedBack = {};
    console.log("starting");
    let feedbackCodesDocs = await db.collection("feedbackCodes").get();
    let feedbackCodeBooksdocs = await db.collection("feedbackCodeBooks").get();

    for (let feedbackCodesDoc of feedbackCodesDocs.docs) {
      const fData = feedbackCodesDoc.data();
      const feedKey = [fData.explanation, fData.fullname];

      if (feedKey in feedBack) {
      } else {
        let codesVotes = {};
        for (let doc of feedbackCodeBooksdocs.docs) {
          const data = doc.data();
          codesVotes[data.code] = [];
        }
        // codesVotes[fData.code] = [fData.coder];
        console.log(codesVotes);
        feedBack[feedKey] = {
          approved: false,
          codersChoices: {},
          coders: [],
          choice: fData.choice,
          project: fData.project,
          fullname: fData.fullname,
          session: fData.session,
          explanation: fData.explanation,
          createdAt: fData.createdAt,
          expIdx: fData.expIdx,
          codesVotes,
          updatedAt: new Date(),
        };
      }
    }

    for (let rGKey in feedBack) {
      const recallGradeRef = db.collection("feedbackCode").doc();
      console.log(feedBack[rGKey]);
      await batchSet(recallGradeRef, feedBack[rGKey]);
    }
    console.log("*********************");
    console.log("Started to commit!");
    console.log("*********************");
    await commitBatch();
    console.log("Done.");
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(200).json({ done: true });
};

// exports.restructureFeedBackCode = async (req, res) => {
//   try {
//     const feedBack = {};
//     console.log("starting");
//     let feedbackCodesDocs = await db.collection("codefeedbacks").get();

//     for (let feedbackCodesDoc of feedbackCodesDocs.docs) {
//       const fData = feedbackCodesDoc.data();
//       const feedKey = [fData.explanation, fData.fullname];

//       if (feedKey in feedBack) {
//         const feedbackData = feedBack[feedKey];

//         if (fData.coder in feedBack[feedKey].codes) {
//           feedBack[feedKey].codes[fData.coder] = {
//             ...feedBack[feedKey].codes[fData.coder],
//             [fData.code]: [],
//           };
//         } else {
//           feedBack[feedKey].coders = [...feedbackData.coders, fData.coder];
//           feedBack[feedKey].codes[fData.coder] = {
//             [fData.code]: [],
//           };
//         }
//       } else {
//         let codesVotes ={};
//         for(let doc of feedbackCodeBooksdocs.docs){
//           const data = doc.data();
//           codesVotes[data.code] = [];
//         }

//         console.log(codesVotes);
//         feedBack[feedKey] = {
//           codes: { [fData.coder]: { [fData.code]: [] } },
//           coders: [fData.coder],
//           choice: fData.choice,
//           project: fData.project,
//           fullname: fData.fullname,
//           session: fData.session,
//           explanation: fData.explanation,
//           createdAt: fData.createdAt,
//           expIdx: fData.expIdx,
//           codesVotes
//         };
//       }
//     }

//     for (let rGKey in feedBack) {
//       const recallGradeRef = db.collection("codefeedbacks").doc();
//       console.log(feedBack[rGKey]);
//       await batchSet(recallGradeRef, feedBack[rGKey]);
//     }
//     console.log("*********************");
//     console.log("Started to commit!");
//     console.log("*********************");
//     await commitBatch();
//     console.log("Done.");
//   } catch (err) {
//     console.log({ err });
//     return res.status(500).json({ err });
//   }
//   return res.status(200).json({ done: true });
// };

exports.deleteDamagedDocumentsOnFreeRecallGrades = async (req, res) => {
  try {
    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];
    console.log("Starting");
    while (lastVisibleRecallGradesDoc) {
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();
      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;
      for (let recallGradeDoc of recallGradeDocs.docs) {
        let recallGradeRef = db
          .collection("recallGrades")
          .doc(recallGradeDoc.id);
        let recallGradeData = recallGradeDoc.data();
        let recallUpdate = {};
        if (recallGradeData.response === "recall1WeekreText") {
          console.log(recallGradeData);
          let userDoc = await db
            .collection("users")
            .doc(recallGradeData.user)
            .get();
          let userData = userDoc.data();
          if (userData.pConditions[0].passage === recallGradeData.passage) {
            recallGradeData.response =
              userData.pConditions[0]["recall1WeekreText"];
          } else {
            recallGradeData.response =
              userData.pConditions[1]["recall1WeekreText"];
          }
          console.log(recallGradeData);
          await batchUpdate(recallGradeRef, recallGradeData);
        } else if (recallGradeData.response === "recall3DaysreText") {
          let userDoc = await db
            .collection("users")
            .doc(recallGradeData.user)
            .get();
          let userData = userDoc.data();
          if (userData.pConditions[0].passage === recallGradeData.passage) {
            recallGradeData.response =
              userData.pConditions[0]["recall3DaysreText"];
          } else {
            recallGradeData.response =
              userData.pConditions[1]["recall3DaysreText"];
          }
          console.log(recallGradeData);
          await batchUpdate(recallGradeRef, recallGradeData);
        } else if (recallGradeData.response === "recallreText") {
          let userDoc = await db
            .collection("users")
            .doc(recallGradeData.user)
            .get();
          let userData = userDoc.data();
          if (userData.pConditions[0].passage === recallGradeData.passage) {
            recallGradeData.response = userData.pConditions[0]["recallreText"];
          } else {
            recallGradeData.response = userData.pConditions[1]["recallreText"];
          }
          console.log(recallGradeData);
          await batchUpdate(recallGradeRef, recallGradeData);
        }
      }
    }
    await commitBatch();
    console.log("Done");
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.correctTheDataStructureForDamagedUsers = async (req, res) => {
  try {
    let number = 0;
    let usersDocs = await db.collection("users").get();
    for (let userDoc of usersDocs.docs) {
      let userData = userDoc.data();

      if (userData.pConditions) {
        if (userData.pConditions.passage === "s1oo3G4n3jeE8fJQRs3g") {
          number = number + 1;
          console.log(userData.project);
          let pConditionsUpdate = [userData.pConditions];
          let userUpdate = {
            ...userData,
            damagedDocument: true,
            pConditions: pConditionsUpdate,
          };
          const recallGradeRef = db.collection("users").doc(userDoc.id);
          await batchUpdate(recallGradeRef, userUpdate);
        }
      }
    }
    console.log(number);
    await commitBatch();
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.deleteDamageDocumentForAffectedUsersInRecallGrades = async (
  req,
  res
) => {
  try {
    let damagedUsers = [];
    let passagesUsers = {};
    let damagedUsersDocs = await db
      .collection("users")
      .where("damagedDocument", "==", true)
      .get();
    //we go throught all the users damaged documets and we add object array element in the passagesUsers object
    //with the first element will be the condition of the passage "The Quiet Sideman"

    for (let userDoc of damagedUsersDocs.docs) {
      const userData = userDoc.data();
      if (
        userData.explanations &&
        userData.explanations1Week &&
        userData.explanations3Days
      ) {
        passagesUsers[userDoc.id] = [userData.pConditions[0].condition];
      }
      damagedUsers.push(userDoc.id);
    }

    //we get the first element of the recallGrades so we can go through all the recall grades documents
    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];
    console.log("Starting");
    //we stay in the while loop as long as lastVisibleRecallGradesDoc is not undifined
    while (lastVisibleRecallGradesDoc) {
      //retreive 40000 document because that's the amount firebase can take without going on timeout
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();

      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;

      //we go through the recallGrades documents and delete the documents associated with damagedUsers
      for (let recallGradeDoc of recallGradeDocs.docs) {
        let recallGradeRef = db
          .collection("recallGrades")
          .doc(recallGradeDoc.id);

        let recallGradeData = recallGradeDoc.data();
        //if the document belong to a damaged user we delete the ducement and add the passage id to passagesUsers
        if (damagedUsers.includes(recallGradeData.user)) {
          console.log(recallGradeDoc.id);
          if (
            recallGradeData.user in passagesUsers &&
            !passagesUsers[recallGradeData.user].includes(
              recallGradeData.passage
            )
          ) {
            passagesUsers[recallGradeData.user].push(recallGradeData.passage);
          }

          await batchDelete(recallGradeRef);
        }
      }
      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
    }

    //DONE WITH RECALLGRADES

    //---------start formating passages----------------//
    console.log("first");
    let passageNumberOfParticipant = {};

    for (let user in passagesUsers) {
      console.log(user);
      for (let idx = 0; idx < 2; idx++) {
        if (
          passagesUsers[user][idx + 1] &&
          !(passagesUsers[user][idx + 1] in passageNumberOfParticipant)
        ) {
          passageNumberOfParticipant[passagesUsers[user][idx + 1]] = {
            H2: 0,
            K2: 0,
          };
        }
      }
    }

    for (let user in passagesUsers) {
      let condition2;
      let condition1 = passagesUsers[user][0];
      if (condition1 === "H2") {
        condition2 = "K2";
      } else {
        condition2 = "H2";
      }
      for (let idx = 0; idx < 2; idx++) {
        if (passagesUsers[user][idx + 1]) {
          let passage = passagesUsers[user][idx + 1];
          if (passage === "s1oo3G4n3jeE8fJQRs3g") {
            passageNumberOfParticipant[passage][condition1] =
              passageNumberOfParticipant[passage][condition1] + 1;
          } else {
            passageNumberOfParticipant[passage][condition2] =
              passageNumberOfParticipant[passage][condition2] + 1;
          }
        }
      }
    }
    console.log({ passageNumberOfParticipant });
    for (let passage in passageNumberOfParticipant) {
      let passageDoc = await db.collection("passages").doc(passage).get();
      const passageRef = db.collection("passages").doc(passage);
      const passageData = passageDoc.data();
      console.log(passage);
      let passageProjectUpdate = {
        ...passageData.projects["H2K2"],
        H2:
          passageData.projects["H2K2"]["H2"] -
          passageNumberOfParticipant[passage]["H2"],
        K2:
          passageData.projects["H2K2"]["K2"] -
          passageNumberOfParticipant[passage]["K2"],
      };
      let passageUpdate = {
        ...passageData,
        projects: {
          ...passageData.projects,
          H2K2: passageProjectUpdate,
        },
      };

      await batchUpdate(passageRef, passageUpdate);
    }

    await commitBatch();
    console.log("Done", Object.keys(passagesUsers).length);
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.makeCorrectionToPhrasesinRecallGrades = async (req, res) => {
  try {
    const changedPhrases = new Set();
    const corespondingPhrases = {
      "Barn owl locate prey like predators that hunt on the ground":
        "Barn owl locates prey similarly to predators that hunt on the ground",
      "The face structure of barn owls consists of purpose of troughs":
        "The face structure of barn owls contains two troughs",
      "Barn owls have acuity and sensitivity to differences in loudness through information interpretation and impulse transmission":
        "Barn owls must organize and interpret sound information",
      "Barn owl must locate prey quickly and precisely":
        "Barn owl must locate prey precisely",
    };
    const deletRecallGradePhrases = [
      "The decision stands teach visitors about habitat loss and conservation efforts",
      "The decision stands teach visitors what it's like to weight economic decisions against the need to preserve panda habitats",
      "The decision stands are Wang's favorite part of the exhibit because the experience helps visitors understand that the problem is a wider socio-economic one",
      "The decision stands are Wang's favorite part of the exhibit because the experience helps visitors understand that the problem cannot be solved by biologists alone",
    ];
    const passagesDocs = await db.collection("passages").get();
    const passages = {};
    for (let doc of passagesDocs.docs) {
      const passageData = doc.data();
      passages[doc.id] = passageData;
      if ("H2K2" in passageData.projects && doc.id !== "s1oo3G4n3jeE8fJQRs3g") {
        if (passageData.phrases) {
          for (let phrase of passageData.phrases) {
            changedPhrases.add(phrase);
          }
        }
      }
    }
    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];
    console.log("Starting");
    const uniquePhrases = new Set();
    const recallGradesToDelete = new Set();

    while (lastVisibleRecallGradesDoc) {
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();
      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;
      for (let recallGradeDoc of recallGradeDocs.docs) {
        const recallGradeRef = db
          .collection("recallGrades")
          .doc(recallGradeDoc.id);

        const recallGradeData = recallGradeDoc.data();

        changedPhrases.delete(recallGradeData.phrase);
        if (!"H2K2" in passages[recallGradeData.passage].projects) {
          recallGradesToDelete.add(recallGradeDoc.id);
        }
        if (
          !passages[recallGradeData.passage].phrases.includes(
            recallGradeData.phrase
          )
        ) {
          if (deletRecallGradePhrases.includes(recallGradeData.phrase)) {
            // await batchDelete(recallGradeRef)
          } else {
            const recallUpdate = {
              phrase: corespondingPhrases[recallGradeData.phrase],
            };
            // await batchUpdate(recallGradeRef,recallUpdate);
          }

          if (!uniquePhrases.has(recallGradeData.phrase)) {
            uniquePhrases.add(recallGradeData.phrase);
          }
          // console.log({recallphrase:recallGradeData.phrase,passageId:recallGradeData.passage});
        }
      }
    }
    console.log({ changedPhrases });
    console.log({ recallGradesToDelete });
    console.log({ uniquePhrases });
    // await commitBatch();
    console.log("Done");
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.createRecallGradesForNewUserH1L2 = async (req, res) => {
  try {
    const userDocs = await db
      .collection("users")
      .where("project", "==", "H1L2")
      .get();

    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();

      let allResponsesReady = true;
      for (let pCond of userData.pConditions) {
        if (
          !("recallreText" in pCond) ||
          !("recall3DaysreText" in pCond) ||
          !("recall1WeekreText" in pCond)
        ) {
          allResponsesReady = false;
        }
      }
      if (allResponsesReady) {
        for (let pCond of userData.pConditions) {
          passageDoc = await db.collection("passages").doc(pCond.passage).get();
          passageData = passageDoc.data();
          for (let session of ["1st", "2nd", "3rd"]) {
            let responseName = "recallreText";
            if (session === "2nd") {
              responseName = "recall3DaysreText";
            } else if (session === "3rd") {
              responseName = "recall1WeekreText";
            }
            for (let phras of passageData.phrases) {
              const recallGradeData = {
                done: false,
                condition: pCond.condition,
                createdAt: userData.lastLoad ? userData.lastLoad : new Date(),
                passage: pCond.passage,
                project: userData.project,
                grades: [],
                researchers: [],
                researchersNum: 0,
                session,
                user: userDoc.id,
                phrase: phras,
                response: pCond[responseName],
              };

              const recallGradeRef = db.collection("recallGradesH1L2").doc();
              await batchSet(recallGradeRef, recallGradeData);
            }
          }
        }
      }
    }
    await commitBatch();
    console.log("done");
  } catch (error) {
    console.log(error);
  }
};

exports.deleteTheKeyPhrasesForPassage = async (req, res) => {
  try {
    const newPhrases = [
      "The passage is about trap-jaw ants",
      "They are a group of Central and South American ants",
      "They have a speedy bite",
      "They bites are the fastest on the planet",
      "They can jump with their jaw",
      "Jumping with jaw is a newly discovered defense",
      "They nest in leaf litter",
      "They feed on well-armored and elusive prey, including other species of ants",
      "They stalk prey",
      "They hold their mandibles wide apart, often at 180 degrees",
      "Mandibles cocked open by a latch mechanism",
      "Jaw snaps shut after minute trigger hairs in mandible come in contact with something",
      "Jaws snap shut at up to 145 miles per hour",
      "No passerby can outrace that astoundingly high speed of the jaws",
      "Jaws have enough force to crack open the armor of most prey",
      "They store energy in their jaws",
      "Energy release from strong but slow muscles is the key for the jaw’s speed",
      "Archers use bowstring to throw arrows faster than throwing the arrow like a javelin",
      "The energy stored in their jaws are similar to an archer drawing their bow",
      "Sheila N. Patek is a biomechanist at the University of California, Berkeley",
      "Joseph E. Baio is a biomechanist at the University of California, Berkeley",
      "Sheila N. Patek and Joseph E. Baio are experts in the biomechanics of energy storage",
      "Brian L. Fisher of the California Academy of Sciences in San Francisco is an ant expert",
      "Andrew V. Suarez of the University of Illinois at Urbana-Champaign is an ant expert",
      "They are known as Odontomachus bauri",
      "Catching them is like grabbing for popping hot popcorn",
      "Painful sting goes with their trap-jaw bite",
      "They propel themselves many times their body length",
      "They jump when biologists or smaller intruders approach them",
      "Secret of their self-propulsion is the well-executed “firing” of their mandibles",
      "Researchers made high-speed video to discover the secret of their self propulsion",
      "Their mandibles started to decelerate before they meet",
      "Deceleration of mandibles possibly help to avoid self-inflicted damage",
      "They have two distinct modes of aerial locomotion",
      "In escape jump, an ant orients its head and jaws perpendicular to the ground",
      "In escape jump, they slam their face straight down",
      "In escape jump, mandibles are released with a force 400 times the ant’s body weight",
      "Escape jump launches the insect ten or more body lengths nearly straight into the air",
      "Escape jump is fast and unpredictable",
      "Escape jump help the insect evade threats",
      "Escape jump helps ant to sow confusion",
      "Escape jump helps the ant get to a new vantage point to relaunch an attack",
      "Bouncer-defense jump is done when an intruder enters their nest",
      "Bouncer-defense jump is more common than escape jump",
      "For bouncer-defense jump ants bangs its jaws against the intruder ",
      "Banging jaws against intruder triggers the trap-jaw and propels the interloper",
      "Bouncer-defense jump propels the interloper (if small enough) in one direction",
      "Bouncer-defense jump propels the ant in other direction",
      "Bouncer defense jump often sends the ant an inch off the ground",
      "Bouncer defense jump often sends the ant nearly a foot away",
      "Gangs of defending ants team up to send hostile strangers out of the nest",
      "Their evolution is intriguing",
      "They evolved to use already useful system of chewing up prey for propulsion",
      "Bouncer-defense jump could have arisen out of attempts to bite intruders",
      "The bouncer-defense jump is horizontal",
      "High, escape jump must have arisen from a different, perhaps accidental kind of behavior",
      "Several lineages use tactic of storing energy in their jaws to penetrate well-defended prey",
    ];

    const passagesToDelete = ["xuNQUYbAEFfTD1PHuLGV"];

    for (passage of passagesToDelete) {
      console.log(passage);
      const passageRef = await db.collection("passages").doc(passage);
      if (passage === "xuNQUYbAEFfTD1PHuLGV") {
        passageUpdate = {
          phrases: newPhrases,
        };
      } else {
        passageUpdate = {
          phrases: [],
        };
      }

      await batchUpdate(passageRef, passageUpdate);
    }
    //Delete documents for recall Grades project H2K2

    let recallGradeDocsInitial = await db
      .collection("recallGrades")
      .orderBy("createdAt")
      .limit(1)
      .get();
    let documentsNumber = 1;
    let lastVisibleRecallGradesDoc =
      recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];
    const lastVisibleRecallGradesData = lastVisibleRecallGradesDoc.data();
    const lastVisibleRecallGradeRef = db
      .collection("recallGrades")
      .doc(lastVisibleRecallGradesDoc.id);
    if (passagesToDelete.includes(lastVisibleRecallGradesData.passage)) {
      console.log(lastVisibleRecallGradesDoc.id);
      await batchDelete(lastVisibleRecallGradeRef);
    }
    //if the document belong to a damaged user we delete the ducement and add the passage id to passagesUsers
    console.log("StartingH2K2");
    //we stay in the while loop as long as lastVisibleRecallGradesDoc is not undifined
    while (lastVisibleRecallGradesDoc) {
      //retreive 40000 document because that's the amount firebase can take without going on timeout
      recallGradeDocs = await db
        .collection("recallGrades")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(40000)
        .get();

      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;
      //we go through the recallGrades documents and delete the documents associated with damagedUsers
      for (let recallGradeDoc of recallGradeDocs.docs) {
        const recallGradeRef = db
          .collection("recallGrades")
          .doc(recallGradeDoc.id);

        let recallGradeData = recallGradeDoc.data();
        //if the document belong to a damaged user we delete the ducement and add the passage id to passagesUsers
        if (passagesToDelete.includes(recallGradeData.passage)) {
          console.log(recallGradeDoc.id);
          await batchDelete(recallGradeRef);
        }
      }
      lastVisibleRecallGradesDoc =
        recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
    }

    //Delete documents for recall Grades project H1L2

    let recallGradeH1L2DocsInitial = await db
      .collection("recallGradesH1L2")
      .orderBy("createdAt")
      .limit(1)
      .get();

    let lastVisibleRecallGradesH1L2Doc =
      recallGradeH1L2DocsInitial.docs[
        recallGradeH1L2DocsInitial.docs.length - 1
      ];

    const lastVisibleRecallGradesH1L2Data =
      lastVisibleRecallGradesH1L2Doc.data();
    const lastVisibleRecallGradeH1L2Ref = db
      .collection("recallGradesH1L2")
      .doc(lastVisibleRecallGradesH1L2Doc.id);
    if (passagesToDelete.includes(lastVisibleRecallGradesH1L2Data.passage)) {
      console.log(lastVisibleRecallGradesH1L2Doc.id);
      await batchDelete(lastVisibleRecallGradeH1L2Ref);
    }
    console.log("StartingH1L2");
    //we stay in the while loop as long as lastVisibleRecallGradesDoc is not undifined
    while (lastVisibleRecallGradesH1L2Doc) {
      //retreive 40000 document because that's the amount firebase can take without going on timeout
      recallGradeDocsH1L2 = await db
        .collection("recallGradesH1L2")
        .orderBy("createdAt")
        .startAfter(lastVisibleRecallGradesH1L2Doc)
        .limit(40000)
        .get();

      console.log(documentsNumber);
      documentsNumber = documentsNumber + 40000;

      //we go through the recallGrades documents and delete the documents associated with damagedUsers
      for (let recallGradH1L2Doc of recallGradeDocsH1L2.docs) {
        console.log(recallGradH1L2Doc.id);
        let recallGradeH1L2Ref = db
          .collection("recallGradesH1L2")
          .doc(recallGradH1L2Doc.id);

        let recallGradeH1L2Data = recallGradH1L2Doc.data();
        //if the document belong to a damaged user we delete the ducement and add the passage id to passagesUsers
        if (passagesToDelete.includes(recallGradeH1L2Data.passage)) {
          console.log(recallGradH1L2Doc.id);
          await batchDelete(recallGradeH1L2Ref);
        }
      }
      lastVisibleRecallGradesH1L2Doc =
        recallGradeDocsH1L2.docs[recallGradeDocsH1L2.docs.length - 1];
    }

    await commitBatch();
    console.log("Done");
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.recreateNewRecallGradesDocuments = async () => {
  try {
    const userDocs = await db.collection("users").get();

    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();

      let allResponsesReady = true;
      if (userData.pConditions) {
        for (let pCond of userData.pConditions) {
          if (
            !("recallreText" in pCond) ||
            !("recall3DaysreText" in pCond) ||
            !("recall1WeekreText" in pCond)
          ) {
            allResponsesReady = false;
          }
        }
        if (allResponsesReady) {
          for (let pCond of userData.pConditions) {
            if (pCond.passage === "xuNQUYbAEFfTD1PHuLGV") {
              passageDoc = await db
                .collection("passages")
                .doc(pCond.passage)
                .get();
              passageData = passageDoc.data();
              for (let session of ["1st", "2nd", "3rd"]) {
                let responseName = "recallreText";
                if (session === "2nd") {
                  responseName = "recall3DaysreText";
                } else if (session === "3rd") {
                  responseName = "recall1WeekreText";
                }

                for (let phras of passageData.phrases) {
                  const recallGradeData = {
                    done: false,
                    condition: pCond.condition,
                    createdAt: userData.lastLoad
                      ? userData.lastLoad
                      : new Date(),
                    passage: pCond.passage,
                    project: userData.project,
                    grades: [],
                    researchers: [],
                    researchersNum: 0,
                    session,
                    user: userDoc.id,
                    phrase: phras,
                    response: pCond[responseName],
                  };
                  if (userData.project === "H2K2") {
                    const recallGradeRef = db.collection("recallGrades").doc();
                    await batchSet(recallGradeRef, recallGradeData);
                    
                  } else if (userData.project === "H1L2") {
                    const recallGradeRef = db
                      .collection("recallGradesH1L2")
                      .doc();
                    await batchSet(recallGradeRef, recallGradeData);
                  }
                }
              }
            }
          }
        }
      }
    }
    await commitBatch();
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
};
