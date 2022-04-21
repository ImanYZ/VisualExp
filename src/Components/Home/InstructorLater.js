import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";

import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";

import SnackbarComp from "../SnackbarComp";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

let nextWeek = new Date();
nextWeek = new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
nextWeek = new Date(
  nextWeek.getFullYear(),
  nextWeek.getMonth(),
  nextWeek.getDate()
);

const InstructorLater = (props) => {
  const [reminder, setReminder] = useState(nextWeek);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { instructorId } = useParams();

  useEffect(() => {
    axios.post("/InstructorLater", {
      id: instructorId,
    });
  }, []);

  const changeDate = async (newValue) => {
    await axios.post("/InstructorLater", {
      id: instructorId,
      reminder: newValue,
    });
    setReminder(newValue);
    setSnackbarMessage("You successfully updated your reminder date!");
  };

  const renderDate = (params) => <TextField {...params} />;

  return (
    <PagesNavbar thisPage="Interested, Later">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Thank You for Your Interest in Our Communities!
      </Typography>
      <Paper style={{ padding: "10px 19px 10px 19px", textAlign: "center" }}>
        <h3>Please choose your preferred date for the reminder email:</h3>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Reminder Date"
            value={reminder}
            onChange={changeDate}
            renderInput={renderDate}
          />
        </LocalizationProvider>
      </Paper>
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </PagesNavbar>
  );
};

export default InstructorLater;
