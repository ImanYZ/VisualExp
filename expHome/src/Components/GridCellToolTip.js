import React from "react";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

const GridCellToolTip = (props) => {
  if (Array.isArray(props.cellValues.value)) {
    const cellText =
      props.cellValues.value && props.cellValues.value.length > 0
        ? props.cellValues.value.join(", ")
        : "";

    const renderCellText = (
      <div
        style={{
          fontSize: 13,
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {cellText}
      </div>
    )

    if (!props.toolTip) {
      return renderCellText;
    }

    return (
      <Tooltip title={cellText} placement="top">
        {renderCellText}
      </Tooltip>
    );
  }

  const renderCellValue = (
    <>
      {
        "actionCell" in props && props.actionCell ? (
          <div
            style={{
              fontSize: 19,
              fontWeight: "bold",
              cursor: props.cellValues.value === "O" ? "default" : "pointer",
              width: "100%",
              textAlign: "center",
            }}
          >
            {props.cellValues.value === "O" ? (
              <CircularProgress color="warning" size="16px" />
            ) : (
              props.cellValues.value
            )}
          </div>
        ) : "isLink" in props && props.isLink ? (
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
            {(isNaN(props.cellValues.value) || props.cellValues.value === "")
              ? props.cellValues.value
              : Math.round((props.cellValues.value + Number.EPSILON) * 100) / 100
            }
          </div>
        )
      }
    </>
  )

  if (!props.toolTip) {
    return renderCellValue
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
      {renderCellValue}
    </Tooltip>
  );
};

export default GridCellToolTip;
