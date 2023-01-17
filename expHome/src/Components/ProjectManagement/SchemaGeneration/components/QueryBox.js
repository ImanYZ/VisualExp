import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import ChipInput from "./ChipInput";
import "./QueryBox.css";
import SchemaInput from "./QueryBox/SchemaInput";



const QueryBox = ({
  title,
  schema,
  subTitle,
  className,
  buttonText,
  handleKeyword,
  handleEditValue,
  handleDeleteKeyword,
  handleSelectedTags,
  ...props
}) => {
  return (
    <Paper className={className} elevation={3}>
      <div>
        <div>
          <span className="title">{title}</span>
          <br />
          <span className="subtitle">{subTitle}</span>
        </div>
        {schema.map((element, index) => (
          <SchemaInput
            key={index}
            element={element}
            index={index}
            readOnly={props.readOnly}
            handleDeleteKeyword={handleDeleteKeyword}
            handleSelectedTags={handleSelectedTags}
            handleEditValue={handleEditValue}
          />
        ))}
        {!props.readOnly && (
          <Button
            sx={{ mt: 1, mr: 1, backgroundColor: "black", color: "common.white" }}
            variant="contained"
            disabled={props.readOnly}
            onClick={handleKeyword}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </Paper>
  )
};

export default React.memo(QueryBox);

QueryBox.defaultProps = {
  title: (
    <>
      The response should <strong> contain ALL the following keywords</strong>
    </>
  ),
  subTitle: `Below each keyword, you can enter alternative words that serve the same meaning in this context.`,
  buttonText: "ADD A KEYWORD",
  className: "query-builder"
};

QueryBox.propTypes = {
  title: PropTypes.any,
  subTitle: PropTypes.string,
  buttonText: PropTypes.string,
  className: PropTypes.string
};
