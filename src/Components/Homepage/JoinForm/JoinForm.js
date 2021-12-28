import React, { useEffect, useState } from "react";

import { Button, Grid } from "@mui/material";

import ValidatedInput from "../../ValidatedInput/ValidatedInput";

import "./JoinForm.css";

const JoinForm = (props) => {
  const [userInput, setUserInput] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);

  function handleBlur() {
    if (userInput && !props.reasons.includes(userInput)) {
      setErrorMessage(
        "You answer does not match with the options listed. Please check you spelling!"
      );
    } else {
      setErrorMessage("");
    }
  }

  function onFormSubmit(e) {
    // should users be able to submit by pressing enter?
    e.preventDefault();
    //Do we need to save user typed input?
  }

  useEffect(() => {
    if (!props.showSocial && props.showPrivateCond && !props.showPublicCond) {
      // low social + private
    } else if (
      props.showSocial &&
      props.showPrivateCond &&
      !props.showPublicCond
    ) {
      // high social + private
      props.setReasons([
        "Discuss your ideas",
        "Build a reputation",
        "Learn with others",
      ]);
    } else if (
      !props.showSocial &&
      !props.showPrivateCond &&
      props.showPublicCond
    ) {
      // low social + public
      props.setReasons([
        "Share your knowledge",
        "Organize content publically",
        "Help others learn",
      ]);
    } else if (
      props.showSocial &&
      !props.showPrivateCond &&
      props.showPublicCond
    ) {
      // high social + public
      props.setReasons([
        "Collaborate to build knowledge",
        "Build a learning community",
        "Create content with others",
      ]);
    } else if (
      !props.showSocial &&
      props.showPrivateCond &&
      props.showPublicCond
    ) {
      // low social and private and public
      props.setReasons([
        "Improve your learning",
        "Share your knowledge",
        "Organize content publically",
      ]);
    } else if (
      props.showSocial &&
      props.showPrivateCond &&
      props.showPublicCond
    ) {
      // high social and private and public
      props.setReasons([
        "Discuss your ideas",
        "Build a reputation",
        "Create content with others",
      ]);
    } else if (
      !props.showSocial &&
      !props.showPrivateCond &&
      !props.showPublicCond
    ) {
      // need to fix for low social and not private nor public
      props.setReasons([
        "Discuss your ideas",
        "Build a learning community",
        "Learn with others",
      ]);
    } else {
      // need to fix for high social and not private and not public
      props.setReasons([
        "Discuss your ideas",
        "Build a learning community",
        "Learn with others",
      ]);
    }
  }, [props.showSocial, props.showPrivateCond, props.showPublicCond]);

  //   const reasonList = userReasons.map((reason) => {
  //     return <ul>- {reason}</ul>;
  //   });

  return (
    <div className="JoinForm">
      <Grid container spacing={2} className="GridContainer">
        <Grid item sm={1} xs={1}></Grid>
        <Grid item xs={10}>
          <p className="gradientText">Join 1Cademy...</p>
          <div className="TextForm">
            <p className="Header">
              Type your main reason for joining 1Cademy from the options below:
            </p>
            <Grid container spacing={1}>
              <Grid item sm={2} xs={1}></Grid>
              <Grid item sm={8} xs={10}>
                <div className="Reasons">
                  <ul>
                    {props.reasons &&
                      props.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                  </ul>
                </div>
              </Grid>
              <Grid item sm={2} xs={1}></Grid>
            </Grid>
            <form onSubmit={onFormSubmit}>
              <Grid container spacing={1}>
                <Grid item sm={2} xs={1}></Grid>
                <Grid item sm={8} xs={12}>
                  <ValidatedInput
                    identification="JoinInput"
                    defaultValue={"Type your answer here"}
                    placeholder="Type your answer here"
                    label={"Type your answer here"}
                    onBlur={handleBlur}
                    value={userInput}
                    errorMessage={errorMessage}
                    //onChange={(e) => props.setFormInput(e.target.value)}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                </Grid>
                <Grid item sm={2} xs={1}></Grid>
              </Grid>
            </form>
            <Grid container spacing={1}>
              <Grid item sm={3} xs={2}></Grid>
              <Grid item sm={6} xs={8}>
                <div id="JoinButton">
                  <Button
                    variant="contained"
                    className="DeclareIntentButton"
                    // onClick={}
                  >
                    I Declare My Intent to Join
                  </Button>
                </div>
              </Grid>
              <Grid item sm={3} xs={2}></Grid>
            </Grid>
          </div>
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>
    </div>
  );
};

export default React.memo(JoinForm);
