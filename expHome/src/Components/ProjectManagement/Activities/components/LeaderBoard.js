import React, { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { formatPoints } from "../../../../utils";
import { firebaseState } from "../../../../store/AuthAtoms";
import { useRecoilValue } from "recoil";
import axios from "axios";
import moment from "moment";

export const LeaderBoard = ({
  fullname,
  expanded,
  researchers,
  isResearcherCriteriaMet,
  makeResearcherChipContent,
  onGoingEvents,
  setOnGoingEvents
}) => {
  const [starting, setStarting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const firebase = useRecoilValue(firebaseState);

  const startSession = async (ev, index) => {
    try {
      const { scheduleId } = ev.schedule;
      setStarting(true);
      await firebase.db.collection("schedule").doc(scheduleId).update({ hasStarted: true });

      if (ev.event.hangoutLink) {
        const open_link = window.open("", "_blank");
        open_link.location = ev.event.hangoutLink;
      }
      const evs = [...onGoingEvents];
      evs[index] = { ...ev, schedule: { ...ev.schedule, hasStarted: true } };
      setOnGoingEvents(evs);
    } catch (err) {
      alert("Something went wrong while starting the session.");
    } finally {
      setStarting(false);
    }
  };

  const sendEventNotificationEmail = async ev => {
    try {
      setSendingReminder(true);
      await axios.post("/sendEventNotificationEmail", {
        email: ev.schedule.email,
        order: ev.schedule.order,
        firstname: ev.schedule.firstname,
        weAreWaiting: true,
        hangoutLink: ev.event.hangoutLink
      });
      alert("Event reminder notification sent.");
    } catch (err) {
      alert("Something went wrong while sending the reminder.");
    } finally {
      setSendingReminder(false);
    }
  };

  const markAttended = async (ev, index) => {
    try {
      const { scheduleId } = ev.schedule;
      setStarting(true);
      await firebase.db.collection("schedule").doc(scheduleId).update({ attended: true });
      const evs = [...onGoingEvents];
      evs[index] = { ...ev, schedule: { ...ev.schedule, attended: true } };
      setOnGoingEvents(evs);
    } catch (err) {
      alert("Something went wrong while marking the attendance.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div id="Leaderboard">
      <h2 id="InternsLeaderboardHeader">Interns Leaderboard:</h2>
      <Paper
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          listStyle: "none",
          p: 0.5,
          m: 0
        }}
        component="ul"
      >
        {researchers.map(resear => {
          return (
            <li key={resear.id} className="LeaderboardItem">
              <Chip
                icon={
                  isResearcherCriteriaMet(resear) ? (
                    <span className="ChipContent">😊</span>
                  ) : (
                    <span className="ChipContent">😔</span>
                  )
                }
                variant="outlined"
                color={isResearcherCriteriaMet(resear) ? "success" : "error"}
                label={
                  <span className="ChipContent">
                    {(resear.id === fullname || fullname === "Iman YeckehZaare") && resear.id + " - "}
                    {expanded ? makeResearcherChipContent(resear) : formatPoints(resear.totalPoints)}
                  </span>
                }
              />
            </li>
          );
        })}
      </Paper>
      {(onGoingEvents || []).map((ev, index) => {
        const now = new Date().getTime();
        const isHappening =
          new Date(ev.event.start.dateTime).getTime() <= currentTime &&
          new Date(ev.event.end.dateTime).getTime() >= currentTime;

        const color = isHappening ? "success" : "primary";
        return (
          <div style={{ marginBottom: "5px" }}>
            <Alert severity={color} key={ev.event.id}>
              <Typography>
                {ev.schedule.firstname} ({moment(ev.event.start.dateTime).format("LT")}
                {" - "}
                {moment(ev.event.end.dateTime).format("LT")})
              </Typography>
              <Typography variant="caption">{ev.schedule.email}</Typography>
              <div>
                <Chip
                  label="Remind Participant"
                  variant="outlined"
                  color={color}
                  style={{ margin: "5px" }}
                  onClick={() => sendEventNotificationEmail(ev, index)}
                />
                {!ev?.schedule?.hasStarted && (
                  <Chip
                    label="Start Session"
                    color={color}
                    style={{ margin: "5px" }}
                    onClick={() => startSession(ev, index)}
                    disabled={starting}
                  />
                )}
                {ev?.schedule?.hasStarted && (
                  <Chip
                    label="Mark Attended"
                    color={color}
                    style={{ margin: "5px" }}
                    onClick={() => markAttended(ev, index)}
                  />
                )}
              </div>
            </Alert>
          </div>
        );
      })}
    </div>
  );
};
