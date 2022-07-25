import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextareaAutosize from "@mui/material/TextareaAutosize";

import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
import "../../MCQuestion/MCQuestion.css";

const QualitativeCoding = props => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  const [codes, setCodes] = useState([]);
  const [choices, setChoices] = useState([]);
  const [newCode, setNewCode] = useState("");
  const question = props.questions[props.currentQIdx];
  const curQuestion = props.currentQIdx + 1;
  const size = props.questions.length;

  const retrieveFeedbackcodes = async () => {
    const experimentCodeDocs = await firebase.db.collection("experimentCode").where("project", "==", project).get();
    let codesHere = [];
    for (let Doc of experimentCodeDocs.docs) {
      let data = Doc.data();
      codesHere.push(data.code);
    }
    setCodes(codesHere);
  };

  useEffect(() => { retrieveFeedbackcodes(); }, []);

  const choiceChange = (event) => {
    setChoices((oldChoices) => {
      const newChoices = [...oldChoices];
      newChoices[props.currentQIdx] = event.target.value;
      return newChoices;
    });
  };

  const codeChange = (event) => {
    setNewCode(event.currentTarget.value);
  };

  const addCode = async () => {
    const experimentCodeRef = firebase.db.collection("experimentCode").doc();
    experimentCodeRef.set({
      code: newCode,
      coder: fullname,
      project: project,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    });
    setNewCode("");
    setCodes([...codes, newCode]);
  }

  return (
    <>
      <div>
        <Paper id="QuestionContainer" elevation={4}>
          <Typography component="p">
            <Button
              id="QuestionIconBtn"
              className="Button"
              variant="contained"
              aria-label="add"
            >
              ?
            </Button>
            <span id="QuestionMeta">
              {" "}
              Question # {curQuestion} / {size}
            </span>
          </Typography>

          <hr id="QuestionHeaderSeparator" />
          <FormControl id="QuestionContent" component="fieldset">
            <FormLabel component="legend" style={{ whiteSpace: "pre-line" }}>
              {question.stem}
            </FormLabel>
            <RadioGroup
              id="ChoiceGroup"
              aria-label="choice"
              name="choice"
              onChange={choiceChange}
            >
              {codes.map((opt) => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio />}
                  label={opt}
                  className="QuestionChoice"
                />
              ))}
            </RadioGroup>
            <TextareaAutosize
              id="ExplanantionTextArea"
              aria-label="Explanantion text box"
              minRows={5}
              placeholder={"Please Enter your answer here ?"}
              onChange={codeChange}
              value={newCode}
            />

          </FormControl>
          <hr id="QuestionHeaderSeparator" />
          <Button
            onClick={addCode}
            disabled={false}
            className={"Button"}
            variant="contained"
          >
            Add Code
          </Button>
          <div id="QuestionFooter">
            <Button
              id="QuestionNextBtn"
              onClick={() => { }}
              disabled={false}
              className={"Button"}
              variant="contained"
            >
              Next
            </Button>

            <Button
              id="QuestionPreviousBtn"
              onClick={() => { }}
              disabled={false}
              className={"Button"}
              variant="contained"
            >
              Previous
            </Button>
          </div>
        </Paper>


      </div>
    </>
  );
};

export default QualitativeCoding;
