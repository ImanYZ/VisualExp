import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Collapse from "@mui/material/Collapse";

import Button from "../components/Button";
import Typography from "../components/Typography";

import valuesItems from "./valuesItems";
import sectionsOrder from "./sectionsOrder";
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
            {valuesItems.map((value) => {
              return (
                <Grid key={value.name} item xs={12} md={4}>
                  <Box sx={item}>
                    <Box sx={image}>
                      <Collapse in={stepChecked[0]} timeout={1000}>
                        <img
                          src={"/static/" + value.name + ".svg"}
                          alt={value.name}
                          height="130px"
                        />
                      </Collapse>
                    </Box>
                    <Typography variant="h6">{value.name}</Typography>
                    <Typography variant="body1">{value.body}</Typography>
                  </Box>
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
          sx={{ mt: 1 }}
        >
          Join Our Communities
        </Button>
      </Container>
    </Box>
  );
};

export default Values;
