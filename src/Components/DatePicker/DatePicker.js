import React, { useState, useEffect } from "react";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import "./DatePicker.css";

const DatePicker = (props) => {
  const [DateFnsUtils, setDateFnsUtils] = useState([]);

  useEffect(() => {
    const loadDateFnsUtils = async () => {
      const sateFnsObj = await import("@date-io/date-fns");
      const sateFns = sateFnsObj.default;
      setDateFnsUtils([sateFns]);
    };
    loadDateFnsUtils();
  }, []);

  return DateFnsUtils.length > 0 ? (
    <MuiPickersUtilsProvider utils={DateFnsUtils[0]}>
      <KeyboardDatePicker
        margin="normal"
        id="date-picker-dialog"
        label={"label" in props ? props.label : "Your Birth Date"}
        format="MM/dd/yyyy"
        onChange={props.setBirthDate}
        value={props.birthDate}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
      />
    </MuiPickersUtilsProvider>
  ) : (
    <div></div>
  );
};

export default React.memo(DatePicker);
