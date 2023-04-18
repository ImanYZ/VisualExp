import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

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
import { useNavigate, useParams } from "react-router-dom";
import { firebaseState, emailState, fullnameState } from "../../store/AuthAtoms";
import { toWords, toOrdinal } from "number-to-words";
import { projectState } from "../../store/ProjectAtoms";
import { currentProjectState } from "../../store/ExperimentAtoms";
import RouterNav from "../../Components/RouterNav/RouterNav";

import SelectSessions from "./SelectSessions";
import sessionFormatter from "./sessionFormatter";

import { isEmail } from "../../utils";

import "./SchedulePage.css";
import AppConfig from "../../AppConfig";

let tomorrow = new Date();
tomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
tomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

const errorAlert = data => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    alert("Something went wrong! Please submit your availability again!");
  }
};

const ScheduleAdministratorPage = props => {
  const { administratorId } = useParams();

  const firebase = useRecoilValue(firebaseState);
  const [email, setEmail] = useRecoilState(emailState);
  const fullname = useRecoilValue(fullnameState);

  const [availableSessions, setAvailableSessions] = useState({});
  const [participatedBefore, setParticipatedBefore] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [selectedSession, setSelectedSession] = useState([]);
  const [submitable, setSubmitable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalProject, setGlobalProject] = useRecoilState(projectState);
  const [globalCurrentProject, setGlobalCurrentProject] = useRecoilState(currentProjectState);
  const navigate = useNavigate();
  const [projectSpecs, setProjectSpecs] = useState({});

  useEffect(() => {
    axios.post("/administratorYes", {
      id: administratorId
    });
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      // Set the flag that we're loading data.
      setScheduleLoaded(false);
      let isSurvey = false;
      let userDoc = await firebase.db.collection("administrators").doc(administratorId).get();

      const userData = userDoc.data();
      const project = "Annotating";
      setEmail(userData.email);
      const projSp = await firebase.db.collection("projectSpecs").doc(project).get();
      setProjectSpecs(projSp.data());
      if (isSurvey) {
        setGlobalProject(project);
        setGlobalCurrentProject(project);
      }
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
      const resScheduleDocs = await firebase.db.collection("resSchedule").where("project", "==", project).get();

      for (let resScheduleDoc of resScheduleDocs.docs) {
        const resScheduleData = resScheduleDoc.data();
        const resSession = resScheduleData.session.toDate();
        const resSessionStr = resSession.toLocaleString();
        // Only if the researcher is active in this project AND their availability is in the future:
        if (resScheduleData.fullname in researchers && resSession.getTime() > new Date().getTime()) {
          // Add the available slots for the researcher's email.
          if (resSessionStr in availSessions) {
            availSessions[resSessionStr].push(researchers[resScheduleData.fullname]);
          } else {
            availSessions[resSessionStr] = [researchers[resScheduleData.fullname]];
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
            event.attendees.findIndex(attendee => attendee.email === userData.email) !== -1
          ) {
            setParticipatedBefore(true);
            return;
          }
        }
        // Only future events
        const startTime = new Date(event.start.dateTime).toLocaleString();
        const startMinus30Min = new Date(new Date(event.start.dateTime).getTime() - 30 * 60 * 1000);
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
          event.attendees.findIndex(attendee => attendee.email === email) === -1 &&
          events.findIndex(
            eve =>
              new Date(eve.start.dateTime).getTime() === startMinus30Min.getTime() &&
              new Date(eve.start.dateTime).getTime() + 60 * 60 * 1000 === new Date(eve.end.dateTime).getTime() &&
              eve.attendees.includes(email)
          ) === -1
        ) {
          for (let attendee of event.attendees) {
            availSessions[startTime] = availSessions[startTime].filter(resea => resea !== attendee.email);
          }
        }
      }
      setAvailableSessions(availSessions);
      // Retrieve all the available time slots that the participant previously specified,
      // just to start from. They are supposed to modify these.
      const scheduleDocs = await firebase.db.collection("schedule").where("email", "==", email.toLowerCase()).get();
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
    if (firebase) {
      loadSchedule();
    }
  }, [firebase]);

  const confirmClickOpen = event => {
    setOpenConfirm(true);
  };

  const confirmClose = value => event => {
    if (value) {
      if (value === "Confirmed") {
        submitData();
      }
    }
    setOpenConfirm(false);
  };

  const submitData = async () => {
    setIsSubmitting(true);

    const userRef = firebase.db.collection("administrators").doc(administratorId);
    let userDoc = await userRef.get();

    let responseObj = null;
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.projectDone) {
        setParticipatedBefore(true);
        return;
      }
      const scheduleDocs = await firebase.db.collection("schedule").where("email", "==", email.toLowerCase()).get();
      for (let scheduleDoc of scheduleDocs.docs) {
        const scheduleData = scheduleDoc.data();
        if (scheduleData.id) {
          responseObj = await axios.post("/deleteEvent", {
            eventId: scheduleData.id
          });
          errorAlert(responseObj.data);
        }
        const scheduleRef = firebase.db.collection("schedule").doc(scheduleDoc.id);
        await firebase.batchDelete(scheduleRef);
      }

      const sessions = selectedSession.map(s => {
        return {
          startDate: s,
          researcher:
            availableSessions[s.toLocaleString()][
              // We randomly pick one of the available researchers in each session and assign them to run this session.
              Math.floor(Math.random() * availableSessions[s.toLocaleString()].length)
            ]
        };
      });
      responseObj = await axios.post("/schedule", {
        email: email.toLowerCase(),
        sessions,
        project: "Annotating"
      });
      errorAlert(responseObj.data);

      for (let session of schedule) {
        const scheduleRef = firebase.db.collection("schedule").doc();
        const theSession = {
          email: email.toLowerCase(),
          session: firebase.firestore.Timestamp.fromDate(session)
        };

        const sessionIndex = selectedSession.findIndex(s => s.getTime() === session.getTime());
        if (sessionIndex > -1) {
          theSession.order = toOrdinal(sessionIndex + 1);
          theSession.id = responseObj.data.events[sessionIndex].data.id;
        }
        await firebase.batchSet(scheduleRef, theSession);
      }
      await firebase.commitBatch();

      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  const slotDuration = 60 / (projectSpecs.hourlyChunks || AppConfig.defaultHourlyChunks);

  // const renderInformation = () => {
  //   let infos = [];

  //   for (let i = 0; i < projectSpecs.numberOfSessions; ++i) {
  //     infos.push(
  //       <li>
  //         <strong>
  //           {i + 1}
  //           <sup>{toOrdinal(i + 1).replace(/[0-9]/g, "")}</sup> session
  //         </strong>{" "}
  //         {i > 0 ? `, ${projectSpecs.daysLater[i - 1]} days latter after the first session,` : null}
  //         {" " + formatSlotTime(projectSpecs.hourlyChunks, projectSpecs?.sessionDuration?.[i])}
  //       </li>
  //     );
  //   }

  //   return infos;
  // };

  const renderConfirmation = () => {
    return (
      <>
        <div>
          Press "Confirm" if you'd like to schedule the following{" "}
          {selectedSession.length > 1 ? toWords(selectedSession.length) + " sessions" : "session"}, or press "Cancel" to
          revise your {selectedSession.length > 1 ? "sessions" : "session"}:
        </div>
        <ul>
          {selectedSession.map((session, i) => {
            return (
              <li>
                {selectedSession.length > 1 && (
                  <>
                    {i + 1}
                    <sup>{toOrdinal(i + 1).replace(/[0-9]/g, "")}</sup>
                  </>
                )}
                {sessionFormatter(
                  selectedSession[0],
                  slotDuration * (projectSpecs?.sessionDuration?.[0] || AppConfig.defaultSessionDuration[0])
                )}
              </li>
            );
          })}
        </ul>
      </>
    );
  };

  return (
    <>
    <RouterNav/>
    <div id="SchedulePageContainer">
      {submitted ? (
        <div className="DateDescription">
          <p>
            Based on your specified availability, we just matched you with one of our UX researchers and sent you a
            Google Calendar invitation. Please accept it as soon as possible. If the session does not work for you, you
            can return to this page to reschedule it.
          </p>
          <p>
            For accepting the Google Calendar invites, please open your Google Calendar, open our scheduled meeting
            event, and click "Yes."
          </p>
          <p>
            Note that accepting/declining the invitation through Outlook does not work. You should only accept/reject
            the invitation through the Yes/No links at the bottom of the Google Calendar invitation email, or directly
            through Google Calendar.
          </p>
        </div>
      ) : participatedBefore ? (
        <Alert severity="error">
          You have already scheduled a session and cannot participate again or change your scheduled session! Please
          convey your questions or concerns to Iman Yeckehzaare at oneweb@umich.edu
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
                Please choose a 30-minute time slot based on your availability <strong>in your timezone</strong> for
                scheduling the meeting with us. The following table includes all our availabilities in 15-minute time
                slots. So, please choose two consecutive slots.
              </li>
              <li>
                As soon as you meet the criteria, the SCHEDULE button will be enabled and the time slots with ✅ will
                indicate your session. You should click the SCHEDULE button and get the confirmation message, otherwise,
                your session will not be scheduled.
              </li>
              <li>
                There is no session available to take the time slots labeled with UNAVBL! You can only take the light
                blue ones.
              </li>
            </ul>
          </Alert>
          {schedule.length > 0 && !submitable && (
            <Alert severity="error">
              <ul id="WarningPoints">
                <li>You have not specified enough of your availability to satisfy the above criteria.</li>
                <li>
                  If you don't have enough availability in the next two weeks, please return to this page in the
                  following days to specify your available time slots.
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
                  selectedSession={selectedSession}
                  setSelectedSession={setSelectedSession}
                  availableSessions={availableSessions}
                  setSubmitable={setSubmitable}
                  numberOfSessions={projectSpecs?.numberOfSessions || AppConfig.defaultNumberOfSessions}
                  hourlyChunks={projectSpecs?.hourlyChunks || AppConfig.defaultHourlyChunks}
                  sessionDuration={projectSpecs?.sessionDuration || AppConfig.defaultSessionDuration}
                  daysLater={projectSpecs.daysLater || AppConfig.daysLater}
                />
              </div>
              <div id="SignBtnContainer">
                <Button
                  onClick={confirmClickOpen}
                  className={submitable && !isSubmitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
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
          <DialogContentText id="alert-dialog-description">{renderConfirmation()}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmClose("Cancelled")}>Cancel</Button>
          <Button onClick={confirmClose("Confirmed")} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    </>
  );
};

export default ScheduleAdministratorPage;
