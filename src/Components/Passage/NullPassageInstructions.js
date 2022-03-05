import React from "react";

import Button from "@mui/material/Button";

import "./Passage.css";

const doNothing = () => {};

const NullPassageInstructions = (props) => {
  return (
    <div id="NullPassageInstructions">
      <h2>Sample Passage to Learn How to Navigate Through!</h2>
      <div id="Timer">
        {props.minutes} : {props.seconds} left!
      </div>
      <p>
        Please navigate through this passage, in this special format, and ask
        the researcher in this session any questions you have about how to read
        through it.
      </p>
      <p>
        In a few minutes, you'll see another passage in the same format, and you
        will need to learn it to be able to answer some questions about the
        second passage.
      </p>
      <p>
        When you hover over the passage, at the bottom a toolbar shows up that
        you can use to zoom in and out
        {props.condition ? " and switch between pages" : ""}.
      </p>
      <p>
        When you feel comfortable with how this passage is formatted, please
        click the "START THE TEST!" button.
      </p>

      <div id="StartTestContainer">
        <Button
          id="StartTestButton"
          className={props.minutes > 3 ? "Button Disabled" : "Button"}
          onClick={props.minutes <= 3 ? props.nextStep : doNothing}
          variant="contained"
          disabled={props.minutes > 3}
        >
          {props.minutes > 3
            ? "Navigate Through the Left Passage"
            : "START THE TEST!"}
        </Button>
      </div>

      <p>
        If for any reason the passage on the left does not load, click the
        "RELOAD" button and wait.
      </p>

      <div id="ReloadContainer">
        <Button
          id="ReloadButton"
          className="Button"
          onClick={props.changePConURL}
          variant="contained"
        >
          RELOAD
        </Button>
      </div>
    </div>
  );
};

export default NullPassageInstructions;
