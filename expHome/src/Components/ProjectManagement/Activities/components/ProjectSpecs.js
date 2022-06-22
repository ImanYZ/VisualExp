import React from "react";
import favicon from "../../../../assets/favicon.png";

export const ProjectSpecs = ({ projectSpecs }) => (
  <>
    <h2>Inclusion and Order of Authors Criteria:</h2>
    <div>
      <strong>Inclusion:</strong> To be an author,{" "}
      <span className="GreenText">in green</span>, one needs to earn
      at least:
      <ul>
        {projectSpecs.onePoints && (
          <li>
            <strong>{projectSpecs.onePoints}</strong> 1Cademy points{" "}
            <img src={favicon} width="15.1" /> and{" "}
          </li>
        )}
        {projectSpecs.intellectualPoints && (
          <li>
            <strong>{projectSpecs.intellectualPoints}</strong> Intellectual points 🎓 and
          </li>
        )}
        {projectSpecs.expPoints && (
          <li>
            <strong>{projectSpecs.expPoints}</strong> Experiment points 👨‍🔬 and
          </li>
        )}
        {projectSpecs.instructorsPoints && (
          <li>
            <strong>{projectSpecs.instructorsPoints}</strong> Collecting instructor/administrator
            contact points 👨‍🏫 and
          </li>
        )}
        {projectSpecs.commentsPoints && (
          <li>
            <strong>{projectSpecs.commentsPoints}</strong> Coding participants' comments points 💬
            and
          </li>
        )}
        {projectSpecs.gradingPoints && (
          <li>
            <strong>{projectSpecs.gradingPoints}</strong> Coding participants' recall responses
            points 🧠
          </li>
        )}
      </ul>
      <strong>Order:</strong> The intern with higher total of all the
      above categories gets a higher position.
    </div>
  </>
);