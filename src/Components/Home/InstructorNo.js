import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const InstructorNo = (props) => {
  const { instructorId } = useParams();

  useEffect(() => {
    axios.post("/InstructorNo", {
      id: instructorId,
    });
  }, []);

  return (
    <PagesNavbar thisPage="Not Interested">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Thank You For Your Response!
      </Typography>
      <p>We will not contact you anymore.</p>
      <p></p>
      <p>
        Please reply to our original email if you have any questions or
        concerns.
      </p>
    </PagesNavbar>
  );
};

export default InstructorNo;
