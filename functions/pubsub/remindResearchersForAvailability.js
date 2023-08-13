const { db } = require("../admin");
const moment = require("moment");
const { delay } = require("../helpers/common");

const { remindResearcherToSpecifyAvailability } = require("../emailing");

module.exports = async (req, res) => {
  try {
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    // let waitTime = 0;
    // const researchersInfo = [];

    // Retrieve all the researchers to check availabilities per researcher,
    // per project, only if the researcher is active in that project.
    const researchersDocs = await db.collection("researchers").get();
    for (let researcherDoc of researchersDocs.docs) {
      const researcherData = researcherDoc.data();
      if ("projects" in researcherData) {
        for (const project in researcherData.projects) {
          if (
            researcherData.projects[project].hasOwnProperty("active") &&
            researcherData.projects[project].active &&
            researcherData.projects[project].hasOwnProperty("scheduleSessions") &&
            researcherData.projects[project].scheduleSessions
          ) {
            // month for next 10 days
            const scheduleMonths = [
              moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD"),
              moment().utcOffset(-4).startOf("month").add(1, "months").format("YYYY-MM-DD")
            ];
            const resSchedules = await db.collection("resSchedule").where("month", "in", scheduleMonths).get();
            let lastAvailability = new Date();
            if (resSchedules.docs.length) {
              for (let resScheduleDoc of resSchedules.docs) {
                const resScheduleData = resScheduleDoc.data();
                const availabilities = resScheduleData.schedules[researcherDoc.id] || [];
                for (const availability of availabilities) {
                  const _availability = moment(availability).utcOffset(-4, true).toDate();
                  if (_availability.getTime() > lastAvailability.getTime()) {
                    lastAvailability = _availability;
                  }
                }
              }
            }
            let tenDaysLater = new Date();
            tenDaysLater = new Date(tenDaysLater.getTime() + 10 * 24 * 60 * 60 * 1000);
            let sevenDaysLater = new Date();
            sevenDaysLater = new Date(sevenDaysLater.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (
              (lastAvailability.getTime() < tenDaysLater.getTime() && project !== "OnlineCommunities") ||
              (lastAvailability.getTime() < sevenDaysLater.getTime() && project === "OnlineCommunities")
            ) {
              const days = project === "OnlineCommunities" ? "seven" : "ten";
              console.log(researcherData.email, researcherDoc.id, project);
              // Increase waitTime by a random integer between 1 to 4 seconds.
              const waitTime = 1000 * (1 + Math.floor(Math.random() * 4));
              // Send a reminder email to a researcher that they have not specified
              // their availability for the next ten days and ask them to specify it.
              await remindResearcherToSpecifyAvailability(researcherData.email, researcherDoc.id, days, project);
              await delay(waitTime);
            }
          }
        }
        /* researchersInfo.push({
              fullname: researcherDoc.id,
              email: researcherData.email,
              projects: Object.keys(researcherData.projects)
            }); */
      }
    }
    return null;
  } catch (error) {
    console.log({ error });
  }
};
