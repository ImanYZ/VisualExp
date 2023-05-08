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
import RecallForIman from "../FreeRecallGrading/RecallForIman";
import { SchemaGeneration } from "../SchemaGeneration";
import ManageEvents from "../ManageEvents/ManageEvents";
import ExperimentPoints from "../ExperimentPoints/ExperimentPoints";
import AddInstructor from "../AddInstructor/AddInstructor";
import AddAdministrator from "../AddAdministrator/AddAdministrator";
import OneCademy from "../OneCademy/OneCademy";
import FreeRecallGrading from "../FreeRecallGrading/FreeRecallGrading";
import CodeFeedback from "../CodeFeedback/CodeFeedback";
import { LeaderBoard, ProjectPointThresholds } from "./components";
import { formatPoints } from "../../../utils";
import ResearcherPassage from "../Passage-Research/ResearcherPassage";
import RouterNav from "../../RouterNav/RouterNav";
import favicon from "../../../assets/favicon.png";

import "./Activities.css";
const ShowLeaderBoardForAdmin = ["1Cademy", "AddInstructor", "AddAdministrator", "FreeRecallGrading"];

const AdminAccessPages = [
  { page: "Intellectual", view: <ExpenseReports /> },
  { page: "Experiments", view: <ManageEvents /> },
  { page: "RecallForIman", view: <RecallForIman /> }
];

const CommonPages = [
  { page: "Intellectual", view: <IntellectualPoints /> },
  { page: "Experiments", view: <ExperimentPoints /> },
  { page: "AddInstructor", view: <AddInstructor /> },
  { page: "AddAdministrator", view: <AddAdministrator /> },
  { page: "1Cademy", view: <OneCademy /> },
  { page: "FreeRecallGrading", view: <FreeRecallGrading /> },
  { page: "CodeFeedback", view: <CodeFeedback /> },
  { page: "ResearcherPassage", view: <ResearcherPassage /> },
  { page: "SchemaGenerationTool", view: <SchemaGeneration /> },
];

