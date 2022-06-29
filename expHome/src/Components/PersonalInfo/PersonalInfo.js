import React, { useState, useEffect, useCallback } from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";

import Autocomplete from "@mui/material/Autocomplete";

import Done from "@mui/icons-material/Done";

import DateAndGenderPickers from "./DateAndGenderPickers";

import ValidatedInput from "../ValidatedInput/ValidatedInput";

import { ETHNICITY_VALUES, EDUCATION_VALUES } from "./DemographicConstants";

import "./PersonalInfo.css";

const sameThing = (value) => value;
const arrayToString = (value) => value.join(", ");
const getMajor = (option) => option.Major;
const getMajorCategory = (option) => option.Major_Category;

const renderMajor = (params) => (
  <ValidatedInput {...params} label="Major" variant="outlined" />
);

const MUISelectMenuItem = (item) => (option) => {
  return (
    <MenuItem
      key={option}
      className={item === option ? "" : "selectOption"}
      value={option}
    >
      {item === option ? <Done /> : ""}
      {option}
    </MenuItem>
  );
};

const PersonalInfo = (props) => {
  const [sortedLanguages, setSortedLanguages] = useState(["English"]);
  const [majors, setMajors] = useState([]);

  const populateLanguages = useCallback(async () => {
    if (sortedLanguages.length >= 1) {
      const ISO6391Obj = await import("iso-639-1");
      const ISO6391 = [
        ...ISO6391Obj.default
          .getAllNames()
          .sort((l1, l2) => (l1 < l2 ? -1 : 1)),
        "Prefer not to say",
      ];
      setSortedLanguages(ISO6391);
    }
  }, [sortedLanguages]);

  const populateMajors = useCallback(async () => {
    if (majors.length === 0) {
      const majorsObj = await import("../../assets/edited_majors.json");
      const majorsList = [
        ...majorsObj.default,
        { Major: "Prefer not to say", Major_Category: "Prefer not to say" },
      ]
        .sort((l1, l2) => (l1.Major < l2.Major ? -1 : 1))
        .sort((l1, l2) => (l1.Major_Category < l2.Major_Category ? -1 : 1));
      setMajors(majorsList);
    }
  }, [majors]);

  useEffect(() => {
    populateMajors();
    populateLanguages();
  }, []);

  const languageItems = useCallback(MUISelectMenuItem(props.language), [
    props.language,
  ]);

  const educationItems = useCallback(MUISelectMenuItem(props.education), [
    props.education,
  ]);

  const changeMajor = useCallback(
    (event, value, reason) => props.setMajor(value),
    [props.setMajor]
  );

  const ethnicityItems = useCallback(
    (option) => {
      return (
        <MenuItem key={option} value={option}>
          <Checkbox
            className="checkbox"
            checked={props.ethnicity.includes(option)}
          />
          <ListItemText primary={option} />
        </MenuItem>
      );
    },
    [props.ethnicity]
  );

  return (
    <form noValidate autoComplete="off">
      <div id="PersonalInfoContainer">
        <DateAndGenderPickers
          birthDate={props.birthDate}
          setBirthDate={props.setBirthDate}
          gender={props.gender}
          genderChange={props.genderChange}
          onGenderOtherValueChange={props.onGenderOtherValueChange}
          genderOtherValue={props.genderOtherValue}
          MUISelectMenuItem={MUISelectMenuItem}
        />
        <div></div>
        <FormControl className="select" variant="outlined">
          <InputLabel>The Language You Use the Most</InputLabel>
          <Select
            label="Language"
            name="language"
            onChange={props.languageChange}
            value={props.language}
            renderValue={sameThing}
          >
            {sortedLanguages.map(languageItems)}
          </Select>
        </FormControl>
        <div></div>
        <FormControl className="select" variant="outlined">
          <InputLabel>Ethnicity</InputLabel>
          <Select
            multiple
            onChange={props.ethnicityChange}
            name="ethnicity"
            label="Ethnicity"
            value={props.ethnicity}
            renderValue={arrayToString}
          >
            {
              // structure based from https://blog.hubspot.com/service/survey-demographic-questions
              ETHNICITY_VALUES.map(ethnicityItems)
            }
          </Select>
          {props.ethnicity &&
            props.ethnicity.length > 0 &&
            props.ethnicity.includes("Not listed (Please specify)") && (
              <ValidatedInput
                className="PleaseSpecify"
                label="Please specify your ethnicity."
                onChange={props.onEthnicityOtherValueChange}
                name="ethnicity"
                value={props.ethnicityOtherValue}
              />
            )}
        </FormControl>
        <div></div>
        <FormControl className="select" variant="outlined">
          <InputLabel>Education Level</InputLabel>
          <Select
            value={props.education}
            renderValue={sameThing}
            onChange={props.educationChange}
            name="education"
            label="Education Level"
          >
            {EDUCATION_VALUES.map(educationItems)}
          </Select>
        </FormControl>
        <div></div>
        <Autocomplete
          className="MajorAutocomplete"
          options={majors}
          groupBy={getMajorCategory}
          getOptionLabel={getMajor}
          renderInput={renderMajor}
          onChange={changeMajor}
        />
      </div>
    </form>
  );
};

export default React.memo(PersonalInfo);
