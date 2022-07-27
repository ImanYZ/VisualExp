import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
// import LiveHelp from "@mui/icons-material/LiveHelp";

import { choicesState } from "../../store/ExperimentAtoms";

import "./MCQuestion.css";
import { firebaseState, fullnameState } from "../../store/AuthAtoms";
import { projectState } from "../../store/ProjectAtoms";

const MCQuestion = props => {
  const [choices, setChoices] = useRecoilState(choicesState);
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  const [allAnswered, setAllAnswered] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(0);
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [codeChoice, setCodeChoice] = useState([]);
  const [selectCodes, setSelectCodes] = useState(false);
  const [explanation, setExplanation] = useState("");
  const question = props.questions[props.currentQIdx];
  const choice = choices[props.currentQIdx];
  const curQuestion = props.currentQIdx + 1;
  const size = props.questions.length;
  const nextAvailable = props.currentQIdx + 1 < props.questions.length || questionsLeft > 0;
  const previousAvailable = props.currentQIdx !== 0;

  const retrieveFeedbackcodes = async () => {
    const experimentCodeDocs = await firebase.db
      .collection("experimentCodes")
      .where("approved", "==", true)
      .where("project", "==", project)
      .where("question", "==", curQuestion)
      .get();
    const codesHere = experimentCodeDocs.docs.map((doc) =>  doc.data().code);
    setCodes(codesHere);
  };

  useEffect(() => {
    retrieveFeedbackcodes();
  }, []);

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

  const choiceChange = event => {
    setChoices(oldChoices => {
      const newChoices = [...oldChoices];
      newChoices[props.currentQIdx] = event.target.value;
      return newChoices;
    });
  };

  const moveNext = () => {
   
    if (selectCodes || !([5, 19].includes(props.step))) {
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
      setSelectCodes(false);
      retrieveFeedbackcodes();
      setExplanation("");
    } else {
      retrieveFeedbackcodes();
      setSelectCodes(true);
    }
  };

  const movePrevious = () => {
    props.setCurrentQIdx(oldCurrentQIdx => oldCurrentQIdx - 1);
  };

  const explanationsChange = event => {
    const newExp = [...props.explanations];
    newExp[props.currentQIdx].explanation = event.target.value;
    props.setExplanations(newExp);
    setExplanation(event.target.value);
  };

  const codeChange = event => {
    setNewCode(event.currentTarget.value);
  };
  const addCode = async () => {
    const newCodes = [...codes];
    newCodes.push(newCode);
    setCodes(newCodes);
    const experimentCodeRef = firebase.db.collection("experimentCodes").doc();
    experimentCodeRef.set({
      approved: false,
      code: newCode,
      coder: fullname,
      project: project,
      question: curQuestion,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date())
    });
    setNewCode("");
  };

  const choiceCodeChange = value => {
    const currentIndex = codeChoice.indexOf(value);
    const newChecked = [...codeChoice];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setCodeChoice(newChecked);
    props.setExplanations(oldExp => {
      const newExp = [...oldExp];
      newExp[props.currentQIdx].codes = newChecked;
      return newExp;
    });
  };

  const submit = () => {
    moveNext();
  };

  return (
    <div
      style={
        props.explanations && props.explanations.length > 0
          ? {
              height: "100vh",
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "10px"
            }
          : {}
      }
    >
      <Paper id="QuestionContainer" elevation={4}>
        <Typography component="p">
          <Button id="QuestionIconBtn" className="Button" variant="contained" aria-label="add">
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
          <RadioGroup id="ChoiceGroup" aria-label="choice" name="choice" value={choice} onChange={choiceChange}>
            {["a", "b", "c", "d"].map(opt => (
              <FormControlLabel
                key={opt}
                value={opt}
                control={<Radio />}
                label={question[opt]}
                className="QuestionChoice"
              />
            ))}
          </RadioGroup>
          {(props.explanations && props.explanations.length > 0 && !selectCodes) ?(
            <>
              <h3>Why do you think so?</h3>
              <TextareaAutosize
                id="ExplanantionTextArea"
                aria-label="Explanation text box"
                minRows={7}
                placeholder={"Please Explain Why?"}
                onChange={explanationsChange}
                value={explanation}
              />
            </>
          ):null}

          {[5, 19].includes(props.step) && selectCodes ? (
            <div>
              <h3>Code Your Feedback:</h3>
              <hr id="QuestionHeaderSeparator" />
              <FormControl id="QuestionContent" component="fieldset">
                <FormLabel component="legend" style={{ whiteSpace: "pre-line" }}>
                  Please select some of the following options or enter new ones to better explain your feedback:
                </FormLabel>
                <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
                  {codes.map(value => {
                    const labelId = `checkbox-list-label-${value}`;

                    return (
                      <ListItem key={value} disablePadding>
                        <ListItemButton
                          role={undefined}
                          onClick={() => {
                            choiceCodeChange(value);
                          }}
                          dense
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={codeChoice.indexOf(value) !== -1}
                              tabIndex={-1}
                              disableRipple
                              inputProps={{ "aria-labelledby": labelId }}
                            />
                          </ListItemIcon>
                          <ListItemText id={labelId} primary={`${value}`} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
                <TextareaAutosize
                  id="ExplanantionTextArea"
                  aria-label="Explanantion text box"
                  minRows={5}
                  placeholder={"Please Enter your code here ?"}
                  onChange={codeChange}
                  value={newCode}
                />
              </FormControl>
              <hr id="QuestionHeaderSeparator" />
              <Button onClick={addCode} disabled={!newCode || newCode === ""} className={"Button"} variant="contained">
                Add Code
              </Button>
            </div>
          ) : null}
        </FormControl>
        <div id="QuestionFooter">
          {selectCodes || ![5, 19].includes(props.step) ? (
            <Button
              id="QuestionNextBtn"
              onClick={moveNext}
              disabled={!nextAvailable}
              className={!nextAvailable ? "Button Disabled" : "Button"}
              variant="contained"
            >
              Next
            </Button>
          ) : (
            <Button id="QuestionNextBtn" onClick={submit} disabled={false} className={"Button"} variant="contained">
              Submit
            </Button>
          )}

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
          {questionsLeft !== 0 && questionsLeft + " question" + (questionsLeft > 1 ? "s" : "") + " left to submit!"}
        </p>
        <Button
          id="QuestionSubmitBtn"
          onClick={props.nextStep}
          disabled={
            !(allAnswered && ![5, 19].includes(props.step)) &&
            !(allAnswered && selectCodes && [5, 19].includes(props.step))
          }
          className={
            (allAnswered && ![5, 19].includes(props.step)) ||
            (allAnswered && selectCodes && [5, 19].includes(props.step))
              ? "Button"
              : "Button Disabled"
          }
          variant="contained"
        >
          Submit &amp; Continue!
        </Button>
      </div>
      <div></div>
    </div>
  );
};

export default MCQuestion;
