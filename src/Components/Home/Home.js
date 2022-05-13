import React, { useState } from "react";

import Box from "@mui/material/Box";

import What from "./modules/views/What";
import AppFooter from "./modules/views/AppFooter";
import Landing from "./modules/views/Landing";
import Values from "./modules/views/Values";
import HowItWorks from "./modules/views/HowItWorks";
import WhoWeAre from "./modules/views/WhoWeAre";
import AppAppBar from "./modules/views/AppAppBar";
import JoinUs from "./modules/views/JoinUs";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";
import UniversitiesMap from "./modules/views/UniversitiesMap/UniversitiesMap";

function Index() {
  const [section, setSection] = useState(-1);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);

  const updatePosition = (event) => {
    if (notSectionSwitching) {
      let cumulativeHeight = 0;
      for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
        const sectOffsetHeight = window.document.getElementById(
          sectionsOrder[sIdx].id
        ).scrollHeight;
        cumulativeHeight += sectOffsetHeight;
        if (event.target.scrollTop < cumulativeHeight) {
          setSection(sIdx - 1);
          window.history.replaceState(
            null,
            sectionsOrder[sIdx].title,
            "#" + sectionsOrder[sIdx].id
          );
          break;
        }
      }
    }
  };

  const switchSection = (newValue) => (event) => {
    setNotSectionSwitching(false);
    setSection(newValue);
    let cumulativeHeight = 0;
    for (let sIdx = -1; sIdx < newValue; sIdx++) {
      const sectOffsetHeight = window.document.getElementById(
        sectionsOrder[sIdx + 1].id
      ).scrollHeight;
      cumulativeHeight += sectOffsetHeight;
    }
    window.document.getElementById("ScrollableContainer").scroll({
      top: cumulativeHeight,
      left: 0,
      behavior: "smooth",
    });
    // document
    //   .getElementById(sectionsOrder[newValue + 1].id)
    //   .scrollIntoView({
    //     block: "start",
    //     inline: "nearest",
    //     behavior: "smooth",
    //   });
    window.history.replaceState(
      null,
      sectionsOrder[newValue + 1].title,
      "#" + sectionsOrder[newValue + 1].id
    );
    setTimeout(() => {
      setNotSectionSwitching(true);
    }, 1000);
  };

  const homeClick = (event) => {
    event.preventDefault();
    switchSection(-1)(event);
  };

  const joinUsClick = (event) => {
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
        overflowX: "auto",
      }}
    >
      <AppAppBar
        section={section}
        joinNowSec={section === sectionsOrder.length - 2}
        switchSection={switchSection}
        homeClick={homeClick}
        joinUsClick={joinUsClick}
        thisPage={section === sectionsOrder.length - 2 ? "Apply!" : undefined}
      />
      <Landing />
      <HowItWorks section={section} />
      <What />
      <Values />
      <UniversitiesMap theme={"Light"} />
      <WhoWeAre />
      <JoinUs />
      <AppFooter />
    </Box>
  );
}

export default withRoot(Index);
