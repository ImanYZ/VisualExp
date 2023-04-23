import React, { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import MenuIcon from "@mui/icons-material/Menu";
// import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import BiotechIcon from "@mui/icons-material/Biotech";
import CloseIcon from "@mui/icons-material/Close";
// import Brightness4Icon from "@mui/icons-material/Brightness4";
// import Brightness7Icon from "@mui/icons-material/Brightness7";

import { firebaseState, emailState, fullnameState, colorModeState, leadingState } from "../../../../store/AuthAtoms";
import { notAResearcherState } from "../../../../store/ProjectAtoms";
import { completedExperimentState } from "../../../../store/ExperimentAtoms";

import sectionsOrder from "./sectionsOrder";

import LogoDarkMode from "../../../../assets/1Cademy-head.svg";
import { Link } from "@mui/material";
import { Stack } from "@mui/system";
import AppFooter from "./AppFooter";

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
        sx={{ textTransform: "capitalize", fontWeight: "regular" }}
      />
    </Tooltip>
  );
};

const MenuBar = ({ items, switchSection, thisPage, tutorial }) => {
  const [completedExperiment /* setCompletedExperiment */] = useRecoilState(completedExperimentState);
  const leading = useRecoilValue(leadingState);
  const [fullname /* setFullname */] = useRecoilState(fullnameState);

  return (
    <Stack
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{
        position: "absolute",
        top: "50px",
        bottom: "0px",
        left: "0px",
        right: "0px",
        background: "white",
        zIndex: "12"
      }}
    >
      <Stack flex={1} direction={"column"} alignItems={"center"} spacing="32px" padding={"16px"}>
        {items.map(idx => {
          return (
            <Tooltip title={sectionsOrder[idx + 1].title}>
              <Link
                key={"Key" + idx}
                onClick={switchSection(idx)}
                sx={{ color: "common.white", cursor: "pointer", textDecoration: "none" }}
              >
                {sectionsOrder[idx + 1].label}
              </Link>
            </Tooltip>
          );
        })}
        {(leading || thisPage) && (
          <Tooltip title={thisPage}>
            <Link
              onClick={switchSection(5)}
              sx={{ color: "common.white", textDecoration: "none", borderBottom: "solid 2px #EF7E2B" }}
            >
              {thisPage}
            </Link>
          </Tooltip>
        )}
        {fullname && !tutorial && completedExperiment && (
          <Tooltip title="1Cademy Tutorial">
            <Link
              href="/tutorial"
              target="_blank"
              color="inherit"
              sx={{ color: "common.white", textDecoration: "none" }}
            >
              Tutorial
            </Link>
          </Tooltip>
        )}
      </Stack>
      <AppFooter />
    </Stack>
  );
};

