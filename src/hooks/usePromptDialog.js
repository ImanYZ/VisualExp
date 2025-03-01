import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Grid,
  Typography
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState } from "../store/AuthAtoms";
import Box from "@mui/material/Box";

const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const resolveRef = React.useRef(null);
  const [confirmation, setConfirmation] = useState("");
  const [cancel, setCancel] = useState("");
  const firebase = useRecoilValue(firebaseState);
  const [llmPrompt, setLlmPrompt] = useState("");

  const getPrompt = async type => {
    const promptDoc = await firebase.db.collection("diagramPrompts").doc(type).get();
    const promptData = promptDoc.data();
    setLlmPrompt(promptData?.prompt || "");
  };

  const showDialog = useCallback((message, confirmation, cancel) => {
    getPrompt(confirmation.toLowerCase());
    setDialogMessage(message);
    setIsOpen(true);
    setConfirmation(confirmation);
    setCancel(cancel);

    return new Promise(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setDialogMessage("");
    setInputValue("");
    setLlmPrompt("");

    if (resolveRef.current) {
      savePrompt();
      resolveRef.current(inputValue || "");
    }
  }, [inputValue, llmPrompt]);

  const handleUserInputChange = event => {
    setInputValue(event.target.value);
  };

  const handleLlmPromptChange = event => {
    setLlmPrompt(event.target.value);
  };
  const savePrompt = () => {
    const promptRef = firebase.db.collection("diagramPrompts").doc(confirmation.toLowerCase());
    promptRef.set({
      prompt: llmPrompt
    });
  };

  const PromptDialog = (
    <Dialog open={isOpen} fullScreen onClose={closeDialog}>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh"
        }}
      >
        <DialogContentText>{dialogMessage}</DialogContentText>
        <Grid container spacing={2} sx={{ pt: 3, height: "80vh" }}>
          <Grid item xs={6} sx={{ height: "100%" }}>
            <Typography>
              {confirmation.toLowerCase() === "generate" ? "Enter your document bellow:" : "Your input:"}
            </Typography>
            <TextField
              label=""
              autoFocus
              margin="dense"
              type="text"
              value={inputValue}
              onChange={handleUserInputChange}
              fullWidth
              multiline
              minRows={16}
              sx={{
                height: "100%",
                overflow: "auto",
                maxHeight: "75vh"
              }}
            />
          </Grid>
          <Grid item xs={6} sx={{ height: "100%" }}>
            <Typography>System Prompt:</Typography>
            <TextField
              label=""
              margin="dense"
              type="text"
              value={llmPrompt}
              onChange={handleLlmPromptChange}
              fullWidth
              multiline
              minRows={16}
              sx={{
                height: "100%",
                overflow: "auto",
                maxHeight: "75vh"
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: "20px" }}>
        <Button
          onClick={closeDialog}
          variant="contained"
          sx={{ borderRadius: "26px", backgroundColor: "orange", color: "white" }}
          disabled={!inputValue.trim()}
        >
          {confirmation}
        </Button>
        {cancel && (
          <Button onClick={() => closeDialog(false)} color="primary" variant="outlined" sx={{ borderRadius: "26px" }}>
            {cancel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  const promptItDiagram = useCallback(
    (message, confirmation, cancel, type) => showDialog(message, confirmation, cancel),
    [showDialog]
  );

  return { promptItDiagram, PromptDialog };
};

export default useDialog;
