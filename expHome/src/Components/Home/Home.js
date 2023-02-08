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
import AppHeaderMemoized from "./modules/views/AppHeader2";

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
        backgroundColor: darkblue,
        scrollBehavior: "smooth"
        // zIndex: -3
      }}
    >
      <AppHeaderMemoized page="ONE_CADEMY" sections={ONE_CADEMY_SECTIONS} />
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
