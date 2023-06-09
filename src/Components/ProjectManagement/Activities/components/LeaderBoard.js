import React, { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { formatPoints } from "../../../../utils";
import { firebaseState, emailState } from "../../../../store/AuthAtoms";
import { useRecoilValue } from "recoil";
import axios from "axios";
import moment from "moment";
import { projectState } from "../../../../store/ProjectAtoms";
import { chunk } from "lodash";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { fi } from "date-fns/locale";

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
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  const [hasRecentParticipantRecalls, setHasRecentParticipantRecalls] = useState(false);
  const project = useRecoilValue(projectState);
  const email = useRecoilValue(emailState);

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
      setStarting(true);
      await axios.post("/markAttended", {
        ev,
        fullname,
        email
      });
      const evs = [...onGoingEvents];
      evs[index] = { ...ev, schedule: { ...ev.schedule, attended: true } };
      setOnGoingEvents(evs);
      alert("You have successfully marked the attendance.");
    } catch (err) {
      console.log(err);
      alert("Something went wrong while marking the attendance.");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!(project || !fullname)) {
      return;
    }

    // recent participants logic
    (async () => {
      const recentParticipants = [];
      const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
      const month2WeeksAgo = moment().utcOffset(-4).subtract(16, "days").startOf("month").format("YYYY-MM-DD");
      if (!scheduleMonths.includes(month2WeeksAgo)) {
        scheduleMonths.push(month2WeeksAgo);
      }
      const resSchedules = await firebase.db.collection("resSchedule").where("month", "in", scheduleMonths).get();
      for (const resSchedule of resSchedules.docs) {
        const resScheduleData = resSchedule.data();
        const scheduled = resScheduleData?.scheduled?.[fullname] || {};
        recentParticipants.push(...Object.keys(scheduled));
      }

      let hasRecentParticipantRecalls = false;
      const unameChunks = chunk(recentParticipants, 10); // firebase has 10 item limit for "where-in"
      for (const unameChunk of unameChunks) {
        const recallGrades = await firebase.db
          .collection("recallGradesV2")
          .where("project", "==", project)
          .where("user", "in", unameChunk)
          .get();
        for (const recallGrade of recallGrades.docs) {
          const recallGradeData = recallGrade.data();
          for (const sessionKey in recallGradeData.sessions) {
            for (const conditionItem of recallGradeData.sessions[sessionKey]) {
              // if researcher didn't graded condition item and condition not flagged as done
              if (!conditionItem.researchers.includes(fullname) && !conditionItem.done) {
                hasRecentParticipantRecalls = true;
                break;
              }
            }

            if (hasRecentParticipantRecalls) {
              break;
            }
          }

          if (hasRecentParticipantRecalls) {
            break;
          }
        }

        if (hasRecentParticipantRecalls) {
          break;
        }
      }

      setHasRecentParticipantRecalls(hasRecentParticipantRecalls);
    })();
  }, [project, fullname]);

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
      {hasRecentParticipantRecalls ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px"
          }}
        >
          <Button
            className="Button Green"
            variant="contained"
            sx={{
              textTransform: "uppercase"
            }}
            onClick={() => {
              navigate("/Activities/FreeRecallGrading");
            }}
          >
            Your participants recall responses
          </Button>
        </Box>
      ) : (
        <span />
      )}
      {(onGoingEvents || []).map((ev, index) => {
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
                  disabled={ev?.schedule?.attended}
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
                    disabled={ev?.schedule?.attended || starting}
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
