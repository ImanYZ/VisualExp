import React, { useState } from "react";
import { useRecoilValue } from "recoil";

import Button from "@mui/material/Button";
import TextField from "../components/TextField";

import { firebaseState } from "../../store/AuthAtoms";

const ForgotPassword = (props) => {
  const firebase = useRecoilValue(firebaseState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState(null);

  const handleResetPassword = async () => {
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
  };

  return (
    <div>
      <h1>Forgot Password?</h1>
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
        color={isSubmitting ? "white" : "success"}
        disabled={isSubmitting}
      >
        Send Email
      </Button>

      {isPasswordReset && (
        <h4 color="white">Check your email to reset the password.</h4>
      )}
    </div>
  );
};

export default ForgotPassword;
