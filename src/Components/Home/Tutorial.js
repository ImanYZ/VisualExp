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

import {
  firebaseState,
  emailState,
  fullnameState,
} from "../../store/AuthAtoms";

import PagesNavbar from "./PagesNavbar";
import Typography from "./modules/components/Typography";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

import instructions from "./tutorialIntroductionQuestions";

const Tutorial = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);

  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState(0);
  const [completed, setCompleted] = useState(-1);

  useEffect(() => {
    const quests = [];
    for (let ques of instructions[0].questions) {
      const quest = {
        ...ques,
        checks: {},
        error: false,
        helperText: "",
      };
      for (let choice of quest.choices) {
        quest.checks[choice] = false;
      }
      quests.push();
    }
    setQuestions(quests);
  }, []);

  const checkChoice = (idx) => (event) => {
    const quests = [...questions];
    quests[idx].checks[event.target.name] = event.target.checked;
    quests[idx].error = false;
    quests[idx].helperText = " ";
    setQuestions(quests);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const quests = [...questions];
    let allCorrect = true;
    for (let ques of quests) {
      let wrong = false;
      for (let choice in ques.checks) {
        if (
          (ques.checks[choice] && !ques.answers.includes(choice)) ||
          (!ques.checks[choice] && ques.answers.includes(choice))
        ) {
          wrong = true;
          allCorrect = false;
        }
      }
      if (wrong) {
        ques.helperText =
          "Incorrect! Please rewatch the video and answer again.";
        ques.error = true;
      } else {
        ques.helperText = "You got it!";
        ques.error = false;
      }
    }
    setQuestions(quests);
    if (allCorrect) {
      setCompleted(expanded);
    }
  };

  const handleChange = (idx) => (event, newExpanded) => {
    setExpanded(newExpanded ? idx : false);
  };

  return (
    <PagesNavbar>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial
      </Typography>
      {instructions.map((instr, idx) => (
        <Accordion
          key={instr.title}
          expanded={expanded === idx}
          onChange={handleChange(idx)}
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
              {idx + ". " + instr.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <YoutubeEmbed embedId={instr.YouTube} />
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
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <form onSubmit={handleSubmit}>
                    {questions.map((question, qIdx) => {
                      return (
                        <FormControl
                          key={qIdx}
                          required
                          error={question.error}
                          component="fieldset"
                          variant="standard"
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
                                      choice + ". " + question.choices[choice]
                                    }
                                  />
                                );
                              }
                            )}
                          </FormGroup>
                          <FormHelperText>{question.helperText}</FormHelperText>
                        </FormControl>
                      );
                    })}
                    <Button
                      sx={{ mt: 1, mr: 1 }}
                      type="submit"
                      variant="outlined"
                    >
                      Submit Answers
                    </Button>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </PagesNavbar>
  );
};

export default Tutorial;
