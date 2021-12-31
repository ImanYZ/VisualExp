import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Chip from "@mui/material/Chip";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { firebaseState } from "../../store/AuthAtoms";

import "./LifeLogger.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const tDApiToken = "080c73dd8124eb55c3edb489e42063bef8c9551d";

const projectsLookup = {
  1489942473: "Health",
  1489942475: "Professional",
  2219646374: "Exercise",
  2219646407: "Future",
  2268637474: "1Cademy",
};

const sectionsLookup = {
  0: "(No Section)",
  53641371: "1",
  64902719: "Recurrent",
  73416554: "Life Management Project",
  53641630: "Recurrents",
  53653799: "Behavioral Economics",
  59208068: "Reducing Misinformation Dissemination Project",
  59208172: "Science Paper",
  59208413: "DAG Layout Project",
  59208567: "Runestone Experiment",
  53641454: "Dumbbells",
  53641566: "TaiChi",
  53641654: "Recurrents",
  53653353: "To-dos",
  53657413: "Research",
  64902104: "Micro-task Management Project",
  64902131: "Citizen Science Project",
  64902177: "Knowledge Representation Experiments",
};

const LifeLogger = () => {
  const firebase = useRecoilValue(firebaseState);

  const [projects, setProjects] = useState({});
  const [sent, setSent] = useState(false);
  const [projectExpanded, setProjectExpanded] = useState(false);
  const [sectionExpanded, setSectionExpanded] = useState(false);
  const [summary, setSummary] = useState("");
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const tDTasks = await axios.get(
          "https://api.todoist.com/rest/v1/tasks",
          {
            headers: {
              Authorization: `Bearer ${tDApiToken}`,
            },
          }
        );
        const projs = {};
        for (let tsk of tDTasks.data) {
          if (tsk.project_id in projs) {
            if (tsk.section_id in projs[tsk.project_id].sections) {
              projs[tsk.project_id].sections[tsk.section_id].tasks.push({
                id: tsk.id,
                content: tsk.content,
              });
            } else {
              projs[tsk.project_id].sections[tsk.section_id] = {
                tasks: [{ id: tsk.id, content: tsk.content }],
                name: sectionsLookup[tsk.section_id],
              };
            }
          } else {
            projs[tsk.project_id] = {
              sections: {
                [tsk.section_id]: {
                  tasks: [{ id: tsk.id, content: tsk.content }],
                  name: sectionsLookup[tsk.section_id],
                },
              },
              name: projectsLookup[tsk.project_id],
            };
          }
        }
        setProjects(projs);
      } catch (err) {
        console.log({ err });
      }
    };
    getProjects();
  }, []);

  const clickProject = (panel) => (event, isProjectExpanded) => {
    setProjectExpanded(isProjectExpanded ? panel : false);
    setSectionExpanded(false);
  };

  const clickSection = (panel) => (event, isSectionExpanded) => {
    setSectionExpanded(isSectionExpanded ? panel : false);
  };

  const closeSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSent(false);
  };

  const selectDuration = (event) => {
    setDuration(event.target.value);
  };

  const selectTask = (content) => (event) => {
    setSummary(content);
  };

  const schedule = async (event) => {
    try {
      await firebase.idToken();
      axios.post("/scheduleLifeLog", {
        duration,
        summary,
      });
      setSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="LifeLoggerContainer">
      <div id="SubmitContainer">
        <div id="Summary">{summary}</div>
        <FormControl component="fieldset">
          <FormLabel component="legend">Minutes</FormLabel>
          <RadioGroup
            row
            aria-label="Duration"
            name="duration"
            value={duration}
            onChange={selectDuration}
          >
            <FormControlLabel value={1} control={<Radio />} label="1" />
            <FormControlLabel value={4} control={<Radio />} label="4" />
            <FormControlLabel value={10} control={<Radio />} label="10" />
            <FormControlLabel value={25} control={<Radio />} label="25" />
            <FormControlLabel value={40} control={<Radio />} label="40" />
            <FormControlLabel value={55} control={<Radio />} label="55" />
          </RadioGroup>
        </FormControl>
        <Button
          id="SubmitButton"
          onClick={schedule}
          className="Button"
          variant="contained"
        >
          Add Task
        </Button>
      </div>
      {Object.keys(projects).map((prjK) => {
        return (
          <Accordion
            key={prjK}
            expanded={projectExpanded === prjK}
            onChange={clickProject(prjK)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={prjK + "bh-content"}
              id={prjK + "bh-header"}
            >
              {projects[prjK].name}
            </AccordionSummary>
            <AccordionDetails>
              {Object.keys(projects[prjK].sections).map((sectionK) => {
                return (
                  <Accordion
                    key={sectionK}
                    expanded={sectionExpanded === sectionK}
                    onChange={clickSection(sectionK)}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={sectionK + "bh-content"}
                      id={sectionK + "bh-header"}
                    >
                      {projects[prjK].sections[sectionK].name}
                    </AccordionSummary>
                    <AccordionDetails>
                      {projects[prjK].name === "Health" &&
                        projects[prjK].sections[sectionK].name === "1" && (
                          <div className="TaskChip">
                            <Chip
                              label="💨"
                              variant="outlined"
                              onClick={selectTask("💨")}
                            />
                          </div>
                        )}
                      {projects[prjK].sections[sectionK].tasks.map((task) => {
                        return (
                          <div key={task.id} className="TaskChip">
                            <Chip
                              label={task.content}
                              variant="outlined"
                              onClick={selectTask(task.content)}
                            />
                          </div>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}
      <Snackbar open={sent} autoHideDuration={4000} onClose={closeSnackbar}>
        <Alert
          onClose={closeSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          💨 1 min Sent!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LifeLogger;
