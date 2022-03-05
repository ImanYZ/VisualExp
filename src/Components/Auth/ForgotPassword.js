import React, { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { Button } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";

import {
  firebaseState,
  openForgotPasswordState,
  isSubmittingState,
} from "../../../store/AuthAtoms";

import "./ForgotPassword.css";

const ValidatedInput = React.lazy(() => import("../../Editor/ValidatedInput/ValidatedInput"));

const ForgotPassword = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const setOpenForgotPassword = useSetRecoilState(openForgotPasswordState);
  const [isSubmitting, setIsSubmitting] = useRecoilState(isSubmittingState);

  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState(null);

  async function handleResetPassword() {
    setIsSubmitting(true);
    try {
      await firebase.resetPassword(resetPasswordEmail);
      setIsPasswordReset(true);
      setPasswordResetError(null);
    } catch (err) {
      console.error("Error sending email", err);
      setPasswordResetError(err.message);
      setIsPasswordReset(false);
      setOpenForgotPassword(false);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="passwordResetContainer">
      <Button
        variant="text"
        onClick={() => setOpenForgotPassword(false)}
        className="SignInUpButton close"
        //  waves-effect waves-light btn-large red"
      >
        <ArrowBack /> Back
        {/* <span className="SignInUpButtonText">Close</span> */}
      </Button>
      <div className="passwordResetContainerMain">
        <h1>Forgot Password</h1>
        <p className="white-text">
          Enter your account email below to receive a password reset link.
        </p>
        <ValidatedInput
          identification="email"
          name="email"
          type="email"
          placeholder="Email"
          label="Email"
          onChange={(event) => setResetPasswordEmail(event.target.value)}
          value={resetPasswordEmail}
          errorMessage={passwordResetError}
          // autocomplete="off"
        />
        <Button
          variant="contained"
          onClick={handleResetPassword}
          className={
            isSubmitting
              ? "disabled SignInUpButton reset"
              : //  waves-effect waves-light btn-large orange"
                "SignInUpButton reset"
            //  waves-effect waves-light btn-large orange"
          }
          disabled={isSubmitting}
        >
          {/* <i className="material-icons left">create</i> */}
          <span className="SignInUpButtonText">Reset</span>
          {isSubmitting && (
            <div
              className="preloader-wrapper active small right"
              style={{
                margin: "10px",
                marginLeft: "19px",
                marginRight: "-10px",
                postition: "relative",
              }}
            >
              <div className="spinner-layer spinner-yellow-only">
                <div className="circle-clipper left">
                  <div className="circle"></div>
                </div>
              </div>
            </div>
          )}
        </Button>

        {isPasswordReset && <h4 className="white-text">Check your email to reset the password.</h4>}
      </div>
    </div>
  );
};

export default ForgotPassword;
