import LogoutIcon from "@mui/icons-material/Logout";
import BiotechIcon from "@mui/icons-material/Biotech";
import React, { useState } from "react";

import Box from "@mui/material/Box";

import withRoot from "./modules/withRoot";

import { Menu, MenuItem } from "@mui/material";
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
import AppFooter from "./modules/views/AppFooter2";
import JoinUs from "./modules/views/JoinUs";

// const Values = React.lazy(() => import("./modules/views/Values"));
// const What = React.lazy(() => import("./modules/views/What"));
// const UniversitiesMap = React.lazy(() => import("./modules/views/UniversitiesMap/UniversitiesMap"));
// const WhoWeAre = React.lazy(() => import("./modules/views/WhoWeAreWrapper"));
// const JoinUs = React.lazy(() => import("./modules/views/JoinUsWrapper"));

export const gray03 = "#AAAAAA";

export const SECTION_WITH_ANIMATION = 1;
export const HEADER_HEIGHT = 80;
export const HEADER_HEIGHT_MOBILE = 72;

function Index() {


  // const onSwitchSection = (newSelectedSectionId: string) => {
  //   isScrolling.current = true;
  //   if (timer.current) clearTimeout(timer.current);

  //   timer.current = setTimeout(() => {
  //     isScrolling.current = false;
  //     if (timer.current) clearTimeout(timer.current);
  //   }, 1000);

  //   setSelectedSectionId(newSelectedSectionId);
  //   const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
  //   if (window.location.hash === newHash) return;
  //   window.location.hash = newHash;
  // };

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

      <Box
        id="join-us"
        sx={{
          py: { xs: "64px", sm: "96px" },
          maxWidth: "1216px",
          m: "auto",
          scrollMarginTop: "16px"
        }}
      >
        <JoinUs />
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
