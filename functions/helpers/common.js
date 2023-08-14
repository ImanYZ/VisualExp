const { db } = require("../admin");
const { getEvents } = require("../GoogleCalendar");

const { pad2Num, capitalizeFirstLetter } = require("../utils");

exports.delay = async time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

exports.getUserDocsfromEmail = async email => {
  let userDocs = await db.collection("users").where("email", "==", email).get();
  const usersSurveyDocs = await db.collection("usersSurvey").where("email", "==", email).get();
  return [...userDocs.docs, ...usersSurveyDocs.docs];
};

exports.getAvailableFullname = async fullname => {
  const userCollections = ["users", "usersSurvey"];

  let _fullname = fullname;
  while (true) {
    let found = false;

    for (const userCollection of userCollections) {
      const docRef = await db.collection(userCollection).doc(_fullname).get();
      if (docRef.exists) {
        found = true;
      }
    }

    if (!found) {
      break;
    }
    const randomNum = Math.floor(Math.random() * 10);
    _fullname += randomNum;
  }

  return _fullname;
};

// exports.getAvailableFullnameOneCademy = async (fName, lName) => {
//   let _fullname = fName.trim() + lName.trim();
//   while (true) {
//     let found = false;

//     const docRef = await knowledgeDb.collection("users").doc(_fullname).get();
//     if (docRef.exists) {
//       found = true;
//     }

//     if (!found) {
//       break;
//     }
//     const randomNum = Math.floor(Math.random() * 10);
//     _fullname += randomNum;
//   }
//   console.log("_fullname", _fullname);
//   return _fullname;
// };

// Get all the events in the past specified number of days.
exports.pastEvents = async previousDays => {
  try {
    let end = new Date();
    const start = new Date(end.getTime() - parseInt(previousDays) * 24 * 60 * 60 * 1000);
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
  }
};

// Get all the events in the next specified number of days.
exports.futureEvents = async nextDays => {
  try {
    // sometimes a user has started the session earlier and the PubSub gets fired
    // and if the user has not accepted the session, it is going to send them a reminder
    // to prevent that we start an hour and a half from now.
    const start = new Date(new Date().getTime() + 90 * 60 * 1000);
    let end = new Date();
    end = new Date(end.getTime() + nextDays * 24 * 60 * 60 * 1000);
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
  }
};

// Get all the events that are concluded today.
exports.todayPastEvents = async () => {
  try {
    let start = new Date();
    start = new Date(
      start.getFullYear() + "-" + pad2Num(start.getMonth() + 1) + "-" + pad2Num(start.getDate()) + "T12:00:00.000Z"
    );
    let end = new Date();
    end = new Date(end.getTime() - 60 * 60 * 1000);
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
  }
};