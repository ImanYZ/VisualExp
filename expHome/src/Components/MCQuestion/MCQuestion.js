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

import { choicesState } from "../../store/ExperimentAtoms";

import "./MCQuestion.css";

const MCQuestion = (props) => {
  const [choices, setChoices] = useRecoilState(choicesState);

  const [allAnswered, setAllAnswered] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(0);

  useEffect(() => {
    let qsLeft = 0;
    let allAns = true;
    for (let qIdx = 0; qIdx < props.questions.length; qIdx++) {
      if (!choices[qIdx]) {
        allAns = false;
        qsLeft += 1;
      }
    }
    setQuestionsLeft(qsLeft);
    setAllAnswered(allAns);
  }, [choices, props.questions]);

  const choiceChange = (event) => {
    setChoices((oldChoices) => {
      const newChoices = [...oldChoices];
      newChoices[props.currentQIdx] = event.target.value;
      return newChoices;
    });
  };

  const moveNext = () => {
    const qsLeft = [];
    for (let qIdx = 0; qIdx < props.questions.length; qIdx++) {
      if (!choices[qIdx]) {
        qsLeft.push(qIdx);
      }
    }
    if (qsLeft.length > 0 && props.currentQIdx === props.questions.length - 1) {
      props.setCurrentQIdx(qsLeft[0]);
    } else {
      props.setCurrentQIdx(props.currentQIdx + 1);
    }
  };

  const movePrevious = () => {
    props.setCurrentQIdx((oldCurrentQIdx) => oldCurrentQIdx - 1);
  };

  const explanationsChange = (event) => {
    props.setExplanations((oldExp) => {
      const newExp = [...oldExp];
      newExp[props.currentQIdx] = event.target.value;
      return newExp;
    });
  };

  const question = props.questions[props.currentQIdx];
  const choice = choices[props.currentQIdx];
  const curQuestion = props.currentQIdx + 1;
  const size = props.questions.length;
  const nextAvailable =
    props.currentQIdx + 1 < props.questions.length || questionsLeft > 0;
  const previousAvailable = props.currentQIdx !== 0;

  return (
    <div
      style={
        props.explanations && props.explanations.length > 0
          ? {
              height: "100vh",
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "10px",
            }
          : {}
      }
    >
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
        {/* <Typography variant="headline" component="h5">
          {question.stem}
        </Typography> */}

        <FormControl id="QuestionContent" component="fieldset">
          <FormLabel component="legend" style={{ whiteSpace: "pre-line" }}>
            {question.stem}
          </FormLabel>
          <RadioGroup
            id="ChoiceGroup"
            aria-label="choice"
            name="choice"
            value={choice}
            onChange={choiceChange}
          >
            {["a", "b", "c", "d"].map((opt) => (
              <FormControlLabel
                key={opt}
                value={opt}
                control={<Radio />}
                label={question[opt]}
                className="QuestionChoice"
              />
            ))}
          </RadioGroup>
          {props.explanations && props.explanations.length > 0 && (
            <>
              <h3>Why do you think so?</h3>
              <TextareaAutosize
                id="ExplanantionTextArea"
                aria-label="Explanantion text box"
                minRows={7}
                placeholder={"Please Explain Why?"}
                onChange={explanationsChange}
                value={props.explanations[props.currentQIdx]}
              />
            </>
          )}
        </FormControl>
        <div id="QuestionFooter">
          <Button
            id="QuestionNextBtn"
            onClick={moveNext}
            disabled={!nextAvailable}
            className={!nextAvailable ? "Button Disabled" : "Button"}
            variant="contained"
          >
            Next
          </Button>

          <Button
            id="QuestionPreviousBtn"
            onClick={movePrevious}
            disabled={!previousAvailable}
            className={!previousAvailable ? "Button Disabled" : "Button"}
            variant="contained"
          >
            Previous
          </Button>
        </div>
      </Paper>
      <div id="QuestionSubmitContainer">
        <p>
          {questionsLeft !== 0 &&
            questionsLeft +
              " question" +
              (questionsLeft > 1 ? "s" : "") +
              " left to submit!"}
        </p>
        <Button
          id="QuestionSubmitBtn"
          onClick={props.nextStep}
          disabled={!allAnswered}
          className={!allAnswered ? "Button Disabled" : "Button"}
          variant="contained"
        >
          Submit &amp; Continue!
        </Button>
      </div>
    </div>
  );
};

export default MCQuestion;
