import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

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

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Fireworks } from "fireworks-js/dist/react";

import {
  firebaseState,
  fullnameState,
  communiTestsEndedState,
  applicationsSubmittedState,
} from "../../store/AuthAtoms";

import SnackbarComp from "../SnackbarComp";
import PagesNavbar from "./PagesNavbar";
import Typography from "./modules/components/Typography";

import communitiesPapers from "./modules/views/communitiesPapers";

for (let communi in communitiesPapers) {
  communitiesPapers[communi]["Congratulations"] = {
    title: "Congratulations!",
    questions: {},
  };
}

const PaperTest = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [communiTestsEnded, setCommuniTestsEnded] = useRecoilState(
    communiTestsEndedState
  );
  const [applicationsSubmitted, setApplicationsSubmitted] = useRecoilState(
    applicationsSubmittedState
  );

  const [papers, setPapers] = useState([]);
  const [questions, setQuestions] = useState({});
  const [expanded, setExpanded] = useState(0);
  const [completed, setCompleted] = useState(-1);
  const [fireworks, setFireworks] = useState(false);
  const [attempts, setAttempts] = useState({});
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const paps = [];
    for (let paperId in communitiesPapers[props.communiId]) {
      paps.push({
        ...communitiesPapers[props.communiId][paperId],
        id: paperId,
      });
    }
    setPapers(paps);
  }, []);

  useEffect(() => {
    const loadAttempts = async () => {
      let oAttempts = {};
      const quests = {};
      const applRef = firebase.db
        .collection("applications")
        .doc(fullname + "_" + props.communiId);
      const applDoc = await applRef.get();
      let applData;
      if (applDoc.exists) {
        applData = applDoc.data();
        if ("corrects" in applData) {
          setCorrectAttempts(applData.corrects);
        }
        if ("wrongs" in applData) {
          setWrongAttempts(applData.wrongs);
        }
        if ("completed" in applData) {
          setCompleted(applData.completed);
        }
        if ("attempts" in applData) {
          oAttempts = applData.attempts;
        }
      }
      for (let paperId in communitiesPapers[props.communiId]) {
        if (!(paperId in oAttempts)) {
          oAttempts[paperId] = {
            corrects: 0,
            wrongs: 0,
            questions: {},
          };
        }
        for (let ques in communitiesPapers[props.communiId][paperId]
          .questions) {
          if (!(ques in oAttempts[paperId].questions)) {
            oAttempts[paperId].questions[ques] = {
              answers: [],
              corrects: 0,
              wrongs: 0,
            };
          }
          const quest = {
            ...communitiesPapers[props.communiId][paperId].questions[ques],
            id: ques,
            checks: {},
            error: false,
            helperText: " ",
          };
          if (
            "explanation" in oAttempts[paperId].questions[ques] &&
            oAttempts[paperId].questions[ques].explanation
          ) {
            quest.explanation = oAttempts[paperId].questions[ques].explanation;
            quest.explaId = oAttempts[paperId].questions[ques].explaId;
          }
          if (oAttempts[paperId].questions[ques].answers.length > 0) {
            let wrong = false;
            for (let choice in quest.choices) {
              if (oAttempts[paperId].questions[ques].answers.includes(choice)) {
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
                "Incorrect! Please review the document and answer again. Please select all that apply.";
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
          if (paperId in quests) {
            quests[paperId].push(quest);
          } else {
            quests[paperId] = [quest];
          }
        }
      }
      setQuestions(quests);
      if (applDoc.exists && "completed" in applData) {
        changeExpand(applData.completed + 1, applRef, applDoc, oAttempts);
      } else {
        setAttempts(oAttempts);
      }
    };
    if (papers.length > 0 && fullname) {
      loadAttempts();
    }
  }, [papers, fullname]);

  useEffect(() => {
    if (completed !== -1 && completed === papers.length - 2) {
      setFireworks(true);
      setTimeout(() => {
        setFireworks(false);
      }, 7000);
    }
  }, [papers, completed]);

  const checkChoice = (paperId, qIdx) => (event) => {
    const quests = { ...questions };
    quests[paperId][qIdx].checks[event.target.name] = event.target.checked;
    quests[paperId][qIdx].error = false;
    quests[paperId][qIdx].helperText = " ";
    setQuestions(quests);
  };

  const openExplanation = (paperId, qIdx) => (event) => {
    const quests = { ...questions };
    quests[paperId][qIdx].explanationOpen =
      !quests[paperId][qIdx].explanationOpen;
    setQuestions(quests);
  };

  const changeExplanation = (paperId, qIdx) => (event) => {
    const quests = { ...questions };
    quests[paperId][qIdx].explanation = event.target.value;
    setQuestions(quests);
  };

  const handleSubmit = (paperId, qIdx) => async (event) => {
    event.preventDefault();

    if (expanded === false) {
      return;
    }
    const oAttempts = { ...attempts };
    const quests = { ...questions };
    const question = quests[paperId][qIdx];
    let cAttempts = correctAttempts;
    let wAttempts = wrongAttempts;
    let wrong = false;
    oAttempts[paperId].submitted = firebase.firestore.Timestamp.fromDate(
      new Date()
    );
    if ("explanation" in question && question.explanation) {
      oAttempts[paperId].questions[question.id].explanation =
        question.explanation;
      if ("explaId" in question && question.explaId) {
        oAttempts[paperId].questions[question.id].explaId = question.explaId;
      }
    }
    for (let choice in question.checks) {
      if (
        question.checks[choice] &&
        !oAttempts[paperId].questions[question.id].answers.includes(choice)
      ) {
        oAttempts[paperId].questions[question.id].answers.push(choice);
      }
      if (
        !question.checks[choice] &&
        oAttempts[paperId].questions[question.id].answers.includes(choice)
      ) {
        oAttempts[paperId].questions[question.id].answers = oAttempts[
          paperId
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
      oAttempts[paperId].questions[question.id].wrongs += 1;
      oAttempts[paperId].wrongs += 1;
      allCorrect = false;
      wAttempts += 1;
      question.helperText =
        "Incorrect! Please review the document and answer again. Please select all that apply.";
      question.error = true;
    } else {
      oAttempts[paperId].questions[question.id].corrects += 1;
      oAttempts[paperId].corrects += 1;
      cAttempts += 1;
      question.helperText = "You got it!";
      question.error = false;
    }
    if (allCorrect) {
      for (let ques of quests[paperId]) {
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
    let applData = {
      attempts: oAttempts,
      corrects: cAttempts,
      wrongs: wAttempts,
      completed,
    };
    if (allCorrect) {
      // if (expanded < papers.length - 1) {
      //   changeExpand(expanded + 1);
      // }
      if (completed < expanded) {
        applData.completed = expanded;
        setCompleted(expanded);
        if (expanded === papers.length - 2) {
          setCommuniTestsEnded((oldObj) => {
            return {
              ...oldObj,
              [props.communiId]: true,
            };
          });
          applData.ended = true;
        }
      }
    }
    if (fullname) {
      const applRef = firebase.db
        .collection("applications")
        .doc(fullname + "_" + props.communiId);
      const applDoc = await applRef.get();
      if ("explanation" in question && question.explanation) {
        let explaRef = firebase.db.collection("explanations").doc();
        let explaDoc;
        if ("explaId" in question && question.explaId) {
          explaRef = firebase.db
            .collection("explanations")
            .doc(question.explaId);
          explaDoc = await explaRef.get();
        } else {
          oAttempts[paperId].questions[question.id].explaId = explaRef.id;
          question.explaId = explaRef.id;
          applData.attempts[paperId].questions[question.id].explaId =
            explaRef.id;
        }
        const explaData = {
          fullname,
          paperId,
          qIdx,
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
      if (applDoc.exists) {
        await applRef.update(applData);
      } else {
        await applRef.set(applData);
      }
      if (applData.ended) {
        setApplicationsSubmitted((oldApplicatonsSubmitted) => {
          return { ...oldApplicatonsSubmitted, [props.communiId]: true };
        });
        const userRef = firebase.db.collection("users").doc(fullname);
        await userRef.update({
          applicationsSubmitted: {
            ...applicationsSubmitted,
            [props.communiId]: true,
          },
        });
      }
    }
  };

  const submitExplanation = (paperId, qIdx) => async (event) => {
    event.preventDefault();

    if (expanded === false) {
      return;
    }
    const question = questions[paperId][qIdx];
    if (fullname && "explanation" in question && question.explanation) {
      const oAttempts = { ...attempts };
      oAttempts[paperId].submitted = firebase.firestore.Timestamp.fromDate(
        new Date()
      );
      oAttempts[paperId].questions[question.id].explanation =
        question.explanation;
      if ("explaId" in question && question.explaId) {
        oAttempts[paperId].questions[question.id].explaId = question.explaId;
      }
      setAttempts(oAttempts);
      let applData = {
        attempts: oAttempts,
      };
      const applRef = firebase.db
        .collection("applications")
        .doc(fullname + "_" + props.communiId);
      const applDoc = await applRef.get();
      if ("explanation" in question && question.explanation) {
        let explaRef = firebase.db.collection("explanations").doc();
        let explaDoc;
        if ("explaId" in question && question.explaId) {
          explaRef = firebase.db
            .collection("explanations")
            .doc(question.explaId);
          explaDoc = await explaRef.get();
        } else {
          oAttempts[paperId].questions[question.id].explaId = explaRef.id;
          question.explaId = explaRef.id;
          applData.attempts[paperId].questions[question.id].explaId =
            explaRef.id;
        }
        const explaData = {
          fullname,
          paperId,
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
      if (applDoc.exists) {
        await applRef.update(applData);
      } else {
        await applRef.set(applData);
      }
    }
  };

  const changeExpand = async (newExpand, applRef, applDoc, oAttempts) => {
    setExpanded(newExpand);
    if (Number.isInteger(newExpand)) {
      if (!applRef) {
        applRef = firebase.db
          .collection("applications")
          .doc(fullname + "_" + props.communiId);
        applDoc = await applRef.get();
        oAttempts = { ...attempts };
      }
      oAttempts[papers[newExpand].id].started =
        firebase.firestore.Timestamp.fromDate(new Date());
      setAttempts(oAttempts);
      if (applDoc.exists) {
        await applRef.update({ attempts: oAttempts });
      } else {
        await applRef.set({
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
    if (idx <= completed + 1 && idx < papers.length - 1) {
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
      <PagesNavbar tutorial={true} thisPage="Test">
        <div id="TutorialHeader">
          <Typography variant="h3" gutterBottom marked="center" align="center">
            Community Specific Test
          </Typography>
          <Box sx={{ mb: "10px" }}>
            <Box>
              Please carefully read the document before answering any of the
              questions, and <strong>select all the choices that apply</strong>.
            </Box>
            <Box sx={{ mt: "10px", fontSize: "19px" }}>
              The community leaders will decide about your application based on{" "}
              <strong>your total WRONG attempts.</strong>
            </Box>
          </Box>
        </div>
        {papers.map((paper, idx) => (
          <Accordion
            key={paper.id}
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
                  : idx === completed + 1 && idx !== papers.length - 1
                  ? "🔓 "
                  : "✅ ") + paper.title}
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
                        height: { sx: "400px", md: "calc(100vh - 160px)" },
                        overflowY: { sx: "hidden", md: "auto" },
                      }}
                    >
                      {expanded !== papers.length - 1 ? (
                        <>
                          <Typography>
                            Read{" "}
                            <a href={paper.url} target="_blank">
                              the following document
                            </a>{" "}
                            first.
                          </Typography>
                          <object
                            data={paper.url}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                          >
                            <iframe
                              src={
                                "https://docs.google.com/viewer?url=" +
                                paper.url +
                                "&embedded=true"
                              }
                            ></iframe>
                          </object>
                        </>
                      ) : (
                        <Typography
                          variant="h5"
                          gutterBottom
                          sx={{ fontWeight: "700" }}
                        >
                          You successfully completed the 1Cademy application
                          process. The community leaders will review all parts
                          of your application and will email you about the
                          result in a few days to weeks, depending on the number
                          of applications they have received.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        padding: "10px",
                        mb: "19px",
                        height: { sx: "none", md: "calc(100vh - 160px)" },
                        overflowY: { sx: "hidden", md: "auto" },
                      }}
                    >
                      {idx === papers.length - 1 && (
                        <Box sx={{ mb: "10px", fontWeight: 700 }}>
                          You had a total of {wrongAttempts} wrong attemps in
                          answering the questions.
                        </Box>
                      )}
                      {paper.id in questions &&
                        questions[paper.id].map((question, qIdx) => {
                          return (
                            <>
                              <form
                                key={qIdx}
                                onSubmit={handleSubmit(paper.id, qIdx)}
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
                                                  paper.id,
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
                                    onClick={openExplanation(paper.id, qIdx)}
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
                                      "If you're experiencing difficulties with this question, please explain why."
                                    }
                                    onChange={changeExplanation(paper.id, qIdx)}
                                    value={question.explanation}
                                  />
                                  <Button
                                    sx={{
                                      display: "block",
                                      margin: "10px 0px 25px 0px",
                                      color: "common.white",
                                    }}
                                    onClick={submitExplanation(paper.id, qIdx)}
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
                    {idx < completed + 1 && idx < papers.length - 1 && (
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

export default PaperTest;
