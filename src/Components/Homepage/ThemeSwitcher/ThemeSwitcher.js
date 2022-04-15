import React from "react";
import Switch from "@mui/material/Switch";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import "./ThemeSwitcher.css";

const ThemeSwitcher = (props) => {
  return (
    <div id="UserThemeSwitchesHome">
      <FormGroup row>
        <FormControl className="select RowSwitch">
          <div className="RowSwitchItem"></div>
          <div
            className={
              props.theme === "Dark"
                ? "RowSwitchItem Left SwitchEmoji RowSwitchSelected"
                : "RowSwitchItem Left SwitchEmoji"
            }
          >
            🌜
          </div>
          <Switch
            checked={props.theme === "Light"}
            onClick={props.handleThemeSwitch}
            name="theme"
          />
          <div
            className={
              props.theme === "Light"
                ? "RowSwitchItem Right SwitchEmoji RowSwitchSelected"
                : "RowSwitchItem Right SwitchEmoji"
            }
          >
            🌞
          </div>
        </FormControl>
      </FormGroup>
    </div>
  );
};

export default ThemeSwitcher;
