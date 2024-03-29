import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import moment from "moment";

import axios from "axios";

import { ResponsiveCalendar } from "@nivo/calendar";

import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import { DataGrid } from "@mui/x-data-grid";

import { firebaseState, emailState, fullnameState } from "../../../store/AuthAtoms";
import {
  projectState,
  projectSpecsState
  // notTakenSessionsState,
  // notTakenSessionsLoadedState,
} from "../../../store/ProjectAtoms";

import SnackbarComp from "../../SnackbarComp";
import GridCellToolTip from "../../GridCellToolTip";
import ResearcherAvailabilities from "./ResearcherAvailabilities";

import { getISODateString } from "../../../utils/DateFunctions";

import "./ExperimentPoints.css";
import AppConfig from "../../../AppConfig";
import { element } from "prop-types";

// Call this for sessions that the participant has not accepted the Google
// Calendar invite yet, or should have been in the session but they have not
// shown up yet.
const sendEventNotificationEmail = params => async event => {
  await axios.post("/sendEventNotificationEmail", params);
};

// Characteristics of the columns of the experiment sessions table.
const participantsColumns = [
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  {
    field: "participant", // email address
    headerName: "Participant",
    width: 190
  },
  {
    field: "acceptedNum",
    headerName: "Acc Num",
    type: "number",
    width: 70,
    renderCell: cellValues => {
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
            courseName: cellValues.row.courseName
          })}
          className="Button Red NotificationBtn"
          variant="contained"
        >
          {cellValues.value + " A"}
        </Button>
      ) : (
        cellValues.value + " A"
      );
    }
  }
];

