import React, { useState } from "react";

import Box from "@mui/material/Box";

import Communities from "./modules/views/Communities";
import ProductSmokingHero from "./modules/views/ProductSmokingHero";
import AppFooter from "./modules/views/AppFooter";
import Landing from "./modules/views/Landing";
import Values from "./modules/views/Values";
import HowItWorks from "./modules/views/HowItWorks";
import ProductCTA from "./modules/views/ProductCTA";
import AppAppBar from "./modules/views/AppAppBar";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";

function Index() {
  const [section, setSection] = useState(-1);

  const updatePosition = (event) => {
    let cumulativeHeight = 0;
    for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
      const sectOffsetHeight = window.document.getElementById(
        sectionsOrder[sIdx].id
      ).offsetHeight;
      cumulativeHeight += sectOffsetHeight;
      if (event.target.scrollTop < cumulativeHeight) {
        setSection(sIdx - 1);
        break;
      }
    }
  };

  return (
    <Box
      onScroll={updatePosition}
      sx={{ height: "100vh", overflowY: "auto", overflowX: "auto" }}
    >
      <AppAppBar section={section} setSection={setSection} />
      <Landing />
      <HowItWorks section={section} />
      <Communities />
      <Values />
      <ProductCTA />
      <ProductSmokingHero />
      <AppFooter />
    </Box>
  );
}

export default withRoot(Index);
