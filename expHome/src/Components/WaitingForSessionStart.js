import React from "react";
import Typography from "@mui/material/Typography";

const WaitingForSessionStart = () => {
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
      <Typography align="center" variant="h3">
        Please Wait! your researcher will start the session any moment.
      </Typography>
    </div>
  );
};

export default WaitingForSessionStart;
