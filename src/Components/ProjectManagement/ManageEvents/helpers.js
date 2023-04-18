import axios from "axios";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import GridCellToolTip from "../../GridCellToolTip";

// Call this for sessions that the participant has not accepted the Google
// Calendar invite yet, or should have been in the session but they have not
// shown up yet.
const sendEventNotificationEmail = params => async event => {
  await axios.post("/sendEventNotificationEmail", params);
};

// Call this for only 1st sessions that the participant declined the Google
// Calendar invite. In addition to emailing them the notification, it also
// deletes all their sessions and asks them to reschedule.
const rescheduleEventNotificationEmail = params => async event => {
  await axios.post("/rescheduleEventNotificationEmail", params);
};

// Get events from Google Calendar based on relativeURL.
// return the data for the states corresponding to each table.
export const retrieveEvents = async (relativeURL, firebase, availabilities) => {
  let responseObj = await axios.post(relativeURL, {});
  const allEvents = responseObj.data.events;
  const evs = [];
  const currentTime = new Date().getTime();

  const usersHash = {};
  const instructorsHash = {};
  const usersStudentCoNoteSurveyHash = {};

  const usersDocs = await firebase.db.collection("users").get();
  const instructorsDocs = await firebase.db.collection("instructors").get();
  const usersStudentCoNoteSurveyDocs = await firebase.db.collection("usersStudentCoNoteSurvey").get();
  usersDocs.forEach(userDoc => {
    usersHash[userDoc.data().email] = { ...userDoc.data(), id: userDoc.id };
  });

  instructorsDocs.forEach(instructorDoc => {
    instructorsHash[instructorDoc.data().email] = {
      ...instructorDoc.data(),
      id: instructorDoc.data().firstname + " " + instructorDoc.data().lastname
    };
  });
  usersStudentCoNoteSurveyDocs.forEach(userStudentCoNoteSurveyDoc => {
    usersStudentCoNoteSurveyHash[userStudentCoNoteSurveyDoc.data().email] = {
      ...userStudentCoNoteSurveyDoc.data(),
      id: userStudentCoNoteSurveyDoc.id
    };
  });

  // Each Google Calendar event has {start, end, attendees}.
  // Each attendee has {email, responseStatus}
  // attendee.responseStatus can take one of these possible values:
  // 'accepted', 'needsAction', 'tentative', 'declined'
  for (let ev of allEvents) {
    const startTime = new Date(ev.start.dateTime).getTime();
    const endTime = new Date(ev.end.dateTime).getTime();
    const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
    let weAreWaiting = false;
    //  If the event is already started and less than 30 minutes from
    // its endTime is passed:
    if (hoursLeft <= 0 && currentTime < endTime + 30 * 60 * 1000) {
      weAreWaiting = true;
    }
    const event = {
      start: new Date(ev.start.dateTime),
      end: new Date(ev.end.dateTime),
      id: ev.id,
      attendees: [],
      attendeesNum: 0,
      notAccepted: [],
      acceptedNum: 0,
      declined: [],
      declinedNum: 0,
      participant: "",
      order: "",
      firstname: "",
      fullname: "",
      hangoutLink: ev.hangoutLink,
      weAreWaiting,
      hoursLeft,
      courseName: ""
    };
    // If this event id is in one of the scheduled sessions (availabilities),
    const availabilitiesIdx = availabilities.findIndex(sch => sch.id === ev.id);
    if (availabilitiesIdx !== -1) {
      // Then, specify its participant email and the order of the
      // experiment session.
      event.participant = availabilities[availabilitiesIdx].email.toLowerCase();
      event.order = availabilities[availabilitiesIdx].order;
      let userData = {};
      if (usersHash.hasOwnProperty(event.participant)) {
        userData = usersHash[event.participant];
      } else if (instructorsHash.hasOwnProperty(event.participant)) {
        userData = instructorsHash[event.participant];
      } else if (usersStudentCoNoteSurveyHash.hasOwnProperty(event.participant)) {
        userData = usersStudentCoNoteSurveyHash[event.participant];
      }

      if (Object.keys(userData).length > 0 > 0) {
        // then, assign their firstname, and courseName, if exists.
        event.fullname = userData.id;
        event.firstname = userData.firstname;
        if (userData.course) {
          event.courseName = userData.course;
        }
      }
    }
    if ("attendees" in ev) {
      event.attendeesNum = ev.attendees.length;
      for (let attendee of ev.attendees) {
        event.attendees.push(attendee.email.toLowerCase());
        if (attendee.responseStatus === "accepted") {
          event.acceptedNum += 1;
        } else {
          event.notAccepted.push(attendee.email.toLowerCase());
          if (attendee.responseStatus === "declined" || attendee.responseStatus === "tentative") {
            event.declined.push(attendee.email);
            event.declinedNum += 1;
          }
        }
      }
    }
    evs.sort((a, b) => b.start - a.start);
    evs.push(event);
  }
  console.log("Done loading events.", evs);
  return evs;
};

