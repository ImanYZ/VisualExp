const { db } = require("../admin");

module.exports = async context => {
  try {
    const passageNumberOfParticipant = {};
    const usersDocs = await db.collection("users").get();

    usersDocs.forEach(userDoc => {
      const userData = userDoc.data();

      const hasRequiredData =
        userData.explanations && userData.explanations1Week && userData.explanations3Days && !userData.damagedDocument;

      if (hasRequiredData) {
        userData.pConditions.forEach(cond => {
          const { project } = userData;
          const { passage, condition } = cond;

          if (!passageNumberOfParticipant.hasOwnProperty(passage)) {
            passageNumberOfParticipant[passage] = {};
          }

          if (!passageNumberOfParticipant[passage].hasOwnProperty(project)) {
            passageNumberOfParticipant[passage][project] = {};
          }

          if (!passageNumberOfParticipant[passage][project].hasOwnProperty(condition)) {
            passageNumberOfParticipant[passage][project][condition] = 0;
          }

          passageNumberOfParticipant[passage][project][condition] += 1;
        });
      }
    });
    for (const passage in passageNumberOfParticipant) {
      const passageRef = db.collection("passages").doc(passage);
      const passageData = (await passageRef.get()).data();
      const projects = passageData.projects || {};
      for (const project in projects) {
        if (project === "H1L2" || project === "H2K2") {
          for (let condition in projects[project]) {
            projects[project][condition] = 0;
          }
        }
      }
      for (const project in passageNumberOfParticipant[passage]) {
        projects[project] = passageNumberOfParticipant[passage][project];
      }
      await passageRef.update({ projects });
    }
    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};
