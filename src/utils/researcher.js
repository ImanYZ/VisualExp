import { firebase } from "../Components/firebase/firebase";

export const fetchRecentParticipants = async (researcher, project) => {
  // logic to fetch recently participants names by current researcher
  const recentParticipants = {};
  const resSchedules = await firebase.db.collection("resSchedule").where("project", "==", project).get();
  const expSessions = await firebase.db
    .collection("expSessions")
    .where("project", "==", project)
    .where("researcher", "==", researcher)
    .get();

  const assignedPoints = {};
  for (let expDoc of expSessions.docs) {
    const expData = expDoc.data();
    const session = expData?.session;
    const participant = expData?.user || "";
    if (!assignedPoints.hasOwnProperty(participant)) {
      assignedPoints[participant] = [];
    }
    assignedPoints[participant].push(session);
  }

  for (const resSchedule of resSchedules.docs) {
    const resScheduleData = resSchedule.data();
    const attendedSessions = resScheduleData?.attendedSessions?.[researcher] || {};
    for (const participant in attendedSessions) {
      for (let session of attendedSessions[participant] || []) {
        if (!recentParticipants.hasOwnProperty(participant)) {
          recentParticipants[participant] = [];
        }
        if (
          !recentParticipants[participant].hasOwnProperty(session) &&
          (!assignedPoints.hasOwnProperty(participant) || !assignedPoints[participant].includes(session))
        ) {
          recentParticipants[participant].push(session);
        }
      }
    }
  }

  return Object.fromEntries(Object.entries(recentParticipants).filter(([key, value]) => value.length > 0));
};
