import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
// import TextField from "@mui/material/TextField";

// import LocalizationProvider from "@mui/lab/LocalizationProvider";
// import AdapterDateFns from "@mui/lab/AdapterDateFns";
// import TimePicker from "@mui/lab/TimePicker";

import { DataGrid } from "@mui/x-data-grid";

import GridCellToolTip from "../../GridCellToolTip";
import SelectSessions from "../../SchedulePage/SelectSessions";

import "./ManageEvents.css";

import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
// import { firebaseOneState } from "../../../store/OneCademyAtoms";

// Call this for sessions that the participant has not accepted the Google
// Calendar invite yet, or should have been in the session but they have not
// shown up yet.
const sendEventNotificationEmail = (params) => async (event) => {
  await axios.post("/sendEventNotificationEmail", params);
};

// Call this for only 1st sessions that the participant declined the Google
// Calendar invite. In addition to emailing them the notification, it also
// deletes all their sessions and asks them to reschedule.
const rescheduleEventNotificationEmail = (params) => async (event) => {
  await axios.post("/rescheduleEventNotificationEmail", params);
};

// Characteristics of the columns of the experiment sessions table.
const expSessionsColumns = [
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  {
    field: "participant", // email address
    headerName: "Participant",
    width: 190,
  },
  {
    field: "attendeesNum",
    headerName: "Att Num",
    type: "number",
    width: 70,
    renderCell: (cellValues) => {
      return cellValues.value + " T";
    },
  },
  {
    field: "acceptedNum",
    headerName: "Acc Num",
    type: "number",
    width: 70,
    renderCell: (cellValues) => {
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
            courseName: cellValues.row.courseName,
          })}
          className="Button Red NotificationBtn"
          variant="contained"
        >
          {cellValues.value + " A"}
        </Button>
      ) : // If the participant has not accepted the Google Calendar
      // invite yet, clicking this button would email them a notification.
      cellValues.row.notAccepted.length > 0 &&
        cellValues.row.hoursLeft <= 19 &&
        cellValues.row.hoursLeft > 0 ? (
        <Button
          onClick={sendEventNotificationEmail({
            email: cellValues.row.participant,
            order: cellValues.row.order,
            firstname: cellValues.row.firstname,
            hoursLeft: cellValues.row.hoursLeft,
            courseName: cellValues.row.courseName,
          })}
          className="Button Green NotificationBtn"
          variant="contained"
        >
          {cellValues.value + " A"}
        </Button>
      ) : (
        cellValues.value + " A"
      );
    },
  },
  {
    field: "notAccepted",
    headerName: "Not Accepted",
    width: 280,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "attendees",
    headerName: "Attendees",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "declinedNum",
    headerName: "Dec Num",
    type: "number",
    width: 70,
    renderCell: (cellValues) => {
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
            courseName: cellValues.row.courseName,
          })}
          className="Button Red NotificationBtn"
          variant="contained"
        >
          {cellValues.value + " D"}
        </Button>
      ) : (
        cellValues.value + " D"
      );
    },
  },
  {
    field: "declined",
    headerName: "Declined",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "id", // Event id comming from Google Calendar
    headerName: "Event Id",
    width: 190,
  },
];

const applicantsColumns = [
  { field: "createdAt", headerName: "Created", type: "dateTime", width: 190 },
  {
    field: "user", // Their fullname
    headerName: "Applicant",
    width: 190,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 190,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
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
    renderCell: (cellValues) => {
      return cellValues.value ? "✅" : "";
    },
  },
  {
    field: "tutorial", //They have completed the tutorial
    headerName: "Tutorial",
    width: 100,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return cellValues.value ? "✅" : "";
    },
  },
  {
    field: "applicationsStarted",
    headerName: "Applications Started",
    width: 280,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "applications",
    headerName: "Applications",
    width: 280,
    renderCell: (cellValues) => {
      const cellText =
        cellValues.value && cellValues.value.length > 0 ? (
          <ul>
            {cellValues.value.map((communiVal) => {
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
              overflow: "hidden",
            }}
          >
            {cellText}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "withdrew",
    headerName: "Withdrew",
    width: 100,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return cellValues.value ? "🚫" : "";
    },
  },
  {
    field: "withdrawExp",
    headerName: "withdrawal Explanation",
    width: 280,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "reminder", // The last time the system sent them an automated reminder
    headerName: "Reminder",
    type: "dateTime",
    width: 190,
  },
];

const errorAlert = (data) => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    console.log({ data });
    alert("Something went wrong! Please submit your availability again!");
  }
};

