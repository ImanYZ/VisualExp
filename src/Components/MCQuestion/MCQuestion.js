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
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
// import LiveHelp from "@mui/icons-material/LiveHelp";

import { choicesState } from "../../store/ExperimentAtoms";

import "./MCQuestion.css";
import { firebaseState, fullnameState } from "../../store/AuthAtoms";
import { projectState } from "../../store/ProjectAtoms";
import LoadingButton from "@mui/lab/LoadingButton";

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
  const [codeChoice1, setCodeChoice1] = useState([]);
  const [selectCodes, setSelectCodes] = useState(false);
  const [choiceQuestion, setChoiceQuestion] = useState(false);
  const [processingSubmit, setProcessingSubmit] = useState(false);

  const choice = choices[props.currentQIdx];
  const curQuestion = props.currentQIdx + 1;
  const size = props.questions.length;
  const nextAvailable = props.currentQIdx + 1 < props.questions.length || questionsLeft > 0;
  const allowNextForQC =
    (codeChoice.length === 0 && props.currentQIdx === 0) || (codeChoice1.length === 0 && props.currentQIdx === 1);
  const previousAvailable = props.currentQIdx !== 0;
  const [orderOfQuestions, setOrderOfQuestions] = useState([
    props.questions[Math.floor(Math.random() * props.questions.length)]
  ]);
  const [random, setRandom] = useState(false);
  const postQuestion = props.questions[props.currentQIdx];

  const retrieveFeedbackcodes = async () => {
    const experimentCodeDocs = await firebase.db
      .collection("feedbackCodeBooks")
      .where("approved", "==", true)
      .get();
    const _codes = experimentCodeDocs.docs.map(doc => doc.data().code);

    setCodes(_codes);
  };

  useEffect(() => {
    setOrderOfQuestions([props.questions[Math.floor(Math.random() * props.questions.length)]]);
    props.setCurrentQIdx(0);
    setAllAnswered(false);
  }, [random]);

  useEffect(() => {
    retrieveFeedbackcodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectCodes]);

  useEffect(() => {
    let qsLeft = 0;

    setQuestionsLeft(qsLeft);
    if (![5, 19].includes(props.step)) {
      let allAns = true;
      for (let qIdx = 0; qIdx < props.questions.length; qIdx++) {
        if (!orderOfQuestions.includes(props.questions[qIdx])) {
          allAns = false;
          qsLeft += 1;
        }
      }
      setAllAnswered(allAns);
      props.setOrderQuestions(orderOfQuestions);
    } else {
      let allAns = true;
      for (let qIdx = 0; qIdx < props.questions.length; qIdx++) {
        if (!choices[qIdx]) {
          allAns = false;
          qsLeft += 1;
        }
      }
      setAllAnswered(allAns);
    }
  }, [choices, props.questions]);

  const choiceChange = event => {
    setChoices(oldChoices => {
      const newChoices = [...oldChoices];
      newChoices[props.currentQIdx] = event.target.value;
      return newChoices;
    });
    if (choiceQuestion) {
      const newExp = [...props.explanations];
      newExp[props.currentQIdx].choice = postQuestion[event.target.value];
      props.setExplanations(newExp);
    }
  };

  const moveNext = () => {
    if (![5, 19].includes(props.step)) {
      const qsLeft = [];
      let order = [...orderOfQuestions];
      for (let qIdx = 0; qIdx < props.questions.length; qIdx++) {
        if (!order.includes(props.questions[qIdx])) {
          qsLeft.push(qIdx);
        }
      }
      if (qsLeft.length > 0 && props.currentQIdx === props.questions.length - 1) {
        props.setCurrentQIdx(qsLeft[0]);
      } else {
        if (props.currentQIdx === order.length - 1) {
          let randomizeNumberOfQuestion = Math.floor(Math.random() * props.questions.length);
          while (order.includes(props.questions[randomizeNumberOfQuestion])) {
            randomizeNumberOfQuestion = Math.floor(Math.random() * props.questions.length);
          }
          order.push(props.questions[randomizeNumberOfQuestion]);
          setOrderOfQuestions(order);
        }
        props.setCurrentQIdx(props.currentQIdx + 1);
      }
    } else {
      if (selectCodes) {
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

        if (props.currentQIdx >= 1) {
          setChoiceQuestion(true);
        }
      } else {
        setCodes([]);
        retrieveFeedbackcodes();
        setSelectCodes(true);
      }
    }
  };

  const movePrevious = () => {
    props.setCurrentQIdx(oldCurrentQIdx => oldCurrentQIdx - 1);
    if ([5, 19].includes(props.step)) {
      setChoiceQuestion(false);
    }
  };

  const explanationsChange = event => {
    const newExp = [...props.explanations];
    newExp[props.currentQIdx].explanation = event.target.value;
    props.setExplanations(newExp);
  };

  const codeChange = event => {
    setNewCode(event.currentTarget.value);
  };

  const addCode = async () => {
    const newCodes = [...codes];
    newCodes.push(newCode);
    setCodes(newCodes);
    const experimentCodeRef = firebase.db.collection("feedbackCodeBooks").doc();
    experimentCodeRef.set({
      approved: false,
      code: newCode,
      coder: fullname,
      project: project,
      title: "Participant",
      question: curQuestion,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date())
    });
    setNewCode("");
  };

  const choiceCodeChange = value => {
    let currentIndex;
    let newChecked;
    if (props.currentQIdx === 0) {
      newChecked = [...codeChoice];
      currentIndex = codeChoice.indexOf(value);
    } else {
      newChecked = [...codeChoice1];
      currentIndex = codeChoice1.indexOf(value);
    }
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    if (props.currentQIdx === 0) {
      setCodeChoice(newChecked);
    } else {
      setCodeChoice1(newChecked);
    }
    props.setExplanations(oldExp => {
      const newExp = [...oldExp];
      newExp[props.currentQIdx].codes = newChecked;
      return newExp;
    });
  };

  const submitAndContinue = async () => {
    setProcessingSubmit(true);
    await props.nextStep();
    setProcessingSubmit(false);
    setRandom(!random);
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
            {[5, 19].includes(props.step) ? postQuestion.stem : orderOfQuestions[props.currentQIdx]?.stem}
          </FormLabel>
          {choiceQuestion ? (
            <RadioGroup id="ChoiceGroup" aria-label="choice" name="choice" value={choice} onChange={choiceChange}>
              {["a", "b"].map(opt => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio />}
                  label={postQuestion[opt]}
                  className="QuestionChoice"
                />
              ))}
            </RadioGroup>
          ) : (
            <RadioGroup id="ChoiceGroup" aria-label="choice" name="choice" value={choice} onChange={choiceChange}>
              {["a", "b", "c", "d"].map(opt => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio />}
                  label={[5, 19].includes(props.step) ? postQuestion[opt] : orderOfQuestions[props.currentQIdx][opt]}
                  className="QuestionChoice"
                />
              ))}
            </RadioGroup>
          )}
          {props.explanations && props.explanations.length > 0 && !selectCodes ? (
            <>
              <h3>Why do you think so?</h3>
              <TextField
                label="Please Explain Why?"
                variant="outlined"
                value={props.explanations[props.currentQIdx].explanation}
                onChange={explanationsChange}
                fullWidth
                multiline
                rows={5}
                sx={{ width: "95%", m: 0.5 }}
              />
            </>
          ) : null}

          {[5, 19].includes(props.step) && selectCodes ? (
            <div>
              <h3>Better Explain Your Feedback:</h3>

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
                              checked={
                                props.currentQIdx === 0
                                  ? codeChoice.indexOf(value) !== -1
                                  : codeChoice1.indexOf(value) !== -1
                              }
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

              <TextField
                label=""
                variant="outlined"
                value={newCode}
                placeholder={
                  "If what you are looking for does not exist among the options above, you can enter them here, only one per textbox."
                }
                onChange={codeChange}
                fullWidth
                multiline
                rows={5}
                sx={{ width: "95%", m: 0.5 }}
              />
              </FormControl>
              <Box sx={{ m: "10px 600px 0px 0px" }}>
                {[5, 19].includes(props.step) && selectCodes && (
                  <Button
                    id="QuestionNextBtn"
                    onClick={addCode}
                    disabled={!newCode || newCode === ""}
                    className={!newCode || newCode === "" ? "Button Disabled" : "Button"}
                    variant="contained"
                  >
                    ADD YOUR Explanation
                  </Button>
                )}
              </Box>
            </div>
          ) : null}
        </FormControl>

        <div id="QuestionFooter">
          {![5, 19].includes(props.step) ? (
            <Button
              id="QuestionNextBtn"
              onClick={moveNext}
              disabled={!nextAvailable}
              className={!nextAvailable ? "Button Disabled" : "Button"}
              variant="contained"
              sx={{
                display: nextAvailable || !allAnswered ? "flex" : "none"
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              id="QuestionNextBtn"
              onClick={moveNext}
              disabled={!nextAvailable || (allowNextForQC && selectCodes)}
              className={!nextAvailable || (allowNextForQC && selectCodes) ? "Button Disabled" : "Button"}
              variant="contained"
              sx={{
                display: !selectCodes && !props.showSubmit && (!nextAvailable || (allowNextForQC && selectCodes)) ? "none" : "flex"
              }}
            >
              {selectCodes ? "Next" : "Submit"}
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
        <LoadingButton
          id="QuestionSubmitBtn"
          onClick={submitAndContinue}
          disabled={!allAnswered}
          className={allAnswered ? "Button" : "Button Disabled"}
          variant="contained"
          loading={processingSubmit}
        >
          {"Submit & Continue!"}
        </LoadingButton>
      </div>
      <div></div>
    </div>
  );
};

export default MCQuestion;
