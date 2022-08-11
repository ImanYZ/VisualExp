import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

import Auth from "./Auth";
import AuthStudentCoNoteSurvey from "./AuthStudentCoNoteSurvey";
import ConsentDocument from "./ConsentDocument";
import ConsentStudentCoNoteSurvey from "./ConsentStudentCoNoteSurvey";

import "./ConsentDocument.css";

const AuthConsent = props => {
  let authComponent = <Auth {...props} />;
  if (props.project === "StudentCoNoteSurvey") {
    authComponent = <AuthStudentCoNoteSurvey />;
  }

  return (
    <Grid
      container
      spacing={{ xs: 1, md: 2.2 }}
      sx={{
        width: "100%",
        height: "100vh",
        overflowY: { xs: "auto", md: "hidden" },
        overflowX: "hidden"
      }}
    >
      <Grid
        item
        xs={12}
        md={8}
        style={{
          overflowY: "hidden",
          overflowX: "hidden"
        }}
      >
        <Paper
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            margin: "10px 0px 25px 10px",
            width: "100%",
            height: "100vh"
          }}
        >
          {props.project && props.project === "StudentCoNoteSurvey" ? (
            <ConsentStudentCoNoteSurvey />
          ) : (
            <ConsentDocument />
          )}
        </Paper>
      </Grid>
      <Grid
        item
        xs={12}
        md={4}
        style={{
          overflowY: "hidden",
          overflowX: "hidden"
        }}
      >
        <Paper
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            margin: "10px 0px 25px 0px",
            width: "100%",
            height: "100vh"
          }}
        >
          {authComponent}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AuthConsent;
