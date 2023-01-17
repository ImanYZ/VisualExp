const { db } = require("../../admin");

module.exports = async (req, res) => {
  try {
    const { project, researcher, points} = req.body;
    const researcherRef = db.collection("researchers").doc(researcher);
    const researcherDoc = await researcherRef.get();
    const researcherData = researcherDoc.data();
    const expPoints = researcherData.projects[project].expPoints + points;
    const researcherUpdate = {
      ...researcherData,
        projects: {
            ...researcherData.projects,
            [project]: {
                ...researcherData.projects[project],
                expPoints,
            }}
    };
    const batch = db.batch();
    batch.update(researcherRef, researcherUpdate);
    await batch.commit();
    res.status(200).json({
      message: "Researcher points updated successfully",
      researcherUpdate
    });
  } catch (error) {
    console.log(error);
  }
};
