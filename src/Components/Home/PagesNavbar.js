import React from "react";

import Box from "@mui/material/Box";

import AppAppBar from "./modules/views/AppAppBar";
import AppFooter from "./modules/views/AppFooter";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";

const switchSection = (newValue) => (event) => {
  window.location.replace("/Home#" + sectionsOrder[newValue + 1].id);
};

const homeClick = (event) => {
  window.location.replace("/Home");
};

const joinUsClick = (event) => {
  window.location.replace("/Home#JoinUsSection");
};

const PagesNavbar = ({ children, tutorial, communities }) => {
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
