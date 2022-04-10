import React, { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Alert from "@mui/material/Alert";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Fireworks } from "fireworks-js/dist/react";

import { firebaseState, fullnameState } from "../../store/AuthAtoms";

import SnackbarComp from "../SnackbarComp";
import PagesNavbar from "./PagesNavbar";
import Typography from "./modules/components/Typography";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

import instructs from "./tutorialIntroductionQuestions";

const Tutorial = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [instructions, setInstructions] = useState([]);
  const [questions, setQuestions] = useState({});
  const [expanded, setExpanded] = useState(0);
  const [completed, setCompleted] = useState(-1);
  const [fireworks, setFireworks] = useState(false);
  const [attempts, setAttempts] = useState({});
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const instrs = [];
    for (let instId in instructs) {
      instrs.push({
        ...instructs[instId],
        id: instId,
      });
    }
    setInstructions(instrs);
  }, []);

  useEffect(() => {
    const loadAttempts = async () => {
      let oAttempts = {};
      const quests = {};
      const tutorialRef = firebase.db.collection("tutorial").doc(fullname);
      const tutorialDoc = await tutorialRef.get();
      let tutorialData;
      if (tutorialDoc.exists) {
        tutorialData = tutorialDoc.data();
        setCorrectAttempts(tutorialData.corrects);
        setWrongAttempts(tutorialData.wrongs);
        setCompleted(tutorialData.completed);
        oAttempts = tutorialData.attempts;
      }
      for (let instr in instructs) {
        if (!(instr in oAttempts)) {
          oAttempts[instr] = {
            corrects: 0,
            wrongs: 0,
            questions: {},
          };
        } else if ("completed" in oAttempts[instr]) {
          delete oAttempts[instr].completed;
        }
        for (let ques in instructs[instr].questions) {
          if (!(ques in oAttempts[instr].questions)) {
            oAttempts[instr].questions[ques] = {
              answers: [],
              corrects: 0,
              wrongs: 0,
            };
          }
          const quest = {
            ...instructs[instr].questions[ques],
            id: ques,
            checks: {},
            error: false,
            helperText: " ",
          };
          if (
            "explanation" in oAttempts[instr].questions[ques] &&
            oAttempts[instr].questions[ques].explanation
          ) {
            quest.explanation = oAttempts[instr].questions[ques].explanation;
            if (
              "explaId" in oAttempts[instr].questions[ques] &&
              oAttempts[instr].questions[ques].explaId
            ) {
              quest.explaId = oAttempts[instr].questions[ques].explaId;
            }
          }
          if (oAttempts[instr].questions[ques].answers.length > 0) {
            let wrong = false;
            for (let choice in quest.choices) {
              if (oAttempts[instr].questions[ques].answers.includes(choice)) {
                quest.checks[choice] = true;
                if (!quest.answers.includes(choice)) {
                  wrong = true;
                }
              } else {
                quest.checks[choice] = false;
                if (quest.answers.includes(choice)) {
                  wrong = true;
                }
              }
            }
            if (wrong) {
              quest.helperText =
                "Incorrect! Please rewatch the video and answer again. Please select all that apply.";
              quest.error = true;
            } else {
              quest.helperText = "You got it!";
              quest.error = false;
            }
          } else {
            for (let choice in quest.choices) {
              quest.checks[choice] = false;
            }
          }
          if (instr in quests) {
            quests[instr].push(quest);
          } else {
            quests[instr] = [quest];
          }
        }
      }
      setQuestions(quests);
      if (tutorialDoc.exists) {
        changeExpand(
          tutorialData.completed + 1,
          tutorialRef,
          tutorialDoc,
          oAttempts
        );
      } else {
        setAttempts(oAttempts);
      }
    };
    if (instructions.length > 0 && fullname) {
      loadAttempts();
    }
  }, [instructions, fullname]);

  useEffect(() => {
    if (completed !== -1 && completed === instructions.length - 2) {
      setFireworks(true);
      setTimeout(() => {
        setFireworks(false);
      }, 7000);
    }
  }, [instructions, completed]);

  const checkChoice = (instrId, qIdx) => (event) => {
    const quests = { ...questions };
    quests[instrId][qIdx].checks[event.target.name] = event.target.checked;
    quests[instrId][qIdx].error = false;
    quests[instrId][qIdx].helperText = " ";
    setQuestions(quests);
  };

  const openExplanation = (instrId, qIdx) => (event) => {
    const quests = { ...questions };
    quests[instrId][qIdx].explanationOpen =
      !quests[instrId][qIdx].explanationOpen;
    setQuestions(quests);
  };

  const changeExplanation = (instrId, qIdx) => (event) => {
    const quests = { ...questions };
    quests[instrId][qIdx].explanation = event.target.value;
    setQuestions(quests);
  };

  const handleSubmit = (instrId, qIdx) => async (event) => {
    event.preventDefault();

    if (expanded === false) {
      return;
    }
    const oAttempts = { ...attempts };
    const quests = { ...questions };
    const question = quests[instrId][qIdx];
    let cAttempts = correctAttempts;
    let wAttempts = wrongAttempts;
    let wrong = false;
    oAttempts[instrId].submitted = firebase.firestore.Timestamp.fromDate(
      new Date()
    );
    if ("explanation" in question && question.explanation) {
      oAttempts[instrId].questions[question.id].explanation =
        question.explanation;
      if ("explaId" in question && question.explaId) {
        oAttempts[instrId].questions[question.id].explaId = question.explaId;
      }
    }
    for (let choice in question.checks) {
      if (
        question.checks[choice] &&
        !oAttempts[instrId].questions[question.id].answers.includes(choice)
      ) {
        oAttempts[instrId].questions[question.id].answers.push(choice);
      }
      if (
        !question.checks[choice] &&
        oAttempts[instrId].questions[question.id].answers.includes(choice)
      ) {
        oAttempts[instrId].questions[question.id].answers = oAttempts[
          instrId
        ].questions[question.id].answers.filter((answ) => answ !== choice);
      }
      if (
        (question.checks[choice] && !question.answers.includes(choice)) ||
        (!question.checks[choice] && question.answers.includes(choice))
      ) {
        wrong = true;
      }
    }
    let allCorrect = true;
    if (wrong) {
      oAttempts[instrId].questions[question.id].wrongs += 1;
      oAttempts[instrId].wrongs += 1;
      allCorrect = false;
      wAttempts += 1;
      question.helperText =
        "Incorrect! Please rewatch the video and answer again. Please select all that apply.";
      question.error = true;
    } else {
      oAttempts[instrId].questions[question.id].corrects += 1;
      oAttempts[instrId].corrects += 1;
      cAttempts += 1;
      question.helperText = "You got it!";
      question.error = false;
    }
    if (allCorrect) {
      for (let ques of quests[instrId]) {
        for (let choice in ques.checks) {
          if (
            (ques.checks[choice] && !ques.answers.includes(choice)) ||
            (!ques.checks[choice] && ques.answers.includes(choice))
          ) {
            allCorrect = false;
            break;
          }
        }
      }
    }
    setCorrectAttempts(cAttempts);
    setWrongAttempts(wAttempts);
    setAttempts(oAttempts);
    setQuestions(quests);
    let tutorialData = {
      attempts: oAttempts,
      corrects: cAttempts,
      wrongs: wAttempts,
      completed,
    };
    if (allCorrect) {
      // if (expanded < instructions.length - 1) {
      //   changeExpand(expanded + 1);
      // }
      if (completed < expanded) {
        tutorialData.completed = expanded;
        setCompleted(expanded);
        if (expanded === instructions.length - 2) {
          tutorialData.ended = true;
        }
      }
    }
    if (fullname) {
      const tutorialRef = firebase.db.collection("tutorial").doc(fullname);
      const tutorialDoc = await tutorialRef.get();
      if ("explanation" in question && question.explanation) {
        let explaRef = firebase.db.collection("explanations").doc();
        let explaDoc;
        if ("explaId" in question && question.explaId) {
          explaRef = firebase.db
            .collection("explanations")
            .doc(question.explaId);
          explaDoc = await explaRef.get();
        } else {
          oAttempts[instrId].questions[question.id].explaId = explaRef.id;
          question.explaId = explaRef.id;
          tutorialData.attempts[instrId].questions[question.id].explaId =
            explaRef.id;
        }
        const explaData = {
          fullname,
          instrId,
          qId: question.id,
          explanation: question.explanation,
        };
        if (explaDoc && explaDoc.exists) {
          await explaRef.update({
            ...explaData,
            updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
          });
        } else {
          await explaRef.set({
            ...explaData,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
          });
        }
        setSnackbarMessage(
          "You successfully submitted your feedback about this question!"
        );
      }
      if (tutorialDoc.exists) {
        await tutorialRef.update(tutorialData);
      } else {
        await tutorialRef.set(tutorialData);
      }
      if (tutorialData.ended) {
        const userRef = firebase.db.collection("users").doc(fullname);
        await userRef.update({ tutorialEnded: true });
      }
    }
  };

  const submitExplanation = (instrId, qIdx) => async (event) => {
    event.preventDefault();

    if (expanded === false) {
      return;
    }
    const question = questions[instrId][qIdx];
    if (fullname && "explanation" in question && question.explanation) {
      const oAttempts = { ...attempts };
      oAttempts[instrId].submitted = firebase.firestore.Timestamp.fromDate(
        new Date()
      );
      oAttempts[instrId].questions[question.id].explanation =
        question.explanation;
      if ("explaId" in question && question.explaId) {
        oAttempts[instrId].questions[question.id].explaId = question.explaId;
      }
      setAttempts(oAttempts);
      let tutorialData = {
        attempts: oAttempts,
      };
      const tutorialRef = firebase.db.collection("tutorial").doc(fullname);
      const tutorialDoc = await tutorialRef.get();
      if ("explanation" in question && question.explanation) {
        let explaRef = firebase.db.collection("explanations").doc();
        let explaDoc;
        if ("explaId" in question && question.explaId) {
          explaRef = firebase.db
            .collection("explanations")
            .doc(question.explaId);
          explaDoc = await explaRef.get();
        } else {
          oAttempts[instrId].questions[question.id].explaId = explaRef.id;
          question.explaId = explaRef.id;
          tutorialData.attempts[instrId].questions[question.id].explaId =
            explaRef.id;
        }
        const explaData = {
          fullname,
          instrId,
          qId: question.id,
          explanation: question.explanation,
        };
        if (explaDoc && explaDoc.exists) {
          await explaRef.update({
            ...explaData,
            updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
          });
        } else {
          await explaRef.set({
            ...explaData,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
          });
        }
        setSnackbarMessage(
          "You successfully submitted your feedback about this question!"
        );
      }
      if (tutorialDoc.exists) {
        await tutorialRef.update(tutorialData);
      } else {
        await tutorialRef.set(tutorialData);
      }
    }
  };

  const changeExpand = async (
    newExpand,
    tutorialRef,
    tutorialDoc,
    oAttempts
  ) => {
    setExpanded(newExpand);
    if (Number.isInteger(newExpand)) {
      if (!tutorialRef) {
        tutorialRef = firebase.db.collection("tutorial").doc(fullname);
        tutorialDoc = await tutorialRef.get();
        oAttempts = { ...attempts };
      }
      oAttempts[instructions[newExpand].id].started =
        firebase.firestore.Timestamp.fromDate(new Date());
      setAttempts(oAttempts);
      if (tutorialDoc.exists) {
        await tutorialRef.update({ attempts: oAttempts });
      } else {
        await tutorialRef.set({
          attempts: oAttempts,
          corrects: correctAttempts,
          wrongs: wrongAttempts,
          completed,
        });
      }
      // setTimeout(() => {
      let cumulativeHeight =
        window.document.getElementById("TutorialHeader").scrollHeight;
      for (let sIdx = 0; sIdx < newExpand; sIdx++) {
        const sectOffsetHeight = window.document.getElementById(
          "Section" + sIdx
        ).scrollHeight;
        cumulativeHeight += sectOffsetHeight;
      }
      window.document.getElementById("ScrollableContainer").scroll({
        top: cumulativeHeight + 40,
        left: 0,
        behavior: "smooth",
      });
      // }, 100);
    }
  };

  const previousStep = (idx) => (event) => {
    if (idx > 0) {
      changeExpand(idx - 1);
    }
  };

  const nextStep = (idx) => (event) => {
    if (idx <= completed + 1 && idx < instructions.length - 1) {
      changeExpand(idx + 1);
    }
  };

  const handleChange = (idx) => (event, newExpanded) => {
    if (idx <= completed + 1) {
      changeExpand(newExpanded ? idx : false);
    }
  };

  return (
    <>
      <PagesNavbar tutorial={true} thisPage="Tutorial">
        <div id="TutorialHeader">
          <Typography variant="h3" gutterBottom marked="center" align="center">
            1Cademy Tutorial
          </Typography>
          <Box sx={{ mb: "10px" }}>
            <Alert severity="success">
              <Box>
                <p>
                  Welcome to the third step in the application process!{" "}
                  <strong>
                    Before moving forward, please create an account on{" "}
                    <a href="https://1cademy.com/" target="_blank">
                      1Cademy web app
                    </a>
                    , which is different from the account you created before on
                    this web app.
                  </strong>{" "}
                  After creating your account, please go through this tutorial
                  to learn more about 1Cademy and how it works. This tutorial
                  takes on average an hour and a half. Make sure to have 1Cademy
                  open in another tab on your browser, so you can practice on
                  the platform and complete tasks as you go through this
                  tutorial.
                </p>
                <p>
                  <strong>Note</strong>: You will find all the answers you need
                  on{" "}
                  <a href="https://1cademy.us/home" target="_blank">
                    the 1Cademy homepage
                  </a>
                  , in the tutorial videos, and the notes above each video.
                </p>
              </Box>
              <Box sx={{ mt: "10px", fontSize: "19px" }}>
                Make sure to select <strong>all the choices that apply.</strong>{" "}
                The community leaders will decide about your application based
                on <strong>your total WRONG attempts.</strong>
              </Box>
            </Alert>
          </Box>
        </div>
        {instructions.map((instr, idx) => (
          <Accordion
            key={instr.title}
            id={"Section" + idx}
            expanded={expanded === idx}
            onChange={handleChange(idx)}
            disabled={idx > completed + 1}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="TutorialSections-content"
              id="TutorialSections-header"
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "700" }}>
                {(idx > completed + 1
                  ? "🔒 "
                  : idx === completed + 1 && idx !== instructions.length - 1
                  ? "🔓 "
                  : "✅ ") + instr.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {expanded === idx && (
                <Grid container spacing={1}>
                  <Grid item xs={12} md={8}>
                    <Paper
                      sx={{
                        padding: "10px",
                        mb: "19px",
                        maxHeight: { sx: "none", md: "calc(100vh - 160px)" },
                        overflowY: { sx: "hidden", md: "auto" },
                      }}
                    >
                      <Alert severity="warning">
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{
                            fontSize: "19px",
                          }}
                        >
                          {instr.description}
                        </Typography>
                      </Alert>
                      {instr.video && <YoutubeEmbed embedId={instr.video} />}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        padding: "10px",
                        mb: "19px",
                        maxHeight: { sx: "none", md: "calc(100vh - 160px)" },
                        overflowY: { sx: "hidden", md: "auto" },
                      }}
                    >
                      {idx === instructions.length - 1 && (
                        <Box sx={{ mb: "10px", fontWeight: 700 }}>
                          You had a total of {wrongAttempts} wrong attemps in
                          answering the questions.
                        </Box>
                      )}
                      {instr.id in questions &&
                        questions[instr.id].map((question, qIdx) => {
                          return (
                            <>
                              <form
                                key={qIdx}
                                onSubmit={handleSubmit(instr.id, qIdx)}
                              >
                                <FormControl
                                  error={question.error}
                                  component="fieldset"
                                  variant="standard"
                                  sx={{ mb: "19px" }}
                                >
                                  <FormLabel component="legend">
                                    {/* {idx + 1 + "." + (qIdx + 1) + ". "} */}
                                    {question.stem}
                                  </FormLabel>
                                  <FormGroup>
                                    {Object.keys(question.choices).map(
                                      (choice, cIdx) => {
                                        return (
                                          <FormControlLabel
                                            key={cIdx}
                                            sx={{
                                              "&:hover": {
                                                bgcolor:
                                                  "rgba(100, 100, 100, 0.1) !important",
                                              },
                                            }}
                                            control={
                                              <Checkbox
                                                checked={
                                                  question.checks[choice]
                                                }
                                                onChange={checkChoice(
                                                  instr.id,
                                                  qIdx
                                                )}
                                                name={choice}
                                              />
                                            }
                                            label={
                                              <span>
                                                {choice + ". "}
                                                {question.choices[choice]}
                                              </span>
                                            }
                                          />
                                        );
                                      }
                                    )}
                                  </FormGroup>
                                  <FormHelperText>
                                    <span
                                      style={{
                                        color: question.error ? "red" : "green",
                                      }}
                                    >
                                      {question.helperText}
                                    </span>
                                  </FormHelperText>
                                </FormControl>
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    width: "100%",
                                    margin: "-10px 0px 10px 0px",
                                  }}
                                >
                                  <Button
                                    sx={{
                                      margin: "0px 7px 10px 7px",
                                      color: "common.white",
                                    }}
                                    type="submit"
                                    color="success"
                                    variant="contained"
                                    disabled={
                                      Object.values(question.checks).findIndex(
                                        (chec) => chec
                                      ) === -1 ||
                                      question.helperText === "You got it!"
                                    }
                                  >
                                    Submit Answer
                                  </Button>
                                  <Button
                                    onClick={openExplanation(instr.id, qIdx)}
                                    sx={{
                                      margin: "0px 7px 10px 7px",
                                      color: "common.white",
                                    }}
                                    color="warning"
                                    variant="contained"
                                  >
                                    Report Difficulty
                                  </Button>
                                </Box>
                              </form>
                              {question.explanationOpen && (
                                <>
                                  <TextareaAutosize
                                    style={{ width: "100%" }}
                                    aria-label="explanation text box"
                                    minRows={7}
                                    placeholder={
                                      "If you're experiencing difficulties with this question, please explain why and which options are confusing."
                                    }
                                    onChange={changeExplanation(instr.id, qIdx)}
                                    value={question.explanation}
                                  />
                                  <Button
                                    sx={{
                                      display: "block",
                                      margin: "10px 0px 25px 0px",
                                      color: "common.white",
                                    }}
                                    onClick={submitExplanation(instr.id, qIdx)}
                                    color="success"
                                    variant="contained"
                                  >
                                    Submit Explanation
                                  </Button>
                                </>
                              )}
                            </>
                          );
                        })}
                    </Paper>
                    {idx > 0 && (
                      <Button
                        onClick={previousStep(idx)}
                        sx={{ mt: 1, mr: 1, color: "common.white" }}
                        color="secondary"
                        variant="contained"
                      >
                        Previous Step
                      </Button>
                    )}
                    {idx < completed + 1 && idx < instructions.length - 1 && (
                      <Button
                        onClick={nextStep(idx)}
                        sx={{
                          float: "right",
                          mt: 1,
                          mr: 1,
                          color: "common.white",
                        }}
                        color="success"
                        variant="contained"
                      >
                        Next Step
                      </Button>
                    )}
                  </Grid>
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
        {fireworks && (
          <Fireworks
            options={{
              speed: 3,
            }}
            style={{
              left: "25%",
              bottom: 0,
              width: "49%",
              height: "49%",
              position: "fixed",
            }}
          />
        )}
      </PagesNavbar>
      <Paper
        sx={{
          position: "fixed",
          width: "340px",
          left: "calc(49vw - 169px)",
          top: "0px",
          padding: "10px",
          textAlign: "center",
          zIndex: 1300,
        }}
      >
        <Box sx={{ mt: "4px", fontWeight: "bold" }}>
          The fewer wrong attempts, the better.
        </Box>
        {/* {expanded !== false &&
          expanded < instructions.length - 1 &&
          instructions[expanded].id in attempts && (
            <Box sx={{ mt: "4px" }}>
              <Box
                sx={{
                  display: "inline",
                  color: "green",
                  mr: "7px",
                }}
              >
                {instructions[expanded].id in attempts &&
                  attempts[instructions[expanded].id].corrects}{" "}
                Correct
              </Box>
              &amp;
              <Box
                sx={{
                  display: "inline",
                  color: "red",
                  fontWeight: 700,
                  ml: "7px",
                  mr: "7px",
                }}
              >
                {instructions[expanded].id in attempts &&
                  attempts[instructions[expanded].id].wrongs}{" "}
                Wrong
              </Box>
              in this section!
            </Box>
          )} */}
        <Box>
          {/* <Box sx={{ display: "inline", color: "green", mr: "7px" }}>
            {correctAttempts} Correct
          </Box>
          &amp; */}
          <Box
            sx={{
              display: "inline",
              color: "red",
              fontWeight: 700,
              ml: "7px",
              mr: "7px",
            }}
          >
            {wrongAttempts} Wrong
          </Box>
          attemps so far!
        </Box>
      </Paper>
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </>
  );
};

export default Tutorial;
