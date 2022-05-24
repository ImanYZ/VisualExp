import React from "react";

import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

const LineDiagram = ({ obj, username, lineDiagramTooltip }) => {
  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          backgroundColor: "yellow",
          width: "100%",
          height: "1px",
        }}
      ></Box>
      {Object.keys(obj).map((objKey) => (
        <Tooltip
          key={objKey}
          title={
            <Box>
              <p>{lineDiagramTooltip(obj, objKey, username)}</p>
              <p>THIS DOES NOT INDICATE A SCORE!</p>
            </Box>
          }
        >
          <Box
            sx={{
              height: objKey === username ? "19px" : "10px",
              width: objKey === username ? "19px" : "10px",
              backgroundColor: objKey === username ? "#f28500" : "yellow",
              borderRadius: "50%",
              position: "absolute",
              left: obj[objKey].percent + "%",
              top: objKey === username ? "-8.5px" : "-4px",
            }}
          ></Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default LineDiagram;
