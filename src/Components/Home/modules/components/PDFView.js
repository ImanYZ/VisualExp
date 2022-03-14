import React from "react";

import Paper from "@mui/material/Paper";

const PDFView = (props) => {
  return props.fileUrl ? (
    <Paper
      sx={{
        margin: "19px 0px 0px 0px",
        padding: "10px",
        height: props.height,
      }}
    >
      <object
        data={props.fileUrl}
        type="application/pdf"
        width="100%"
        height="100%"
      >
        <iframe
          src={
            "https://docs.google.com/viewer?url=" +
            props.fileUrl +
            "&embedded=true"
          }
        ></iframe>
      </object>
    </Paper>
  ) : (
    <div></div>
  );
};

export default PDFView;
