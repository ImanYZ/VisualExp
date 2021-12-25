const { admin, db } = require("./admin");

const getFullname = (firstname, lastname) => {
  return (firstname + " " + lastname)
    .replace(".", "")
    .replace("__", " ")
    .replace("/", " ");
};

const getActivityTimeStamps = (aDate, sTime, eTime) => {
  const year = aDate.getFullYear();
  const month = aDate.getMonth();
  const date = aDate.getDate();
  const startHours = sTime.getHours();
  const startMinutes = sTime.getMinutes();
  const endHours = eTime.getHours();
  const endMinutes = eTime.getMinutes();
  const stTime = new Date(year, month, date, startHours, startMinutes);
  const etTime = new Date(year, month, date, endHours, endMinutes);

  const sTimestamp = admin.firestore.Timestamp.fromDate(stTime);
  const eTimestamp = admin.firestore.Timestamp.fromDate(etTime);
  return { sTimestamp, eTimestamp };
};

const getIn30Minutes = (startTime, endTime) => {
  if (endTime.getTime() <= startTime.getTime() + 30 * 60 * 1000) {
    return [{ sTime: startTime, eTime: endTime }];
  }
  let timeSlots = [];
  let eTime = startTime;
  let sTime = startTime;
  while (endTime.getTime() >= sTime.getTime() + 30 * 60 * 1000) {
    eTime = new Date(sTime.getTime() + 30 * 60 * 1000);
    timeSlots.push({ sTime, eTime });
    sTime = eTime;
  }
  return timeSlots;
};

const strToBoolean = (str) => {
  const str1 = str.toLowerCase();
  if (!str1 || str1 === "false" || str1 === "f") {
    return false;
  }
  return true;
};

//generates random id;
const generateUID = () => {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

const isToday = (theDate) => {
  const now = new Date();
  return (
    theDate.getFullYear() === now.getFullYear() &&
    theDate.getMonth() === now.getMonth() &&
    theDate.getDate() === now.getDate()
  );
};

const getDateString = (dateObj) => {
  const theDay = dateObj.getDate();
  const theMonth = dateObj.getMonth() + 1;
  return (
    dateObj.getFullYear() +
    "-" +
    (theMonth < 10 ? "0" + theMonth : theMonth) +
    "-" +
    (theDay < 10 ? "0" + theDay : theDay)
  );
};

module.exports = {
  strToBoolean,
  getFullname,
  getActivityTimeStamps,
  getIn30Minutes,
  generateUID,
  isToday,
  getDateString,
};
