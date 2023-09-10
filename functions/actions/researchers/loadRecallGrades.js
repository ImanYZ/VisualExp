const { db } = require("../../admin");
const { fetchRecentParticipants } = require("../../utils");

const validateBooleanExpression = (rules, response) => {
  return rules.every(rule => {
    const { keyword, alternatives, not } = rule;
    const keywords = [keyword, ...(alternatives || [])].filter(kw => kw !== "");
    const match = keywords.some(kw => response.toLowerCase().includes(kw.toLowerCase()));
    return (match && !not) || (!match && not);
  });
};

const getRecallConditionsByRecallGrade = (recallGradeDoc, fullname, booleanByphrase, passagesByIds) => {
  const recallGradeData = recallGradeDoc.data();
  const _conditionItems = [];
  Object.entries(recallGradeData.sessions).map(async ([session, conditionItems]) => {
    conditionItems.forEach(conditionItem => {
      const filtered = (conditionItem.response || "")
        .replace(/[\.,]/g, " ")
        .split(" ")
        .filter(w => w.trim());
      if (recallGradeData.user !== fullname && filtered.length > 2) {
        const phrasesSatisfied = conditionItem.phrases.filter(phrase => {
          const schemaE = booleanByphrase[phrase.phrase] ? booleanByphrase[phrase.phrase][0].schema : [];
          return (
            !phrase.deleted &&
            !phrase.researchers.includes(fullname) &&
            phrase.researchers.length < 4 &&
            validateBooleanExpression(schemaE, conditionItem.response)
          );
        });

        //pick 4 random phrases that are not satisfied
        const notSatisfiedphrases = conditionItem.phrases
          .filter(phrase => {
            const schemaE = booleanByphrase[phrase.phrase] ? booleanByphrase[phrase.phrase][0].schema : [];
            return !phrase.deleted && !validateBooleanExpression(schemaE, conditionItem.response);
          })
          .sort(() => 0.5 - Math.random())
          .splice(0, 4);

        conditionItem.phrases = [...phrasesSatisfied, ...notSatisfiedphrases].sort(() => 0.5 - Math.random());
        if (phrasesSatisfied.length > 0) {
          _conditionItems.push({
            docId: recallGradeDoc.id,
            session,
            user: recallGradeData.user,
            project: recallGradeData.project,
            notSatisfiedphrases,
            originalText: passagesByIds[conditionItem.passage].text,
            ...conditionItem
          });
        }
      }
    });
  });

  return _conditionItems;
};

const consumeRecallGradesChanges = (recallGradesDocs, fullname, booleanByphrase, passagesByIds) => {
  let recallGrades = {};
  for (const recallGradeDoc of recallGradesDocs) {
    const recallGradeDaa = recallGradeDoc.data();
    const _recallGrades = getRecallConditionsByRecallGrade(recallGradeDoc, fullname, booleanByphrase, passagesByIds);
    if (recallGrades.hasOwnProperty(recallGradeDaa.project)) {
      recallGrades[recallGradeDaa.project] = [...recallGrades[recallGradeDaa.project], ..._recallGrades];
    } else {
      recallGrades[recallGradeDaa.project] = [..._recallGrades];
    }
  }
  return recallGrades;
};
module.exports = async (req, res) => {
  try {
    console.log("loadRecallGrades");
    const { docId: fullname } = req.researcher;

    const booleanByphrase = {};
    let passagesByIds = {};

    const recentParticipants = await fetchRecentParticipants(fullname);
    let recallGradesRecentParticipantDocs = [];
    for (let participant of recentParticipants) {
      let docs = await db.collection("recallGradesV2").where("user", "==", participant).get();
      recallGradesRecentParticipantDocs = [...recallGradesRecentParticipantDocs, ...docs.docs];
    }

    const fullyGradedDocs = await db.collection("recallGradesV2").where("viewers", "array-contains", fullname).get();
    const fullyGradedIds = [];
    fullyGradedDocs.docs.forEach(doc => fullyGradedIds.push(doc.id));
    const remainingTogradeQuery = db.collection("recallGradesV2");
    if (fullyGradedIds.length > 0) {
      remainingTogradeQuery.where("__name__", "not-in", fullyGradedIds);
    }
    const remainingTogradeDocs = await remainingTogradeQuery.limit(50).get();

    const recallGradesDocs = [...recallGradesRecentParticipantDocs, ...remainingTogradeDocs.docs];

    const booleanScratch = await db.collection("booleanScratch").get();

    const passageDoc = await db.collection("passages").get();

    passageDoc.docs.forEach(doc => {
      passagesByIds[doc.id] = doc.data();
    });

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

    let recallGrades = consumeRecallGradesChanges(recallGradesDocs, fullname, booleanByphrase, passagesByIds);

    res.status(200).send(recallGrades);
  } catch (error) {
    res.status(500).send({ message: "error", data: error });
    console.log(error);
  }
};
