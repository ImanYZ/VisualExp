const { db } = require("../../admin");
const { getNonSatisfiedPhrasesByPassageTitle } = require("../../helpers/passage");

module.exports = async (req, res) => {
  const {
    recallGrade: sessionRecallGrade,
    voterProject,
    viewedPhrases
  } = req.body;
  const { fullname } = req.userData;
  const { researcher } = req;

  if(!sessionRecallGrade || !voterProject || !viewedPhrases) {
    return res.status(500).send({
      message: "some parameters are missing"
    });
  }

  const { session, response } = sessionRecallGrade;

  await db.runTransaction(async (t) => {
    const transactionWrites = [];
    
    const researcherProject = researcher.projects[voterProject];
    let gradingNum = researcherProject?.gradingNum || 0;
    gradingNum += viewedPhrases.length;

    const researchers = await db.collection("researchers").get();
    const otherResearchersData = {};
    for(const researcher of researchers.docs) {
      otherResearchersData[researcher.id] = researcher.data();
    }

    const passage = await db.collection("passages").doc(sessionRecallGrade.passage).get();
    const passageData = passage.data();

    const recallGrade = await db.collection("recallGradesV2").doc(sessionRecallGrade.docId).get();
    const recallGradeData = recallGrade.data();
    const sessionUpdates = recallGradeData.sessions[session];

    // filtering non satisfied phrases from recallgrade
    const nonSatisfiedPhrases = await getNonSatisfiedPhrasesByPassageTitle(passage.title, response, recallGradeData.phrases);

    // filtering satisfied phrases to calculate if session is verified or not
    const satisfiedPhrases = recallGradeData.phrases.filter((phrase) => !nonSatisfiedPhrases.includes(phrase.phrase))

    // there should be 4 down/no votes or up/yes votes to consider phrase verification
    
  })
}