const expSessionsColumns = [
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  { field: "end", headerName: "End", type: "dateTime", width: 190 },
  { field: "participant", headerName: "Participant", width: 130 },
  {
    field: "attendees",
    headerName: "Attendees",
    width: 400,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  { field: "points", headerName: "Points", type: "number", width: 130 }
];

// const notTakenSessionsColumns = [
//   { field: "start", headerName: "Start", type: "dateTime", width: 190 },
//   { field: "end", headerName: "End", type: "dateTime", width: 190 },
//   { field: "hoursLeft", headerName: "Hours Left", type: "number", width: 130 },
//   { field: "points", headerName: "Points", type: "number", width: 130 },
// ];

let tomorrow = new Date();
tomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
tomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

const ExperimentPoints = props => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  // const notTakenSessions = useRecoilValue(notTakenSessionsState);
  // const notTakenSessionsLoaded = useRecoilValue(notTakenSessionsLoadedState);

  const [schedule, setSchedule] = useState([]);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [scheduleError, setScheduleError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [expSessionsChanges, setExpSessionsChanges] = useState([]);
  const [expSessions, setExpSessions] = useState([]);
  const [dailyPoints, setDailyPoints] = useState([]);
  const [expSessionsLoaded, setExpSessionsLoaded] = useState(false);
  // const [scheduleSlots, setScheduleSlots] = useState([]);
  // const [availableScheduleSlots, setAvailableScheduleSlots] = useState([]);

  const projectSpecs = useRecoilValue(projectSpecsState);

  useEffect(() => {
    if (expSessionsChanges.length > 0) {
      const tempExpSessionsChanges = [...expSessionsChanges];
      setExpSessionsChanges([]);
      let eSessions = [...expSessions];
      let dPoints = [...dailyPoints];
      for (let change of tempExpSessionsChanges) {
        if (change.type === "removed") {
          eSessions = eSessions.filter(eSe => eSe.id !== change.doc.id);
        } else {
          const eSessionData = change.doc.data();
          const eSessionObj = {
            id: change.doc.id,
            start: eSessionData.sTime.toDate(),
            end: eSessionData.eTime.toDate(),
            attendees: eSessionData.attendees.filter(email => email !== "ouhrac@gmail.com").join(", "),
            points: eSessionData.points,
            participant: eSessionData?.user || ""
          };
          const eSessionIdx = eSessions.findIndex(eSe => eSe.id === change.doc.id);
          if (eSessionIdx === -1) {
            eSessions.push(eSessionObj);
          } else {
            eSessions[eSessionIdx] = eSessionObj;
          }
          const theDate = getISODateString(eSessionData.sTime.toDate());
          const dPointIdx = dPoints.findIndex(eSe => eSe.day === theDate);
          if (dPointIdx === -1) {
            dPoints.push({
              day: theDate,
              value: eSessionData.points
            });
          } else {
            dPoints[dPointIdx].value += eSessionData.points;
          }
        }
      }
      setExpSessions(eSessions);
      setDailyPoints(dPoints);
    }
    setExpSessionsLoaded(true);
  }, [email, expSessions, dailyPoints, expSessionsChanges]);

  useEffect(() => {
    if (project && fullname) {
      const expSessionsQuery = firebase.db
        .collection("expSessions")
        .where("project", "==", project)
        .where("researcher", "==", fullname);
      const expSessionsSnapshot = expSessionsQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setExpSessionsChanges(oldExpSessionsChanges => {
          return [...oldExpSessionsChanges, ...docChanges];
        });
      });
      return () => {
        setExpSessionsChanges([]);
        expSessionsSnapshot();
      };
    }
  }, [project, fullname]);

  useEffect(() => {
    if (!(project && fullname)) {
      return;
    }
    setScheduleLoaded(false);
    const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
    const scheduleEnd = moment().utcOffset(-4).startOf("day").add(16, "days").startOf("month").format("YYYY-MM-DD");
    if (!scheduleMonths.includes(scheduleEnd)) {
      scheduleMonths.push(scheduleEnd);
    }

    console.log(expSessions);

    return firebase.db
      .collection("resSchedule")
      .where("project", "==", project)
      .where("month", "in", scheduleMonths)
      .onSnapshot(async snapshot => {
        if (snapshot.docs.length === 0) {
          setScheduleError(true);
          setSchedule([]);
          setScheduleLoaded(true);
          return;
        }

        let schedules = [];
        for (const resSchedule of snapshot.docs) {
          const resScheduleData = resSchedule.data();
          // scheduled
          const { schedules: resSchedules } = resScheduleData;
          const _schedules = resSchedules[fullname] || [];
          schedules = schedules.concat(_schedules);
        }

        // console.log(schedules);
        // const _scheduled = scheduled[fullname] || {};
        // const scheduledFullnames = Object.keys(_scheduled);
        // const scheduledSlots = [];
        // for(const scheduledFullname of scheduledFullnames) {
        //   const sessionIndexes = Object.keys(_scheduled[scheduledFullname])
        //   for(const sessionIndex of sessionIndexes) {
        //     scheduledSlots.push(..._scheduled[scheduledFullname][sessionIndex])
        //   }
        // }
        // const availableSchedules = _schedules.filter((scheduleSlot) => !!~scheduledSlots.indexOf(scheduleSlot));

        const schedule = schedules.map(_schedule => moment(_schedule).utcOffset(-4, true).toDate());
        setSchedule(schedule);
        setScheduleLoaded(true);

        let lastSession = new Date();
        for (let session of schedule) {
          if (session > lastSession) {
            lastSession = session;
          }
        }
        if (moment(lastSession).utcOffset(-4).isBefore(moment().utcOffset(-4).startOf("day").add(8, "day"))) {
          setScheduleError(true);
        }
      });
  }, [project, fullname]);

  const submitData = async () => {
    try {
      setIsSubmitting(true);
      let lastSession = new Date();
      for (let session of schedule) {
        if (session > lastSession) {
          lastSession = session;
        }
      }
      setIsSubmitting(false);
      if (moment(lastSession).utcOffset(-4).isBefore(moment().utcOffset(-4).startOf("day").add(8, "day"))) {
        setScheduleError(true);
        setSnackbarMessage(
          `Please specify your availability for at least the next 10 days, otherwise there will not be enough available sessions for the participants to schedule their ${
            project === "OnlineCommunities" ? "interview session" : "3rd session"
          }`
        );
      } else {
        setScheduleError(false);
        setSnackbarMessage("Your availability is successfully saved in the database!");
      }
      await firebase.idToken();
      await axios.post("/researchers/schedule", {
        fullname,
        project,
        schedule: schedule.map(dt => moment(dt).utcOffset(-4).format("YYYY-MM-DD HH:mm"))
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Alert severity="success">
        <h2>Specify Your Weekly Availability:</h2>
        <p>Please specify your availability in YOUR TIMEZONE in the table below on a weekly basis.</p>
        <p>
          This way, when participants schedule their new sessions, our system will only let them choose time-slots when
          we have at least one available researcher.
        </p>
      </Alert>
      <Alert severity="error">
        <h2>Notes:</h2>
        <p>
          Until all our researchers specify their availabilities, we cannot deploy this new scheduling system for the
          participants, so please keep taking the sessions on Google Calendar.
        </p>
        <p>
          This system is smart enough to know in which sessions you are running experiments. So, please do not remove
          your experiment sessions from your availabilities below.
        </p>
        <p>Don't forget to click the "Submit" button after specifying your availability.</p>
        {scheduleError && (
          <h2>
            Please specify your availability for at least the next 10 days, otherwise there will not be enough available
            sessions for the participants to schedule their{" "}
            {project === "OnlineCommunities" ? "interview session" : "3rd session"}!
          </h2>
        )}
      </Alert>
      {scheduleLoaded && (
        <>
          <ResearcherAvailabilities
            startDate={tomorrow}
            numDays={16}
            schedule={schedule}
            setSchedule={setSchedule}
            hourlyChunks={projectSpecs.hourlyChunks || AppConfig.defaultHourlyChunks}
          />
          <div
            style={{
              position: "fixed",
              bottom: "0px",
              left: "46%",
              marginBottom: "10px"
            }}
          >
            <Button
              onClick={submitData}
              className={!isSubmitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
              variant="contained"
              disabled={!isSubmitting ? null : true}
            >
              Submit
            </Button>
          </div>
        </>
      )}
      {/* <Alert severity="success">
        <h2>Scheduling:</h2>
        <p>
          The experiment sessions in the table below are not taken yet. Note
          that the table gets updated every hour. So, it's possible that you
          find a session in the table that is just taken by one of the
          researchers on Google Calendar.
        </p>
        <p>
          You are already invited to the “UX Research Experiment” Calendar. You
          can make this calendar visible on your Google Calendar by clicking its
          checkbox in "My calendars" on the left sidebar. To earn points for
          running experiment sessions, you need to:
        </p>
        <ol>
          <li>
            Look for the events in this calendar that you can attend the full
            session on a computer. There are three experiment sessions:
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
          </li>
          <li>
            Click on the event that you're available for, and click “edit”.
          </li>
          <li>
            On the right-hand side, in the “guests” section, type your email
            address and press Enter.
          </li>
          <li>
            At the end of the event description, you can find the participant's
            email address. Add it to the “guest” section as well, and delete it
            from the description.
          </li>
          <li>
            Save the session to send out the invite!
            <ul>
              <li>
                The participant will not be invited to the session if you do not
                add them to the "guest" section.
              </li>
              <li>
                You don't need to invite Iman, because he is automatically
                invited.
              </li>
            </ul>
          </li>
          <li>
            Attend the experiment session and do the followings:
            <ul>
              <li>Record the session before starting it.</li>
              <li>
                Depending on whether the session is the 1st, 2nd, or 3rd one,
                read the instructions for the participant.
              </li>
              <li>Answer the participant's questions.</li>
              <li>
                Make sure they do not use their cellphones or do other
                activities during the experiment session.
              </li>
            </ul>
          </li>
          <li>
            At the conclusion of the session, remind the participant of the
            following experiment sessions, if any, and the dates they need to
            attend.
            <ul>
              <li>
                They are already invited to those sessions on Google Calendar.
              </li>
              <li>
                If, for any reason, they cannot find the sessions on their
                Google Calendar or need to reschedule them, they should email
                Iman and CC you.
              </li>
            </ul>
          </li>
        </ol>
      </Alert>
      <div className="DataGridBox">
        <DataGrid
          rows={notTakenSessions}
          columns={notTakenSessionsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          hideFooterSelectedRowCount
          loading={!notTakenSessionsLoaded}
        />
      </div> */}
      <h2>Your Experiment Sessions:</h2>
      <Alert severity="warning">
        <h2>Points:</h2>
        <p>
          You receive 16 points for running every first session and 7 points for running every second or third session.
          Points are assigned automatically. You do not need to take any further actions on this page.
        </p>
        <h2>Update time:</h2>
        <p>
          We update the table below on a weekly basis. Don't panic if the sessions you ran are not in the table yet.
        </p>
        <h2>Calendar visualization:</h2>
        <p>
          Each small square indicates a day. The shades of the color indicate the number of points you earned on that
          day. You can hover your mouse over each of the green squares to see the exact date and the number of points
          you earned on that day.
        </p>
      </Alert>
      <div id="DataVisualization">
        <ResponsiveCalendar
          data={dailyPoints}
          from="2021-05-01"
          to="2023-05-01"
          emptyColor="#eeeeee"
          colors={["#97e3d5", "#61cdbb"]}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          yearSpacing={40}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          legends={[
            {
              anchor: "bottom-right",
              direction: "row",
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: "right-to-left"
            }
          ]}
        />
      </div>
      <div className="DataGridBox">
        <DataGrid
          rows={expSessions}
          columns={expSessionsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          hideFooterSelectedRowCount
          loading={!expSessionsLoaded}
        />
      </div>
      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </>
  );
};

export default ExperimentPoints;
