import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
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

  const [expanded, setExpanded] = useState(instructions[0].title);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const quests = [];
    for (let ques of instructions[0].questions) {
      quests.push({
        ...ques,
        choice: "",
        error: false,
        helperText: "",
      });
    }
  }, []);

  return (
    <PagesNavbar>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial
      </Typography>
      {instructions.map((instr, idx) => (
        <Accordion
          key={instr.title}
          expanded={expanded === instr.title}
          onChange={handleChange(instr.title)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ fontWeight: "700" }}
            >
              {idx + instr.title}
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
                    {questions.map((question, idx) => {
                      return (
                        <FormControl error={question.error} variant="standard">
                          <FormLabel id="QuestionsErrorRadios">
                            {question.stem}
                          </FormLabel>
                          <RadioGroup
                            aria-labelledby="QuestionsErrorRadios"
                            name="quiz"
                            value={question.choice}
                            onChange={chooseAnswers(idx)}
                          >
                            {Object.keys(question.choices).map((choice) => {
                              return (
                                <FormControlLabel
                                  value={choice}
                                  control={<Radio />}
                                  label={
                                    choice + ". " + question.choices[choice]
                                  }
                                />
                              );
                            })}
                          </RadioGroup>
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
