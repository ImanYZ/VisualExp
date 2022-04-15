import React, { useCallback } from "react";

import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";

import ValidatedInput from "../ValidatedInput/ValidatedInput";

import { GENDER_VALUES } from "./DemographicConstants";

const sameThing = (value) => value;

const DateAndGenderPickers = (props) => {
  const genderItems = useCallback(props.MUISelectMenuItem(props.gender), [
    props.gender,
  ]);

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="ActivityDateTimePicker">
          <DatePicker
            label="Birth Date"
            value={props.birthDate}
            onChange={(newValue) => {
              props.setBirthDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </LocalizationProvider>
      <div></div>
      <FormControl className="select" variant="outlined">
        <InputLabel>Gender</InputLabel>
        <Select
          renderValue={sameThing}
          onChange={props.genderChange}
          name="gender"
          label="Gender"
          value={props.gender}
        >
          {
            // structure based from https://blog.hubspot.com/service/survey-demographic-questions
            GENDER_VALUES.map(genderItems)
          }
        </Select>

        {props.gender === "Not listed (Please specify)" && (
          <ValidatedInput
            className="PleaseSpecify"
            label="Please specify your gender."
            onChange={props.onGenderOtherValueChange}
            name="gender"
            value={props.genderOtherValue}
          />
        )}
      </FormControl>
    </>
  );
};

export default React.memo(DateAndGenderPickers);
