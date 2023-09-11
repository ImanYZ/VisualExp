const { db } = require("../admin");

export const validateBooleanExpression = (rules, response) => {
  return rules.every(rule => {
    const { keyword, alternatives, not } = rule;
    const keywords = [keyword, ...(alternatives || [])].filter(kw => kw !== "");
    const match = keywords.some(kw => response.toLowerCase().includes(kw.toLowerCase()));
    return (match && !not) || (!match && not);
  });
};

export const calculateViewers = async recallData => {
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

exports.getNonSatisfiedPhrasesByPassageTitle = async (passageTitle, response, phrases) => {
  const booleanScratchDoc = await db.collection("booleanScratch").where("passage", "==", passageTitle).get();
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
  for (const phrase in booleanHashMap) {
    booleanHashMap[phrase].sort((e1, e2) => {
      const e1Vote = (e1.upVotes || 0) - (e1.downVotes || 0);
      const e2Vote = (e2.upVotes || 0) - (e2.downVotes || 0);
      return e1Vote < e2Vote ? 1 : -1; // desc order
    });
  }

  const nonSatisfiedPhrases = [];
  const _phrases = phrases || [];

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
};
