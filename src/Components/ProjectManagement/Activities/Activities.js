import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import {
  firebaseState,
  emailState,
  fullnameState,
} from "../../../store/AuthAtoms";
import {
  projectState,
  projectsState,
  activePageState,
  notAResearcherState,
} from "../../../store/ProjectAtoms";

import IntellectualPoints from "../IntellectualPoints/IntellectualPoints";
import ExperimentPoints from "../ExperimentPoints/ExperimentPoints";
import AddInstructor from "../AddInstructor/AddInstructor";
import OneCademy from "../OneCademy/OneCademy";

import favicon from "../../../assets/favicon.png";

import "./Activities.css";

const Activities = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  const projects = useRecoilValue(projectsState);
  const [activePage, setActivePage] = useRecoilState(activePageState);
  const notAResearcher = useRecoilValue(notAResearcherState);

  const [researchers, setResearchers] = useState([]);
  const [researchersChanges, setResearchersChanges] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (props.activityName && activePage !== props.activityName) {
      setActivePage(props.activityName);
    }
  }, [props.activityName, activePage]);

  useEffect(() => {
    if (project && fullname) {
      const researchersQuery = firebase.db.collection("researchers");
      const researchersSnapshot = researchersQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setResearchersChanges((oldResearchersChanges) => {
          return [...oldResearchersChanges, ...docChanges];
        });
      });
      return () => {
        setResearchers([]);
        researchersSnapshot();
      };
    }
  }, [project, fullname]);

  useEffect(() => {
    if (researchersChanges.length > 0) {
      let resears = [...researchers];
      for (let change of researchersChanges) {
        if (change.type === "removed") {
          resears = resears.filter((resear) => resear.id !== change.doc.id);
        } else {
          const researData = change.doc.data();
          if (project in researData.projects) {
            const projectData = researData.projects[project];
            let totalPoints = 0;
            let expPoints = 0;
            let onePoints = 0;
            let intellectualPoints = 0;
            let instructorsPoints = 0;
            let commentsPoints = 0;
            let recallPoints = 0;
            if (projectData.expPoints) {
              totalPoints += projectData.expPoints;
              expPoints = projectData.expPoints;
            }
            if (projectData.onePoints) {
              totalPoints += projectData.onePoints;
              onePoints += projectData.onePoints;
            }
            if (projectData.dayOneUpVotePoints) {
              totalPoints += projectData.dayOneUpVotePoints;
              onePoints += projectData.dayOneUpVotePoints;
            }
            if (projectData.points) {
              totalPoints += projectData.points;
              intellectualPoints += projectData.points;
            }
            if (projectData.dayUpVotePoints) {
              totalPoints += projectData.dayUpVotePoints;
              intellectualPoints += projectData.dayUpVotePoints;
            }
            if (projectData.instructors) {
              totalPoints += projectData.instructors;
              instructorsPoints += projectData.instructors;
            }
            if (projectData.dayInstructorUpVotes) {
              totalPoints += projectData.dayInstructorUpVotes;
              instructorsPoints += projectData.dayInstructorUpVotes;
            }
            let foundResear = false;
            for (let reIdx = 0; reIdx < resears.length; reIdx++) {
              if (resears[reIdx].id === change.doc.id) {
                resears[reIdx].totalPoints = totalPoints;
                resears[reIdx].expPoints = expPoints;
                resears[reIdx].onePoints = onePoints;
                resears[reIdx].intellectualPoints = intellectualPoints;
                resears[reIdx].instructorsPoints = instructorsPoints;
                resears[reIdx].commentsPoints = commentsPoints;
                resears[reIdx].recallPoints = recallPoints;
                foundResear = true;
                break;
              }
            }
            if (!foundResear) {
              resears.push({
                id: change.doc.id,
                totalPoints,
                expPoints,
                onePoints,
                intellectualPoints,
                instructorsPoints,
                commentsPoints,
                recallPoints,
              });
            }
          }
        }
      }
      setResearchersChanges([]);
      resears.sort((a, b) => b.totalPoints - a.totalPoints);
      setResearchers(resears);
    }
  }, [project, researchers, researchersChanges]);

  const expandLeaderboard = (event) => {
    setExpanded(!expanded);
  };

  return (
    <div id="ActivitiesContainer">
      {notAResearcher ? (
        <h1>
          You're not a researcher on{" "}
          {projects.length > 0 ? `the project ${project}!` : "any project!"}
        </h1>
      ) : (
        <>
          <div className="Columns40_60">
            <Alert severity="warning">
              <h2>Inclusion and Order of Authors Criteria:</h2>
              <strong>Inclusion:</strong> To be an author,{" "}
              <span id="GreenText">in green</span>, one needs to earn at least:
              <ul>
                <li>
                  <strong>100</strong> 1Cademy points{" "}
                  <img src={favicon} width="15.1" /> and{" "}
                </li>
                <li>
                  <strong>100</strong> Intellectual points 🎓 and
                </li>
                <li>
                  <strong>100</strong> Experiment points 👨‍🔬 and
                </li>
                <li>
                  <strong>100</strong> Collecting instructor/administrator
                  contact points 👨‍🏫 and
                </li>
                <li>
                  <strong>100</strong> Coding participants' comments points 💬
                  and
                </li>
                <li>
                  <strong>100</strong> Coding participants' recall responses
                  points 🧠
                </li>
              </ul>
              <strong>Order:</strong> The intern with higher total of all the
              above categories gets a higher position.
              <Button
                onClick={expandLeaderboard}
                className={expanded ? "Button Red" : "Button Green"}
                variant="contained"
              >
                {expanded ? "Collapse" : "Expand"} leaderboard details
              </Button>
            </Alert>
            <div id="Leaderboard">
              <h2 id="InternsLeaderboardHeader">Interns Leaderboard:</h2>
              <Paper
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  listStyle: "none",
                  p: 0.5,
                  m: 0,
                }}
                component="ul"
              >
                {researchers.map((resear) => {
                  return (
                    <li key={resear.id} className="LeaderboardItem">
                      <Chip
                        icon={
                          resear.intellectualPoints >= 100 &&
                          resear.autogradedPoints >= 100 ? (
                            <span className="ChipContent">😊</span>
                          ) : (
                            <span className="ChipContent">😔</span>
                          )
                        }
                        variant={resear.id === fullname ? "" : "outlined"}
                        color={
                          resear.intellectualPoints >= 100 &&
                          resear.autogradedPoints >= 100
                            ? "success"
                            : "error"
                        }
                        label={
                          <span className="ChipContent">
                            {resear.id === fullname && fullname + " - "}
                            {expanded ? (
                              <>
                                <img src={favicon} width="15.1" />{" "}
                                {resear.onePoints +
                                  " - 🎓 " +
                                  resear.intellectualPoints +
                                  " - 👨‍🏫 " +
                                  resear.instructorsPoints +
                                  " - 👨‍🔬 " +
                                  resear.expPoints +
                                  " - 💬 " +
                                  resear.commentsPoints +
                                  " - 🧠 " +
                                  resear.recallPoints}
                              </>
                            ) : (
                              resear.totalPoints
                            )}
                          </span>
                        }
                      />
                    </li>
                  );
                })}
              </Paper>
            </div>
          </div>
          {/* <div id="InternsNumFormControl">
        <span id="InternsNumQuestion">
          How many interns should be in the authors list?
        </span>
        <InputLabel id="InternsNumLabel">
          How many interns would you like to include the authors list?
        </InputLabel>
        <Select
          // labelId="InternsNumLabel"
          id="InternsNumSelect"
          value={internsNum}
          label="Number of Interns"
          onChange={internsNumChange}
        >
          {Object.keys(researchers).map((resea, idx) => (
            <MenuItem
              key={resea + "Key"}
              className="SelectItem"
              value={idx + 1}
            >
              {idx + 1}
            </MenuItem>
          ))}
        </Select>
        <span id="InternsNumAvgLabel">
          The average vote is: {internsNumsAvg}
        </span>
      </div> */}
          {activePage === "Intellectual" ? (
            <IntellectualPoints />
          ) : activePage === "Experiments" ? (
            <ExperimentPoints />
          ) : activePage === "AddInstructor" ? (
            <AddInstructor />
          ) : activePage === "1Cademy" ? (
            <OneCademy />
          ) : (
            <IntellectualPoints />
          )}
        </>
      )}
    </div>
  );
};

export default Activities;
