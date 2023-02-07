import LogoutIcon from "@mui/icons-material/Logout";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccountCircle from "@mui/icons-material/AccountCircle";
import React, { useState } from "react";

import LogoDarkMode from "../../assets/DarkModeLogoMini.png";
import Box from "@mui/material/Box";

import AppFooter from "./modules/views/AppFooter";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";
import { Button, IconButton, Menu, MenuItem, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import { emailState, firebaseState, fullnameState } from "../../store/AuthAtoms";
import { useNavigate } from "react-router-dom";
import { notAResearcherState } from "../../store/ProjectAtoms";
import { showSignInorUpState } from "../../store/GlobalAtoms";
import { HeroMemoized } from "./modules/views/Hero";
import { darkblue } from "./Communities";
import Mechanism, { MECHANISM_ITEMS } from "./modules/views/Mechanism";
import Magnitude from "./modules/views/Magnitude";
                
import UniversitiesMap from "./modules/views/UniversitiesMap/UniversitiesMap";
import Benefits from "./modules/views/Benefits";
import Topics from "./modules/views/Topics";
import Systems from "./modules/views/Systems";
import About from "./modules/views/About";
import Papers from "./modules/views/Papers";
import Join from "./modules/views/Join";
import { SectionWrapper } from "./modules/views/SectionWrapper";
import { ONE_CADEMY_SECTIONS } from "./modules/views/sectionItems";

// const Values = React.lazy(() => import("./modules/views/Values"));
// const What = React.lazy(() => import("./modules/views/What"));
// const UniversitiesMap = React.lazy(() => import("./modules/views/UniversitiesMap/UniversitiesMap"));
// const WhoWeAre = React.lazy(() => import("./modules/views/WhoWeAreWrapper"));
// const JoinUs = React.lazy(() => import("./modules/views/JoinUsWrapper"));

const HEADER_HEIGTH = 70;
export const gray03 = "#AAAAAA";

export const SECTION_WITH_ANIMATION = 1;
export const HEADER_HEIGHT = 80;
export const HEADER_HEIGHT_MOBILE = 72;

function Index() {
  const firebase = useRecoilValue(firebaseState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const showSignInorUp = useRecoilValue(showSignInorUpState);
  const [email, setEmail] = useRecoilState(emailState);
  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [notAResearcher /* setNotAResearcher */] = useRecoilState(notAResearcherState);
  const navigateTo = useNavigate();
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isMovil = useMediaQuery("(max-width:600px)");

  const handleProfileMenuOpen = event => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };

  const navigateToExperiment = () => {
    if (!notAResearcher) {
      navigateTo("/Activities/");
    } else {
      navigateTo("/Activities/experiment");
    }
  };

  const signOut = async event => {
    // console.log("Signing out!");
    setEmail("");
    setFullname("");
    await firebase.logout();
    navigateTo("/");
  };

  const renderProfileMenu = (
    <Menu id="ProfileMenu" anchorEl={profileMenuOpen} open={isProfileMenuOpen} onClose={handleProfileMenuClose}>
      {fullname && email && (
        <MenuItem disabled sx={{ flexGrow: 3, color: "black", opacity: "1 !important" }}>
          {fullname}
        </MenuItem>
      )}
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={navigateToExperiment}>
          <BiotechIcon /> <span id="ExperimentActivities">Experiment Activities</span>
        </MenuItem>
      )}
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
          <LogoutIcon /> <span id="LogoutText">Logout</span>
        </MenuItem>
      )}
    </Menu>
  );

  const signUpHandler = () => {
    navigateTo("/auth");
  };

  return (
    <Box
      id="ScrollableContainer"
      // onScroll={e => detectScrollPosition(e)}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        position: "relative",
        backgroundColor: darkblue
        // zIndex: -3
      }}
    >
      <Box
        component={"header"}
        sx={{ position: "sticky", width: "100%", top: "0px", zIndex: 12, display: "flex", justifyContent: "center" }}
      >
        <Box
          sx={{
            height: HEADER_HEIGTH,
            width: "100%",
            background: "rgba(0,0,0,.72)",
            backdropFilter: "saturate(180%) blur(20px)"

            // filter: "blur(1px)"
          }}
          // style={{willChange:"filter"}}
        />
        <Box
          sx={{
            width: "100%",
            maxWidth: "980px",
            height: HEADER_HEIGTH,
            px: isDesktop ? "0px" : "10px",
            position: "absolute",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Stack
            spacing={"20px"}
            alignItems={"center"}
            justifyContent={"space-between"}
            direction={"row"}
            sx={{ color: "#f8f8f8" }}
          >
            <img src={LogoDarkMode} alt="logo" width="52px" height={"59px"} />

            {!isMovil && (
              <>
                <Tooltip title={sectionsOrder[1].title}>
                  <Typography sx={{ cursor: "pointer" }}>{sectionsOrder[1].label}</Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[2].title}>
                  <Typography sx={{ cursor: "pointer" }}>{sectionsOrder[2].label}</Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[3].title}>
                  <Typography sx={{ cursor: "pointer" }}>{sectionsOrder[3].label}</Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[4].title}>
                  <Typography sx={{ cursor: "pointer" }}>{sectionsOrder[4].label}</Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[5].title}>
                  <Typography sx={{ cursor: "pointer" }}>{sectionsOrder[5].label}</Typography>
                </Tooltip>
              </>
            )}
          </Stack>
          <Box>
            {
              <Tooltip title="Apply to join 1Cademy">
                <Button
                  variant="contained"
                  color="secondary"
                  size={isMovil ? "small" : "medium"}
                  sx={{
                    fontSize: 16,
                    color: "common.white",
                    ml: 2.5,
                    borderRadius: 40
                  }}
                >
                  Apply!
                </Button>
              </Tooltip>
            }
            {fullname ? (
              <Tooltip title="Account">
                <IconButton
                  size="large"
                  // edge="end"
                  aria-haspopup="true"
                  aria-controls="lock-menu"
                  aria-label={`${fullname}'s Account`}
                  aria-expanded={isProfileMenuOpen ? "true" : undefined}
                  onClick={handleProfileMenuOpen}
                  sx={{
                    color: "common.white"
                  }}
                >
                  <AccountCircle color="inherit" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="SIGN IN/UP">
                <Button
                  variant="contained"
                  onClick={signUpHandler}
                  size={isMovil ? "small" : "medium"}
                  sx={{
                    display: showSignInorUp ? "inline-flex" : "none",
                    fontSize: 16,
                    color: "common.white",
                    ml: 2.5,
                    borderRadius: 40
                  }}
                >
                  SIGN IN/UP
                </Button>
              </Tooltip>
            )}
            {fullname && renderProfileMenu}
          </Box>
        </Box>
      </Box>
      <HeroMemoized headerHeight={HEADER_HEIGHT} headerHeightMobile={HEADER_HEIGHT_MOBILE} />

      <SectionWrapper section={ONE_CADEMY_SECTIONS[1]} textAlign="center">
        <Mechanism mechanisms={MECHANISM_ITEMS} />
      </SectionWrapper>

      <SectionWrapper section={ONE_CADEMY_SECTIONS[2]}>
        <Magnitude />
        <UniversitiesMap theme={"Dark"} />
        
      </SectionWrapper>

      <SectionWrapper section={ONE_CADEMY_SECTIONS[3]}>
        <Benefits />
      </SectionWrapper>

      <SectionWrapper section={ONE_CADEMY_SECTIONS[4]}>
        <Topics />
      </SectionWrapper>

      <SectionWrapper section={ONE_CADEMY_SECTIONS[5]}>
        <Systems />
      </SectionWrapper>

      <SectionWrapper section={ONE_CADEMY_SECTIONS[6]}>
        <About />
        <Papers />
      </SectionWrapper>

      <Box sx={{ py: { xs: "64px", sm: "96px" }, maxWidth: "1216px", m: "auto" }}>
        <Join />
      </Box>

      <AppFooter />
      <link rel="preload" href="artboard-1.riv" as="fetch" crossOrigin="anonymous" />
    </Box>
  );
}

export default withRoot(Index);

// const advanceAnimationTo = (rive, timeInSeconds) => {
//   if (!rive?.animator?.animations[0]) return;

//   const Animator = rive.animator.animations[0];
//   Animator.instance.time = 0;
//   Animator.instance.advance(timeInSeconds);
//   Animator.instance.apply(1);
//   rive.startRendering();
// };
