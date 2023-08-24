const { db } = require("../admin");


//assign points to researchers based on their thematic coding
//if more than 3 researchers code the same code for a the same transcript, they all get 0.4 points

module.exports = async context => {
  try {
    const project = "OnlineCommunities";
    const reaserchersDocs = await db.collection("researchers").get();
    const thematicDocs = await db.collection("thematicAnalysis").get();

    const thematicHashMap = {};
    thematicDocs.docs.forEach(doc => {
      const themathicData = doc.data();
      if (thematicHashMap.hasOwnProperty(themathicData.transcriptId)) {
        thematicHashMap[themathicData.transcriptId].push(themathicData);
      } else {
        thematicHashMap[themathicData.transcriptId] = [themathicData];
      }
    });
    const researchers = {};
    reaserchersDocs.docs.forEach(doc => {
      if (doc.data().projects && doc.data().projects.hasOwnProperty(project)) {
        researchers[doc.id] = doc.data();
      }
    });
    const researchersPoints = {};
    for (let transcriptId in thematicHashMap) {
      const _reaserchersPoints = {};
      for (let thematicData of thematicHashMap[transcriptId]) {
        const selectedCodes = [...new Set(Object.values(thematicData.codesBook).flatMap(x => x))];
        selectedCodes.forEach(code => {
          if (_reaserchersPoints.hasOwnProperty(code)) {
            _reaserchersPoints[code].push(thematicData.researcher);
          } else {
            _reaserchersPoints[code] = [thematicData.researcher];
          }
        });
      }
      for (let code in _reaserchersPoints) {
        if (_reaserchersPoints[code].length >= 3) {
          for (let researcher of _reaserchersPoints[code]) {
            if (researchersPoints.hasOwnProperty(researcher)) {
              researchersPoints[researcher] += 0.4;
              researchersPoints[researcher] = Math.round(researchersPoints[researcher] * 10) / 10;
            } else {
              researchersPoints[researcher] = 0.4;
            }
          }
        }
      }
    }
    for (let researcher in researchersPoints) {
      const researcherUpdate = researchers[researcher];
      if (researcherUpdate.projects.hasOwnProperty(project)) {
        researcherUpdate.projects[project].positiveCodingPoints = researchersPoints[researcher];
      }
      await db.collection("researchers").doc(researcher).update(researcherUpdate);
    }
    console.log(researchersPoints);
  } catch (err) {
    console.log({ err });
  }
};
