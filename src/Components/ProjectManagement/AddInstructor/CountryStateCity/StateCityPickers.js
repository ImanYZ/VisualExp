import React from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

const sameThing = (value) => value;

const StateCityPickers = (props) => {
  return (
    <>
      <FormControl className="Select" variant="outlined">
        <InputLabel>State</InputLabel>
        <Select
          onChange={props.findRegion("State")}
          onBlur={props.handleBlur}
          name="stateInfo"
          label="State"
          value={props.statesList.length > 1 ? props.values.stateInfo : "-"}
          renderValue={props.getRegionName}
        >
          {props.statesList.map(props.stateItems)}
        </Select>
      </FormControl>
      <FormControl className="Select" variant="outlined">
        <InputLabel>City</InputLabel>
        <Select
          onChange={props.handleChange}
          onBlur={props.handleBlur}
          name="city"
          label="City"
          value={props.citiesList.length > 1 ? props.values.city : "-"}
          renderValue={sameThing}
        >
          {props.citiesList.map(props.cityItems)}
        </Select>
      </FormControl>
    </>
  );
};

export default React.memo(StateCityPickers);
