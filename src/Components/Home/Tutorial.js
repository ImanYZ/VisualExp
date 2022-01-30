import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";

import { firebaseState, fullnameState } from "../../store/AuthAtoms";

import PagesNavbar from "./PagesNavbar";
import Typography from "./modules/components/Typography";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

import instructs from "./tutorialIntroductionQuestions";

const Tutorial = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [instructions, setInstructions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState(0);
  const [completed, setCompleted] = useState(-1);
  const [attempts, setAttempts] = useState({});
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);

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
    if (instructions.length > 0 && expanded !== false) {
      const quests = [];
      for (let qId in instructions[expanded].questions) {
        const quest = {
          ...instructions[expanded].questions[qId],
          id: qId,
          checks: {},
          error: false,
          helperText: " ",
        };
        for (let choice in quest.choices) {
          quest.checks[choice] = false;
        }
        quests.push(quest);
      }
      setQuestions(quests);
    }
  }, [instructions, expanded]);

  useEffect(() => {
    const loadAttempts = async () => {
      let oAttempts = {};
      const tutorialRef = firebase.db.collection("tutorial").doc(fullname);
      const tutorialDoc = await tutorialRef.get();
      if (tutorialDoc.exists) {
        const tutorialData = tutorialDoc.data();
        setCorrectAttempts(tutorialData.corrects);
        setWrongAttempts(tutorialData.wrongs);
        setCompleted(tutorialData.completed);
        if (tutorialData.completed < Object.keys(instructs).length - 1) {
          changeExpand(tutorialData.completed + 1);
        }
        oAttempts = tutorialData.attempts;
      }
      for (let instr in instructs) {
        if (!(instr in oAttempts)) {
          oAttempts[instr] = {
            corrects: 0,
            wrongs: 0,
            completed: 0,
            questions: {},
          };
        }
        for (let ques in instructs[instr].questions) {
          if (!(ques in oAttempts[instr].questions)) {
            oAttempts[instr].questions[ques] = {
              answers: [],
              corrects: 0,
              wrongs: 0,
            };
          }
        }
      }
      setAttempts(oAttempts);
    };
    if (fullname) {
      loadAttempts();
    }
  }, [fullname]);

  const checkChoice = (idx) => (event) => {
    const quests = [...questions];
    quests[idx].checks[event.target.name] = event.target.checked;
    quests[idx].error = false;
    quests[idx].helperText = " ";
    setQuestions(quests);
  };

  const handleSubmit = (instrId, question) => async (event) => {
    event.preventDefault();

    if (expanded === false) {
      return;
    }
    const oAttempts = { ...attempts };
    const quests = [...questions];
    let cAttempts = correctAttempts;
    let wAttempts = wrongAttempts;
    let wrong = false;
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
    const qIdx = quests.findIndex((ques) => ques.id === question.id);
    if (wrong) {
      oAttempts[instrId].questions[question.id].wrongs += 1;
      oAttempts[instrId].wrongs += 1;
      allCorrect = false;
      wAttempts += 1;
      quests[qIdx].helperText =
        "Incorrect! Please rewatch the video and answer again. Please select all that apply.";
      quests[qIdx].error = true;
    } else {
      oAttempts[instrId].questions[question.id].corrects += 1;
      oAttempts[instrId].corrects += 1;
      cAttempts += 1;
      quests[qIdx].helperText = "You got it!";
      quests[qIdx].error = false;
    }
    if (allCorrect) {
      for (let ques of quests) {
        for (let choice in ques.checks) {
          if (
            (ques.checks[choice] && !ques.answers.includes(choice)) ||
            (!ques.checks[choice] && ques.answers.includes(choice))
          ) {
            allCorrect = false;
          }
        }
      }
    }
    setCorrectAttempts(cAttempts);
    setWrongAttempts(wAttempts);
    setAttempts(oAttempts);
    setQuestions(quests);
    let compl = completed;
    if (allCorrect) {
      // if (expanded < instructions.length - 1) {
      //   changeExpand(expanded + 1);
      // }
      if (compl < expanded) {
        compl = expanded;
        setCompleted(expanded);
      }
    }
    if (fullname) {
      const tutorialRef = firebase.db.collection("tutorial").doc(fullname);
      await tutorialRef.set(
        {
          attempts: oAttempts,
          corrects: cAttempts,
          wrongs: wAttempts,
          completed: compl,
        },
        { merge: true }
      );
    }
  };

  const changeExpand = (newExpand) => {
    setExpanded(newExpand);
    if (Number.isInteger(newExpand)) {
      setTimeout(() => {
        let cumulativeHeight = 0;
        for (let sIdx = 0; sIdx < newExpand; sIdx++) {
          const sectOffsetHeight = window.document.getElementById(
            "Section" + sIdx
          ).scrollHeight;
          cumulativeHeight += sectOffsetHeight;
        }
        console.log({ cumulativeHeight });
        window.document.getElementById("ScrollableContainer").scroll({
          top: 100 + cumulativeHeight,
          left: 0,
          behavior: "smooth",
        });
      }, 400);
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
    <PagesNavbar>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial
      </Typography>
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
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ fontWeight: "700" }}
            >
              {(idx > completed + 1
                ? "🔒 "
                : idx === completed + 1
                ? "🔓 "
                : "✅ ") +
                (idx + 1) +
                ". " +
                instr.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {expanded === idx && (
              <Grid container spacing={1}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      {instr.description}
                    </Typography>
                    {instr.video && <YoutubeEmbed embedId={instr.video} />}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    {idx < instructions.length - 1 && (
                      <>
                        <Box sx={{ mb: "19px" }}>
                          Please carefully watch the video before answering the
                          questions. The community leaders will decide about
                          your application based on your total correct and wrong
                          attempts.
                        </Box>
                        <Box
                          sx={{
                            mb: "10px",
                            fontWeight: 700,
                            fontStyle: "italic",
                          }}
                        >
                          The fewer attempts, the better.
                        </Box>
                      </>
                    )}
                    {idx === instructions.length - 1 && (
                      <Box sx={{ mb: "10px", fontWeight: 700 }}>
                        You had a total of {correctAttempts + wrongAttempts}{" "}
                        attemps in answering the questions.
                      </Box>
                    )}
                    <Box sx={{ mb: "19px" }}>
                      <Box
                        sx={{ display: "inline", color: "green", mr: "7px" }}
                      >
                        {correctAttempts} Correct
                      </Box>
                      &amp;
                      <Box
                        sx={{
                          display: "inline",
                          color: "red",
                          ml: "7px",
                          mr: "7px",
                        }}
                      >
                        {wrongAttempts} Wrong
                      </Box>
                      attemps in all sections
                      {idx < instructions.length - 1 ? " so far!" : "!"}
                    </Box>
                    {questions.map((question, qIdx) => {
                      return (
                        <form
                          key={qIdx}
                          onSubmit={handleSubmit(instr.id, question)}
                        >
                          <FormControl
                            error={question.error}
                            component="fieldset"
                            variant="standard"
                            sx={{ mb: "19px" }}
                          >
                            <FormLabel component="legend">
                              {question.stem}
                            </FormLabel>
                            <FormGroup>
                              {Object.keys(question.choices).map(
                                (choice, cIdx) => {
                                  return (
                                    <FormControlLabel
                                      key={choice}
                                      control={
                                        <Checkbox
                                          checked={question.checks[cIdx]}
                                          onChange={checkChoice(qIdx)}
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
                          <Button
                            sx={{
                              display: "block",
                              margin: "-10px 0px 25px 0px",
                              color: "white",
                            }}
                            type="submit"
                            color="success"
                            variant="contained"
                          >
                            Submit Answer
                          </Button>
                        </form>
                      );
                    })}
                    {idx < instructions.length - 1 && (
                      <Box sx={{ mb: "10px" }}>
                        <Box
                          sx={{ display: "inline", color: "green", mr: "7px" }}
                        >
                          {instr.id in attempts && attempts[instr.id].corrects}{" "}
                          Correct
                        </Box>
                        &amp;
                        <Box
                          sx={{
                            display: "inline",
                            color: "red",
                            ml: "7px",
                            mr: "7px",
                          }}
                        >
                          {instr.id in attempts && attempts[instr.id].wrongs}{" "}
                          Wrong
                        </Box>
                        attemps in this section!
                      </Box>
                    )}
                  </Paper>
                  {idx > 0 && (
                    <Button
                      onClick={previousStep(idx)}
                      sx={{ mt: 1, mr: 1 }}
                      color="secondary"
                      variant="contained"
                    >
                      Previous Step
                    </Button>
                  )}
                  {idx < completed + 1 && idx < instructions.length - 1 && (
                    <Button
                      onClick={nextStep(idx)}
                      sx={{ float: "right", mt: 1, mr: 1, color: "white" }}
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
    </PagesNavbar>
  );
};

export default Tutorial;
