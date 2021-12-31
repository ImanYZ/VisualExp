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
import Typography from "@mui/material/Typography";
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
        console.log({ data: tDTasks.data });
        const projs = {};
        // for (let tsk of tDTasks.data) {
        //     if (tsk.project_id in projs) {

        //     } else {
        //         projs[tsk.project_id] = {[tsk.section_id]: []}
        //     }
        // }
        // setProjects(projs);
      } catch (err) {
        console.log({ err });
      }
    };
    getProjects();
  }, []);

  const handleChange = (panel) => (event, isProjectExpanded) => {
    setProjectExpanded(isProjectExpanded ? panel : false);
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
      {Object.keys(projects).map((prjK) => {
        return (
          <Accordion
            expanded={projectExpanded === projects[prjK].id}
            onChange={handleChange(projects[prjK].id)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={projects[prjK].id + "bh-content"}
              id={projects[prjK].id + "bh-header"}
            >
              {projects[prjK].name}
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
                feugiat. Aliquam eget maximus est, id dignissim quam.
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
      <Stack spacing={2} direction="row">
        <Button variant="outlined" onClick={schedule("💨 1 min", 1)}>
          💨 1 min
        </Button>
      </Stack>
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
