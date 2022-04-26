const { google } = require("googleapis");
require("dotenv").config();

const { generateUID } = require("./utils");

// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth;

// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);
const calendarId = process.env.UX_CALENDAR_ID;

// Call the setCredentials method on our oAuth2Client instance and set our refresh token.
oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

// Create a new calender instance.
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

// Insert new event to UX Google Calendar
exports.insertEvent = async (
  start,
  end,
  summary,
  description,
  attendees,
  colorId
) => {
  const event = {
    summary,
    description,
    //   "We'll match a UX researcher with you who is available at this time slot. " +
    //   "If we cannot find anyone, based on your specified availability in the following days, " +
    //   "we'll schedule another session for you and send you the corresponding Google Calendar invite.",
    start: {
      dateTime: start,
      timeZone: new Intl.DateTimeFormat().resolvedOptions(start).timeZone,
    },
    end: {
      dateTime: end,
      timeZone: new Intl.DateTimeFormat().resolvedOptions(end).timeZone,
    },
    // attendees: [{ email: "oneweb@umich.edu" }],
    attendees,
    colorId,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
        requestId: generateUID(),
      },
    },
  };
  try {
    let response = await calendar.events.insert({
      calendarId: calendarId,
      conferenceDataVersion: 1,
      resource: event,
      sendUpdates: "all",
    });

    if (response["status"] == 200 && response["statusText"] === "OK") {
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
exports.getEvent = async (eventId) => {
  try {
    const response = await calendar.events.get({
      calendarId,
      eventId,
    });

    return response["data"];
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return null;
  }
};

// Get all the events between two dates
exports.getEvents = async (dateTimeStart, dateTimeEnd, timeZone) => {
  try {
    let items = [];
    if (dateTimeEnd > dateTimeStart) {
      let response = { data: { nextPageToken: true } };
      const params = {
        calendarId,
        timeMin: dateTimeStart,
        timeMax: dateTimeEnd,
        timeZone,
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
    console.log({ response });
    console.log(`Error at getEvents --> ${error}`);
    return null;
  }
};

// Delete an event with eventID
exports.deleteEvent = async (eventId) => {
  try {
    let response = await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
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

{
  // // Provide the required configuration
  // const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
  // const calendarId = process.env.CALENDAR_ID;
  // // Google calendar API settings
  // const SCOPES = "https://www.googleapis.com/auth/calendar";
  // const calendar = google.calendar({ version: "v3" });
  // const auth = new google.auth.JWT(
  //   CREDENTIALS.client_email,
  //   null,
  //   CREDENTIALS.private_key,
  //   SCOPES
  // );
  // // Your TIMEOFFSET Offset
  // const TIMEOFFSET = "-04:00";
  // // Get date-time string for calender
  // const dateTimeForCalander = () => {
  //   let date = new Date();
  //   let year = date.getFullYear();
  //   let month = date.getMonth() + 1;
  //   if (month < 10) {
  //     month = `0${month}`;
  //   }
  //   let day = date.getDate();
  //   if (day < 10) {
  //     day = `0${day}`;
  //   }
  //   let hour = date.getHours();
  //   if (hour < 10) {
  //     hour = `0${hour}`;
  //   }
  //   let minute = date.getMinutes();
  //   if (minute < 10) {
  //     minute = `0${minute}`;
  //   }
  //   let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`;
  //   let event = new Date(Date.parse(newDateTime));
  //   let startDate = event;
  //   // Delay in end time is 1
  //   let endDate = new Date(
  //     new Date(startDate).setHours(startDate.getHours() + 1)
  //   );
  //   return {
  //     start: startDate,
  //     end: endDate,
  //   };
  // };
}

// ************
// Life Logging
// ************

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
      timeZone: new Intl.DateTimeFormat().resolvedOptions(start).timeZone,
    },
    end: {
      dateTime: end,
      timeZone: new Intl.DateTimeFormat().resolvedOptions(end).timeZone,
    },
    // attendees: [{ email: "oneweb@umich.edu" }],
    reminders: {
      useDefault: false,
    },
  };
  try {
    let response = await calendar.events.insert({
      calendarId: process.env.LIFE_LOGS_CALENDAR_ID,
      resource: event,
    });

    if (response["status"] == 200 && response["statusText"] === "OK") {
      return response;
    } else {
      return false;
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`);
    return false;
  }
};
