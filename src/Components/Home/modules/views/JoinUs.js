import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";

import {
  hasScheduledState,
  completedExperimentState,
} from "../../../../store/ExperimentAtoms";

import Button from "../components/Button";
import Typography from "../components/Typography";

import sectionsOrder from "./sectionsOrder";
const sectionIdx = sectionsOrder.findIndex(
  (sect) => sect.id === "JoinUsSection"
);

const JoinUs = (props) => {
  const hasScheduled = useRecoilValue(hasScheduledState);
  const completedExperiment = useRecoilValue(completedExperimentState);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (completedExperiment) {
      setActiveStep(2);
    } else if (hasScheduled) {
      setActiveStep(1);
    }
  }, [hasScheduled, completedExperiment]);

  return (
    <Container
      id="JoinUsSection"
      component="section"
      sx={{
        pt: !props.community ? 7 : 1,
        pb: 10,
      }}
    >
      {!props.community ? (
        <Typography variant="h4" marked="center" align="center" sx={{ mb: 7 }}>
          {sectionsOrder[sectionIdx].title}
        </Typography>
      ) : (
        <Alert severity="warning">
          <strong>Note: </strong> Participation is unpaid, solely for the
          purpose of improving research and education, and this position meets{" "}
          <a
            href="https://www.dol.gov/whd/regs/compliance/whdfs71.htm"
            target="_blank"
          >
            US Department of Labor Federal Internship Guidelines
          </a>
          . We DO NOT sponsor CPT or OPT for international students. If you have
          any questions regarding this community, contact{" "}
          <a
            href={
              "mailto:onecademy@umich.edu?subject=" +
              props.community.title +
              " - Question"
            }
            aria-label="email"
            target="_blank"
          >
            the community leaders
          </a>
          .
        </Alert>
      )}
      <Alert severity="success">
        <strong>Note:</strong> Our application process is sequential; i.e., you
        need to complete each step to unlock the following steps.
      </Alert>
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{
          mt: "19px",
          "& .MuiStepIcon-root": {
            color: "warning.dark",
          },
          "& .MuiStepIcon-root.Mui-active": {
            color: "secondary.main",
          },
          "& .MuiStepIcon-root.Mui-completed": {
            color: "success.main",
          },
          "& .MuiButton-root": {
            backgroundColor: "secondary.main",
          },
          "& .MuiButton-root:hover": {
            backgroundColor: "secondary.dark",
          },
          "& .MuiButton-root.Mui-disabled": {
            backgroundColor: "secondary.light",
          },
        }}
      >
        <Step>
          <StepLabel>
            Create an account and Schedule for our knowledge representation test
          </StepLabel>
          <StepContent>
            <Typography>
              One of the most important aspects of 1Cademy is its unique
              knowledge representation format. To become a researcher on
              1Cademy, you should first engage in one of our ongoing research
              projects, as a participant. In the project, randomly chosen for
              you, we will test which type of knowledge representation format
              works better for your reading comprehension, short-term learning,
              and long-term learning. This will not only help us improve the
              design of 1Cademy, but along the way, you will get experience
              about how to use 1Cademy. For this purpose, you should create an
              account on our research website and specify your availabilities
              for three sessions with our UX researchers. In the first session,
              they will ask you to read two short passages and answer some
              questions about those passages. This will take an hour. The second
              and third sessions will be only for 30 minutes each and follow a
              similar format. Note that it is necessary to complete the second
              and third sessions, exactly three and seven days after the first
              session. So, please carefully specify your availability on our
              research website.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <div>
                <Button
                  variant="contained"
                  component="a"
                  href="/"
                  target="_blank"
                  sx={{ mt: 1, mr: 1, color: "common.white" }}
                >
                  Create My Account &amp; Schedule
                </Button>
              </div>
            </Box>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Complete our knowledge representation test</StepLabel>
          <StepContent>
            <Typography>
              Please check your Google Calendar. You're invited to three UX
              Experiment sessions. Please attend all the experiment sessions
              on-time and carefully answer the questions. Your answers will
              significantly help 1Cademy communities to improve our
              collaborative learning and research. Note that your test scores
              may affect our community leaders' decision in whether to accept
              your application.
            </Typography>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Complete the 1Cademy tutorial test</StepLabel>
          <StepContent>
            <Typography>
              Please go through the 1Cademy tutorial and carefully watch the
              short videos and answer the questions. Note that your test scores
              may impact our community leaders' decision in whether to accept
              your application. For effective participation in our communities,
              you need to first learn how our system works.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <div>
                <Button
                  variant="contained"
                  component="a"
                  href="/tutorial"
                  target="_blank"
                  sx={{ mt: 1, mr: 1, color: "common.white" }}
                >
                  Start 1Cademy Tutorial
                </Button>
              </div>
            </Box>
          </StepContent>
        </Step>
        <Step>
          <StepLabel
            optional={<Typography variant="caption">Last step</Typography>}
          >
            Complete the community-specific application requirements
          </StepLabel>
          <StepContent>
            <Typography>
              Choose one of our communities and complete its application
              requirements Your last step is to complete your chosen
              communities' application requirements. These requirements may
              differ from community to community. You can find more information
              about each community and their requirements by clicking the
              corresponding community from our list of communities. You can
              click the following button to jump to our list of communities.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <div>
                <Button
                  variant="contained"
                  component="a"
                  href="/communities"
                  target="_blank"
                  sx={{ mt: 1, mr: 1, color: "common.white" }}
                >
                  Explore our communities &amp; their requirements
                </Button>
              </div>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
      {activeStep === 4 && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>
            All steps completed. After reviewing your application, our community
            leaders will email you regarding their decision.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default JoinUs;
