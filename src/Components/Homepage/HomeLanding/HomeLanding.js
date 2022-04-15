import React from "react";

import OneCademyIntroDark from "../../../assets/OneCademyIntroDark.png";

import "./HomeLanding.css";

const HomeLanding = (props) => {
  return (
    <div
      className={
        props.theme === "Light"
          ? "CenterMain LightModeHomeCenterMain"
          : "CenterMain"
      }
    >
      <div
        className={
          props.theme === "Light"
            ? "MainMessageDiv LightModeHomeMainMessageDiv"
            : "MainMessageDiv"
        }
      >
        <p>
          Using 1Cademy we start learning from Advanced topics and go backwards
          through the prerequisites as needed!
        </p>
      </div>
      <div
        className={
          props.theme === "Light"
            ? "ButtonDiv LightModeHomeButtonDiv"
            : "ButtonDiv"
        }
      >
        <div>Scroll to</div>
        <div>Learn More</div>
        <div>
          {" "}
          <i
            className={
              props.theme === "Light"
                ? "ArrowHome LightModeHomeArrow"
                : "ArrowHome"
            }
          ></i>{" "}
        </div>
      </div>
    </div>
  );
};

export default HomeLanding;
