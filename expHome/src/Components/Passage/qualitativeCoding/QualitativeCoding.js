import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextareaAutosize from "@mui/material/TextareaAutosize";

// import LiveHelp from "@mui/icons-material/LiveHelp";

import { choicesState } from "../../../store/ExperimentAtoms";

import "../../MCQuestion/MCQuestion.css";

const QualitativeCoding = props => {
  const [codeChange, setCodeChange] = useState("");
  const explanationsChange = (event) => {
        
    setCodeChange(event.value);
    console.log(event.value);
  };
  return (
    <div>
      <h3>Why do you think so?</h3>
      <FormControl>
        <TextareaAutosize
          id="ExplanantionTextArea"
          aria-label="Explanantion text box"
          minRows={7}
          placeholder={"Please Explain Why?"}
          onChange={explanationsChange}
          value={"Enter your code here"}
        />
      </FormControl>
    </div>
  );
};

export default QualitativeCoding;
