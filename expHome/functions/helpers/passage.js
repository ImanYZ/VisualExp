const { db } = require("../admin");

const validateBooleanExpression = (schemaEp, response) => {
  const text = response;
  if (!text) return false;
  let keys = {};
  let notKeywords = [];
  for (let schemaE of schemaEp) {
    if (!schemaE.not) {
      let keywords = [...schemaE.alternatives];
      keywords = keywords.filter(x => x && x !== "");
      if (schemaE.keyword !== "") {
        keys[schemaE.keyword] = keywords;
      }
    } else {
      const noKeywords = [...schemaE.alternatives];
      if (schemaE.keyword !== "") {
        noKeywords.push(schemaE.keyword);
      }
      notKeywords = [...notKeywords, ...noKeywords];
    }
  }

  notKeywords = notKeywords.filter(x => x && x !== "");
  let containsWord = true;
  const notContainsWord = notKeywords.some(element => text.toLowerCase().includes(element.toLowerCase()));
  for (let key in keys) {
    const containsKeys = [key, ...keys[key]];
    containsWord = containsKeys.some(element => text.toLowerCase().includes(element.toLowerCase()));
    if (!containsWord) {
      break;
    }
  }
  if (!notContainsWord && containsWord) {
    return true;
  } else {
    return false;
  }
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