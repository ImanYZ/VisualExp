import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";

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

  useEffect(() => {
    if (props.activityName && activePage !== props.activityName) {
      setActivePage(props.activityName);
    }
  }, [props.activityName, activePage]);

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
            let intellectualPoints = 0;
            let autogradedPoints = 0;
            if (projectData.points) {
              totalPoints += projectData.points;
              intellectualPoints += projectData.points;
            }
            if (projectData.dayUpVotePoints) {
              totalPoints += projectData.dayUpVotePoints;
              autogradedPoints += projectData.dayUpVotePoints;
            }
            if (projectData.expPoints) {
              totalPoints += projectData.expPoints;
              autogradedPoints += projectData.expPoints;
            }
            if (projectData.instructors) {
              totalPoints += projectData.instructors;
              autogradedPoints += projectData.instructors;
            }
            let foundResear = false;
            for (let reIdx = 0; reIdx < resears.length; reIdx++) {
              if (resears[reIdx].id === change.doc.id) {
                resears[reIdx].totalPoints = totalPoints;
                resears[reIdx].intellectualPoints = intellectualPoints;
                resears[reIdx].autogradedPoints = autogradedPoints;
                foundResear = true;
                break;
              }
            }
            if (!foundResear) {
              resears.push({
                id: change.doc.id,
                totalPoints,
                intellectualPoints,
                autogradedPoints,
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

  useEffect(() => {
    if (project && fullname) {
      const researchersQuery = firebase.db.collection("researchers");
      const researchersSnapshot = researchersQuery.onSnapshot(function (
        snapshot
      ) {
        const docChanges = snapshot.docChanges();
        setResearchersChanges(docChanges);
      });
      return () => {
        setResearchers([]);
        researchersSnapshot();
      };
    }
  }, [project, fullname]);

  return (
    <div id="ActivitiesContainer">
      {notAResearcher ? (
        <h1>
          You're not a researcher on{" "}
          {projects.length > 0 ? `the project ${project}!` : "any project!"}
        </h1>
      ) : (
        <>
          <h2>Interns Leaderboard:</h2>
          <div id="Leaderboard">
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
                          {resear.id === fullname
                            ? fullname +
                              " - 🎓 " +
                              resear.intellectualPoints +
                              " - ✔️ " +
                              resear.autogradedPoints
                            : "🎓 " +
                              resear.intellectualPoints +
                              " - ✔️ " +
                              resear.autogradedPoints}
                        </span>
                      }
                    />
                  </li>
                );
              })}
            </Paper>
          </div>
          <Alert severity="warning">
            <h2>Inclusion and Order of Authors Criteria:</h2>
            <ul>
              <li>
                <strong>Inclusion:</strong> To be an author,{" "}
                <span id="GreenText">in green</span>, one needs to earn at least{" "}
                <strong>100</strong> autograded points ✔️ and{" "}
                <strong>100</strong> intellectual points 🎓.
              </li>
              <li>
                <strong>Order:</strong> The intern with higher total of
                intellectual and autograded points (🎓 + ✔️) gets a higher
                position.
              </li>
            </ul>
          </Alert>
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
          ) : (
            <IntellectualPoints />
          )}
        </>
      )}
    </div>
  );
};

export default Activities;
