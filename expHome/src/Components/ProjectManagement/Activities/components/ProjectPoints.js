import React from "react";
import favicon from "../../../../assets/favicon.png";

export const ProjectPoints = ({ projectPoints, project }) => {
  return (
    <>
      <h2>Inclusion and Order of Authors Criteria:</h2>
      <div>
        <strong>Inclusion:</strong> To be an author, <span className="GreenText">in green</span>, one needs to earn at
        least:
        <ul>
          {projectPoints.onePoints && (
            <li>
              <strong>{projectPoints.onePoints}</strong> 1Cademy points <img src={favicon} width="15.1" /> and{" "}
            </li>
          )}
          {projectPoints.intellectualPoints && (
            <li>
              <strong>{projectPoints.intellectualPoints}</strong> Intellectual points 🎓 and
            </li>
          )}
          {project === "H1L2" && projectPoints.intellectualVotingPoints ? (
            <li>
              <strong>{projectPoints.intellectualVotingPoints}</strong> Intellectual voting points 🎓 ✅ and
            </li>
          ) : null}
          {projectPoints.expPoints && (
            <li>
              <strong>{projectPoints.expPoints}</strong> Experiment points 👨‍🔬 and
            </li>
          )}
          {projectPoints.instructorsPoints && (
            <li>
              <strong>{projectPoints.instructorsPoints}</strong> Collecting instructor/administrator contact points 👨‍🏫
              and
            </li>
          )}
          {projectPoints.commentsPoints && (
            <li>
              <strong>{projectPoints.commentsPoints}</strong> Coding participants' comments points 💬 and
            </li>
          )}
          {projectPoints.gradingPoints && (
            <li>
              <strong>{projectPoints.gradingPoints}</strong> Coding participants' recall responses points 🧠
            </li>
          )}
        </ul>
        <strong>Order:</strong> The intern with higher total of all the above categories gets a higher position.
      </div>
    </>
  );
};
