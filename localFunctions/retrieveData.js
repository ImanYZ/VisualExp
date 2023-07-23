const csv = require("fast-csv");
const { db } = require("./admin");

const convertConditionNames = abbreviation => {
  return abbreviation
    ? abbreviation === "H2" || abbreviation === "H1"
      ? "Hybrid Map"
      : abbreviation === "K2" || abbreviation === "K1"
      ? "Knowledge Model"
      : abbreviation === "L2" || abbreviation === "L1"
      ? "Linear Text"
      : abbreviation
    : "";
};
const getDateString = dateObj => {
  const theDay = dateObj.getDate();
  const theMonth = dateObj.getMonth() + 1;
  return (
    dateObj.getFullYear() +
    "-" +
    (theMonth < 10 ? "0" + theMonth : theMonth) +
    "-" +
    (theDay < 10 ? "0" + theDay : theDay)
  );
};
const roundNum = num => Number(Number.parseFloat(Number(num).toFixed(2)));
const getPassageType = passageTitle => {
  return passageTitle === "Managerial Decision Making"
    ? "CmapTools"
    : passageTitle === "The Jaws That Jump" || passageTitle === "The Hearing of the Barn Owl"
    ? "ACT Natural Sciences"
    : passageTitle === "Conservationist  and Diplomat: The Grey Areas of Panda Conservation" ||
      passageTitle === "How to Watch Television"
    ? "ACT Social Sciences"
    : passageTitle === "The Buzz in Our Pockets" || passageTitle === "The Quiet Sideman"
    ? "ACT Humanities"
    : passageTitle === "Prima Ballerina" || passageTitle === "Reena"
    ? "ACT Prose Fiction/Literary Narrative"
    : "";
};

