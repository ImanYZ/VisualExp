import React, { useState, useEffect } from "react";

import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/Close";

const SnackbarComp = (props) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(props.newMessage);

  useEffect(() => {
    if (props.newMessage) {
      setOpen(true);
      setMessage(props.newMessage);
      props.setNewMessage("");
    }
  }, [props.newMessage]);

  const close = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const actionButton = (
    <IconButton size="small" aria-label="close" color="inherit" onClick={close}>
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={close}
      message={message}
      action={actionButton}
    />
  );
};

export default SnackbarComp;
