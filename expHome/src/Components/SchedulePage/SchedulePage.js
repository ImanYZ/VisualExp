import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import moment from "moment";

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
import { useNavigate } from "react-router-dom";
import { firebaseState, emailState, fullnameState } from "../../store/AuthAtoms";
import { projectSpecsState } from "../../store/ProjectAtoms";
import { toWords, toOrdinal } from "number-to-words";
import { projectState } from "../../store/ProjectAtoms";
import RouterNav from "../../../src/Components/RouterNav/RouterNav";
import SelectSessions from "./SelectSessions";
import sessionFormatter from "./sessionFormatter";
import LoadingPage from "./LoadingPage";

import { isEmail } from "../../utils";

import "./SchedulePage.css";
import AppConfig from "../../AppConfig";

let tomorrow = new Date();
tomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
tomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

const errorAlert = data => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    console.log({ data });
    alert("Something went wrong! Please submit your availability again!");
  }
};

const formatSlotTime = (hourlyChunks = 2, slotCount = 0, index) => {
  let str = "for ";
  let mins = 0,
    hours = 0;
  const slotSize = 60 / hourlyChunks;
  const totalMinutes = slotCount * slotSize;
  if (totalMinutes >= 60) {
    mins = totalMinutes % 60;
    hours = (totalMinutes - mins) / 60;
  } else {
    mins = totalMinutes;
  }
  if (hours > 0) {
    if (hours === 1) {
      str += `${toWords(hours)} hour `;
    } else {
      str += `${toWords(hours)} hours `;
    }
  }

  if (hours > 0 && mins > 0) {
    str += "and ";
  }

  if (mins > 0) {
    str += `${toWords(mins)} minutes `;
  }
  if (slotCount === 1) {
    str += `(${toWords(slotCount)} slot)`;
  } else {
    str += `(${toWords(slotCount)} consecutive slots)`;
  }
  return str;
};

