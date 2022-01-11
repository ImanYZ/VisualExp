import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Collapse from "@mui/material/Collapse";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

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
  backgroundColor: "white",
};

const number = {
  fontSize: 24,
  fontFamily: "default",
  color: "secondary.main",
  fontWeight: "medium",
  margin: "10px 0px 10px 0px",
};

const image = {
  height: 130,
  my: 4,
};

const howElements = [
  {
    id: "Summarizing",
    title: "Summarize",
    content: `We summarize the gist of every valuable piece of knowledge
    on the Web into small chunks of knowledge that we call
    "nodes."`,
  },
  {
    id: "Linking",
    title: "Link",
    content: `We identify and visualize the prerequisite knowledge "links"
    between nodes.`,
  },
  {
    id: "Evaluating",
    title: "Evaluate",
    content: `We group-evaluate the nodes and links, through up/down-votes
    and comments.`,
  },
  {
    id: "Improving",
    title: "Improve",
    content: `We collaboratively improve and up-date nodes and links
    through proposals and community approvals.`,
  },
];

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
    <Container
      id="HowItWorksSection"
      component="section"
      sx={{
        mt: 10,
        mb: 15,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "secondary.light",
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
          zIndex: 0,
        }}
      />
      <Typography variant="h4" marked="center" component="h2" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography>
      <Box sx={{ zIndex: 1 }}>
        <Grid container spacing={2.5}>
          {howElements.map((elem, idx) => {
            return (
              <Grid item xs={12} md={3}>
                <Card sx={{ ...item, maxWidth: 355 }}>
                  <Box sx={number}>{idx + 1}.</Box>
                  <Box sx={{ width: "100%", height: "160px" }}>
                    <Collapse in={stepChecked[idx]} timeout={1000}>
                      <CardMedia
                        component="img"
                        src={"/static/" + elem.id + ".svg"}
                        alt={elem.id}
                        height="100%"
                        width="100%"
                        sx={{ px: "10px" }}
                      />
                    </Collapse>
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {elem.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {elem.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <Button
        color="secondary"
        size="large"
        variant="contained"
        component="a"
        href="/premium-themes/onepirate/sign-up/"
        sx={{ mt: 10, color: "common.white" }}
      >
        Get started
      </Button>
    </Container>
  );
};

export default HowItWorks;
