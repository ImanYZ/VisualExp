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
import {
  retrieveEvents,
  expSessionsColumns,
  applicantsColumns,
  istructorsColumns,
  adminstratorsColumns
} from "./helpers";
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

  useEffect(() => {
    const loadAvailabilities = async () => {
      const scheduleDocs = await firebase.db.collection("schedule").orderBy("id").get();
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

  // If availabilitiesLoaded, retrieve the ongoing events.
  useEffect(() => {
    const loadOngoingEvents = async () => {
      const evs = await retrieveEvents("/ongoingEvents", firebase, availabilities);
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
      const evs = await retrieveEvents("/allEvents", firebase, availabilities);
      setEvents(evs);
      setExpSessionsLoaded(true);
    };
    if (firebase && availabilities) {
      loadEvents();
    }
  }, [firebase, availabilities]);

  // Load data from applications to populate the content of the
  // application statuses table.
  useEffect(() => {
    const notifyApplicationStatus = async () => {
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
      const applicationsHash = {};

      const applicationsDocs = await firebase.db.collection("applications").get();
      applicationsDocs.forEach(doc => {
        const application = doc.data();
        if (applicationsHash.hasOwnProperty(application.fullname)) {
          applicationsHash[application.fullname].push(application);
        } else {
          applicationsHash[application.fullname] = [application];
        }
      });

      const tutorialHash = {};
      const tutorialsDocs = await firebase.db.collection("tutorial").get();
      tutorialsDocs.forEach(doc => {
        const tutorial = doc.data();
        tutorialHash[doc.id] = tutorial;
      });

      const userDocs = await firebase.db.collection("users").get();
      const surveyInstructors = await firebase.db.collection("instructors").get();
      const surveyUsers = await firebase.db.collection("usersSurvey").get();
      for (let userDoc of [...surveyInstructors.docs, ...surveyUsers.docs, ...userDocs.docs]) {
        const userData = userDoc.data();
        if ("createdAt" in userData && userData.createdAt.toDate() > new Date("1-14-2022")) {
          registered += 1;
          if ("postQ2Choice" in userData) {
            completedFirst += 1;
            if ("pConditions" in userData && userData.pConditions.length === 2) {
              recallFirst += userData.pConditions[0].recallScore + userData.pConditions[1].recallScore;
              recallFirstRatio += userData.pConditions[0].recallScoreRatio + userData.pConditions[1].recallScoreRatio;
            }
          }
          if ("post3DaysQ2Choice" in userData) {
            completedSecond += 1;
            if ("pConditions" in userData && userData.pConditions.length === 2) {
              recallSecond += userData.pConditions[0].recall3DaysScore + userData.pConditions[1].recall3DaysScore;
              recallSecondRatio +=
                userData.pConditions[0].recall3DaysScoreRatio + userData.pConditions[1].recall3DaysScoreRatio;
            }
          }
          if ("projectDone" in userData && userData.projectDone) {
            completedThird += 1;
            if ("pConditions" in userData && userData.pConditions.length === 2) {
              recallThird += userData.pConditions[0].recall1WeekScore
                ? userData.pConditions[0].recall1WeekScore
                : 0 + userData.pConditions[1].recall1WeekScore
                ? userData.pConditions[1].recall1WeekScore
                : 0;
              recallThirdRatio +=
                userData.pConditions[0].recall1WeekScoreRatio + userData.pConditions[1].recall1WeekScoreRatio;
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
              reminder: "reminder" in userData && userData.reminder ? userData.reminder.toDate() : null
            };
            if (tutorialHash.hasOwnProperty(userDoc.id)) {
              appl.tutStarted = true;
              const tutorialData = tutorialHash[userDoc.id];
              if ("ended" in tutorialData && tutorialData.ended) {
                appl.tutorial = true;
                // let submittedOne = false;

                const applicationDocs = applicationsHash[userDoc.id] || [];
                for (let applicationData of applicationDocs) {
                  appl.applicationsStarted.push(applicationData.communiId);
                  if ("ended" in applicationData && applicationData.ended) {
                    // submittedOne = true;
                    appl.applications.push(
                      applicationData.communiId + ": " + applicationData.corrects + " - " + applicationData.wrongs
                    );
                  }
                }
              }
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
        setScheduleLoaded(false);
        // We need to first retrieve which project this user belongs to.
        let userDoc = await firebase.db.collection("users").doc(theRow.fullname).get();
        if (!userDoc.exists) {
          userDoc = await firebase.db.collection("instructors").doc(theRow.fullname).get();
        }
        if (!userDoc.exists) {
          userDoc = await firebase.db.collection("usersSurvey").doc(theRow.fullname).get();
        }

        const userData = userDoc.data();
        const project = userData.project;
        const projectSpecs = allProjectSpecs[project];
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
            researchers[researcherDoc.id] = researcherData.email;
          }
        }
        // availSessions = a placeholder to accumulate values that we will eventually put in availableSessions.
        // Each kay indicates a session timestamp and the corresponding value is an array of researcher emails
        // that may include 0 to many researchers who are available at that session.
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
              const _scheduleSlot = slotDT.toLocaleString();
              if (!availSessions[_scheduleSlot]) {
                availSessions[_scheduleSlot] = [];
              }
              availSessions[_scheduleSlot].push(researcherFullname);
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
              availSessions[startTime] = availSessions[startTime].filter(
                resea => resea !== researchers[attendee.email]
              );
              if (duration >= 60 * 60 * 1000) {
                availSessions[endTime] = availSessions[endTime].filter(resea => resea !== researchers[attendee.email]);
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

          for (const key in availSessions) {
            for (const date of filterDates) {
              if (key.startsWith(date)) {
                filteredObj[key] = availSessions[key];
              }
            }
          }
          availSessions = filteredObj;
        }
        setAvailableSessions(availSessions);
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
      await axios.post("/admin/manageevents", {
        participant,
        selectedSession,
        availableSessions,
        currentProject,
        events
      });
      // errorAlert(responseObj.data);
      // alert("sessions updated seccessufly  ...");
      setSubmitted(true);
    } catch (error) {
      setIsSubmitting(false);
      console.log("error => ", error);
      alert("Error submitting new sessions try again ...");
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      <h3 style={{ marginLeft: "45px" }}>Invited instructors : </h3>
      <div className="dataGridTable">
        <DataGrid
          rows={invitesInstructors}
          columns={istructorsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          loading={loadingInstructors}
        />
      </div>
      <h3 style={{ marginLeft: "45px" }}>Invited adminstrators : </h3>
      <div className="dataGridTable">
        <DataGrid
          rows={invitesAdminstartors}
          columns={adminstratorsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          loading={loadingInstructors}
        />
      </div>
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
              selectedSession={selectedSession}
              setSelectedSession={setSelectedSession}
              availableSessions={availableSessions}
              setSubmitable={setSubmitable}
              numberOfSessions={currentProjectSpecs?.numberOfSessions || AppConfig.defaultNumberOfSessions}
              hourlyChunks={currentProjectSpecs?.hourlyChunks || AppConfig.defaultHourlyChunks}
              sessionDuration={currentProjectSpecs?.sessionDuration || AppConfig.defaultSessionDuration}
              daysLater={currentProjectSpecs.daysLater || AppConfig.daysLater}
            />
          </div>
        )}
      </div>
      <div id="SignBtnContainer">
        <Button
          onClick={submitNewSessions}
          className={submitable && !isSubmitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
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
