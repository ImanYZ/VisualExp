import React from "react";
import Typography from "@mui/material/Typography";

const LoadingPage = ({ project }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Typography align="center" variant="h5">
        Please Wait! we are scheduling your {project === "OnlineCommunities" ? "sessions" : "session"}...
      </Typography>
    </div>
  );
};

export default LoadingPage;
