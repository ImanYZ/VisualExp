import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";
import { ResponsiveCalendar } from "@nivo/calendar";

import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";

import { DataGrid } from "@mui/x-data-grid";

import {
  firebaseState,
  emailState,
  fullnameState,
} from "../../../store/AuthAtoms";
import {
  projectState,
  notTakenSessionsState,
  notTakenSessionsLoadedState,
} from "../../../store/ProjectAtoms";

import GridCellToolTip from "../../GridCellToolTip";

import { getISODateString } from "../../../utils/DateFunctions";

import "./ExperimentPoints.css";

const expSessionsColumns = [
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  { field: "end", headerName: "End", type: "dateTime", width: 190 },
  {
    field: "attendees",
    headerName: "Attendees",
    width: 400,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  { field: "points", headerName: "Points", type: "number", width: 130 },
];

const notTakenSessionsColumns = [
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  { field: "end", headerName: "End", type: "dateTime", width: 190 },
  { field: "hoursLeft", headerName: "Hours Left", type: "number", width: 130 },
  { field: "points", headerName: "Points", type: "number", width: 130 },
];

const ExperimentPoints = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  const notTakenSessions = useRecoilValue(notTakenSessionsState);
  const notTakenSessionsLoaded = useRecoilValue(notTakenSessionsLoadedState);

  const [expSessionsChanges, setExpSessionsChanges] = useState([]);
  const [expSessions, setExpSessions] = useState([]);
  const [dailyPoints, setDailyPoints] = useState([]);
  const [expSessionsLoaded, setExpSessionsLoaded] = useState(false);

  useEffect(() => {
    if (expSessionsChanges.length > 0) {
      const tempExpSessionsChanges = [...expSessionsChanges];
      setTimeout(() => {
        setExpSessionsChanges([]);
      }, 0);
      let eSessions = [...expSessions];
      let dPoints = [...dailyPoints];
      for (let change of tempExpSessionsChanges) {
        if (change.type === "removed") {
          eSessions = eSessions.filter((eSe) => eSe.id !== change.doc.id);
        } else {
          const eSessionData = change.doc.data();
          if (eSessionData.attendees.includes(email)) {
            const eSessionObj = {
              id: change.doc.id,
              start: eSessionData.sTime.toDate(),
              end: eSessionData.eTime.toDate(),
              attendees: eSessionData.attendees.join(", "),
              points: eSessionData.points,
            };
            const eSessionIdx = eSessions.findIndex(
              (eSe) => eSe.id === change.doc.id
            );
            if (eSessionIdx === -1) {
              eSessions.push(eSessionObj);
            } else {
              eSessions[eSessionIdx] = eSessionObj;
            }
            const theDate = getISODateString(eSessionData.sTime.toDate());
            const dPointIdx = dPoints.findIndex((eSe) => eSe.day === theDate);
            if (dPointIdx === -1) {
              dPoints.push({
                day: theDate,
                value: eSessionData.points,
              });
            } else {
              dPoints[dPointIdx].value += eSessionData.points;
            }
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
        .where("project", "==", project);
      const expSessionsSnapshot = expSessionsQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setExpSessionsChanges((oldExpSessionsChanges) => {
          return [...oldExpSessionsChanges, ...docChanges];
        });
      });
      return () => {
        setExpSessionsChanges([]);
        expSessionsSnapshot();
      };
    }
  }, [project, fullname]);

  return (
    <>
      <Alert severity="success">
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
      </div>
      <h2>Your Experiment Sessions:</h2>
      <Alert severity="warning">
        <h2>Points:</h2>
        <p>
          You receive 16 points for running every first session and 7 points for
          running every second or third session. Points are assigned
          automatically. You do not need to take any further actions on this
          page.
        </p>
        <h2>Update time:</h2>
        <p>
          We update the table below on a weekly basis. Don't panic if the
          sessions you ran are not in the table yet.
        </p>
        <h2>Calendar visualization:</h2>
        <p>
          Each small square indicates a day. The shades of the color indicate
          the number of points you earned on that day. You can hover your mouse
          over each of the green squares to see the exact date and the number of
          points you earned on that day.
        </p>
      </Alert>
      <div id="DataVisualization">
        <ResponsiveCalendar
          data={dailyPoints}
          from="2021-05-01"
          to="2022-05-01"
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
              itemDirection: "right-to-left",
            },
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
    </>
  );
};

export default ExperimentPoints;
