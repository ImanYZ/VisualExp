import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import axios from "axios";
import { firebaseState, emailState, emailVerifiedState, fullnameState, leadingState } from "../../store/AuthAtoms";

import { projectSpecsState, projectState } from "../../store/ProjectAtoms";

import { TabPanel, a11yProps } from "../TabPanel/TabPanel";
import ValidatedInput from "../ValidatedInput/ValidatedInput";

import { isEmail } from "../../utils";

import "./ConsentDocument.css";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import AppConfig from "../../AppConfig";

const AuthStudentCoNoteSurvey = props => {
  const firebase = useRecoilValue(firebaseState);
  const [email, setEmail] = useRecoilState(emailState);
  const [emailVerified, setEmailVerified] = useRecoilState(emailVerifiedState);
  const [project, setProject] = useRecoilState(projectState);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
  const projectSpecs = useRecoilValue(projectSpecsState);
  const haveProjectSpecs = Object.keys(projectSpecs).length > 0;
  const navigate = useNavigate();

  useEffect(() => {
    setParticipatedBefore(false);
    setInvalidAuth(false);
    setDatabaseAccountNotCreatedYet(false);
  }, [firstname, lastname, email]);

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

  const switchSignUp = (event, newValue) => {
    setIsSignUp(newValue);
  };

  const openForgotPassword = event => {
    setForgotPassword(oldValue => !oldValue);
  };

  const signUp = async () => {
    setIsSubmitting(true);
    const loweredEmail = email.toLowerCase();
    try {
      await firebase.login(loweredEmail, password);
      navigate("/");
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
          await axios.post("/signUp", {
            email,
            password,
            firstName: firstname,
            lastName: lastname,
            institutionName: "",
            projectName: project,
            surveyType: "student"
          })
          await firebase.login(loweredEmail, password);
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

  return (
    <div id="Auth">
      {/* <img
        src={UMSI_Logo_Light}
        alt="University of Michigan, School of Information Logo"
        width="100%"
      /> */}
      {emailVerified === "Sent" ? (
        <div>
          <p>
            We just sent you a verification email. Please click the link in the email to verify and complete your
            sign-up.
          </p>
          <Button variant="contained" color="warning" onClick={resendVerificationEmail} style={{ marginRight: "19px" }}>
            <EmailIcon /> Resend Verification Email
          </Button>
          <Button variant="contained" color="error" onClick={switchAccount}>
            <SwitchAccountIcon /> Switch Account
          </Button>
        </div>
      ) : (
        <>
          <h2>Sign the Consent Form to Get Started!</h2>
          <p>
            Please read the consent form on the left carefully. By creating and account or signing into this website,
            you sign the consent form and allow us to analyze your data collected throughout this study.
          </p>
          <Alert severity="error">
            Please only use your Gmail address to create an account. You can also use your school email address, only if
            your school email is provided by Google.
          </Alert>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={isSignUp} onChange={switchSignUp} aria-label="basic tabs" variant="fullWidth">
                <Tab label="Sign In" {...a11yProps(0)} />
                <Tab label="Sign Up" {...a11yProps(1)} />
              </Tabs>
            </Box>
            <TabPanel value={isSignUp} index={0}>
              <ValidatedInput
                className="PleaseSpecify"
                label="Email address"
                onChange={emailChange}
                name="email"
                value={email}
                errorMessage={validEmail ? null : "Please enter your valid email address!"}
                onKeyPress={onKeyPress}
              />
              <ValidatedInput
                className="PleaseSpecify"
                onChange={passwordChange}
                name="password"
                type="password"
                placeholder="Password"
                label="Password"
                errorMessage={validPassword ? null : "Please enter your desired password with at least 7 characters!"}
                onKeyPress={onKeyPress}
              />
            </TabPanel>
            <TabPanel value={isSignUp} index={1}>
              <ValidatedInput
                className="PleaseSpecify"
                label="Firstname"
                onChange={firstnameChange}
                name="firstname"
                value={firstname}
                errorMessage={validFirstname ? null : "Please enter your firstname!"}
                onKeyPress={onKeyPress}
              />
              <ValidatedInput
                className="PleaseSpecify"
                label="lastname"
                onChange={lastnameChange}
                name="lastname"
                value={lastname}
                errorMessage={validlastname ? null : "Please enter your lastname!"}
                onKeyPress={onKeyPress}
              />
              <ValidatedInput
                className="PleaseSpecify"
                label="Email address"
                onChange={emailChange}
                name="email"
                value={email}
                errorMessage={validEmail ? null : "Please enter your valid email address!"}
                onKeyPress={onKeyPress}
              />
              <ValidatedInput
                className="PleaseSpecify"
                onChange={passwordChange}
                name="password"
                type="password"
                placeholder="Password"
                label="Password"
                value={password}
                errorMessage={validPassword ? null : "Please enter your desired password with at least 7 characters!"}
                onKeyPress={onKeyPress}
              />
              <ValidatedInput
                className="PleaseSpecify"
                onChange={confirmPasswordChange}
                name="ConfirmPassword"
                type="password"
                placeholder="Re-enter Password"
                label="Confirm Password"
                value={confirmPassword}
                errorMessage={validConfirmPassword ? null : "Your password and the re-entered password should match!"}
                onKeyPress={onKeyPress}
              />
              {/* <p>If participating for course credit, specify the course:</p>
          <FormControl fullWidth>
            <InputLabel id="CourseSelectLabel">Select course:</InputLabel>
            <Select
              labelId="CourseSelectLabel"
              id="CourseSelect"
              value={course}
              label="Course"
              onChange={courseChange}
            >
              {courses.map((cour) => {
                return (
                  <MenuItem key={cour} value={cour}>
                    {cour}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl> */}
            </TabPanel>
            {databaseAccountNotCreatedYet && (
              <div className="Error">
                Please sign up using the same email address, firstname, and lastname so that we link your existing
                account with your authentication.
              </div>
            )}
            {invalidAuth && <div className="Error">{invalidAuth}</div>}
            {participatedBefore && (
              <div className="Error">You've participated in this study before and cannot participate again!</div>
            )}
            <div id="SignButtonContainer">
              <Button
                id="SignButton"
                onClick={signUp}
                className={submitable && !isSubmitting ? "Button" : "Button Disabled"}
                variant="contained"
                disabled={submitable && !isSubmitting ? null : true}
              >
                {isSignUp === 0 ? "Sign In" : isSubmitting ? "Creating your account..." : "Consent and Sign Up"}
              </Button>
            </div>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <Button onClick={openForgotPassword} variant="contained" color="warning">
                Forgot Password?
              </Button>
            </div>
            {forgotPassword && (
              <>
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
                <Button
                  id="ForgotPasswordEmailButton"
                  variant="contained"
                  onClick={handleResetPassword}
                  className={!isSubmitting && validPasswordResetEmail ? "Button" : "Button Disabled"}
                  disabled={isSubmitting || !validPasswordResetEmail}
                >
                  Send Email
                </Button>

                {isPasswordReset && <h4>Check your email to reset the password.</h4>}
              </>
            )}
          </Box>
        </>
      )}
    </div>
  );
};

export default AuthStudentCoNoteSurvey;
