import React from "react";
import Alert from "@mui/material/Alert";

export const ActivityInstructionsAlert = () => (
  <Alert className="VoteActivityAlert" severity="success">
    <ul>
      <li>
        <strong>30-minute slots:</strong> report your activities in only
        30-minute time slots.
      </li>
      <li>
        <strong>To enter an activity:</strong> input the activity info
        in the corresponding boxes below and click the "ADD ACTIVITY"
        button.
      </li>
      <li>
        <strong>To update an activity:</strong> click the corresponding
        row. All the activity info shows up in the boxes below. Modify
        them and then click the "UPDATE ACTIVITY" button. To switch to
        another activity to update, you can click the other row.
      </li>
      <li>
        <strong>To delete an activity:</strong> click the ❌ button in
        the corresponding row.
      </li>
      <li>
        <strong>To clear the input boxes:</strong> click the "CLEAR
        SELECTION" button to unselect the activity and clear the input
        boxes.
      </li>
    </ul>
  </Alert>
);
