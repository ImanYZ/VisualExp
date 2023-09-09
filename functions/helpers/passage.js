const { db } = require("../admin");

const validateBooleanExpression = (rules, response) => {
  return rules.every(rule => {
    const { keyword, alternatives, not } = rule;
    const keywords = [keyword, ...(alternatives || [])].filter(kw => kw !== "");
    const match = keywords.some(kw => response.toLowerCase().includes(kw.toLowerCase()));
    return (match && !not) || (!match && not);
  });
};
exports.getNonSatisfiedPhrasesByPassageTitle = async (passageTitle, response, phrases) => {
  const booleanScratchDoc = await db.collection("booleanScratch")
    .where("passage", "==", passageTitle)
    .get();
  const booleanHashMap = {};
  for (let booleanDoc of booleanScratchDoc.docs) {
    const booleanData = booleanDoc.data();
    if (booleanHashMap.hasOwnProperty(booleanData.phrase)) {
      booleanHashMap[booleanData.phrase].push(booleanData);
    } else {
      booleanHashMap[booleanData.phrase] = [booleanData];
    }
  }

  // sorting boolean expressions based on votes
  for(const phrase in booleanHashMap) {
    booleanHashMap[phrase].sort((e1, e2) => {
      const e1Vote = (e1.upVotes || 0) - (e1.downVotes || 0);
      const e2Vote = (e2.upVotes || 0) - (e2.downVotes || 0);
      return e1Vote < e2Vote ? 1 : -1; // desc order
    })
  }

  const nonSatisfiedPhrases = [];
  const _phrases  = phrases || [];

  for (let phrase of _phrases) {
    if (booleanHashMap.hasOwnProperty(phrase.phrase)) {
      const schemaE = booleanHashMap[phrase.phrase][0].schema;
      if (!validateBooleanExpression(schemaE, response)) {
        nonSatisfiedPhrases.push(phrase.phrase);
      }
    } else {
      nonSatisfiedPhrases.push(phrase.phrase);
    }
  }
  return nonSatisfiedPhrases;
}