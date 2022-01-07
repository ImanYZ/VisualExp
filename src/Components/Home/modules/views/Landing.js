import * as React from "react";
import Button from "../components/Button";
import Typography from "../components/Typography";
import LandingLayout from "./LandingLayout";

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
      <Typography color="inherit" align="center" variant="h2" marked="center">
        1Cademy to Learn
      </Typography>
      <Typography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: { sx: 4, sm: 10 } }}
      >
        Using 1Cademy we start learning from Advanced topics and go backwards
        through the prerequisites as needed!
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