const AppAppBar2 = props => {
  const firebase = useRecoilValue(firebaseState);
  const [email, setEmail] = useRecoilState(emailState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const completedExperiment = useRecoilValue(completedExperimentState);
  const leading = useRecoilValue(leadingState);
  const notAResearcher = useRecoilValue(notAResearcherState);
  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const setColorMode = useSetRecoilState(colorModeState);
  const [openMenu, setOpenMenu] = useState(false);

  const navigateTo = useNavigate();

  const signOut = async event => {
    setEmail("");
    setFullname("");
    await firebase.logout();
    navigateTo("/");
  };
  const navigateToExperiment = () => {
    if (!notAResearcher) {
      navigateTo("/Activities/");
    } else {
      navigateTo("/Activities/experiment");
    }
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
        <MenuItem disabled sx={{ flexGrow: 3, color: "common.white", opacity: "1 !important" }}>
          {fullname}
        </MenuItem>
      )}
      {fullname && email && (
        <>
          {
            <MenuItem sx={{ flexGrow: 3 }} onClick={navigateToExperiment}>
              <BiotechIcon /> <span id="ExperimentActivities">Experiment Activities</span>
            </MenuItem>
          }
          <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
            <LogoutIcon /> <span id="LogoutText">Logout</span>
          </MenuItem>
        </>
      )}
    </Menu>
  );
  const signUpHandler = () => {
    navigateTo("/Activities");
  };
  return (
    <>
      <Box
        sx={{
          background: "rgba(0,0,0,.72)",
          backdropFilter: "saturate(180%) blur(20px)",
          position: "sticky",
          top: "0",
          zIndex: "10"
        }}
      >
        <Stack
          direction={"row"}
          justifyContent="space-between"
          alignItems="center"
          spacing={"16px"}
          sx={{ maxWidth: "1280px", margin: "auto", height: "50px" }}
        >
          <Stack direction={"row"} alignItems="center" spacing={"16px"}>
            <Tooltip title="1Cademy's Landing Page">
              <img src={LogoDarkMode} alt="logo" width="30px" style={{ cursor: "pointer" }} onClick={props.homeClick} />
            </Tooltip>
            <Stack
              direction={"row"}
              aria-label="scrollable auto tabs navigation bar"
              spacing={"16px"}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{
                display: {
                  xs: "none",
                  sm: "flex"
                }
              }}
            >
              {[0, 1, 2, 3, 4].map(idx => {
                return (
                  <Tooltip key={idx} title={sectionsOrder[idx + 1].title}>
                    <Link
                      key={"Key" + idx}
                      onClick={props.switchSection(idx)}
                      sx={{ color: "common.white", cursor: "pointer", textDecoration: "none" }}
                    >
                      {sectionsOrder[idx + 1].label}
                    </Link>
                  </Tooltip>
                );
              })}
              {(leading || props.thisPage) && (
                <Tooltip title={props.thisPage}>
                  <Link
                    onClick={props.switchSection(5)}
                    sx={{ color: "common.white", textDecoration: "none", borderBottom: "solid 2px #EF7E2B" }}
                  >
                    {props.thisPage}
                  </Link>
                </Tooltip>
              )}
              {fullname && !props.tutorial && completedExperiment && (
                <Tooltip title="1Cademy Tutorial">
                  <Link
                    href="/tutorial"
                    target="_blank"
                    color="inherit"
                    sx={{ color: "common.white", textDecoration: "none" }}
                  >
                    Tutorial
                  </Link>
                </Tooltip>
              )}
            </Stack>
          </Stack>
          <Stack direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
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
            {/* !props.tutorial && !props.joinNowSec && !props.communities && */}
            {!fullname && (
              <Tooltip title="Apply to join 1Cademy">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={props.joinUsClick}
                  sx={{
                    fontSize: 14,
                    color: "common.white",
                    borderRadius: 40,
                    height: "25px",
                    width: "60px",
                    textTransform: "capitalize"
                  }}
                >
                  Apply
                </Button>
              </Tooltip>
            )}
            {fullname ? (
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
            ) : (
              <Tooltip title="SIGN IN/UP">
                <Button
                  variant="contained"
                  onClick={signUpHandler}
                  sx={{
                    fontSize: 14,
                    color: "common.white",
                    borderRadius: 40,
                    height: "25px",
                    textTransform: "capitalize",
                    borderColor: "white"
                  }}
                >
                  Sign In/Up
                </Button>
              </Tooltip>
            )}
            {
              <IconButton
                onClick={() => setOpenMenu(prev => !prev)}
                sx={{ display: { xs: "flex", sm: "none" }, alignSelf: "center" }}
                size="small"
              >
                {openMenu ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            }
          </Stack>
        </Stack>
        {fullname && renderProfileMenu}
      </Box>
      {openMenu && (
        <MenuBar
          items={[0, 1, 2, 3, 4]}
          switchSection={props.switchSection}
          thisPage={props.thisPage}
          tutorial={props.tutorial}
        />
      )}
    </>
  );
};

export default AppAppBar2;
