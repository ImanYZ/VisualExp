import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Chip from "@mui/material/Chip";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { firebaseState } from "../../store/AuthAtoms";

import "./LifeLogger.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const tDApiToken = "080c73dd8124eb55c3edb489e42063bef8c9551d";

const LifeLogger = () => {
  const firebase = useRecoilValue(firebaseState);

  const [projects, setProjects] = useState({});
  const [sent, setSent] = useState(false);
  const [projectExpanded, setProjectExpanded] = React.useState(false);
  const [sectionExpanded, setSectionExpanded] = React.useState(false);

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
                name: tsk.project_id,
              };
            }
          } else {
            projs[tsk.project_id] = {
              sections: {
                [tsk.section_id]: {
                  tasks: [{ id: tsk.id, content: tsk.content }],
                  name: tsk.section_id,
                },
              },
              name: tsk.project_id,
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

  const schedule = (summary, duration) => async (event) => {
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
      <div id="SubmitContainer"></div>
      {Object.keys(projects).map((prjK) => {
        return (
          <Accordion
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
                    expanded={clickSection === sectionK}
                    onChange={clickProject(sectionK)}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={sectionK + "bh-content"}
                      id={sectionK + "bh-header"}
                    >
                      {projects[prjK].sections[sectionK].name}
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={1} direction="row">
                        {prjK === "123" && sectionK === "123" && (
                          <Chip
                            label="Clickable"
                            variant="outlined"
                            onClick={schedule(task.content, 1)}
                          >
                            💨
                          </Chip>
                        )}
                        {projects[prjK].sections[sectionK].tasks.map((task) => {
                          return (
                            <Chip
                              label="Clickable"
                              variant="outlined"
                              onClick={schedule(task.content, 1)}
                            >
                              {task.content}
                            </Chip>
                          );
                        })}
                      </Stack>
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
