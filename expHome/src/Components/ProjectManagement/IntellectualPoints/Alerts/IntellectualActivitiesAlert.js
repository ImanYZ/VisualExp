import React from "react";
import Alert from "@mui/material/Alert";

export const IntellectualActivitiesAlert = () => (
  <Alert severity="error">
    <strong>
      Please DO NOT report the following activities; you'll automatically
      receive points for them:
    </strong>
    <ul>
      <li>
        <strong>Running experiment sessions:</strong> you receive 16
        points for every first session and 7 points for every second or
        third session you run.
      </li>
      <li>
        <strong>Evaluating others' activities:</strong> you receive one
        point for every 25 upvotes you cast on your colleagues activities
        in every single day.
      </li>
      <li>
        <strong>Adding instructors/administrators' contact info:</strong>{" "}
        you receive one point for every 25 instructors/administrators'
        contact information that you add in every single day.
      </li>
      <li>
        <strong>
          Verifying instructors/administrators' contact info:
        </strong>{" "}
        you receive one point for every 25 upvotes you cast in every
        single day, verifying the contact information of the
        instructors/administrators added by other researchers.
      </li>
      <li>
        <strong>Coding participants' feedback:</strong> you receive one
        point for every code you assign to any participant feedback, only
        if the same code is assigned to the feedback by 2 other
        researchers.
      </li>
      <li>
        <strong>Coding participants' free recall responses:</strong> you
        receive one point for every code you assign to any participant
        free recall response, only if the same code is assigned to the
        response by 2 other researchers.
      </li>
    </ul>
  </Alert>
);
