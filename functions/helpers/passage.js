const { db } = require("../admin");

const validateBooleanExpression = (rules, response) => {
  return rules.every(rule => {
    const { keyword, alternatives, not } = rule;
    const keywords = [keyword, ...(alternatives || [])].filter(kw => kw !== "");
    const match = keywords.some(kw => response.toLowerCase().includes(kw.toLowerCase()));
    return (match && !not) || (!match && not);
  });
};

const calculateViewers = async recallData => {
  let viewers = [];
  let booleanByphrase = {};
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
  for (let session in recallData.sessions) {
    for (let conditionIdx = 0; conditionIdx < recallData.sessions[session].length; conditionIdx++) {
      const conditionItem = recallData.sessions[session][conditionIdx];
      const phrasesSatisfied = conditionItem.phrases.filter(phrase => {
        const schemaE = booleanByphrase[phrase.phrase] ? booleanByphrase[phrase.phrase][0].schema : [];
        return !phrase.deleted && validateBooleanExpression(schemaE, conditionItem.response);
      });
      for (let phrase of phrasesSatisfied) {
        // console.log(phrase.researchers);
        viewers = viewers.concat(phrase.researchers);
      }

      viewers = viewers.filter(
        viewer =>
          !phrasesSatisfied.some(phrase => !phrase.researchers.includes(viewer) && phrase.researchers.length < 4)
      );
    }
  }
  return [...new Set(viewers)];
};

module.exports = {
  validateBooleanExpression,
  calculateViewers
};