const Activities = props => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);
  const isAdmin = useRecoilValue(isAdminState);
  const project = useRecoilValue(projectState);
  const projects = useRecoilValue(projectsState);
  const [activePage, setActivePage] = useRecoilState(activePageState);
  const notAResearcher = useRecoilValue(notAResearcherState);
  const projectSpecs = useRecoilValue(projectSpecsState);
  const projectPoints = projectSpecs?.points || {};

  const [researchers, setResearchers] = useState([]);
  const [researchersChanges, setResearchersChanges] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [onGoingEvents, setOnGoingEvents] = useState([]);

  useEffect(() => {
    const getOngoingResearcherEvent = async () => {
      try {
        const response = await axios.post("/getOngoingResearcherEvent", { email });
        if (response.status === 200) {
          setOnGoingEvents(response.data);
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
      });
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
            let dayUpVotePoints = 0;
            let instructorsPoints = 0;
            let dayInstructorUpVotes = 0;
            let administratorsPoints = 0;
            let dayAdministratorUpVotes = 0;
            let commentsPoints = 0;
            let gradingPoints = 0;
            let booleanExpPionts = 0;
            if (projectData.expPoints) {
              totalPoints += projectData.expPoints;
              expPoints = projectData.expPoints;
            }
            if (projectData.onePoints) {
              totalPoints += Math.round((projectData.onePoints + Number.EPSILON) * 100) / 100;
              onePoints += Math.round((projectData.onePoints + Number.EPSILON) * 100) / 100;
            }
            if (projectData.dayOneUpVotePoints) {
              totalPoints += Math.round((projectData.dayOneUpVotePoints + Number.EPSILON) * 100) / 100;
              onePoints += Math.round((projectData.dayOneUpVotePoints + Number.EPSILON) * 100) / 100;
            }
            if (projectData.points) {
              totalPoints += projectData.points;
              intellectualPoints += projectData.points;
            }
            if (projectData.dayUpVotePoints) {
              totalPoints += projectData.dayUpVotePoints;
              if (projectPoints.dayUpVotePoints) {
                dayUpVotePoints += projectData.dayUpVotePoints;
              } else {
                intellectualPoints += projectData.dayUpVotePoints;
              }
            }
            if (projectData.instructors) {
              totalPoints += projectData.instructors;
              instructorsPoints += projectData.instructors;
            }
            if (projectData.dayInstructorUpVotes) {
              totalPoints += projectData.dayInstructorUpVotes;
              if (projectPoints.dayInstructorUpVotes) {
                dayInstructorUpVotes += projectData.dayInstructorUpVotes;
              } else {
                instructorsPoints += projectData.dayInstructorUpVotes;
              }
            }
            if (projectData.administrators) {
              totalPoints += projectData.administrators;
              administratorsPoints += projectData.administrators;
            }
            if (projectData.dayAdministratorUpVotes) {
              totalPoints += projectData.dayAdministratorUpVotes;
              if (projectPoints.dayAdministratorUpVotes) {
                dayAdministratorUpVotes += projectData.dayAdministratorUpVotes;
              } else {
                administratorsPoints += projectData.dayAdministratorUpVotes;
              }
            }
            if (projectData.gradingPoints) {
              totalPoints += projectData.gradingPoints;
              gradingPoints += projectData.gradingPoints;
            }
            if (projectData.positiveCodingPoints) {
              totalPoints += projectData.positiveCodingPoints;
              commentsPoints += projectData.positiveCodingPoints;
            }
            if (projectData.positiveBooleanExpPionts) {
              totalPoints += projectData.positiveBooleanExpPionts;
              booleanExpPionts += projectData.positiveCodingPoints;
            }
            let foundResear = false;
            for (let reIdx = 0; reIdx < resears.length; reIdx++) {
              if (resears[reIdx].id === change.doc.id) {
                resears[reIdx].totalPoints = totalPoints;
                resears[reIdx].expPoints = expPoints;
                resears[reIdx].onePoints = onePoints;
                resears[reIdx].intellectualPoints = intellectualPoints;
                resears[reIdx].dayUpVotePoints = dayUpVotePoints;
                resears[reIdx].instructorsPoints = instructorsPoints;
                resears[reIdx].dayInstructorUpVotes = dayInstructorUpVotes;
                resears[reIdx].administratorsPoints = administratorsPoints;
                resears[reIdx].dayAdministratorUpVotes = dayAdministratorUpVotes;
                resears[reIdx].commentsPoints = commentsPoints;
                resears[reIdx].gradingPoints = gradingPoints;
                resears[reIdx].booleanExpPionts = booleanExpPionts;
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
                dayUpVotePoints,
                instructorsPoints,
                dayInstructorUpVotes,
                administratorsPoints,
                dayAdministratorUpVotes,
                commentsPoints,
                gradingPoints
              });
            }
          }
        }
      }
      resears.sort((a, b) => b.totalPoints - a.totalPoints);
      setResearchers(resears);
    }
  }, [project, researchers, researchersChanges]);

  const expandLeaderboard = event => {
    setExpanded(!expanded);
  };

  const isResearcherCriteriaMet = resear => {
    let met = true;
    for (let key in projectPoints) {
      if (key === "instructorsPoints") {
        if ((resear.dayInstructorUpVotes || 0) + resear.instructorsPoints < projectPoints.instructorsPoints) {
          met = false;
          break;
        }
      } else {
        if ((resear[key] || 0) < projectPoints[key]) {
          met = false;
          break;
        }
      }
    }
    return met;
  };

  const makeResearcherChipContent = resear => {
    const content = [];
    if (projectPoints.onePoints) {
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
      content.push(
        <span className={resear.intellectualPoints >= projectPoints.intellectualPoints ? "GreenText" : ""}>
          {"🎓 " + formatPoints(resear.intellectualPoints)}
        </span>
      );
    }

    if (projectPoints.dayUpVotePoints) {
      content.push(
        <span className={resear.dayUpVotePoints >= projectPoints.dayUpVotePoints ? "GreenText" : ""}>
          {"🎓 ✅ " + formatPoints(resear.dayUpVotePoints)}
        </span>
      );
    }

    if (projectPoints.instructorsPoints && !projectPoints.dayInstructorUpVotes) {
      content.push(
        <span
          className={
            resear.dayInstructorUpVotes + resear.instructorsPoints >= projectPoints.instructorsPoints ? "GreenText" : ""
          }
        >
          {"👨‍🏫 " + formatPoints(resear.dayInstructorUpVotes + resear.instructorsPoints)}
        </span>
      );
    }

    if (projectPoints.dayInstructorUpVotes) {
      if (projectPoints.instructorsPoints) {
        content.push(
          <span className={resear.instructorsPoints >= projectPoints.instructorsPoints ? "GreenText" : ""}>
            {"👨‍🏫 " + formatPoints(resear.instructorsPoints)}
          </span>
        );
      }
      content.push(
        <span className={resear.dayInstructorUpVotes >= projectPoints.dayInstructorUpVotes ? "GreenText" : ""}>
          {"👨‍🏫 ✅ " + formatPoints(resear.dayInstructorUpVotes)}
        </span>
      );
    }

    if (projectPoints.administratorsPoints) {
      content.push(
        <span className={resear.administratorsPoints >= projectPoints.administratorsPoints ? "GreenText" : ""}>
          {"💼 " + formatPoints(resear.administratorsPoints)}
        </span>
      );
    }

    if (projectPoints.dayAdministratorUpVotes) {
      content.push(
        <span className={resear.dayAdministratorUpVotes >= projectPoints.dayAdministratorUpVotes ? "GreenText" : ""}>
          {"💼 ✅ " + formatPoints(resear.dayAdministratorUpVotes)}
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

    if (projectPoints.gradingPoints) {
      content.push(
        <span className={resear.gradingPoints >= projectPoints.gradingPoints ? "GreenText" : ""}>
          {"🧠 " + formatPoints(resear.gradingPoints)}
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
    if (props.hideLeaderBoard) return false;
    return true;
  })();

  if (notAResearcher) {
    return (
      <>
        <RouterNav />
        <h1>You're not a researcher on {projects.length > 0 ? `the project ${project}!` : "any project!"}</h1>
      </>
    );
  }

  return (
    <>
      <RouterNav />
      <div
        id="ActivitiesContainer"
        style={{
          position: activePage === "SchemaGenerationTool" && "fixed",
          margin: activePage === "SchemaGenerationTool" && 0
        }}
      >
        {showLeaderBoard && project !== "Autograding" && (
          <div className="Columns40_60">
            <Alert severity="warning">
              <ProjectPointThresholds projectPoints={projectPoints} />
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
              onGoingEvents={onGoingEvents}
              setOnGoingEvents={setOnGoingEvents}
            />
          </div>
        )}
        {currentPage}
      </div>
    </>
  );
};

export default Activities;
