import React from "react";
import Alert from "@mui/material/Alert";

export const ActivityInfoAlert = () => (
  <Alert className="VoteActivityAlert" severity="success">
    <ul>
      <li>
        <strong>30-minute slots:</strong> every reported activity has
        taken 30 minutes. Please evaluate them accordingly.
      </li>
      <li>
        <strong>
          You earn points for evaluating others' activities:
        </strong>{" "}
        you receive one point for every 25 upvotes you cast on your
        colleagues' activities in every single day.
      </li>
      <li>
        <strong>No partial or extra points:</strong> if on a single day
        you cast more than 25 upvotes, you'll not receive any extra
        points. If you cast fewer than 25 upvotes, you'll not receive any
        partial points, either.
      </li>
      <li>
        <strong>Activity description:</strong> to read the long
        descriptions, you can hover or tap on the description.
      </li>
      <li>
        <strong>Total upvotes:</strong> the total number of upvotes for
        each activity, including your upvote if any, is shown in the third
        column. You can sort and filter every column by clicking the
        column titles.
      </li>
      <li>
        <strong>Upvote ( 👍 ):</strong> you can upvote each activity by
        clicking the fourth column in the corresponding row. You can also
        sort activities by clicking the title of this column to see which
        activities you have or have not upvoted so far.
      </li>
      <li>
        <strong>Skip vote ( ✘ ):</strong> if you prefer not to vote on any
        reported activity, please skip it by clicking the fifth column of
        the corresponding row. This will help you not to waste any time on
        activities that you've already evaluated and decided not to vote
        for.
      </li>
    </ul>
  </Alert>
);
