import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import TextareaAutosize from "@mui/material/TextareaAutosize";

import { firebaseState, fullnameState } from "../../store/AuthAtoms";

import SnackbarComp from "../SnackbarComp";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const Withdraw = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const withdrawUser = async () => {
      const userRef = firebase.db.collection("users").doc(fullname);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        await userRef.update({
          withdrew: true,
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
        });
      }
    };
    if (firebase && fullname) {
      withdrawUser();
    } else {
      setNotLoggedIn(true);
    }
  }, [firebase, fullname]);

  const explanationChange = (event) => {
    setExplanation(event.target.value);
  };

  const submitExplanation = async (event) => {
    const userRef = firebase.db.collection("users").doc(fullname);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({
        withdrew: true,
        withdrawExp: explanation,
        updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
      });
      setSnackbarMessage(
        "You withdrew your 1Cademy application and we will not send you any more reminders."
      );
    }
  };

  return (
    <PagesNavbar thisPage="Withdraw">
      {notLoggedIn ? (
        <Alert severity="error">
          <Typography variant="h3" gutterBottom marked="center" align="center">
            Please log in and try again!
          </Typography>
        </Alert>
      ) : (
        <div>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            You Withdrew Your 1Cademy Application!
          </Typography>
          <p>We will not send you any more reminders.</p>
          <p>Please explain below why you decided to withdraw:</p>
          <TextareaAutosize
            aria-label="Explanation Text Area"
            style={{ width: "100%" }}
            minRows={7}
            placeholder={"Explain why you decided to withdraw."}
            onChange={explanationChange}
            value={explanation}
          />
          <Button
            style={{ margin: "10px" }}
            onClick={submitExplanation}
            variant="contained"
            color="success"
          >
            Submit
          </Button>
          <p>
            If you'd like to continue your application at any point, you can
            email us at onecademy@umich.edu
          </p>
        </div>
      )}
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </PagesNavbar>
  );
};

export default Withdraw;
