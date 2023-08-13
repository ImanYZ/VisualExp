import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import moment from "moment";
import axios from "axios";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import SelectSessions from "../../SchedulePage/SelectSessions";
import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
import AppConfig from "../../../AppConfig";
import { Box } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import { expSessionsColumns, applicantsColumns, istructorsColumns, adminstratorsColumns } from "./helpers";
import "./ManageEvents.css";

const errorAlert = data => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    alert("Something went wrong! Please submit your availability again!");
  }
};

// This is an admin interface, only for Iman, to monitor and manage
// experiment sessions and applicants' status in the application process.
const ManageEvents = props => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [availableSessions, setAvailableSessions] = useState({});
  const [events, setEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [expSessionsLoaded, setExpSessionsLoaded] = useState(false);
  const [ongoingEventsLoaded, setOngoingEventsLoaded] = useState(false);
  const [participant, setParticipant] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [scheduleStart, setScheduleStart] = useState(new Date());
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
  const [allProjectSpecs, setAllProjectSpecs] = useState({});
  const [currentProjectSpecs, setCurrentProjectSpecs] = useState({});
  const [currentProject, setCurrentProject] = useState("");
  const [selectedSession, setSelectedSession] = useState([]);
  const [invitesInstructors, setInvitesInstructors] = useState([]);
  const [invitesAdminstartors, setInvitesAdminstartors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  // Retrieves all the available timeslots specified by all the
  // participnats so far that are associated with Google Calendar
  // events.

  useEffect(() => {
    const loadLoadInstructors = async () => {
      setLoadingInstructors(true);
      const invitedInstructorsDocs = await firebase.db.collection("instructors").get();
      const invitedAdministratorsDocs = await firebase.db.collection("administrators").get();
      const invitedInstructors = [];
      const invitedAdministrators = [];
      for (let adminstratorDoc of invitedAdministratorsDocs.docs) {
        const administratorData = adminstratorDoc.data();
        const admin = {
          howToAddress: administratorData.howToAddress,
          email: administratorData.email,
          position: administratorData.position,
          institution: administratorData.institution,
          reminders: administratorData.reminders ? administratorData.reminders : 0,
          nextReminder: administratorData.nextReminder ? administratorData.nextReminder.toDate() : "",
          id: adminstratorDoc.id,
          votes: administratorData.upVotes - administratorData.downVotes,
          scheduled: administratorData?.scheduled ? "✅ " : "NO RESPONSE",
          inviteStudents: administratorData.inviteStudents ? "✅ " : "NO RESPONSE",
          emailstatus: administratorData.openedEmail ? "Opened" : "Not Opened",
          rescheduled: administratorData.later ? "✅ " : "NO RESPONSE",
          notIntersted: administratorData.no ? "❌" : "NO RESPONSE"
        };
        invitedAdministrators.push(admin);
      }
      for (let instructorDoc of invitedInstructorsDocs.docs) {
        const instructorData = instructorDoc.data();
        if (instructorData.hasOwnProperty("nextReminder")) {
          const inst = {
            instructor: instructorData.firstname + " " + instructorData.lastname,
            email: instructorData.email,
            reminders: instructorData.reminders ? instructorData.reminders : 0,
            nextReminder: instructorData.nextReminder ? instructorData.nextReminder.toDate() : "",
            id: instructorDoc.id,
            votes: instructorData?.upVotes || 0 - instructorData?.downVotes || 0,
            interestedTopic: instructorData.interestedTopic,
            yes: instructorData.yes ? "✅ " : "NO RESPONSE",
            scheduled: instructorData?.scheduled ? "✅ " : "NO RESPONSE",
            emailstatus: instructorData.openedEmail ? "Opened" : "Not Opened",
            emailtype: instructorData?.emailNumber === 0 ? "First" : "Second",
            rescheduled: instructorData.later ? "✅ " : "NO RESPONSE",
            notIntersted: instructorData.no ? "❌" : "NO RESPONSE"
          };
          invitedInstructors.push(inst);
        }
      }
      setInvitesAdminstartors(invitedAdministrators);
      setInvitesInstructors(invitedInstructors);
      setLoadingInstructors(false);
    };
    if (firebase) {
      loadLoadInstructors();
    }
  }, [firebase]);
  // get all Project SPecs so that we don't have to that again and again.
  useEffect(() => {
    const loadProjectSpecs = async () => {
      const specs = await firebase.db.collection("projectSpecs").get();
      const specsObj = {};
      specs.forEach(spec => {
        specsObj[spec.id] = spec.data();
      });
      setAllProjectSpecs(specsObj);
    };

    if (firebase) {
      loadProjectSpecs();
    }
  }, [firebase]);

  useEffect(() => {
    const loadOngoingEvents = async () => {
      const response = await axios.post("/retrieveEvents", {
        relativeURL: "ongoingEvents"
      });
      setOngoingEvents(response.data.events);
      setOngoingEventsLoaded(true);
    };

    loadOngoingEvents();
  }, []);
  useEffect(() => {
    const loadEvents = async () => {
      const response = await axios.post("/retrieveEvents", {
        relativeURL: "allEvents"
      });
      setEvents(response.data.events);
      setExpSessionsLoaded(true);
    };
    if (ongoingEventsLoaded) {
      loadEvents();
    }
  }, [ongoingEventsLoaded]);

  // Load data from applications to populate the content of the
  // application statuses table.
  useEffect(() => {
    const notifyApplicationStatus = async () => {
      try {
        await firebase.idToken();
        const response = await axios.get("/administrator/notifyApplicationStatus");
        let registered = response.data.registered;
        let completedFirst = response.data.completedFirst;
        let completedSecond = response.data.completedSecond;
        let completedThird = response.data.completedThird;
        let recallFirst = response.data.recallFirst;
        let recallSecond = response.data.recallSecond;
        let recallThird = response.data.recallThird;
        let recallFirstRatio = response.data.recallFirstRatio;
        let recallSecondRatio = response.data.recallSecondRatio;
        let recallThirdRatio = response.data.recallThirdRatio;
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
        setApplicants(response.data.applications);
        setApplicantsLoaded(true);
      } catch (error) {
        console.log(error);
      }
    };
    if (firebase && fullname) {
      notifyApplicationStatus();
    }
  }, [firebase, fullname]);

  // Chooses a participant from the table to load their schedule
  // to be able to update one of their scheduled sessions.
  const gridRowClick = async clickedRow => {
    const theRow = clickedRow.row;
    try {
      if (theRow.participant) {
        const email = theRow.participant;
        setParticipant(email);
        setModelOpen(true);
        setScheduleLoaded(false);
        setAvailableSessions({});
        setSchedule([]);
        // We need to first retrieve which project this user belongs to.
        let userDoc = await firebase.db.collection("users").doc(theRow.fullname).get();
        if (!userDoc.exists) {
          userDoc = await firebase.db.collection("usersSurvey").doc(theRow.fullname).get();
        }

        const userData = userDoc.data();
        const project = userData.project;
        const projectSpecs = allProjectSpecs[project];
        if (userData.surveyType === "instructor") {
          projectSpecs.sessionDuration = [1];
        }
        setCurrentProject(project);
        setCurrentProjectSpecs(projectSpecs);
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
            if (project === "OnlineCommunities" && userData.surveyType === "instructor") {
              if (researcherData.projects[project]?.scheduleAllowed) {
                researchers[researcherDoc.id] = researcherData.email;
              }
            } else {
              if (researcherData.email !== "oneweb@umich.edu") {
                researchers[researcherDoc.id] = researcherData.email;
              }
            }
          }
        }
        // availSessions = a placeholder to accumulate values that we will eventually put in availableSessions.
        // Each kay indicates a session timestamp and the corresponding value is an array of researcher emails
        // that may include 0 to many researchers who are available at that session.
        let _availSessions = {};
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
              const _scheduleSlot = slotDT.toLocaleString();
              if (!_availSessions[_scheduleSlot]) {
                _availSessions[_scheduleSlot] = [];
              }
              _availSessions[_scheduleSlot].push(researcherFullname);
            }
          }
          // date time already booked by participants
        }
        if (project === "OnlineCommunities") {
          for (let session in _availSessions) {
            const index = _availSessions[session].indexOf("Iman YeckehZaare");
            if (index === -1) {
              delete _availSessions[session];
            } else {
              _availSessions[session].splice(index, 1);
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
              event.attendees.findIndex(attendee => attendee.email === email) !== -1
            ) {
              // setParticipatedBefore(true);
              // return;
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
            startTime in _availSessions &&
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
              _availSessions[startTime] = _availSessions[startTime].filter(
                resea => resea !== researchers[attendee.email]
              );
              if (duration >= 60 * 60 * 1000) {
                _availSessions[endTime] = _availSessions[endTime].filter(
                  resea => resea !== researchers[attendee.email]
                );
              }
            }
          }
        }

        // Retrieve all the available time slots that the participant previously specified,
        // just to start from. They are supposed to modify these.
        const scheduleDocs = await firebase.db.collection("schedule").where("email", "==", email.toLowerCase()).get();
        const sch = [];
        // Define a copy of scheduleStart to find the earliest session for this participant.
        let sStart = new Date();
        for (let scheduleDoc of scheduleDocs.docs) {
          const scheduleData = scheduleDoc.data();
          if (!scheduleData.order || !scheduleData.id || scheduleData.attended) continue;
          const session = scheduleData.session.toDate();
          // We should only show the availble timeslots that are:
          // 1) after tomorrow, so the researchers don't get surprized by newly added sessions
          // 2) at least a researcher is available to take that session.

          sch.push(session);
          if (session.getTime() < sStart.getTime()) {
            sStart = session;
          }

          const sessionIdx = parseInt(scheduleData.order.replace(/[^0-9]+/g, "")) - 1;
          if (!isNaN(sessionIdx) && projectSpecs?.sessionDuration?.[sessionIdx]) {
            const slotCounts = projectSpecs?.sessionDuration?.[sessionIdx];
            for (let i = 1; i < slotCounts; i++) {
              sch.push(
                moment(session)
                  .add(30 * i, "minutes")
                  .toDate()
              );
            }
          }
        }

        if (sch.length <= 2) {
          const filterDates = sch.map(item => {
            return item.toLocaleDateString("en-US");
          });

          const filteredObj = {};

          for (const key in _availSessions) {
            for (const date of filterDates) {
              if (key.startsWith(date)) {
                filteredObj[key] = _availSessions[key];
              }
            }
          }
          _availSessions = filteredObj;
        }
        for (let key in _availSessions) {
          if (_availSessions[key].length === 0) {
            delete _availSessions[key];
          }
        }

        setAvailableSessions(_availSessions);
        if (sch.length > 0) {
          setSchedule(sch);
          setScheduleStart(sStart);
        }
        setSubmitable(true);
        setTimeout(() => {
          setScheduleLoaded(true);
        }, 400);
      }
    } catch (err) {
      console.log("Err => ", err);
    }
  };

  // Updates only one of the scheduled sessions for this participant.
  const submitNewSessions = async event => {
    try {
      setIsSubmitting(true);
      await firebase.idToken();
      await axios.post("/administrator/manageevents", {
        participant,
        selectedSession,
        availableSessions,
        currentProject,
        events
      });
      // errorAlert(responseObj.data);
      alert("sessions updated seccessufly  ...");
      setSubmitted(true);
      handleCloseSchedule();
      setScheduleLoaded(false);
      setAvailableSessions({});
      setSchedule([]);
    } catch (error) {
      setIsSubmitting(false);
      console.log("error => ", error);
      alert("Error submitting new sessions try again ...");
    }
    setIsSubmitting(false);
  };

  const cancel = () => {
    handleCloseSchedule();
    setScheduleLoaded(false);
    setAvailableSessions({});
    setSchedule([]);
  };
  const handleCloseSchedule = () => {
    setModelOpen(false);
  };

  return (
    <Box>
      <h3 style={{ marginLeft: "45px" }}>Invited instructors : </h3>
      <Box className="dataGridTable">
        <DataGrid
          rows={invitesInstructors}
          columns={istructorsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          loading={loadingInstructors}
        />
      </Box>
      <h3 style={{ marginLeft: "45px" }}>Invited adminstrators : </h3>
      <Box className="dataGridTable">
        <DataGrid
          rows={invitesAdminstartors}
          columns={adminstratorsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          loading={loadingInstructors}
        />
      </Box>
      <Box className="dataGridTable">
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
      </Box>
      <Paper style={{ margin: "19px", padding: "4px" }}>
        <p>{totalRegistered} total registered since 01/14/2022!</p>
        <p>
          {completed1st}
          {", "}
          {Math.round((completed1st / totalRegistered + Number.EPSILON) * 100)} % Completed the 1st Session!
        </p>
        <p>
          {completed2nd}
          {", "}
          {Math.round((completed2nd / completed1st + Number.EPSILON) * 100)} % Completed the 2nd Session!
        </p>
        <p>
          {completed3rd}
          {", "}
          {Math.round((completed3rd / completed1st + Number.EPSILON) * 100)} % Completed the 3rd Session!
        </p>
        <p>{recall1st} Free recall score average in 1st session!</p>
        <p>{recall2nd} Free recall score average in 2nd session!</p>
        <p>{recall3rd} Free recall score average in 3rd session!</p>
        <p>{recall1stRatio} Free recall score ratio average in 1st session!</p>
        <p>{recall2ndRatio} Free recall score ratio average in 2nd session!</p>
        <p>{recall3rdRatio} Free recall score ratio average in 3rd session!</p>
      </Paper>
      <Box className="dataGridTable">
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
      </Box>

      <Box className="dataGridTable" style={{ marginBottom: "700px" }}>
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
      </Box>
      <Dialog
        open={modelOpen}
        sx={{ width: "100vw", height: "100vh" }}
        fullWidth
        maxWidth="xl"
        onClose={handleCloseSchedule}
      >
        <DialogContent>
          {!scheduleLoaded ? (
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh"
              }}
            >
              <CircularProgress color="warning" sx={{ margin: "0" }} size="50px" />
            </Box>
          ) : (
            <Box>
              <>The availble slots does not represent the availibilty set by the participant</>
              <br />
              <>Only the ones marked ✅ has been selected </>
              <SelectSessions
                startDate={scheduleStart}
                numDays={16}
                schedule={schedule}
                setSchedule={setSchedule}
                selectedSession={selectedSession}
                setSelectedSession={setSelectedSession}
                availableSessions={availableSessions}
                setSubmitable={setSubmitable}
                numberOfSessions={currentProjectSpecs?.numberOfSessions || AppConfig.defaultNumberOfSessions}
                hourlyChunks={currentProjectSpecs?.hourlyChunks || AppConfig.defaultHourlyChunks}
                sessionDuration={currentProjectSpecs?.sessionDuration || AppConfig.defaultSessionDuration}
                daysLater={currentProjectSpecs.daysLater || AppConfig.daysLater}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Button
              onClick={submitNewSessions}
              className={submitable && !isSubmitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
              variant="contained"
              disabled={submitable && !isSubmitting ? null : true}
            >
              Schedule
            </Button>
            <Button onClick={cancel} className={"Button SubmitButton"} variant="contained">
              Cancel
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageEvents;
