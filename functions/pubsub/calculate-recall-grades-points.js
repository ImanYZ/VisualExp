const { db } = require("../admin");
const { dbReal } = require("../admin_real");

const getMajority = grades => {
  const upvotes = grades.filter(g => g).length;
  const downvotes = grades.filter(g => !g).length;
  if (upvotes < 3 && downvotes < 3) return null;
  return upvotes > downvotes;
};
module.exports = async context => {
  try {
    await db.runTransaction(async t => {
      const researchersPoints = {
        H2K2: {},
        H1L2: {}
      };

      const phrasesPassage = {};

      const passagesDocs = await db.collection("passages").get();

      for (let passageDoc of passagesDocs.docs) {
        phrasesPassage[passageDoc.id] = [...(passageDoc.data().phrases || [])];
      }

      const recallsDocs = await dbReal.ref("/recallGradesV2").once("value");
      const recallsData = recallsDocs.val();

      for (let recallId in recallsData) {
        const recallgrade = recallsData[recallId];
        const researchersPointsProject = researchersPoints[recallgrade.project];
        const sessions = recallgrade.sessions;
        for (let session in sessions) {
          const sessionItem = sessions[session];
          for (let conditionItemIdx = 0; conditionItemIdx < sessionItem.length; conditionItemIdx++) {
            const conditionItem = sessionItem[conditionItemIdx];
            for (let phrase of conditionItem.phrases) {
              if ([...phrasesPassage[conditionItem.passage]].includes(phrase.phrase) && !phrase.deleted) {
                const researchers = phrase.researchers || [];
                const grades = phrase?.grades || [];
                const majority = getMajority(grades);
                if (majority !== null) {
                  for (let researcherIdx = 0; researcherIdx < researchers.length; researcherIdx++) {
                    if (!researchersPointsProject[researchers[researcherIdx]]) {
                      researchersPointsProject[researchers[researcherIdx]] = {
                        points: 0,
                        negativePoints: 0
                      };
                    }
                    if (grades[researcherIdx] === majority) {
                      researchersPointsProject[researchers[researcherIdx]].points =
                        (researchersPointsProject[researchers[researcherIdx]].points || 0) + 1;
                    } else {
                      researchersPointsProject[researchers[researcherIdx]].points =
                        (researchersPointsProject[researchers[researcherIdx]].points || 0) - 1;
                      researchersPointsProject[researchers[researcherIdx]].negativePoints =
                        (researchersPointsProject[researchers[researcherIdx]].negativePoints || 0) + 1;
                    }
                  }
                }
              }
            }
          }
        }
      }

      const researchersUpdates = {};
      const researchersDocs = await t.get(db.collection("researchers"));
      researchersDocs.forEach(doc => {
        const data = doc.data();
        researchersUpdates[doc.id] = data;
      });

      for (let researcher in researchersUpdates) {
        if (researchersUpdates[researcher].projects.hasOwnProperty("Autograding")) {
          researchersUpdates[researcher].projects.Autograding.gradingPoints =
            (researchersPoints["H2K2"][researcher]?.points || 0) + (researchersPoints["H1L2"][researcher]?.points || 0);
          researchersUpdates[researcher].projects.Autograding.negativeGradingPoints =
            (researchersPoints["H2K2"][researcher]?.negativePoints || 0) +
            (researchersPoints["H1L2"][researcher]?.negativePoints || 0);
        }
      }

      for (let project in researchersPoints) {
        for (let researcher in researchersPoints[project]) {
          //   console.log(researcher, researchersPoints[project][researcher]);
          if (researchersUpdates[researcher].projects.hasOwnProperty(project)) {
            researchersUpdates[researcher].projects[project].gradingPoints =
              researchersPoints[project][researcher].points;
            researchersUpdates[researcher].projects[project].negativeGradingPoints =
              researchersPoints[project][researcher].negativePoints;
          }
        }
      }

      for (let researcher in researchersUpdates) {
        const researcherRef = db.collection("researchers").doc(researcher);
        t.update(researcherRef, researchersUpdates[researcher]);
      }
    });
  } catch (error) {
    console.log("error calculate-recall-grades-points", error);
  }
};
