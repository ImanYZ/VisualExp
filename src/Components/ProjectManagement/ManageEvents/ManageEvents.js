import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";

import { DataGrid } from "@mui/x-data-grid";

import SelectSessions from "../../SchedulePage/SelectSessions";

import "./ManageEvents.css";

import { firebaseState } from "../../../store/AuthAtoms";

const sendEventNotificationEmail = (params) => async (event) => {
  let responseObj = await axios.post("/sendEventNotificationEmail", params);
};

const expSessionsColumns = [
  { field: "start", headerName: "Start", type: "dateTime", width: 178 },
  {
    field: "participant",
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
      ) : cellValues.row.notAccepted.length > 0 &&
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
      const textVal = Array.isArray(cellValues.value)
        ? cellValues.value.join(", ")
        : "";
      return (
        <Tooltip title={textVal} placement="top">
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {textVal}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "attendees",
    headerName: "Attendees",
    width: 220,
    renderCell: (cellValues) => {
      const textVal = Array.isArray(cellValues.value)
        ? cellValues.value.join(", ")
        : "";
      return (
        <Tooltip title={textVal} placement="top">
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {textVal}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "declinedNum",
    headerName: "Dec Num",
    type: "number",
    width: 70,
    renderCell: (cellValues) => {
      return cellValues.value + " D";
    },
  },
  {
    field: "declined",
    headerName: "Declined",
    width: 220,
    renderCell: (cellValues) => {
      const textVal = Array.isArray(cellValues.value)
        ? cellValues.value.join(", ")
        : "";
      return (
        <Tooltip title={textVal} placement="top">
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {textVal}
          </div>
        </Tooltip>
      );
    },
  },
];

const errorAlert = (data) => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    console.log({ data });
    alert("Something went wrong! Please submit your availability again!");
  }
};

