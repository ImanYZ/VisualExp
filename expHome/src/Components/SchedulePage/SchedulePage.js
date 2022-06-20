import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";

import {
  firebaseState,
  emailState,
  fullnameState,
} from "../../store/AuthAtoms";

import SelectSessions from "./SelectSessions";

import { isEmail } from "../../utils/general";

import UMSI_Logo_Light from "../../assets/UMSI_Logo_Light.jpeg";

import "./SchedulePage.css";

let tomorrow = new Date();
tomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
tomorrow = new Date(
  tomorrow.getFullYear(),
  tomorrow.getMonth(),
  tomorrow.getDate()
);

const errorAlert = (data) => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    console.log({ data });
    alert("Something went wrong! Please submit your availability again!");
  }
};

const sessionFormatter = (start, minutes) => {
  return (
    " session: " +
    start.toLocaleDateString(navigator.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    ", " +
    start.toLocaleTimeString(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) +
    " - " +
    new Date(start.getTime() + minutes * 60000).toLocaleTimeString(
      navigator.language,
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )
  );
};

const SchedulePage = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);

  const [availableSessions, setAvailableSessions] = useState({});
  const [participatedBefore, setParticipatedBefore] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [firstSession, setFirstSession] = useState(null);
  const [secondSession, setSecondSession] = useState(null);
  const [thirdSession, setThirdSession] = useState(null);
  const [submitable, setSubmitable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      // Set the flag that we're loading data.
      setScheduleLoaded(false);
      // We need to first retrieve which project this user belongs to.
      const userDoc = await firebase.db.collection("users").doc(fullname).get();
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
        // Only if the researcher is active in this project AND their availability is in the future:
        if (
          resScheduleData.fullname in researchers &&
          resSession.getTime() > new Date().getTime()
        ) {
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
      // Retieve all the Calendar events from last month to the end of time.
      const responseObj = await axios.post("/allEvents", {});
      errorAlert(responseObj.data);
      const events = responseObj.data.events;
      for (let event of events) {
        // First, we should figure out whether the user participated in the past:
        if (new Date(event.start.dateTime) < new Date()) {
          // Only if one of the attendees of the event is this user:
          if (
            event.attendees &&
            event.attendees.length > 0 &&
            event.attendees.findIndex(
              (attendee) => attendee.email === email
            ) !== -1
          ) {
            setParticipatedBefore(true);
            return;
          }
        }
        // Only future events
        const startTime = new Date(event.start.dateTime).toLocaleString();
        const startMinus30Min = new Date(
          new Date(event.start.dateTime).getTime() - 30 * 60 * 1000
        );
        // If the event has some attendees and the start timestamp is a key in availSessions,
        // we should remove all the attendees who are available researchers at this timestamp,
        // unless the researcher was previously assign to the 1st, 2nd, or 3rd session for
        // this participnat and the participant is rescheduling their sessions.
        // OR 30 minutes before this session was the 1st session for this participant,
        // This latter check is necessary to handle the exception where there is a second
        // session staring 30 minutes after this session. We should not remove that second
        // time slot, otherwise the system would not show this as an available slot and the
        // participant would not be able to take this one-hour slot for their 1st session.
        if (
          event.attendees &&
          event.attendees.length > 0 &&
          startTime in availSessions &&
          event.attendees.findIndex((attendee) => attendee.email === email) ===
            -1 &&
          events.findIndex(
            (eve) =>
              new Date(eve.start.dateTime).getTime() ===
                startMinus30Min.getTime() &&
              new Date(eve.start.dateTime).getTime() + 60 * 60 * 1000 ===
                new Date(eve.end.dateTime).getTime() &&
              eve.attendees.includes(email)
          ) === -1
        ) {
          for (let attendee of event.attendees) {
            availSessions[startTime] = availSessions[startTime].filter(
              (resea) => resea !== attendee.email
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
      for (let scheduleDoc of scheduleDocs.docs) {
        const scheduleData = scheduleDoc.data();
        const session = scheduleData.session.toDate();
        const sessionStr = session.toLocaleString();
        // We should only show the availble timeslots that are:
        // 1) after tomorrow, so the researchers don't get surprized by newly added sessions
        // 2) at least a researcher is available to take that session.
        if (
          session.getTime() > tomorrow.getTime() &&
          sessionStr in availSessions &&
          availSessions[sessionStr].length > 0
        ) {
          sch.push(session);
        }
      }
      if (sch.length > 0) {
        setSchedule(sch);
      }
      setTimeout(() => {
        setScheduleLoaded(true);
      }, 400);
    };
    if (fullname && isEmail(email)) {
      loadSchedule();
    }
  }, [fullname, email]);

  const confirmClickOpen = (event) => {
    setOpenConfirm(true);
  };

  const confirmClose = (value) => (event) => {
    if (value) {
      if (value === "Confirmed") {
        submitData();
      }
    }
    setOpenConfirm(false);
  };

  const submitData = async () => {
    setIsSubmitting(true);
    const userRef = firebase.db.collection("users").doc(fullname);
    const userDoc = await userRef.get();
    let responseObj = null;
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.projectDone) {
        setParticipatedBefore(true);
        return;
      }
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .where("email", "==", email.toLowerCase())
        .get();
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
        email: email.toLowerCase(),
        first: firstSession,
        researcher1st: availableSessions[firstSession.toLocaleString()][0],
        second: secondSession,
        researcher2nd: availableSessions[secondSession.toLocaleString()][0],
        third: thirdSession,
        researcher3rd: availableSessions[thirdSession.toLocaleString()][0],
      });
      errorAlert(responseObj.data);

      for (let session of schedule) {
        const scheduleRef = firebase.db.collection("schedule").doc();
        const theSession = {
          email: email.toLowerCase(),
          session: firebase.firestore.Timestamp.fromDate(session),
        };
        if (session.getTime() === firstSession.getTime()) {
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
    <div id="SchedulePageContainer">
      {submitted ? (
        <div className="DateDescription">
          <p>
            Based on your specified availability, we just matched you with one
            of our UX researchers for each session and sent you three Google
            Calendar invitations. Please accept them as soon as possible. If any
            of the sessions do not work for you, you can return to this page to
            reschedule them only before your first session.
          </p>
          <p>
            For accepting the Google Calendar invites, please open each
            invitation email, scroll all the way down to find the options to
            respond to the Calendar invite, and click "Yes."
          </p>
          <p>
            Note that accepting/declining the invitation through Outlook does
            not work. You should only accept/reject the invitation through the
            Yes/No links at the bottom of the Google Calendar invitation email.
          </p>
        </div>
      ) : participatedBefore ? (
        <Alert severity="error">
          You've participated in this study before or have scheduled a session
          and cannot participate again or change the scheduled sessions! Please
          convey your questions or concerns to Iman Yeckehzaare at
          oneweb@umich.edu
        </Alert>
      ) : (
        <>
          {/* <div className="DateDescription">
              In the table below, please specify as many time slots as possible
              in your timezone.
            </div>
            <div className="DateDescription">
              Based on your availability, we will match you with one of our UX
              researchers and will schedule three sessions for you:
              <ul>
                <li>
                  1<sup>st</sup> session for an hour
                </li>
                <li>
                  2<sup>nd</sup> session, 3 days later, for 30 minutes
                </li>
                <li>
                  3<sup>rd</sup> session, 1 week later, for 30 minutes
                </li>
              </ul>
            </div> */}
          <Alert severity="warning">
            <ul id="WarningPoints">
              <li>
                Please specify your availability for our three UX experiment
                sessions <strong>in your timezone</strong> to satisfy the
                following criteria:
                <ul>
                  <li>
                    <strong>
                      1<sup>st</sup> session
                    </strong>{" "}
                    for an hour (two consecutive slots)
                  </li>
                  <li>
                    <strong>
                      2<sup>nd</sup> session
                    </strong>
                    , 3 days later, for 30 minutes (one slot)
                  </li>
                  <li>
                    <strong>
                      3<sup>rd</sup> session
                    </strong>
                    , 7 days later, for 30 minutes (one slot)
                  </li>
                </ul>
              </li>
              <li>
                As soon as you meet all the criteria, the SCHEDULE button will
                be enabled and the time slots with ✅ will indicate your
                sessions. You should click the SCHEDULE button and get the
                confirmation message, otherwise, your sessions will not be
                scheduled.
              </li>
              <li>
                There is no UX researcher available to take the time slots
                labeled with UNAVBL! You can only take the light blue ones.
              </li>
            </ul>
          </Alert>
          {schedule.length > 0 && !submitable && (
            <Alert severity="error">
              <ul id="WarningPoints">
                <li>
                  You have not specified enough of your availability to satisfy
                  the above criteria.
                </li>
                <li>
                  If you don't have enough availability in the next two weeks,
                  please return to this page in the following days to specify
                  your available time slots.
                </li>
              </ul>
            </Alert>
          )}
          {scheduleLoaded ? (
            <>
              <div id="ScheduleSelectorContainer">
                <SelectSessions
                  startDate={tomorrow}
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
              <div id="SignBtnContainer">
                <Button
                  onClick={confirmClickOpen}
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
            </>
          ) : (
            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          )}
        </>
      )}
      <Dialog
        open={openConfirm}
        onClose={confirmClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Please Confirm!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div>
              Press "Confirm" if you'd like to schedule the following three
              sessions, or press "Cancel" to revise your sessions.
            </div>
            {firstSession && secondSession && thirdSession && (
              <ul>
                <li>
                  1<sup>st</sup>
                  {sessionFormatter(firstSession, 60)}
                </li>
                <li>
                  2<sup>nd</sup>
                  {sessionFormatter(secondSession, 30)}
                </li>
                <li>
                  3<sup>rd</sup>
                  {sessionFormatter(thirdSession, 30)}
                </li>
              </ul>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmClose("Cancelled")}>Cancel</Button>
          <Button onClick={confirmClose("Confirmed")} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
