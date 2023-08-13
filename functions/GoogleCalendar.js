const { google } = require("googleapis");
const moment = require("moment");
const { mockConditions, mockSchedules } = require("./testUtils");

require("dotenv").config();

const { generateUID } = require("./utils");

// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth;

// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
const calendarId = process.env.UX_CALENDAR_ID;

// Call the setCredentials method on our oAuth2Client instance and set our refresh token.
oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// Create a new calender instance.
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
exports.calendar = calendar;

// Insert new event to UX Google Calendar
exports.insertEvent = async (start, end, summary, description, attendees, colorId) => {
  if(process.env.NODE_ENV === "test" && !process.env.TEST_CALENDAR) {
    return {
      data: {
        id: generateUID()
      }      
    };
  }
  const event = {
    summary,
    description,
    //   "We'll match a UX researcher with you who is available at this time slot. " +
    //   "If we cannot find anyone, based on your specified availability in the following days, " +
    //   "we'll schedule another session for you and send you the corresponding Google Calendar invite.",
    start: {
      dateTime: moment(start).utcOffset(0).toISOString(),
      timeZone: "UTC"
    },
    end: {
      dateTime: moment(end).utcOffset(0).toISOString(),
      timeZone: "UTC"
    },
    // attendees: [{ email: "oneweb@umich.edu" }],
    attendees,
    colorId,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 }
      ]
    },
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: {
          type: "hangoutsMeet"
        },
        requestId: generateUID()
      }
    }
  };
  try {
    let response = await calendar.events.insert({
      calendarId: calendarId,
      conferenceDataVersion: 1,
      resource: event,
      sendUpdates: process.env.NODE_ENV === "test" ? "none" : "all"
    });

    if (response["status"] === 200 && response["statusText"] === "OK") {
      return response;
    } else {
      return false;
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`);
    return false;
  }
};

// Get a specific event
exports.getEvent = async eventId => {
  if(process.env.NODE_ENV === "test" && !process.env.TEST_CALENDAR) {
    const schedule = mockSchedules.data.find(schedule => schedule.id === eventId);
    const startTime = moment(schedule ? schedule.session.toDate() : undefined);
    const endTime = moment(startTime).add(schedule ? (schedule.order === "1st" ? 60 : 30) : 60, "minutes");
    const timeZone = new Intl.DateTimeFormat().resolvedOptions(new Date()).timeZone;
    return {
      id: eventId,
      attendees: [
        {
          email: schedule ? schedule.email : "r3alst@gmail.com" // mock participant
        },
        {
          email: "ukasha@nowhere.com" // mock researcher
        }
      ],
      start: {
        dateTime: startTime.format("YYYY-MM-DD HH:mm"),
        timeZone
      },
      end: {
        dateTime: endTime.format("YYYY-MM-DD HH:mm"),
        timeZone
      }
    };
  }
  try {
    const response = await calendar.events.get({
      calendarId,
      eventId
    });

    return response["data"];
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return null;
  }
};

// Get all the events between two dates
exports.getEvents = async (dateTimeStart, dateTimeEnd, timeZone) => {
  if (process.env.NODE_ENV === "test" && !process.env.TEST_CALENDAR) {
    let items = [];
    mockSchedules.data.forEach(schedule => {
      const startTime = moment(schedule ? schedule.session.toDate() : undefined);
      const endTime = moment(startTime).add(schedule ? (schedule.order === "1st" ? 60 : 30) : 60, "minutes");
      const timeZone = new Intl.DateTimeFormat().resolvedOptions(new Date()).timeZone;
      items.push({
        id: schedule.id || generateUID(),
        attendees: [
          {
            email: schedule ? schedule.email : "r3alst@gmail.com" // mock participant
          },
          {
            email: "ouhrac@gmail.com" // mock researcher
          }
        ],
        start: {
          dateTime: startTime.format("YYYY-MM-DD HH:mm"),
          timeZone
        },
        end: {
          dateTime: endTime.format("YYYY-MM-DD HH:mm"),
          timeZone
        }
      });
    });
    return items;
  }
  try {
    let items = [];
    if (dateTimeEnd > dateTimeStart) {
      let response = { data: { nextPageToken: true } };
      const params = {
        calendarId,
        timeMin: dateTimeStart,
        timeMax: dateTimeEnd,
        timeZone
      };
      while (response.data.nextPageToken) {
        response = await calendar.events.list(params);
        items = [...items, ...response.data.items];
        if (response.data.nextPageToken) {
          params.pageToken = response.data.nextPageToken;
        }
      }
    }
    return items;
  } catch (error) {
    console.log({ error });
    console.log(`Error at getEvents --> ${error}`);
    return null;
  }
};

// Delete an event with eventID
exports.deleteEvent = async eventId => {
  if(process.env.NODE_ENV === "test" && !process.env.TEST_CALENDAR) {
    return true;
  }
  try {
    let response = await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId
    });

    if (response.data === "") {
      return true;
    }
  } catch (error) {
    console.log(`Error at deleteEvent --> ${error}`);
    return false;
  }
  return false;
};



// ************
// Life Logging
// ************

// Get all the events between two dates
exports.getLifeLogEvents = async (dateTimeStart, dateTimeEnd, timeZone) => {
  try {
    let items = [];
    if (dateTimeEnd > dateTimeStart) {
      let response = { data: { nextPageToken: true } };
      const params = {
        calendarId: process.env.LIFE_LOGS_CALENDAR_ID,
        timeMin: dateTimeStart,
        timeMax: dateTimeEnd,
        timeZone
      };
      while (response.data.nextPageToken) {
        response = await calendar.events.list(params);
        items = [...items, ...response.data.items];
        if (response.data.nextPageToken) {
          params.pageToken = response.data.nextPageToken;
        }
      }
      console.log({ response });
    }
    return items;
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return null;
  }
};

// Insert new event to Life Logging Google Calendar
exports.insertLifeLogEvent = async (start, end, summary, description) => {
  const event = {
    summary,
    description,
    //   "We'll match a UX researcher with you who is available at this time slot. " +
    //   "If we cannot find anyone, based on your specified availability in the following days, " +
    //   "we'll schedule another session for you and send you the corresponding Google Calendar invite.",
    start: {
      dateTime: start,
      timeZone: new Intl.DateTimeFormat().resolvedOptions(start).timeZone
    },
    end: {
      dateTime: end,
      timeZone: new Intl.DateTimeFormat().resolvedOptions(end).timeZone
    },
    // attendees: [{ email: "oneweb@umich.edu" }],
    reminders: {
      useDefault: false
    }
  };
  try {
    let response = await calendar.events.insert({
      calendarId: process.env.LIFE_LOGS_CALENDAR_ID,
      resource: event
    });

    if (response["status"] === 200 && response["statusText"] === "OK") {
      return response;
    } else {
      return false;
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`);
    return false;
  }
};
