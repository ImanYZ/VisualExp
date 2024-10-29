import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { ChromePicker } from "react-color";

const AddNodeTypeModal = ({ open, onClose, onSave }) => {
  const [typeName, setTypeName] = useState("");
  const [color, setColor] = useState("#1976d2");

  const handleSave = () => {
    onSave(typeName, color);
    setTypeName("");
    setColor("#1976d2");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Node Type</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Type Name"
          value={typeName}
          onChange={e => setTypeName(e.target.value)}
          margin="normal"
        />
        <ChromePicker color={color} onChangeComplete={newColor => setColor(newColor.hex)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary" disabled={!typeName}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNodeTypeModal;
