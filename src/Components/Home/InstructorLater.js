import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

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
    axios.post("/InstructorLater", {
      id: instructorId,
      reminder: newValue,
    });
    setReminder(newValue);
    setSnackbarMessage("You successfully updated your reminder date!");
  };

  return (
    <PagesNavbar thisPage="Interested, Later">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Thank You for Your Interest in Our Communities!
      </Typography>
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
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </PagesNavbar>
  );
};

export default InstructorLater;
