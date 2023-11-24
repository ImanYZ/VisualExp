const { db } = require("../../admin");
const { fetchRecentParticipants } = require("../../utils");
const { validateBooleanExpression } = require("../../helpers/passage");
const { loadBooleanExpressions } = require("../../helpers/grading-recalls");

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
const getRecallConditionsByRecallGrade = (recallGradeDoc, fullname, booleanByphrase, passagesByIds) => {
  const recallGradeData = recallGradeDoc.data();
  const _conditionItems = [];
  Object.entries(recallGradeData.sessions).map(async ([session, conditionItems]) => {
    conditionItems.forEach(conditionItem => {
      conditionItem.phrases = conditionItem.phrases.filter(p =>
        passagesByIds[conditionItem.passage].phrases.includes(p.phrase)
      );
      // console.log(conditionItem.phrases);
      // console.log(consideredPhrases);
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
            return (
              !phrase.deleted &&
              !validateBooleanExpression(schemaE, conditionItem.response) &&
              phrase.researchers.length < 4 &&
              !phrase.researchers.includes(fullname)
            );
          })
          .sort(() => 0.5 - Math.random())
          .splice(0, 4);

        conditionItem.phrases = [...phrasesSatisfied, ...notSatisfiedphrases].sort(() => 0.5 - Math.random());
        let priority = 4;
        if (conditionItem.phrases.some(p => p.researchers.length === 1)) {
          priority = 3;
        }
        if (conditionItem.phrases.some(p => p.researchers.length === 2)) {
          priority = 2;
        }
        if (conditionItem.phrases.some(p => p.researchers.length >= 3)) {
          priority = 1;
        }
        if (phrasesSatisfied.length > 0) {
          _conditionItems.push({
            docId: recallGradeDoc.id,
            session,
            user: recallGradeData.user,
            project: recallGradeData.project,
            notSatisfiedphrases,
            satisfiedphrases: phrasesSatisfied,
            originalText: passagesByIds[conditionItem.passage].text,
            ...conditionItem,
            priority
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
    const recallGradeData = recallGradeDoc.data();
    const _recallGrades = getRecallConditionsByRecallGrade(recallGradeDoc, fullname, booleanByphrase, passagesByIds);
    if (recallGrades.hasOwnProperty(recallGradeData.project)) {
      recallGrades[recallGradeData.project] = [...recallGrades[recallGradeData.project], ..._recallGrades];
    } else {
      recallGrades[recallGradeData.project] = [..._recallGrades];
    }
  }
  return recallGrades;
};
module.exports = async (req, res) => {
  try {
    console.log("loadRecallGrades");
    const { project } = req.body;
    console.log(project);
    if (!["H2K2", "H1L2", "Autograding"].includes(project)) {
      return res.status(200).send([]);
    }
    const { docId: fullname } = req.researcher;

    const booleanByphrase = await loadBooleanExpressions();
    let passagesByIds = {};

    const recentParticipants = Object.keys(await fetchRecentParticipants(fullname));

    const recallGradesDocs = await db.collection("recallGradesV2").get();

    const passageDoc = await db.collection("passages").get();

    passageDoc.docs.forEach(doc => {
      passagesByIds[doc.id] = doc.data();
    });
    const gradesDocs = [...(recallGradesDocs?.docs || [])];
    let recallGrades = consumeRecallGradesChanges(gradesDocs, fullname, booleanByphrase, passagesByIds);
    console.log(recallGrades);
    let _recallGrades = [];
    if (project === "Autograding") {
      for (let project in recallGrades) {
        _recallGrades = [..._recallGrades, ...recallGrades[project]];
      }
    } else {
      _recallGrades = recallGrades[project] || [];
    }

    const recalls3Res = _recallGrades.filter(g => g.priority === 1);
    const recalls2Res = _recallGrades.filter(g => g.priority === 2);
    const recalls1Res = _recallGrades.filter(g => g.priority === 3);
    const recalls0Res = _recallGrades.filter(g => g.priority === 4);
    shuffleArray(recalls3Res);
    shuffleArray(recalls2Res);
    shuffleArray(recalls1Res);
    shuffleArray(recalls0Res);

    _recallGrades = [...recalls3Res, ...recalls2Res, ...recalls1Res, ...recalls0Res];

    console.log({ _recallGrades });
    if (recentParticipants.length > 0) {
      _recallGrades.sort((g1, g2) => {
        const p1 = recentParticipants.includes(g1.user) && recentParticipants[g1?.user].includes(g1.session);
        const p2 = recentParticipants.includes(g2.user) && recentParticipants[g2?.user].includes(g2.session);
        if (p1 && p2) return 0;
        return p1 && !p2 ? -1 : 1;
      });
    }

    return res.status(200).send({ recallgrades: _recallGrades.splice(0, 10) });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "error", data: error });
  }
};