const verifyUserTestPerSession = userData => {
  if (!userData.pConditions) return [];
  const skipSessions = [];
  for (let condition of userData.pConditions) {
    if (skipSessions.includes("1st")) continue;
    if (condition.hasOwnProperty("test")) {
      if (condition.test.filter(a => a !== "").length === 0) {
        skipSessions.push("1st");
      }
    } else {
      skipSessions.push("1st");
    }
    if (!skipSessions.includes("2nd")) {
      if (condition.hasOwnProperty("test3Days")) {
        if (condition.test3Days.filter(a => a !== "").length === 0) {
          skipSessions.push("2nd");
        }
      } else {
        skipSessions.push("2nd");
      }
    }

    if (!skipSessions.includes("3rd")) {
      if (condition.hasOwnProperty("test1Week")) {
        if (condition.test1Week.filter(a => a !== "").length === 0) {
          skipSessions.push("3rd");
        }
      } else {
        skipSessions.push("3nd");
      }
    }
  }
  return skipSessions;
};
const processProject = async theProject => {
  console.log(theProject);
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
      "Institution",
      // "email",
      "Ethnicity",
      "Gender",
      "Language",
      "Major",
      // "nullPassage",
      "Order",
      "Condition",
      "Passage",
      "PassageType",
      // "pretestEnded",
      "PretestScore",
      "PretestScoreRatio",
      // "PretestTime",
      // "previewEnded",
      "PreviewTime",
      "Session",
      // "recallEnded",
      "Recall",
      "RecallScoreRatio",
      // "recallCosineSim",
      // "recallStart",
      // "RecallTime",
      "RecallreText",
      "GPT4 grade",
      "GPT4 percentage",
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
      "Education",
      "Institution",
      // "email",
      "Ethnicity",
      "Gender",
      "Language",
      "Major",
      // "nullPassage",
      "Order",
      "Condition",
      "Passage",
      "PassageType",
      "Session",
      "Question",
      "QuestionType",
      "PretestRecognition",
      "Recognition",
      "Readability",
      "Learnability"
    ]
  ];

  const recallGradesPerUser = {};

  const recallGradesDocs = await db.collection("recallGradesV2").where("project", "==", theProject).get();

  for (let recallGradesDoc of recallGradesDocs.docs) {
    const recallGradesData = recallGradesDoc.data();
    recallGradesPerUser[recallGradesData.user] = recallGradesData;
  }
  let usersDocs = [];
  let userData, commonFields, row, pCond, rowLong;
  let choiceCounts = {
    first: { Readability: {}, Learnability: {} },
    second: { Readability: {}, Learnability: {} },
    third: { Readability: {}, Learnability: {} }
  };
  if (theProject === "H2K2") {
    for (let cSession in choiceCounts) {
      for (let cQuestion in choiceCounts[cSession]) {
        choiceCounts[cSession][cQuestion]["H2"] = 0;
        choiceCounts[cSession][cQuestion]["K2"] = 0;
        choiceCounts[cSession][cQuestion]["Both"] = 0;
        choiceCounts[cSession][cQuestion]["Neither"] = 0;
      }
    }
  } else if (theProject === "H1L2") {
    for (let cSession in choiceCounts) {
      for (let cQuestion in choiceCounts[cSession]) {
        choiceCounts[cSession][cQuestion]["H1"] = 0;
        choiceCounts[cSession][cQuestion]["L2"] = 0;
        choiceCounts[cSession][cQuestion]["Both"] = 0;
        choiceCounts[cSession][cQuestion]["Neither"] = 0;
      }
    }
  }
  const passages = {};
  const usedPassages = [];
  const passageDocs = await db.collection("passages").get();
  for (let passageDoc of passageDocs.docs) {
    const passageData = passageDoc.data();
    passages[passageDoc.id] = passageData;
    if (theProject in passageData.projects) {
      usedPassages.push(passageDoc.id);
    }
  }

  usersDocs = await db.collection("users").where("project", "==", theProject).get();
  let userIndex = 0;
  for (let userDoc of usersDocs.docs) {
    userData = userDoc.data();
    const skipSessions = verifyUserTestPerSession(userData);
    if (skipSessions.includes("1st")) continue;
    if (
      Array.isArray(userData.pConditions) &&
      userData.pConditions.length === 2 &&
      "recallScore" in userData.pConditions[0] &&
      "recallScore" in userData.pConditions[1] &&
      usedPassages.includes(userData.pConditions[0].passage) &&
      usedPassages.includes(userData.pConditions[1].passage) &&
      !["Rebecca Wang"].includes(userDoc.id) &&
      recallGradesPerUser.hasOwnProperty(userDoc.id)
    ) {
      const recallGrades = recallGradesPerUser[userDoc.id].sessions;
      userIndex += 1;
      console.log({ userIndex, fullname: userDoc.id });
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
        commonFields.push(userData.institution ? userData.institution : "");
        // commonFields.push(userData.email ? userData.email : "");
        commonFields.push(userData.ethnicity ? userData.ethnicity.join(" - ") : "");
        commonFields.push(userData.gender ? userData.gender : "");
        commonFields.push(userData.language ? userData.language : "");
        commonFields.push(userData.major ? userData.major : "");
        // commonFields.push(passages[userData.nullPassage].title);
        commonFields.push(pCIdx);
        pCond = userData.pConditions[pCIdx];
        commonFields.push(pCond.condition ? convertConditionNames(pCond.condition) : "");
        commonFields.push(passages[pCond.passage] ? passages[pCond.passage].title : "");
        commonFields.push(passages[pCond.passage] ? getPassageType(passages[pCond.passage].title) : "");
        // commonFields.push(pCond.pretestEnded ? getDateTimeString(pCond.pretestEnded.toDate()) : "");
        commonFields.push("pretestScore" in pCond ? pCond.pretestScore : "");
        commonFields.push("pretestScoreRatio" in pCond ? pCond.pretestScoreRatio : "");
        // commonFields.push("pretestTime" in pCond ? pCond.pretestTime : "");
        // commonFields.push("previewEnded" in pCond ? getDateTimeString(pCond.previewEnded.toDate()) : "");
        commonFields.push("previewTime" in pCond ? pCond.previewTime : "");
        row = [...commonFields];
        row.push("Immediately");
        // row.push("recallEnded" in pCond ? getDateTimeString(pCond.recallEnded.toDate()) : "");
        row.push("recallScore" in pCond ? pCond.recallScore : "");
        row.push("recallScoreRatio" in pCond ? pCond.recallScoreRatio : "");
        // row.push("recallCosineSim" in pCond ? pCond.recallCosineSim : "");
        // row.push("recallStart" in pCond ? getDateTimeString(pCond.recallStart.toDate()) : "");
        // row.push("recallTime" in pCond ? pCond.recallTime : "");
        row.push("recallreText" in pCond ? pCond.recallreText : "");
        const numberOfYes =
          recallGrades["1st"] && recallGrades["1st"][pCIdx]
            ? recallGrades["1st"][pCIdx]?.phrases.filter(
                p => p.hasOwnProperty("GPT4-jun") && p["GPT4-jun"] && !p.deleted && p.satisfied
              ).length
            : 0;
        const totalNumberOfPhrases =
          recallGrades["1st"] && recallGrades["1st"][pCIdx]
            ? recallGrades["1st"][pCIdx]?.phrases.filter(p => !p.deleted && p.hasOwnProperty("GPT4-jun")).length
            : 0;

        row.push(numberOfYes === 0 ? " " : numberOfYes);
        row.push(numberOfYes === 0 ? " " : roundNum(numberOfYes / totalNumberOfPhrases));
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
        row.push("testScoreRatio" in pCond ? roundNum(pCond.testScoreRatio) : "");
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
              rowLong = row.slice(0, 12);
              rowLong.push("Immediately");
              rowLong.push(pCond.passage + " Q" + idx);
              rowLong.push(questions[idx].type === "Inference" ? "Inferential" : "Factual");
              rowLong.push(
                pCond.pretest && pCond.pretest.length > idx && pCond.pretest[idx] === questions[idx].answer ? 1 : 0
              );
              rowLong.push(questions[idx] && pCond.test[idx] === questions[idx].answer ? 1 : 0);
              rowLong.push(userData.postQ1Choice ? convertConditionNames(userData.postQ1Choice) : "");
              rowLong.push(userData.postQ2Choice ? convertConditionNames(userData.postQ2Choice) : "");
              rowsLongData.push(rowLong);
              if (pCond.test3Days) {
                rowLong = row.slice(0, 12);
                rowLong.push("After 3 Days");
                rowLong.push(pCond.passage + " Q" + idx);
                rowLong.push(questions[idx].type === "Inference" ? "Inferential" : "Factual");
                rowLong.push(
                  pCond.pretest && pCond.pretest.length > idx && pCond.pretest[idx] === questions[idx].answer ? 1 : 0
                );
                rowLong.push(questions[idx] && pCond.test3Days[idx] === questions[idx].answer ? 1 : 0);
                rowLong.push(userData.post3DaysQ1Choice ? convertConditionNames(userData.post3DaysQ1Choice) : "");
                rowLong.push(userData.post3DaysQ2Choice ? convertConditionNames(userData.post3DaysQ2Choice) : "");
                rowsLongData.push(rowLong);
                if (pCond.test1Week) {
                  rowLong = row.slice(0, 12);
                  if (theProject === "H2K2") {
                    rowLong.push("After 1 Week");
                  } else {
                    rowLong.push("After 10 Days");
                  }

                  rowLong.push(pCond.passage + " Q" + idx);
                  rowLong.push(questions[idx].type === "Inference" ? "Inferential" : "Factual");
                  rowLong.push(
                    pCond.pretest && pCond.pretest.length > idx && pCond.pretest[idx] === questions[idx].answer ? 1 : 0
                  );
                  rowLong.push(questions[idx] && pCond.test1Week[idx] === questions[idx].answer ? 1 : 0);
                  rowLong.push(userData.post1WeekQ1Choice ? convertConditionNames(userData.post1WeekQ1Choice) : "");
                  rowLong.push(userData.post1WeekQ2Choice ? convertConditionNames(userData.post1WeekQ2Choice) : "");
                  rowsLongData.push(rowLong);
                }
              }
            }
          }
        }
        row.push(userData.postQ1Choice ? convertConditionNames(userData.postQ1Choice) : "");
        row.push(userData.postQ2Choice ? convertConditionNames(userData.postQ2Choice) : "");
        choiceCounts["first"]["Readability"][userData.postQ1Choice] += 1;
        choiceCounts["first"]["Learnability"][userData.postQ2Choice] += 1;
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
        if (userData.post3DaysQsEnded && !skipSessions.includes("2nd")) {
          row = [...commonFields];
          let secondDuration =
            "post3DaysQsEnded" in userData && "recall3DaysStart" in userData.pConditions[0]
              ? (userData.post3DaysQsEnded.toDate().getTime() -
                  userData.pConditions[0].recall3DaysStart.toDate().getTime()) /
                60000
              : "";
          if (secondDuration && secondDuration > 5) {
            row.push("After 3 Days");
            // row.push(pCond.recall3DaysEnded ? getDateTimeString(pCond.recall3DaysEnded.toDate()) : "");
            row.push("recall3DaysScore" in pCond ? pCond.recall3DaysScore : "");
            row.push("recall3DaysScoreRatio" in pCond ? pCond.recall3DaysScoreRatio : "");
            // row.push("recall3DaysCosineSim" in pCond ? pCond.recall3DaysCosineSim : "");
            // row.push("recall3DaysStart" in pCond ? getDateTimeString(pCond.recall3DaysStart.toDate()) : "");
            // row.push("recall3DaysTime" in pCond ? pCond.recall3DaysTime : "");
            row.push("recall3DaysreText" in pCond ? pCond.recall3DaysreText : "");
            const numberOfYes =
              recallGrades["2nd"] && recallGrades["2nd"][pCIdx]
                ? recallGrades["2nd"][pCIdx]?.phrases.filter(
                    p => p.hasOwnProperty("GPT4-jun") && p["GPT4-jun"] && !p.deleted && p.satisfied
                  ).length
                : 0;
            const totalNumberOfPhrases =
              recallGrades["2nd"] && recallGrades["2nd"][pCIdx]
                ? recallGrades["2nd"][pCIdx]?.phrases.filter(p => !p.deleted && p.hasOwnProperty("GPT4-jun")).length
                : 0;
            row.push(numberOfYes === 0 ? " " : numberOfYes);
            row.push(numberOfYes === 0 ? " " : roundNum(numberOfYes / totalNumberOfPhrases));
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
            row.push(convertConditionNames(userData.post3DaysQ1Choice));
            row.push(convertConditionNames(userData.post3DaysQ2Choice));
            choiceCounts["second"]["Readability"][userData.post1WeekQ1Choice] += 1;
            choiceCounts["second"]["Learnability"][userData.post1WeekQ2Choice] += 1;
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
        if (userData.post1WeekQsEnded && !skipSessions.includes("3rd")) {
          row = [...commonFields];
          let thirdDuration =
            "post1WeekQsEnded" in userData && "recall1WeekStart" in userData.pConditions[0]
              ? (userData.post1WeekQsEnded.toDate().getTime() -
                  userData.pConditions[0].recall1WeekStart.toDate().getTime()) /
                60000
              : "";
          if (thirdDuration && thirdDuration > 5) {
            if (theProject === "H2K2") {
              row.push("After 1 Week");
            } else {
              row.push("After 10 Days");
            }
            // row.push(pCond.recall1WeekEnded ? getDateTimeString(pCond.recall1WeekEnded.toDate()) : "");
            row.push("recall1WeekScore" in pCond ? pCond.recall1WeekScore : "");
            row.push("recall1WeekScoreRatio" in pCond ? pCond.recall1WeekScoreRatio : "");
            // row.push("recall1WeekCosineSim" in pCond ? pCond.recall1WeekCosineSim : "");
            // row.push("recall1WeekStart" in pCond ? getDateTimeString(pCond.recall1WeekStart.toDate()) : "");
            // row.push("recall1WeekTime" in pCond ? pCond.recall1WeekTime : "");
            row.push("recall1WeekreText" in pCond ? pCond.recall1WeekreText : "");

            const numberOfYes =
              recallGrades["3rd"] && recallGrades["3rd"][pCIdx]
                ? recallGrades["3rd"][pCIdx]?.phrases.filter(
                    p => p.hasOwnProperty("GPT4-jun") && p["GPT4-jun"] && !p.deleted && p.satisfied
                  ).length
                : 0;
            const totalNumberOfPhrases =
              recallGrades["3rd"] && recallGrades["3rd"][pCIdx]
                ? recallGrades["3rd"][pCIdx]?.phrases.filter(p => !p.deleted && p.hasOwnProperty("GPT4-jun")).length
                : 0;
            row.push(numberOfYes === 0 ? " " : numberOfYes);
            row.push(numberOfYes === 0 ? " " : roundNum(numberOfYes / totalNumberOfPhrases));
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
            row.push("test1WeekScoreRatio" in pCond ? roundNum(pCond.test1WeekScoreRatio) : "");
            choiceCounts["third"]["Readability"][userData.post1WeekQ1Choice] += 1;
            choiceCounts["third"]["Learnability"][userData.post1WeekQ2Choice] += 1;
            // row.push("test1WeekTime" in pCond ? pCond.test1WeekTime : "");
            row.push(thirdDuration);
            row.push(convertConditionNames(userData.post1WeekQ1Choice));
            row.push(convertConditionNames(userData.post1WeekQ2Choice));
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
  csv
    .writeToPath("csv/data" + theProject + ".csv", rowsData, {
      headers: true
    })
    .on("finish", () => {
      console.log("Created the CSV file!");
      console.log(JSON.stringify(choiceCounts));
    })
    .on("error", error => {
      console.log("An error occurred while writing the CSV file:", error);
    });
  csv
    .writeToPath("csv/dataPerQuestion" + theProject + ".csv", rowsLongData, { headers: true })
    .on("finish", () => {
      console.log("Created the Long CSV file!");
    })
    .on("error", error => {
      console.log("An error occurred while writing the CSV file:", error);
    });
};

(async () => {
  console.log("retrieveData");
  try {
    await processProject("H1L2");
    await processProject("H2K2");
    console.log("Done");
    process.exit();
  } catch (err) {
    console.log({ err });
  }
})();
