const { db } = require("../../admin");
const { fetchRecentParticipants } = require("../../utils");

const getRecallConditionsByRecallGrade = (recallGradeDoc, fullname) => {
  const gptResearcher = "Iman YeckehZaare";
  const recallGradeData = recallGradeDoc.data();
  const _conditionItems = [];
  Object.entries(recallGradeData.sessions).map(async ([session, conditionItems]) => {
    conditionItems.forEach(conditionItem => {
      const filtered = (conditionItem.response || "")
        .replace(/[\.,]/g, " ")
        .split(" ")
        .filter(w => w.trim());
      if (
        recallGradeData.user !== fullname &&
        !conditionItem.researchers.includes(fullname) &&
        conditionItem.researchers.filter(researcher => researcher !== gptResearcher).length < 4 &&
        filtered.length > 2
      ) {
        conditionItem.phrases = conditionItem.phrases.filter(p => !p.deleted && !p.researchers.includes(fullname));
        _conditionItems.push({
          docId: recallGradeDoc.id,
          session,
          user: recallGradeData.user,
          project: recallGradeData.project,
          ...conditionItem
        });
      }
    });
  });

  return _conditionItems;
};

const consumeRecallGradesChanges = (recallGradesDocs, fullname) => {
  let recallGrades = {};
  for (const recallGradeDoc of recallGradesDocs) {
    const recallGradeDaa = recallGradeDoc.data();
    const _recallGrades = getRecallConditionsByRecallGrade(recallGradeDoc, fullname);
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
    const recentParticipants = await fetchRecentParticipants(fullname);
    let recallGradesDocs = await db.collection("recallGradesV2").get();
    let recallGrades = consumeRecallGradesChanges(recallGradesDocs.docs, fullname);
    for (let project in recallGrades) {
      let includeRecentParticipants = recallGrades[project].filter(g =>
        Object.keys(recentParticipants[project]).includes(g.user)
      );
      let dontIncludeRecentParticipants = recallGrades[project].filter(
        g => !Object.keys(recentParticipants[project]).includes(g.user)
      );
      recallGrades[project] = [...includeRecentParticipants, ...dontIncludeRecentParticipants].slice(0, 200);
    }
    res.status(200).send(recallGrades);
  } catch (error) {
    res.status(500).send({ message: "error", data: error });
    console.log(error);
  }
};
