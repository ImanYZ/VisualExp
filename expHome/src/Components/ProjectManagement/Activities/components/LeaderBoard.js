import React, { useState } from "react";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { formatPoints } from "../../../../utils";
import { firebaseState } from "../../../../store/AuthAtoms";
import { useRecoilValue } from "recoil";

export const LeaderBoard = ({
  fullname,
  expanded,
  researchers,
  isResearcherCriteriaMet,
  makeResearcherChipContent,
  onGoingEvent,
  setOnGoingSchedule,
  onGoingSchedule
}) => {
  const [starting, setStarting] = useState(false);

  const firebase = useRecoilValue(firebaseState);

  const startSession = async () => {
    try {
      const { scheduleId } = onGoingSchedule;
      setStarting(true);
      await firebase.db.collection("schedule").doc(scheduleId).update({ hasStarted: true });
      setOnGoingSchedule({
        ...onGoingSchedule,
        hasStarted: true
      });
      if (onGoingEvent.hangoutLink) {
        const open_link = window.open("", "_blank");
        open_link.location = onGoingEvent.hangoutLink;
      }
    } catch (err) {
      alert("Something went wrong while starting the session.");
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
                variant={resear.id === fullname ? "" : "outlined"}
                color={isResearcherCriteriaMet(resear) ? "success" : "error"}
                label={
                  <span className="ChipContent">
                    {resear.id === fullname && fullname + " - "}
                    {expanded ? makeResearcherChipContent(resear) : formatPoints(resear.totalPoints)}
                  </span>
                }
              />
            </li>
          );
        })}
      </Paper>
      {onGoingEvent && onGoingSchedule && (
        <div style={{ paddingBotton: "10px" }}>
          <Alert severity="info">
            <div style={{ width: "100%" }}>
              <Typography>You have a session with</Typography>
              <Typography variant="h4">{onGoingSchedule.email}</Typography>

              <div style={{ marginTop: "12px" }}>
                <Button className={"Button Blue"} variant="contained">
                  Remind Participant
                </Button>

                <Button
                  className={"Button Green"}
                  style={{ marginLeft: 5 }}
                  variant="contained"
                  onClick={startSession}
                  disabled={starting || onGoingSchedule.hasStarted}
                >
                  {onGoingSchedule.hasStarted ? "Session Started" : "Start Session"}
                </Button>
              </div>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
};
