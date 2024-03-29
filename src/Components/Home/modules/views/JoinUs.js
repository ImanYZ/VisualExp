import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import TextareaAutosize from "@mui/material/TextareaAutosize";

import {
  firebaseState,
  fullnameState,
  resumeUrlState,
  transcriptUrlState,
  communiTestsEndedState,
  applicationsSubmittedState,
  emailState
} from "../../../../store/AuthAtoms";
import { hasScheduledState, completedExperimentState } from "../../../../store/ExperimentAtoms";

import Button from "../components/Button";
import Typography from "../components/Typography";
import UploadButton from "../components/UploadButton";

import { isValidHttpUrl } from "../../../../utils";
import {
  baseG200,
  baseG400,
  gray200,
  gray25,
  gray400,
  gray700,
  green100,
  orange200,
  orangeDark,
  orangeLight,
  orangeLighter,
  successDark,
  warningDark,
  yellow100
} from "../../../../utils/colors";

const JoinUs = props => {
  const { themeName } = props || {};
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const hasScheduled = useRecoilValue(hasScheduledState);
  const completedExperiment = useRecoilValue(completedExperimentState);
  const email = useRecoilValue(emailState);
  const [communiTestsEnded, setCommuniTestsEnded] = useRecoilState(communiTestsEndedState);
  const [resumeUrl, setResumeUrl] = useRecoilState(resumeUrlState);
  const [transcriptUrl, setTranscriptUrl] = useRecoilState(transcriptUrlState);
  const [applicationsSubmitted, setApplicationsSubmitted] = useRecoilState(applicationsSubmittedState);
  const [activeStep, setActiveStep] = useState(0);
  const [checkedInnerStep, setCheckedInnerStep] = useState(0);
  const [activeInnerStep, setActiveInnerStep] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [courseraUrl, setCourseraUrl] = useState("");
  const [courseraUrlError, setCourseraUrlError] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioUrlError, setPortfolioUrlError] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    if (
      applicationsSubmitted &&
      Object.keys(applicationsSubmitted).length > 0 &&
      "community" in props &&
      props.community &&
      props.community.id &&
      applicationsSubmitted[props.community.id]
    ) {
      setActiveStep(3);
    } else if (completedExperiment) {
      setActiveStep(2);
    } else if (hasScheduled) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [hasScheduled, completedExperiment, applicationsSubmitted, props.community, props]);

  useEffect(() => {
    if (needsUpdate) {
      if (!props.community) return;
      let stepsIdx = 0;
      const commTestEnded = props.community.id in communiTestsEnded && communiTestsEnded[props.community.id];
      if (courseraUrl && portfolioUrl && commTestEnded) {
        stepsIdx = 6;
      } else if ((courseraUrl && portfolioUrl) || (courseraUrl && commTestEnded) || (portfolioUrl && commTestEnded)) {
        stepsIdx = 5;
      } else if (courseraUrl || commTestEnded || portfolioUrl) {
        stepsIdx = 4;
      } else if (explanation) {
        stepsIdx = 3;
      } else if (transcriptUrl) {
        stepsIdx = 2;
      } else if (resumeUrl) {
        stepsIdx = 1;
      }
      setCheckedInnerStep(stepsIdx);
      setActiveInnerStep(stepsIdx);
      setNeedsUpdate(false);
    }
  }, [
    needsUpdate,
    resumeUrl,
    transcriptUrl,
    explanation,
    courseraUrl,
    portfolioUrl,
    communiTestsEnded,
    props.community
  ]);

  useEffect(() => {
    const loadExistingApplication = async () => {
      if (!props.community) return;
      const applDoc = await firebase.db
        .collection("applications")
        .doc(fullname + "_" + props.community.id)
        .get();
      if (applDoc.exists) {
        const applData = applDoc.data();
        if ("explanation" in applData && applData.explanation) {
          setExplanation(applData["explanation"]);
        } else {
          setExplanation("");
        }
        if ("courseraUrl" in applData && applData.courseraUrl) {
          setCourseraUrl(applData["courseraUrl"]);
        } else {
          setCourseraUrl("");
        }
        if ("portfolioUrl" in applData && applData.portfolioUrl) {
          setPortfolioUrl(applData["portfolioUrl"]);
        } else {
          setPortfolioUrl("");
        }
        if ("ended" in applData && applData.ended) {
          setCommuniTestsEnded(oldObj => {
            return {
              ...oldObj,
              [props.community.id]: true
            };
          });
        } else {
          setCommuniTestsEnded(oldObj => {
            return {
              ...oldObj,
              [props.community.id]: false
            };
          });
        }
      } else {
        setCommuniTestsEnded(oldObj => {
          return {
            ...oldObj,
            [props.community.id]: false
          };
        });
        setExplanation("");
        setCourseraUrl("");
        setPortfolioUrl("");
      }
      setNeedsUpdate(true);
    };
    if (firebase && fullname && props.community) {
      loadExistingApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebase, fullname, props.community, props.community]);

  const changeExplanation = event => {
    setExplanation(event.target.value);
  };

  const changeCourseraUrl = event => {
    setCourseraUrl(event.target.value);
    if (!isValidHttpUrl(event.target.value) || !event.target.value.startsWith("https://coursera.org/share/")) {
      setCourseraUrlError(true);
    } else {
      setCourseraUrlError(false);
    }
  };

  const changePortfolioUrl = event => {
    setPortfolioUrl(event.target.value);
    if (!isValidHttpUrl(event.target.value)) {
      setPortfolioUrlError(true);
    } else {
      setPortfolioUrlError(false);
    }
  };

  const submitExplanation = async event => {
    if (explanation) {
      const applRef = firebase.db.collection("applications").doc(fullname + "_" + props.community.id);
      const applDoc = await applRef.get();
      if (applDoc.exists) {
        await applRef.update({
          explanation,
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      } else {
        await applRef.set({
          fullname,
          communiId: props.community.id,
          explanation,
          createdAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      }
      if (!props.community.coursera && !props.community.portfolio && !props.community.hasTest) {
        setApplicationsSubmitted(oldApplicatonsSubmitted => {
          return { ...oldApplicatonsSubmitted, [props.community.id]: true };
        });
      }
      setNeedsUpdate(true);
    }
  };

  const submitCourseraUrl = async event => {
    if (courseraUrl && !courseraUrlError) {
      const applRef = firebase.db.collection("applications").doc(fullname + "_" + props.community.id);
      const applDoc = await applRef.get();
      if (applDoc.exists) {
        await applRef.update({
          courseraUrl,
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      } else {
        await applRef.set({
          fullname,
          communiId: props.community.id,
          courseraUrl,
          createdAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      }
      if (!props.community.portfolio && !props.community.hasTest) {
        setApplicationsSubmitted(oldApplicatonsSubmitted => {
          return { ...oldApplicatonsSubmitted, [props.community.id]: true };
        });
      }
      setNeedsUpdate(true);
    }
  };

  const submitPortfolioUrl = async event => {
    if (portfolioUrl && !portfolioUrlError) {
      const applRef = firebase.db.collection("applications").doc(fullname + "_" + props.community.id);
      const applDoc = await applRef.get();
      if (applDoc.exists) {
        await applRef.update({
          portfolioUrl,
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      } else {
        await applRef.set({
          fullname,
          email,
          communiId: props.community.id,
          portfolioUrl,
          createdAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      }
      if (!props.community.hasTest) {
        setApplicationsSubmitted(oldApplicatonsSubmitted => {
          return { ...oldApplicatonsSubmitted, [props.community.id]: true };
        });
      }
      setNeedsUpdate(true);
    }
  };

  const setFileUrl = setUrl => async (name, generatedUrl) => {
    if (fullname) {
      const userRef = firebase.db.collection("users").doc(fullname);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        await userRef.update({
          [name]: generatedUrl,
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      }
      setUrl(generatedUrl);
      setNeedsUpdate(true);
    }
  };

  const changeInnerStep = newStep => event => {
    if (newStep <= checkedInnerStep) {
      setActiveInnerStep(newStep);
    }
  };

  return (
    <Box
      id="JoinUsSection"
      component="section"
      sx={{
        scrollMarginTop: "80px",

        p: 0,
        m: 0
      }}
    >
      <Alert
        severity="success"
        sx={{
          p: "24px 20px",
          mb: "16px",
          borderRadius: "12px",
          color: green100,
          fontWeight: 500,
          backgroundColor: successDark,
          "& svg": {
            fill: "common.black"
          }
        }}
      >
        <strong style={{ color: "common.white" }}>Please note: </strong>
        <br />
        Our application process is sequential; i.e., you need to complete each step to unlock the following steps.
      </Alert>
      {props.community && (
        <Alert
          severity="warning"
          sx={{
            p: "24px 20px",
            borderRadius: "12px",
            color: yellow100,
            fontWeight: 500,
            backgroundColor: warningDark,
            "&  a:link": { color: orangeDark },
            "& a:visited": { color: orangeLighter }
          }}
        >
          <strong style={{ color: "common.white" }}>Please note: </strong>
          <br />
          Participation is unpaid, solely for the purpose of improving research and education, and this position meets{" "}
          <a href="https://www.dol.gov/whd/regs/compliance/whdfs71.htm" target="_blank" rel="noreferrer">
            US Department of Labor Federal Internship Guidelines
          </a>
          . We DO NOT sponsor CPT or OPT for international students. If you have any questions regarding this community,
          contact{" "}
          <a
            href={"mailto:onecademy@umich.edu?subject=" + props.community.title + " - Question"}
            aria-label="email"
            target="_blank"
            rel="noreferrer"
          >
            the community leaders
          </a>
          .
        </Alert>
      )}

      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{
          mt: "19px",
          "& .MuiStepIcon-text": {
            fill: baseG400,
            fontWeight: 600
          },
          "& .Mui-active .MuiStepIcon-text": {
            fill: gray25,
            fontWeight: 600
          },
          "& .MuiStepIcon-root": {
            color: baseG200
          },
          "& .MuiStepIcon-root.Mui-active": {
            color: orangeDark
          },
          "& .MuiStepIcon-root.Mui-completed": {
            color: "success.main"
          },
          "& .MuiStepLabel-label": {
            fontSize: "20px",
            fontWeight: 600,
            color: gray400
          },

          "& .MuiStepLabel-label.Mui-active": {
            fontWeight: 600,
            color: gray200
          },
          "& .MuiStepLabel-label.Mui-completed": {
            fontWeight: 600,
            color: gray200
          },
          "& .MuiButton-root": {
            backgroundColor: orangeDark
          },
          "& .MuiButton-root:hover": {
            backgroundColor: orangeLight
          },
          "& .MuiButton-root.Mui-disabled": {
            backgroundColor: "secondary.light"
          }
        }}
      >
        <Step>
          <StepLabel>Create an account and Schedule for our knowledge representation test.</StepLabel>
          <StepContent>
            <Typography
              sx={{
                color: gray200,
                lineHeight: "24px"
              }}
            >
              One of the most important aspects of 1Cademy is its unique knowledge representation format. To become a
              researcher on 1Cademy, you should first engage in one of our ongoing research projects, as a participant.
              In the project, randomly chosen for you, we will test which type of knowledge representation format works
              better for your reading comprehension, short-term learning, and long-term learning. This will not only
              help us improve the design of 1Cademy, but along the way, you will get experience about how to use
              1Cademy. For this purpose, you should create an account on our research website and specify your
              availabilities for three sessions with our UX researchers. In the first session, they will ask you to read
              two short passages and answer some questions about those passages. This will take an hour. The second and
              third sessions will be only for 30 minutes each and follow a similar format. Note that it is necessary to
              complete the second and third sessions, exactly three and seven days after the first session. So, please
              carefully specify your availability on our research website.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                component="a"
                href="/Activities/experiment"
                target="_blank"
                sx={{
                  p: "10px 36px",
                  color: "common.white",
                  borderRadius: "8px",
                  fontSize: "18px",
                  textTransform: "none"
                }}
              >
                Apply to join
              </Button>
            </Box>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Complete our knowledge representation test.</StepLabel>
          <StepContent>
            <Typography
              sx={{
                color: themeName === "dark" ? "common.white" : "common.white"
              }}
            >
              Please check your Google Calendar. You're invited to three UX Experiment sessions. Please attend all the
              experiment sessions on-time and carefully answer the questions. Your answers will significantly help
              1Cademy communities to improve our collaborative learning and research. Note that your test scores may
              affect our community leaders' decision in whether to accept your application.
            </Typography>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Complete the community-specific application requirements.</StepLabel>
          <StepContent>
            {props.community ? (
              <Stepper
                activeStep={activeInnerStep}
                orientation="vertical"
                sx={{
                  mt: "19px",
                  "& .MuiStepIcon-root": {
                    color: "warning.dark"
                  },
                  "& .MuiStepIcon-root.Mui-active": {
                    color: "secondary.main"
                  },
                  "& .MuiStepIcon-root.Mui-completed": {
                    color: "success.main"
                  },
                  "& .MuiButton-root": {
                    backgroundColor: "secondary.main"
                  },
                  "& .MuiButton-root:hover": {
                    backgroundColor: "secondary.dark"
                  },
                  "& .MuiButton-root.Mui-disabled": {
                    backgroundColor: "secondary.light"
                  }
                }}
              >
                <Step>
                  <StepLabel
                    onClick={changeInnerStep(0)}
                    sx={
                      0 <= checkedInnerStep
                        ? {
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(100, 100, 100, 0.1) !important"
                            }
                          }
                        : {}
                    }
                  >
                    Upload your CV/Résumé in PDF format.
                  </StepLabel>
                  <StepContent>
                    <UploadButton
                      name="Resume"
                      communiId={props.community.id}
                      mimeTypes={["application/pdf"]} // Alternatively "image/png, image/gif, image/jpeg"
                      typeErrorMessage="We only accept a file with PDF format. Please upload another file."
                      sizeErrorMessage="We only accept file sizes less than 10MB. Please upload another file."
                      maxSize={10}
                      storageBucket="visualexp-a7d2c"
                      storageFolder="Resumes/"
                      fileUrl={resumeUrl}
                      setFileUrl={setFileUrl(setResumeUrl)}
                    />
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel
                    onClick={changeInnerStep(1)}
                    sx={
                      1 <= checkedInnerStep
                        ? {
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(100, 100, 100, 0.1) !important"
                            }
                          }
                        : {}
                    }
                  >
                    Upload your most recent unofficial transcript in PDF format.
                  </StepLabel>
                  <StepContent>
                    <UploadButton
                      name="Transcript"
                      communiId={props.community.id}
                      mimeTypes={["application/pdf"]}
                      typeErrorMessage="We only accept a file with PDF format. Please upload another file."
                      sizeErrorMessage="We only accept file sizes less than 10MB. Please upload another file."
                      maxSize={10}
                      storageBucket="visualexp-a7d2c"
                      storageFolder="Transcripts/"
                      fileUrl={transcriptUrl}
                      setFileUrl={setFileUrl(setTranscriptUrl)}
                    />
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel
                    onClick={changeInnerStep(2)}
                    sx={
                      2 <= checkedInnerStep
                        ? {
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(100, 100, 100, 0.1) !important"
                            }
                          }
                        : {}
                    }
                  >
                    Explain why you are applying to join the {props.community.title} community.
                  </StepLabel>
                  <StepContent>
                    <TextareaAutosize
                      style={{ width: "100%", borderRadius: "4px" }}
                      aria-label="explanation text box"
                      minRows={7}
                      placeholder={
                        "Type one or a few paragraph(s) explaining why you are applying to join the " +
                        props.community.title +
                        " community."
                      }
                      onChange={changeExplanation}
                      value={explanation}
                    />
                    <Button
                      sx={{
                        display: "block",
                        margin: "10px 0px 25px 0px",
                        color: "common.white"
                      }}
                      onClick={submitExplanation}
                      color="success"
                      variant="contained"
                    >
                      Submit Explanation
                    </Button>
                  </StepContent>
                </Step>
                {props.community.coursera && (
                  <Step>
                    <StepLabel
                      onClick={changeInnerStep(3)}
                      sx={
                        3 <= checkedInnerStep
                          ? {
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(100, 100, 100, 0.1) !important"
                              }
                            }
                          : {}
                      }
                    >
                      Complete{" "}
                      <a href={props.community.coursera} target="_blank" rel="noreferrer">
                        this Coursera MOOC
                      </a>
                      and enter the certificate URL.
                    </StepLabel>
                    <StepContent>
                      <Typography
                        sx={{
                          color: themeName === "dark" ? "common.white" : undefined
                        }}
                      >
                        As a requirement to apply to this community, you should complete{" "}
                        <a href={props.community.coursera} target="_blank" rel="noreferrer">
                          this Coursera MOOC
                        </a>
                        . Please enter the webpage address (URL) of your Coursera MOOC certificate in the textbox below.
                        You can find this URL by following the following steps:
                        <ol>
                          <li>
                            Complete{" "}
                            <a href={props.community.coursera} target="_blank" rel="noreferrer">
                              this Coursera MOOC
                            </a>
                            .
                          </li>
                          <li>Log in to Coursera and click your name in the top-right corner.</li>
                          <li>In the drop-down menu, click "Accomplishments."</li>
                          <li>In "My Courses" list, click the corresponding course.</li>
                          <li>
                            In the page that opens, you should be able to see the image of your certificate, otherwise,
                            you can contact Coursera customer service to give you guidance on where to find your
                            certificate.
                          </li>
                          <li>Click the "Share Certificate" button.</li>
                          <li>Click "copy."</li>
                          <li>Paste the copied URL in the textbox below.</li>
                          <li>Click "Submit Certificate URL."</li>
                        </ol>
                      </Typography>
                      <TextField
                        style={{ width: "100%" }}
                        error={courseraUrlError}
                        aria-label="Coursera Certificate URL text box"
                        label="Paste Your Coursera MOOC Certificate URL"
                        variant="outlined"
                        helperText={courseraUrlError ? "Invalid Coursera MOOC Certificate URL!" : undefined}
                        onChange={changeCourseraUrl}
                        value={courseraUrl}
                      />
                      <Button
                        sx={{
                          display: "block",
                          margin: "10px 0px 25px 0px",
                          color: "common.white"
                        }}
                        onClick={submitCourseraUrl}
                        color="success"
                        variant="contained"
                      >
                        Submit Certificate URL
                      </Button>
                    </StepContent>
                  </Step>
                )}
                {props.community.portfolio && (
                  <Step>
                    <StepLabel
                      onClick={changeInnerStep(3)}
                      sx={
                        3 <= checkedInnerStep
                          ? {
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(100, 100, 100, 0.1) !important"
                              }
                            }
                          : {}
                      }
                    >
                      Enter your online portfolio URL.
                    </StepLabel>
                    <StepContent>
                      <TextField
                        style={{ width: "100%" }}
                        error={portfolioUrlError}
                        aria-label="Online portfolio URL text box"
                        label="Enter Your Online Portfolio URL"
                        variant="outlined"
                        helperText={portfolioUrlError ? "Invalid online portfolio URL!" : undefined}
                        onChange={changePortfolioUrl}
                        value={portfolioUrl}
                      />
                      <Button
                        sx={{
                          display: "block",
                          margin: "10px 0px 25px 0px",
                          color: "common.white"
                        }}
                        onClick={submitPortfolioUrl}
                        color="success"
                        variant="contained"
                      >
                        Submit Portfolio URL
                      </Button>
                    </StepContent>
                  </Step>
                )}
                {props.community.hasTest && (
                  <Step>
                    <StepLabel
                      onClick={changeInnerStep(3)}
                      sx={
                        3 <= checkedInnerStep
                          ? {
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(100, 100, 100, 0.1) !important"
                              }
                            }
                          : {}
                      }
                    >
                      Complete your domain-specific knowledge test.
                    </StepLabel>
                    <StepContent>
                      <Typography
                        sx={{
                          color: themeName === "dark" ? "common.white" : undefined
                        }}
                      >
                        The last step to apply to this community is a test of your domain-specific knowledge. If you are
                        interested in joining this community but don't have the background knowledge, no worries.
                        Similar to the second phase, we have provided you with a document about the topic and ask you
                        only questions from that document. Just make sure you carefully read the document and choose the
                        most appropriate answers for each question. The community leaders will evaluate your application
                        based on your number of WRONG attempts in answering the questions. Click the button to start the
                        community-specific test.
                      </Typography>
                      <Button
                        variant="contained"
                        component="a"
                        href={"/paperTest/" + props.community.link}
                        target="_blank"
                        sx={{ mt: 1, mr: 1, color: "common.white" }}
                      >
                        Start the Test
                      </Button>
                    </StepContent>
                  </Step>
                )}
              </Stepper>
            ) : (
              <>
                <Typography sx={{ color: "#f8f8f8" }}>
                  Choose one of our communities and complete its application requirements. These requirements may differ
                  from community to community. Click the following button to jump to our list of communities. Then, you
                  can find more information about each community and their requirements by clicking the corresponding
                  community section.
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
                <Typography sx={{ color: "#f8f8f8" }}>
                  Meanwhile, you can go through the 1Cademy tutorial by clicking the following button:
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
                      1Cademy Tutorial
                    </Button>
                  </div>
                </Box>
              </>
            )}
          </StepContent>
        </Step>
        {/* <Step>
          <StepLabel>Complete the 1Cademy tutorial test.</StepLabel>
          <StepContent>
            <Typography>
              Please go through the 1Cademy tutorial, carefully watch the short
              videos, and answer the questions. Note that your test scores may
              impact our community leaders' decision in whether to accept your
              application. For effective participation in our communities, you
              need to first learn how our system works.
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
        </Step> */}
      </Stepper>
      {activeStep === 3 && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>
            All steps completed. After reviewing your application, our community leaders will email you regarding their
            decision.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default JoinUs;
