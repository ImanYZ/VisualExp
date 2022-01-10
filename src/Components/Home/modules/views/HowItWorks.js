import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Collapse from "@mui/material/Collapse";

import Button from "../components/Button";
import Typography from "../components/Typography";

import sectionsOrder from "./sectionsOrder";
const sectionIdx = sectionsOrder.findIndex(
  (sect) => sect.id === "HowItWorksSection"
);

const item = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  px: 5,
};

const number = {
  fontSize: 24,
  fontFamily: "default",
  color: "secondary.main",
  fontWeight: "medium",
};

const image = {
  height: 130,
  my: 4,
};

const HowItWorks = (props) => {
  const [stepChecked, setStepChecked] = useState([false, false, false, false]);

  useEffect(() => {
    if (props.section >= sectionIdx - 1 && !stepChecked[0]) {
      setStepChecked([true, false, false, false]);
      setTimeout(() => {
        setStepChecked([true, true, false, false]);
        setTimeout(() => {
          setStepChecked([true, true, true, false]);
          setTimeout(() => {
            setStepChecked([true, true, true, true]);
          }, 1000);
        }, 1000);
      }, 1000);
    }
  }, [props.section, stepChecked]);

  return (
    <Box
      id="HowItWorksSection"
      component="section"
      sx={{ display: "flex", bgcolor: "secondary.light", overflow: "hidden" }}
    >
      <Container
        sx={{
          mt: 10,
          mb: 15,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src="/static/CurvyLines.png"
          alt="curvy lines"
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: -180,
            opacity: 0.7,
          }}
        />
        <Typography variant="h4" marked="center" component="h2" sx={{ mb: 7 }}>
          {sectionsOrder[sectionIdx].title}
        </Typography>
        <div>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={3}>
              <Box sx={item}>
                <Box sx={number}>1.</Box>
                <Box sx={image}>
                  <Collapse in={stepChecked[0]} timeout={1000}>
                    <img
                      src="/static/Summarizing.svg"
                      alt="Summarizing"
                      height="130px"
                    />
                  </Collapse>
                </Box>
                <Typography variant="h6">Summarize</Typography>
                <Typography variant="body1">
                  We summarize the gist of every valuable piece of knowledge on
                  the Web into small chunks of knowledge that we call "nodes."
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={item}>
                <Box sx={number}>2.</Box>
                <Box sx={image}>
                  <Collapse in={stepChecked[1]} timeout={1000}>
                    <img
                      src="/static/Linking.svg"
                      alt="Linking"
                      height="130px"
                    />
                  </Collapse>
                </Box>
                <Typography variant="h6">Link</Typography>
                <Typography variant="body1">
                  We identify and visualize the prerequisite knowledge "links"
                  between nodes.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={item}>
                <Box sx={number}>3.</Box>
                <Box sx={image}>
                  <Collapse in={stepChecked[2]} timeout={1000}>
                    <img
                      src="/static/Evaluating.svg"
                      alt="Evaluating"
                      height="130px"
                    />
                  </Collapse>
                </Box>
                <Typography variant="h6">Evaluate</Typography>
                <Typography variant="body1">
                  We group-evaluate the nodes and links, through up/down-votes
                  and comments.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={item}>
                <Box sx={number}>4.</Box>
                <Box sx={image}>
                  <Collapse in={stepChecked[3]} timeout={1000}>
                    <img
                      src="/static/Improving.svg"
                      alt="Improving"
                      height="130px"
                    />
                  </Collapse>
                </Box>
                <Typography variant="h6">Improve</Typography>
                <Typography variant="body1">
                  We collaboratively improve and up-date nodes and links through
                  proposals and community approvals.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </div>
        <Button
          color="secondary"
          size="large"
          variant="contained"
          component="a"
          href="/premium-themes/onepirate/sign-up/"
          sx={{ mt: 10 }}
        >
          Get started
        </Button>
      </Container>
    </Box>
  );
};

export default HowItWorks;