// Characteristics of the columns of the experiment sessions table.
export const expSessionsColumns = [
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  {
    field: "participant", // email address
    headerName: "Participant",
    width: 190
  },
  {
    field: "attendeesNum",
    headerName: "Att Num",
    type: "number",
    width: 70,
    renderCell: cellValues => {
      return cellValues.value + " T";
    }
  },
  {
    field: "acceptedNum",
    headerName: "Acc Num",
    type: "number",
    width: 70,
    renderCell: cellValues => {
      // If we're waiting for this participant, clicking this button
      // would email them a notification.
      return cellValues.row.weAreWaiting ? (
        <Button
          onClick={sendEventNotificationEmail({
            email: cellValues.row.participant,
            order: cellValues.row.order,
            firstname: cellValues.row.firstname,
            weAreWaiting: cellValues.row.weAreWaiting,
            hangoutLink: cellValues.row.hangoutLink,
            courseName: cellValues.row.courseName
          })}
          className="Button Red NotificationBtn"
          variant="contained"
        >
          {cellValues.value + " A"}
        </Button>
      ) : // If the participant has not accepted the Google Calendar
      // invite yet, clicking this button would email them a notification.
      cellValues.row.notAccepted.length > 0 && cellValues.row.hoursLeft <= 19 && cellValues.row.hoursLeft > 0 ? (
        <Button
          onClick={sendEventNotificationEmail({
            email: cellValues.row.participant,
            order: cellValues.row.order,
            firstname: cellValues.row.firstname,
            hoursLeft: cellValues.row.hoursLeft,
            courseName: cellValues.row.courseName
          })}
          className="Button Green NotificationBtn"
          variant="contained"
        >
          {cellValues.value + " A"}
        </Button>
      ) : (
        cellValues.value + " A"
      );
    }
  },
  {
    field: "notAccepted",
    headerName: "Not Accepted",
    width: 280,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "attendees",
    headerName: "Attendees",
    width: 220,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "declinedNum",
    headerName: "Dec Num",
    type: "number",
    width: 70,
    renderCell: cellValues => {
      // Only if this is a 1st session and the participant has declined
      // the Google Calendar ivite, clicking this button
      // would email them a notification and deletes all their sessions.
      return cellValues.value > 0 && cellValues.row.order === "1st" ? (
        <Button
          onClick={rescheduleEventNotificationEmail({
            id: cellValues.row.id,
            email: cellValues.row.participant,
            firstname: cellValues.row.firstname,
            hoursLeft: cellValues.row.hoursLeft,
            courseName: cellValues.row.courseName
          })}
          className="Button Red NotificationBtn"
          variant="contained"
        >
          {cellValues.value + " D"}
        </Button>
      ) : (
        cellValues.value + " D"
      );
    }
  },
  {
    field: "declined",
    headerName: "Declined",
    width: 220,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "id", // Event id comming from Google Calendar
    headerName: "Event Id",
    width: 190
  }
];

export const applicantsColumns = [
  { field: "createdAt", headerName: "Created", type: "dateTime", width: 190 },
  {
    field: "user", // Their fullname
    headerName: "Applicant",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "email",
    headerName: "Email",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  // {
  //   field: "experiment",
  //   headerName: "Experiment",
  //   width: 70,
  //   disableColumnMenu: true,
  //   renderCell: (cellValues) => {
  //     return cellValues.value ? "✅" : "";
  //   },
  // },
  {
    field: "tutStarted", //They have started the tutorial
    headerName: "Tut Started",
    width: 130,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return cellValues.value ? "✅" : "";
    }
  },
  {
    field: "tutorial", //They have completed the tutorial
    headerName: "Tutorial",
    width: 100,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return cellValues.value ? "✅" : "";
    }
  },
  {
    field: "applicationsStarted",
    headerName: "Applications Started",
    width: 280,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "applications",
    headerName: "Applications",
    width: 280,
    renderCell: cellValues => {
      const cellText =
        cellValues.value && cellValues.value.length > 0 ? (
          <ul>
            {cellValues.value.map(communiVal => {
              return <li key={communiVal}>{communiVal}</li>;
            })}
          </ul>
        ) : (
          ""
        );
      return (
        <Tooltip title={cellText} placement="top">
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden"
            }}
          >
            {cellText}
          </div>
        </Tooltip>
      );
    }
  },
  {
    field: "withdrew",
    headerName: "Withdrew",
    width: 100,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return cellValues.value ? "🚫" : "";
    }
  },
  {
    field: "withdrawExp",
    headerName: "withdrawal Explanation",
    width: 280,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "reminder", // The last time the system sent them an automated reminder
    headerName: "Reminder",
    type: "dateTime",
    width: 190
  }
];

export const istructorsColumns = [
  {
    field: "interestedTopic",
    headerName: "Interested Topic",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "votes",
    headerName: "Up-votes - Down-votes",
    width: 190,
    type: "number"
  },
  {
    field: "instructor", // Their fullname
    headerName: "Instructor",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "email",
    headerName: "Email",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "reminders",
    headerName: "number Of reminder",
    type: "number",
    width: 180
  },
  {
    field: "emailstatus",
    headerName: "emailstatus",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "scheduled",
    headerName: "Scheduled the Session",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "inviteStudents",
    headerName: "Invited Students",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "rescheduled",
    headerName: "Rescheduled the Email",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "notIntersted",
    headerName: "Not Intersted",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  { field: "nextReminder", headerName: "Next Reminder", type: "dateTime", width: 190 }
];

export const adminstratorsColumns = [
  {
    field: "votes",
    headerName: "Up-votes - Down-votes",
    width: 190,
    type: "number"
  },
  {
    field: "howToAddress", // Their fullname
    headerName: "How To Address",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "position", // Their fullname
    headerName: "position",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "institution", // Their fullname
    headerName: "institution",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "email",
    headerName: "Email",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "reminders",
    headerName: "number Of reminder",
    type: "number",
    width: 180
  },
  {
    field: "emailstatus",
    headerName: "emailstatus",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "scheduled",
    headerName: "Scheduled the Session",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "inviteStudents",
    headerName: "Invited Students",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "rescheduled",
    headerName: "Rescheduled the Email",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "notIntersted",
    headerName: "Not Intersted",
    width: 190,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  { field: "nextReminder", headerName: "Next Reminder", type: "dateTime", width: 190 }
];
