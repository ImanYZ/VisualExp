const { db } = require("../../admin");

const { fetchRecentParticipants } = require("../../utils");

module.exports = async (req, res) => {
  try {
    const { docId: fullname } = req.researcher;

    const codeIds = {};
    const recentParticipants = await fetchRecentParticipants(fullname);

    const feedbackCodes = await db.collection("feedbackCode").where("approved", "==", false).get();
    for (const feedbackCode of feedbackCodes.docs) {
      const feedbackCodeData = feedbackCode.data();
      if (!feedbackCodeData.coders.includes(fullname)) {
        const explanationWords = feedbackCodeData.explanation.split(" ").filter(w => w.trim());
        if (explanationWords.length < 4 && !Object.keys(recentParticipants).includes(feedbackCode.fullname)) {
          continue;
        }
        if (codeIds.hasOwnProperty(feedbackCodeData.project)) {
          codeIds[feedbackCodeData.project].push({ ...feedbackCodeData, docId: feedbackCode.id });
        } else {
          codeIds[feedbackCodeData.project] = [{ ...feedbackCodeData, docId: feedbackCode.id }];
        }
      }
    }
    for (let project in codeIds) {
      codeIds[project].sort((g1, g2) => {
        return g1.coders.length > g2.coders.length ? -1 : 1;
      });
      codeIds[project].sort((g1, g2) => {
        const p1 =
          Object.keys(recentParticipants).includes(g1.fullname) &&
          recentParticipants[g1?.fullname].includes(g1.session);
        const p2 =
          Object.keys(recentParticipants).includes(g2.fullname) &&
          recentParticipants[g2?.fullname].includes(g2.session);
        if (p1 && p2) return 0;
        return p1 && !p2 ? -1 : 1;
      });
    }
    res.status(200).send({ message: "success", codeIds });
  } catch (error) {
    console.log({ error }, "error----------");
  }
};
