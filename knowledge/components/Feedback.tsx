import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  alpha,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputBase,
  InputLabel,
  styled,
  SxProps,
  Theme,
  Typography
} from "@mui/material";
import { red } from "@mui/material/colors";
import { Formik, FormikErrors, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { sendFeedback } from "../lib/knowledgeApi";

const RE_EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/im;

interface FeedbackFormValues {
  email: string;
  name: string;
  feedback: string;
}

interface FeedbackProps {
  onSuccessFeedback: () => void;
  sx?: SxProps<Theme>;
}

export const Feedback = ({ onSuccessFeedback, sx }: FeedbackProps) => {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [successFeedback, setSuccessFeedback] = useState(false);

  useEffect(() => {
    const URL = window.location.href;
    setUrl(URL);
  }, [router]);

  const initialValues: FeedbackFormValues = { email: "", name: "", feedback: "" };
  const validate = (values: FeedbackFormValues) => {
    let errors: FormikErrors<FeedbackFormValues> = {};
    if (!values.email) {
      errors.email = "Email Required";
    }
    if (values.email && !RE_EMAIL.test(values.email)) {
      errors.email = "Invalid email address";
    }
    if (!values.name) {
      errors.name = "Name Required";
    }
    if (!values.feedback) {
      errors.feedback = "Feedback Required";
    }
    return errors;
  };
  const onSubmit = async (values: FeedbackFormValues, { setSubmitting }: FormikHelpers<FeedbackFormValues>) => {
    console.log(values);
    await sendFeedback({ ...values, pageURL: url });
    setSuccessFeedback(true);
    setSubmitting(false);
  };

  if (successFeedback) {
    return (
      <Box
        sx={{
          width: "500px",
          height: "450px",
          padding: "40px 50px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...sx
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
    <Box sx={{ width: "500px", padding: "40px 50px", display: "flex", flexDirection: "column", gap: "20px", ...sx }}>
      <Typography variant="h5" sx={{ color: theme => theme.palette.common.orange }}>
        Share Your Question/Feedback
      </Typography>
      <Typography component="p" sx={{ color: theme => theme.palette.common.white }}>
        Hi, thank you for using our website :)
        <br />
        We’d love to hear your feedback and comments on anything on this website!
      </Typography>
      <Formik initialValues={initialValues} validate={validate} onSubmit={onSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <FormControl variant="standard" fullWidth>
              <InputLabel shrink htmlFor="email-input" sx={{ color: theme => theme.palette.common.white }}>
                Email
              </InputLabel>
              <CustomInput
                id="email-input"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormHelperText sx={{ color: red[500] }}>{errors.email && touched.email && errors.email}</FormHelperText>
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <InputLabel shrink htmlFor="name-input" sx={{ color: theme => theme.palette.common.white }}>
                Name
              </InputLabel>
              <CustomInput
                id="name-input"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormHelperText sx={{ color: red[500] }}>{errors.name && touched.name && errors.name}</FormHelperText>
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <InputLabel shrink htmlFor="feedback-input" sx={{ color: theme => theme.palette.common.white }}>
                Your Feedback
              </InputLabel>
              <CustomInput
                id="feedback-input"
                name="feedback"
                value={values.feedback}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                multiline
              />
              <FormHelperText sx={{ color: red[500] }}>
                {errors.feedback && touched.feedback && errors.feedback}
              </FormHelperText>
            </FormControl>

            <Button type="submit" color="primary" variant="contained" fullWidth disabled={isSubmitting}>
              Submit
              <ArrowForwardIcon sx={{ ml: "10px" }} />
            </Button>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const CustomInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
    color: theme.palette.common.white
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "#515153",
    fontSize: 16,
    width: "100%",
    padding: "10px 12px",
    transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),
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
