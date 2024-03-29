const { db } = require("./admin");
const { Timestamp } = require("firebase-admin/firestore");

// We're using fullname as id in some Firestore collections.
// For these purposes, we need to escape some characters.
const getFullname = (firstname, lastname) => {
  return (firstname + " " + lastname).replace(".", "").replace("__", " ").replace("/", " ");
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

  const sTimestamp = Timestamp.fromDate(stTime);
  const eTimestamp = Timestamp.fromDate(etTime);
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

const strToBoolean = str => {
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
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
};

const datesAreOnSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const isToday = theDate => {
  const now = new Date();
  return datesAreOnSameDay(now, theDate);
};

const getDateString = dateObj => {
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

const getDateTimeString = dateObj => {
  return (
    dateObj.getUTCFullYear() +
    "/" +
    ("0" + (dateObj.getUTCMonth() + 1)).slice(-2) +
    "/" +
    ("0" + dateObj.getUTCDate()).slice(-2) +
    " " +
    ("0" + dateObj.getUTCHours()).slice(-2) +
    ":" +
    ("0" + dateObj.getUTCMinutes()).slice(-2) +
    ":" +
    ("0" + dateObj.getUTCSeconds()).slice(-2)
  );
};

const nextWeek = () => {
  let nextWeek = new Date();
  nextWeek = new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  nextWeek = new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate());
  return nextWeek;
};

// Removes leading and trailing whitespace from the string and capitalize its first character.
const capitalizeFirstLetter = string => {
  return string.trim().charAt(0).toUpperCase() + string.trim().slice(1).toLowerCase();
};

const capitalizeSentence = (string = "") => {
  return string
    .split(" ")
    .map(letter => {
      if (letter.length > 3) {
        return capitalizeFirstLetter(letter);
      }
      return letter;
    })
    .join(" ");
};

const pad2Num = number => {
  return (number < 10 ? "0" : "") + number;
};

const delay = async time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const fetchRecentParticipants = async researcher => {
  // logic to fetch recently participants names by current researcher
  const recentParticipants = {};

  const resSchedules = await db.collection("resSchedule").get();
  const expSessions = await db.collection("expSessions").where("researcher", "==", researcher).get();

  const assignedPoints = {};
  for (let expDoc of expSessions.docs) {
    const expData = expDoc.data();
    const session = expData?.session;
    const participant = expData?.user || "";
    if (!assignedPoints.hasOwnProperty(expData.project)) {
      assignedPoints[expData.project] = {};
    }
    if (!assignedPoints[expData.project].hasOwnProperty(participant)) {
      assignedPoints[expData.project][participant] = [];
    }
    assignedPoints[expData.project][participant].push(session);
  }
  for (const resSchedule of resSchedules.docs) {
    const resScheduleData = resSchedule.data();
    const attendedSessions = resScheduleData?.attendedSessions?.[researcher] || {};

    for (const participant in attendedSessions) {
      const assignedPointsProject = assignedPoints[resScheduleData.project];
      const assignedPointsSessions = assignedPointsProject ? assignedPointsProject[participant] || [] : [];

      if (!recentParticipants.hasOwnProperty(participant)) {
        recentParticipants[participant] = [];
      }
      for (let session of attendedSessions[participant]) {
        if (!recentParticipants[participant].includes(session) && !assignedPointsSessions.includes(session)) {
          recentParticipants[participant].push(session);
        }
      }
    }
  }
  Object.keys(recentParticipants).forEach(participant => {
    if (recentParticipants[participant].length === 0) {
      delete recentParticipants[participant];
    }
  });
  return recentParticipants;
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
  getDateTimeString,
  nextWeek,
  capitalizeFirstLetter,
  capitalizeSentence,
  pad2Num,
  delay,
  fetchRecentParticipants
};
