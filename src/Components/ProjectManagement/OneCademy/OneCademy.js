import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { emailState } from "../../../store/AuthAtoms";

import {
  firebaseOnecademyState,
  usernameState,
} from "../../../store/OneCademyAtoms";

import ValidatedInput from "../../ValidatedInput/ValidatedInput";

import favicon from "../../../assets/favicon.png";

import "./OneCademy.css";

const OneCademy = (props) => {
  const firebase = useRecoilValue(firebaseOnecademyState);
  const [username, setUsername] = useRecoilState(usernameState);
  const [email, setEmail] = useRecoilValue(emailState);

  const [password, setPassword] = useState("");
  const [invalidAuth, setInvalidAuth] = useState(false);

  useEffect(() => {
    if (email === "tirdad.barghi@gmail.com") {
      setEmail("tirdad_barghi@umich.edu");
    }
  }, [email]);

  const passwordChange = (event) => {
    setPassword(event.target.value);
  };

  const signIn = async (event) => {
    try {
      const loweredEmail = email.toLowerCase();
      await firebase.login(loweredEmail, password);
    } catch (err) {
      console.log({ err });
      setInvalidAuth(err.message);
    }
  };

  const signOut = async (event) => {
    try {
      await firebase.logout();
    } catch (err) {
      console.log({ err });
      setInvalidAuth(err.message);
    }
  };

  const onKeyPress = (event) => {
    if (event.key === "Enter" && validPassword) {
      signIn(event);
    }
  };

  const validPassword = password.length >= 7;

  return (
    <div id="OneCademy">
      {username ? (
        <div id="SignButtonContainer">
          <Button onClick={signOut} className="Button Red" variant="contained">
            Sign Out from 1Cademy
          </Button>
        </div>
      ) : (
        <>
          <h2>Sign in to 1Cademy to see your points!</h2>
          {/* <span id="EmailAddress">{email}</span> */}
          <ValidatedInput
            className="PleaseSpecify"
            onChange={passwordChange}
            name="password"
            type="password"
            placeholder={"Your Password for " + email}
            label={"Your Password for " + email}
            errorMessage={
              validPassword
                ? null
                : "Please enter your password with at least 7 characters!"
            }
            onKeyPress={onKeyPress}
          />
          {invalidAuth && <div className="Error">{invalidAuth}</div>}
          <div id="SignButtonContainer">
            <Button
              id="SignButton"
              onClick={signIn}
              className={validPassword ? "Button" : "Button Disabled"}
              variant="contained"
              disabled={validPassword ? null : true}
            >
              Sign In to 1Cademy
            </Button>
          </div>
        </>
      )}
      <Alert severity="error">
        <h2>Set 1Cademy Tag to "Knowledge Visualization":</h2>
        <p>
          Before proposing any new nodes or improvements on 1Cademy, you should
          do one of the followings, otherwise, you'll not earn any points for
          the proposal:
        </p>
        <ul>
          <li>
            You should set your community membership (default tag) on 1Cademy to{" "}
            <strong>Knowledge Visualization</strong> to earn points.
          </li>
          <li>
            Alternatively, you can add the tag{" "}
            <strong>Knowledge Visualization</strong> to every node you propose
            related to this project.
          </li>
        </ul>
      </Alert>
      <Alert severity="success">
        <h2>1Cademy Points:</h2>
        <ul>
          <li>
            <strong>
              Your contribution ( <img src={favicon} width="15.1" /> ):
            </strong>{" "}
            every upvote minus downvote you receive from others on your 1Cademy
            proposals, e.g., about papers you summarize and present in our
            weekly meetings, gives you one point.
          </li>
          <li>
            <strong>Evaluating others' contribution ( ✅ ):</strong> you receive
            one point for every 25 upvotes you cast on your colleagues proposals
            in every single day.
          </li>
          <li>
            <strong>No partial or extra points:</strong> if on a single day you
            cast more than 25 upvotes on others' proposals, you'll not receive
            any extra points. If you cast fewer than 25 upvotes, you'll not
            receive any partial points, either.
          </li>
        </ul>
      </Alert>
      <p>...</p>
    </div>
  );
};

export default OneCademy;
