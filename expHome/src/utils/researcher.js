import moment from "moment";
import { firebase } from "../Components/firebase/firebase";

export const fetchRecentParticipants = async researcher => {
  // logic to fetch recently participants names by current researcher
  const recentParticipants = [];
  const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
  const month2WeeksAgo = moment().utcOffset(-4).subtract(16, "days").startOf("month").format("YYYY-MM-DD");
  if (!scheduleMonths.includes(month2WeeksAgo)) {
    scheduleMonths.push(month2WeeksAgo);
  }
  const resSchedules = await firebase.db.collection("resSchedule").where("month", "in", scheduleMonths).get();
  for (const resSchedule of resSchedules.docs) {
    const resScheduleData = resSchedule.data();
    const scheduled = resScheduleData?.scheduled?.[researcher] || {};

    for (let participant in scheduled) {
      if (
        Object.values(scheduled[participant]).some(
          session => moment(session).utcOffset(-4).format("YYYY-MM-DD") <= moment().utcOffset(-4).format("YYYY-MM-DD")
        )
      ) {
        recentParticipants.push(participant);
      }
    }
    console.log("recentParticipants", recentParticipants);
  }
  return recentParticipants;
};
