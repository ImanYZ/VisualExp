const { createExperimentEvent } = require("../helpers/createExperimentEvent");
const { db } = require("../admin");

exports.scheduleSingleSession = async object => {
  try {
    console.log(object);
    const { email, researcher, order, session, project, sessionIndex, surveyType } = object;
    const start = new Date(session);

    const projectSpecs = await db.collection("projectSpecs").doc(project).get();
    const researcherDoc = await db.collection("researchers").doc(researcher).get();
    if (!projectSpecs.exists) {
      throw new Error("Project Specs not found.");
    }
    const projectSpecsData = projectSpecs.data();
    const researcherData = researcherDoc.data();
    // 1 hour / 2 = 30 mins
    const slotDuration = 60 / (projectSpecsData.hourlyChunks || 2);
    if (surveyType === "instructor") {
      projectSpecsData.sessionDuration = [1];
    }
    const end = new Date(
      start.getTime() + slotDuration * (projectSpecsData.sessionDuration?.[sessionIndex] || 1) * 60000
    );
    const eventCreated = await createExperimentEvent(
      email,
      researcherData.email,
      order,
      start,
      end,
      projectSpecsData,
      surveyType
    );
    return eventCreated;
  } catch (err) {
    console.log({ err });
  }
};
