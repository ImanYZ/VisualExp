import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Paper from "@mui/material/Paper";

import Button from "../components/Button";
import Typography from "../components/Typography";

import sectionsOrder from "./sectionsOrder";
const sectionIdx = sectionsOrder.findIndex(
  (sect) => sect.id === "JoinUsSection"
);

const steps = [
  {
    label:
      "Create an account and Schedule for our knowledge representation test",
    description: `One of the most important aspects of 1Cademy is its unique knowledge 
    representation format. As the first step in your application process, we need to 
    figure out which knowledge representation format works better for your reading 
    comprehension, short-term learning, and long-term learning. You should create an 
    account on our research website and specify your availabilities for three sessions 
    in a week with our UX researchers. In the first session, they will meet with you 
    for an hour and will ask you to read two short passages in two different knowledge 
    representation formats. Then, you'll answer some questions about those passages and 
    express your ideas comparing the two. This will take an hour. The second and third 
    sessions will be only for 30 minutes each and follow a similar format. Note that it 
    is necessary to complete the second and the third sessions, exactly three and seven 
    days after the first session. So, please carefully specify your availability on our 
    research website.`,
    button: "Create My Account & Schedule",
  },
  {
    label: "Create an ad group",
    description:
      "An ad group contains one or more ads which target a shared set of keywords.",
  },
  {
    label: "Create an ad",
    description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
];

const JoinUs = (props) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Container
      id="JoinUsSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
      }}
    >
      <Typography variant="h4" marked="center" align="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography>
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{
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
              knowledge representation format. As the first step in your
              application process, we need to figure out which knowledge
              representation format works better for your reading comprehension,
              short-term learning, and long-term learning. You should create an
              account on our research website and specify your availabilities
              for three sessions in a week with our UX researchers. In the first
              session, they will meet with you for an hour and will ask you to
              read two short passages in two different knowledge representation
              formats. Then, you'll answer some questions about those passages
              and express your ideas comparing the two. This will take an hour.
              The second and third sessions will be only for 30 minutes each and
              follow a similar format. Note that it is necessary to complete the
              second and the third sessions, exactly three and seven days after
              the first session. So, please carefully specify your availability
              on our research website.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <div>
                <Button
                  variant="contained"
                  component="a"
                  href="/"
                  sx={{ mt: 1, mr: 1, color: "common.white" }}
                >
                  Create My Account &amp; Schedule
                </Button>
              </div>
            </Box>
          </StepContent>
        </Step>
        <Step key={step.label}>
          <StepLabel
            optional={
              index === 2 ? (
                <Typography variant="caption">Last step</Typography>
              ) : null
            }
          >
            {step.label}
          </StepLabel>
          <StepContent>
            <Typography>{step.description}</Typography>
            <Box sx={{ mb: 2 }}>
              <div>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {index === steps.length - 1 ? "Finish" : "Continue"}
                </Button>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
              </div>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>
            All steps completed. After reviewing your application, our community
            leaders will email you regarding your application.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default JoinUs;
