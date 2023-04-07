import React from "react";
import TextField from "@mui/material/TextField";

const CustomTextInput = React.memo(({ value, onChange }) => (
  <TextField
    sx={{ width: '100%', marginBottom: '10px' }}
    value={value}
    onChange={onChange}
  />
));

export default CustomTextInput;