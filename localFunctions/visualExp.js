const { app } = require("firebase-admin");
const fs = require("fs");
const csv = require("fast-csv");
const { v4: uuidv4 } = require("uuid");
const { Configuration, OpenAIApi } = require("openai");

const {
  admin,
  db,
  commitBatch,
  batchSet,
  batchUpdate,
  batchDelete,
} = require("./admin");
const { oneDb } = require("./admin_Knowledge");

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
    let feedbackCodeBooksdocs = await db
      .collection("feedbackCodeBooks")
      .where("approved", "==", true)
      .get();

    for (let feedbackCodesDoc of feedbackCodesDocs.docs) {
      const fData = feedbackCodesDoc.data();
      const feedKey = [fData.explanation, fData.fullname];

      if (feedKey in feedBack) {
      } else {
        let codesVotes = {};
        for (let doc of feedbackCodeBooksdocs.docs) {
          const data = doc.data();
          if (data.approved && codesVotes[data.code]) {
            codesVotes[data.code] = [];
          }
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
      `They met Reena at the funeral of Aunt Vi (Reena's aunt)`,
      `Aunt Vi (Reena's aunt) was their godmother`,
      `They called Reena's aunt: aunt, Aunt Vi, and loved`,
      `As a child Aunt Vi's (Reena's aunt) house was a source of understanding and calm for them`,
      `Reena entered the church as if she were coming to officiate`,
      `Reena sat down among the immediate family up front`,
      `They saw Reena when she turned to inspect those behind her`,
      `It (Reena's face) was a good copy of the original. (She looks similar but older)`,
      `There was a slight fleshiness that was never seen before (on Reena's face)`,
      `Her (Reena) features retained their distinctive touches `,
      `Reena's distinctive touches were positive set to her mouth, the assertive lift to her nose, the same insistent, unsettling eyes, unnerving, and very beautiful.`,
      `She aged lightly even after twenty years and her (Reena) face remained enviably young.`,
      `Her (Reena) real name was Doreen`,
      `Doreen is a standard name for girls among West Indians`,
      `Her (Reena) mother was from Barbados (West Indies)`,
      `The narrator's parents were from Barbados`,
      `She (Reena) changed her name to Reena on her 12th birthday`,
      `She (Reena) changed her name as a 'present to herself'`,
      `She (Reena) refused to answer to her old name (Doreen)`,
      `She (Reena) stressed that Reena has two e's`,
      `She (Reena) imprinted those e's in people's minds with the black of her eyes and threatening finger`,
      `They were not friends through their own choice`,
      `Their mothers had forced the relationship`,
      `Their mothers knew each other since their childhood`,
      `She had a quality that was unique, superior, and therefore dangerous (since she was 12)`,
      `She seemed defined`,
      `She seemed to have escaped adolescence and made a leap from childhood into the of adult life`,
      `She was reading Zola, Hauptmann, Steinbeck (at 13)`,
      `They were in the thrall of the Little Minister and Lorna Doone (the narrator)`,
      `They could not think of a world beyond Brooklyn`,
      `She talked about the Civil War in Spain, lynchings in the South, Hitler in Poland `,
      `She was talking with the outrage and passion of a revolutionary.`,
      `She was really an adult masquerading as a child`,
      `They were not her match (Narrator thinks)`,
      `Reena had a negative attitude toward them`,
      `She (Reena) put up with them (the narrator)`,
      `She (Reena) was patronizing and impatient`,
      `She (Reena) used them (the narrator) as an audience to rehearse her ideas`,
      `She (Reena) used them (the narrator) as the yardstick by which to measure her worldliness and knowledge`,
      `The US had supplied Japan with iron to make weapons against them`,
      `She overwhelmed them`,
      `She overwhelmed her family`,
      `She had a half dozen brothers and sisters`,
      `She behaved like an only child`,
      `Her father was a gentleman (with skin the color of dried tobacco)`,
      `Reena inherited her nose from her father`,
      `Her father was from Georgia`,
      `Her father made jokes about having married a foreigner`,
      `Her father was bewildered by his large family`,
      `Her father avoided her`,
      `Her mother was a small, dry, formidably black woman`,
      `Her mother was less of a person (to the narrator) than the abstract principle of force, power, energy`,
      `Her mother was strict and indulgent with Reena`,
      `Her mother was inconsistent but effective`,
    ];

    const passagesToDelete = ["UowdqbVHYMJ9Hhh5zNY3"];

    for (passage of passagesToDelete) {
      console.log(passage);
      const passageRef = db.collection("passages").doc(passage);
      if (passage === "UowdqbVHYMJ9Hhh5zNY3") {
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
            if (pCond.passage === "UowdqbVHYMJ9Hhh5zNY3") {
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

exports.addNexDataToFeedbackCode = async (req, res) => {
  try {
    const feedBack = {};
    console.log("starting");
    const userDocs = await db.collection("users").get();
    const feedbackCodeBooksdocs = await db
      .collection("feedbackCodeBooks")
      .where("approved", "==", true)
      .get();

    const previouslyAdded = new Set();
    const feedbackCodedocs = await db.collection("feedbackCode").get();

    for (let feeedbackDoc of feedbackCodedocs.docs) {
      const data = feeedbackDoc.data();
      if (!previouslyAdded.has(data.fullname)) {
        previouslyAdded.add(data.fullname);
      }
    }
    const approvedCodes = new Set();
    let codesVotes = {};
    for (let feedbackCodeBooksDoc of feedbackCodeBooksdocs.docs) {
      const data = feedbackCodeBooksDoc.data();
      if (!approvedCodes.has(data.code)) {
        codesVotes[data.code] = [];

        approvedCodes.add(data.code);
      }
    }

    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();

      let allResponsesReady = false;
      if (userData.pConditions) {
        for (let pCond of userData.pConditions) {
          if (
            "recallreText" in pCond &&
            "recall3DaysreText" in pCond &&
            "recall1WeekreText" in pCond &&
            !previouslyAdded.has(userDoc.id)
          ) {
            allResponsesReady = true;
          }
        }
      }
      if (allResponsesReady) {
        for (let explan of [
          "explanations",
          "explanations3Days",
          "explanations1Week",
        ]) {
          for (let index of [0, 1]) {
            console.log(userDoc.id);
            if (userData[explan] && userData[explan][index] !== "") {
              let choice;
              let session;
              let response;
              if (explan === "explanations") {
                session = "1st";
                if (index === 0) {
                  choice = "postQ1Choice";
                } else {
                  choice = "postQ2Choice";
                }
              } else if (explan === "explanations3Days") {
                session = "2nd";
                if (index === 0) {
                  choice = "post3DaysQ1Choice";
                } else {
                  choice = "post3DaysQ2Choice";
                }
              } else if (explan === "explanations1Week") {
                session = "3rd";
                if (index === 0) {
                  choice = "post1WeekQ1Choice";
                } else {
                  choice = "post1WeekQ2Choice";
                }
              }
              if (userData[explan][index].explanation) {
                response = userData[explan][index].explanation;
              } else {
                response = userData[explan][index];
              }
              const newFeedbackDdoc = {
                approved: false,
                codersChoices: {},
                coders: [],
                choice: userData[choice],
                project: userData.project,
                fullname: userDoc.id,
                session: session,
                explanation: response,
                createdAt: new Date(),
                expIdx: index,
                codesVotes,
                updatedAt: new Date(),
              };
              const feedbackCodeRef = db.collection("feedbackCode").doc();

              await batchSet(feedbackCodeRef, newFeedbackDdoc);
            }
          }
        }
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
};

exports.fixActivityProject = async (req, res) => {
  try {
    const researchers = await db.collection("researchers").get();

    for (let researcher of researchers.docs) {
      const researcherId = researcher.id;

      const researhcerData = researcher.data();
      const researcherProjects = Object.keys(researhcerData?.projects || {});
      console.log(researcherId, researcherProjects);
      const allActivities = await db
        .collection("activities")
        .where("fullname", "==", researcherId)
        .get();

      for (let activity of allActivities.docs) {
        const activityData = activity.data();

        if (
          !researcherProjects.includes(activityData.project) &&
          activityData.project === "H2K2" &&
          researcherProjects.includes("H1L2")
        ) {
          activityData.project = "H1L2";

          await batchUpdate(activity.ref, activityData);
        }
      }
    }
    await commitBatch();
    console.log("Done");
    res.send("Success");
  } catch (err) {
    console.log(err);
  }
};

exports.appendPointsFieldForEmptyRecalls = async (req, res) => {
  try {
    const userDocs = await db.collection("users").get();

    for (let userDoc of userDocs.docs) {
      const userRef = db.collection("users").doc(userDoc.id);
      userData = userDoc.data();
      if (userData.pConditions) {
        const userUpdate = {
          ...userData,
        };
        for (let index = 0; index < userData.pConditions.length; ++index) {
          const pcond = userData.pConditions[index];
          for (let recall of [
            "recallreText",
            "recall3DaysreText",
            "recall1WeekreText",
          ]) {
            switch (recall) {
              case "recallreText":
                recallResponse = "recallreGrade";
                break;
              case "recall3DaysreText":
                recallResponse = "recall3DaysreGrade";
                break;
              case "recall1WeekreText":
                recallResponse = "recall1WeekreGrade";
                break;
            }

            const filtered = (pcond[recall] || "")
              .split(" ")
              .filter((w) => w.trim());

            if (filtered.length <= 2) {
              userUpdate.pConditions[index][recallResponse] = 0;
            }
          }
        }
        await batchUpdate(userRef, userUpdate);
      }
    }
    await commitBatch();
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
};

const checkEmailInstitution = async (email) => {
  const domainName = email.match("@(.+)$")?.[0];
  const institutionDoc = await oneDb
    .collection("institutions")
    .where("domains", "array-contains", domainName)
    .limit(1)
    .get();

  if (institutionDoc && institutionDoc.docs.length > 0) {
    const institutionData = institutionDoc.docs[0].data();
    return institutionData.name;
  } else {
    return null;
  }
};

exports.addTheInstitutionFeildForUsers = async (req, res) => {
  try {
    console.log("Start");
    const oneUsersData = {};
    const usersOneCademyDocs = await oneDb.collection("users").get();
    for (let oneUserDoc of usersOneCademyDocs.docs) {
      const oneUserData = oneUserDoc.data();
      oneUsersData[
        {
          email: oneUserData.email,
          fName: oneUserData.fName,
          lName: oneUserData.lName,
        }
      ] = oneUserDoc.data();
    }
    const usersDocs = await db.collection("users").get();
    for (let userDoc of usersDocs.docs) {
      const userData = userDoc.data();
      const userRef = db.collection("users").doc(userDoc.id);
      let userUpdate = {};
      let foundeInst = false;
      for (let key in oneUsersData) {
        if (userData.email === key.email) {
          userUpdate = {
            institution: oneUsersData[key].deInstit,
          };
          foundeInst = true;
        } else if (
          userData.firstname === key.fName &&
          userData.lastname === key.lName
        ) {
          userUpdate = {
            institution: oneUsersData[key].deInstit,
          };
          foundeInst = true;
        }
      }
      if (!foundeInst) {
        const inst = await checkEmailInstitution(userData.email);
        if (inst) {
          userUpdate = {
            institution: inst,
          };
        } else {
          userUpdate = {
            institution: "",
          };
        }
      }
      console.log({ userUpdate });
      await batchUpdate(userRef, userUpdate);
    }
    await commitBatch();
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
};

// Add H2K2 project to Quotes collection.
exports.addH2K2toQuotes = async (req, res) => {
  try {
    const quotesDocs = await db.collection("quotes").get();
    for (let quoteDoc of quotesDocs.docs) {
      const quoteRef = db.collection("quotes").doc(quoteDoc.id);
      await batchUpdate(quoteRef, { project: "H2K2" });
    }
    await commitBatch();
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(200).json({ done: true });
};

exports.generatedBooleanExpressionData = async (req, res) => {
  try {
    const ws = fs.createReadStream("./csv/Key-phrases.csv");
    const parser = csv
      .parseStream(ws, { headers: true })
      .on("data", async (data) => {
        // We need to pause reading from the CSV file to process the row
        // before continuing with the next row.
        parser.pause();
        const extractKeyWords = {};
        const keyWords = Object.keys(data).filter((x) => x.includes("Keyword"));

        keyWords.map((keys, KeyIndex) => {
          const indexKeys = KeyIndex + 1;
          extractKeyWords[`Keyword ${indexKeys}`] = [];
          Object.entries(data).map(([key, value]) => {
            if (`Keyword ${indexKeys}`) {
              const isValid = key.includes(`K${indexKeys}`) || key === keys;
              const isArray = Array.isArray(
                extractKeyWords[`Keyword ${indexKeys}`]
              );
              if (isValid && isArray && value) {
                extractKeyWords[`Keyword ${indexKeys}`].push(value);
              }
            }
          });
        });

        const schema = [];
        for (let keys in extractKeyWords) {
          if (extractKeyWords[keys][0]) {
            const _tempSchema = {
              id: `r-${uuidv4()}`,
              keyword: extractKeyWords[keys][0],
              not: false,
            };
            let _alternatives = [];
            if (extractKeyWords[keys].length > 1) {
              extractKeyWords[keys].splice(0, 1);
              _alternatives = extractKeyWords[keys];
            }
            _tempSchema.alternatives = _alternatives;
            schema.push(_tempSchema);
          }
        }
        if (schema && schema.length > 0) {
          const newbooleanScratch = {
            email: "oneweb@umich.edu",
            fullname: "Iman YeckehZaare",
            schema,
            createdAt: new Date(),
            phrase: data["Key Phrase"],
            passage: data["Passage"],
            upVotes: 0,
            downVotes: 0,
            upVoters: [],
            downVoters: [],
          };

          const booleanRef = db.collection("booleanScratch").doc();
          await batchSet(booleanRef, newbooleanScratch);
        }
        parser.resume();
      })
      .on("end", async (e) => {
        await commitBatch();
      });
    res.status(200).json({ success: true, process: "end" });
  } catch (error) {
    console.log("error:::::", error);
    res.status(400).json({ success: false, data: [], process: "end" });
  }
};

exports.convertRsearchersProject = async (req, res) => {
  try {
    const revertResearchers = [
      "Rehana Naik Olson",
      "Ethan Hiew",
      "Benjamin Brown",
      "Louwis Truong",
      "Jennifer Mitchell",
    ];
    for (let revertResearcher of revertResearchers) {
      const revertResearcherDocs = await db
        .collection("activities")
        .where("fullname", "==", revertResearcher)
        .where("project", "==", "H1L2")
        .get();
      for (let revertResearcherDoc of revertResearcherDocs.docs) {
        const revertResearcherData = revertResearcherDoc.data();
        const newDocument = {
          ...revertResearcherData,
        };
        newDocument.project = "H2K2";
        console.log({ newDocument });
        const newDocumentRef = db.collection("activities").doc();
        await batchSet(newDocumentRef, newDocument);
      }
    }
    await commitBatch();
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
};

exports.convertRsearchersProject = async (req, res) => {
  try {
    const CodeBookscodesDocs = await db
      .collection("feedbackCodeBooks")
      .where("approved", "==", true)
      .get();
    const approvedCodes = [];
    CodeBookscodesDocs.forEach((doc) => {
      const codeData = doc.data();
      approvedCodes.push(codeData.code);
    });

    const feedBackCodeDocs = await db.collection("feedbackCode").get();
    for (let feedBackCodeDoc of feedBackCodeDocs.docs) {
      const feedBackCodeData = feedBackCodeDoc.data();
      if (!feedBackCodeData.coders.length) continue;
      const sentences = (feedBackCodeData.explanation || "")
        .split(".")
        .filter((w) => w.trim());
      const project = feedBackCodeData.project;
      let _choiceConditions = {};
      for (let sentence of sentences) {
        for (let code of approvedCodes) {
          if (_choiceConditions.hasOwnProperty(sentence)) {
            if (_choiceConditions[sentence].hasOwnProperty(code)) {
              _choiceConditions[sentence][code] =
                project === "H2K2" ? "H2" : "H1";
            } else {
              _choiceConditions[sentence] = {
                ..._choiceConditions[sentence],
                [code]: project === "H2K2" ? "H2" : "H1",
              };
            }
          } else {
            _choiceConditions = {
              ..._choiceConditions,
              [sentence]: {
                [code]: project === "H2K2" ? "H2" : "H1",
              },
            };
          }
        }
      }
      let researcherChoices = {};
      feedBackCodeData.coders.map(
        (coder) => (researcherChoices[coder] = _choiceConditions)
      );
      console.log(researcherChoices);
      const updateDocument = {
        codersChoiceConditions: researcherChoices,
      };
      const feedbackcodeRef = db
        .collection("feedbackCode")
        .doc(feedBackCodeDoc.id);
      await batchUpdate(feedbackcodeRef, updateDocument);
    }
    await commitBatch();
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
};

exports.generateTheCSVfileChatGTP = async (req, res) => {
  try {
    const gptResearcher = "Iman YeckehZaare";
    let columns = [
      "Passage_id",
      "Response_id",
      "Response",
      "Phrase",
      "Grade by Davinci",
      "Confidence by Davinci ",
      "Grade by Turbo",
      "Grade by GPT-4",
      "Confidence by GPT-4",
      "Majority Of votes",
      "Researchers grades",
      "Satisfied the boolean expression",
    ];

    const Researchers = [
      "Ethan Hiew",
      "Louwis Truong",
      "Benjamin Brown",
      "Jennifer Tso",
      "Rehana Naik Olson",
      "Iman YeckehZaare",
      "Yizhou Chao",
      "Tirdad Barghi",
      "Xiaowen Yuan",
      "Amelia Henriques",
      "Leah O'Neill",
      "Jessica Cai",
      "Ziyi Wang",
      "Cynthia Lee",
      "Shaobo Liang",
      "Ember Shan",
      "Roman Zapata",
      "Sarah Berland",
      "Jeffery Phonn",
      "Amy Deng",
      "Jennifer Tso",
      "Weiwei Tan",
      "Mike Deng",
    ];
    let rowData = [[...columns, ...Researchers]];
    let row;
    console.log(":: start ::");
    const recallGradesV2Docs = await db.collection("recallGradesV2").get();
    for (let recallDoc of recallGradesV2Docs.docs) {
      const recallData = recallDoc.data();
      for (let session in recallData.sessions) {
        for (conditionItem of recallData.sessions[session]) {
          for (let phrase of conditionItem.phrases) {
            const researcherIdx = phrase.researchers.indexOf(gptResearcher);
            let otherResearchers = phrase.researchers.slice();
            let otherGrades = phrase.grades.slice();
            if (researcherIdx !== -1) {
              otherResearchers.splice(researcherIdx, 1);
              otherGrades.splice(researcherIdx, 1);
            }
            console.log(
              "phrase.researchers",
              phrase.researchers,
              phrase.phrase,
              conditionItem.passage
            );
            if (otherResearchers.length === 0 && !phrase.satisfied) {
              otherResearchers = [
                ...[
                  "Ethan Hiew",
                  "Louwis Truong",
                  "Benjamin Brown",
                  "Jennifer Tso",
                  "Rehana Naik Olson",
                  "Iman YeckehZaare",
                ]
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 4),
              ];
              otherGrades = Array(4).fill(false);
            }
            const upVotes = otherGrades.filter((grade) => grade).length;
            const downVotes = otherGrades.filter((grade) => !grade).length;
            row = [
              conditionItem.passage,
              recallDoc.id,
              conditionItem.response,
              phrase.phrase,
              phrase.hasOwnProperty("DavinciGrade")
                ? phrase.DavinciGrade
                  ? "YES"
                  : "NO"
                : "",
              phrase.hasOwnProperty("DavinciConfidence")
                ? phrase.DavinciConfidence
                : "",
              phrase.hasOwnProperty("chatGPTGrade")
                ? phrase.chatGPTGrade
                  ? "YES"
                  : "NO"
                : "",
              phrase.hasOwnProperty("gpt4Grade")
                ? phrase.gpt4Grade
                  ? "NO"
                  : "YES"
                : "",
              phrase.hasOwnProperty("gpt4Confidence")
                ? phrase.gpt4Confidence
                : "",

              phrase.hasOwnProperty("majority")
                ? phrase.majority
                  ? "NO"
                  : "YES"
                : upVotes < 3 && downVotes < 3
                ? ""
                : upVotes < downVotes
                ? "NO"
                : "YES",
              [otherGrades.map((grade) => (grade ? "Yes" : "No")).join(",")],
              phrase.hasOwnProperty("satisfied")
                ? phrase.satisfied
                  ? "YES"
                  : "NO"
                : "",
            ];

            let rowGrades = Array(Researchers.length).fill("");
            for (let researcher of otherResearchers) {
              const indexRes = Researchers.indexOf(researcher);
              if (indexRes === -1) continue;
              rowGrades[indexRes] = otherGrades[
                otherResearchers.indexOf(researcher)
              ]
                ? "YES"
                : "NO";
            }
            row = [...row, ...rowGrades];
            rowData.push(row);
          }
        }
      }
    }
    csv
      .writeToPath("chatGPTRecallGrades.csv", [...rowData], {
        headers: true,
      })
      .on("finish", () => {
        console.log("Done!");
      });
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(200).json({ done: true });
};

exports.gradeRecallGradesV2ChatGPT = async (req, res) => {
  try {
    console.log("start");
    const configuration = new Configuration({
      apiKey: "",
    });
    const openai = new OpenAIApi(configuration);

    const passageTextbyID = {};

    const passageDocs = await db.collection("passages").get();
    passageDocs.forEach((passageDoc) => {
      const passageData = passageDoc.data();
      passageTextbyID[passageDoc.id] = passageData.text;
    });

    const recallGradesV2Docs = await db.collection("recallGradesV2").get();
    let counter = 0;
    recallGradesV2Docs.forEach(async (recallDoc) => {
      const recallV2Data = recallDoc.data();
      const sessionsUpdate = recallV2Data.sessions;
      for (let session in recallV2Data.sessions) {
        for (
          let condition = 0;
          condition < recallV2Data.sessions[session].length;
          condition++
        ) {
          const response = recallV2Data.sessions[session][condition].response;
          const passageText =
            passageTextbyID[recallV2Data.sessions[session][condition].passage];
          for (let indexPhrase in recallV2Data.sessions[session][condition]
            .phrases) {
            if (
              !recallV2Data.sessions[session][condition].phrases[indexPhrase] ||
              !recallV2Data.sessions[session][condition].phrases[indexPhrase]
                .researchers ||
              !recallV2Data.sessions[session][condition].phrases[indexPhrase]
                .researchers.length
            )
              continue;
            const phrase =
              recallV2Data.sessions[session][condition].phrases[indexPhrase]
                .phrase;
            let grades =
              recallV2Data.sessions[session][condition].phrases[indexPhrase]
                .grades;
            const botIndex = recallV2Data.sessions[session][condition].phrases[
              indexPhrase
            ].researchers.findIndex((r) => r === "Iman YeckehZaare");
            if (botIndex > -1) {
              grades = grades.splice(botIndex, 1);
            }
            const countTrue = grades.filter((r) => r === true).length;
            const countFalse = grades.filter((r) => r === false).length;
            if (countTrue < 3 && countFalse < 3) continue;
            const chatGPTRequest =
              `Is the phrase` +
              `"` +
              `${phrase}` +
              `" mentioned in the following triple-quoted text?` +
              +`'''\n` +
              `${response}` +
              `'''\n` +
              `Your response should include two lines, separated by a new line character.\n
              In the first line, only print YES or NO. Do not add any more explanations.\n
              In the next line of your response, explain why you answered YES or NO in the previous line.`;

            const completion = await openai.createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: chatGPTRequest }],
            });

            const responseFromChatGPT =
              completion.data.choices[0].message.content;
            console.log("***");
            console.log(
              responseFromChatGPT.trim(),
              "Resulte:",
              responseFromChatGPT.trim().slice(0, 3)
            );
            console.log("***");
            console.log(counter++);

            const grade =
              responseFromChatGPT.trim().slice(0, 3).toLowerCase() === "yes"
                ? true
                : false;
            const explanation = responseFromChatGPT
              .trim()
              .slice(3)
              .split(".")
              .join(".");
            sessionsUpdate[session][condition].phrases[
              indexPhrase
            ].chatGPTGrade = grade;
            sessionsUpdate[session][condition].phrases[
              indexPhrase
            ].chatGPTExplanation = explanation;
          }
        }
      }
      const recallGradesRef = db.collection("recallGradesV2").doc(recallDoc.id);
      await recallGradesRef.update({ sessions: sessionsUpdate });
    });
    console.log("Done:");
  } catch (error) {
    console.log(error);
  }
};

exports.removeTheBotsVotes = async (req, res) => {
  try {
    const gptResearcher = "Iman YeckehZaare";

    const _recallGrades = await db.collection("recallGradesV2").get();
    for (const recallGrade of _recallGrades.docs) {
      const recallGradeData = recallGrade.data();

      for (const session in recallGradeData.sessions) {
        for (const conditionItem of recallGradeData.sessions[session]) {
          for (const phrase of conditionItem.phrases) {
            if (!phrase.researchers) continue;
            const researcherIdx = phrase.researchers.indexOf(gptResearcher);
            if (researcherIdx !== -1) {
              phrase.researchers.splice(researcherIdx, 1);
              phrase.grades.splice(researcherIdx, 1);
            }
          }
          if (conditionItem.researcher) {
            const rmResearcherIdx =
              conditionItem.researchers.indexOf(gptResearcher);
            conditionItem.researchers.splice(rmResearcherIdx, 1);
          }
        }
      }

      const recallRef = db.collection("recallGradesV2").doc(recallGrade.id);
      await recallRef.update({
        sessions: recallGradeData.sessions,
      });
    }

    console.log("Done.");
  } catch (error) {
    console.log(error);
  }
};
