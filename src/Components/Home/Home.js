import React, { useState } from "react";

import Box from "@mui/material/Box";

import Communities from "./modules/views/Communities";
import AppFooter from "./modules/views/AppFooter";
import Landing from "./modules/views/Landing";
import Values from "./modules/views/Values";
import HowItWorks from "./modules/views/HowItWorks";
import ProductCTA from "./modules/views/ProductCTA";
import AppAppBar from "./modules/views/AppAppBar";
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
        ).offsetHeight;
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

  return (
    <Box sx={{ mb: "70px" }}>
      <AppAppBar
        section={section}
        setSection={setSection}
        setNotSectionSwitching={setNotSectionSwitching}
      />
      <Box
        onScroll={updatePosition}
        sx={{
          height: "100vh",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <Landing />
        <HowItWorks section={section} />
        <Communities />
        <Values />
        <UniversitiesMap theme={"Light"} />
        <ProductCTA />
        {/* <ProductSmokingHero /> */}
        <AppFooter />
      </Box>
    </Box>
  );
}

export default withRoot(Index);
