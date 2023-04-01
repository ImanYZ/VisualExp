import moment from "moment";
import { firebase } from "../Components/firebase/firebase";

export const fetchRecentParticipants = async researcher => {
  // logic to fetch recently participants names by current researcher
  const recentParticipants = {};
  const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
  const month2WeeksAgo = moment().utcOffset(-4).subtract(16, "days").startOf("month").format("YYYY-MM-DD");
  if (!scheduleMonths.includes(month2WeeksAgo)) {
    scheduleMonths.push(month2WeeksAgo);
  }
  const resSchedules = await firebase.db.collection("resSchedule").where("month", "in", scheduleMonths).get();
  for (const resSchedule of resSchedules.docs) {
    const resScheduleData = resSchedule.data();
    const attendedSessions = resScheduleData?.attendedSessions?.[researcher] || {};
    for (const participant in attendedSessions) {
      recentParticipants[participant] = attendedSessions[participant];
    }
  }
  return recentParticipants;
};
