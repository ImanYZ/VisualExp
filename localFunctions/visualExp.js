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
