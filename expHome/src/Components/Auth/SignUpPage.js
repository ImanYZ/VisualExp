import React, { useState, useEffect, Suspense } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import axios from "axios";
import { firebaseState, emailState, emailVerifiedState, fullnameState, leadingState } from "../../store/AuthAtoms";
import { Autocomplete, Paper, TextField, Backdrop, CircularProgress, Link } from "@mui/material";
import backgroundImage from "../../assets/HomeBackGroundDarkMode.png";
import { styled } from "@mui/material/styles";
import {
  currentProjectState,
  phaseState,
  stepState,
  passageState,
  conditionState,
  nullPassageState,
  choicesState
} from "../../store/ExperimentAtoms";

import { projectSpecsState, projectState } from "../../store/ProjectAtoms";

import { TabPanel, a11yProps } from "../TabPanel/TabPanel";
import ValidatedInput from "../ValidatedInput/ValidatedInput";

import { isEmail, getFullname, shuffleArray } from "../../utils";

import "./ConsentDocument.css";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import EmailIcon from "@mui/icons-material/Email";
import AppConfig from "../../AppConfig";
import { color } from "@mui/system";
import { useNavigate, useSearchParams } from "react-router-dom";

const CookiePolicy = React.lazy(() => import("../../Components/modals/CookiePolicy"));
const PrivacyPolicy = React.lazy(() => import("../../Components/modals/PrivacyPolicy"));
const TermsOfUse = React.lazy(() => import("../../Components/modals/TermsOfUse"));
const InformedConsent = React.lazy(() => import("../../Components/modals/InformedConsent"));

