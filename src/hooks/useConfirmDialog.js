import { Button, Dialog, DialogActions, DialogContent, DialogContentText, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";

const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isPrompt, setIsPrompt] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const resolveRef = React.useRef(null);
  const [confirmation, setConfirmation] = useState("");
  const [cancel, setCancel] = useState("");

  const showDialog = useCallback((message, prompt = false, confirmation, cancel) => {
    setDialogMessage(message);
    setIsOpen(true);
    setIsPrompt(prompt);
    setConfirmation(confirmation);
    setCancel(cancel);

    return new Promise(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const closeDialog = useCallback(
    confirmed => {
      setIsOpen(false);
      setDialogMessage("");
      setInputValue("");

      if (resolveRef.current) {
        resolveRef.current(isPrompt ? inputValue : confirmed);
      }
    },
    [isPrompt, inputValue]
  );

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  const ConfirmDialog = (
    <Dialog open={isOpen} onClose={() => closeDialog(false)} sx={{ width: "100%" }}>
      <DialogContent sx={{ width: "500px" }}>
        <DialogContentText>{dialogMessage}</DialogContentText>
        {isPrompt && (
          <TextField
            autoFocus
            margin="dense"
            id="prompt-input"
            type="text"
            value={inputValue}
            placeholder="Document..."
            onChange={handleInputChange}
            fullWidth
            multiline
            sx={{
              mt: 3,
              mx: "auto",
              display: "block",
              textAlign: "center"
            }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: "5px" }}>
        <Button
          onClick={() => closeDialog(true)}
          variant="contained"
          sx={{
            borderRadius: "26px",
            backgroundColor: "orange",
            color: "white"
          }}
          disabled={isPrompt && !inputValue.trim()}
        >
          {confirmation}
        </Button>
        {!isPrompt && cancel && (
          <Button onClick={() => closeDialog(false)} color="primary" variant="outlined" sx={{ borderRadius: "26px" }}>
            {cancel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  const promptIt = useCallback(
    (message, confirmation, cancel) => showDialog(message, true, confirmation, cancel),
    [showDialog]
  );
  const confirmIt = useCallback(
    (message, confirmation, cancel) => showDialog(message, false, confirmation, cancel),
    [showDialog]
  );

  return { promptIt, confirmIt, ConfirmDialog };
};

export default useDialog;
