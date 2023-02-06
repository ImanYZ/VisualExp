import React from "react";

import Box from "@mui/material/Box";

import AppAppBar from "./modules/views/AppAppBar";
import AppFooter from "./modules/views/AppFooter";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";
import AppAppBar2 from "./modules/views/AppAppBar2";
import { darkblue } from "./Communities";

const switchSection = newValue => event => {
  if (newValue > 0 && newValue < sectionsOrder.length - 1) {
    window.location.replace("/#" + sectionsOrder[newValue + 1].id);
  }
};

const homeClick = event => {
  window.location.replace("/");
};

const joinUsClick = event => {
  window.location.replace("/#JoinUsSection");
};

const PagesNavbar = ({ children, tutorial, communities, thisPage, newHeader = false, theme = "light" }) => {
  return (
    <Box
      id="ScrollableContainer"
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        backgroundColor: theme==="dark" ? darkblue:"none"
      }}
    >
      {!newHeader && (
        <AppAppBar
          switchSection={switchSection}
          homeClick={homeClick}
          joinUsClick={joinUsClick}
          tutorial={tutorial}
          communities={communities}
          thisPage={thisPage}
          section={5}
        />
      )}

      {newHeader && (
        <AppAppBar2
          switchSection={switchSection}
          homeClick={homeClick}
          joinUsClick={joinUsClick}
          tutorial={tutorial}
          communities={communities}
          thisPage={thisPage}
          section={5}
        />
      )}

      <Box
        sx={{
          margin: { xs: 0, sm: "4px", md: "10px", lg: "16px", xl: "25px" }
        }}
      >
        {children}
      </Box>
      <AppFooter />
    </Box>
  );
};

export default withRoot(PagesNavbar);
