import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import {
  firebaseState,
  emailState,
  fullnameState,
} from "../../store/AuthAtoms";

import SelectSessions from "./SelectSessions";

import { isEmail } from "../../utils/general";

import UMSI_Logo_Light from "../../assets/UMSI_Logo_Light.jpeg";

import "./SchedulePage.css";

let tomorrow = new Date();
tomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
tomorrow = new Date(
  tomorrow.getFullYear(),
  tomorrow.getMonth(),
  tomorrow.getDate()
);

const errorAlert = (data) => {
  if (("done" in data && !data.done) || ("events" in data && !data.events)) {
    console.log({ data });
    alert("Something went wrong! Please submit your availability again!");
  }
};

const sessionFormatter = (start, minutes) => {
  return (
    " session: " +
    start.toLocaleDateString(navigator.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    ", " +
    start.toLocaleTimeString(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) +
    " - " +
    new Date(start.getTime() + minutes * 60000).toLocaleTimeString(
      navigator.language,
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )
  );
};

const SchedulePage = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);
  const fullname = useRecoilValue(fullnameState);

  const [participatedBefore, setParticipatedBefore] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [firstSessions, setFirstSessions] = useState([]);
  const [secondSession, setSecondSession] = useState(null);
  const [thirdSession, setThirdSession] = useState(null);
  const [submitable, setSubmitable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .where("email", "==", email.toLowerCase())
        .get();
      const sch = [];
      for (let scheduleDoc of scheduleDocs.docs) {
        const scheduleData = scheduleDoc.data();
        const session = scheduleData.session.toDate();
        if (session > new Date()) {
          sch.push(session);
        }
      }
      if (sch.length > 0) {
        setSchedule(sch);
      }
    };
    if (isEmail(email)) {
      loadSchedule();
    }
  }, [email]);

  const confirmClickOpen = (event) => {
    setOpenConfirm(true);
  };

  const confirmClose = (value) => (event) => {
    if (value) {
      if (value === "Confirmed") {
        submitData();
      }
    }
    setOpenConfirm(false);
  };

  const submitData = async () => {
    setIsSubmitting(true);
    const userRef = firebase.db.collection("users").doc(fullname);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.projectDone) {
        setParticipatedBefore(true);
        return;
      }
      let responseObj = await axios.post("/allEvents", {});
      errorAlert(responseObj.data);
      const events = responseObj.data.events;
      for (let event of events) {
        if (
          event.attendees &&
          event.attendees.findIndex((attendee) => attendee.email === email) !==
            -1
        ) {
          setParticipatedBefore(true);
          console.log({
            projectDone: userData.projectDone,
            attendees: event.attendees,
          });
          return;
        }
      }
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .where("email", "==", email.toLowerCase())
        .get();
      for (let scheduleDoc of scheduleDocs.docs) {
        const scheduleData = scheduleDoc.data();
        if (scheduleData.id) {
          responseObj = await axios.post("/deleteEvent", {
            eventId: scheduleData.id,
          });
          errorAlert(responseObj.data);
        }
        const scheduleRef = firebase.db
          .collection("schedule")
          .doc(scheduleDoc.id);
        await firebase.batchDelete(scheduleRef);
      }
      responseObj = await axios.post("/schedule", {
        email: email.toLowerCase(),
        first: firstSessions[0],
        second: secondSession,
        third: thirdSession,
      });
      errorAlert(responseObj.data);

      for (let session of schedule) {
        const scheduleRef = firebase.db.collection("schedule").doc();
        const theSession = {
          email: email.toLowerCase(),
          session: firebase.firestore.Timestamp.fromDate(session),
        };
        if (session.getTime() === firstSessions[0].getTime()) {
          theSession.id = responseObj.data.events[0].data.id;
          theSession.order = "1st";
        } else if (session.getTime() === secondSession.getTime()) {
          theSession.id = responseObj.data.events[1].data.id;
          theSession.order = "2nd";
        } else if (session.getTime() === thirdSession.getTime()) {
          theSession.id = responseObj.data.events[2].data.id;
          theSession.order = "3rd";
        }
        await firebase.batchSet(scheduleRef, theSession);
      }
      await firebase.commitBatch();
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  return (
    <div id="SchedulePageContainer">
      {submitted ? (
        <div className="DateDescription">
          <p>
            Based on your specified availability, we'll match you with one of
            our UX researchers and will send you Google Calendar invites in the
            following days. After receiving the Calendar invites, please accept
            them as soon as possible. If any of the Calendar invites do not work
            for you, please contact Iman at oneweb@umich.edu
          </p>
          <p>
            For this purpose, please open the Google Calendar invitation email,
            scroll all the way down to find the options to respond to the
            Calendar invite, and click "Yes."
          </p>
          <p>
            Note that accepting/declining the invitation through Outlook does
            not work. You should only accept/reject the invitation through the
            Yes/No links at the bottom of the Google Calendar invitation email.
          </p>
        </div>
      ) : participatedBefore ? (
        <Alert severity="error">
          You've participated in this study before or have scheduled a session
          and cannot participate again or change the scheduled sessions! Please
          convey your questions or concerns to Iman Yeckehzaare at
          oneweb@umich.edu
        </Alert>
      ) : (
        <>
          {/* <div className="DateDescription">
              In the table below, please specify as many time slots as possible
              in your timezone.
            </div>
            <div className="DateDescription">
              Based on your availability, we will match you with one of our UX
              researchers and will schedule three sessions for you:
              <ul>
                <li>
                  1<sup>st</sup> session for an hour
                </li>
                <li>
                  2<sup>nd</sup> session, 3 days later, for 30 minutes
                </li>
                <li>
                  3<sup>rd</sup> session, 1 week later, for 30 minutes
                </li>
              </ul>
            </div> */}
          <Alert severity="warning">
            <ul id="WarningPoints">
              <li>
                Due to having a limited number of UX researchers in our team, we
                need you to specify as many time slots as possible in the table
                below. Please convey your questions or concerns to Iman
                YeckehZaare at oneweb@umich.edu
              </li>
              <li>
                Based on your availability, we will match you with one of our UX
                researchers and will schedule three sessions for you:
                <ul>
                  <li>
                    <strong>
                      1<sup>st</sup> session
                    </strong>{" "}
                    for an hour (two consecutive slots)
                  </li>
                  <li>
                    <strong>
                      2<sup>nd</sup> session
                    </strong>
                    , 3 days later, for 30 minutes (one slot)
                  </li>
                  <li>
                    <strong>
                      3<sup>rd</sup> session
                    </strong>
                    , 7 days later, for 30 minutes (one slot)
                  </li>
                </ul>
              </li>
              <li>
                Please specify your availability{" "}
                <strong>in your timezone</strong> to satisfy the above criteria.
                As soon as you meet them, the SCHEDULE button will be enabled
                and the time slots with ✅ will indicate your possible sessions.
                You should click the SCHEDULE button and get the confirmation
                message, otherwise, your available time slots will not be saved.
              </li>
            </ul>
          </Alert>
          {schedule.length > 0 && !submitable && (
            <Alert severity="error">
              <ul id="WarningPoints">
                <li>
                  You have not specified enough of your availability to satisfy
                  the above criteria.
                </li>
                <li>
                  If you don't have enough availability in the next two weeks,
                  please return to this page in the following days to specify
                  your available time slots.
                </li>
              </ul>
            </Alert>
          )}
          <div id="ScheduleSelectorContainer">
            <SelectSessions
              startDate={tomorrow}
              numDays={16}
              schedule={schedule}
              setSchedule={setSchedule}
              firstSessions={firstSessions}
              secondSession={secondSession}
              thirdSession={thirdSession}
              setFirstSessions={setFirstSessions}
              setSecondSession={setSecondSession}
              setThirdSession={setThirdSession}
              setSubmitable={setSubmitable}
            />
          </div>
          <div id="SignBtnContainer">
            <Button
              onClick={confirmClickOpen}
              className={
                submitable && !isSubmitting
                  ? "Button SubmitButton"
                  : "Button SubmitButton Disabled"
              }
              variant="contained"
              disabled={submitable && !isSubmitting ? null : true}
            >
              Schedule
            </Button>
          </div>
        </>
      )}
      <Dialog
        open={openConfirm}
        onClose={confirmClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Please Confirm!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div>
              Press "Confirm" if you'd like to schedule the following three
              sessions, or press "Cancel" to revise your sessions.
            </div>
            {firstSessions[0] && secondSession && thirdSession && (
              <ul>
                <li>
                  1<sup>st</sup>
                  {sessionFormatter(firstSessions[0], 60)}
                </li>
                <li>
                  2<sup>nd</sup>
                  {sessionFormatter(secondSession, 30)}
                </li>
                <li>
                  3<sup>rd</sup>
                  {sessionFormatter(thirdSession, 30)}
                </li>
              </ul>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmClose("Cancelled")}>Cancel</Button>
          <Button onClick={confirmClose("Confirmed")} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
