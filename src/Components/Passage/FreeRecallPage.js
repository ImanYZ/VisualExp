import React from "react";

import TextareaAutosize from "@mui/material/TextareaAutosize";

import "./Passage.css";

const FreeRecallPage = (props) => {
  const textChange = (event) => {
    props.setReText(event.target.value);
  };
  return (
    <div id="QuestionsInstructions">
      <h2>Type below whatever you recall from the passage:</h2>
      <TextareaAutosize
        id="FreeRecallTextArea"
        aria-label="Free Recall Text box"
        minRows={7}
        placeholder={
          "Please enter what you recall from the passgae " + props.passageTitle
        }
        onChange={textChange}
        value={props.reText}
      />
    </div>
  );
};

export default FreeRecallPage;
