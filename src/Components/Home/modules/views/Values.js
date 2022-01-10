import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Collapse from "@mui/material/Collapse";
import { CardActionArea } from "@mui/material";

import Button from "../components/Button";
import Typography from "../components/Typography";

import valuesItems from "./valuesItems";
import sectionsOrder from "./sectionsOrder";

const iniStepChecked = [];
for (let value of valuesItems) {
  iniStepChecked.push(false);
}

const sectionIdx = sectionsOrder.findIndex(
  (sect) => sect.id === "ValuesSection"
);

const item = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  px: 5,
};

const image = {
  height: 130,
  my: 4,
};

const Values = (props) => {
  const [stepChecked, setStepChecked] = useState(iniStepChecked);

  const flipCard = (idx) => (event) => {
    const sChecked = [...stepChecked];
    sChecked[idx] = !sChecked[idx];
    setStepChecked(sChecked);
  };

  return (
    <Box
      id="ValuesSection"
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
        {/* <Box
          component="img"
          src="/static/CurvyLines.png"
          alt="curvy lines"
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: -180,
            opacity: 0.7,
          }}
        /> */}
        <Typography variant="h4" marked="center" component="h2" sx={{ mb: 7 }}>
          {sectionsOrder[sectionIdx].title}
        </Typography>
        <div>
          <Grid container spacing={2.5}>
            {valuesItems.map((value, idx) => {
              return (
                <Grid key={value.name} item xs={12} md={4}>
                  <Card sx={{ maxWidth: 340 }}>
                    <CardActionArea onClick={flipCard(idx)}>
                      <CardMedia
                        component="img"
                        height="100%"
                        width="100%"
                        image={"/static/" + value.image}
                        alt={value.name}
                        sx={{ padding: "10px 37px 0px 37px" }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {value.name}
                        </Typography>
                        <Collapse in={stepChecked[idx]} timeout={1000}>
                          <Typography variant="body2" color="text.secondary">
                            {value.body}
                          </Typography>
                        </Collapse>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
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
          Join/Initiate Communities
        </Button>
      </Container>
    </Box>
  );
};

export default Values;
