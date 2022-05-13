import React from "react";

import Box from "@mui/material/Box";

import AppAppBar from "./AppAppBar";
import AppFooter from "./AppFooter";
import withRoot from "./withRoot";

import sectionsOrder from "./sectionsOrder";

const switchSection = (newValue) => (event) => {
  if (newValue > 0 && newValue < sectionsOrder.length - 1) {
    window.location.replace("/Home#" + sectionsOrder[newValue + 1].id);
  }
};

const homeClick = (event) => {
  window.location.replace("/Home");
};

const joinUsClick = (event) => {
  window.location.replace("/Home#JoinUsSection");
};

const PagesNavbar = ({ children, tutorial, communities, thisPage }) => {
  return (
    <Box
      id="ScrollableContainer"
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
      <AppAppBar
        switchSection={switchSection}
        homeClick={homeClick}
        joinUsClick={joinUsClick}
        tutorial={tutorial}
        communities={communities}
        thisPage={thisPage}
        section={5}
      />
      <Box
        sx={{
          margin: { xs: 0, sm: "4px", md: "10px", lg: "16px", xl: "25px" },
        }}
      >
        {children}
      </Box>
      <AppFooter />
    </Box>
  );
};

export default withRoot(PagesNavbar);
