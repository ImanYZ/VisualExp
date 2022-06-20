import React from "react";

import Radio from "@mui/material/Radio";

import "./MCQuestion.css";

const Choice = (props) => {
  return (
    <div key={props.index} style={{ marginTop: "5px" }}>
      <Radio
        checked={props.choice === props.index}
        onChange={props.choiceChange}
        value={props.index}
        name="radio-button-demo"
        aria-label="A"
      />
      {props.content}
    </div>
  );
};

export default Choice;