const SignUpPage = props => {
  const navigateTo = useNavigate();
  const [params] = useSearchParams();
  const firebase = useRecoilValue(firebaseState);
  const [email, setEmail] = useRecoilState(emailState);
  const [emailVerified, setEmailVerified] = useRecoilState(emailVerifiedState);
  const [leading, setLeading] = useRecoilState(leadingState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);
  const [project, setProject] = useRecoilState(projectState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [phase, setPhase] = useRecoilState(phaseState);
  const [step, setStep] = useRecoilState(stepState);
  const [passage, setPassage] = useRecoilState(passageState);
  const [condition, setCondition] = useRecoilState(conditionState);
  const [nullPassage, setNullPassage] = useRecoilState(nullPassageState);
  const [choices, setChoices] = useRecoilState(choicesState);
  const [institutions, setInstitutions] = useState([]);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [isSignUp, setIsSignUp] = useState(0);
  const [participatedBefore, setParticipatedBefore] = useState(false);
  const [invalidAuth, setInvalidAuth] = useState(false);
  const [databaseAccountNotCreatedYet, setDatabaseAccountNotCreatedYet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState(null);
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [validConfirmPassword, setValidConfirmPassword] = useState(false);
  const [validFirstname, setValidFirstname] = useState(false);
  const [validlastname, setValidlastname] = useState(false);
  const [signInSubmitable, setSignInSubmitable] = useState(false);
  const [signUpSubmitable, setSignUpSubmitable] = useState(false);
  const [submitable, setSubmitable] = useState(false);
  const [validPasswordResetEmail, setValidPasswordResetEmail] = useState(false);
  const [nameFromInstitutionSelected, setNameFromInstitutionSelected] = useState("");

  const [openInformedConsent, setOpenInformedConsent] = useState(false);
  const [openTermOfUse, setOpenTermsOfUse] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [openCookiePolicy, setOpenCookiePolicy] = useState(false);

  const [projectSpecs, setProjectSpecs] = useRecoilState(projectSpecsState);
  const haveProjectSpecs = Object.keys(projectSpecs).length > 0;

  useEffect(() => {
    const getCourses = async () => {
      const coursesDocs = await firebase.db.collection("courses").get();
      const tCourses = [];
      for (let courseDoc of coursesDocs.docs) {
        tCourses.push(courseDoc.id);
      }
      setCourses(tCourses);
    };
    getCourses();
  }, [firebase]);


  useEffect(() => {
    const getProjectSpecs = async () => {
      const pSpec = await firebase.db.collection("projectSpecs").doc(project).get();

      setProjectSpecs({ ...pSpec.data() });
    };

    if (firebase && project) {
      getProjectSpecs();
    }
    // update project settings
  }, [firebase, project]);
  const authChangedVerified = async user => {
    setEmailVerified("Verified");
    const uid = user.uid;
    const uEmail = user.email.toLowerCase();
    let userNotExists = false;
    let lName = lastname;
    let userData, userRef, fuName;

    let isSurvey = false;
    let userCollection = "users";
    let userDocs = await firebase.db.collection("users").where("email", "==", uEmail).get();

    if (userDocs.docs.length === 0) {
      userDocs = await firebase.db.collection("usersStudentCoNoteSurvey").where("email", "==", uEmail).get();
      if (userDocs.docs.length > 0) {
        isSurvey = true;
        userCollection = "usersStudentCoNoteSurvey";
      }
    }

    if (userDocs.docs.length > 0) {
      // Sign in and signed up:
      userRef = firebase.db.collection(userCollection).doc(userDocs.docs[0].id);
      userData = userDocs.docs[0].data();
      const fName = !userData.firstname ? firstname : userData.firstname;
      lName = !userData.lastname ? lastname : userData.lastname;
      if (!fName || !lName) {
        console.log({ fName, lName });
      }
      fuName = getFullname(fName, lName);
      if ("leading" in userData && userData.leading.length > 0) {
        setLeading(userData.leading);
      }
      const researcherDoc = await firebase.db.collection("researchers").doc(fuName).get();
      if (!researcherDoc.exists) {
        if (!("phase" in userData) || !("currentPCon" in userData)) {
          userNotExists = true;
          userData = {
            uid,
            email: uEmail,
            firstname: fName,
            lastname: lName,
            project: userData.project
          };
          if (course) {
            userData.course = course;
          }
          // because if the user signed up for the survey.
          // the user document will not have these fields
          // so there is no benefit of running this block
        } else if (!isSurvey) {
          setPhase(userData.phase);
          setStep(userData.step);
          setPassage(userData.currentPCon.passage);
          setCondition(userData.currentPCon.condition);
          setNullPassage(userData.nullPassage);
          setChoices(userData.choices);
        }
      }
      if (!userNotExists && !userData.uid) {
        const userDataLog = {
          uid,
          project: currentProject,
          course
        };
        if (userData.firstname && userData.lastname) {
          await userRef.update(userDataLog);
        } else if (firstname && lastname) {
          userDataLog.firstname = firstname;
          userDataLog.lastname = lastname;
          await userRef.update(userDataLog);
        } else {
          console.log({ firstname, lastname });
        }
        const userLogRef = firebase.db.collection("userLogs").doc();
        await userLogRef.set({
          ...userDataLog,
          id: userRef.id,
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      }
      // when user is not a researcher update the project so that
      // it loads the projectSpecs of the project that is assigned to a user.
      if (userData && !researcherDoc.exists) {
        const proj = userData.project || AppConfig.defaultProject;
        setCurrentProject(proj);
        setProject(proj);
      }
    } else {
      userNotExists = true;
      // Only signed up:
      if (isSignUp === 1) {
        fuName = getFullname(firstname, lName);
        let userD = await firebase.db.collection("users").doc(fuName).get();
        while (userD.exists) {
          lName = " " + lName;
          fuName = getFullname(firstname, lName);
          userD = await firebase.db.collection("users").doc(fuName).get();
        }
        userRef = firebase.db.collection("users").doc(fuName);
        userData = {
          uid,
          email: uEmail,
          firstname,
          lastname: lName,
          institution: nameFromInstitutionSelected.name ? nameFromInstitutionSelected.name : "",
          project: currentProject
        };
        if (course) {
          userData.course = course;
        }
      }
    }
    if (userNotExists && !isSurvey) {
      const conditions = shuffleArray([...projectSpecs.conditions]); // ['H2', 'K2']
      // [{condition: "K2", passage: "xuNQUYbAEFfTD1PHuLGV"}, {condition: "H2", passage: "s1oo3G4n3jeE8fJQRs3g"}]
      // const minPassageNums = [10000, 10000]; // [166, 166]
      const passagesResult = await firebase.db.collection("passages").get();

      // passages that contains the current project
      let passagesDocs = passagesResult.docs.filter(p => currentProject in p.data()?.projects);

      const minPConditions = [];
      const assigned = {};

      conditions.forEach(con => {
        // sort the passages in ascending order according to the current pcondition
        const sortedPassages = [...passagesDocs].sort((a, b) => {
          return (a.data().projects?.[currentProject]?.[con] || 0) - (b.data().projects?.[currentProject]?.[con] || 0);
        });
        for (let p of sortedPassages) {
          if (!assigned[p.id]) {
            minPConditions.push({ condition: con, passage: p.id });
            assigned[p.id] = true;
            break;
          }
        }
      });

      // setting up a null passage that is not in minPConditions.
      let nullPassage = "";
      let passIdx = Math.floor(Math.random() * passagesDocs.length);
      while (
        minPConditions.some(
          // eslint-disable-next-line no-loop-func
          pCon => pCon.passage === passagesDocs[passIdx].id
        )
      ) {
        passIdx = Math.floor(Math.random() * passagesDocs.length);
      }
      nullPassage = passagesDocs[passIdx]?.id || "";
      let questions;
      for (let { condition, passage } of minPConditions) {
        // eslint-disable-next-line no-loop-func
        await firebase.db.runTransaction(async t => {
          const conditionRef = firebase.db.collection("conditions").doc(condition);
          const conditionDoc = await t.get(conditionRef);
          const passageRef = firebase.db.collection("passages").doc(passage);
          const passageDoc = await t.get(passageRef);
          const passageData = passageDoc.data();

          if (conditionDoc.exists) {
            const conditionData = conditionDoc.data();
            t.update(conditionRef, {
              [currentProject]: (conditionData[currentProject] || 0) + 1
            });
          } else {
            t.set(conditionRef, { [currentProject]: 1 });
          }

          if (!questions) {
            questions = passageData.questions;
          }
          // let passageCondNum = 0;
          // if (passageData.projects[currentProject] && passageData.projects[currentProject][condition]) {
          //   passageCondNum = passageData.projects[currentProject][condition];
          // }
          // t.update(passageRef, {
          //   projects: {
          //     ...passageData.projects,
          //     [currentProject]: {
          //       ...passageData.projects[currentProject],
          //       [condition]: passageCondNum + 1
          //     }
          //   }
          // });
        });
      }
      const initChoices = new Array(10).fill("");
      userData = {
        ...userData,
        phase: 0,
        step: 1,
        pConditions: minPConditions,
        currentPCon: minPConditions[0] || "",
        nullPassage,
        choices: initChoices,
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      };
      setPassage(minPConditions[0]?.passage);
      setCondition(minPConditions[0]?.condition);
      setNullPassage(nullPassage);
      setPhase(0);
      setStep(1);
      await firebase.batchSet(userRef, userData, { merge: true });
      const userLogRef = firebase.db.collection("userLogs").doc();
      await firebase.batchSet(userLogRef, {
        ...userData,
        id: userRef.id
      });
      console.log("Committing batch!");
      await firebase.commitBatch();
    }
    setLastname(lName);
    setFullname(fuName);
    setEmail(uEmail.toLowerCase());
  };

  useEffect(() => {
    return firebase.auth.onAuthStateChanged(async user => {
      if (user && haveProjectSpecs) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        if (!user.emailVerified) {
          setEmailVerified("Sent");
          await user.sendEmailVerification();
          const emailVerificationInterval = setInterval(() => {
            console.log({
              emailVerified: firebase.auth.currentUser.emailVerified
            });
            firebase.auth.currentUser.reload();
            if (firebase.auth.currentUser.emailVerified) {
              authChangedVerified(user);
              clearInterval(emailVerificationInterval);
            }
          }, 1000);
        } else {
          authChangedVerified(user);
        }
      } else {
        // User is signed out
        console.log("Signing out!");
        setEmailVerified("NotSent");
        setFullname("");
        setPhase(0);
        setStep(0);
        setPassage("");
        setCondition("");
        setNullPassage("");
        setChoices([]);
      }
    });
  }, [firebase, firstname, lastname, currentProject, isSignUp, course, haveProjectSpecs]);

  useEffect(() => {
    setValidEmail(isEmail(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(password.length >= 7);
  }, [password]);

  useEffect(() => {
    setValidConfirmPassword(confirmPassword === password);
  }, [password, confirmPassword]);

  useEffect(() => {
    setValidFirstname(firstname.length > 1 && firstname.slice(-1) !== " ");
  }, [firstname]);

  useEffect(() => {
    setValidlastname(lastname.length > 1 && lastname.slice(-1) !== " ");
  }, [lastname]);

  useEffect(() => {
    setSignInSubmitable(validEmail && validPassword);
  }, [validEmail, validPassword]);

  useEffect(() => {
    setSignInSubmitable(validEmail && validPassword);
  }, [validEmail, validPassword]);

  useEffect(() => {
    setSignUpSubmitable(signInSubmitable && validFirstname && validlastname && validConfirmPassword);
  }, [signInSubmitable, validFirstname, validlastname, validConfirmPassword]);

  useEffect(() => {
    setSubmitable((isSignUp === 0 && signInSubmitable) || (isSignUp === 1 && signUpSubmitable && haveProjectSpecs));
  }, [isSignUp, signInSubmitable, signUpSubmitable, projectSpecs]);

  useEffect(() => {
    setValidPasswordResetEmail(isEmail(resetPasswordEmail));
  }, [resetPasswordEmail]);

  useEffect(() => {
    const getInstitutions = async () => {
      const institutionsRequest = await axios.get("/getInstitutions");
      setInstitutions(institutionsRequest.data);
    };
    getInstitutions();
  }, []);

  useEffect(() => {
    const getNameFromInstitutionSelected = async () => {
      if (email !== "") {
        const data = await axios.post("/checkEmailInstitution", { email });
        if (data?.data.institution) {
          setNameFromInstitutionSelected(data.data.institution);
        }
      }
    };
    getNameFromInstitutionSelected();
  }, [email]);
  const switchAccount = event => {
    event.preventDefault();
    setIsSubmitting(false);
    if (isSignUp === 1) {
      firebase.auth.delete();
    }
    firebase.logout();
  };

  const resendVerificationEmail = event => {
    firebase.auth.currentUser.sendEmailVerification();
  };

  const firstnameChange = event => {
    let fName = event.target.value;
    fName = fName.replace(/[0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;\.:[\]]/gi, "");
    setFirstname(fName);
  };

  const lastnameChange = event => {
    let lName = event.target.value;
    lName = lName.replace(/[0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;\.:[\]]/gi, "");
    setLastname(lName);
  };

  const emailChange = event => {
    setEmail(event.target.value.toLowerCase());
  };

  const passwordChange = event => {
    setPassword(event.target.value);
  };

  const confirmPasswordChange = event => {
    setConfirmPassword(event.target.value);
  };

  const courseChange = event => {
    setCourse(event.target.value);
  };

  const switchSignUp = (event, newValue) => {
    setIsSignUp(newValue);
  };

  const openForgotPassword = event => {
    setForgotPassword(oldValue => !oldValue);
  };

  const signUp = async event => {
    setIsSubmitting(true);
    const loweredEmail = email.toLowerCase();
    try {
      await firebase.login(loweredEmail, password);
      const navigateToSchedulePage = params.get('navigateToSchedulePage');
      console.log({navigateToSchedulePage})
      if (navigateToSchedulePage) {
        navigateTo("/HomeExperiment/Auth");
      } else {
        navigateTo("/");
      }
    } catch (err) {
      console.log({ err });
      // err.message is "There is no user record corresponding to this identifier. The user may have been deleted."
      if (err.code !== "auth/user-not-found") {
        setInvalidAuth(err.message);
      } else {
        // setInvalidAuth(
        //   "There is no user record corresponding to this email address. Please create a new account!"
        // );
        setIsSignUp(1);
        if (signUpSubmitable) {
          const fname = getFullname(firstname, lastname);
          await firebase.register(loweredEmail, password, fname);
        }
      }
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        await firebase.resetPassword(resetPasswordEmail);
        setIsPasswordReset(true);
        setPasswordResetError(null);
      } catch (err) {
        console.error("Error sending email", err);
        setPasswordResetError(err.message);
        setIsPasswordReset(false);
      }
      setIsSubmitting(false);
    }
  };

  const onKeyPress = event => {
    if (event.key === "Enter" && submitable) {
      signUp(event);
    }
  };

  const Background = styled(Box)({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    zIndex: -2
  });
  console.log("projectSpecs",projectSpecs);
  return (
    <Box
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        m: "100px 100px 100px 600px",
        width: "1000px"
      }}
    >
      <Background
        sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundColor: "primary.light", // Average color of the background image.
          backgroundPosition: "center"
        }}
      />
      <Paper
        sx={{
          width: "1000px"
        }}
      >
        {emailVerified === "Sent" ? (
          <div style={{ height: "200px", marginTop: "20px" }}>
            <Box sx={{ m: "200px 20px 20px 100px" }}>
              <p>
                We just sent you a verification email. Please click the link in the email to verify and complete your
                sign-up.
              </p>
            </Box>
            <Box sx={{ m: "20px 200px 20px 250px" }}>
              <Button
                variant="contained"
                color="warning"
                onClick={resendVerificationEmail}
                style={{ marginRight: "19px" }}
              >
                <EmailIcon /> Resend Verification Email
              </Button>
              <Button variant="contained" color="error" onClick={switchAccount}>
                <SwitchAccountIcon /> Switch Account
              </Button>
            </Box>
          </div>
        ) : (
          <>
            <Alert severity="error">
              Please only use your Gmail address to create an account. You can also use your school email address, only
              if your school email is provided by Google.
            </Alert>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={isSignUp} onChange={switchSignUp} aria-label="basic tabs" variant="fullWidth">
                  <Tab label="Sign In" {...a11yProps(0)} />
                  <Tab label="Sign Up" {...a11yProps(1)} />
                </Tabs>
              </Box>
              <TabPanel value={isSignUp} index={0}>
                <Box sx={{ m: "20px 20px 0px 20px" }}>
                  <ValidatedInput
                    className="inputValidate"
                    label="Email address"
                    onChange={emailChange}
                    name="email"
                    value={email}
                    errorMessage={validEmail ? null : "Please enter your valid email address!"}
                    onKeyPress={onKeyPress}
                  />
                </Box>
                <Box sx={{ m: "0px 20px 0px 20px" }}>
                  <ValidatedInput
                    className="inputValidate"
                    onChange={passwordChange}
                    name="password"
                    type="password"
                    placeholder="Password"
                    label="Password"
                    errorMessage={
                      validPassword ? null : "Please enter your desired password with at least 7 characters!"
                    }
                    onKeyPress={onKeyPress}
                  />
                </Box>
              </TabPanel>
              <TabPanel value={isSignUp} index={1}>
                <Box sx={{ m: "0px 20px 0px 20px" }}>
                  <ValidatedInput
                    className="inputValidate"
                    label="Firstname"
                    onChange={firstnameChange}
                    name="firstname"
                    value={firstname}
                    errorMessage={validFirstname ? null : "Please enter your firstname!"}
                    onKeyPress={onKeyPress}
                  />
                </Box>
                <Box sx={{ m: "0px 20px 0px 20px" }}>
                  <ValidatedInput
                    className="inputValidate"
                    label="lastname"
                    onChange={lastnameChange}
                    name="lastname"
                    value={lastname}
                    errorMessage={validlastname ? null : "Please enter your lastname!"}
                    onKeyPress={onKeyPress}
                  />
                </Box>
                <Box sx={{ m: "0px 20px 0px 20px" }}>
                  <ValidatedInput
                    className="inputValidate"
                    label="Email address"
                    onChange={emailChange}
                    name="email"
                    value={email}
                    errorMessage={validEmail ? null : "Please enter your valid email address!"}
                    onKeyPress={onKeyPress}
                  />
                </Box>
                <Box sx={{ m: "0px 20px 0px 20px" }}>
                  <Autocomplete
                    className="inputValidate"
                    id="institution"
                    value={nameFromInstitutionSelected}
                    options={institutions}
                    onChange={(_, value) => setNameFromInstitutionSelected(value || null)}
                    renderInput={params => (
                      <TextField {...params} value={nameFromInstitutionSelected} label="Institution" />
                    )}
                    getOptionLabel={option => (option.name ? option.name : "")}
                    renderOption={(props, option) => (
                      <li key={option.id} {...props}>
                        {option.name}
                      </li>
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    fullWidth
                    sx={{ mb: "16px" }}
                  />
                </Box>
                <Box sx={{ m: "0px 20px 0px 20px" }}>
                  <ValidatedInput
                    className="inputValidate"
                    onChange={passwordChange}
                    name="password"
                    type="password"
                    placeholder="Password"
                    label="Password"
                    value={password}
                    errorMessage={
                      validPassword ? null : "Please enter your desired password with at least 7 characters!"
                    }
                    onKeyPress={onKeyPress}
                  />
                </Box>
                <Box sx={{ m: "0px 20px 0px 20px" }}>
                  <ValidatedInput
                    className="inputValidate"
                    onChange={confirmPasswordChange}
                    name="ConfirmPassword"
                    type="password"
                    placeholder="Re-enter Password"
                    label="Confirm Password"
                    value={confirmPassword}
                    errorMessage={
                      validConfirmPassword ? null : "Your password and the re-entered password should match!"
                    }
                    onKeyPress={onKeyPress}
                  />
                </Box>
                <Box sx={{ mb: "16px", m: "20px 20px 0px 20px" }}>
                  By clicking "Sign Up," you acknowledge that you agree to 1Cademy's{" "}
                  <Link
                    onClick={() => {
                      setOpenTermsOfUse(true);
                    }}
                    sx={{ cursor: "pointer", textDecoration: "none" }}
                  >
                    Terms of Use
                  </Link>
                  ,{" "}
                  <Link
                    onClick={() => {
                      setOpenPrivacyPolicy(true);
                    }}
                    sx={{ cursor: "pointer", textDecoration: "none" }}
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    onClick={() => {
                      setOpenCookiePolicy(true);
                    }}
                    sx={{ cursor: "pointer", textDecoration: "none" }}
                  >
                    Cookie Policy
                  </Link>
                  .
                </Box>
              </TabPanel>
              {databaseAccountNotCreatedYet && (
                <div className="Error">
                  Please sign up using the same email address, firstname, and lastname so that we link your existing
                  account with your authentication.
                </div>
              )}
              {invalidAuth && <div className="Error">{invalidAuth.replace("Firebase:", "")}</div>}

              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Button
                  className={submitable && !isSubmitting ? "Button" : "Button Disabled"}
                  onClick={signUp}
                  sx={{ width: "150px" }}
                  variant="contained"
                  color="secondary"
                  disabled={submitable && !isSubmitting ? null : true}
                >
                  {isSignUp === 0 ? "Sign In" : isSubmitting ? "Creating your account..." : " Sign Up"}
                </Button>
              </div>
              <Suspense fallback={<div></div>}>
                <>
                  <InformedConsent open={openInformedConsent} handleClose={() => setOpenInformedConsent(false)} />
                  <CookiePolicy open={openCookiePolicy} handleClose={() => setOpenCookiePolicy(false)} />
                  <PrivacyPolicy open={openPrivacyPolicy} handleClose={() => setOpenPrivacyPolicy(false)} />
                  <TermsOfUse open={openTermOfUse} handleClose={() => setOpenTermsOfUse(false)} />
                </>
              </Suspense>
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Button
                  onClick={openForgotPassword}
                  sx={{ m: "0px 10px 10px 10px" }}
                  variant="contained"
                  color="warning"
                >
                  Forgot Password?
                </Button>
              </div>
              {forgotPassword && (
                <>
                  <Box sx={{ m: "20px 20px 0px 20px" }}>
                    <p>Enter your account email below to receive a password reset link.</p>
                    <ValidatedInput
                      identification="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      label="Email"
                      onChange={event => setResetPasswordEmail(event.target.value)}
                      value={resetPasswordEmail}
                      errorMessage={passwordResetError}
                      // autocomplete="off"
                    />
                  </Box>
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    {isPasswordReset && <h4>Check your email to reset the password.</h4>}
                  </div>
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <Button
                      id="ForgotPasswordEmailButton"
                      onClick={handleResetPassword}
                      className={!isSubmitting && validPasswordResetEmail ? "Button" : "Button Disabled"}
                      disabled={isSubmitting || !validPasswordResetEmail}
                    >
                      Send Email
                    </Button>
                  </div>
                </>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SignUpPage;
