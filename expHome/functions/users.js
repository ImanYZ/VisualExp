const fs = require("fs");
const csv = require("fast-csv");
require("dotenv").config();

const {
  admin,
  db,
  commitBatch,
  batchSet,
  batchUpdate,
  batchDelete,
} = require("./admin");
const { getFullname } = require("./utils");
const {
  emailApplicationStatus,
  emailCommunityLeader,
  emailImanToInviteApplicants,
} = require("./emailing");

exports.deleteUser = async (snap, context) => {
  // Get an object representing the document prior to deletion
  // e.g. {'name': 'Marie', 'age': 66}
  const userData = snap.data();
  const project = userData.project;
  const pConditions = userData.pConditions;
  for (let { passage, condition } of pConditions) {
    try {
      await db.runTransaction(async (t) => {
        const conditionRef = db.collection("conditions").doc(condition);
        const conditionDoc = await t.get(conditionRef);
        const conditionData = conditionDoc.data();
        const passageRef = db.collection("passages").doc(passage);
        const passageDoc = await t.get(passageRef);
        const passageData = passageDoc.data();
        t.update(conditionRef, { [project]: conditionData[project] - 1 });
        t.update(passageRef, {
          projects: {
            ...passageData.projects,
            [project]: {
              ...passageData.projects[project],
              [condition]: passageData.projects[project][condition] - 1,
            },
          },
        });
      });
    } catch (e) {
      console.log("Transaction failure:", e);
    }
  }
};

