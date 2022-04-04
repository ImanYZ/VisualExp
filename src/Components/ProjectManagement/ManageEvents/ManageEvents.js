import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

import { DataGrid } from "@mui/x-data-grid";

import GridCellToolTip from "../../GridCellToolTip";
import SelectSessions from "../../SchedulePage/SelectSessions";

import "./ManageEvents.css";

import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
// import { firebaseOneState } from "../../../store/OneCademyAtoms";

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
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
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
  { field: "createdAt", headerName: "Created", type: "dateTime", width: 190 },
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
    field: "reminder",
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

const ManageEvents = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  // const firebaseOne = useRecoilValue(firebaseOneState);

  const [availabilities, setAvailabilities] = useState([]);
  const [availabilitiesLoaded, setAvailabilitiesLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [expSessionsLoaded, setExpSessionsLoaded] = useState(false);
  const [ongoingEventsLoaded, setOngoingEventsLoaded] = useState(false);
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

  const retrieveEvents = async (relativeURL) => {
    let responseObj = await axios.post(relativeURL, {});
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
      const availabilitiesIdx = availabilities.findIndex(
        (sch) => sch.id === ev.id
      );
      if (availabilitiesIdx !== -1) {
        event.participant =
          availabilities[availabilitiesIdx].email.toLowerCase();
        event.order = availabilities[availabilitiesIdx].order;
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
      evs.sort((a, b) => b.start - a.start);
      evs.push(event);
    }
    return evs;
  };

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
      <div className="dataGridTable">
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
          <div style={{ marginBottom: "40px" }}>
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
            />
          </div>
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
