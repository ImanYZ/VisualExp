import React from "react";

import Box from "@mui/material/Box";

import AppAppBar from "./modules/views/AppAppBar";
import AppFooter from "./modules/views/AppFooter";
import AppFooter2 from "./modules/views/AppFooter2";

import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";
import { ONE_CADEMY_SECTIONS } from "./modules/views/sectionItems";
import AppHeaderMemoized from "./modules/views/AppHeader2";
import { darkblue } from "../../utils/colors";

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

const onSwitchSection = newSelectedSectionId => {
  window.location.href = `/#${newSelectedSectionId}`;
};

const PagesNavbar = ({ children, tutorial, communities, thisPage, newHeader = false, theme = "light" }) => {
  return (
    <Box
      id="ScrollableContainer"
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        scrollBehavior: "smooth",
        backgroundColor: theme === "dark" ? darkblue : "none"
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
        // <AppAppBar2
        //   switchSection={switchSection}
        //   homeClick={homeClick}
        //   joinUsClick={joinUsClick}
        //   tutorial={tutorial}
        //   communities={communities}
        //   thisPage={thisPage}
        //   section={5}
        // />
        <AppHeaderMemoized
          sections={ONE_CADEMY_SECTIONS}
          onSwitchSection={onSwitchSection}
          selectedSectionId={-1}

        />
      )}

      <Box
        sx={{
          margin: { xs: 0, sm: "4px", md: "10px", lg: "16px", xl: "25px" }
        }}
      >
        {children}
      </Box>
      {!newHeader ? <AppFooter /> : <AppFooter2 page="COMMUNITIES" />}
    </Box>
  );
};

export default withRoot(PagesNavbar);