// This is an admin interface, only for Iman, to monitor and manage
// experiment sessions and applicants' status in the application process.
const ManageEvents = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  // const firebaseOne = useRecoilValue(firebaseOneState);

  const [availabilities, setAvailabilities] = useState([]);
  const [availabilitiesLoaded, setAvailabilitiesLoaded] = useState(false);
  const [availableSessions, setAvailableSessions] = useState({});
  const [events, setEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [expSessionsLoaded, setExpSessionsLoaded] = useState(false);
  const [ongoingEventsLoaded, setOngoingEventsLoaded] = useState(false);
  const [participant, setParticipant] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [scheduleStart, setScheduleStart] = useState(new Date());
  const [firstSession, setFirstSession] = useState(null);
  const [secondSession, setSecondSession] = useState(null);
  const [thirdSession, setThirdSession] = useState(null);
  const [submitable, setSubmitable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoaded, setApplicantsLoaded] = useState(false);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [completed1st, setCompleted1st] = useState(0);
  const [completed2nd, setCompleted2nd] = useState(0);
  const [completed3rd, setCompleted3rd] = useState(0);
  const [recall1st, setRecall1st] = useState(0);
  const [recall2nd, setRecall2nd] = useState(0);
  const [recall3rd, setRecall3rd] = useState(0);
  const [recall1stRatio, setRecall1stRatio] = useState(0);
  const [recall2ndRatio, setRecall2ndRatio] = useState(0);
  const [recall3rdRatio, setRecall3rdRatio] = useState(0);

  // Retrieves all the available timeslots specified by all the
  // participnats so far that are associated with Google Calendar
  // events.
  useEffect(() => {
    const loadAvailabilities = async () => {
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .orderBy("id")
        .get();
      const sched = [];
      for (let scheduleDoc of scheduleDocs.docs) {
        sched.push(scheduleDoc.data());
      }
      setAvailabilities(sched);
      setAvailabilitiesLoaded(true);
    };
    if (firebase) {
      loadAvailabilities();
    }
  }, [firebase]);

  // Get events from Google Calendar based on relativeURL.
  // return the data for the states corresponding to each table.
  const retrieveEvents = async (relativeURL) => {
    let responseObj = await axios.post(relativeURL, {});
    const allEvents = responseObj.data.events;
    const evs = [];
    const currentTime = new Date().getTime();
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
        courseName: "",
      };
      // If this event id is in one of the scheduled sessions (availabilities),
      const availabilitiesIdx = availabilities.findIndex(
        (sch) => sch.id === ev.id
      );
      if (availabilitiesIdx !== -1) {
        // Then, specify its participant email and the order of the
        // experiment session.
        event.participant =
          availabilities[availabilitiesIdx].email.toLowerCase();
        event.order = availabilities[availabilitiesIdx].order;
        const userDocs = await firebase.db
          .collection("users")
          .where("email", "==", event.participant)
          .get();
        if (userDocs.docs.length > 0) {
          const userData = userDocs.docs[0].data();
          // then, assign their firstname, and courseName, if exists.
          event.fullname = userDocs.docs[0].id;
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
            if (
              attendee.responseStatus === "declined" ||
              attendee.responseStatus === "tentative"
            ) {
              event.declined.push(attendee.email);
              event.declinedNum += 1;
            }
          }
        }
      }
      evs.sort((a, b) => b.start - a.start);
      evs.push(event);
    }
    return evs;
  };

  // If availabilitiesLoaded, retrieve the ongoing events.
  useEffect(() => {
    const loadOngoingEvents = async () => {
      const evs = await retrieveEvents("/ongoingEvents");
      setOngoingEvents(evs);
      setOngoingEventsLoaded(true);
    };
    if (firebase && availabilitiesLoaded && availabilities) {
      loadOngoingEvents();
    }
  }, [firebase, availabilitiesLoaded, availabilities]);

  // If ongoingEventsLoaded, retrieve allEvents.
  // I first retieved the ongoingEvents, which was obviously a subset
  // of this because it would load much faster and we can see the
  // complete table on top while waiting for the tables below the
  // page to be loaded.
  useEffect(() => {
    const loadEvents = async () => {
      const evs = await retrieveEvents("/allEvents");
      setEvents(evs);
      setExpSessionsLoaded(true);
    };
    if (firebase && ongoingEventsLoaded && availabilities) {
      loadEvents();
    }
  }, [firebase, ongoingEventsLoaded, availabilities]);

  // Load data from applications to populate the content of the
  // application statuses table.
  useEffect(() => {
    const notifyApplicationStatuses = async () => {
      const appls = [];
      let registered = 0;
      let completedFirst = 0;
      let completedSecond = 0;
      let completedThird = 0;
      let recallFirst = 0;
      let recallSecond = 0;
      let recallThird = 0;
      let recallFirstRatio = 0;
      let recallSecondRatio = 0;
      let recallThirdRatio = 0;
      const userDocs = await firebase.db.collection("users").get();
      for (let userDoc of userDocs.docs) {
        const userData = userDoc.data();
        if (
          "createdAt" in userData &&
          userData.createdAt.toDate() > new Date("1-14-2022")
        ) {
          registered += 1;
          if ("postQ2Choice" in userData) {
            completedFirst += 1;
            if (
              "pConditions" in userData &&
              userData.pConditions.length === 2
            ) {
              recallFirst +=
                userData.pConditions[0].recallScore +
                userData.pConditions[1].recallScore;
              recallFirstRatio +=
                userData.pConditions[0].recallScoreRatio +
                userData.pConditions[1].recallScoreRatio;
            }
          }
          if ("post3DaysQ2Choice" in userData) {
            completedSecond += 1;
            if (
              "pConditions" in userData &&
              userData.pConditions.length === 2
            ) {
              recallSecond +=
                userData.pConditions[0].recall3DaysScore +
                userData.pConditions[1].recall3DaysScore;
              recallSecondRatio +=
                userData.pConditions[0].recall3DaysScoreRatio +
                userData.pConditions[1].recall3DaysScoreRatio;
            }
          }
          if ("projectDone" in userData && userData.projectDone) {
            completedThird += 1;
            if (
              "pConditions" in userData &&
              userData.pConditions.length === 2
            ) {
              recallThird += userData.pConditions[0].recall1WeekScore
                ? userData.pConditions[0].recall1WeekScore
                : 0 + userData.pConditions[1].recall1WeekScore
                ? userData.pConditions[1].recall1WeekScore
                : 0;
              recallThirdRatio +=
                userData.pConditions[0].recall1WeekScoreRatio +
                userData.pConditions[1].recall1WeekScoreRatio;
            }
            const appl = {
              id: userDoc.id,
              createdAt: userData.createdAt.toDate(),
              user: userDoc.id,
              email: userData.email,
              tutStarted: false,
              tutorial: false,
              applicationsStarted: [],
              applications: [],
              withdrew: "withdrew" in userData && userData.withdrew,
              withdrawExp: "withdrawExp" in userData && userData.withdrawExp,
              reminder:
                "reminder" in userData && userData.reminder
                  ? userData.reminder.toDate()
                  : null,
            };
            const tutorialDoc = await firebase.db
              .collection("tutorial")
              .doc(userDoc.id)
              .get();
            if (tutorialDoc.exists) {
              appl.tutStarted = true;
              const tutorialData = tutorialDoc.data();
              if ("ended" in tutorialData && tutorialData.ended) {
                appl.tutorial = true;
                let submittedOne = false;
                const applicationDocs = await firebase.db
                  .collection("applications")
                  .where("fullname", "==", userDoc.id)
                  .get();
                for (let applicationDoc of applicationDocs.docs) {
                  const applicationData = applicationDoc.data();
                  appl.applicationsStarted.push(applicationData.communiId);
                  if ("ended" in applicationData && applicationData.ended) {
                    submittedOne = true;
                    appl.applications.push(
                      applicationData.communiId +
                        ": " +
                        applicationData.corrects +
                        " - " +
                        applicationData.wrongs
                    );
                  }
                }
                // if (submittedOne) {
                // console.log(userDoc.id + " SUBMITTED an APPLICATION.");
                // } else {
                // await axios.post("/emailApplicationStatus", {
                //   email: userData.email,
                //   firstname: userData.firstname,
                //   subject: "Your 1Cademy Application is Incomplete!",
                //   content:
                //     "completed the first three steps in 1Cademy application system, but have not submitted any application to any of our research communities yet",
                //   hyperlink: "https://1cademy.us/home#JoinUsSection",
                // });
                // }
                // const user1CademyDocs = await firebaseOne.db
                //   .collection("users")
                //   .where("email", "==", userData.email)
                //   .get();
                // if (user1CademyDocs.docs.length > 0) {
                // console.log(
                //   userDoc.id + " has username: " + user1CademyDocs.docs[0].id
                // );
                // } else {
                //   console.log(
                //     userDoc.id +
                //       " has completed the tutorial but has NO 1Cademy ACCOUNT!!!!!!!!!"
                //   );
                // }
                // } else {
                // await axios.post("/emailApplicationStatus", {
                //   email: userData.email,
                //   firstname: userData.firstname,
                //   subject: "Your 1Cademy Application is Incomplete!",
                //   content:
                //     "completed the first two steps in 1Cademy application process, but have not completed the 1Cademy tutorial yet",
                //   hyperlink: "https://1cademy.us/home#JoinUsSection",
                // });
              }
              // } else {
              // await axios.post("/emailApplicationStatus", {
              //   email: userData.email,
              //   firstname: userData.firstname,
              //   subject: "Your 1Cademy Application is Incomplete!",
              //   content:
              //     "completed the first two steps in 1Cademy application process, but have not started the 1Cademy tutorial yet",
              //   hyperlink: "https://1cademy.us/home#JoinUsSection",
              // });
            }
            appls.push(appl);
          }
        }
      }
      setRecall1st(Math.floor(recallFirst / completedFirst));
      setRecall2nd(Math.floor(recallSecond / completedSecond));
      setRecall3rd(Math.floor(recallThird / completedThird));
      setRecall1stRatio(Math.floor(recallFirstRatio / completedFirst));
      setRecall2ndRatio(Math.floor(recallSecondRatio / completedSecond));
      setRecall3rdRatio(Math.floor(recallThirdRatio / completedThird));
      setTotalRegistered(registered);
      setCompleted1st(completedFirst);
      setCompleted2nd(completedSecond);
      setCompleted3rd(completedThird);
      setApplicants(appls);
      setApplicantsLoaded(true);
    };
    if (firebase && fullname) {
      notifyApplicationStatuses();
    }
  }, [firebase, fullname]);

  // Chooses a participant from the table to load their schedule
  // to be able to update one of their scheduled sessions.
  const gridRowClick = async (clickedRow) => {
    const theRow = clickedRow.row;
    if (theRow.participant) {
      const email = theRow.participant;
      setParticipant(email);
      setScheduleLoaded(false);
      // We need to first retrieve which project this user belongs to.
      const userDoc = await firebase.db
        .collection("users")
        .doc(theRow.fullname)
        .get();
      const userData = userDoc.data();
      const project = userData.project;
      // researchers = an object of fullnames as keys and the corresponding email addresses as values.
      const researchers = {};
      const researcherDocs = await firebase.db.collection("researchers").get();
      for (let researcherDoc of researcherDocs.docs) {
        const researcherData = researcherDoc.data();
        // We only need the researchers who are active in the project that the user belongs to.
        if (
          "projects" in researcherData &&
          project in researcherData.projects &&
          researcherData.projects[project].active
        ) {
          researchers[researcherDoc.id] = researcherData.email;
        }
      }
      // availSessions = a placeholder to accumulate values that we will eventually put in availableSessions.
      // Each kay indicates a session timestamp and the corresponding value is an array of researcher emails
      // that may include 0 to many researchers who are available at that session.
      const availSessions = {};
      // Retrieve all the researchers' avaialbilities in this project.
      const resScheduleDocs = await firebase.db
        .collection("resSchedule")
        .where("project", "==", project)
        .get();
      for (let resScheduleDoc of resScheduleDocs.docs) {
        const resScheduleData = resScheduleDoc.data();
        const resSession = resScheduleData.session.toDate();
        const resSessionStr = resSession.toLocaleString();
        // Only if the researcher is active in this project:
        if (resScheduleData.fullname in researchers) {
          // Add the available slots for the researcher's email.
          if (resSessionStr in availSessions) {
            availSessions[resSessionStr].push(
              researchers[resScheduleData.fullname]
            );
          } else {
            availSessions[resSessionStr] = [
              researchers[resScheduleData.fullname],
            ];
          }
        }
      }
      // We need to retrieve all the currently scheduled events to figure
      // out which sessions are already taken and exclude them from availSessions.
      // We don't need to retrieve the events from Google Calendar again,
      // because we've already retrieved and saved them in `events` state.
      for (let event of events) {
        const startTime = new Date(event.start).toLocaleString();
        const startMinus30Min = new Date(
          event.start.getTime() - 30 * 60 * 1000
        );
        // If the event has some attendees and the start timestamp is a key in availSessions,
        // we should remove all the attendees who are available researchers at this timestamp,
        // unless the researcher was previously assign to the 1st, 2nd, or 3rd session for
        // this participnat and the participant is rescheduling their sessions,
        // OR 30 minutes before this session was the 1st session for this participant.
        // This latter check is necessary to handle the exception where there is a second
        // session staring 30 minutes after this session. We should not remove that second
        // time slot, otherwise the system would not show this as an available slot and the
        // participant would not be able to take this one-hour slot for their 1st session.
        if (
          event.attendees &&
          event.attendees.length > 0 &&
          startTime in availSessions &&
          availSessions[startTime].length > 0 &&
          !event.attendees.includes(email) &&
          events.findIndex(
            (eve) =>
              eve.start.getTime() === startMinus30Min.getTime() &&
              eve.order === "1st" &&
              eve.attendees.includes(email)
          ) === -1
        ) {
          // We should remove all the attendees who are available researchers at this timestamp:
          for (let attendee of event.attendees) {
            availSessions[startTime] = availSessions[startTime].filter(
              (resea) => resea !== attendee
            );
          }
        }
      }
      setAvailableSessions(availSessions);
      // Retrieve all the available time slots that the participant previously specified,
      // just to start from. They are supposed to modify these.
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .where("email", "==", email.toLowerCase())
        .get();
      const sch = [];
      // Define a copy of scheduleStart to find the earliest session for this participant.
      let sStart = scheduleStart;
      for (let scheduleDoc of scheduleDocs.docs) {
        const scheduleData = scheduleDoc.data();
        const session = scheduleData.session.toDate();
        const sessionStr = session.toLocaleString();
        sch.push(session);
        if (session.getTime() < sStart.getTime()) {
          sStart = session;
        }
      }
      if (sch.length > 0) {
        setSchedule(sch);
        setScheduleStart(sStart);
      }
      setTimeout(() => {
        setScheduleLoaded(true);
      }, 400);
    }
  };

  // Updates only one of the scheduled sessions for this participant.
  const submitNewSessions = async (event) => {
    setIsSubmitting(true);
    // First, we get the user's data to make sure they had not previously
    // completed all the three experiment sessions.
    const userDocs = await firebase.db
      .collection("users")
      .where("email", "==", participant)
      .get();
    if (userDocs.docs.length > 0) {
      const userRef = firebase.db.collection("users").doc(userDocs.docs[0].id);
      const userData = userDocs.docs[0].data();
      // If the user had previously completed all the three experiment sessions,
      // We just alert it and do nothing.
      if (userData.projectDone) {
        window.alert("This user completed the experiment before!");
        return;
      }
      // Otherwise,
      let scheduleDocs, scheduleRef, responseObj;
      // We should check which of their scheduled sessions we'd like to change.
      // For each of the 1st, 2nd, and 3rd sessions:
      for (let order of ["1st", "2nd", "3rd"]) {
        // sessi points to the state variable corresponding to the scheduled session.
        let sessi = firstSession;
        if (order === "2nd") {
          sessi = secondSession;
        } else if (order === "3rd") {
          sessi = thirdSession;
        }
        // Find the index of the event for the participant's corresponding session
        const eventIdx = events.findIndex(
          (eve) => eve.order === order && eve.participant === participant
        );
        // If we found their 1st/2nd/3rd session, but its start time is different
        // from the new firstSession/secondSession/thirdSession:
        if (
          eventIdx !== -1 &&
          events[eventIdx].start.getTime() !== sessi.getTime()
        ) {
          // Find this session in schedule collection.
          scheduleDocs = await firebase.db
            .collection("schedule")
            .where("email", "==", participant)
            .where("order", "==", order)
            .get();
          // If it exists:
          if (scheduleDocs.docs.length > 0) {
            // 1) Get rid of the event "id" and "order" from the document.
            scheduleRef = firebase.db
              .collection("schedule")
              .doc(scheduleDocs.docs[0].id);
            await firebase.batchUpdate(scheduleRef, {
              id: firebase.firestore.FieldValue.delete(),
              order: firebase.firestore.FieldValue.delete(),
            });
            // 2) Delete the event from Google Calendar.
            responseObj = await axios.post("/deleteEvent", {
              eventId: events[eventIdx].id,
            });
            errorAlert(responseObj.data);
            // 3) Schedule the new session on Google Calendar.
            responseObj = await axios.post("/scheduleSingleSession", {
              email: participant,
              researcher: availableSessions[sessi.toLocaleString()][0],
              order,
              session: sessi,
            });
            errorAlert(responseObj.data);
            // Figure out whether the new session already exists in schedule
            // for this participant.
            scheduleDocs = await firebase.db
              .collection("schedule")
              .where("email", "==", participant)
              .where("session", "==", sessi)
              .get();
            // If it exists, update it with the new event id and order.
            if (scheduleDocs.docs.length > 0) {
              scheduleRef = firebase.db
                .collection("schedule")
                .doc(scheduleDocs.docs[0].id);
              await firebase.batchUpdate(scheduleRef, {
                id: responseObj.data.events[0].data.id,
                order,
              });
            } else {
              // Otherwise, create a new one.
              scheduleRef = firebase.db.collection("schedule").doc();
              await firebase.batchSet(scheduleRef, {
                email: participant,
                session: firebase.firestore.Timestamp.fromDate(sessi),
                id: responseObj.data.events[0].data.id,
                order,
              });
            }
          }
        }
      }
      await firebase.commitBatch();
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  // Deprecated
  {
    // const submitSingleSession = (order) => async (event) => {
    //   setIsSubmitting(true);
    //   const userDocs = await firebase.db
    //     .collection("users")
    //     .where("email", "==", participant)
    //     .get();
    //   if (userDocs.docs.length > 0) {
    //     const userRef = firebase.db.collection("users").doc(userDocs.docs[0].id);
    //     const userData = userDocs.docs[0].data();
    //     if (userData.projectDone) {
    //       window.alert("This user completed the experiment before!");
    //       return;
    //     }
    //     let scheduleDocs = await firebase.db
    //       .collection("schedule")
    //       .where("email", "==", participant)
    //       .get();
    //     let responseObj;
    //     for (let scheduleDoc of scheduleDocs.docs) {
    //       const scheduleData = scheduleDoc.data();
    //       if (
    //         scheduleData.id &&
    //         scheduleData.order &&
    //         scheduleData.order === order
    //       ) {
    //         responseObj = await axios.post("/deleteEvent", {
    //           eventId: scheduleData.id,
    //         });
    //         errorAlert(responseObj.data);
    //         const scheduleRef = firebase.db
    //           .collection("schedule")
    //           .doc(scheduleDoc.id);
    //         await firebase.batchUpdate(scheduleRef, {
    //           id: firebase.firestore.FieldValue.delete(),
    //           order: firebase.firestore.FieldValue.delete(),
    //         });
    //       }
    //     }
    //     let sessi = firstSession;
    //     if (order === "2nd") {
    //       sessi = secondSession;
    //     } else if (order === "3rd") {
    //       sessi = thirdSession;
    //     }
    //     responseObj = await axios.post("/scheduleSingleSession", {
    //       email: participant,
    //       researcher: availableSessions[sessi.toLocaleString()][0],
    //       order,
    //       session: sessi,
    //     });
    //     errorAlert(responseObj.data);
    //     scheduleDocs = await firebase.db
    //       .collection("schedule")
    //       .where("email", "==", participant)
    //       .where("session", "==", sessi)
    //       .get();
    //     if (scheduleDocs.docs.length > 0) {
    //       const scheduleRef = firebase.db
    //         .collection("schedule")
    //         .doc(scheduleDocs.docs[0].id);
    //       await firebase.batchUpdate(scheduleRef, {
    //         id: responseObj.data.events[0].data.id,
    //         order,
    //       });
    //     } else {
    //       const scheduleRef = firebase.db.collection("schedule").doc();
    //       await firebase.batchSet(scheduleRef, {
    //         email: participant,
    //         session: firebase.firestore.Timestamp.fromDate(sessi),
    //         id: responseObj.data.events[0].data.id,
    //         order,
    //       });
    //     }
    //     await firebase.commitBatch();
    //     setSubmitted(true);
    //   }
    //   setIsSubmitting(false);
    // };
    // const changeFirstSession = (newDateTime) => {
    //   setFirstSession((oldFSession) => {
    //     const fSession = [...oldFSession];
    //     fSession.setHours(
    //       newDateTime.getHours(),
    //       newDateTime.getMinutes(),
    //       newDateTime.getSeconds()
    //     );
    //     return fSession;
    //   });
    // };
    // const changeSecondSession = (newDateTime) => {
    //   setSecondSession((oSSession) => {
    //     const oldSSession = new Date(oSSession);
    //     oldSSession.setHours(
    //       newDateTime.getHours(),
    //       newDateTime.getMinutes(),
    //       newDateTime.getSeconds()
    //     );
    //     return oldSSession;
    //   });
    // };
    // const changeThirdSession = (newDateTime) => {
    //   setThirdSession((oTSession) => {
    //     const oldTSession = new Date(oTSession);
    //     oldTSession.setHours(
    //       newDateTime.getHours(),
    //       newDateTime.getMinutes(),
    //       newDateTime.getSeconds()
    //     );
    //     console.log({ oTSession, oldTSession });
    //     return oldTSession;
    //   });
    // };
  }

  return (
    <div style={{ height: "100vh", overflowY: "auto" }}>
      <div className="dataGridTable">
        <DataGrid
          rows={ongoingEvents}
          columns={expSessionsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          hideFooterSelectedRowCount
          loading={!ongoingEventsLoaded}
          onRowClick={gridRowClick}
        />
      </div>
      <Paper style={{ margin: "19px", padding: "4px" }}>
        <p>{totalRegistered} total registered since 01/14/2022!</p>
        <p>
          {completed1st}
          {", "}
          {Math.round(
            (completed1st / totalRegistered + Number.EPSILON) * 100
          )}{" "}
          % Completed the 1st Session!
        </p>
        <p>
          {completed2nd}
          {", "}
          {Math.round((completed2nd / completed1st + Number.EPSILON) * 100)} %
          Completed the 2nd Session!
        </p>
        <p>
          {completed3rd}
          {", "}
          {Math.round((completed3rd / completed1st + Number.EPSILON) * 100)} %
          Completed the 3rd Session!
        </p>
        <p>{recall1st} Free recall score average in 1st session!</p>
        <p>{recall2nd} Free recall score average in 2nd session!</p>
        <p>{recall3rd} Free recall score average in 3rd session!</p>
        <p>{recall1stRatio} Free recall score ratio average in 1st session!</p>
        <p>{recall2ndRatio} Free recall score ratio average in 2nd session!</p>
        <p>{recall3rdRatio} Free recall score ratio average in 3rd session!</p>
      </Paper>
      <div className="dataGridTable">
        <DataGrid
          rows={applicants}
          columns={applicantsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          hideFooterSelectedRowCount
          loading={!applicantsLoaded}
        />
      </div>
      {/* Deprecated! */}
      {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div>
          <TimePicker
            label="First Session"
            value={firstSession}
            onChange={changeFirstSession}
            renderInput={(params) => <TextField {...params} />}
          />
          <Button
            onClick={submitSingleSession("1st")}
            className={
              !isSubmitting
                ? "Button SubmitButton"
                : "Button SubmitButton Disabled"
            }
            variant="contained"
            disabled={!isSubmitting ? null : true}
          >
            Update
          </Button>
        </div>
        <div>
          <TimePicker
            label="Second Session"
            value={secondSession}
            onChange={changeSecondSession}
            renderInput={(params) => <TextField {...params} />}
          />
          <Button
            onClick={submitSingleSession("2nd")}
            className={
              !isSubmitting
                ? "Button SubmitButton"
                : "Button SubmitButton Disabled"
            }
            variant="contained"
            disabled={!isSubmitting ? null : true}
          >
            Update
          </Button>
        </div>
        <div>
          <TimePicker
            label="Third Session"
            value={thirdSession}
            onChange={changeThirdSession}
            renderInput={(params) => <TextField {...params} />}
          />
          <Button
            onClick={submitSingleSession("3rd")}
            className={
              !isSubmitting
                ? "Button SubmitButton"
                : "Button SubmitButton Disabled"
            }
            variant="contained"
            disabled={!isSubmitting ? null : true}
          >
            Update
          </Button>
        </div>
      </LocalizationProvider> */}
      <div className="dataGridTable" style={{ marginBottom: "700px" }}>
        <DataGrid
          rows={events}
          columns={expSessionsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          hideFooterSelectedRowCount
          loading={!expSessionsLoaded}
          onRowClick={gridRowClick}
        />
        {scheduleLoaded && (
          <div style={{ height: "1300px" }}>
            <SelectSessions
              startDate={scheduleStart}
              numDays={16}
              schedule={schedule}
              setSchedule={setSchedule}
              availableSessions={availableSessions}
              firstSession={firstSession}
              secondSession={secondSession}
              thirdSession={thirdSession}
              setFirstSession={setFirstSession}
              setSecondSession={setSecondSession}
              setThirdSession={setThirdSession}
              setSubmitable={setSubmitable}
            />
          </div>
        )}
      </div>
      <div id="SignBtnContainer">
        <Button
          onClick={submitNewSessions}
          className={
            submitable && !isSubmitting
              ? "Button SubmitButton"
              : "Button SubmitButton Disabled"
          }
          variant="contained"
          disabled={submitable && !isSubmitting ? null : true}
        >
          Schedule
        </Button>
      </div>
    </div>
  );
};

export default ManageEvents;
