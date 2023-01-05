const MockData = require("../MockData");
const moment = require("moment");
const { generateUID } = require("../../utils");

const scheduleAvailabilities = [
  moment().utcOffset(-4).add(1, "hour").startOf("hour").format("YYYY-MM-DD HH:mm"),
  moment().utcOffset(-4).add(1, "hour").startOf("hour").add(30, "minutes").format("YYYY-MM-DD HH:mm"),
  moment().utcOffset(-4).add(3, "day").startOf("hour").add(1, "hour").format("YYYY-MM-DD HH:mm"),
  moment().utcOffset(-4).add(7, "day").startOf("hour").add(1, "hour").format("YYYY-MM-DD HH:mm"),
];

const scheduleByMonth = {};

for(const scheduleAvailability of scheduleAvailabilities) {
  const month = moment(scheduleAvailability).utcOffset(-4, true).startOf("month").format("YYYY-MM-DD");
  if(!scheduleByMonth[month]) {
    scheduleByMonth[month] = [];
  }
  scheduleByMonth[month].push(scheduleAvailability);
}

const schedules = [];

for(const month in scheduleByMonth) {
  schedules.push({
    documentId: generateUID(),
    researchers: [
      "Sam Ouhra"
    ],
    project: "H1L2",
    month,
    schedules: {
      "Sam Ouhra": scheduleByMonth[month]
    },
    scheduled: {}
  })
}

module.exports = new MockData(schedules, "resSchedule")
