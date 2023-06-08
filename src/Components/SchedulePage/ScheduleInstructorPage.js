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
import { useNavigate, useParams } from "react-router-dom";
import { firebaseState, emailState, fullnameState } from "../../store/AuthAtoms";
import { toWords, toOrdinal } from "number-to-words";
import { projectState } from "../../store/ProjectAtoms";
import RouterNav from "../../Components/RouterNav/RouterNav";
import SelectSessions from "./SelectSessions";
import sessionFormatter from "./sessionFormatter";
import ConsentSurvey from "../Auth/ConsentSurvey";
import "./SchedulePage.css";
import AppConfig from "../../AppConfig";
import LoadingPage from "./LoadingPage";

let tomorrow = new Date();
tomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
tomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

const errorAlert = data => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    alert("Something went wrong! Please submit your availability again!");
  }
};

const ScheduleInstructorPage = props => {
  const { instructorId } = useParams();

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
  const [project, setProject] = useRecoilState(projectState);
  const [projectSpecs, setProjectSpecs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.post("/instructorYes", {
      id: instructorId
    });
  }, []);
  

  useEffect(() => {
    const loadSchedule = async () => {
      // Set the flag that we're loading data.
      setScheduleLoaded(false);
      let instructorDoc = await firebase.db.collection("instructors").doc(instructorId).get();
      const instructorData = instructorDoc.data();
      const project = "OnlineCommunities";
      setProject(project);
      setEmail(instructorData.email);
      const _email = instructorData.email;
      const projSp = await firebase.db.collection("projectSpecs").doc(project).get();
      setProjectSpecs(projSp.data());
      const researchers = {};
      const researcherDocs = await firebase.db.collection("researchers").get();
      for (let researcherDoc of researcherDocs.docs) {
        if (researcherDoc.id === instructorDoc.id) {
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
      let availSessions = {};

      const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
      const scheduleEnd = moment().utcOffset(-4).startOf("day").add(16, "days").startOf("month").format("YYYY-MM-DD");
      if (!scheduleMonths.includes(scheduleEnd)) {
        scheduleMonths.push(scheduleEnd);
      }

      // Retrieve all the researchers' avaialbilities in this project.
      const resScheduleDocs = await firebase.db
        .collection("resSchedule")
        .where("month", "in", scheduleMonths)
        .where("project", "==", project)
        .get();

      for (let resScheduleDoc of resScheduleDocs.docs) {
        const resScheduleData = resScheduleDoc.data();

        // date time flagged by researchers as available by them
        let _schedules = resScheduleData.schedules || {};
        for (const researcherFullname in _schedules) {
          for (const scheduleSlot of _schedules[researcherFullname]) {
            const slotDT = moment(scheduleSlot).utcOffset(-4, true).toDate();
            // if availability is expired already
            if (slotDT.getTime() < new Date().getTime()) {
              continue;
            }
            const _scheduleSlot = slotDT.toLocaleString();
            if (!availSessions[_scheduleSlot]) {
              availSessions[_scheduleSlot] = [];
            }
            if (Object.values(researchers).includes(researcherFullname)) {
              availSessions[_scheduleSlot].push(researcherFullname);
            }
          }
        }

        // date time already booked by participants
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
            event.attendees.findIndex(attendee => attendee.email === _email) !== -1
          ) {
            if (
              (project === "OnlineCommunities" && event.colorId === "5") ||
              (project !== "OnlineCommunities" && event.colorId !== "5")
            ) {
              setParticipatedBefore(true);
              return;
            }
          }
        }
        // Only future events
        const startTime = new Date(event.start.dateTime).toLocaleString();
        const endTime = new Date(new Date(event.end.dateTime) - 30 * 60 * 1000).toLocaleString();
        const duration = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime();
        const startMinus30Min = new Date(new Date(event.start.dateTime).getTime() - 30 * 60 * 1000);
        if (
          event.attendees &&
          event.attendees.length > 0 &&
          startTime in availSessions &&
          event.attendees.findIndex(attendee => attendee.email === _email) === -1 &&
          events.findIndex(
            eve =>
              new Date(eve.start.dateTime).getTime() === startMinus30Min.getTime() &&
              new Date(eve.start.dateTime).getTime() + 60 * 60 * 1000 === new Date(eve.end.dateTime).getTime() &&
              eve.attendees.includes(_email)
          ) === -1
        ) {
          for (let attendee of event.attendees) {
            if (!researchers[attendee.email]) continue;
            if (availSessions.hasOwnProperty(startTime)) {
              availSessions[startTime] = availSessions[startTime].filter(
                resea => resea !== researchers[attendee.email]
              );
            }
            if (duration >= 60 * 60 * 1000 && availSessions.hasOwnProperty(endTime)) {
              availSessions[endTime] = availSessions[endTime].filter(resea => resea !== researchers[attendee.email]);
            }
          }
        }
      }
      setAvailableSessions(availSessions);
      const scheduleDocs = await firebase.db.collection("schedule").where("email", "==", _email.toLowerCase()).get();
      const sch = [];
      for (let scheduleDoc of scheduleDocs.docs) {
        const scheduleData = scheduleDoc.data();
        const session = scheduleData.session.toDate();
        const sessionStr = session.toLocaleString();
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
    try {
      setIsSubmitting(true);
      const sessions = selectedSession.map(s => {
        return moment(s).utcOffset(-4).format("YYYY-MM-DD HH:mm");
      });
      const responseObj = await axios.post("/scheduleInstructors", {
        sessions,
        project: "OnlineCommunities",
        surveyType: "instructor",
        instructorId,
        email
      });
      errorAlert(responseObj.data);

      setSubmitted(true);
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
      alert(
        "Something went wrong! Please resubmit your availability and if it still doesn't work, please contact us at oneweb@umich.edu"
      );
    }
  };

  const slotDuration = 60 / (projectSpecs.hourlyChunks || AppConfig.defaultHourlyChunks);
  const renderConfirmation = () => {
    return (
      <Box>
        <Box>
          Press "Confirm" if you'd like to schedule the following{" "}
          {selectedSession.length > 1 ? toWords(selectedSession.length) + " sessions" : "session"}, or press "Cancel" to
          revise your {selectedSession.length > 1 ? "sessions" : "session"}:
        </Box>
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
      </Box>
    );
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

  if (isSubmitting) return <LoadingPage project={project} />;
  return (
    <>
      <RouterNav />
      <Box id="SchedulePageContainer">
        {submitted ? (
          <Box className="DateDescription">
            <p>
              Based on your specified availability, we just matched you with one of our researchers for the session and
              sent you a Google Calendar invitation Please accept it as soon as possible. If it doesn't work for you,
              you can return to this page to reschedule the session.
            </p>
            <p>
              For accepting the Google Calendar invitation please open the invitation email ,scroll all the way down to
              find the options to respond to the Calendar invite, and click "Yes."
            </p>
            <p>
              Note that accepting/declining the invitation through Outlook does not work. You should only accept/reject
              the invitation through the Yes/No links at the bottom of the Google Calendar invitation email.
            </p>
          </Box>
        ) : participatedBefore ? (
          <Alert severity="error">
            You have already scheduled a session and cannot participate again or change your scheduled session! Please
            convey your questions or concerns to Iman Yeckehzaare at oneweb@umich.edu
          </Alert>
        ) : (
          <Box>
            <Alert severity="info" sx={{ mb: "5px" }}>
              Participation in this research study is completely voluntary, and you have the freedom to withdraw at any
              moment. By selecting the <strong>SCHEDULE</strong> button below, you consent to engage in the study and
              allow the usage of your data exclusively for research purposes. You can find the study details and
              research consent form at the bottom of this page.
            </Alert>
            <Alert severity="warning">
              <ul id="WarningPoints">
                <li>
                  {" "}
                  Please specify your availability{" "}
                  {formatSlotTime(projectSpecs.hourlyChunks, 1, 0)} introduction and
                  interview session
                </li>
                <li>
                  There is no researcher available to take the time slots labeled with UNAVBL! You can only take the
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
                <Box id="ScheduleSelectorContainer">
                  <SelectSessions
                    startDate={tomorrow}
                    numDays={16}
                    schedule={schedule}
                    setSchedule={setSchedule}
                    selectedSession={selectedSession}
                    setSelectedSession={setSelectedSession}
                    availableSessions={availableSessions}
                    setSubmitable={setSubmitable}
                    numberOfSessions={1}
                    hourlyChunks={projectSpecs?.hourlyChunks || AppConfig.defaultHourlyChunks}
                    sessionDuration={[1]}
                    daysLater={projectSpecs.daysLater || AppConfig.daysLater}
                  />
                </Box>
                <Box id="SignBtnContainer">
                  <Button
                    onClick={confirmClickOpen}
                    className={submitable && !isSubmitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
                    variant="contained"
                    disabled={submitable && !isSubmitting ? null : true}
                  >
                    Schedule
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            )}
            <ConsentSurvey />
          </Box>
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
      </Box>
    </>
  );
};

export default ScheduleInstructorPage;