const SchedulePage = props => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
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
  const [globalCurrentProject, setGlobalCurrentProject] = useRecoilState(projectState);
  const navigate = useNavigate();
  const projectSpecs = useRecoilValue(projectSpecsState);

  useEffect(() => {
    const loadSchedule = async () => {
      // Set the flag that we're loading data.
      setScheduleLoaded(false);
      let isSurvey = false;
      // We need to first retrieve which project this user belongs to.

      let userDoc = await firebase.db.collection("users").doc(fullname).get();

      if (!userDoc.exists) {
        userDoc = await firebase.db.collection("usersStudentCoNoteSurvey").doc(fullname).get();
        isSurvey = true;
      }
      const userData = userDoc.data();
      const project = userData.project;
      if (isSurvey) {
        setGlobalProject(project);
        setGlobalCurrentProject(project);
      }
      // researchers = an object of fullnames as keys and the corresponding email addresses as values.
      const researchers = {};
      const researcherDocs = await firebase.db.collection("researchers").get();
      for (let researcherDoc of researcherDocs.docs) {
        if (researcherDoc.id === userDoc.id) {
          navigate("/Activities/Experiments");
          return;
        }
        const researcherData = researcherDoc.data();
        // We only need the researchers who are active in the project that the user belongs to.
        if (
          "projects" in researcherData &&
          project in researcherData.projects &&
          researcherData.projects[project].active
        ) {
          researchers[researcherData.email] = researcherDoc.id;
        }
      }
      // availSessions = a placeholder to accumulate values that we will eventually put in availableSessions.
      // Each kay indicates a session timestamp and the corresponding value is an array of researcher emails
      // that may include 0 to many researchers who are available at that session.
      let availSessions = {};

      const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
      const scheduleEnd = moment().utcOffset(-4).startOf("day").add(16, "days").startOf("month").format("YYYY-MM-DD")
      if(!scheduleMonths.includes(scheduleEnd)) {
        scheduleMonths.push(scheduleEnd);
      }

      // Retrieve all the researchers' avaialbilities in this project.
      const resScheduleDocs = await firebase.db.collection("resSchedule")
        .where("month", "in", scheduleMonths)
        .where("project", "==", project).get();

      let schedules = {};
      let scheduledByResearchers = {};

      for (let resScheduleDoc of resScheduleDocs.docs) {
        const resScheduleData = resScheduleDoc.data();

        // date time flagged by researchers as available by them
        let _schedules = resScheduleData.schedules || {};
        for (const researcherFullname in _schedules) {
          for(const scheduleSlot of _schedules[researcherFullname]) {
            const slotDT = moment(scheduleSlot).utcOffset(-4, true).toDate();
            // if availability is expired already
            if(slotDT.getTime() < new Date().getTime()) {
              continue;
            }
            const _scheduleSlot = slotDT.toLocaleString();
            if(!schedules[_scheduleSlot]) {
              schedules[_scheduleSlot] = [];
            }
            schedules[_scheduleSlot].push(researcherFullname)
          }
        }

        // date time already booked by participants
        const _scheduled = resScheduleData.scheduled || {};
        const scheduledResearchers = Object.keys(_scheduled);

        for(const scheduledResearcher of scheduledResearchers) {
          if(!scheduledByResearchers[scheduledResearcher]) {
            scheduledByResearchers[scheduledResearcher] = [];
          }
          let __scheduled = scheduledByResearchers[scheduledResearcher];
          
          for(const participant in _scheduled[scheduledResearcher]) {
            // we don't check already booked sessions for current participant
            if(participant === fullname) {
              continue;
            }
            const scheduledSlotsByParticipant = _scheduled[scheduledResearcher][participant];
            __scheduled = __scheduled.concat(
              Object.values(scheduledSlotsByParticipant).map(
                (slot) => moment(slot).utcOffset(-4, true).toDate().toLocaleString()
              )
            )
          }
          __scheduled.sort((s1, s2) => s1 < s2 ? -1 : 1)
          scheduledByResearchers[scheduledResearcher] = Array.from(new Set(__scheduled));
        }

        // calculating available schedules by each researchers
        let availableSchedules = {...schedules};
        for(const researcherFullname in scheduledByResearchers) {
          for(const scheduledSlot of scheduledByResearchers[researcherFullname]) {
            if(!availableSchedules[scheduledSlot] || !availableSchedules[scheduledSlot].includes(researcherFullname)) continue;
            const researcherIdx = availableSchedules[scheduledSlot].indexOf(researcherFullname)
            availableSchedules[scheduledSlot].splice(researcherIdx, 1)
          }
        }

        availSessions = availableSchedules;
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
            event.attendees.findIndex(attendee => attendee.email === email) !== -1
          ) {
            setParticipatedBefore(true);
            return;
          }
        }
        // Only future events
        const startTime = new Date(event.start.dateTime).toLocaleString();
        const endTime = new Date(new Date(event.end.dateTime) - 30 * 60 * 1000).toLocaleString();
        const duration = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime();
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
            if (!researchers[attendee.email]) continue;
            availSessions[startTime] = availSessions[startTime].filter(resea => resea !== researchers[attendee.email]);
            if (duration >= 60 * 60 * 1000) {
              availSessions[endTime] = availSessions[startTime].filter(resea => resea !== researchers[attendee.email]);
            }
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
        if (!scheduleData.order || !scheduleData.id) continue;
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
          const sessionIdx = parseInt(scheduleData.order.replace(/[^0-9]+/g, "")) - 1;
          if(!isNaN(sessionIdx) && projectSpecs?.sessionDuration?.[sessionIdx]) {
            const slotCounts = projectSpecs?.sessionDuration?.[sessionIdx];
            for(let i = 1; i < slotCounts; i++) {
              sch.push(moment(session).add(30 * i, "minutes").toDate());
            }
          }
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
    try {
      setIsSubmitting(true);

      const userRef = firebase.db.collection("users").doc(fullname);
      let userDoc = await userRef.get();

      if (!userDoc.exists) {
        const userRef = firebase.db.collection("usersStudentCoNoteSurvey").doc(fullname);
        userDoc = await userRef.get();
      }

      let responseObj = null;
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.projectDone) {
          setParticipatedBefore(true);
          setIsSubmitting(false);
          return;
        }

        const sessions = selectedSession.map(s => {
          return moment(s).utcOffset(-4).format("YYYY-MM-DD HH:mm");
        });

        await firebase.idToken();
        responseObj = await axios.post("/participants/schedule", {
          sessions,
          project: userData.project
        });
        errorAlert(responseObj.data);

        setSubmitted(true);
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      alert("Something went wrong! Please resubmit your availability and if it still doesn't work, please contact us at oneweb@umich.edu");
    }
  };

  const slotDuration = 60 / (projectSpecs.hourlyChunks || AppConfig.defaultHourlyChunks);

  const renderInformation = () => {
    let infos = [];

    for (let i = 0; i < projectSpecs.numberOfSessions; ++i) {
      infos.push(
        <li>
          <strong>
            {i + 1}
            <sup>{toOrdinal(i + 1).replace(/[0-9]/g, "")}</sup> session
          </strong>{" "}
          {i > 0 ? `, ${projectSpecs.daysLater[i - 1]} days later after the first session,` : null}
          {" " + formatSlotTime(projectSpecs.hourlyChunks, projectSpecs?.sessionDuration?.[i], i)}
        </li>
      );
    }

    return infos;
  };

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
                  selectedSession[i],
                  slotDuration * (projectSpecs?.sessionDuration?.[i] || AppConfig.defaultSessionDuration[i])
                )}
              </li>
            );
          })}
        </ul>
      </>
    );
  };

  if (isSubmitting) return <LoadingPage />;
  return (
    <>
    <RouterNav/>
    <div id="SchedulePageContainer">

      {submitted ? (
        <div className="DateDescription">
          <p>
            Based on your specified availability, we just matched you with one of our UX researchers for each session
            and sent you three Google Calendar invitations. Please accept them as soon as possible. If any of the
            sessions do not work for you, you can return to this page to reschedule them only before your first session.
          </p>
          <p>
            For accepting the Google Calendar invites, please open each invitation email, scroll all the way down to
            find the options to respond to the Calendar invite, and click "Yes."
          </p>
          <p>
            Note that accepting/declining the invitation through Outlook does not work. You should only accept/reject
            the invitation through the Yes/No links at the bottom of the Google Calendar invitation email.
          </p>
        </div>
      ) : participatedBefore ? (
        <Alert severity="error">
          You've participated in this study before or have scheduled a session and cannot participate again or change
          the scheduled sessions! Please convey your questions or concerns to Iman Yeckehzaare at oneweb@umich.edu
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
                Please specify your availability for our three UX experiment sessions <strong>in your timezone</strong>{" "}
                to satisfy the following criteria:
                <ul>{renderInformation()}</ul>
              </li>
              <li>
                As soon as you meet all the criteria, the SCHEDULE button will be enabled and the time slots with ✅
                will indicate your sessions. You should click the SCHEDULE button and get the confirmation message,
                otherwise, your sessions will not be scheduled.
              </li>
              <li>
                There is no UX researcher available to take the time slots labeled with UNAVBL! You can only take the
                light blue ones.
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

export default SchedulePage;
