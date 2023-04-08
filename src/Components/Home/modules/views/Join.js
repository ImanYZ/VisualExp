import { Box, Button, Typography, useTheme } from "@mui/material";
import React from "react";


import { gray200, gray600, orangeDark, orangeLight } from "../../Communities";

const Join = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: theme => (theme.palette.mode === "light" ? "#000000" : "#F9FAFB"),
        p: "64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography component={"h2"} sx={{ fontSize: { xs: "24px", md: "30px" }, fontWeight: 600, mb: "16px",color:gray200 }}>
        Join our massive collaboration to create a lasting impact.
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: "18px", md: "20px" },
          mb: "32px",
          maxWidth: "768px",
          color: theme.palette.mode === "light" ? gray200 : gray600,
        }}
      >
        We are a large community of researchers, students, and instructors dedicated to enhancing the standards of
        research and education.
      </Typography>
      <Button
        href="#JoinUsSection"
        target="_blank"
        rel="noopener"
        variant="contained"
        sx={{
          background: orangeDark,
          ":hover": {
            background: orangeLight,
          },
          textTransform:"none"
        }}
      >
        Apply to join
      </Button>
    </Box>
  );
};

export default Join;
