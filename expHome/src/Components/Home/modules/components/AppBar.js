import React from "react";

import MuiAppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import useScrollTrigger from "@mui/material/useScrollTrigger";

function AppBar(props) {
  return (
    <>
      <CssBaseline />
      <MuiAppBar {...props} elevation={4} />
    </>
  );
}

export default AppBar;
