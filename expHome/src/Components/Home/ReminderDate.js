import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";

import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";

import { firebaseState, fullnameState } from "../../store/AuthAtoms";

import SnackbarComp from "../SnackbarComp";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const ReminderDate = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [reminder, setReminder] = useState(null);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const loadUserReminder = async () => {
      const userRef = firebase.db.collection("users").doc(fullname);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if ("reminder" in userData && userData.reminder) {
          setReminder(userData.reminder.toDate());
        }
      } else {
        setNotLoggedIn(true);
      }
    };
    if (firebase && fullname) {
      loadUserReminder();
    } else {
      setNotLoggedIn(true);
    }
  }, [firebase, fullname]);

  const changeDate = async (newValue) => {
    const userRef = firebase.db.collection("users").doc(fullname);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({
        reminder: firebase.firestore.Timestamp.fromDate(newValue),
        updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
      });
      setReminder(newValue);
      setSnackbarMessage("You successfully updated your reminder date!");
    } else {
      setNotLoggedIn(true);
    }
  };

  const renderDate = (params) => <TextField {...params} />;

  return (
    <PagesNavbar thisPage="Reminder">
      {notLoggedIn ? (
        <Alert severity="error">
          <Typography variant="h3" gutterBottom marked="center" align="center">
            Please log in and try again!
          </Typography>
        </Alert>
      ) : (
        <div style={{ textAlign: "center" }}>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            Choose your preferred date for the reminder email:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Reminder Date"
              value={reminder}
              onChange={changeDate}
              renderInput={renderDate}
            />
          </LocalizationProvider>
        </div>
      )}
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </PagesNavbar>
  );
};

export default ReminderDate;
