const { db } = require("../admin");
const { validateBooleanExpression } = require("../helpers/passage");

exports.updateGradingPointsForResearchers = (researchersUpdates, voteResearchers, recallGradeData, votePoint) => {
  for (const voteResearcher of voteResearchers) {
    if (researchersUpdates[voteResearcher].projects.hasOwnProperty(recallGradeData.project)) {
      let gradingPoints = researchersUpdates[voteResearcher].projects[recallGradeData.project].gradingPoints || 0;
      let negativeGradingPoints =
        researchersUpdates[voteResearcher].projects[recallGradeData.project].negativeGradingPoints || 0;
      gradingPoints += votePoint;

      if (votePoint < 0) {
        negativeGradingPoints += Math.abs(votePoint);
      }

      researchersUpdates[voteResearcher].projects[recallGradeData.project].gradingPoints = Math.max(gradingPoints, 0);
      researchersUpdates[voteResearcher].projects[recallGradeData.project].negativeGradingPoints =
        negativeGradingPoints;
    }
    if (researchersUpdates[voteResearcher].projects.hasOwnProperty("Autograding")) {
      let gradingPoints = researchersUpdates[voteResearcher].projects["Autograding"].gradingPoints || 0;
      let negativeGradingPoints = researchersUpdates[voteResearcher].projects["Autograding"].negativeGradingPoints || 0;
      gradingPoints += votePoint;
      if (votePoint < 0) {
        negativeGradingPoints += Math.abs(votePoint);
      }

      researchersUpdates[voteResearcher].projects["Autograding"].gradingPoints = gradingPoints;
      researchersUpdates[voteResearcher].projects["Autograding"].negativeGradingPoints = negativeGradingPoints;
    }
  }
};

exports.convertToVotesByPhrasesFunction = (conditionUpdates, sessionRecallGrade, fullname) => {
  return conditionUpdates.phrases.reduce((c, phrase) => {
    const phraseIdx = sessionRecallGrade.phrases.findIndex(p => p.phrase === phrase.phrase);
    const presentedPhrase = sessionRecallGrade.phrases[phraseIdx];

    // extracting researcher's vote from payload
    const { grades, researchers } = presentedPhrase || {};
    const researcherIdx = (researchers || []).indexOf(fullname);
    const grade = researcherIdx !== -1 ? grades[researcherIdx] || false : false; // researcher's vote

    // extracting other researcher's vote from firebase document
    let { grades: docGrades, researchers: docResearchers } = phrase;
    docGrades = docGrades || [];
    docResearchers = docResearchers || [];

    const previousGrades = {
      // sum of previous up votes from all researchers
      upVotes: docGrades.reduce((c, g) => c + (g === true ? 1 : 0), 0),
      // sum of previous up votes from all researchers
      downVotes: docGrades.reduce((c, g) => c + (g === false ? 1 : 0), 0)
    };

    // removing current researcher's vote from phrase if already exist by chance
    const currentResearcherIdx = (docResearchers || []).indexOf(fullname);
    if (currentResearcherIdx !== -1) {
      docResearchers.splice(currentResearcherIdx, 1);
      docGrades.splice(currentResearcherIdx, 1);
    }

    // adding values to condition updates
    phrase.grades = [...docGrades];
    phrase.researchers = [...docResearchers];

    if (phraseIdx !== -1) {
      phrase.grades.push(grade);
      phrase.researchers.push(fullname);
    }

    return {
      ...c,
      [phrase.phrase]: {
        // sum of up votes from other researchers and current one
        upVotes: docGrades.reduce((c, g) => c + (g === true ? 1 : 0), phraseIdx !== -1 ? (grade ? 1 : 0) : 0),
        // sum of down votes from other researchers and current one
        downVotes: docGrades.reduce((c, g) => c + (g === false ? 1 : 0), phraseIdx !== -1 ? (!grade ? 1 : 0) : 0),
        // list of all researchers that voted on this phrase
        researchers: phrase.researchers,
        grades: phrase.grades,
        previousResearcher: previousGrades.upVotes + previousGrades.downVotes
      }
    };
  }, {});
};

exports.incrementGradingNum = (researcher, project) => {
  if (researcher.projects.hasOwnProperty(project)) {
    let gradenum = researcher.projects[project].gradingNum || 0;
    gradenum += 1;
    researcher.projects[project].gradingNum = gradenum;
  }
};

exports.getRecallResponse = session => {
  switch (session) {
    case "1st":
      return "recallreGrade";
    case "2nd":
      return "recall3DaysreGrade";
    case "3rd":
      return "recall1WeekreGrade";
    default:
      throw new Error("Unknown value for session");
  }
};
exports.separateResearchersByVotes = votesOfPhrase => {
  const upVoteResearchers = [];
  const downVoteResearchers = [];
  for (let r = 0; r < votesOfPhrase.grades.length; r++) {
    if (votesOfPhrase.grades[r]) {
      upVoteResearchers.push(votesOfPhrase.researchers[r]);
    } else {
      downVoteResearchers.push(votesOfPhrase.researchers[r]);
    }
  }
  return { upVoteResearchers, downVoteResearchers };
};
const loadBooleanExpressions = async () => {
  const booleanByphrase = {};
  const booleanScratch = await db.collection("booleanScratch").get();
  for (const booleanScratchDoc of booleanScratch.docs) {
    const booleanScratchData = booleanScratchDoc.data();
    if (booleanScratchData.deleted) continue;
    if (booleanByphrase.hasOwnProperty(booleanScratchData.phrase)) {
      booleanByphrase[booleanScratchData.phrase].push(booleanScratchData);
    } else {
      booleanByphrase[booleanScratchData.phrase] = [booleanScratchData];
    }
  }
  for (const phrase in booleanByphrase) {
    booleanByphrase[phrase].sort((e1, e2) => {
      const e1Vote = (e1.upVotes || 0) - (e1.downVotes || 0);
      const e2Vote = (e2.upVotes || 0) - (e2.downVotes || 0);
      return e1Vote < e2Vote ? 1 : -1;
    });
  }
  return booleanByphrase;
};

exports.checkFullyGradedRecall = async (recallSession, researcher) => {
  let fullyGraded = true;
  const booleanByphrase = await loadBooleanExpressions();

  recallSession.forEach(conditionItem => {
    const filtered = (conditionItem.response || "")
      .replace(/[\.,]/g, " ")
      .split(" ")
      .filter(w => w.trim());
    if (filtered.length > 2) {
      const phrasesSatisfied = conditionItem.phrases.filter(phrase => {
        const schemaE = booleanByphrase[phrase.phrase] ? booleanByphrase[phrase.phrase][0].schema : [];
        return (
          !phrase.deleted &&
          !phrase.researchers.includes(researcher) &&
          phrase.researchers.length < 4 &&
          validateBooleanExpression(schemaE, conditionItem.response)
        );
      });

      if (phrasesSatisfied.length > 0) {
        fullyGraded = false;
      }
    }
  });

  return fullyGraded;
};

module.exports = {
  loadBooleanExpressions
};
