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
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";

import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchemaIcon from "@mui/icons-material/Schema";

import { firebaseState, fullnameState, isAdminState, emailState } from "../../store/AuthAtoms";

import { firebaseOneState, usernameState, emailOneState } from "../../store/OneCademyAtoms";

import {
  projectState,
  projectsState,
  projectSpecsState,
  activePageState,
  notAResearcherState,
  upVotedTodayState,
  instructorsTodayState,
  upvotedInstructorsTodayState,
  administratorsTodayState,
  upvotedAdministratorsTodayState,
  CURRENT_PROJ_LOCAL_S_KEY
} from "../../store/ProjectAtoms";

import LineDiagram from "./LineDiagram";
import { getTypedCollections } from "./getTypedCollections";
import { getISODateString } from "../../utils/DateFunctions";

import UMSI_Logo_Dark from "../../assets/u-m_logo-hex-withoutline.png";
import GCloud_Logo from "../../assets/GCloud_Logo.png";
import favicon from "../../assets/favicon.png";
import HonorEducation from "../../assets/Honor_Education_Logo.jpeg";

const goToLink = theLink => event => {
  window.open(theLink, "_blank");
};

const RouterNav = props => {
  const firebase = useRecoilValue(firebaseState);
  const firebaseOne = useRecoilValue(firebaseOneState);
  const navigateTo = useNavigate();
  const userEmail = useRecoilValue(emailState);
  const [username, setUsername] = useRecoilState(usernameState);
  const [email, setEmail] = useRecoilState(emailOneState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [isAdmin, setIsAdmin] = useRecoilState(isAdminState);
  const [projects, setProjects] = useRecoilState(projectsState);
  const [project, setProject] = useRecoilState(projectState);
  const [projectSpecs, setProjectSpecs] = useRecoilState(projectSpecsState);
  const haveProjectSpecs = Object.keys(projectSpecs).length > 0;
  const activePage = useRecoilValue(activePageState);
  const [notAResearcher, setNotAResearcher] = useRecoilState(notAResearcherState);
  const [upVotedToday, setUpVotedToday] = useRecoilState(upVotedTodayState);
  const [instructorsToday, setInstructorsToday] = useRecoilState(instructorsTodayState);
  const [upvotedInstructorsToday, setUpvotedInstructorsToday] = useRecoilState(upvotedInstructorsTodayState);
  const [administratorsToday, setAdministratorsToday] = useRecoilState(administratorsTodayState);
  const [upvotedAdministratorsToday, setUpvotedAdministratorsToday] = useRecoilState(upvotedAdministratorsTodayState);

  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [projectIndex, setProjectIndex] = useState(0);
  const [projectMenuOpen, setProjectMenuOpen] = useState(null);
  const isProjectMenuOpen = Boolean(projectMenuOpen);
  const [intellectualPoints, setIntellectualPoints] = useState(0);
  const [upVotedDays, setUpVotedDays] = useState(0);
  const [expPoints, setExpPoints] = useState(0);
  const [instructorPoints, setInstructorPoints] = useState(0);
  const [instructorsNum, setInstructorsNum] = useState({});
  const [dayInstructorUpVotes, setDayInstructorUpVotes] = useState(0);
  const [administratorPoints, setAdministratorPoints] = useState(0);
  const [administratorsNum, setAdministratorsNum] = useState({});
  const [dayAdministratorUpVotes, setDayAdministratorUpVotes] = useState(0);
  const [proposalsChanges, setProposalsChanges] = useState([]);
  const [proposals, setProposals] = useState({});
  const [othersProposals, setOthersProposals] = useState({});
  const [proposalsNums, setProposalsNums] = useState({});
  const [oneCademyPoints, setOneCademyPoints] = useState(0);
  const [proposalsLoaded, setProposalsLoaded] = useState(false);
  const [userVersionsChanges, setUserVersionsChanges] = useState([]);
  const [userVersions, setUserVersions] = useState({});
  const [oneCademyUpvotes, setOneCademyUpvotes] = useState({});
  const [proposalUpvotesToday, setProposalUpvotesToday] = useState(0);
  const [dayOneUpVotes, setDayOneUpVotes] = useState(0);
  const [gradingPoints, setGradingPoints] = useState(0);
  const [gradingNums, setGradingNums] = useState({});
  const [codingNums, setCodingNums] = useState({});
  const [intellectualNum, setIntellectualNum] = useState({});
  const [negativeGradingPoints, setNegativeGradingPoints] = useState(0);
  const [positiveCodesPoints, setPositiveCodesPoints] = useState(0);
  const [negativeCodesPionts, setNegativeCodesPionts] = useState(0);
  const [negativeBooleanExpPionts, setNegativeBooleanExpPionts] = useState(0);
  const [positiveBooleanExpPionts, setPositiveBooleanExpPionts] = useState(0);

  const [userVersionsLoaded, setUserVersionsLoaded] = useState(false);
  const [nodesChanges, setNodesChanges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [nodesLoaded, setNodesLoaded] = useState(false);
  const [userNodesChanges, setUserNodesChanges] = useState([]);
  const [userNodes, setUserNodes] = useState([]);
  const [otherPagesMenuOpen, setOtherPagesMenuOpen] = useState(null);
  const isOtherPagesMenuOpen = Boolean(otherPagesMenuOpen);
  const projectPoints = projectSpecs?.points || {};

  const lineDiagramTooltip = type => (obj, key, uname) => {
    if (type === "proposals") {
      return (
        <>
          {key === uname ? (
            "You've posted"
          ) : uname === "Iman YeckehZaare" ? (
            <>
              <strong style={{ color: "green", fontSize: "15.5px" }}>{key} </strong> Posted
            </>
          ) : (
            "Posted"
          )}

          {` ${obj[key].num}  proposals.`}
        </>
      );
    }
    if (type === "instructors") {
      return (
        <>
          {key === uname ? (
            "You've added"
          ) : uname === "Iman YeckehZaare" ? (
            <>
              <strong style={{ color: "green", fontSize: "15.5px" }}>{key} </strong> Added
            </>
          ) : (
            "Added"
          )}

          {` ${obj[key].num}  instructors.`}
        </>
      );
    }
    if (type === "administrators") {
      return (
        <>
          {key === uname ? (
            "You've added"
          ) : uname === "Iman YeckehZaare" ? (
            <>
              <strong style={{ color: "green", fontSize: "15.5px" }}>{key} </strong> Added
            </>
          ) : (
            "Added"
          )}

          {` ${obj[key].num}  administrators.`}
        </>
      );
    }
    if (type === "grading") {
      return (
        <>
          {key === uname ? (
            "You've graded"
          ) : uname === "Iman YeckehZaare" ? (
            <>
              <strong style={{ color: "green", fontSize: "15.5px" }}>{key} </strong> Graded
            </>
          ) : (
            "Graded"
          )}

          {` ${obj[key].num} free-recall responses.`}
        </>
      );
    }
    if (type === "coding") {
      return (
        <>
          {key === uname ? (
            "You've coded"
          ) : uname === "Iman YeckehZaare" ? (
            <>
              <strong style={{ color: "green", fontSize: "15.5px" }}>{key} </strong> Coded
            </>
          ) : (
            "Coded"
          )}

          {` ${obj[key].num}` +
            (project === "OnlineCommunities"
              ? obj[key].num === 1
                ? ` interview`
                : ` interviews`
              : obj[key].num === 1
              ? ` explanation`
              : ` explanations`)}
        </>
      );
    }
    if (type === "intellectual") {
      return (
        <>
          {key === uname ? (
            "You've added"
          ) : uname === "Iman YeckehZaare" ? (
            <>
              <strong style={{ color: "green", fontSize: "15.5px" }}>{key} </strong> Coded
            </>
          ) : (
            "Coded"
          )}

          {` ${obj[key].num} intellectual activities.`}
        </>
      );
    }
  };
  useEffect(() => {
    const getProjectSpecs = async () => {
      const pSpec = await firebase.db.collection("projectSpecs").doc(project).get();
      setProjectSpecs({ ...pSpec.data() });
    };

    if (firebase && project) {
      getProjectSpecs();
    }
    // update project settings
  }, [firebase, project]);

  useEffect(() => {
    if (firebase && fullname && !notAResearcher && project) {
      const researcherQuery = firebase.db.collection("researchers");
      const researcherSnapshot = researcherQuery.onSnapshot(snapshot => {
        const graNums = {};
        const instruNums = {};
        const adminNums = {};
        const codNums = {};
        const intellectualNums = {};
        const docChanges = snapshot.docChanges();
        for (let change of docChanges) {
          const researcherData = change.doc.data();
          // Because researchers have different active projects, we should make
          // sure that the project exists.
          if ("projects" in researcherData && project in researcherData.projects) {
            const theProject = researcherData.projects[project];
            if (change.doc.id === fullname) {
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
              if (theProject.administrators) {
                setAdministratorPoints(theProject.administrators);
              } else {
                setAdministratorPoints(0);
              }
              if (theProject.dayAdministratorUpVotes) {
                setDayAdministratorUpVotes(theProject.dayAdministratorUpVotes);
              } else {
                setDayAdministratorUpVotes(0);
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
              if (theProject.negativeCodingPoints) {
                setNegativeCodesPionts(theProject.negativeCodingPoints);
              } else {
                setNegativeCodesPionts(0);
              }
              if (theProject.positiveCodingPoints) {
                setPositiveCodesPoints(theProject.positiveCodingPoints);
              } else {
                setPositiveCodesPoints(0);
              }
              if (theProject.negativeBooleanExpPionts) {
                setNegativeBooleanExpPionts(theProject.negativeBooleanExpPionts);
              } else {
                setNegativeBooleanExpPionts(0);
              }
              if (theProject.positiveBooleanExpPionts) {
                setPositiveBooleanExpPionts(theProject.positiveBooleanExpPionts);
              } else {
                setPositiveBooleanExpPionts(0);
              }
            }
            if ("gradingNum" in theProject) {
              graNums[change.doc.id] = theProject.gradingNum;
            }
            if ("instructorsNum" in theProject) {
              instruNums[change.doc.id] = theProject.instructorsNum;
            }
            if ("administratorsNum" in theProject) {
              adminNums[change.doc.id] = theProject.administratorsNum;
            }
            if ("codingNum" in theProject) {
              codNums[change.doc.id] = theProject.codingNum;
            }
            if ("intellectualNum" in theProject) {
              intellectualNums[change.doc.id] = theProject.intellectualNum;
            }
          }
        }

        setGradingNums(oGraNums => {
          const oldGraNums = { ...oGraNums };
          for (let researcher in graNums) {
            oldGraNums[researcher] = { num: graNums[researcher] };
          }
          delete oldGraNums["Iman YeckehZaare"];
          const maxGraNum = Math.max(...Object.values(oldGraNums).map(({ num }) => num));
          for (let researcher in oldGraNums) {
            if (researcher === "Iman YeckehZaare") continue;
            oldGraNums[researcher].percent = Math.round(((oldGraNums[researcher].num * 100.0) / maxGraNum) * 100) / 100;
          }
          return oldGraNums;
        });
        setInstructorsNum(oInstruNums => {
          const oldInstruNums = { ...oInstruNums };
          for (let researcher in instruNums) {
            oldInstruNums[researcher] = { num: instruNums[researcher] };
          }
          const maxInstruNum = Math.max(...Object.values(oldInstruNums).map(({ num }) => num));
          for (let researcher in oldInstruNums) {
            oldInstruNums[researcher].percent =
              Math.round(((oldInstruNums[researcher].num * 100.0) / maxInstruNum) * 100) / 100;
          }
          return oldInstruNums;
        });
        setAdministratorsNum(oAdminNums => {
          const oldAdminNums = { ...oAdminNums };
          for (let researcher in adminNums) {
            oldAdminNums[researcher] = { num: adminNums[researcher] };
          }
          const maxInstruNum = Math.max(...Object.values(oldAdminNums).map(({ num }) => num));
          for (let researcher in oldAdminNums) {
            oldAdminNums[researcher].percent =
              Math.round(((oldAdminNums[researcher].num * 100.0) / maxInstruNum) * 100) / 100;
          }
          return oldAdminNums;
        });
        setCodingNums(oCodingNums => {
          const oldCodingNums = { ...oCodingNums };
          for (let researcher in codNums) {
            oldCodingNums[researcher] = { num: codNums[researcher] };
          }
          const maxInstruNum = Math.max(...Object.values(oldCodingNums).map(({ num }) => num));
          for (let researcher in oldCodingNums) {
            oldCodingNums[researcher].percent =
              Math.round(((oldCodingNums[researcher].num * 100.0) / maxInstruNum) * 100) / 100;
          }
          return oldCodingNums;
        });

        setIntellectualNum(oIntellectualNum => {
          const oldIntellectualNum = { ...oIntellectualNum };
          for (let researcher in intellectualNums) {
            oldIntellectualNum[researcher] = { num: intellectualNums[researcher] };
          }
          const maxInstruNum = Math.max(...Object.values(oldIntellectualNum).map(({ num }) => num)) || 0;
          for (let researcher in oldIntellectualNum) {
            oldIntellectualNum[researcher].percent =
              Math.round(((oldIntellectualNum[researcher].num * 100.0) / maxInstruNum) * 100) / 100 || 0;
          }
          return oldIntellectualNum;
        });
      });
      return () => {
        setIntellectualPoints(0);
        setUpVotedDays(0);
        setExpPoints(0);
        setInstructorPoints(0);
        setInstructorsNum({});
        setDayInstructorUpVotes(0);
        setAdministratorPoints(0);
        setAdministratorsNum({});
        setDayAdministratorUpVotes(0);
        setGradingPoints(0);
        setGradingNums({});
        setNegativeGradingPoints(0);
        researcherSnapshot();
        setCodingNums({});
      };
    }
  }, [firebase, fullname, notAResearcher, project]);
  useEffect(() => {
    if (!notAResearcher) {
      return firebaseOne.auth.onAuthStateChanged(async user => {
        if (user) {
          const uid = user.uid;
          const userDocs = await firebaseOne.db.collection("users").where("userId", "==", uid).get();
          if (userDocs.docs.length > 0) {
            // Sign in and signed up:
            setUsername(userDocs.docs[0].id);
          } else {
            setUsername("");
          }
        } else {
          setUsername("");
        }
      });
    }
  }, [firebaseOne, notAResearcher, email]);

  useEffect(() => {
    if (
      firebaseOne &&
      !notAResearcher &&
      username &&
      haveProjectSpecs &&
      haveProjectSpecs.hasOwnProperty("deTag") &&
      projectSpecs.deTag.node
    ) {
      const versionsSnapshots = [];
      const nodeTypes = ["Concept", "Relation", "Reference", "Idea"];
      let nodeTypeIdx = 0;
      let nodeType;
      const nodeTypesInterval = setInterval(() => {
        nodeType = nodeTypes[nodeTypeIdx];
        const { versionsColl } = getTypedCollections(firebaseOne.db, nodeType);
        const versionsQuery = versionsColl.where("tagIds", "array-contains", projectSpecs.deTag.node);
        versionsSnapshots.push(
          versionsQuery.onSnapshot(snapshot => {
            const docChanges = snapshot.docChanges();
            setProposalsChanges(oldProposalsChanges => {
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
  }, [firebaseOne, notAResearcher, username, projectSpecs]);

  useEffect(() => {
    if (!notAResearcher && proposalsChanges.length > 0 && username && proposalsLoaded) {
      const tempProposalsChanges = [...proposalsChanges];
      setProposalsChanges([]);
      let propos = { ...proposals };
      let oPropos = { ...othersProposals };
      let proposNums = { ...proposalsNums };
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
          if (proposalData.proposer in proposNums) {
            proposNums[proposalData.proposer].num += 1;
          } else {
            proposNums[proposalData.proposer] = { num: 1 };
          }
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
              wrongs: proposalData.wrongs
            };
          } else {
            oPropos[change.doc.id] = {
              accepted: proposalData.accepted,
              node: proposalData.node
            };
          }
        }
      }
      const maxProposNums = Math.max(...Object.values(proposNums).map(({ num }) => num));
      for (let proposer in proposNums) {
        proposNums[proposer].percent = Math.round(((proposNums[proposer].num * 100.0) / maxProposNums) * 100) / 100;
      }
      setProposals(propos);
      setOthersProposals(oPropos);
      setProposalsNums(proposNums);
      setOneCademyPoints(netVotes);
    }
  }, [
    notAResearcher,
    proposalsChanges,
    proposals,
    othersProposals,
    proposalsNums,
    oneCademyPoints,
    username,
    proposalsLoaded
  ]);

  useEffect(() => {
    if (firebaseOne && !notAResearcher && username && proposalsLoaded) {
      const userVersionsSnapshots = [];
      const nodeTypes = ["Concept", "Relation", "Reference", "Idea"];
      let nodeTypeIdx = 0;
      let nodeType;
      const nodeTypesInterval = setInterval(() => {
        nodeType = nodeTypes[nodeTypeIdx];
        const { userVersionsColl } = getTypedCollections(firebaseOne.db, nodeType);
        const userVersionsQuery = userVersionsColl.where("user", "==", username);
        userVersionsSnapshots.push(
          userVersionsQuery.onSnapshot(snapshot => {
            const docChanges = snapshot.docChanges();
            setUserVersionsChanges(oldUserVersionsChanges => {
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
    if (!notAResearcher && userVersionsChanges.length > 0 && userVersionsLoaded) {
      const tempUserVersionsChanges = [...userVersionsChanges];
      setUserVersionsChanges([]);
      let uVersions = { ...userVersions };
      let upVotes = { ...oneCademyUpvotes };
      for (let change of tempUserVersionsChanges) {
        const userVersionData = change.doc.data();
        if (userVersionData.version in othersProposals) {
          let voteDate = getISODateString(new Date());
          if (userVersionData.hasOwnProperty("updatedAt")) {
            voteDate = getISODateString(userVersionData.updatedAt.toDate());
          } else if (userVersionData.hasOwnProperty("createdAt")) {
            voteDate = getISODateString(userVersionData.createdAt.toDate());
          }

          if (change.type === "removed" || (userVersionData.hasOwnProperty("deleted") && userVersionData.deleted)) {
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
              upVotes[voteDate] += userVersionData.correct - uVersions[change.doc.id];
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
  }, [notAResearcher, userVersionsChanges, userVersions, oneCademyUpvotes, othersProposals, userVersionsLoaded]);

  useEffect(() => {
    if (firebaseOne && !notAResearcher && username && userVersionsLoaded && haveProjectSpecs) {
      const nodesQuery = firebaseOne.db.collection("nodes").where("tagIds", "array-contains", projectSpecs.deTag.node);
      const nodesSnapshot = nodesQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setNodesChanges(oldNodesChanges => {
          return [...oldNodesChanges, ...docChanges];
        });
      });
      return () => {
        setNodesChanges([]);
        nodesSnapshot();
      };
    }
  }, [firebaseOne, notAResearcher, username, userVersionsLoaded, projectSpecs]);

  useEffect(() => {
    if (!notAResearcher && nodesChanges.length > 0) {
      const tempNodesChanges = [...nodesChanges];
      setNodesChanges([]);
      let nds = [...nodes];
      for (let change of tempNodesChanges) {
        const nodeData = change.doc.data();
        if (
          Object.keys(othersProposals).findIndex(
            oPrId => othersProposals[oPrId].node === change.doc.id && othersProposals[oPrId].accepted
          ) !== -1
        ) {
          if (change.type === "removed" || nodeData.deleted) {
            if (nds.includes(change.doc.id)) {
              nds = nds.filter(nId => nId !== change.doc.id);
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
      const userNodesQuery = firebaseOne.db.collection("userNodes").where("user", "==", username);
      const userNodesSnapshot = userNodesQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setUserNodesChanges(oldUserNodesChanges => {
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
            const dayOneUpVoteRef = firebase.db.collection("dayOneUpVotes").doc();
            await dayOneUpVoteRef.set({
              date: voteDate,
              voter: fullname,
              project: project
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
            onePoints: roundNum(oneCademyPoints),
            dayOneUpVotePoints: totalDayPoints
          }
        }
      });
    };
    if (firebase && fullname && project && !notAResearcher && Object.keys(oneCademyUpvotes).length > 0) {
      setProposalsVotes();
    }
  }, [notAResearcher, oneCademyPoints, oneCademyUpvotes, firebase, fullname, project]);

  const signOut = async event => {
    setEmail("");
    setUsername("");
    setFullname("");
    setIsAdmin(false);
    setProjects([]);
    setProject("");
    setNotAResearcher(true);
    setUpVotedToday(0);
    setInstructorsToday(0);
    setUpvotedInstructorsToday(0);
    setInstructorPoints(0);
    setDayInstructorUpVotes(0);
    setAdministratorsToday(0);
    setUpvotedAdministratorsToday(0);
    setAdministratorPoints(0);
    setDayAdministratorUpVotes(0);
    setProposalUpvotesToday(0);
    setUpVotedDays(0);
    setIntellectualPoints(0);
    setExpPoints(0);
    setProposalsChanges([]);
    setProposals({});
    setOthersProposals([]);
    setProposalsNums({});
    setOneCademyPoints(0);
    setUserVersionsChanges([]);
    setUserVersions({});
    setOneCademyUpvotes({});
    setDayOneUpVotes(0);
    setGradingPoints(0);
    setGradingNums({});
    setNegativeGradingPoints(0);
    await firebase.logout();
    console.log("project Sign out", project);
    if (project === "OnlineCommunities") {
      navigateTo("/survey");
    } else {
      navigateTo("/Activities");
    }
  };

  const changeProject = (event, index) => {
    const proj = projects[index];
    localStorage.setItem(CURRENT_PROJ_LOCAL_S_KEY, proj);
    setProject(proj);
    setProjectIndex(index);
  };

  const handleProfileMenuOpen = event => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };
  const handleOtherPagesMenuOpen = event => {
    setOtherPagesMenuOpen(event.currentTarget);
  };
  const handleOtherPagesMenuClose = () => {
    setOtherPagesMenuOpen(null);
  };

  const renderProfileMenu = (
    <Menu
      anchorEl={profileMenuOpen}
      open={isProfileMenuOpen}
      onClose={handleProfileMenuClose}
      onClick={handleProfileMenuClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {fullname && <MenuItem sx={{ flexGrow: 3 }}>{fullname}</MenuItem>}

      {projects.map((proj, index) => (
        <MenuItem
          key={`${proj}MenuItem`}
          selected={index === projectIndex}
          // onClick={(event) => changeProject(event, index)}
        >
          {proj}
          <Switch
            checked={proj === project}
            onClick={event => event.stopPropagation()}
            onChange={event => {
              if (event.target.checked) {
                changeProject(event, index);
              }
            }}
          />
        </MenuItem>
      ))}
      {/* <MenuItem sx={{ flexGrow: 3 }}>Schema Generation Tool</MenuItem> */}
      <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
        <LogoutIcon /> <span id="LogoutText">Logout</span>
      </MenuItem>
    </Menu>
  );

  const renderOtherPagesMenu = (
    <Menu
      anchorEl={otherPagesMenuOpen}
      open={isOtherPagesMenuOpen}
      onClose={handleOtherPagesMenuClose}
      onClick={handleOtherPagesMenuClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem
        onClick={() => {
          window.open("/Activities/ResearcherPassage", "_blank");
        }}
      >
        <MenuBookIcon sx={{ m: "5px" }} />
        Experiment Passages
      </MenuItem>
      <MenuItem
        onClick={() => {
          window.open("/Activities/SchemaGeneration", "_blank");
        }}
      >
        <SchemaIcon sx={{ m: "5px" }} />
        Schema Generation
      </MenuItem>
    </Menu>
  );

  const roundNum = num => Number(Number.parseFloat(Number(num).toFixed(2)));

  const navigate = useNavigate();
  return (
    <>
      {!props.duringAnExperiment && (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Grid>
                  <Tooltip title="Honor Education sponsors this research project.">
                    <IconButton
                      size="large"
                      edge="start"
                      sx={{ mr: 1 }}
                      onClick={goToLink("https://www.honor.education/")}
                    >
                      <img src={HonorEducation} alt="Honor Education" width="43px" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="University of Michigan - School of Information sponsors this research project.">
                    <IconButton
                      id="UMICH_Logo"
                      size="large"
                      edge="start"
                      sx={{ mr: 4 }}
                      onClick={goToLink("https://www.si.umich.edu/")}
                    >
                      <img src={UMSI_Logo_Dark} alt="University of Michigan, School of Information Logo" width="43px" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Google Cloud sponsors this research project.">
                    <IconButton
                      size="large"
                      edge="start"
                      sx={{ mr: 4 }}
                      onClick={goToLink("https://cloud.google.com/edu/researchers")}
                    >
                      <div id="GCloud_Logo">
                        <img src={GCloud_Logo} alt="Google Cloud Logo" width="49px" />
                      </div>
                    </IconButton>
                  </Tooltip>
                </Grid>
                {projects.length > 0 && (
                  <>
                    <Box
                      sx={{
                        ml: "-25px",
                        mr: "10px",
                        display: "flex",
                        flexDirection: "column",
                        rowGap: "4px"
                      }}
                    >
                      {projectPoints.commentsPoints ? (
                        <Tooltip
                          title={`You've coded ${codingNums[fullname]?.num || 0} ${
                            project === "OnlineCommunities"
                              ? codingNums[fullname]?.num === 1
                                ? ` interview`
                                : ` interviews`
                              : codingNums[fullname]?.num === 1
                              ? ` explanation`
                              : ` explanations`
                          }. Note that your score is determined based on the # of times your grades agreed with three other researchers, not this number.`}
                        >
                          <Box># of 💬 :</Box>
                        </Tooltip>
                      ) : projectPoints.onePoints ? (
                        <Tooltip
                          title={`You've submitted ${
                            proposalsNums[username] ? proposalsNums[username].num : ""
                          } proposals on 1Cademy. Note that your 1Cademy score is determined based on the # of votes, not this number.`}
                        >
                          <Box>
                            # of <img src={favicon} width="15.1" style={{ margin: "0px 4px 0px 4px" }} alt="" />:
                          </Box>
                        </Tooltip>
                      ) : null}

                      {projectPoints.administratorsPoints ? (
                        <Tooltip
                          title={`You've collected ${
                            administratorsNum[fullname]?.num || 0
                          } school administrators' information. Note that your score is determined based on the # of times your collected information was approved by other researchers, not this number.`}
                        >
                          <Box># of 💼:</Box>
                        </Tooltip>
                      ) : projectPoints.instructorsPoints ? (
                        <Tooltip
                          title={`You've collected ${
                            instructorsNum[fullname]?.num || 0
                          } instructors' information. Note that your score is determined based on the # of times your collected information was approved by other researchers, not this number.`}
                        >
                          <Box># of 👨‍🏫:</Box>
                        </Tooltip>
                      ) : null}

                      {projectPoints.gradingPoints ? (
                        <Tooltip
                          title={`You've graded ${
                            gradingNums[fullname]?.num || 0
                          } free-recall responses. Note that your score is determined based on the # of times your grades agreed with three other researchers, not this number.`}
                        >
                          <Box># of 🧠:</Box>
                        </Tooltip>
                      ) : null}
                      {projectPoints.intellectualPoints &&
                      (project === "Autograding" || project === "OnlineCommunities") ? (
                        <Tooltip
                          title={`You've added ${
                            intellectualNum[fullname]?.num || 0
                          } intellectual activities. Note that your score is determined based on the # of times you vote on the other researchers activities and vice versa , not this number.`}
                        >
                          <Box># of 🎓:</Box>
                        </Tooltip>
                      ) : null}
                    </Box>
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        rowGap: "25px"
                      }}
                    >
                      {projectPoints.commentsPoints ? (
                        <LineDiagram
                          obj={codingNums}
                          username={fullname}
                          lineDiagramTooltip={lineDiagramTooltip("coding")}
                        ></LineDiagram>
                      ) : null}

                      {projectPoints.onePoints && !projectPoints.commentsPoints && project === "OnlineCommunities" ? (
                        <LineDiagram
                          obj={proposalsNums}
                          username={username}
                          lineDiagramTooltip={lineDiagramTooltip("proposals")}
                        ></LineDiagram>
                      ) : null}

                      {projectPoints.administratorsPoints ? (
                        <LineDiagram
                          obj={administratorsNum}
                          username={fullname}
                          lineDiagramTooltip={lineDiagramTooltip("administrators")}
                        ></LineDiagram>
                      ) : projectPoints.instructorsPoints ? (
                        <LineDiagram
                          obj={instructorsNum}
                          username={fullname}
                          lineDiagramTooltip={lineDiagramTooltip("instructors")}
                        ></LineDiagram>
                      ) : null}

                      {projectPoints.gradingPoints ? (
                        <LineDiagram
                          obj={gradingNums}
                          username={fullname}
                          lineDiagramTooltip={lineDiagramTooltip("grading")}
                        ></LineDiagram>
                      ) : null}
                      {projectPoints.intellectualPoints &&
                      (project === "Autograding" || project === "OnlineCommunities") ? (
                        <LineDiagram
                          obj={intellectualNum}
                          username={fullname}
                          lineDiagramTooltip={lineDiagramTooltip("intellectual")}
                        ></LineDiagram>
                      ) : null}
                    </Box>
                    <Box sx={{ ml: "19px" }}>
                      {projectPoints.expPoints ? (
                        <Tooltip
                          title={
                            <div>
                              <div>You've earned {roundNum(expPoints)} points from running experiments.</div>
                            </div>
                          }
                        >
                          <Button
                            id="ExperimentPoints"
                            className={activePage === "Experiments" ? "ActiveNavLink" : "NavLink"}
                            onClick={event => navigate("/Activities/Experiments")}
                          >
                            <div>
                              <span id="ExpPointsLabel">👨‍🔬 {roundNum(expPoints)}</span>
                            </div>
                          </Button>
                        </Tooltip>
                      ) : null}
                      {projectPoints.onePoints ? (
                        <Tooltip
                          title={
                            <div>
                              <div>
                                You've earned {roundNum(oneCademyPoints) + roundNum(dayOneUpVotes)} total 1Cademy
                                points, including {roundNum(oneCademyPoints)} from others' votes and{" "}
                                {roundNum(dayOneUpVotes)} points for casting 25 upvotes per day on others' proposals.
                              </div>
                              <div>
                                You cast {roundNum(proposalUpvotesToday)} / 25 up-votes today on others' 1Cademy
                                proposals.
                              </div>
                            </div>
                          }
                        >
                          <Button
                            id="OneCademyPoints"
                            className={activePage === "1Cademy" ? "ActiveNavLink" : "NavLink"}
                            onClick={event => navigate("/Activities/1Cademy")}
                          >
                            {username ? (
                              <div>
                                <img src={favicon} width="15.1" /> {roundNum(oneCademyPoints) + roundNum(dayOneUpVotes)}
                                <br />✔ {roundNum(oneCademyPoints)}
                                <br />
                                <span>🌞 {roundNum(proposalUpvotesToday)} / 25</span>
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
                      ) : null}
                      {projectPoints.intellectualPoints ? (
                        <Tooltip
                          title={
                            <div>
                              <div>
                                You've earned {roundNum(intellectualPoints)} intellectual points from others' votes and{" "}
                                {upVotedDays} points for casting 25 upvotes per day on others' activities.
                              </div>
                              <div>You cast {roundNum(upVotedToday)} / 25 up-votes today on others' activities.</div>
                            </div>
                          }
                        >
                          <Button
                            id="IntellectualPoints"
                            className={activePage === "Intellectual" ? "ActiveNavLink" : "NavLink"}
                            onClick={event => navigate("/Activities/Intellectual")}
                          >
                            <div>
                              <span>
                                🎓 {roundNum(intellectualPoints)}
                                <br />✔ {roundNum(upVotedDays)}
                              </span>
                              <br />
                              <span>🌞 {roundNum(upVotedToday)} / 25</span>
                            </div>
                          </Button>
                        </Tooltip>
                      ) : null}

                      {projectPoints.instructorsPoints ? (
                        <Tooltip
                          title={
                            projectPoints.dayInstructorUpVotes ? (
                              <div>
                                <div>
                                  You've earned {roundNum(instructorPoints)} instructor points from others' votes and{" "}
                                  {roundNum(dayInstructorUpVotes)} points for casting 16 upvotes per day on others'
                                  collected data.
                                </div>
                                <div>
                                  You cast {roundNum(upvotedInstructorsToday)} / 16 up-votes today on others' collected
                                  instructors' data.
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div>
                                  You've earned {roundNum(instructorPoints) + roundNum(dayInstructorUpVotes)} total
                                  points, including {instructorPoints} points for collecting instructors' contact info
                                  and {dayInstructorUpVotes} points for casting 16 up-voting per day on other's
                                  collected data.
                                </div>
                                <div>You collected {roundNum(instructorsToday)} / 7 instructors' info today.</div>
                                <div>
                                  You cast {roundNum(upvotedInstructorsToday)} / 16 up-votes today on others' collected
                                  instructors' data.
                                </div>
                              </div>
                            )
                          }
                        >
                          <Button
                            id="InstructorPoints"
                            className={activePage === "AddInstructor" ? "ActiveNavLink" : "NavLink"}
                            onClick={event => navigate("/Activities/AddInstructor")}
                          >
                            👨‍🏫{" "}
                            {projectPoints.dayInstructorUpVotes
                              ? roundNum(instructorPoints)
                              : roundNum(instructorPoints) + roundNum(dayInstructorUpVotes)}{" "}
                            <br />{" "}
                            {projectPoints.dayInstructorUpVotes
                              ? "✔ " + roundNum(dayInstructorUpVotes)
                              : "🌞 " + instructorsToday + " / 7"}
                            <br /> {projectPoints.dayInstructorUpVotes ? "🌞" : "✅"}{" "}
                            {roundNum(upvotedInstructorsToday)} / 16
                          </Button>
                        </Tooltip>
                      ) : null}
                      {projectPoints.administratorsPoints ? (
                        <Tooltip
                          title={
                            projectPoints.dayAdministratorUpVotes ? (
                              <div>
                                <div>
                                  You've earned {roundNum(administratorPoints)} administrator points from others' votes
                                  and {roundNum(dayAdministratorUpVotes)} points for casting 16 upvotes per day on
                                  others' collected data.
                                </div>
                                <div>
                                  You cast {roundNum(upvotedAdministratorsToday)} / 16 up-votes today on others'
                                  collected administrators' data.
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div>
                                  You've earned {roundNum(administratorPoints) + roundNum(dayAdministratorUpVotes)}{" "}
                                  total points, including {roundNum(administratorPoints)} points for collecting
                                  administrators' contact info and {dayAdministratorUpVotes} points for casting 16
                                  up-voting per day on other's collected data.
                                </div>
                                <div>You collected {roundNum(administratorsToday)} / 7 administrators' info today.</div>
                                <div>
                                  You cast {roundNum(upvotedAdministratorsToday)} / 16 up-votes today on others'
                                  collected administrators' data.
                                </div>
                              </div>
                            )
                          }
                        >
                          <Button
                            id="AdministratorPoints"
                            className={activePage === "AddAdministrator" ? "ActiveNavLink" : "NavLink"}
                            onClick={event => navigate("/Activities/AddAdministrator")}
                          >
                            💼{" "}
                            {projectPoints.dayAdministratorUpVotes
                              ? roundNum(administratorPoints)
                              : roundNum(administratorPoints) + roundNum(dayAdministratorUpVotes)}{" "}
                            <br />{" "}
                            {projectPoints.dayAdministratorUpVotes
                              ? "✔ " + roundNum(dayAdministratorUpVotes)
                              : "🌞 " + roundNum(administratorsToday) + " / 7"}
                            <br /> {projectPoints.dayAdministratorUpVotes ? "🌞" : "✅"}{" "}
                            {roundNum(upvotedAdministratorsToday)} / 16
                          </Button>
                        </Tooltip>
                      ) : null}
                      {projectPoints.gradingPoints ? (
                        <Tooltip
                          title={
                            <div>
                              <div>You've earned {roundNum(gradingPoints)} total 🧠 free-recall grading points.</div>
                              <div>
                                From that total, we've already excluded your negative {roundNum(negativeGradingPoints)}{" "}
                                ❌ points.
                              </div>
                              <div>
                                This means, 2 X {roundNum(gradingPoints) + roundNum(negativeGradingPoints)} times at
                                least 3 other researchers have agreed with you on existance or non-existance of a
                                specific phrase in a free-recall response. Also, 2 x {roundNum(negativeGradingPoints)}{" "}
                                times exactly 3 out of 4 researchers agreed with each other on existance (non-existance)
                                of a specific key phrase in a free-recall response by a participant, BUT you opposed
                                their majority of votes. So, you got a 0.5 ❌ negative point for each of those cases.
                              </div>
                            </div>
                          }
                        >
                          <Button
                            id="FreeRecallGrading"
                            className={activePage === "FreeRecallGrading" ? "ActiveNavLink" : "NavLink"}
                            onClick={event => navigate("/Activities/FreeRecallGrading")}
                          >
                            🧠 {roundNum(gradingPoints)} <br /> ❌ {roundNum(negativeGradingPoints)}
                          </Button>
                        </Tooltip>
                      ) : null}
                      {projectPoints.commentsPoints ? (
                        <Tooltip
                          title={
                            <div>
                              You've earned {roundNum(positiveCodesPoints)} total 💬 coding participants responses and{" "}
                              {roundNum(negativeCodesPionts)} ❌ negative point.
                            </div>
                          }
                        >
                          <Button
                            id="CodeFeedback"
                            className={activePage === "CodeFeedback" ? "ActiveNavLink" : "NavLink"}
                            onClick={event => navigate("/Activities/CodeFeedback")}
                          >
                            💬 {roundNum(positiveCodesPoints)}
                            <br /> ❌ {roundNum(negativeCodesPionts)}
                          </Button>
                        </Tooltip>
                      ) : null}
                    </Box>
                    <Tooltip title="Additional Resources">
                      <IconButton onClick={handleOtherPagesMenuOpen}>
                        <ArrowDropDownIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}

                {fullname && (
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
                )}
              </Box>
            </Toolbar>
          </AppBar>
          {/* {projects.length > 0 && renderProjectsMenu} */}
          {fullname && renderProfileMenu}
          {fullname && renderOtherPagesMenu}
        </Box>
      )}
      <Outlet />
    </>
  );
};

export default RouterNav;
