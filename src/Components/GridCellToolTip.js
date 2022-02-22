import React from "react";

import Tooltip from "@mui/material/Tooltip";

const GridCellToolTip = (props) => {
  return (
    <Tooltip
      title={props.cellValues.value ? props.cellValues.value : ""}
      placement="top"
    >
      {"isLink" in props && props.isLink ? (
        <a href={props.cellValues.value} target="_blank">
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {props.cellValues.value}
          </div>
        </a>
      ) : (
        <div
          style={{
            fontSize: 13,
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {props.cellValues.value}
        </div>
      )}
    </Tooltip>
  );
};

export default GridCellToolTip;