// Go through all future events.
// 1- List the events in the next 24 hours that attendees are not assigned to yet.
// In the list, add a button to delete both calendar invites for each record,
// then find the participant's next availability and create new events.
// 2- List the events in the next 24 hours that any of the attendees has not accepted it.
// 3- List participants who have no other availability, print a list of them
// and delete all their documents from the collection "schedule".
const ManageEvents = (props) => {
  const firebase = useRecoilValue(firebaseState);

  const [events, setEvents] = useState([]);
  const [expSessionsLoaded, setExpSessionsLoaded] = useState(false);
  const [participant, setParticipant] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [firstSessions, setFirstSessions] = useState([]);
  const [secondSession, setSecondSession] = useState(null);
  const [thirdSession, setThirdSession] = useState(null);
  const [submitable, setSubmitable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .orderBy("id")
        .get();
      const schedule = [];
      for (let scheduleDoc of scheduleDocs.docs) {
        schedule.push(scheduleDoc.data());
      }

      let responseObj = await axios.post("/allEvents", {});
      const allEvents = responseObj.data.events;
      const evs = [];
      const currentTime = new Date().getTime();
      // attendee.responseStatus: 'accepted', 'needsAction', 'tentative', 'declined'
      for (let ev of allEvents) {
        const startTime = new Date(ev.start.dateTime).getTime();
        const endTime = new Date(ev.end.dateTime).getTime();
        const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
        let weAreWaiting = false;
        if (hoursLeft <= 0 && currentTime < endTime + 30 * 60 * 1000) {
          weAreWaiting = true;
        }
        const event = {
          start: ev.start.dateTime,
          end: ev.end.dateTime,
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
          hangoutLink: ev.hangoutLink,
          weAreWaiting,
          hoursLeft,
          courseName: "",
        };
        const scheduleIdx = schedule.findIndex((sch) => sch.id === ev.id);
        if (scheduleIdx !== -1) {
          event.participant = schedule[scheduleIdx].email.toLowerCase();
          event.order = schedule[scheduleIdx].order;
        }
        if ("attendees" in ev) {
          event.attendeesNum = ev.attendees.length;
          for (let attendee of ev.attendees) {
            event.attendees.push(attendee.email.toLowerCase());
            if (attendee.email.toLowerCase() === event.participant) {
              const userDocs = await firebase.db
                .collection("users")
                .where("email", "==", attendee.email.toLowerCase())
                .get();
              if (userDocs.docs.length > 0) {
                const userData = userDocs.docs[0].data();
                event.firstname = userData.firstname;
                if (userData.course) {
                  event.courseName = userData.course;
                }
              }
            }
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
        evs.push(event);
      }
      setEvents(evs);
      setExpSessionsLoaded(true);
    };
    if (firebase) {
      loadEvents();
    }
  }, [firebase]);

  const gridRowClick = async (clickedRow) => {
    const theRow = clickedRow.row;
    if (theRow.participant) {
      setParticipant(theRow.participant);
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .where("email", "==", theRow.participant)
        .get();
      const sessions = [];
      for (let scheduleDoc of scheduleDocs.docs) {
        const sessionData = scheduleDoc.data();
        sessions.push(sessionData.session.toDate());
      }
      setSchedule(sessions);
    }
  };

  const submitData = async (event) => {
    setIsSubmitting(true);
    const userDocs = await firebase.db
      .collection("users")
      .where("email", "==", participant)
      .get();
    if (userDocs.docs.length > 0) {
      const userRef = firebase.db.collection("users").doc(userDocs.docs[0].id);
      const userData = userDocs.docs[0].data();
      if (userData.projectDone) {
        window.alert("This user completed the experiment before!");
        return;
      }
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .where("email", "==", participant)
        .get();
      let responseObj;
      for (let scheduleDoc of scheduleDocs.docs) {
        const scheduleData = scheduleDoc.data();
        if (scheduleData.id) {
          responseObj = await axios.post("/deleteEvent", {
            eventId: scheduleData.id,
          });
          errorAlert(responseObj.data);
        }
        const scheduleRef = firebase.db
          .collection("schedule")
          .doc(scheduleDoc.id);
        await firebase.batchDelete(scheduleRef);
      }
      responseObj = await axios.post("/schedule", {
        email: participant,
        first: firstSessions[0],
        second: secondSession,
        third: thirdSession,
      });
      errorAlert(responseObj.data);

      for (let session of schedule) {
        const scheduleRef = firebase.db.collection("schedule").doc();
        const theSession = {
          email: participant,
          session: firebase.firestore.Timestamp.fromDate(session),
        };
        if (session.getTime() === firstSessions[0].getTime()) {
          theSession.id = responseObj.data.events[0].data.id;
          theSession.order = "1st";
        } else if (session.getTime() === secondSession.getTime()) {
          theSession.id = responseObj.data.events[1].data.id;
          theSession.order = "2nd";
        } else if (session.getTime() === thirdSession.getTime()) {
          theSession.id = responseObj.data.events[2].data.id;
          theSession.order = "3rd";
        }
        await firebase.batchSet(scheduleRef, theSession);
      }
      await firebase.commitBatch();
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  return (
    <div id="ManageEventsContainer">
      <div id="ManageEventsContent">
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
        {schedule.length > 0 && (
          <SelectSessions
            startDate={new Date()}
            numDays={16}
            schedule={schedule}
            setSchedule={setSchedule}
            firstSessions={firstSessions}
            secondSession={secondSession}
            thirdSession={thirdSession}
            setFirstSessions={setFirstSessions}
            setSecondSession={setSecondSession}
            setThirdSession={setThirdSession}
            setSubmitable={setSubmitable}
            setSubmitable={setSubmitable}
          />
        )}
      </div>
      <div id="SignBtnContainer">
        <Button
          id="SubmitButton"
          onClick={submitData}
          className={submitable && !isSubmitting ? "Button" : "Button Disabled"}
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
