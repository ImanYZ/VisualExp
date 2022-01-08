import * as React from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Button from "../components/Button";
import Typography from "../components/Typography";

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
  width: 190,
  my: 4,
};

function HowItWorks() {
  return (
    <Box
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
        <Typography variant="h4" marked="center" component="h2" sx={{ mb: 14 }}>
          How it works
        </Typography>
        <div>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={3}>
              <Box sx={item}>
                <Box sx={number}>1.</Box>
                <Box
                  component="img"
                  src="/static/Summarizing.svg"
                  alt="Summarizing"
                  sx={image}
                />
                <Typography variant="h6">Summarizing</Typography>
                <Typography variant="p">
                  Summarizing the gist of every valuable piece of knowledge on
                  the Web into small chunks of knowledge that we call "nodes."
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={item}>
                <Box sx={number}>2.</Box>
                <Box
                  component="img"
                  src="/static/Linking.svg"
                  alt="Linking"
                  sx={image}
                />
                <Typography variant="h6">Linking</Typography>
                <Typography variant="p">
                  Identifying and visualizing the prerequisite knowledge "links"
                  between nodes.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={item}>
                <Box sx={number}>3.</Box>
                <Box
                  component="img"
                  src="/static/Evaluating.svg"
                  alt="Evaluating"
                  sx={image}
                />
                <Typography variant="h6">Evaluating</Typography>
                <Typography variant="p">
                  Group-evaluating the nodes and links, through up/down-votes
                  and comments.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={item}>
                <Box sx={number}>4.</Box>
                <Box
                  component="img"
                  src="/static/Improving.svg"
                  alt="Improving"
                  sx={image}
                />
                <Typography variant="h6">Improving</Typography>
                <Typography variant="p">
                  Collaboratively improving and up-dating nodes and links
                  through proposals and community approvals.
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
          sx={{ mt: 8 }}
        >
          Get started
        </Button>
      </Container>
    </Box>
  );
}

export default HowItWorks;
