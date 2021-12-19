import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { useNavigate, Outlet } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import {
  firebaseState,
  emailState,
  fullnameState,
  isAdminState,
} from "../../store/AuthAtoms";

import {
  firebaseOnecademyState,
  usernameState,
  proposalUpvotesTodayState,
} from "../../store/OneCademyAtoms";

import {
  projectState,
  projectsState,
  activePageState,
  notAResearcherState,
  notTakenSessionsState,
  notTakenSessionsLoadedState,
  upVotedTodayState,
  instructorsTodayState,
  upvotedInstructorsTodayState,
} from "../../store/ProjectAtoms";

import { getTypedCollections } from "./getTypedCollections";
import { isToday } from "../../utils/DateFunctions";

import UMSI_Logo_Dark from "../../assets/u-m_logo-hex-withoutline.png";
import GCloud_Logo from "../../assets/GCloud_Logo.png";
import favicon from "../../assets/favicon.png";

import "./RouterNav.css";

const goToUMSI = (event) => {
  window.open("https://www.si.umich.edu/", "_blank");
};

const goToGCloud = (event) => {
  window.open("https://cloud.google.com/edu/researchers", "_blank");
};

const RouterNav = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const firebaseOnecademy = useRecoilValue(firebaseOnecademyState);
  const [username, setUsername] = useRecoilState(usernameState);
  const [email, setEmail] = useRecoilState(emailState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [isAdmin, setIsAdmin] = useRecoilState(isAdminState);
  const [projects, setProjects] = useRecoilState(projectsState);
  const [project, setProject] = useRecoilState(projectState);
  const activePage = useRecoilValue(activePageState);
  const [notAResearcher, setNotAResearcher] =
    useRecoilState(notAResearcherState);
  const [notTakenSessions, setNotTakenSessions] = useRecoilState(
    notTakenSessionsState
  );
  const [notTakenSessionsLoaded, setNotTakenSessionsLoaded] = useRecoilState(
    notTakenSessionsLoadedState
  );
  const [upVotedToday, setUpVotedToday] = useRecoilState(upVotedTodayState);
  const [instructorsToday, setInstructorsToday] = useRecoilState(
    instructorsTodayState
  );
  const [upvotedInstructorsToday, setUpvotedInstructorsToday] = useRecoilState(
    upvotedInstructorsTodayState
  );
  const [proposalUpvotesToday, setProposalUpvotesToday] = useRecoilState(
    proposalUpvotesTodayState
  );

  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [projectIndex, setProjectIndex] = useState(0);
  const [projectMenuOpen, setProjectMenuOpen] = useState(null);
  const isProjectMenuOpen = Boolean(projectMenuOpen);
  const [intellectualPoints, setIntellectualPoints] = useState(0);
  const [upVotedDays, setUpVotedDays] = useState(0);
  const [expPoints, setExpPoints] = useState(0);
  const [instructorPoints, setInstructorPoints] = useState(0);
  const [notTakenSessionsChanges, setNotTakenSessionsChanges] = useState([]);
  const [notTakenSessionsNum, setNotTakenSessionsNum] = useState(0);
  const [proposalsChanges, setProposalsChanges] = useState([]);
  const [proposals, setProposals] = useState({});
  const [all1CademyPoints, setAll1CademyPoints] = useState({});
  const [proposalsLoaded, setProposalsLoaded] = useState(false);
  const [userVersionsChanges, setUserVersionsChanges] = useState([]);
  const [oneCademyPoints, setOneCademyPoints] = useState(0);

  useEffect(() => {
    const checkResearcher = async () => {
      const researcherDoc = await firebase.db
        .collection("researchers")
        .doc(fullname)
        .get();
      if (researcherDoc.exists) {
        const myProjects = [];
        const researcherData = researcherDoc.data();
        for (let pr in researcherData.projects) {
          myProjects.push(pr);
        }
        setProjects(myProjects);
        setProject(myProjects[0]);
        if (researcherData.isAdmin) {
          setIsAdmin(true);
        }
        setNotAResearcher(false);
      } else {
        setNotAResearcher(true);
      }
      const notTakenSessionsQuery = firebase.db.collection("notTakenSessions");
      const notTakenSessionsSnapshot = notTakenSessionsQuery.onSnapshot(
        (snapshot) => {
          const docChanges = snapshot.docChanges();
          setNotTakenSessionsChanges(docChanges);
          setNotTakenSessionsLoaded(true);
        }
      );
      return () => {
        setNotTakenSessionsChanges([]);
        setNotTakenSessions([]);
        setNotTakenSessionsNum(0);
        notTakenSessionsSnapshot();
      };
    };
    if (firebase && fullname) {
      return checkResearcher();
    }
  }, [firebase, fullname]);

  useEffect(() => {
    if (firebase && fullname && project) {
      const researcherQuery = firebase.db
        .collection("researchers")
        .doc(fullname);
      const researcherSnapshot = researcherQuery.onSnapshot(function (doc) {
        const researcherData = doc.data();
        const theProject = researcherData.projects[project];
        if (theProject.points) {
          setIntellectualPoints(theProject.points);
        } else {
          setIntellectualPoints(0);
        }
        if (theProject.dayUpVotePoints) {
          setUpVotedDays(theProject.dayUpVotePoints);
        } else {
          setUpVotedDays(0);
        }
        if (theProject.expPoints) {
          setExpPoints(theProject.expPoints);
        } else {
          setExpPoints(0);
        }
        if (theProject.instructors) {
          setInstructorPoints(theProject.instructors);
        } else {
          setInstructorPoints(0);
        }
      });
      return () => {
        setIntellectualPoints(0);
        setUpVotedDays(0);
        setExpPoints(0);
        setInstructorPoints(0);
        researcherSnapshot();
      };
    }
  }, [firebase, fullname, project]);

  useEffect(() => {
    if (notTakenSessionsChanges.length > 0) {
      let nTSessions = [...notTakenSessions];
      let nTSessionsNum = notTakenSessionsNum;
      for (let change of notTakenSessionsChanges) {
        if (change.type === "removed") {
          nTSessions = nTSessions.filter((eSe) => eSe.id !== change.doc.id);
          nTSessionsNum -= 1;
        } else {
          nTSessions.push(change.doc.data());
          nTSessionsNum += 1;
        }
      }
      setNotTakenSessionsChanges([]);
      setNotTakenSessions(nTSessions);
      setNotTakenSessionsNum(nTSessionsNum);
    }
  }, [
    firebase,
    notTakenSessionsChanges,
    notTakenSessions,
    notTakenSessionsNum,
  ]);

  useEffect(() => {
    return firebaseOnecademy.auth.onAuthStateChanged(async (user) => {
      if (user) {
        const uid = user.uid;
        const userDocs = await firebaseOnecademy.db
          .collection("users")
          .where("userId", "==", uid)
          .get();
        if (userDocs.docs.length > 0) {
          // Sign in and signed up:
          console.log("Signing in!");
          setUsername(userDocs.docs[0].id);
        } else {
          console.log("User not found!");
          setUsername("");
        }
      } else {
        console.log("Signing out!");
        setUsername("");
      }
    });
  }, [firebaseOnecademy, email]);

  useEffect(() => {
    if (firebaseOnecademy && username) {
      const versionsSnapshots = [];
      const nodeTypes = ["Concept", "Relation", "Reference", "Idea"];
      let nodeTypeIdx = 0;
      let nodeType;
      const nodeTypesInterval = setInterval(() => {
        nodeType = nodeTypes[nodeTypeIdx];
        const { versionsColl } = getTypedCollections(
          firebaseOnecademy.db,
          nodeType
        );
        const versionsQuery = versionsColl.where("tags", "array-contains", {
          node: "WgF7yr5q7tJc54apVQSr",
          title: "Knowledge Visualization",
        });
        versionsSnapshots.push(
          versionsQuery.onSnapshot((snapshot) => {
            setProposalsChanges(snapshot.docChanges());
          })
        );
        nodeTypeIdx += 1;
        if (nodeTypeIdx === nodeTypes.length) {
          clearInterval(nodeTypesInterval);
        }
      }, 400);
      return () => {
        setProposalsChanges([]);
        for (let vSnapshot of versionsSnapshots) {
          vSnapshot();
        }
      };
    }
  }, [firebaseOnecademy, username]);

  useEffect(() => {
    if (proposalsChanges.length > 0) {
      let propos = { ...proposals };
      let netVotes = { ...all1CademyPoints };
      for (let change of proposalsChanges) {
        const proposalData = change.doc.data();
        if (proposalData.proposer in propos) {
          const propIdx = propos[proposalData.proposer].findIndex(
            (pr) => pr.id === change.doc.id
          );
          if (change.type === "removed" || proposalData.deleted) {
            if (propIdx !== -1) {
              propos[proposalData.proposer] = propos[
                proposalData.proposer
              ].filter((pr) => pr.id !== change.doc.id);
              netVotes[proposalData.proposer] -=
                proposalData.corrects - proposalData.wrongs - 1;
            }
          } else {
            if (propIdx === -1) {
              propos[proposalData.proposer] = [
                ...propos[proposalData.proposer],
              ];
              propos[proposalData.proposer].push({
                id: change.doc.id,
                corrects: proposalData.corrects,
                wrongs: proposalData.wrongs,
              });
              netVotes[proposalData.proposer] +=
                proposalData.corrects - proposalData.wrongs - 1;
            } else {
              netVotes[proposalData.proposer] +=
                proposalData.corrects -
                propos[proposalData.proposer][propIdx].corrects -
                (proposalData.wrongs -
                  propos[proposalData.proposer][propIdx].wrongs);
              propos[proposalData.proposer] = [
                ...propos[proposalData.proposer],
              ];
              propos[proposalData.proposer][propIdx] = {
                ...propos[proposalData.proposer][propIdx],
                corrects: proposalData.corrects,
                wrongs: proposalData.wrongs,
              };
            }
          }
        } else if (change.type !== "removed" && !proposalData.deleted) {
          propos[proposalData.proposer] = [
            {
              id: change.doc.id,
              corrects: proposalData.corrects,
              wrongs: proposalData.wrongs,
            },
          ];
          netVotes[proposalData.proposer] =
            proposalData.corrects - proposalData.wrongs - 1;
        }
      }
      setProposalsChanges([]);
      setProposals(propos);
      setAll1CademyPoints(netVotes);
      setProposalsLoaded(true);
    }
  }, [
    proposalsChanges,
    proposals,
    all1CademyPoints,
    username,
  ]);

  useEffect(() => {
    if (firebaseOnecademy && username && proposalsLoaded) {
      const versionsSnapshots = [];
      const nodeTypes = ["Concept", "Relation", "Reference", "Idea"];
      let nodeTypeIdx = 0;
      let nodeType;
      const nodeTypesInterval = setInterval(() => {
        nodeType = nodeTypes[nodeTypeIdx];
        const { userVersionsColl } = getTypedCollections(
          firebaseOnecademy.db,
          nodeType
        );
        const userVersionsQuery = userVersionsColl.where(
          "user",
          "==",
          username
        );
        userVersionsSnapshots.push(
          userVersionsQuery.onSnapshot((snapshot) => {
            setProposalsChanges(snapshot.docChanges());
          })
        );
        nodeTypeIdx += 1;
        if (nodeTypeIdx === nodeTypes.length) {
          clearInterval(nodeTypesInterval);
        }
      }, 400);
      return () => {
        setProposalsChanges([]);
        for (let vSnapshot of userVersionsSnapshots) {
          vSnapshot();
        }
      };
    }
  }, [firebaseOnecademy, username, proposalsLoaded]);

  useEffect(() => {
    const setProposalsVotes = async () => {
      const researcherRef = firebase.db.collection("researchers").doc(fullname);
      const researcherDoc = await researcherRef.get();
      const researcherData = researcherDoc.data();
      await researcherRef.update({
        projects: {
          ...researcherData.projects,
          [project]: {
            ...researcherData.projects[project],
            onePoints: all1CademyPoints[username],
          },
        },
      });
    };
    if (username in all1CademyPoints) {
      setProposalsVotes();
    }
  }, [
    all1CademyPoints,
    username,
    firebase,
    fullname,
    project,
  ]);

  const signOut = async (event) => {
    setEmail("");
    setUsername("");
    setFullname("");
    setIsAdmin(false);
    setProjects([]);
    setProject("");
    setNotAResearcher(true);
    setNotTakenSessions([]);
    setNotTakenSessionsLoaded(false);
    setUpVotedToday(0);
    setInstructorsToday(0);
    setUpvotedInstructorsToday(0);
    setProposalUpvotesToday(0);
    setUpVotedDays(0);
    setIntellectualPoints(0);
    setOneCademyPoints(0);
    setExpPoints(0);
    setInstructorPoints(0);
    setNotTakenSessionsChanges([]);
    setNotTakenSessionsNum(0);
    setProposalsChanges([]);
    setProposals({});
    setAll1CademyPoints({});
    await firebase.logout();
  };

  const changeProject = (event, index) => {
    setProject(projects[index]);
    setProjectIndex(index);
    setProjectMenuOpen(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };

  const handleProjectMenuOpen = (event) => {
    setProjectMenuOpen(event.currentTarget);
  };

  const handleProjectMenuClose = () => {
    setProjectMenuOpen(null);
  };

  const renderProjectsMenu = (
    <Menu
      id="ProjectsMenu"
      anchorEl={projectMenuOpen}
      open={isProjectMenuOpen}
      onClose={handleProjectMenuClose}
    >
      {projects.map((proj, index) => (
        <MenuItem
          key={`${proj}MenuItem`}
          selected={index === projectIndex}
          onClick={(event) => changeProject(event, index)}
        >
          {proj}
        </MenuItem>
      ))}
    </Menu>
  );

  const renderProfileMenu = (
    <Menu
      id="ProfileMenu"
      anchorEl={profileMenuOpen}
      open={isProfileMenuOpen}
      onClose={handleProfileMenuClose}
    >
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }}>{fullname}</MenuItem>
      )}
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
          <LogoutIcon /> <span id="LogoutText">Logout</span>
        </MenuItem>
      )}
    </Menu>
  );

  const navigate = useNavigate();

  return (
    <>
      {!props.duringAnExperiment && (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Tooltip title="University of Michigan - School of Information sponsors this research project.">
                <IconButton
                  id="UMICH_Logo"
                  size="large"
                  edge="start"
                  sx={{ mr: 4 }}
                  onClick={goToUMSI}
                >
                  <img
                    src={UMSI_Logo_Dark}
                    alt="University of Michigan, School of Information Logo"
                    width="43px"
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Google Cloud sponsors this research project.">
                <IconButton
                  size="large"
                  edge="start"
                  sx={{ mr: 4 }}
                  onClick={goToGCloud}
                >
                  <div id="GCloud_Logo">
                    <img
                      src={GCloud_Logo}
                      alt="Google Cloud Logo"
                      width="49px"
                    />
                  </div>
                </IconButton>
              </Tooltip>
              <Box sx={{ flexGrow: 1 }} />
              {projects.length > 0 && (
                <>
                  <Tooltip
                    title={
                      <div>
                        <div>
                          You've earned {expPoints} points from running
                          experiments.
                        </div>
                        <div>
                          There are {notTakenSessionsNum} experiment sessions
                          available to take.
                        </div>
                      </div>
                    }
                  >
                    <Button
                      id="ExperimentPoints"
                      className={
                        activePage === "Experiments"
                          ? "ActiveNavLink"
                          : "NavLink"
                      }
                      onClick={(event) => navigate("/Activities/Experiments")}
                    >
                      <div>
                        <span id="ExpPointsLabel">👨‍🔬 {expPoints}</span>
                        <br />
                        <span className="YellowLabel">New</span>{" "}
                        {notTakenSessionsNum}
                      </div>
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={
                      <div>
                        <div>
                          You've earned {intellectualPoints} 1Cademy points from
                          others' votes and {upVotedDays} points for casting 25
                          upvotes per day on others' proposals.
                        </div>
                        <div>
                          You cast {upVotedToday} / 25 up-votes today on others'
                          1Cademy proposals.
                        </div>
                      </div>
                    }
                  >
                    <Button
                      id="OneCademyPoints"
                      className={
                        activePage === "1Cademy" ? "ActiveNavLink" : "NavLink"
                      }
                      onClick={(event) => navigate("/Activities/1Cademy")}
                    >
                      {username ? (
                        <div>
                          <img src={favicon} width="15.1" />{" "}
                          {username && username in all1CademyPoints
                            ? all1CademyPoints[username]
                            : 0}
                          <br />✅ {upVotedDays}
                          <br />
                          <span>🌞 {upVotedToday} / 25</span>
                        </div>
                      ) : (
                        <div>
                          Click here to log <br />
                          in to 1Cademy to <br />
                          show your points.
                        </div>
                      )}
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={
                      <div>
                        <div>
                          You've earned {intellectualPoints} intellectual points
                          from others' votes and {upVotedDays} points for
                          casting 25 upvotes per day on others' activities.
                        </div>
                        <div>
                          You cast {upVotedToday} / 25 up-votes today on others'
                          activities.
                        </div>
                      </div>
                    }
                  >
                    <Button
                      id="IntellectualPoints"
                      className={
                        activePage === "Intellectual"
                          ? "ActiveNavLink"
                          : "NavLink"
                      }
                      onClick={(event) => navigate("/Activities/Intellectual")}
                    >
                      <div>
                        <span>
                          🎓 {intellectualPoints}
                          <br />✅ {upVotedDays}
                        </span>
                        <br />
                        <span>🌞 {upVotedToday} / 25</span>
                      </div>
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={
                      <div>
                        <div>
                          You've earned {instructorPoints} points for collecting
                          instructors/administrators' contact.
                        </div>
                        <div>
                          You collected {instructorsToday} / 10
                          instructors/administrators' info today.
                        </div>
                        <div>
                          You cast {upvotedInstructorsToday} / 25 up-votes today
                          on others' collected instructors/administrators' data.
                        </div>
                      </div>
                    }
                  >
                    <Button
                      id="InstructorPoints"
                      className={
                        activePage === "AddInstructor"
                          ? "ActiveNavLink"
                          : "NavLink"
                      }
                      onClick={(event) => navigate("/Activities/AddInstructor")}
                    >
                      🧑‍🏫 {instructorPoints} <br /> 🌞 {instructorsToday} / 10
                      <br /> ✅ {upvotedInstructorsToday} / 25
                    </Button>
                  </Tooltip>
                  <Box sx={{ minWidth: "130px", textAlign: "center" }}>
                    <div id="ProjectLabel">Project</div>
                    <Tooltip title="Current Project">
                      <Button
                        size="large"
                        edge="end"
                        aria-haspopup="true"
                        id="ProjectSelector"
                        aria-controls="lock-menu"
                        aria-label="Current Project"
                        aria-expanded={isProjectMenuOpen ? "true" : undefined}
                        onClick={handleProjectMenuOpen}
                      >
                        {project} <ArrowDropDownIcon />
                      </Button>
                    </Tooltip>
                  </Box>
                </>
              )}
              <Box>
                {/* {fullname}{" "} */}
                <Tooltip title="Account">
                  <IconButton
                    size="large"
                    edge="end"
                    aria-haspopup="true"
                    aria-controls="lock-menu"
                    aria-label={`${fullname}'s Account`}
                    aria-expanded={isProfileMenuOpen ? "true" : undefined}
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>
          {projects.length > 0 && renderProjectsMenu}
          {renderProfileMenu}
        </Box>
      )}
      <Outlet />
    </>
  );
};

export default RouterNav;
