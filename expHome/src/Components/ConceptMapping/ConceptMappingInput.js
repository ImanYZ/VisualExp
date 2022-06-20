import React, { useState, useEffect } from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import ValidatedInput from "../ValidatedInput/ValidatedInput";

import "./ConceptMapping.css";

const ConceptMappingInput = (props) => {
  const [fromValues, setFromValues] = useState([props.fromOptions[0]]);
  const [linkValues, setLinkValues] = useState([props.linkOptions[0]]);
  const [toValues, setToValues] = useState([props.toOptions[0]]);

  const cMapChange = (cType, idx) => (value) => {
    const newCMap = [...props.cMap];
    newCMap[idx] = {
      ...newCMap[idx],
      [cType]: value,
    };
    if (idx === newCMap.length - 1) {
      newCMap.push({ from: "", link: "", to: "" });
    }
    props.setCMap(newCMap);

    const newFromValues = [...fromValues];
    newFromValues.push("");
    setFromValues(newFromValues);
    const newLinkValues = [...linkValues];
    newLinkValues.push("");
    setLinkValues(newLinkValues);
    const newToValues = [...toValues];
    newToValues.push("");
    setToValues(newToValues);
  };

  return (
    <div id="ConceptMappingInputContainer">
      <h3>What have you learned about "{props.passageTitle}"?</h3>
      <p>
        Below you see several text boxes in each row. In every row, in the
        left-most text box enter a concept, in the right-most text box type
        another concept, and in the middle text box input how these two concepts
        relate to each other based on what you learned from the passage "
        {props.passageTitle}".
      </p>
      <p>For example, for a passage about seas and fishes, one would enter:</p>
      {props.cMap.map(
        (row, idx) =>
          idx < 3 && (
            <div key={"Row" + idx} className="ConceptMapRow">
              <ValidatedInput
                label="from"
                name="from"
                value={row.from}
                disabled
              />
              <div className="CMapArrow">→</div>
              <ValidatedInput
                label="link"
                name="link"
                value={row.link}
                disabled
              />
              <div className="CMapArrow">→</div>
              <ValidatedInput label="to" name="to" value={row.to} disabled />
            </div>
          )
      )}
      <p>
        A visualization of these concepts and relations you enter will
        automatically show up on the left page. You can add as many rows as you
        wish by typing in more text boxes. After you completely entered all the
        rows, please click the "SUBMIT AND CONTINUE" button.
      </p>

      {props.cMap.map(
        (row, idx) =>
          idx >= 3 && (
            <div key={"Row" + idx} className="ConceptMapRow">
              <Autocomplete
                className="AutoRow"
                value={fromValues[idx - 3]}
                options={props.fromOptions}
                getOptionLabel={(option) => (option ? option : "")}
                onChange={(event, newValue) => {
                  const newFromValues = [...fromValues];
                  newFromValues[idx - 3] = newValue;
                  setFromValues(newFromValues);
                }}
                inputValue={row.from}
                onInputChange={(event, newInputValue) => {
                  cMapChange("from", idx)(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="From" variant="outlined" />
                )}
              />
              <div className="CMapArrow">→</div>
              <Autocomplete
                className="AutoRow"
                value={linkValues[idx - 3]}
                options={props.linkOptions}
                getOptionLabel={(option) => (option ? option : "")}
                onChange={(event, newValue) => {
                  const newLinkValues = [...linkValues];
                  newLinkValues[idx - 3] = newValue;
                  setLinkValues(newLinkValues);
                }}
                inputValue={row.link}
                onInputChange={(event, newInputValue) => {
                  cMapChange("link", idx)(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Link" variant="outlined" />
                )}
              />
              <div className="CMapArrow">→</div>
              <Autocomplete
                className="AutoRow"
                value={toValues[idx - 3]}
                options={props.toOptions}
                getOptionLabel={(option) => (option ? option : "")}
                onChange={(event, newValue) => {
                  const newToValues = [...toValues];
                  newToValues[idx - 3] = newValue;
                  setToValues(newToValues);
                }}
                inputValue={row.to}
                onInputChange={(event, newInputValue) => {
                  cMapChange("to", idx)(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="To" variant="outlined" />
                )}
              />
            </div>
          )
      )}
      <div id="CMapSubmitContainer">
        <Button
          id="CMapSubmitBtn"
          className="Button"
          onClick={props.nextStep}
          variant="contained"
        >
          Submit &amp; Continue!
        </Button>
      </div>
    </div>
  );
};

export default ConceptMappingInput;
