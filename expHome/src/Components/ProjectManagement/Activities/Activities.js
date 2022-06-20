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
  projectSpecsState,
  activePageState,
  notAResearcherState,
} from "../../../store/ProjectAtoms";

import IntellectualPoints from "../IntellectualPoints/IntellectualPoints";
import ExperimentPoints from "../ExperimentPoints/ExperimentPoints";
import AddInstructor from "../AddInstructor/AddInstructor";
import OneCademy from "../OneCademy/OneCademy";
import FreeRecallGrading from "../FreeRecallGrading/FreeRecallGrading";

import favicon from "../../../assets/favicon.png";

import "./Activities.css";

const Activities = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  const projects = useRecoilValue(projectsState);
  const projectSpecs = useRecoilValue(projectSpecsState)
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
        console.log('researchersSnapshot');
      });
      console.log('researchersSnapshot useEffect');
      return () => {
        setResearchers([]);
        researchersSnapshot();
      };
    }
  }, [project, fullname]);

  useEffect(() => {
    if (researchersChanges.length > 0) {
      const tempResearchersChanges = [...researchersChanges];
      setResearchersChanges([]);
      let resears = [...researchers];
      for (let change of tempResearchersChanges) {
        if (change.type === "removed") {
          resears = resears.filter((resear) => resear.id !== change.doc.id);
        } else {
          const researData = change.doc.data();
          if (
            project in researData.projects &&
            researData.projects[project].active
          ) {
            const projectData = researData.projects[project];
            let totalPoints = 0;
            let expPoints = 0;
            let onePoints = 0;
            let intellectualPoints = 0;
            let instructorsPoints = 0;
            let commentsPoints = 0;
            let gradingPoints = 0;
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
            if (projectData.gradingPoints) {
              totalPoints += projectData.gradingPoints;
              gradingPoints += projectData.gradingPoints;
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
                resears[reIdx].gradingPoints = gradingPoints;
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
                gradingPoints,
              });
            }
          }
        }
      }
      resears.sort((a, b) => b.totalPoints - a.totalPoints);
      setResearchers(resears);
      console.log('researchersChanges useEffect');
    }
  }, [project, researchers, researchersChanges]);

  const expandLeaderboard = (event) => {
    setExpanded(!expanded);
  };

  const isResearcherCriteriaMet = (resear) => {
    let met = true;
    for (let key in projectSpecs) {
      if((resear[key] || 0) < projectSpecs[key]) {
        met = false;
        break;
      }
    }
    return met;
  }

  const makeResearcherChipContent = (resear) => {
    const content = []

    if(projectSpecs.onePoints) {
      console.log('projectSpecs.onePoints');
      content.push(
        <>
          <img src={favicon} width="15.1" alt="1CAdemy" />{" "}
          <span
            className={
              resear.onePoints >= projectSpecs.onePoints ? "GreenText" : ""
            }
          >
            {formatPoints(resear.onePoints)}
          </span>
        </>
      )
    }

    if(projectSpecs.intellectualPoints) {
      console.log('projectSpecs.intellectualPoints');
       content.push(
        <span
          className={
            resear.intellectualPoints >= projectSpecs.intellectualPoints
              ? "GreenText"
              : ""
          }
        >
          {"🎓 " + formatPoints(resear.intellectualPoints)}
        </span>
      )
    }

    if(projectSpecs.instructorsPoints) {
      console.log('projectSpecs.instructorsPoints');
      content.push(
        <span
          className={
            resear.instructorsPoints >= 100
              ? "GreenText"
              : ""
          }
        >
          {"👨‍🏫 " + formatPoints(resear.instructorsPoints)}
        </span>
      )
    }

    if(projectSpecs.expPoints) {
      content.push(
        <span
          className={
            resear.expPoints >= projectSpecs.expPoints ? "GreenText" : ""
          }
        >
          {"👨‍🔬 " + formatPoints(resear.expPoints)}
        </span>
      )
    }

    if(projectSpecs.commentsPoints) {
      content.push(
        <span
          className={
            resear.commentsPoints >= projectSpecs.commentsPoints
              ? "GreenText"
              : ""
          }
        >
          {"💬 " + formatPoints(resear.commentsPoints)}
        </span>
      )
    }

    if(projectSpecs.gradingPoints) {
      content.push (
        <span
          className={
            resear.gradingPoints >= projectSpecs.gradingPoints
              ? "GreenText"
              : ""
          }
        >
          {"🧠 " + formatPoints(resear.gradingPoints)}
        </span>
      )
    }

    console.log('makeResearcherChipContent', makeResearcherChipContent);
    return content.map((item, index) => {
      // if not last one append a " - "
      return  content.length - 1 !== index 
      ? (
        <>
          {item}
          {" - "}
        </>
      )
      : item;
    });
  }

  const formatPoints = (point = 0) => {
    return point.toFixed(2).replace(/\.0+$/,'')
  }

  // console.log('researchers', { researchers });
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
              <div>
                <strong>Inclusion:</strong> To be an author,{" "}
                <span className="GreenText">in green</span>, one needs to earn
                at least:
                <ul>
                  {projectSpecs.onePoints && (
                    <li>
                      <strong>{projectSpecs.onePoints}</strong> 1Cademy points{" "}
                      <img src={favicon} width="15.1" /> and{" "}
                    </li>
                  )}
                  {projectSpecs.intellectualPoints && (
                    <li>
                      <strong>{projectSpecs.intellectualPoints}</strong> Intellectual points 🎓 and
                    </li>
                  )}
                  {projectSpecs.expPoints && (
                    <li>
                      <strong>{projectSpecs.expPoints}</strong> Experiment points 👨‍🔬 and
                    </li>
                  )}
                  {projectSpecs.instructorsPoints && (
                    <li>
                      <strong>{projectSpecs.instructorsPoints}</strong> Collecting instructor/administrator
                      contact points 👨‍🏫 and
                    </li>
                  )}
                  {projectSpecs.commentsPoints && (
                    <li>
                      <strong>{projectSpecs.commentsPoints}</strong> Coding participants' comments points 💬
                      and
                    </li>
                  )}
                  {projectSpecs.gradingPoints && (
                    <li>
                      <strong>{projectSpecs.gradingPoints}</strong> Coding participants' recall responses
                      points 🧠
                    </li>
                  )}
                </ul>
                <strong>Order:</strong> The intern with higher total of all the
                above categories gets a higher position.
              </div>
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
                          isResearcherCriteriaMet(resear) ? (
                            <span className="ChipContent">😊</span>
                          ) : (
                            <span className="ChipContent">😔</span>
                          )
                        }
                        variant={resear.id === fullname ? "" : "outlined"}
                        color={ isResearcherCriteriaMet(resear) ? "success" : "error" }
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
          ) : activePage === "FreeRecallGrading" ? (
            <FreeRecallGrading />
          ) : (
            <IntellectualPoints />
          )}
        </>
      )}
    </div>
  );
};

export default Activities;
