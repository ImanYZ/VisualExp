import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

// import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
// import Brightness4Icon from "@mui/icons-material/Brightness4";
// import Brightness7Icon from "@mui/icons-material/Brightness7";

import {
  firebaseState,
  emailState,
  fullnameState,
  resumeUrlState,
  transcriptUrlState,
  applicationsSubmittedState,
  colorModeState,
  leadingState
} from "../../../../store/AuthAtoms";
import { hasScheduledState, completedExperimentState } from "../../../../store/ExperimentAtoms";

import AppBar from "../components/AppBar";
import Toolbar from "../components/Toolbar";

import sectionsOrder from "./sectionsOrder";
import { getFullname } from "../../../../utils";

import LogoDarkMode from "../../../../assets/DarkModeLogo.svg";

const LinkTab = props => {
  return (
    <Tooltip title={props.titl}>
      <Tab
        onClick={event => {
          event.preventDefault();
          props.onClick(event);
        }}
        color="inherit"
        {...props}
      />
    </Tooltip>
  );
};

const AppAppBarExp = props => {
  const firebase = useRecoilValue(firebaseState);
  const [email, setEmail] = useRecoilState(emailState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const setHasScheduled = useSetRecoilState(hasScheduledState);
  const [completedExperiment, setCompletedExperiment] = useRecoilState(completedExperimentState);
  const setApplicationsSubmitted = useSetRecoilState(applicationsSubmittedState);
  const setResumeUrl = useSetRecoilState(resumeUrlState);
  const setTranscriptUrl = useSetRecoilState(transcriptUrlState);
  const leading = useRecoilValue(leadingState);

  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [colorMode, setColorMode] = useRecoilState(colorModeState);

  useEffect(() => {
    return firebase.auth.onAuthStateChanged(async user => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uEmail = user.email.toLowerCase();
        const userDocs = await firebase.db.collection("users").where("email", "==", uEmail).get();
        if (userDocs.docs.length > 0) {
          setEmail(uEmail.toLowerCase());
          const userData = userDocs.docs[0].data();
          if (!userData.firstname || !userData.lastname) {
            window.location.href = "/";
          }
          setFullname(getFullname(userData.firstname, userData.lastname));
          if (userData.applicationsSubmitted) {
            setApplicationsSubmitted(userData.applicationsSubmitted);
          }
          if ("Resume" in userData) {
            setResumeUrl(userData["Resume"]);
          }
          if ("Transcript" in userData) {
            setTranscriptUrl(userData["Transcript"]);
          }
          if ("projectDone" in userData && userData.projectDone) {
            setHasScheduled(true);
            setCompletedExperiment(true);
          } else {
            const scheduleDocs = await firebase.db.collection("schedule").where("email", "==", uEmail).get();
            const nowTimestamp = firebase.firestore.Timestamp.fromDate(new Date());
            let allPassed = true;
            if (scheduleDocs.docs.length >= 3) {
              let scheduledSessions = 0;
              for (let scheduleDoc of scheduleDocs.docs) {
                const scheduleData = scheduleDoc.data();
                if (scheduleData.order) {
                  scheduledSessions += 1;
                  if (scheduleData.session >= nowTimestamp) {
                    allPassed = false;
                  }
                }
              }
              if (scheduledSessions >= 3) {
                setHasScheduled(true);
                if (allPassed) {
                  setCompletedExperiment(true);
                }
              }
            }
          }
        } else {
          window.location.href = "/";
        }
      } else {
        // User is signed out
        console.log("Signing out!");
        setFullname("");
        setEmail("");
        setHasScheduled(false);
        setCompletedExperiment(false);
        setApplicationsSubmitted({});
      }
    });
  }, [firebase]);

  const signOut = async event => {
    console.log("Signing out!");
    setEmail("");
    setFullname("");
    await firebase.logout();
  };

  const toggleColorMode = event => {
    setColorMode(prevMode => (prevMode === "light" ? "dark" : "light"));
  };

  const handleProfileMenuOpen = event => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };

  const renderProfileMenu = (
    <Menu id="ProfileMenu" anchorEl={profileMenuOpen} open={isProfileMenuOpen} onClose={handleProfileMenuClose}>
      {fullname && email && (
        <MenuItem disabled sx={{ flexGrow: 3, color: "black", opacity: "1 !important" }}>
          {fullname}
        </MenuItem>
      )}
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
          <LogoutIcon /> <span id="LogoutText">Logout</span>
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <div>
      <AppBar>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Tooltip title="1Cademy's Landing Page">
            <Box
              variant="h6"
              underline="none"
              color="inherit"
              onClick={props.homeClick}
              sx={{
                fontSize: 24,
                margin: "7px 19px 0px -10px",
                cursor: "pointer"
              }}
            >
              <img src={LogoDarkMode} alt="logo" width="52px" />
            </Box>
          </Tooltip>

        </Toolbar>
      </AppBar>
      {fullname && renderProfileMenu}
      <Toolbar />
    </div>
  );
};

export default AppAppBarExp;
