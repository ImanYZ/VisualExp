const fs = require("fs");
const csv = require("fast-csv");
require("dotenv").config();

const { admin, db, commitBatch, batchSet, batchUpdate, batchDelete } = require("./admin");
const { getFullname, getDateString, getDateTimeString } = require("./utils");
const { emailApplicationStatus, emailCommunityLeader, emailImanToInviteApplicants } = require("./emailing");

exports.deleteUser = async (snap, context) => {
  // Get an object representing the document prior to deletion
  // e.g. {'name': 'Marie', 'age': 66}
  const userData = snap.data();
  const project = userData.project;
  const pConditions = userData.pConditions;
  for (let { passage, condition } of pConditions) {
    try {
      await db.runTransaction(async t => {
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
              [condition]: passageData.projects[project][condition] - 1
            }
          }
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
        await db.runTransaction(async t => {
          const userRef = db.collection("users").doc(userD.id);
          const userDoc = await t.get(userRef);
          const userData = userDoc.data();
          const pConditions = userData.pConditions;
          for (let pCondIdx = 0; pCondIdx < pConditions.length; pCondIdx++) {
            const pCond = pConditions[pCondIdx];
            const reText = pCond.recallreText;
            const recall3DaysreText = pCond.recall3DaysreText ? pCond.recall3DaysreText : "";
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
              recall3DaysCosineSim: textCosineSimilarity(mainText, recalled3DaysText)
            };
          }
          t.update(userRef, {
            pConditions
          });
          const userLogRef = db.collection("userLogs").doc();
          t.update(userLogRef, {
            pConditions,
            id: userRef.id,
            updatedAt: admin.firestore.Timestamp.fromDate(new Date())
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
              K2: 0
            }
          }
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
              await db.runTransaction(async t => {
                const passageRef = db.collection("passages").doc(passage);
                const passageDoc = await t.get(passageRef);
                const passageData = passageDoc.data();
                if (project in passageData.projects) {
                  t.update(passageRef, {
                    projects: {
                      ...passageData.projects,
                      [project]: {
                        ...passageData.projects[project],
                        [condition]: passageData.projects[project][condition] + 1
                      }
                    }
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
        await db.runTransaction(async t => {
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
              pCondition.recall3DaysScoreRatio = pCondition.recall4DaysScoreRatio;
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
      .on("error", error => {
        console.error(error);
        return res.status(500).json({ error });
      })
      .on("data", async row => {
        console.log(row);
        const fullname = getFullname(row.firstname, row.lastname);
        const contactRef = db.collection("contacts").doc(fullname);
        if (!contactRef.exists) {
          await contactRef.set({
            firstname: row.firstname,
            lastname: row.lastname,
            email: row.email,
            from1Cademy: row["1Cademy"] === "1"
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
  console.log("retrieveData");
  let usersDocs, userData, commonFields, row, pCond, rowLong;
  try {
    const rowsData = [
      [
        // "fullname",
        "ParticipantID",
        "BirthDate",
        // "Cond2Start",
        // "CreatedAt",
        // "demoQsEnded",
        // "demoQsStart",
        "Education",
        // "email",
        "Ethnicity",
        "Gender",
        "Language",
        "Major",
        // "nullPassage",
        "Order",
        "Condition",
        "Passage",
        // "pretestEnded",
        "PretestScore",
        "PretestScoreRatio",
        // "PretestTime",
        // "previewEnded",
        "PreviewTime",
        "Session",
        // "recallEnded",
        "RecallScore",
        "RecallScoreRatio",
        // "recallCosineSim",
        // "recallStart",
        // "RecallTime",
        "RecallreText",
        // "recallreGrade",
        // "recognitionEnded",
        "RecognitionScore",
        "RecognitionScoreRatio",
        // "RecognitionTime",
        "Duration",
        "Readability",
        "Learnability",
        // "PostQsEnded",
        // "PostQsStart",
        "Feedback1",
        "Feedback2"
      ]
    ];
    const rowsLongData = [
      [
        // "fullname",
        "ParticipantID",
        "BirthDate",
        // "cond2Start",
        // "createdAt",
        // "demoQsEnded",
        // "demoQsStart",
        "education",
        // "email",
        "Ethnicity",
        "Gender",
        "Language",
        "Major",
        // "nullPassage",
        "Order",
        "Condition",
        "Passage",
        "Session",
        "Question",
        "QuestionType",
        "PretestPerQuestion",
        "RecognitionPerQuestion"
      ]
    ];
    // const recallGrades = {};
    // const recallGradesDocs = await db
    //   .collection("recallGrades")
    //   .where("researchers", "array-contains-any", [
    //     "Shaobo Liang",
    //     "Benjamin Brown",
    //     "Ember Shan",
    //     "Ziyi Wang",
    //     "Jeffery Phonn",
    //     "Jessica Cai",
    //     "Iman YeckehZaare",
    //     "Amelia Henriques",
    //     "Tirdad Barghi"
    //   ])
    //   .get();
    // for (let recallGradeDoc of recallGradesDocs.docs) {
    //   const recallGradeData = recallGradeDoc.data();
    //   if (recallGradeData.user in recallGrades) {
    //     if (recallGradeData.passage in recallGrades[recallGradeData.user]) {
    //       if (recallGradeData.session in recallGrades[recallGradeData.user][recallGradeData.passage]) {
    //         recallGrades[recallGradeData.user][recallGradeData.passage][recallGradeData.session].push(
    //           recallGradeData.grades
    //         );
    //       } else {
    //         recallGrades[recallGradeData.user][recallGradeData.passage][recallGradeData.session] = [
    //           recallGradeData.grades
    //         ];
    //       }
    //     } else {
    //       recallGrades[recallGradeData.user][recallGradeData.passage] = {
    //         [recallGradeData.session]: [recallGradeData.grades]
    //       };
    //     }
    //   } else {
    //     recallGrades[recallGradeData.user] = {
    //       [recallGradeData.passage]: {
    //         [recallGradeData.session]: [recallGradeData.grades]
    //       }
    //     };
    //   }
    // }
    const passages = {};
    const passagesH2K2 = [];
    const passageDocs = await db.collection("passages").get();
    for (let passageDoc of passageDocs.docs) {
      const passageData = passageDoc.data();
      passages[passageDoc.id] = passageData;
      if ("H2K2" in passageData.projects && passageData.title !== "The Quiet Sideman") {
        passagesH2K2.push(passageDoc.id);
      }
    }
    usersDocs = await db.collection("users").where("project", "==", "H2K2").get();
    let userIndex = 0;
    for (let userDoc of usersDocs.docs) {
      userData = userDoc.data();
      if (
        Array.isArray(userData.pConditions) &&
        userData.pConditions.length === 2 &&
        "recallScore" in userData.pConditions[0] &&
        "recallScore" in userData.pConditions[1] &&
        passagesH2K2.includes(userData.pConditions[0].passage) &&
        passagesH2K2.includes(userData.pConditions[1].passage) &&
        !["Rebecca Wang", "Yash Gandhi"].includes(userDoc.id)
      ) {
        userIndex += 1;
        console.log({ userIndex });
        for (let pCIdx = 0; pCIdx < userData.pConditions.length; pCIdx++) {
          commonFields = [];
          // commonFields.push(userDoc.id);
          commonFields.push(userIndex);
          commonFields.push(userData.birthDate ? getDateString(userData.birthDate.toDate()) : "");
          // commonFields.push(userData.cond2Start ? getDateTimeString(userData.cond2Start.toDate()) : "");
          // commonFields.push(userData.createdAt ? getDateTimeString(userData.createdAt.toDate()) : "");
          // commonFields.push(userData.demoQsEnded ? getDateTimeString(userData.demoQsEnded.toDate()) : "");
          // commonFields.push(userData.demoQsStart ? getDateTimeString(userData.demoQsStart.toDate()) : "");
          commonFields.push(userData.education ? userData.education : "");
          // commonFields.push(userData.email ? userData.email : "");
          commonFields.push(userData.ethnicity ? userData.ethnicity.join(" - ") : "");
          commonFields.push(userData.gender ? userData.gender : "");
          commonFields.push(userData.language ? userData.language : "");
          commonFields.push(userData.major ? userData.major : "");
          // commonFields.push(passages[userData.nullPassage].title);
          commonFields.push(pCIdx);
          pCond = userData.pConditions[pCIdx];
          commonFields.push(pCond.condition);
          commonFields.push(passages[pCond.passage].title);
          // commonFields.push(pCond.pretestEnded ? getDateTimeString(pCond.pretestEnded.toDate()) : "");
          commonFields.push("pretestScore" in pCond ? pCond.pretestScore : "");
          commonFields.push("pretestScoreRatio" in pCond ? pCond.pretestScoreRatio : "");
          // commonFields.push("pretestTime" in pCond ? pCond.pretestTime : "");
          // commonFields.push("previewEnded" in pCond ? getDateTimeString(pCond.previewEnded.toDate()) : "");
          commonFields.push("previewTime" in pCond ? pCond.previewTime : "");
          row = [...commonFields];
          row.push("1st");
          // row.push("recallEnded" in pCond ? getDateTimeString(pCond.recallEnded.toDate()) : "");
          row.push("recallScore" in pCond ? pCond.recallScore : "");
          row.push("recallScoreRatio" in pCond ? pCond.recallScoreRatio : "");
          // row.push("recallCosineSim" in pCond ? pCond.recallCosineSim : "");
          // row.push("recallStart" in pCond ? getDateTimeString(pCond.recallStart.toDate()) : "");
          // row.push("recallTime" in pCond ? pCond.recallTime : "");
          row.push("recallreText" in pCond ? pCond.recallreText : "");
          // row.push("recallreGrade" in pCond ? pCond.recallreGrade : "");
          // let itemScore = 0;
          // let isGraded = false;
          // let recallreGrade = 0;
          // if (
          //   userDoc.id in recallGrades &&
          //   pCond.passage in recallGrades[userDoc.id] &&
          //   "1st" in recallGrades[userDoc.id][pCond.passage]
          // ) {
          //   for (let recallGradePhrase of recallGrades[userDoc.id][pCond.passage]["1st"]) {
          //     itemScore = 0;
          //     for (let grade of recallGradePhrase) {
          //       itemScore += grade;
          //     }
          //     recallreGrade += itemScore / recallGradePhrase.length;
          //     isGraded = true;
          //   }
          // }
          // row.push(isGraded ? recallreGrade : "");
          // row.push("testEnded" in pCond ? getDateTimeString(pCond.testEnded.toDate()) : "");
          row.push("testScore" in pCond ? pCond.testScore : "");
          row.push("testScoreRatio" in pCond ? pCond.testScoreRatio : "");
          // row.push("testTime" in pCond ? pCond.testTime : "");
          let pretestToEnd =
            "demoQsEnded" in userData &&
            "previewEnded" in userData.pConditions[0] &&
            "previewTime" in userData.pConditions[0]
              ? ((userData.demoQsEnded.toDate().getTime() - userData.pConditions[0].previewEnded.toDate().getTime()) /
                  1000 -
                  userData.pConditions[0].previewTime) /
                60
              : "";
          // Three participants had issues with their demographic data and modified them a few days later.
          if (pretestToEnd && pretestToEnd < 5) {
            pretestToEnd = "";
          } else {
            row.push(pretestToEnd > 90 ? "" : pretestToEnd);
            const questions = passages[pCond.passage].questions;
            for (let idx = 0; idx < questions.length; idx++) {
              if (pCond.test) {
                rowLong = row.slice(0, 15);
                rowLong.push("1st");
                rowLong.push(pCond.passage + "Q" + idx);
                rowLong.push(questions[idx].type);
                rowLong.push(pCond.pretest[idx] === questions[idx].answer ? 1 : 0);
                rowLong.push(questions[idx] && pCond.test[idx] === questions[idx].answer ? 1 : 0);
                rowsLongData.push(rowLong);
                if (pCond.test3Days) {
                  rowLong = row.slice(0, 15);
                  rowLong.push("2nd");
                  rowLong.push(pCond.passage + "Q" + idx);
                  rowLong.push(questions[idx].type);
                  rowLong.push(pCond.pretest[idx] === questions[idx].answer ? 1 : 0);
                  rowLong.push(questions[idx] && pCond.test3Days[idx] === questions[idx].answer ? 1 : 0);
                  rowsLongData.push(rowLong);
                  if (pCond.test1Week) {
                    rowLong = row.slice(0, 15);
                    rowLong.push("3rd");
                    rowLong.push(pCond.passage + "Q" + idx);
                    rowLong.push(questions[idx].type);
                    rowLong.push(pCond.pretest[idx] === questions[idx].answer ? 1 : 0);
                    rowLong.push(questions[idx] && pCond.test1Week[idx] === questions[idx].answer ? 1 : 0);
                    rowsLongData.push(rowLong);
                  }
                }
              }
            }
          }
          row.push(userData.postQ1Choice ? userData.postQ1Choice : "");
          row.push(userData.postQ2Choice ? userData.postQ2Choice : "");
          // row.push(userData.postQsEnded ? getDateTimeString(userData.postQsEnded.toDate()) : "");
          // row.push(userData.postQsStart ? getDateTimeString(userData.postQsStart.toDate()) : "");
          row.push(
            "explanations" in userData
              ? typeof userData.explanations[0] === "object"
                ? userData.explanations[0].explanation
                : userData.explanations[0]
              : ""
          );
          row.push(
            "explanations" in userData
              ? typeof userData.explanations[1] === "object"
                ? userData.explanations[1].explanation
                : userData.explanations[1]
              : ""
          );
          if (pretestToEnd) {
            rowsData.push(row);
          }
          // The particinapt has finished the second session:
          if (userData.post3DaysQsEnded) {
            row = [...commonFields];
            let secondDuration =
              "post3DaysQsEnded" in userData && "recall3DaysStart" in userData.pConditions[0]
                ? (userData.post3DaysQsEnded.toDate().getTime() -
                    userData.pConditions[0].recall3DaysStart.toDate().getTime()) /
                  60000
                : "";
            if (secondDuration && secondDuration > 5) {
              row.push("2nd");
              // row.push(pCond.recall3DaysEnded ? getDateTimeString(pCond.recall3DaysEnded.toDate()) : "");
              row.push("recall3DaysScore" in pCond ? pCond.recall3DaysScore : "");
              row.push("recall3DaysScoreRatio" in pCond ? pCond.recall3DaysScoreRatio : "");
              // row.push("recall3DaysCosineSim" in pCond ? pCond.recall3DaysCosineSim : "");
              // row.push("recall3DaysStart" in pCond ? getDateTimeString(pCond.recall3DaysStart.toDate()) : "");
              // row.push("recall3DaysTime" in pCond ? pCond.recall3DaysTime : "");
              row.push("recall3DaysreText" in pCond ? pCond.recall3DaysreText : "");
              // row.push("recall3DaysreGrade" in pCond ? pCond.recall3DaysreGrade : "");
              // itemScore = 0;
              // isGraded = false;
              // recallreGrade = 0;
              // if (
              //   userDoc.id in recallGrades &&
              //   pCond.passage in recallGrades[userDoc.id] &&
              //   "2nd" in recallGrades[userDoc.id][pCond.passage]
              // ) {
              //   for (let recallGradePhrase of recallGrades[userDoc.id][pCond.passage]["2nd"]) {
              //     itemScore = 0;
              //     for (let grade of recallGradePhrase) {
              //       itemScore += grade;
              //     }
              //     recallreGrade += itemScore / recallGradePhrase.length;
              //     isGraded = true;
              //   }
              // }
              // row.push(isGraded ? recallreGrade : "");
              // row.push(pCond.test3DaysEnded ? getDateTimeString(pCond.test3DaysEnded.toDate()) : "");
              row.push("test3DaysScore" in pCond ? pCond.test3DaysScore : "");
              row.push("test3DaysScoreRatio" in pCond ? pCond.test3DaysScoreRatio : "");
              // row.push("test3DaysTime" in pCond ? pCond.test3DaysTime : "");
              row.push(secondDuration);
              row.push(userData.post3DaysQ1Choice ? userData.post3DaysQ1Choice : "");
              row.push(userData.post3DaysQ2Choice ? userData.post3DaysQ2Choice : "");
              // row.push(userData.post3DaysQsEnded ? getDateTimeString(userData.post3DaysQsEnded.toDate()) : "");
              // row.push(userData.post3DaysQsStart ? getDateTimeString(userData.post3DaysQsStart.toDate()) : "");
              row.push(
                "explanations3Days" in userData
                  ? typeof userData.explanations3Days[0] === "object"
                    ? userData.explanations3Days[0].explanation
                    : userData.explanations3Days[0]
                  : ""
              );
              row.push(
                "explanations3Days" in userData
                  ? typeof userData.explanations3Days[1] === "object"
                    ? userData.explanations3Days[1].explanation
                    : userData.explanations3Days[1]
                  : ""
              );
              rowsData.push(row);
            }
          }
          if (userData.post1WeekQsEnded) {
            row = [...commonFields];
            let thirdDuration =
              "post1WeekQsEnded" in userData && "recall1WeekStart" in userData.pConditions[0]
                ? (userData.post1WeekQsEnded.toDate().getTime() -
                    userData.pConditions[0].recall1WeekStart.toDate().getTime()) /
                  60000
                : "";
            if (thirdDuration && thirdDuration > 5) {
              row.push("3rd");
              // row.push(pCond.recall1WeekEnded ? getDateTimeString(pCond.recall1WeekEnded.toDate()) : "");
              row.push("recall1WeekScore" in pCond ? pCond.recall1WeekScore : "");
              row.push("recall1WeekScoreRatio" in pCond ? pCond.recall1WeekScoreRatio : "");
              // row.push("recall1WeekCosineSim" in pCond ? pCond.recall1WeekCosineSim : "");
              // row.push("recall1WeekStart" in pCond ? getDateTimeString(pCond.recall1WeekStart.toDate()) : "");
              // row.push("recall1WeekTime" in pCond ? pCond.recall1WeekTime : "");
              row.push("recall1WeekreText" in pCond ? pCond.recall1WeekreText : "");
              // row.push("recall1WeekreGrade" in pCond ? pCond.recall1WeekreGrade : "");
              // itemScore = 0;
              // isGraded = false;
              // recallreGrade = 0;
              // if (
              //   userDoc.id in recallGrades &&
              //   pCond.passage in recallGrades[userDoc.id] &&
              //   "3rd" in recallGrades[userDoc.id][pCond.passage]
              // ) {
              //   for (let recallGradePhrase of recallGrades[userDoc.id][pCond.passage]["3rd"]) {
              //     itemScore = 0;
              //     for (let grade of recallGradePhrase) {
              //       itemScore += grade;
              //     }
              //     recallreGrade += itemScore / recallGradePhrase.length;
              //     isGraded = true;
              //   }
              // }
              // row.push(isGraded ? recallreGrade : "");
              // row.push(pCond.test1WeekEnded ? getDateTimeString(pCond.test1WeekEnded.toDate()) : "");
              row.push("test1WeekScore" in pCond ? pCond.test1WeekScore : "");
              row.push("test1WeekScoreRatio" in pCond ? pCond.test1WeekScoreRatio : "");
              // row.push("test1WeekTime" in pCond ? pCond.test1WeekTime : "");
              row.push(thirdDuration);
              row.push(userData.post3DaysQ1Choice ? userData.post3DaysQ1Choice : "");
              row.push(userData.post1WeekQ2Choice ? userData.post1WeekQ2Choice : "");
              // row.push(userData.post1WeekQsEnded ? getDateTimeString(userData.post1WeekQsEnded.toDate()) : "");
              // row.push(userData.post1WeekQsStart ? getDateTimeString(userData.post1WeekQsStart.toDate()) : "");
              row.push(
                "explanations1Week" in userData
                  ? typeof userData.explanations1Week[0] === "object"
                    ? userData.explanations1Week[0].explanation
                    : userData.explanations1Week[0]
                  : ""
              );
              row.push(
                "explanations1Week" in userData
                  ? typeof userData.explanations1Week[1] === "object"
                    ? userData.explanations1Week[1].explanation
                    : userData.explanations1Week[1]
                  : ""
              );
              rowsData.push(row);
            }
          }
        }
      }
    }
    // for (let recallGradeUser in recallGrades) {
    //   console.log(recallGradeUser);
    // }
    csv.writeToPath("datasets/data.csv", rowsData, { headers: true }).on("finish", () => {
      console.log("Created the CSV file!");
    });
    csv.writeToPath("datasets/dataLong.csv", rowsLongData, { headers: true }).on("finish", () => {
      console.log("Created the Long CSV file!");
    });
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(200).json({ done: false });
};

// Download the feedback dataset in CSV
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
        "explanation2-1Week"
      ]
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
        row.push(userData.explanations3Days ? userData.explanations3Days[0] : "");
        row.push(userData.post3DaysQ2Choice);
        row.push(userData.explanations3Days ? userData.explanations3Days[1] : "");
      } else {
        for (let idx = 0; idx < 4; idx++) {
          row.push("");
        }
      }
      if (userData.post1WeekQsEnded) {
        row.push(userData.post1WeekQ1Choice);
        row.push(userData.explanations1Week ? userData.explanations1Week[0] : "");
        row.push(userData.post1WeekQ2Choice);
        row.push(userData.explanations1Week ? userData.explanations1Week[1] : "");
      } else {
        for (let idx = 0; idx < 4; idx++) {
          row.push("");
        }
      }
      rowsData.push(row);
    }
    csv.writeToPath("datasets/feedbackData.csv", rowsData, { headers: true }).on("finish", () => {
      console.log("done process data!");
    });
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(200).json({ done: true });
};

// Download the feedbackCode dataset in CSV
exports.feedbackCodeData = async (req, res) => {
  try {
    const codes = [
      `All the information was in a single page.`,
      `I could better recall the information.`,
      `I prefer the horizontal orientation.`,
      `I prefer the vertical orientation.`,
      `I prefer to follow sentences rather than choppy pieces.`,
      `It felt too much to read.`,
      `It is more appropriate for informational content.`,
      `It is more appropriate for literary narrative.`,
      `It took me less time to read the passage.`,
      `It was easier to find the answers to the multiple-choice questions.`,
      `It was easier to follow the information from basic to advanced.`,
      `It was easier to follow the story.`,
      `It was easier to navigate/maneuver through.`,
      `It was easier to quickly skim through the passage.`,
      `Reading it felt more natural/comfortable.`,
      `The choppy sentences have no follow. It's frustrating to read disconnected sentences.`,
      `The information was better organized on the page.`,
      `The information was presented in groups.`,
      `The information was presented in multiple pages.`,
      `The information was presented in smaller pieces.`,
      `The information was presented more concisely.`,
      `The key information was easier to identify.`,
      `There were clear, explicit, links between related paragraphs/nodes`
    ];
    const rowsData = [
      ["id", "choice", "passage1", "condition1", "passage2", "condition2", "qIdx", "session", ...codes, "explanation"]
    ];
    const passages = {};
    const passageDocs = await db.collection("passages").get();
    for (let passageDoc of passageDocs.docs) {
      const passageData = passageDoc.data();
      passages[passageDoc.id] = passageData;
    }
    const users = {};
    const userDocs = await db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();
      if (userData.pConditions && userData.pConditions.length === 2) {
        users[userDoc.id] = [
          {
            passage: userData.pConditions[0].passage,
            condition: userData.pConditions[0].condition
          },
          {
            passage: userData.pConditions[1].passage,
            condition: userData.pConditions[1].condition
          }
        ];
      }
    }
    const feedbackCodeDocs = await db
      .collection("feedbackCode")
      .where("approved", "==", true)
      .where("project", "==", "H2K2")
      .get();
    for (let feedbackCodeDoc of feedbackCodeDocs.docs) {
      const feedbackCodeData = feedbackCodeDoc.data();
      const row = [];
      row.push(feedbackCodeDoc.id);
      "session", row.push(feedbackCodeData.choice);
      row.push(users[feedbackCodeData.fullname][0].passage);
      row.push(users[feedbackCodeData.fullname][0].condition);
      row.push(users[feedbackCodeData.fullname][1].passage);
      row.push(users[feedbackCodeData.fullname][1].condition);
      row.push(feedbackCodeData.expIdx);
      row.push(feedbackCodeData.session);
      for (let code of codes) {
        if (code in feedbackCodeData.codesVotes) {
          const conditionNums = { H2: 0, K2: 0 };
          if ("codersChoiceConditions" in feedbackCodeData && feedbackCodeData.codesVotes[code].length > 1) {
            for (let researcher of feedbackCodeData.codesVotes[code]) {
              conditionNums[feedbackCodeData.codersChoiceConditions[researcher][code]] += 1;
            }
            row.push(
              conditionNums.H2 !== conditionNums.K2
                ? conditionNums.H2 > conditionNums.K2
                  ? "H2"
                  : "K2"
                : conditionNums.H2 === 0
                ? "None"
                : "Both"
            );
          } else {
            row.push(feedbackCodeData.codesVotes[code].length);
          }
        } else {
          row.push("");
        }
      }
      row.push(feedbackCodeData.explanation);
      rowsData.push(row);
    }
    csv.writeToPath("datasets/feedbackCodeData.csv", rowsData, { headers: true }).on("finish", () => {
      console.log("Done");
    });
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(200).json({ done: true });
};

// Download the recall dataset in CSV
exports.recallData = async (req, res) => {
  try {
    const rowsData = [
      [
        "id",
        "Key Phrase",
        "Response",
        "Question ID",
        "Researcher 1",
        "Grade 1",
        "Researcher 2",
        "Grade 2",
        "Researcher 3",
        "Grade 3",
        "Researcher 4",
        "Grade 4",
        "Score out of 4"
      ]
    ];
    const passages = {};
    const passagesDocs = await db.collection("passages").get();
    for (let passageDoc of passagesDocs.docs) {
      const passageData = passageDoc.data();
      passages[passageData.title] = passageData.phrases?.length || 0;
    }
    console.log(passages);
    const researchers = {};
    const recallGradesDocs = await db.collection("recallGrades").where("done", "==", true).get();
    for (let recallGradeDoc of recallGradesDocs.docs) {
      const recallGradeData = recallGradeDoc.data();
      if (recallGradeData.grades.length >= 4) {
        const row = [];
        row.push(recallGradeDoc.id);
        row.push(recallGradeData.phrase);
        row.push(recallGradeData.response);
        row.push(recallGradeData.passage);
        let score = 0;
        for (let gradeIdx = 0; gradeIdx < recallGradeData.grades.length; gradeIdx++) {
          const researcher = recallGradeData.researchers[gradeIdx];
          row.push(researcher);
          if (researcher in researchers) {
            researchers[researcher] += 1;
          } else {
            researchers[researcher] = 1;
          }
          const grade = recallGradeData.grades[gradeIdx];
          row.push(grade ? 1 : 0);
          score += grade;
        }
        if (score > 4) {
          score = 4;
        }
        row.push(score);
        rowsData.push(row);
      }
    }
    csv.writeToPath("datasets/recallData.csv", rowsData, { headers: true }).on("finish", () => {
      console.log({ researchers });
    });
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
exports.applicationReminder = async context => {
  try {
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    let waitTime = 0;
    // Retrieve all the applicants who have completed the 3 experiment sessions.
    const usersDocs = await db.collection("users").where("projectDone", "==", true).get();
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
              needReview[applicationData.communiId].push(applicationData.fullname);
            } else {
              needReview[applicationData.communiId] = [applicationData.fullname];
            }
          }
          if (applicationData.confirmed && !applicationData.invited) {
            needInvite.push({
              applicant: applicationData.fullname,
              communiId: applicationData.communiId
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
        (!("reminder" in userData) || userData.reminder.toDate() <= new Date()) &&
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
          const applicationDocs = await db.collection("applications").where("fullname", "==", userDoc.id).get();
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
              hyperlink: "https://1cademy.us/home#JoinUsSection"
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
        const communityLeaderDocs = await db.collection("users").where("leading", "array-contains", communiId).get();
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
