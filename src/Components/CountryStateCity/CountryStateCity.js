import React, { useState, useEffect, useCallback } from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import Done from "@mui/icons-material/Done";

import "./CountryStateCity.css";

const getRegionName = (value) => value.split(";")[0];

const defaultCountry = { flag: "🇺🇸", isoCode: "US", name: "United States" };
const defaultStateInfo = {
  isoCode: "MI",
  name: "-",
  countryCode: "US",
};
const defaultCity = { name: "-" };

const StateCityPickers = React.lazy(() => import("./StateCityPickers"));

const CountryStateCity = (props) => {
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const updateStatesList = useCallback(
    (countryCode) => {
      let states = [defaultStateInfo];
      if (props.CSCObj) {
        states = props.CSCObj.State.getStatesOfCountry(countryCode);
      }
      setStatesList(states);
    },
    [props.CSCObj]
  );

  useEffect(() => {
    updateStatesList(props.values.country.split(";")[1]);
  }, [updateStatesList, props.values.country]);

  const updateCitiesList = useCallback(
    (countryCode, StateCode) => {
      let cities = [defaultCity];
      if (props.CSCObj) {
        cities = props.CSCObj.City.getCitiesOfState(countryCode, StateCode);
      }
      setCitiesList(cities);
    },
    [props.CSCObj]
  );

  useEffect(() => {
    updateCitiesList(
      props.values.stateInfo.split(";")[2],
      props.values.stateInfo.split(";")[1]
    );
  }, [updateCitiesList, props.values.stateInfo]);

  const findRegion = useCallback(
    (regionType) => (event) => {
      if (props.CSCObj) {
        if ("persist" in event) {
          event.persist();
        }
        props.handleChange(event);

        const targetName = regionType === "Country" ? "stateInfo" : "city";
        let targetList;
        if (regionType === "Country") {
          targetList = props.CSCObj.State.getStatesOfCountry(
            event.target.value.split(";")[1]
          );
          if (targetList.length === 0) {
            targetList.push(defaultStateInfo);
          }
        } else {
          targetList = props.CSCObj.City.getCitiesOfState(
            event.target.value.split(";")[2],
            event.target.value.split(";")[1]
          );
          if (targetList.length === 0) {
            targetList.push(defaultCity);
          }
        }
        if (targetList.length > 0) {
          if (regionType === "Country") {
            updateStatesList(targetList[0].countryCode);
            findRegion("State")({
              ...event,
              target: {
                ...event.target,
                name: "stateInfo",
                value:
                  targetList[0].name +
                  ";" +
                  targetList[0].isoCode +
                  ";" +
                  targetList[0].countryCode,
              },
            });
          } else {
            updateCitiesList(
              event.target.value.split(";")[2],
              event.target.value.split(";")[1]
            );
            props.handleChange({
              ...event,
              target: {
                ...event.target,
                name: targetName,
                value: targetList[0].name,
              },
            });
          }
        }
      }
    },
    [props.handleChange, props.CSCObj]
  );

  const countryItems = useCallback(
    (option) => {
      const flagName = option.flag + " " + option.name;
      return (
        <MenuItem
          key={option.name}
          className={
            props.values.country.split(";")[0] === flagName
              ? ""
              : "selectOption"
          }
          value={flagName + ";" + option.isoCode}
        >
          {props.values.country.split(";")[0] === flagName ? <Done /> : ""}
          {flagName}
        </MenuItem>
      );
    },
    [props.values.country]
  );

  const stateItems = useCallback(
    (option) => {
      return (
        <MenuItem
          key={option.name}
          className={
            props.values.stateInfo.split(";")[0] === option.name
              ? ""
              : "selectOption"
          }
          value={option.name + ";" + option.isoCode + ";" + option.countryCode}
        >
          {props.values.stateInfo.split(";")[0] === option.name ? <Done /> : ""}
          {option.name}
        </MenuItem>
      );
    },
    [props.values.stateInfo]
  );

  const cityItems = useCallback(
    (option) => {
      return (
        <MenuItem
          key={option.name}
          className={props.values.city === option.name ? "" : "selectOption"}
          value={option.name}
        >
          {props.values.city === option.name ? <Done /> : ""}
          {option.name}
        </MenuItem>
      );
    },
    [props.values.city]
  );

  return (
    <>
      <FormControl className="Select" variant="outlined">
        <InputLabel>Country</InputLabel>
        <Select
          onChange={findRegion("Country")}
          onBlur={props.handleBlur}
          name="country"
          label="Country"
          value={props.values.country}
          renderValue={getRegionName}
        >
          {props.allCountries.map(countryItems)}
        </Select>
      </FormControl>

      {props.inSidebar ? (
        <>
          <StateCityPickers
            findRegion={findRegion}
            handleChange={props.handleChange}
            handleBlur={props.handleBlur}
            statesList={statesList}
            values={props.values}
            getRegionName={getRegionName}
            stateItems={stateItems}
            citiesList={citiesList}
            cityItems={cityItems}
            inSidebar={props.inSidebar}
          />
        </>
      ) : (
        <StateCityPickers
          findRegion={findRegion}
          handleChange={props.handleChange}
          handleBlur={props.handleBlur}
          statesList={statesList}
          values={props.values}
          getRegionName={getRegionName}
          stateItems={stateItems}
          citiesList={citiesList}
          cityItems={cityItems}
        />
      )}
    </>
  );
};

export default React.memo(CountryStateCity);
