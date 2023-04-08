import React from "react";
import Alert from "@mui/material/Alert";
import { useRecoilValue } from "recoil";
import { projectSpecsState, projectState } from "../../../../store/ProjectAtoms";

export const IntellectualActivitiesAlert = () => {
  const project = useRecoilValue(projectState);
  const projectSpecs = useRecoilValue(projectSpecsState);

  const renderExperimentPointInfo = () => {
    if (!projectSpecs.numberOfSessions || !projectSpecs?.points?.expPoints) return null;

    const message =
      project === "Annotating"
        ? "you receive 10 points for every session you run."
        : "you receive 16 points for every first session and 7 points for every second or third session you run.";

    return (
      <li>
        <strong>Running experiment sessions:</strong> {message}
      </li>
    );
  };

  const renderAddInstructor = () => {
    const dayInstructorUpVotes = projectSpecs?.points?.dayInstructorUpVotes;
    const message = dayInstructorUpVotes
      ? "you earn/lose a tenth of a point (0.1) for every upvote/downvote other researchers cast on your submitted instructors' contact information."
      : "you earn one point on submitting 7 instructors' contact information in one day.";

    return (
      <li>
        <strong>Adding instructors' contact info:</strong> {message}
      </li>
    );
  };
  return (
    <Alert severity="error">
      <strong>Please DO NOT report the following activities; you'll automatically receive points for them:</strong>
      <ul>
        {renderExperimentPointInfo()}
        {projectSpecs?.points?.intellectualPoints ? (
          <>
            <li>
              <strong>Intellectual activities:</strong> you receive one point for every upvote other researchers cast on
              your reported intellectual activities.
            </li>
            <li>
              <strong>Evaluating others' intellectual activities:</strong> you receive one point for every 25 upvotes
              you cast on your colleagues activities in every single day.
            </li>
          </>
        ) : null}
        {projectSpecs?.points?.instructorsPoints ? (
          <>
            {renderAddInstructor()}
            <li>
              <strong>Verifying instructors' contact info:</strong> you receive one point for every 16 upvotes you cast
              in every single day, verifying the contact information of the instructors added by other researchers.
            </li>
          </>
        ) : null}
        {projectSpecs?.points?.administratorsPoints ? (
          <>
            <li>
              <strong>Adding administrators' contact info:</strong> you earn/lose a tenth of a point (0.1) for every
              upvote/downvote other researchers cast on your submitted administrators' contact information.
            </li>
            <li>
              <strong>Verifying administrators' contact info:</strong> you receive one point for every 16 upvotes you
              cast in every single day, verifying the contact information of the administrators added by other
              researchers.
            </li>
          </>
        ) : null}

        <li>
          <strong>Coding participants' feedback:</strong> you receive one point for every code you assign to any
          participant feedback, only if the same code is assigned to the feedback by 2 other researchers.
        </li>
        <li>
          <strong>Coding participants' free recall responses:</strong> you receive one point for every code you assign
          to any participant free recall response, only if the same code is assigned to the response by 2 other
          researchers.
        </li>
      </ul>
    </Alert>
  );
};
