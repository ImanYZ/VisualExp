const { admin, db } = require("./admin");

// We're using fullname as id in some Firestore collections.
// For these purposes, we need to escape some characters.
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

const datesAreOnSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const isToday = (theDate) => {
  const now = new Date();
  return datesAreOnSameDay(now, theDate);
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

const nextWeek = () => {
  let nextWeek = new Date();
  nextWeek = new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  nextWeek = new Date(
    nextWeek.getFullYear(),
    nextWeek.getMonth(),
    nextWeek.getDate()
  );
  return nextWeek;
};

// Removes leading and trailing whitespace from the string and capitalize its first character.
const capitalizeFirstLetter = (string) => {
  return (
    string.trim().charAt(0).toUpperCase() + string.trim().slice(1).toLowerCase()
  );
};

const pad2Num = (number) => {
  return (number < 10 ? "0" : "") + number;
};

module.exports = {
  strToBoolean,
  getFullname,
  getActivityTimeStamps,
  getIn30Minutes,
  generateUID,
  isToday,
  datesAreOnSameDay,
  getDateString,
  nextWeek,
  capitalizeFirstLetter,
  pad2Num,
};
