import * as React from "react";

import Box from "@mui/material/Box";

import Button from "../components/Button";
import Typography from "../components/Typography";
import LandingLayout from "./LandingLayout";

import AnimatediconLoop from "../../../../assets/AnimatediconLoop.gif";
import backgroundImage from "../../../../assets/LibraryBackground.jpg";

export default function Landing() {
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
      <Typography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: 4 }}
      >
        1 academic platform to collaboratively make learning and research more
        enjoyable.
        {/* Using 1Cademy we start learning from Advanced topics and go backwards
        through the prerequisites as needed! */}
      </Typography>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        component="a"
        href="/premium-themes/onepirate/sign-up/"
        sx={{ minWidth: 200 }}
      >
        Apply to Join Us!
      </Button>
      <Typography variant="body2" color="inherit" sx={{ mt: 2 }}>
        Discover the experience
      </Typography>
    </LandingLayout>
  );
}
