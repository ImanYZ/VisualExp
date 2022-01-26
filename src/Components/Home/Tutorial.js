import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LinkIcon from "@mui/icons-material/Link";
import EmailIcon from "@mui/icons-material/Email";

import {
  firebaseState,
  emailState,
  fullnameState,
} from "../../store/AuthAtoms";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

import instructions from "./tutorialIntroductionQuestions";

const Tutorial = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);

  const [expanded, setExpanded] = useState(props.commId);

  return (
    <PagesNavbar>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial
      </Typography>
      {instructions.map((instr, idx) => (
        <Accordion
          key={instr.title}
          expanded={expanded === instr.title}
          onChange={handleChange(instr.title)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ fontWeight: "700" }}
            >
              {idx + instr.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    {instr.description}
                  </Typography>
                  <YoutubeEmbed embedId={instr.YouTube} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Community Description
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "left" }}
                  >
                    {instr.description}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </PagesNavbar>
  );
};

export default Tutorial;
