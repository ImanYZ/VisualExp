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
    field: "yes",
    headerName: "Clicked Yes",
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
  {
    field: "emailtype",
    headerName: "Email Type",
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
