import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import Paper from "@mui/material/Paper";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const InstructorYes = (props) => {
  const { condition, instructorId } = useParams();

  useEffect(() => {
    axios.post("/instructorYes", {
      id: instructorId,
    });
  }, []);

  return (
    <PagesNavbar thisPage="Inviting Students">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Thank You for Your Interest in Our Communities!
      </Typography>
      <Paper style={{ padding: "10px 19px 10px 19px" }}>
        <p>
          Please email the following message to your students whom you'd like to
          invite to apply to join 1Cademy {props.community} community.
        </p>
        <Paper style={{ padding: "10px 19px 10px 19px" }}>
          <p>Hello [Your class name goes here] students,</p>
          <p>
            You are invited to join and{" "}
            {condition === "contribute"
              ? "contribute to"
              : condition === "learn"
              ? "learn collaboratively at"
              : condition === "present"
              ? "present your research at"
              : ""}{" "}
            1Cademy {props.community} community. Several large communities of
            student researchers from different schools in the US are remotely
            collaborating through the 1Cademy platform at the University of
            Michigan, School of Information. You can find more information about
            these communities and the application process on{" "}
            <a href="https://1cademy.us/home">1Cademy homepage</a>.
          </p>
          <p>
            You can email your questions to{" "}
            <a
              href={
                "mailto:onecademy@umich.edu?subject=" +
                props.community +
                " Question for " +
                props.leader
              }
              target="_blank"
            >
              1Cademy {props.community} community leader
            </a>
            .
          </p>
          <p>
            [OPTIONAL: You can earn ____ points in this course by participating
            in these research communities.]
          </p>
          <p></p>
          <p>Good luck with your application,</p>
          <p>[Your signature goes here]</p>
        </Paper>
        <p></p>
        <p>
          Please reply to our original email if you have any questions or
          concerns.
        </p>
      </Paper>
    </PagesNavbar>
  );
};

export default InstructorYes;
