import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";
import EmailSignature from "./EmailSignature";

const InviteStudents = props => {
  const { collection, instructorId } = useParams();

  useEffect(() => {
    axios.post("/trackStudentInvite", {
      id: instructorId,
      collection
    });
  }, []);

  const trackCopyEvent = async () => {
    try {
      axios.post("/trackStudentEmailTemplateCopy", {
        id: instructorId,
        collection
      });
    } catch (err) {
      //
    }
  };

  const onStudentsEmailContentCopy = event => {
    trackCopyEvent();
    window.getSelection().removeAllRanges();

    const range = document.createRange();
    const htmlDOMObj = document.getElementById("StudentsEmailContent");
    range.selectNode(htmlDOMObj);
    window.getSelection().addRange(range);

    // [5.1]
    document.execCommand("copy");
  };

  return (
    <PagesNavbar thisPage="Inviting Students">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Thank You for Your Interest in Our Research Communities!
      </Typography>
      <Paper style={{ padding: "10px 19px 10px 19px" }}>
        <p>
          Please email the following message to your students whom you'd like to invite to apply 1Cademy research
          communities.
        </p>
        <Paper style={{ padding: "10px 19px 10px 19px" }}>
          <strong>Suggested Subject Line</strong>: 1Cademy Large-scale Collaborative Research Internship Opportunities
        </Paper>
        <Button
          onClick={onStudentsEmailContentCopy}
          color="success"
          variant="contained"
          sx={{ m: "19px 0px 19px 0px" }}
        >
          Copy the email content!
        </Button>
        <Paper id="StudentsEmailContent" style={{ padding: "10px 19px 10px 19px" }}>
          <p>Dear research enthusiasts,</p>
          <p>
            We are a research group at the University of Michigan, School of Information. We would like to invite you to
            join our online research communities and collaborate with us on research literature review on your desired
            topics.
          </p>
          <p>
            We have developed an online platform for collaborative learning and research, called 1Cademy (more
            information on{" "}
            <a href="https://1cademy.us/home" target="_blank">
              this page
            </a>
            ). Since Fall 2020, out of more than 10,000 students who applied, 1,490 talented students from 144 schools
            have joined 1Cademy to collaboratively summarize, visualize, and present books and research papers on a
            weekly basis and get constructive feedback about their research. You can check out{" "}
            <a href="https://1cademy.us/home#CommunitiesSection" target="_blank">
              our existing research communities
            </a>{" "}
            and search through{" "}
            <a href="https://node.1cademy.us" target="_blank">
              the 1Cademy Knowledge Graph
            </a>{" "}
            to learn more about the topics we've studied so far. We also have community leadership opportunities for
            qualified students to lead our existing communities or establish new research communities.
          </p>
          <p>
            You can learn more about our platform, research communities, and the application process on{" "}
            <a href="https://1cademy.us/home" target="_blank">
              the 1Cademy homepage
            </a>
            .
          </p>
          <p>Best regards,</p>
          {EmailSignature}
        </Paper>
      </Paper>
    </PagesNavbar>
  );
};

export default InviteStudents;
