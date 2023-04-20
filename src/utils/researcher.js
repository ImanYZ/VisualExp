
import { firebase } from "../Components/firebase/firebase";

export const fetchRecentParticipants = async (researcher, project) => {
  // logic to fetch recently participants names by current researcher
  const recentParticipants = {};
  const resSchedules = await firebase.db.collection("resSchedule").where("project", "==", project).get();
  for (const resSchedule of resSchedules.docs) {
    const resScheduleData = resSchedule.data();
    const attendedSessions = resScheduleData?.attendedSessions?.[researcher] || {};
    for (const participant in attendedSessions) {
      recentParticipants[participant] = attendedSessions[participant];
    }
  }
  return recentParticipants;
};
