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
  fullnameState,
  isAdminState,
} from "../../store/AuthAtoms";

import {
  firebaseOneState,
  usernameState,
  emailOneState,
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
import { getISODateString } from "../../utils/DateFunctions";

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
  const firebaseOne = useRecoilValue(firebaseOneState);
  const [username, setUsername] = useRecoilState(usernameState);
  const [email, setEmail] = useRecoilState(emailOneState);
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

  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [projectIndex, setProjectIndex] = useState(0);
  const [projectMenuOpen, setProjectMenuOpen] = useState(null);
  const isProjectMenuOpen = Boolean(projectMenuOpen);
  const [intellectualPoints, setIntellectualPoints] = useState(0);
  const [upVotedDays, setUpVotedDays] = useState(0);
  const [expPoints, setExpPoints] = useState(0);
  const [instructorPoints, setInstructorPoints] = useState(0);
  const [dayInstructorUpVotes, setDayInstructorUpVotes] = useState(0);
  const [notTakenSessionsChanges, setNotTakenSessionsChanges] = useState([]);
  const [notTakenSessionsNum, setNotTakenSessionsNum] = useState(0);
  const [proposalsChanges, setProposalsChanges] = useState([]);
  const [proposals, setProposals] = useState({});
  const [othersProposals, setOthersProposals] = useState({});
  const [oneCademyPoints, setOneCademyPoints] = useState(0);
  const [proposalsLoaded, setProposalsLoaded] = useState(false);
  const [userVersionsChanges, setUserVersionsChanges] = useState([]);
  const [userVersions, setUserVersions] = useState({});
  const [oneCademyUpvotes, setOneCademyUpvotes] = useState({});
  const [proposalUpvotesToday, setProposalUpvotesToday] = useState(0);
  const [dayOneUpVotes, setDayOneUpVotes] = useState(0);
  const [gradingPoints, setGradingPoints] = useState(0);
  const [negativeGradingPoints, setNegativeGradingPoints] = useState(0);
  const [userVersionsLoaded, setUserVersionsLoaded] = useState(false);
  const [nodesChanges, setNodesChanges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [nodesLoaded, setNodesLoaded] = useState(false);
  const [userNodesChanges, setUserNodesChanges] = useState([]);
  const [userNodes, setUserNodes] = useState([]);

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
    };
    if (firebase && fullname) {
      checkResearcher();
    }
  }, [firebase, fullname]);

  useEffect(() => {
    if (firebase && fullname && !notAResearcher && project) {
      const notTakenSessionsQuery = firebase.db.collection("notTakenSessions");
      const notTakenSessionsSnapshot = notTakenSessionsQuery.onSnapshot(
        (snapshot) => {
          const docChanges = snapshot.docChanges();
          setNotTakenSessionsChanges((oldNotTakenSessionsChanges) => {
            return [...oldNotTakenSessionsChanges, ...docChanges];
          });
          setNotTakenSessionsLoaded(true);
        }
      );
      const researcherQuery = firebase.db
        .collection("researchers")
        .doc(fullname);
      const researcherSnapshot = researcherQuery.onSnapshot((doc) => {
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
        if (theProject.dayInstructorUpVotes) {
          setDayInstructorUpVotes(theProject.dayInstructorUpVotes);
        } else {
          setDayInstructorUpVotes(0);
        }
        if (theProject.gradingPoints) {
          setGradingPoints(theProject.gradingPoints);
        } else {
          setGradingPoints(0);
        }
        if (theProject.negativeGradingPoints) {
          setNegativeGradingPoints(theProject.negativeGradingPoints);
        } else {
          setNegativeGradingPoints(0);
        }
      });
      return () => {
        setNotTakenSessionsChanges([]);
        setNotTakenSessions([]);
        setNotTakenSessionsNum(0);
        notTakenSessionsSnapshot();
        setIntellectualPoints(0);
        setUpVotedDays(0);
        setExpPoints(0);
        setInstructorPoints(0);
        setDayInstructorUpVotes(0);
        setGradingPoints(0);
        setNegativeGradingPoints(0);
        researcherSnapshot();
      };
    }
  }, [firebase, fullname, notAResearcher, project]);

  useEffect(() => {
    if (!notAResearcher && notTakenSessionsChanges.length > 0) {
      const tempNotTakenSessionsChanges = [...notTakenSessionsChanges];
      setNotTakenSessionsChanges([]);
      let nTSessions = [...notTakenSessions];
      let nTSessionsNum = notTakenSessionsNum;
      for (let change of tempNotTakenSessionsChanges) {
        if (change.type === "removed") {
          nTSessions = nTSessions.filter((eSe) => eSe.id !== change.doc.id);
          nTSessionsNum -= 1;
        } else {
          const nTSessionData = change.doc.data();
          nTSessions.push({
            start: nTSessionData.start.toDate(),
            end: nTSessionData.end.toDate(),
            id: nTSessionData.id,
            hoursLeft: nTSessionData.hoursLeft,
            points: nTSessionData.points,
          });
          nTSessionsNum += 1;
        }
      }
      setNotTakenSessions(nTSessions);
      setNotTakenSessionsNum(nTSessionsNum);
    }
  }, [
    firebase,
    notAResearcher,
    notTakenSessionsChanges,
    notTakenSessions,
    notTakenSessionsNum,
  ]);

  useEffect(() => {
    if (!notAResearcher) {
      return firebaseOne.auth.onAuthStateChanged(async (user) => {
        if (user) {
          const uid = user.uid;
          const userDocs = await firebaseOne.db
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
    }
  }, [firebaseOne, notAResearcher, email]);

  useEffect(() => {
    if (firebaseOne && !notAResearcher && username) {
      const versionsSnapshots = [];
      const nodeTypes = ["Concept", "Relation", "Reference", "Idea"];
      let nodeTypeIdx = 0;
      let nodeType;
      const nodeTypesInterval = setInterval(() => {
        nodeType = nodeTypes[nodeTypeIdx];
        const { versionsColl } = getTypedCollections(firebaseOne.db, nodeType);
        const versionsQuery = versionsColl.where("tags", "array-contains", {
          node: "WgF7yr5q7tJc54apVQSr",
          title: "Knowledge Visualization",
        });
        versionsSnapshots.push(
          versionsQuery.onSnapshot((snapshot) => {
            const docChanges = snapshot.docChanges();
            setProposalsChanges((oldProposalsChanges) => {
              return [...oldProposalsChanges, ...docChanges];
            });
            if (nodeTypeIdx === nodeTypes.length) {
              setProposalsLoaded(true);
            }
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
  }, [firebaseOne, notAResearcher, username]);

  useEffect(() => {
    if (
      !notAResearcher &&
      proposalsChanges.length > 0 &&
      username &&
      proposalsLoaded
    ) {
      const tempProposalsChanges = [...proposalsChanges];
      setProposalsChanges([]);
      let propos = { ...proposals };
      let oPropos = { ...othersProposals };
      let netVotes = oneCademyPoints;
      for (let change of tempProposalsChanges) {
        const proposalData = change.doc.data();
        if (change.type === "removed" || proposalData.deleted) {
          if (proposalData.proposer === username) {
            if (change.doc.id in propos) {
              delete propos[change.doc.id];
              netVotes -= proposalData.corrects - proposalData.wrongs - 1;
            }
          } else {
            if (change.doc.id in oPropos) {
              delete oPropos[change.doc.id];
            }
          }
        } else {
          if (proposalData.proposer === username) {
            if (!(change.doc.id in propos)) {
              netVotes += proposalData.corrects - proposalData.wrongs - 1;
            } else {
              netVotes +=
                proposalData.corrects -
                propos[change.doc.id].corrects -
                (proposalData.wrongs - propos[change.doc.id].wrongs);
            }
            propos[change.doc.id] = {
              corrects: proposalData.corrects,
              wrongs: proposalData.wrongs,
            };
          } else {
            oPropos[change.doc.id] = {
              accepted: proposalData.accepted,
              node: proposalData.node,
            };
          }
        }
      }
      setProposals(propos);
      setOthersProposals(oPropos);
      setOneCademyPoints(netVotes);
    }
  }, [
    notAResearcher,
    proposalsChanges,
    proposals,
    othersProposals,
    oneCademyPoints,
    username,
    proposalsLoaded,
  ]);

  useEffect(() => {
    if (firebaseOne && !notAResearcher && username && proposalsLoaded) {
      const userVersionsSnapshots = [];
      const nodeTypes = ["Concept", "Relation", "Reference", "Idea"];
      let nodeTypeIdx = 0;
      let nodeType;
      const nodeTypesInterval = setInterval(() => {
        nodeType = nodeTypes[nodeTypeIdx];
        const { userVersionsColl } = getTypedCollections(
          firebaseOne.db,
          nodeType
        );
        const userVersionsQuery = userVersionsColl.where(
          "user",
          "==",
          username
        );
        userVersionsSnapshots.push(
          userVersionsQuery.onSnapshot((snapshot) => {
            const docChanges = snapshot.docChanges();
            setUserVersionsChanges((oldUserVersionsChanges) => {
              return [...oldUserVersionsChanges, ...docChanges];
            });
            if (nodeTypeIdx === nodeTypes.length) {
              setUserVersionsLoaded(true);
            }
          })
        );
        nodeTypeIdx += 1;
        if (nodeTypeIdx === nodeTypes.length) {
          clearInterval(nodeTypesInterval);
        }
      }, 400);
      return () => {
        setUserVersionsChanges([]);
        for (let vSnapshot of userVersionsSnapshots) {
          vSnapshot();
        }
      };
    }
  }, [firebaseOne, notAResearcher, username, proposalsLoaded]);

  useEffect(() => {
    if (
      !notAResearcher &&
      userVersionsChanges.length > 0 &&
      userVersionsLoaded
    ) {
      const tempUserVersionsChanges = [...userVersionsChanges];
      setUserVersionsChanges([]);
      let uVersions = { ...userVersions };
      let upVotes = { ...oneCademyUpvotes };
      for (let change of tempUserVersionsChanges) {
        const userVersionData = change.doc.data();
        if (userVersionData.version in othersProposals) {
          const voteDate = getISODateString(userVersionData.updatedAt.toDate());
          if (change.type === "removed" || userVersionData.deleted) {
            if (change.doc.id in uVersions) {
              delete uVersions[change.doc.id];
              if (voteDate in upVotes) {
                upVotes[voteDate] = upVotes[voteDate] - userVersionData.correct;
              }
            }
          } else {
            if (!(voteDate in upVotes)) {
              upVotes[voteDate] = 0;
            }
            if (!(change.doc.id in uVersions)) {
              uVersions[change.doc.id] = userVersionData.correct;
              upVotes[voteDate] += userVersionData.correct;
            } else {
              upVotes[voteDate] +=
                userVersionData.correct - uVersions[change.doc.id];
              uVersions[change.doc.id] = userVersionData.correct;
            }
          }
        }
      }
      setUserVersions(uVersions);
      setOneCademyUpvotes(upVotes);
      let today = getISODateString(new Date());
      if (today in upVotes) {
        setProposalUpvotesToday(upVotes[today]);
      } else {
        setProposalUpvotesToday(0);
      }
    }
  }, [
    notAResearcher,
    userVersionsChanges,
    userVersions,
    oneCademyUpvotes,
    othersProposals,
    userVersionsLoaded,
  ]);

  useEffect(() => {
    if (firebaseOne && !notAResearcher && username && userVersionsLoaded) {
      const nodesQuery = firebaseOne.db
        .collection("nodes")
        .where("tags", "array-contains", {
          node: "WgF7yr5q7tJc54apVQSr",
          title: "Knowledge Visualization",
        });
      const nodesSnapshot = nodesQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setNodesChanges((oldNodesChanges) => {
          return [...oldNodesChanges, ...docChanges];
        });
      });
      return () => {
        setNodesChanges([]);
        nodesSnapshot();
      };
    }
  }, [firebaseOne, notAResearcher, username, userVersionsLoaded]);

  useEffect(() => {
    if (!notAResearcher && nodesChanges.length > 0) {
      const tempNodesChanges = [...nodesChanges];
      setNodesChanges([]);
      let nds = [...nodes];
      for (let change of tempNodesChanges) {
        const nodeData = change.doc.data();
        if (
          Object.keys(othersProposals).findIndex(
            (oPrId) =>
              othersProposals[oPrId].node === change.doc.id &&
              othersProposals[oPrId].accepted
          ) !== -1
        ) {
          if (change.type === "removed" || nodeData.deleted) {
            if (nds.includes(change.doc.id)) {
              nds = nds.filter((nId) => nId !== change.doc.id);
            }
          } else {
            if (!nds.includes(change.doc.id)) {
              nds.push(change.doc.id);
            }
          }
        }
      }
      setNodes(nds);
      setNodesLoaded(true);
    }
  }, [notAResearcher, nodesChanges, othersProposals]);

  useEffect(() => {
    if (firebaseOne && !notAResearcher && username && nodesLoaded) {
      const userNodesQuery = firebaseOne.db
        .collection("userNodes")
        .where("user", "==", username);
      const userNodesSnapshot = userNodesQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setUserNodesChanges((oldUserNodesChanges) => {
          return [...oldUserNodesChanges, ...docChanges];
        });
      });
      return () => {
        setUserNodesChanges([]);
        userNodesSnapshot();
      };
    }
  }, [firebaseOne, notAResearcher, username, nodesLoaded]);

  useEffect(() => {
    if (!notAResearcher && userNodesChanges.length > 0) {
      const tempUserNodesChanges = [...userNodesChanges];
      setUserNodesChanges([]);
      let uNodes = { ...userNodes };
      let upVotes = { ...oneCademyUpvotes };
      for (let change of tempUserNodesChanges) {
        const userNodeData = change.doc.data();
        if (nodes.includes(userNodeData.node)) {
          const voteDate = getISODateString(userNodeData.updatedAt.toDate());
          if (change.type === "removed" || userNodeData.deleted) {
            if (change.doc.id in uNodes) {
              delete uNodes[change.doc.id];
              if (voteDate in upVotes) {
                upVotes[voteDate] = upVotes[voteDate] - userNodeData.correct;
              }
            }
          } else {
            if (!(change.doc.id in uNodes)) {
              uNodes[change.doc.id] = userNodeData.correct;
              if (!(voteDate in upVotes)) {
                upVotes[voteDate] = 0;
              }
              upVotes[voteDate] += userNodeData.correct;
            } else {
              if (!(voteDate in upVotes)) {
                upVotes[voteDate] = 0;
              }
              upVotes[voteDate] += userNodeData.correct - uNodes[change.doc.id];
              uNodes[change.doc.id] = userNodeData.correct;
            }
          }
        }
      }
      setUserNodes(uNodes);
      setOneCademyUpvotes(upVotes);
      let today = getISODateString(new Date());
      if (today in upVotes) {
        setProposalUpvotesToday(upVotes[today]);
      } else {
        setProposalUpvotesToday(0);
      }
    }
  }, [notAResearcher, userNodesChanges, userNodes, oneCademyUpvotes, nodes]);

  useEffect(() => {
    const setProposalsVotes = async () => {
      let totalDayPoints = 0;
      for (let voteDate in oneCademyUpvotes) {
        if (oneCademyUpvotes[voteDate] >= 25) {
          totalDayPoints += 1;
          const dayOneUpVoteDocs = await firebase.db
            .collection("dayOneUpVotes")
            .where("date", "==", voteDate)
            .where("voter", "==", fullname)
            .get();
          if (dayOneUpVoteDocs.docs.length === 0) {
            const dayOneUpVoteRef = firebase.db
              .collection("dayOneUpVotes")
              .doc();
            await dayOneUpVoteRef.set({
              date: voteDate,
              voter: fullname,
              project: project,
            });
          }
        }
      }
      setDayOneUpVotes(totalDayPoints);
      const researcherRef = firebase.db.collection("researchers").doc(fullname);
      const researcherDoc = await researcherRef.get();
      const researcherData = researcherDoc.data();
      await researcherRef.update({
        projects: {
          ...researcherData.projects,
          [project]: {
            ...researcherData.projects[project],
            onePoints: oneCademyPoints,
            dayOneUpVotePoints: totalDayPoints,
          },
        },
      });
    };
    if (
      firebase &&
      fullname &&
      project &&
      !notAResearcher &&
      Object.keys(oneCademyUpvotes).length > 0
    ) {
      setProposalsVotes();
    }
  }, [
    notAResearcher,
    oneCademyPoints,
    oneCademyUpvotes,
    firebase,
    fullname,
    project,
  ]);

  const signOut = async (event) => {
    console.log("Signing out!");
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
    setExpPoints(0);
    setInstructorPoints(0);
    setDayInstructorUpVotes(0);
    setNotTakenSessionsChanges([]);
    setNotTakenSessionsNum(0);
    setProposalsChanges([]);
    setProposals({});
    setOthersProposals([]);
    setOneCademyPoints(0);
    setUserVersionsChanges([]);
    setUserVersions({});
    setOneCademyUpvotes({});
    setDayOneUpVotes(0);
    setGradingPoints(0);
    setNegativeGradingPoints(0);
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
      anchorEl={profileMenuOpen}
      open={isProfileMenuOpen}
      onClose={handleProfileMenuClose}
      style={{ float: "right" }}
    >
      {fullname && <MenuItem sx={{ flexGrow: 3 }}>{fullname}</MenuItem>}
      {fullname && (
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
                          You've earned {oneCademyPoints + dayOneUpVotes} total
                          1Cademy points, including {oneCademyPoints} from
                          others' votes and {dayOneUpVotes} points for casting
                          25 upvotes per day on others' proposals.
                        </div>
                        <div>
                          You cast {proposalUpvotesToday} / 25 up-votes today on
                          others' 1Cademy proposals.
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
                          {oneCademyPoints + dayOneUpVotes}
                          <br />✔ {oneCademyPoints}
                          <br />
                          <span>🌞 {proposalUpvotesToday} / 25</span>
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
                          <br />✔ {upVotedDays}
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
                          You've earned{" "}
                          {instructorPoints + dayInstructorUpVotes} total
                          points, including {instructorPoints} points for
                          collecting instructors/administrators' contact info
                          and {dayInstructorUpVotes} points for casting 25
                          up-voting per day on other's collected data.
                        </div>
                        <div>
                          You collected {instructorsToday} / 7
                          instructors/administrators' info today.
                        </div>
                        <div>
                          You cast {upvotedInstructorsToday} / 16 up-votes today
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
                      👨‍🏫 {instructorPoints + dayInstructorUpVotes} <br /> 🌞{" "}
                      {instructorsToday} / 7
                      <br /> ✅ {upvotedInstructorsToday} / 16
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={
                      <div>
                        <div>
                          You've earned {gradingPoints} total 🧠 free-recall
                          grading points.
                        </div>
                        <div>
                          This means, {gradingPoints} times at least two other
                          researchers have identified a specific phrase in a
                          free-recall response that you also identified.
                        </div>
                        <div>
                          We've already excluded your LOST{" "}
                          {negativeGradingPoints} total 🧟 free-recall grading
                          points.
                        </div>
                        <div>
                          This means, {negativeGradingPoints} times you've
                          identified a phrase in a free-recall response and the
                          other three researchers, who evaluated the same
                          free-recall response, have not identified this phrase
                          in the free-recall response.
                        </div>
                      </div>
                    }
                  >
                    <Button
                      id="FreeRecallGrading"
                      className={
                        activePage === "FreeRecallGrading"
                          ? "ActiveNavLink"
                          : "NavLink"
                      }
                      onClick={(event) =>
                        navigate("/Activities/FreeRecallGrading")
                      }
                    >
                      🧠 {gradingPoints} <br /> 🧟 {negativeGradingPoints}
                    </Button>
                  </Tooltip>
                  {/* <Box sx={{ minWidth: "130px", textAlign: "center" }}>
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
                  </Box> */}
                </>
              )}
              {fullname && (
                <Box>
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
              )}
            </Toolbar>
          </AppBar>
          {/* {projects.length > 0 && renderProjectsMenu} */}
          {fullname && renderProfileMenu}
        </Box>
      )}
      <Outlet />
    </>
  );
};

export default RouterNav;
