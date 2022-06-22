import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

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
import { LeaderBoard, ProjectSpecs } from "./components";
import { formatPoints } from "../../../utils/utils";

import favicon from "../../../assets/favicon.png";

import "./Activities.css";

const Activities = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  const projects = useRecoilValue(projectsState);
  const projectSpecs = useRecoilValue(projectSpecsState);
  const [activePage, setActivePage] = useRecoilState(activePageState);
  const notAResearcher = useRecoilValue(notAResearcherState);

  const [researchers, setResearchers] = useState([]);
  const [researchersChanges, setResearchersChanges] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const projectPoints = projectSpecs?.points || {};

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
        console.log("researchersSnapshot");
      });
      console.log("researchersSnapshot useEffect");
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
      console.log("researchersChanges useEffect");
    }
  }, [project, researchers, researchersChanges]);

  const expandLeaderboard = (event) => {
    setExpanded(!expanded);
  };

  const isResearcherCriteriaMet = (resear) => {
    let met = true;
    for (let key in projectPoints) {
      if ((resear[key] || 0) < projectPoints[key]) {
        met = false;
        break;
      }
    }
    return met;
  };

  const makeResearcherChipContent = (resear) => {
    const content = [];

    if (projectPoints.onePoints) {
      console.log("projectPoints.onePoints");
      content.push(
        <>
          <img src={favicon} width="15.1" alt="1Cademy" />{" "}
          <span
            className={
              resear.onePoints >= projectPoints.onePoints ? "GreenText" : ""
            }
          >
            {formatPoints(resear.onePoints)}
          </span>
        </>
      );
    }

    if (projectPoints.intellectualPoints) {
      console.log("projectPoints.intellectualPoints");
      content.push(
        <span
          className={
            resear.intellectualPoints >= projectPoints.intellectualPoints
              ? "GreenText"
              : ""
          }
        >
          {"🎓 " + formatPoints(resear.intellectualPoints)}
        </span>
      );
    }

    if (projectPoints.instructorsPoints) {
      console.log("projectPoints.instructorsPoints");
      content.push(
        <span className={resear.instructorsPoints >= 100 ? "GreenText" : ""}>
          {"👨‍🏫 " + formatPoints(resear.instructorsPoints)}
        </span>
      );
    }

    if (projectPoints.expPoints) {
      content.push(
        <span
          className={
            resear.expPoints >= projectPoints.expPoints ? "GreenText" : ""
          }
        >
          {"👨‍🔬 " + formatPoints(resear.expPoints)}
        </span>
      );
    }

    if (projectPoints.commentsPoints) {
      content.push(
        <span
          className={
            resear.commentsPoints >= projectPoints.commentsPoints
              ? "GreenText"
              : ""
          }
        >
          {"💬 " + formatPoints(resear.commentsPoints)}
        </span>
      );
    }

    if (projectPoints.gradingPoints) {
      content.push(
        <span
          className={
            resear.gradingPoints >= projectPoints.gradingPoints
              ? "GreenText"
              : ""
          }
        >
          {"🧠 " + formatPoints(resear.gradingPoints)}
        </span>
      );
    }

    console.log("makeResearcherChipContent", makeResearcherChipContent);
    return content.map((item, index) => {
      // if not last one append a " - "
      return content.length - 1 !== index ? (
        <>
          {item}
          {" - "}
        </>
      ) : (
        item
      );
    });
  };

  const currentPage = (() => {
    if (activePage === "Intellectual") return <IntellectualPoints />;
    if (activePage === "Experiments") return <ExperimentPoints />;
    if (activePage === "AddInstructor") return <AddInstructor />;
    if (activePage === "1Cademy") return <OneCademy />;
    if (activePage === "FreeRecallGrading") return <FreeRecallGrading />;
    return null;
  })();

  if (notAResearcher) {
    return (
      <h1>
        You're not a researcher on{" "}
        {projects.length > 0 ? `the project ${project}!` : "any project!"}
      </h1>
    );
  }

  return (
    <div id="ActivitiesContainer">
      {notAResearcher ? (
        <h1>
          You're not a researcher on{" "}
          {projects.length > 0 ? `the project ${project}!` : "any project!"}
        </h1>
      ) : (
        <div className="Columns40_60">
          <Alert severity="warning">
            <ProjectSpecs projectSpecs={projectSpecs} />
            <Button
              onClick={expandLeaderboard}
              className={expanded ? "Button Red" : "Button Green"}
              variant="contained"
            >
              {expanded ? "Collapse" : "Expand"} leaderboard details
            </Button>
          </Alert>
          <LeaderBoard
            fullname={fullname}
            expanded={expanded}
            researchers={researchers}
            isResearcherCriteriaMet={isResearcherCriteriaMet}
            makeResearcherChipContent={makeResearcherChipContent}
          />
        </div>
      )}
      {currentPage}
    </div>
  );
};

export default Activities;
