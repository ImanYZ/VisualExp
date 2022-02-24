import React from "react";

import Tooltip from "@mui/material/Tooltip";

const GridCellToolTip = (props) => {
  if (Array.isArray(props.cellValues.value)) {
    const cellText =
      props.cellValues.value && props.cellValues.value.length > 0
        ? props.cellValues.value.join(", ")
        : "";
    return (
      <Tooltip title={cellText} placement="top">
        <div
          style={{
            fontSize: 13,
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {cellText}
        </div>
      </Tooltip>
    );
  }
  return (
    <Tooltip
      title={
        "Tooltip" in props
          ? props.Tooltip
          : props.cellValues.value || props.cellValues.value === 0
          ? props.cellValues.value
          : ""
      }
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