exports.recalculateFreeRecall = async (req, res) => {
  try {
    const usersDocs = await db.collection("users").get();
    for (let userD of usersDocs.docs) {
      try {
        await db.runTransaction(async (t) => {
          const userRef = db.collection("users").doc(userD.id);
          const userDoc = await t.get(userRef);
          const userData = userDoc.data();
          const pConditions = userData.pConditions;
          for (let pCondIdx = 0; pCondIdx < pConditions.length; pCondIdx++) {
            const pCond = pConditions[pCondIdx];
            const reText = pCond.recallreText;
            const recall3DaysreText = pCond.recall3DaysreText
              ? pCond.recall3DaysreText
              : "";
            const passage = pCond.passage;
            const passageRef = db.collection("passages").doc(passage);
            const passageDoc = await t.get(passageRef);
            const passageData = passageDoc.data();
            const keywords = passageData.keywords.join(" ");
            const text = passageData.text;
            let score = 0;
            let score3Days = 0;
            const keywordsText = tokenize(keywords.toLowerCase());
            const mainText = tokenize(text.toLowerCase());
            const recalledText = tokenize(reText.toLowerCase());
            const recalled3DaysText = tokenize(recall3DaysreText.toLowerCase());
            for (let t1 of keywordsText) {
              if (recalledText.includes(t1)) {
                score += 1;
              }
              if (recalled3DaysText.includes(t1)) {
                score3Days += 1;
              }
            }
            pConditions[pCondIdx] = {
              ...pConditions[pCondIdx],
              recallScore: score,
              recallScoreRatio: score / keywordsText.length,
              recallCosineSim: textCosineSimilarity(mainText, recalledText),
              recall3DaysScore: score3Days,
              recall3DaysScoreRatio: score3Days / keywordsText.length,
              recall3DaysCosineSim: textCosineSimilarity(
                mainText,
                recalled3DaysText
              ),
            };
          }
          t.update(userRef, {
            pConditions,
          });
          const userLogRef = db.collection("userLogs").doc();
          t.update(userLogRef, {
            pConditions,
            id: userRef.id,
            updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
          });
        });
      } catch (e) {
        console.log("Transaction failure:", e);
      }
    }
    return res.status(200).json({ done: true });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.reassignAllPConditionNums = async (req, res) => {
  const project = "H2K2";
  try {
    const conditionDocs = await db.collection("conditions").get();
    for (let conditionDoc of conditionDocs.docs) {
      const conditionRef = db.collection("conditions").doc(conditionDoc.id);
      await batchSet(conditionRef, { [project]: 0 });
    }
    const passageDocs = await db.collection("passages").get();
    for (let passageDoc of passageDocs.docs) {
      const passageRef = db.collection("passages").doc(passageDoc.id);
      const passageData = passageDoc.data();
      if (project in passageData.projects) {
        await batchUpdate(passageRef, {
          projects: {
            ...passageData.projects,
            [project]: {
              H2: 0,
              K2: 0,
            },
          },
        });
      }
    }
    await commitBatch();
    const increment = admin.firestore.FieldValue.increment(1);
    const userDocs = await db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();
      if (userData.pConditions) {
        let passagesIncluded = 0;
        for (let { passage, condition } of userData.pConditions) {
          const passageD = await db.collection("passages").doc(passage).get();
          const passageDa = passageD.data();
          if (project in passageDa.projects) {
            passagesIncluded += 1;
          }
        }
        if (passagesIncluded === 2) {
          for (let { passage, condition } of userData.pConditions) {
            const conditionRef = db.collection("conditions").doc(condition);
            await conditionRef.update({ [project]: increment });
            try {
              await db.runTransaction(async (t) => {
                const passageRef = db.collection("passages").doc(passage);
                const passageDoc = await t.get(passageRef);
                const passageData = passageDoc.data();
                if (project in passageData.projects) {
                  t.update(passageRef, {
                    projects: {
                      ...passageData.projects,
                      [project]: {
                        ...passageData.projects[project],
                        [condition]:
                          passageData.projects[project][condition] + 1,
                      },
                    },
                  });
                }
              });
            } catch (e) {
              console.log("Transaction failure:", e);
            }
          }
        }
      }
    }
    return res.status(200).json({ done: true });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.changeTo3Days = async (req, res) => {
  try {
    const userDocs = await db.collection("users").get();
    for (let userD of userDocs.docs) {
      try {
        await db.runTransaction(async (t) => {
          const userRef = db.collection("users").doc(userD.id);
          const userDoc = await t.get(userRef);
          const userData = userDoc.data();
          const newPConditions = userData.pConditions;
          for (let pCondition of newPConditions) {
            if ("recall4DaysCosineSim" in pCondition) {
              pCondition.recall3DaysCosineSim = pCondition.recall4DaysCosineSim;
              delete pCondition.recall4DaysCosineSim;
            }
            if ("recall4DaysEnded" in pCondition) {
              pCondition.recall3DaysEnded = pCondition.recall4DaysEnded;
              delete pCondition.recall4DaysEnded;
            }
            if ("recall4DaysScore" in pCondition) {
              pCondition.recall3DaysScore = pCondition.recall4DaysScore;
              delete pCondition.recall4DaysScore;
            }
            if ("recall4DaysScoreRatio" in pCondition) {
              pCondition.recall3DaysScoreRatio =
                pCondition.recall4DaysScoreRatio;
              delete pCondition.recall4DaysScoreRatio;
            }
            if ("recall4DaysStart" in pCondition) {
              pCondition.recall3DaysStart = pCondition.recall4DaysStart;
              delete pCondition.recall4DaysStart;
            }
            if ("recall4DaysTime" in pCondition) {
              pCondition.recall3DaysTime = pCondition.recall4DaysTime;
              delete pCondition.recall4DaysTime;
            }
            if ("recall4DaysreText" in pCondition) {
              pCondition.recall3DaysreText = pCondition.recall4DaysreText;
              delete pCondition.recall4DaysreText;
            }
            if ("test4Days" in pCondition) {
              pCondition.test3Days = pCondition.test4Days;
              delete pCondition.test4Days;
            }
            if ("test4DaysEnded" in pCondition) {
              pCondition.test3DaysEnded = pCondition.test4DaysEnded;
              delete pCondition.test4DaysEnded;
            }
            if ("test4DaysScore" in pCondition) {
              pCondition.test3DaysScore = pCondition.test4DaysScore;
              delete pCondition.test4DaysScore;
            }
            if ("test4DaysScoreRatio" in pCondition) {
              pCondition.test3DaysScoreRatio = pCondition.test4DaysScoreRatio;
              delete pCondition.test4DaysScoreRatio;
            }
            if ("test4DaysTime" in pCondition) {
              pCondition.test3DaysTime = pCondition.test4DaysTime;
              delete pCondition.test4DaysTime;
            }
          }
          userData.pConditions = newPConditions;
          if ("explanations2" in userData) {
            userData.explanations3Days = userData.explanations2;
            delete userData.explanations2;
          }
          if ("post2Q1Choice" in userData) {
            userData.post3DaysQ1Choice = userData.post2Q1Choice;
            delete userData.post2Q1Choice;
          }
          if ("post2Q2Choice" in userData) {
            userData.post3DaysQ2Choice = userData.post2Q2Choice;
            delete userData.post2Q2Choice;
          }
          if ("post2QsEnded" in userData) {
            userData.post3DaysQsEnded = userData.post2QsEnded;
            delete userData.post2QsEnded;
          }
          if ("post2QsStart" in userData) {
            userData.post3DaysQsStart = userData.post2QsStart;
            delete userData.post2QsStart;
          }
          t.set(userRef, userData);
        });
      } catch (e) {
        console.log("Transaction failure:", e);
      }
    }
    return res.status(200).json({ done: true });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.loadContacts = async (req, res) => {
  try {
    let rowIdx = 0;
    const ws = fs.createReadStream("datasets/Contacts.csv");
    csv
      .parseStream(ws, { headers: true })
      .on("error", (error) => {
        console.error(error);
        return res.status(500).json({ error });
      })
      .on("data", async (row) => {
        console.log(row);
        const fullname = getFullname(row.firstname, row.lastname);
        const contactRef = db.collection("contacts").doc(fullname);
        if (!contactRef.exists) {
          await contactRef.set({
            firstname: row.firstname,
            lastname: row.lastname,
            email: row.email,
            from1Cademy: row["1Cademy"] === "1",
          });
        }
        rowIdx += 1;
      });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(500).json({ done: true });
};

// Download the dataset in CSV
exports.retrieveData = async (req, res) => {
  let rowsData, usersDocs, userData, row, pCond;
  try {
    rowsData = [
      [
        "fullname",
        "userIndex",
        "birthDate",
        "cond2Start",
        "createdAt",
        "demoQsEnded",
        "demoQsStart",
        "education",
        "email",
        "ethnicity",
        "gender",
        "language",
        "major",
        "nullPassage",
        "Phase",
        "condition",
        "passage",
        "pretest0",
        "pretest1",
        "pretest2",
        "pretest3",
        "pretest4",
        "pretest5",
        "pretest6",
        "pretest7",
        "pretest8",
        "pretest9",
        "pretestEnded",
        "pretestScore",
        "pretestScoreRatio",
        "pretestTime",
        "previewEnded",
        "previewTime",
        "recallEnded",
        "recallScore",
        "recallScoreRatio",
        "recallCosineSim",
        "recallStart",
        "recallTime",
        "recallreText",
        "test0",
        "test1",
        "test2",
        "test3",
        "test4",
        "test5",
        "test6",
        "test7",
        "test8",
        "test9",
        "testEnded",
        "testScore",
        "testScoreRatio",
        "testTime",
        "recall3DaysEnded",
        "recall3DaysScore",
        "recall3DaysScoreRatio",
        "recall3DaysCosineSim",
        "recall3DaysStart",
        "recall3DaysTime",
        "recall3DaysreText",
        "test3Days0",
        "test3Days1",
        "test3Days2",
        "test3Days3",
        "test3Days4",
        "test3Days5",
        "test3Days6",
        "test3Days7",
        "test3Days8",
        "test3Days9",
        "test3DaysEnded",
        "test3DaysScore",
        "test3DaysScoreRatio",
        "test3DaysTime",
        "recall1WeekEnded",
        "recall1WeekScore",
        "recall1WeekScoreRatio",
        "recall1WeekCosineSim",
        "recall1WeekStart",
        "recall1WeekTime",
        "recall1WeekreText",
        "test1Week0",
        "test1Week1",
        "test1Week2",
        "test1Week3",
        "test1Week4",
        "test1Week5",
        "test1Week6",
        "test1Week7",
        "test1Week8",
        "test1Week9",
        "test1WeekEnded",
        "test1WeekScore",
        "test1WeekScoreRatio",
        "test1WeekTime",
        "postQChoice",
        "postQsEnded",
        "postQsStart",
        "post3DaysQChoice",
        "post3DaysQsEnded",
        "post3DaysQsStart",
        "post1WeekQChoice",
        "post1WeekQsEnded",
        "post1WeekQsStart",
        "explanation1",
        "explanation3Days",
        "explanation1Week",
      ],
    ];
    usersDocs = await db.collection("users").get();
    let userIndex = 0;
    for (let userDoc of usersDocs.docs) {
      userData = userDoc.data();
      for (let pCIdx = 0; pCIdx < userData.pConditions.length; pCIdx++) {
        row = [];
        row.push(userDoc.id);
        userIndex += 1;
        row.push(userIndex);
        row.push(userData.birthDate ? userData.birthDate.toDate() : "");
        row.push(userData.cond2Start.toDate());
        row.push(userData.createdAt.toDate());
        row.push(userData.demoQsEnded ? userData.demoQsEnded.toDate() : "");
        row.push(userData.demoQsStart ? userData.demoQsStart.toDate() : "");
        row.push(userData.education ? userData.education : "");
        row.push(userData.email ? userData.email : "");
        row.push(userData.ethnicity ? userData.ethnicity.join(" - ") : "");
        row.push(userData.gender ? userData.gender : "");
        row.push(userData.language ? userData.language : "");
        row.push(userData.major ? userData.major : "");
        row.push(userData.nullPassage);
        row.push(pCIdx);
        pCond = userData.pConditions[pCIdx];
        row.push(pCond.condition);
        row.push(pCond.passage);
        for (let idx = 0; idx < 10; idx++) {
          if (idx < pCond.pretest.length) {
            row.push(pCond.pretest[idx]);
          } else {
            row.push("");
          }
        }
        row.push(pCond.pretestEnded ? pCond.pretestEnded.toDate() : "");
        row.push("pretestScore" in pCond ? pCond.pretestScore : "");
        row.push("pretestScoreRatio" in pCond ? pCond.pretestScoreRatio : "");
        row.push("pretestTime" in pCond ? pCond.pretestTime : "");
        row.push("previewEnded" in pCond ? pCond.previewEnded.toDate() : "");
        row.push("previewTime" in pCond ? pCond.previewTime : "");
        row.push("recallEnded" in pCond ? pCond.recallEnded.toDate() : "");
        row.push("recallScore" in pCond ? pCond.recallScore : "");
        row.push("recallScoreRatio" in pCond ? pCond.recallScoreRatio : "");
        row.push("recallCosineSim" in pCond ? pCond.recallCosineSim : "");
        row.push("recallStart" in pCond ? pCond.recallStart.toDate() : "");
        row.push("recallTime" in pCond ? pCond.recallTime : "");
        row.push("recallreText" in pCond ? pCond.recallreText : "");
        for (let idx = 0; idx < 10; idx++) {
          if (idx < pCond.test.length) {
            row.push(pCond.test[idx]);
          } else {
            row.push("");
          }
        }
        row.push("testEnded" in pCond ? pCond.testEnded.toDate() : "");
        row.push("testScore" in pCond ? pCond.testScore : "");
        row.push("testScoreRatio" in pCond ? pCond.testScoreRatio : "");
        row.push("testTime" in pCond ? pCond.testTime : "");
        if (userData.post3DaysQsEnded) {
          row.push(
            pCond.recall3DaysEnded ? pCond.recall3DaysEnded.toDate() : ""
          );
          row.push("recall3DaysScore" in pCond ? pCond.recall3DaysScore : "");
          row.push(
            "recall3DaysScoreRatio" in pCond ? pCond.recall3DaysScoreRatio : ""
          );
          row.push(
            "recall3DaysCosineSim" in pCond ? pCond.recall3DaysCosineSim : ""
          );
          row.push(
            "recall3DaysStart" in pCond ? pCond.recall3DaysStart.toDate() : ""
          );
          row.push("recall3DaysTime" in pCond ? pCond.recall3DaysTime : "");
          row.push("recall3DaysreText" in pCond ? pCond.recall3DaysreText : "");
          for (let idx = 0; idx < 10; idx++) {
            if (idx < pCond.test3Days.length) {
              row.push(pCond.test3Days[idx]);
            } else {
              row.push("");
            }
          }
          row.push(pCond.test3DaysEnded ? pCond.test3DaysEnded.toDate() : "");
          row.push("test3DaysScore" in pCond ? pCond.test3DaysScore : "");
          row.push(
            "test3DaysScoreRatio" in pCond ? pCond.test3DaysScoreRatio : ""
          );
          row.push("test3DaysTime" in pCond ? pCond.test3DaysTime : "");
        } else {
          for (let idx = 0; idx < 21; idx++) {
            row.push("");
          }
        }
        if (userData.post1WeekQsEnded) {
          row.push(
            pCond.recall1WeekEnded ? pCond.recall1WeekEnded.toDate() : ""
          );
          row.push("recall1WeekScore" in pCond ? pCond.recall1WeekScore : "");
          row.push(
            "recall1WeekScoreRatio" in pCond ? pCond.recall1WeekScoreRatio : ""
          );
          row.push(
            "recall1WeekCosineSim" in pCond ? pCond.recall1WeekCosineSim : ""
          );
          row.push(
            "recall1WeekStart" in pCond ? pCond.recall1WeekStart.toDate() : ""
          );
          row.push("recall1WeekTime" in pCond ? pCond.recall1WeekTime : "");
          row.push("recall1WeekreText" in pCond ? pCond.recall1WeekreText : "");
          for (let idx = 0; idx < 10; idx++) {
            if (idx < pCond.test1Week.length) {
              row.push(pCond.test1Week[idx]);
            } else {
              row.push("");
            }
          }
          row.push(pCond.test1WeekEnded ? pCond.test1WeekEnded.toDate() : "");
          row.push("test1WeekScore" in pCond ? pCond.test1WeekScore : "");
          row.push(
            "test1WeekScoreRatio" in pCond ? pCond.test1WeekScoreRatio : ""
          );
          row.push("test1WeekTime" in pCond ? pCond.test1WeekTime : "");
        } else {
          for (let idx = 0; idx < 21; idx++) {
            row.push("");
          }
        }
        row.push(pCIdx === 0 ? userData.postQ1Choice : userData.postQ2Choice);
        row.push(userData.postQsEnded ? userData.postQsEnded.toDate() : "");
        row.push(userData.postQsStart ? userData.postQsStart.toDate() : "");
        if (userData.post3DaysQsEnded) {
          row.push(
            pCIdx === 0
              ? userData.post3DaysQ1Choice
              : userData.post3DaysQ2Choice
          );
          row.push(
            userData.post3DaysQsEnded ? userData.post3DaysQsEnded.toDate() : ""
          );
          row.push(
            userData.post3DaysQsStart ? userData.post3DaysQsStart.toDate() : ""
          );
        } else {
          for (let idx = 0; idx < 3; idx++) {
            row.push("");
          }
        }
        if (userData.post1WeekQsEnded) {
          row.push(
            pCIdx === 0
              ? userData.post1WeekQ1Choice
              : userData.post1WeekQ2Choice
          );
          row.push(
            userData.post1WeekQsEnded ? userData.post1WeekQsEnded.toDate() : ""
          );
          row.push(
            userData.post1WeekQsStart ? userData.post1WeekQsStart.toDate() : ""
          );
        } else {
          for (let idx = 0; idx < 3; idx++) {
            row.push("");
          }
        }
        row.push(
          "explanations" in userData && userData.explanations[pCIdx]
            ? userData.explanations[pCIdx]
            : ""
        );
        row.push(
          userData.explanations3Days ? userData.explanations3Days[pCIdx] : ""
        );
        row.push(
          userData.explanations1Week ? userData.explanations1Week[pCIdx] : ""
        );
        rowsData.push(row);
      }
    }
    writeToPath("datasets/data.csv", rowsData, { headers: true }).on(
      "finish",
      () => {
        console.log("done process data!");
      }
    );
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(200).json({ done: false });
};

// Download the dataset in CSV
exports.feedbackData = async (req, res) => {
  let rowsData, usersDocs, userData, row;
  try {
    rowsData = [
      [
        "fullname",
        "postQ1Choice",
        "explanation1",
        "postQ2Choice",
        "explanation2",
        "postQ1Choice-3Days",
        "explanation1-3Days",
        "postQ2Choice-3Days",
        "explanation2-3Days",
        "postQ1Choice-1Week",
        "explanation1-1Week",
        "postQ2Choice-1Week",
        "explanation2-1Week",
      ],
    ];
    usersDocs = await db.collection("users").get();
    for (let userDoc of usersDocs.docs) {
      userData = userDoc.data();
      row = [];
      row.push(userDoc.id);
      row.push(userData.postQ1Choice);
      row.push(userData.explanations[0]);
      row.push(userData.postQ2Choice);
      row.push(userData.explanations[1]);
      if (userData.post3DaysQsEnded) {
        row.push(userData.post3DaysQ1Choice);
        row.push(
          userData.explanations3Days ? userData.explanations3Days[0] : ""
        );
        row.push(userData.post3DaysQ2Choice);
        row.push(
          userData.explanations3Days ? userData.explanations3Days[1] : ""
        );
      } else {
        for (let idx = 0; idx < 4; idx++) {
          row.push("");
        }
      }
      if (userData.post1WeekQsEnded) {
        row.push(userData.post1WeekQ1Choice);
        row.push(
          userData.explanations1Week ? userData.explanations1Week[0] : ""
        );
        row.push(userData.post1WeekQ2Choice);
        row.push(
          userData.explanations1Week ? userData.explanations1Week[1] : ""
        );
      } else {
        for (let idx = 0; idx < 4; idx++) {
          row.push("");
        }
      }
      rowsData.push(row);
    }
    writeToPath("datasets/feedbackData.csv", rowsData, { headers: true }).on(
      "finish",
      () => {
        console.log("done process data!");
      }
    );
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(200).json({ done: true });
};

// Call this in a PubSub every 25 hours.
// Email reminder to community leaders of the applicants who have completed the
// application and waiting for their response.
// Email reminder emails to those applicatns who have completed the 3 experiment
// sessions, but have not withdrawn or submitted any complete applications.
exports.applicationReminder = async (context) => {
  try {
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    let waitTime = 0;
    // Retrieve all the applicants who have completed the 3 experiment sessions.
    const usersDocs = await db
      .collection("users")
      .where("projectDone", "==", true)
      .get();
    // Array of information to be emailed to every applicant whose application
    // is incomplete.
    const reminders = [];
    // Object of arrays of applicants' information to be sent to the community
    // leaders to review, where each key is a communityId and the corresponding value is
    // an array of the fullnames of the applicants under the review.
    const needReview = {};
    // Array of objects of applicants' information and their communities to be sent to
    // Iman to invite to Microsoft Teams:
    const needInvite = [];
    for (let userDoc of usersDocs.docs) {
      const userData = userDoc.data();
      // If the applicant has not withdrawn their application, retrieve all the completed
      // applications for this applicant.
      if (!("withdrew" in userData) || !userData.withdrew) {
        const applicationDocs = await db
          .collection("applications")
          .where("fullname", "==", userDoc.id)
          .where("ended", "==", true)
          .get();
        for (let applicationDoc of applicationDocs.docs) {
          const applicationData = applicationDoc.data();
          // If the application is completed but the community leader has neither
          // accpeted or rejected it:
          if (!applicationData.accepted && !applicationData.rejected) {
            if (applicationData.communiId in needReview) {
              needReview[applicationData.communiId].push(
                applicationData.fullname
              );
            } else {
              needReview[applicationData.communiId] = [
                applicationData.fullname,
              ];
            }
          }
          if (applicationData.confirmed && !applicationData.invited) {
            needInvite.push({
              applicant: applicationData.fullname,
              communiId: applicationData.communiId,
            });
          }
        }
      }
      if (
        (!("withdrew" in userData) || !userData.withdrew) &&
        (!("applicationSubmitted" in userData) ||
          !userData.applicationSubmitted ||
          !("applicationsSubmitted" in userData) ||
          Object.keys(userData.applicationsSubmitted).length === 0) &&
        (!("reminder" in userData) ||
          userData.reminder.toDate() <= new Date()) &&
        "createdAt" in userData &&
        userData.createdAt.toDate() > new Date("1-14-2022")
      ) {
        let remindersNum = 0;
        if ("reminders" in userData && userData.reminders) {
          remindersNum = userData.reminders;
        }
        if (remindersNum < 3) {
          // const tutorialDoc = await db
          //   .collection("tutorial")
          //   .doc(userDoc.id)
          //   .get();
          // if (tutorialDoc.exists) {
          //   const tutorialData = tutorialDoc.data();
          //   if ("ended" in tutorialData && tutorialData.ended) {
          let submittedOne = false;
          const applicationDocs = await db
            .collection("applications")
            .where("fullname", "==", userDoc.id)
            .get();
          for (let applicationDoc of applicationDocs.docs) {
            const applicationData = applicationDoc.data();
            if ("ended" in applicationData && applicationData.ended) {
              submittedOne = true;
            }
          }
          if (!submittedOne) {
            reminders.push({
              email: userData.email,
              firstname: userData.firstname,
              fullname: userDoc.id,
              reminders: remindersNum,
              subject: "Your 1Cademy Application is Incomplete!",
              content:
                "completed the first three steps in 1Cademy application system, but have not submitted any application to any of our research communities yet",
              hyperlink: "https://1cademy.us/home#JoinUsSection",
            });
          }
          // } else {
          //   reminders.push({
          //     email: userData.email,
          //     firstname: userData.firstname,
          //     fullname: userDoc.id,
          //     reminders: remindersNum,
          //     subject: "Your 1Cademy Application is Incomplete!",
          //     content:
          //       "completed the first two steps in 1Cademy application process, but have not completed the 1Cademy tutorial yet",
          //     hyperlink: "https://1cademy.us/home#JoinUsSection",
          //   });
        }
        // } else {
        //   reminders.push({
        //     email: userData.email,
        //     firstname: userData.firstname,
        //     fullname: userDoc.id,
        //     reminders: remindersNum,
        //     subject: "Your 1Cademy Application is Incomplete!",
        //     content:
        //       "completed the first two steps in 1Cademy application process, but have not started the 1Cademy tutorial yet",
        //     hyperlink: "https://1cademy.us/home#JoinUsSection",
        //   });
        // }
        // }
      }
    }
    // Send reminder emails to community leaders about the completed applications
    // that they have not responded to yet.
    for (let communiId in needReview) {
      if (needReview[communiId].length > 0) {
        const communityLeaderDocs = await db
          .collection("users")
          .where("leading", "array-contains", communiId)
          .get();
        for (let communityLeaderDoc of communityLeaderDocs.docs) {
          const communityLeaderData = communityLeaderDoc.data();
          // Because I am considered a leader in all communities.
          // if (communityLeaderData.email !== "oneweb@umich.edu") {
          setTimeout(() => {
            emailCommunityLeader(
              communityLeaderData.email,
              communityLeaderData.firstname,
              communiId,
              needReview[communiId]
            );
          }, waitTime);
          // Increase waitTime by a random integer between 1 to 4 seconds.
          waitTime += 1000 * (1 + Math.floor(Math.random() * 3));
          // }
        }
      }
    }
    // Send reminder emails to to Iman to invite the confirmed applicants to
    // Microsoft Teams.
    if (needInvite.length > 0) {
      setTimeout(() => {
        emailImanToInviteApplicants(needInvite);
      }, waitTime);
      // Increase waitTime by a random integer between 1 to 4 seconds.
      waitTime += 1000 * (1 + Math.floor(Math.random() * 3));
    }
    for (let reminder of reminders) {
      setTimeout(() => {
        emailApplicationStatus(
          reminder.email,
          reminder.firstname,
          reminder.fullname,
          reminder.reminders,
          reminder.subject,
          reminder.content,
          reminder.hyperlink
        );
      }, waitTime);
      // Increase waitTime by a random integer between 1 to 4 seconds.
      waitTime += 1000 * (1 + Math.floor(Math.random() * 3));
    }
  } catch (err) {
    console.log({ err });
  }
};
