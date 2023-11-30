const { db } = require("../admin");
const { dbReal } = require("../admin_real");
const { loadBooleanExpressions } = require("../helpers/grading-recalls");
const { validateBooleanExpression } = require("../helpers/passage");

const getMajority = (phrase, upvotes, downvotes) => {
  if (phrase.hasOwnProperty("majority")) {
    return phrase.majority ? "YES" : "NO";
  }
  if (upvotes < 3 && downvotes < 3) return null;

  return upvotes > downvotes ? "YES" : "NO";
};
module.exports = async context => {
  try {
    const { booleanByphrase } = await loadBooleanExpressions();

    const phrasesPassage = {};

    const passagesDocs = await db.collection("passages").get();

    for (let passageDoc of passagesDocs.docs) {
      phrasesPassage[passageDoc.id] = [...(passageDoc.data().phrases || [])];
    }

    const recallsDocs = await dbReal.ref("/recallGradesV2").once("value");
    const recallsData = recallsDocs.val();

    let majorityPercentage = {};
    for (let recallID in recallsData) {
      const recallgrade = recallsData[recallID];

      const sessions = recallgrade?.sessions || {};
      for (let session in sessions) {
        const sessionItem = sessions[session];
        for (let conditionItemIdx = 0; conditionItemIdx < sessionItem.length; conditionItemIdx++) {
          const conditionItem = sessionItem[conditionItemIdx];

          conditionItem.phrases = conditionItem.phrases.filter(p =>
            phrasesPassage[conditionItem.passage].includes(p.phrase)
          );
          const phrasesSatisfyBoolean = conditionItem.phrases.filter(p => {
            const schemaE = booleanByphrase[p.phrase] ? booleanByphrase[p.phrase][0]?.schema || [] : [];
            return validateBooleanExpression(schemaE, conditionItem.response);
          }).length;
          const phrasesWithMajority = conditionItem.phrases.filter(p => {
            const upVotes = (p.grades || []).filter(grade => grade).length;
            const downVotes = (p.grades || []).filter(grade => !grade).length;
            const schemaE = booleanByphrase[p.phrase] ? booleanByphrase[p.phrase][0]?.schema || [] : [];
            return getMajority(p, upVotes, downVotes) && validateBooleanExpression(schemaE, conditionItem.response);
          }).length;
          if (phrasesSatisfyBoolean !== 0) {
            const percontage = `${Math.floor((phrasesWithMajority / phrasesSatisfyBoolean) * 10) * 10}%`;

            majorityPercentage[percontage] = (majorityPercentage[percontage] || 0) + 1;
          } else {
            majorityPercentage["no satisfied phrases"] = (majorityPercentage["no satisfied phrases"] || 0) + 1;
          }
        }
      }
    }

    const responsesProgresRef = db.collection("responsesProgress").doc();
    responsesProgresRef.set({
      ...majorityPercentage,
      createdAt: new Date()
    });
  } catch (error) {
    console.log(error);
  }
};
