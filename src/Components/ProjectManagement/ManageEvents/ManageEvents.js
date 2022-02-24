import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import { DataGrid } from "@mui/x-data-grid";

import GridCellToolTip from "../../GridCellToolTip";
import SelectSessions from "../../SchedulePage/SelectSessions";

import "./ManageEvents.css";

import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
// import { firebaseOnecademyState } from "../../../store/OneCademyAtoms";

const sendEventNotificationEmail = (params) => async (event) => {
  let responseObj = await axios.post("/sendEventNotificationEmail", params);
};

const rescheduleEventNotificationEmail = (params) => async (event) => {
  let responseObj = await axios.post(
    "/rescheduleEventNotificationEmail",
    params
  );
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
];

const applicantsColumns = [
  { field: "createdAt", headerName: "Created", type: "dateTime", width: 178 },
  {
    field: "user",
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
    field: "tutStarted",
    headerName: "Tut Started",
    width: 130,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return cellValues.value ? "✅" : "";
    },
  },
  {
    field: "tutorial",
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
              return <li>{communiVal}</li>;
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
];

const errorAlert = (data) => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    console.log({ data });
    alert("Something went wrong! Please submit your availability again!");
  }
};

const ManageEvents = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  // const firebaseOnecademy = useRecoilValue(firebaseOnecademyState);

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
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoaded, setApplicantsLoaded] = useState(false);

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
    if (firebase && fullname) {
      loadEvents();
    }
  }, [firebase, fullname]);

  useEffect(() => {
    const notifyApplicationStatuses = async () => {
      const appls = [];
      const userDocs = await firebase.db
        .collection("users")
        .where("projectDone", "==", true)
        .get();
      for (let userDoc of userDocs.docs) {
        const userData = userDoc.data();
        if (
          "createdAt" in userData &&
          userData.createdAt.toDate() > new Date("1-14-2022")
        ) {
          const appl = {
            id: userDoc.id,
            createdAt: userData.createdAt.toDate(),
            user: userDoc.id,
            email: userData.email,
            tutStarted: false,
            tutorial: false,
            applicationsStarted: [],
            applications: [],
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
              // const user1CademyDocs = await firebaseOnecademy.db
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
      setApplicants(appls);
      setApplicantsLoaded(true);
    };
    if (firebase && fullname) {
      notifyApplicationStatuses();
    }
  }, [firebase, fullname]);

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
      <div id="ApplicantsTable">
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
          onClick={submitData}
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
