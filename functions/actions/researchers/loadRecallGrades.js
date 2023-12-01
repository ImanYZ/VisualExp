const { db } = require("../../admin");
const { dbReal } = require("../../admin_real");
const { fetchRecentParticipants } = require("../../utils");
const { validateBooleanExpression } = require("../../helpers/passage");
const { loadBooleanExpressions } = require("../../helpers/grading-recalls");

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const getMajority = (phrase, upvotes, downvotes) => {
  if (phrase.hasOwnProperty("majority")) {
    return phrase.majority ? "YES" : "NO";
  }
  if (upvotes < 3 && downvotes < 3) return null;

  return upvotes > downvotes ? "YES" : "NO";
};

const getRecallConditionsByRecallGrade = (recall, fullname, booleanByphrase, passagesByIds) => {
  try {
    const _conditionItems = [];
    Object.entries(recall.sessions).map(async ([session, conditionItems]) => {
      (Array.isArray(conditionItems) ? conditionItems || [] : []).forEach((conditionItem, conditionIdx) => {
        conditionItem.phrases = conditionItem.phrases.filter(
          p => passagesByIds[conditionItem.passage].phrases.includes(p.phrase) && !p.deleted
        );
        conditionItem.phrases.forEach(p => {
          if (!p.hasOwnProperty("researchers")) {
            p.researchers = [];
            p.grades = [];
          }
        });
        // console.log(conditionItem.phrases);
        // console.log(consideredPhrases);
        const filtered = (conditionItem.response || "")
          .replace(/[\.,]/g, " ")
          .split(" ")
          .filter(w => w.trim());
        if (recall.user !== fullname && filtered.length > 2) {
          let phrasesSatisfied = conditionItem.phrases.filter(phrase => {
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

          const phrasesWithMajority = phrasesSatisfied.filter(p => {
            const upVotes = (p.grades || []).filter(grade => grade).length;
            const downVotes = (p.grades || []).filter(grade => !grade).length;
            return getMajority(p, upVotes, downVotes);
          }).length;

          let priority = phrasesSatisfied.length > 0 ? phrasesWithMajority / phrasesSatisfied.length : 0;

          phrasesSatisfied = phrasesSatisfied.filter(p => {
            const upVotes = (p.grades || []).filter(grade => grade).length;
            const downVotes = (p.grades || []).filter(grade => !grade).length;
            return !getMajority(p, upVotes, downVotes);
          });

          if (phrasesSatisfied.length > 0) {
            _conditionItems.push({
              docId: recall.id,
              session,
              user: recall.user,
              project: recall.project,
              notSatisfiedphrases,
              satisfiedphrases: phrasesSatisfied,
              originalText: passagesByIds[conditionItem.passage].text,
              ...conditionItem,
              phrases: [...phrasesWithMajority, ...phrasesSatisfied],
              priority,
              conditionIdx
            });
          }
        }
      });
    });

    return _conditionItems;
  } catch (error) {
    throw new Error("");
  }
};

const consumeRecallGradesChanges = (recalls, fullname, booleanByphrase, passagesByIds) => {
  try {
    let recallGrades = {};
    for (const recall of recalls) {
      const _recallGrades = getRecallConditionsByRecallGrade(recall, fullname, booleanByphrase, passagesByIds);
      if (recallGrades.hasOwnProperty(recall.project)) {
        recallGrades[recall.project] = [...recallGrades[recall.project], ..._recallGrades];
      } else {
        recallGrades[recall.project] = [..._recallGrades];
      }
    }
    return recallGrades;
  } catch (error) {
    throw new Error("");
  }
};
module.exports = async (req, res) => {
  try {
    console.log("loadRecallGrades");
    const { project } = req.body;
    if (!["H2K2", "H1L2", "Autograding"].includes(project)) {
      return res.status(200).send([]);
    }
    const { docId: fullname } = req.researcher;

    const booleanByphrase = await loadBooleanExpressions();
    let passagesByIds = {};

    const recentParticipants = await fetchRecentParticipants(fullname);
    const recallsDocs = await dbReal.ref("/recallGradesV2").once("value");
    const recallsData = recallsDocs.val();
    const recalls = [];
    for (let id in recallsData) {
      recalls.push({ id, ...recallsData[id] });
    }

    const passageDoc = await db.collection("passages").get();

    passageDoc.docs.forEach(doc => {
      passagesByIds[doc.id] = doc.data();
    });

    let recallGrades = consumeRecallGradesChanges(recalls, fullname, booleanByphrase, passagesByIds);

    let _recallGrades = [];
    if (project === "Autograding") {
      for (let project in recallGrades) {
        _recallGrades = [..._recallGrades, ...recallGrades[project]];
      }
    } else {
      _recallGrades = recallGrades[project] || [];
    }

    _recallGrades = _recallGrades.sort((a, b) => b.priority - a.priority);

    if (Object.keys(recentParticipants).length > 0) {
      _recallGrades.sort((g1, g2) => {
        const p1 =
          Object.keys(recentParticipants).includes(g1.user) && recentParticipants[g1?.user].includes(g1.session);
        const p2 =
          Object.keys(recentParticipants).includes(g2.user) && recentParticipants[g2?.user].includes(g2.session);
        if (p1 && p2) return 0;
        return p1 && !p2 ? -1 : 1;
      });
    }

    return res.status(200).send({ recallgrades: _recallGrades.splice(0, 20) });
  } catch (error) {
    console.log("error error", error);
    return res.status(500).send({ message: "error", data: error });
  }
};
