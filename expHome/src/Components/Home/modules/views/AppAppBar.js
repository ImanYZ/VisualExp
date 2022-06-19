import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

// import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
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
  leadingState,
} from "../../../../store/AuthAtoms";
import {
  hasScheduledState,
  completedExperimentState,
} from "../../../../store/ExperimentAtoms";

import AppBar from "../components/AppBar";
import Toolbar from "../components/Toolbar";

import sectionsOrder from "./sectionsOrder";
import { getFullname } from "../../../../utils/general";

import LogoDarkMode from "../../../../assets/DarkModeLogo.svg";

const LinkTab = (props) => {
  return (
    <Tooltip title={props.titl}>
      <Tab
        onClick={(event) => {
          event.preventDefault();
          props.onClick(event);
        }}
        color="inherit"
        {...props}
      />
    </Tooltip>
  );
};

const AppAppBar = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const [email, setEmail] = useRecoilState(emailState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const setHasScheduled = useSetRecoilState(hasScheduledState);
  const [completedExperiment, setCompletedExperiment] = useRecoilState(
    completedExperimentState
  );
  const setApplicationsSubmitted = useSetRecoilState(
    applicationsSubmittedState
  );
  const setResumeUrl = useSetRecoilState(resumeUrlState);
  const setTranscriptUrl = useSetRecoilState(transcriptUrlState);
  const leading = useRecoilValue(leadingState);

  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [colorMode, setColorMode] = useRecoilState(colorModeState);

  useEffect(() => {
    return firebase.auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uEmail = user.email.toLowerCase();
        const userDocs = await firebase.db
          .collection("users")
          .where("email", "==", uEmail)
          .get();
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
            const scheduleDocs = await firebase.db
              .collection("schedule")
              .where("email", "==", uEmail)
              .get();
            const nowTimestamp = firebase.firestore.Timestamp.fromDate(
              new Date()
            );
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

  const signOut = async (event) => {
    console.log("Signing out!");
    setEmail("");
    setFullname("");
    await firebase.logout();
  };

  const toggleColorMode = (event) => {
    setColorMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };

  const renderProfileMenu = (
    <Menu
      id="ProfileMenu"
      anchorEl={profileMenuOpen}
      open={isProfileMenuOpen}
      onClose={handleProfileMenuClose}
    >
      {fullname && email && (
        <MenuItem
          disabled
          sx={{ flexGrow: 3, color: "black", opacity: "1 !important" }}
        >
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
                cursor: "pointer",
              }}
            >
              <img src={LogoDarkMode} alt="logo" width="52px" />
            </Box>
          </Tooltip>
          <Tabs
            value={1}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="scrollable auto tabs navigation bar"
            sx={{
              marginLeft: "auto",
              fontWeight: 400,
              "& .MuiTab-root": {
                color: "#AAAAAA",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "common.white",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "secondary.main",
              },
            }}
          >
            {[0, 1, 2, 3, 4].map((idx) => {
              return (
                <LinkTab
                  key={"Key" + idx}
                  onClick={props.switchSection(idx)}
                  label={sectionsOrder[idx + 1].label}
                  titl={sectionsOrder[idx + 1].title}
                />
              );
            })}
            {(leading || props.thisPage) && (
              <LinkTab
                onClick={props.switchSection(5)}
                label={props.thisPage}
                titl={props.thisPage}
              />
            )}
            {fullname && !props.tutorial && completedExperiment && (
              <Tooltip title="1Cademy Tutorial">
                <Tab
                  component="a"
                  href="/tutorial"
                  target="_blank"
                  label="Tutorial"
                  color="inherit"
                />
              </Tooltip>
            )}
          </Tabs>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            {/* <Box
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                color: "text.primary",
                borderRadius: 1,
                p: 3,
              }}
            >
              {colorMode} mode
              <IconButton
                sx={{ ml: 1 }}
                onClick={toggleColorMode}
                color="inherit"
              >
                {colorMode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Box> */}
            {!props.tutorial && !props.joinNowSec && !props.communities && (
              <Tooltip title="Apply to join 1Cademy">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={props.joinUsClick}
                  sx={{
                    fontSize: 16,
                    color: "common.white",
                    ml: 2.5,
                    borderRadius: 40,
                  }}
                >
                  Apply!
                </Button>
              </Tooltip>
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
      {fullname && renderProfileMenu}
      <Toolbar />
    </div>
  );
};

export default AppAppBar;
