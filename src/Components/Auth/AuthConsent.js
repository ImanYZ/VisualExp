import React from "react";

import Box from "@mui/material/Box";
// import Paper from "@mui/material/Paper";
// import Grid from "@mui/material/Grid";

import Auth from "./Auth";
import AuthStudentCoNoteSurvey from "./AuthStudentCoNoteSurvey";
// import ConsentDocument from "./ConsentDocument";
// import ConsentStudentCoNoteSurvey from "./ConsentStudentCoNoteSurvey";
import AuthSurvey from "./AuthSurvey";
// import ConsentSurvey from "./ConsentSurvey";
import RouterNav from "../../Components/RouterNav/RouterNav";
import "./ConsentDocument.css";

const AuthConsent = props => {
  let authComponent = <Auth {...props} />;
  if (props.project === "StudentCoNoteSurvey") {
    authComponent = <AuthStudentCoNoteSurvey />;
  }
  if (props.project === "OnlineCommunities") {
    authComponent = <AuthSurvey />;
  }

  return (
    <>
      <RouterNav />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "20px"
        }}
      >
        <Box
          sx={{
            width: "500px"
          }}
        >
          {authComponent}
        </Box>
      </Box>
    </>
  );
};

export default AuthConsent;
