const { db } = require("../../admin");

export const assignExpPoints = async (researcher, participant, session, project, t) => {
  const userRecallGradeDoc = await db
    .collection("recallGradesV2")
    .where("user", "==", participant)
    .where("project", "==", project)
    .get();
  const userfeedbackDocs = await db
    .collection("feedbackCode")
    .where("fullname", "==", participant)
    .where("project", "==", project)
    .where("session", "==", session)
    .get();

  const userRecallGradeData = userRecallGradeDoc.docs[0].data();

  const reacallSession = userRecallGradeData.sessions[session];
  let points = session === "1st" ? 16 : 10;
  let ready = true;
  for (let recall of reacallSession) {
    if (!recall.researchers.includes(researcher)) {
      ready = false;
      break;
    }
  }
  // if (!ready) there is no reason to check the feedbackcode collection
  if (!ready) return;
  for (let feedback of userfeedbackDocs.docs) {
    const feedbackData = feedback.data();
    if (!feedbackData.coders.includes(researcher)) {
      ready = false;
      break;
    }
  }
  if (!ready) return;
  
  const researcherRef = db.collection("researchers").doc(researcher);
  const researcherDoc = researcherRef.get();
  const researcherData = researcherDoc.data();
  let researcherExpPoints = 0;
  if (researcherData.projects[project].expPoints) {
    researcherExpPoints = researcherData.projects[project].expPoints;
  }
  const researcherProjectUpdates = {
    projects: {
      ...researcherData.projects,
      [project]: {
        ...researcherData.projects[project],
        expPoints: researcherExpPoints + points
      }
    }
  };
  researcherRef.update(researcherProjectUpdates);
};
