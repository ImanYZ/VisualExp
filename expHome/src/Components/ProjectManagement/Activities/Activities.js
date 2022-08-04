import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import axios from "axios";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import { firebaseState, emailState, fullnameState, isAdminState } from "../../../store/AuthAtoms";
import {
  projectState,
  projectsState,
  projectSpecsState,
  activePageState,
  notAResearcherState
} from "../../../store/ProjectAtoms";

import IntellectualPoints from "../IntellectualPoints/IntellectualPoints";
import ExpenseReports from "../IntellectualPoints/ExpenseReports";
import ManageEvents from "../ManageEvents/ManageEvents";
import ExperimentPoints from "../ExperimentPoints/ExperimentPoints";
import AddInstructor from "../AddInstructor/AddInstructor";
import OneCademy from "../OneCademy/OneCademy";
import FreeRecallGrading from "../FreeRecallGrading/FreeRecallGrading";
import { LeaderBoard, ProjectPoints } from "./components";
import { formatPoints } from "../../../utils";

import favicon from "../../../assets/favicon.png";

import "./Activities.css";
const ShowLeaderBoardForAdmin = ["1Cademy", "AddInstructor", "FreeRecallGrading"];

const AdminAccessPages = [
  { page: "Intellectual", view: <ExpenseReports /> },
  { page: "Experiments", view: <ManageEvents /> }
];

const CommonPages = [
  { page: "Intellectual", view: <IntellectualPoints /> },
  { page: "Experiments", view: <ExperimentPoints /> },
  { page: "AddInstructor", view: <AddInstructor /> },
  { page: "1Cademy", view: <OneCademy /> },
  { page: "FreeRecallGrading", view: <FreeRecallGrading /> }
];

const Activities = props => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);
  const isAdmin = useRecoilValue(isAdminState);
  const project = useRecoilValue(projectState);
  const projects = useRecoilValue(projectsState);
  const projectSpecs = useRecoilValue(projectSpecsState);
  const [activePage, setActivePage] = useRecoilState(activePageState);
  const notAResearcher = useRecoilValue(notAResearcherState);

  const [researchers, setResearchers] = useState([]);
  const [researchersChanges, setResearchersChanges] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [onGoingEvent, setOngoingEvent] = useState(null);
  const [onGoingSchedule, setOnGoingSchedule] = useState(null);

  const projectPoints = projectSpecs?.points || {};

  useEffect(() => {
    const getOngoingResearcherEvent = async () => {
      try {
        const response = await axios.post("/getOngoingResearcherEvent", { email });
        if (response.status === 200) {
          setOngoingEvent(response.data.event);
          setOnGoingSchedule(response.data.schedule);
        }
      } catch (err) {
        console.log("Failed to load getOngoingResearcherEvent", err);
      }
    };

    if (firebase && email) {
      getOngoingResearcherEvent();
    }
  }, [firebase, email]);
  useEffect(() => {
    if (props.activityName && activePage !== props.activityName) {
      setActivePage(props.activityName);
    }
  }, [props.activityName, activePage]);

  useEffect(() => {
    if (project && fullname) {
      const researchersQuery = firebase.db.collection("researchers");
      const researchersSnapshot = researchersQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setResearchersChanges(oldResearchersChanges => {
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
          resears = resears.filter(resear => resear.id !== change.doc.id);
        } else {
          const researData = change.doc.data();
          if (project in (researData?.projects || {}) && researData?.projects?.[project]?.active) {
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
                gradingPoints
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

  const expandLeaderboard = event => {
    setExpanded(!expanded);
  };

  const isResearcherCriteriaMet = resear => {
    let met = true;
    for (let key in projectPoints) {
      if ((resear[key] || 0) < projectPoints[key]) {
        met = false;
        break;
      }
    }
    return met;
  };

  const makeResearcherChipContent = resear => {
    const content = [];

    if (projectPoints.onePoints) {
      console.log("projectPoints.onePoints");
      content.push(
        <>
          <img src={favicon} width="15.1" alt="1Cademy" />{" "}
          <span className={resear.onePoints >= projectPoints.onePoints ? "GreenText" : ""}>
            {formatPoints(resear.onePoints)}
          </span>
        </>
      );
    }

    if (projectPoints.intellectualPoints) {
      console.log("projectPoints.intellectualPoints");
      content.push(
        <span className={resear.intellectualPoints >= projectPoints.intellectualPoints ? "GreenText" : ""}>
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
        <span className={resear.expPoints >= projectPoints.expPoints ? "GreenText" : ""}>
          {"👨‍🔬 " + formatPoints(resear.expPoints)}
        </span>
      );
    }

    if (projectPoints.commentsPoints) {
      content.push(
        <span className={resear.commentsPoints >= projectPoints.commentsPoints ? "GreenText" : ""}>
          {"💬 " + formatPoints(resear.commentsPoints)}
        </span>
      );
    }

    if (projectPoints.gradingPoints) {
      content.push(
        <span className={resear.gradingPoints >= projectPoints.gradingPoints ? "GreenText" : ""}>
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
    const adminPageIndex = AdminAccessPages.findIndex(admin => admin.page === activePage);
    const commonPageIndex = CommonPages.findIndex(admin => admin.page === activePage);
    if (isAdmin && adminPageIndex >= 0) {
      return AdminAccessPages[adminPageIndex]?.view;
    } else if (commonPageIndex >= 0) {
      return CommonPages[commonPageIndex]?.view;
    }
    return null;
  })();

  const showLeaderBoard = (() => {
    if (isAdmin) return ShowLeaderBoardForAdmin.indexOf(activePage) > -1;
    return true;
  })();

  if (notAResearcher) {
    return <h1>You're not a researcher on {projects.length > 0 ? `the project ${project}!` : "any project!"}</h1>;
  }

  return (
    <div id="ActivitiesContainer">
      {showLeaderBoard && (
        <div className="Columns40_60">
          <Alert severity="warning">
            <ProjectPoints projectPoints={projectPoints} />
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
            onGoingEvent={onGoingEvent}
            setOnGoingSchedule={setOnGoingSchedule}
            onGoingSchedule={onGoingSchedule}
          />
        </div>
      )}
      {currentPage}
    </div>
  );
};

export default Activities;
