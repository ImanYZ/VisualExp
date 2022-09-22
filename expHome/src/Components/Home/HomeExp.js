import React, { useState } from "react";

import Box from "@mui/material/Box";

import AppFooter from "./modules/views/AppFooter";
import LandingExp from "./modules/views/LandingExp";
import Progress from "./modules/views/Progress";

import AppAppBarExp from "./modules/views/AppAppBarExp";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";

function Index() {
  const [section, setSection] = useState(0);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);

  const updatePosition = event => {
    if (notSectionSwitching) {
      let cumulativeHeight = 0;
      for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
        const sectOffsetHeight = window.document.getElementById(sectionsOrder[sIdx].id).scrollHeight;
        cumulativeHeight += sectOffsetHeight;
        if (event.target.scrollTop < cumulativeHeight) {
          setSection(sIdx - 1);
          window.history.replaceState(null, sectionsOrder[sIdx].title, "#" + sectionsOrder[sIdx].id);
          break;
        }
      }
    }
  };

  const switchSection = newValue => event => {
    setNotSectionSwitching(false);
    setSection(newValue);
    let cumulativeHeight = 0;
    for (let sIdx = -1; sIdx < newValue; sIdx++) {
      const sectOffsetHeight = window.document.getElementById(sectionsOrder[sIdx + 1].id).scrollHeight;
      cumulativeHeight += sectOffsetHeight;
    }
    window.document.getElementById("ScrollableContainer").scroll({
      top: cumulativeHeight,
      left: 0,
      behavior: "smooth"
    });
    window.history.replaceState(null, sectionsOrder[newValue + 1].title, "#" + sectionsOrder[newValue + 1].id);
    setTimeout(() => {
      setNotSectionSwitching(true);
    }, 1000);
  };

  const homeClick = event => {
    event.preventDefault();
    switchSection(-1)(event);
  };

  const joinUsClick = event => {
    event.preventDefault();
    switchSection(sectionsOrder.length - 2)(event);
  };

  return (
    <Box
      id="ScrollableContainer"
      onScroll={updatePosition}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto"
      }}
    >
      <AppAppBarExp
        section={section}
        joinNowSec={section === sectionsOrder.length - 2}
        switchSection={switchSection}
        homeClick={homeClick}
        joinUsClick={joinUsClick}
        thisPage={section === sectionsOrder.length - 2 ? "Apply!" : undefined}
      />
      <LandingExp />
      <Progress />
      <AppFooter />
    </Box>
  );
}

export default withRoot(Index);
