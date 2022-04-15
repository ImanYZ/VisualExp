import React, { useState, useEffect } from "react";

import { useTimer } from "react-timer-hook";

import Button from "@mui/material/Button";

const Timer = ({ expiryTimestamp }) => {
  const {
    seconds,
    minutes,
    // hours,
    // days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn("onExpire called"),
  });

  useEffect(() => {
    restart(expiryTimestamp);
  }, [expiryTimestamp]);

  return (
    <div id="TimerContainer">
      <Button
        onClick={() => restart(expiryTimestamp)}
        className="Button SubmitButton"
        variant="contained"
      >
        Restart
      </Button>
      <div id="Timer" className={isRunning ? "" : "Error"}>
        <span>{minutes}</span>:<span>{seconds}</span>
      </div>
    </div>
  );
};

export default Timer;
