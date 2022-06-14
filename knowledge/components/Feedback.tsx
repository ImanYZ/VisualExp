import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { alpha, Box, Button, FormControl, InputBase, InputLabel, styled, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { sendFeedback } from "../lib/knowledgeApi";
import { FeedbackInput } from "../src/knowledgeTypes";

interface FeedbackProps {
  onSuccessFeedback: () => void;
}

export const Feedback = ({ onSuccessFeedback }: FeedbackProps) => {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [successFeedback, setSuccessFeedback] = useState(false);

  useEffect(() => {
    const URL = window.location.href;
    setUrl(URL);
  }, [router]);

  const onChangeEmail = (event: any) => {
    setEmail(event.target.value);
  };

  const onChangeName = (event: any) => {
    setName(event.target.value);
  };

  const onChangeFeedback = (event: any) => {
    setFeedback(event.target.value);
  };

  const onSubmitFeedback = async (event: any) => {
    event.preventDefault();
    const feedbackData: FeedbackInput = {
      name,
      email,
      feedback,
      pageURL: url
    };

    await sendFeedback(feedbackData);
    setSuccessFeedback(true);
  };

  if (successFeedback) {
    return (
      <Box
        sx={{
          width: "400px",
          height: "450px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <Typography variant="h5" sx={{ color: theme => theme.palette.common.orange }}>
          Share Your Question/Feedback
        </Typography>
        <Box textAlign="center" sx={{ width: "240px", margin: "auto" }}>
          <CheckCircleOutlineIcon sx={{ color: theme => theme.palette.common.orange, fontSize: "80px" }} />
          <Typography
            variant="body1"
            component="p"
            textAlign="center"
            sx={{ color: theme => theme.palette.common.white }}
          >
            We have received your feedback. Thank you!
          </Typography>
        </Box>
        <Button onClick={onSuccessFeedback} color="success" variant="contained" fullWidth>
          Thank you
          <CheckIcon sx={{ ml: "10px" }} />
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{ width: "400px", height: "450px", display: "flex", flexDirection: "column", gap: "20px" }}
      component="form"
      onSubmit={onSubmitFeedback}
    >
      <Typography variant="h5" sx={{ color: theme => theme.palette.common.orange }}>
        Share Your Question/Feedback
      </Typography>
      <Typography component="p" sx={{ color: theme => theme.palette.common.white }}>
        Hi, thank you for using our website :)
        <br />
        We’d love to hear your feedback and comments on anything on this website!
      </Typography>
      <FormControl variant="standard">
        <InputLabel shrink htmlFor="email-input" sx={{ color: theme => theme.palette.common.white }}>
          Email
        </InputLabel>
        <BootstrapInput value={email} onChange={onChangeEmail} id="email-input" type={"email"} />
      </FormControl>
      <FormControl variant="standard">
        <InputLabel shrink htmlFor="name-input" sx={{ color: theme => theme.palette.common.white }}>
          Name
        </InputLabel>
        <BootstrapInput value={name} onChange={onChangeName} id="name-input" />
      </FormControl>
      <FormControl variant="standard">
        <InputLabel shrink htmlFor="feedback-input" sx={{ color: theme => theme.palette.common.white }}>
          Your Feedback
        </InputLabel>
        <BootstrapInput value={feedback} onChange={onChangeFeedback} id="feedback-input" />
      </FormControl>
      <Button type="submit" color="primary" variant="contained" fullWidth>
        Submit
        <ArrowForwardIcon sx={{ ml: "10px" }} />
      </Button>
    </Box>
  );
};

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
    color: theme.palette.common.white
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "#515153",
    // border: '1px solid #ced4da',
    fontSize: 16,
    width: "100%",
    padding: "10px 12px",
    transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(","),
    "&:focus": {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main
    }
  }
}));
