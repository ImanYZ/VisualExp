import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";

import Button from "../components/Button";
import Typography from "../components/Typography";
import LandingLayout from "./LandingLayout";

import AnimatediconLoop from "../../../../assets/AnimatediconLoop.gif";
import backgroundImage from "../../../../assets/LibraryBackground.jpg";

export default function Landing() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  return (
    <LandingLayout
      sxBackground={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: "primary.light", // Average color of the background image.
        backgroundPosition: "center",
      }}
    >
      {/* Increase the network loading priority of the background image. */}
      <img
        style={{ display: "none" }}
        src={backgroundImage}
        alt="increase priority"
      />
      <img src={AnimatediconLoop} alt="Animated Logo" width="190px" />
      <Typography color="inherit" align="center" variant="h2" marked="center">
        {/* 1<Box sx={{ display: "inline", color: "secondary.main" }}>Cademy</Box>{" "}
        to Learn */}
      </Typography>
      <Box align="center" sx={{ mb: 4, mt: 4 }}>
        <Collapse in={checked} timeout={1000}>
          <Typography color="inherit" variant="h5">
            We Visualize Learning Pathways from Books &amp; Research Papers.
          </Typography>
        </Collapse>
      </Box>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        component="a"
        href="#JoinUsSection"
        sx={{ minWidth: 200, color: "common.white" }}
      >
        Apply to Join Us!
      </Button>
      {/* <Typography variant="body2" color="inherit" sx={{ mt: 2 }}>
        Discover the experience
      </Typography> */}
    </LandingLayout>
  );
}
