import React from "react";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "./modules/components/Typography";
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

const CookiePolicy = () => {
  return (
    <Box
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
      />
      <Box sx={{ margin: 7 }}>
        <Typography variant="h1" gutterBottom marked="center" align="center">
          1Cademy Communities
        </Typography>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Accordion 1</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
              eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <AppFooter />
    </Box>
  );
};

export default withRoot(CookiePolicy);
