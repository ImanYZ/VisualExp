import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import SnackbarComp from "../SnackbarComp";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";
import Button from "./modules/components/Button";

let nextWeek = new Date();
nextWeek = new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
nextWeek = new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate());

const InstructorLater = props => {
  const [reminder, setReminder] = useState(nextWeek);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { instructorId } = useParams();

  useEffect(() => {
    axios.post("/InstructorLater", {
      id: instructorId
    });
  }, []);

  const changeDate = async newValue => {
    setReminder(newValue);
  };

  const renderDate = params => <TextField {...params} />;

  const saveLater = async () => {
    try {
      await axios.post("/InstructorLater", {
        id: instructorId,
        reminder
      });
      setSnackbarMessage("You successfully updated your reminder date!");
    } catch (error) {
      setSnackbarMessage("There was an error updating your reminder date!");
    }
  };
  return (
    <PagesNavbar thisPage="Interested, Later">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Thank You for Your Interest in Collaborating With 1Cademy!
      </Typography>
      <Paper style={{ padding: "10px 19px 10px 19px", textAlign: "center" }}>
        <h3>Please choose your preferred date for the reminder email:</h3>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker label="Reminder Date" value={reminder} onChange={changeDate} renderInput={renderDate} />
        </LocalizationProvider>
        <Button onClick={saveLater}>Submit</Button>
      </Paper>
      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </PagesNavbar>
  );
};

export default InstructorLater;
