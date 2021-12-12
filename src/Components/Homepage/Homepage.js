import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import ReactPageScroller from "react-page-scroller";

import {
  firebaseOnecademyState,
  themeState,
  themeOSState,
} from "../../store/AuthAtoms";

import UniversitiesMap from "./UniversitiesMap/UniversitiesMap";
import HomeNavbar from "./HomeNavbar/HomeNavbar";
// import Video from "./Video/Video";

import HomeBackgroundImageDarkMode from "../../assets/HomeBackGroundDarkMode.png";
import LightModeBackground from "../../assets/LightModeBackground.jpg";
import HomeTeamDarkMode from "../../assets/HomepageNetworkingDark.jpg";
import HomeTeamLightMode from "../../assets/HomepageNetworkingLight.jpg";
import "./Homepage.css";

const Homepage = (props) => {
  const firebase = useRecoilValue(firebaseOnecademyState);
  const [theme, setTheme] = useRecoilState(themeState);
  const [themeOS, setThemeOS] = useRecoilState(themeOSState);
  const [showMap, setShowMap] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [currentPage, setCurrentPage] = useState(null);
  const [navLabels, setNavLabels] = useState([
    // "Communities",
    "Schools",
    "Network",
    // "Join",
  ]);

  const handlePageChange = (number) => {
    setCurrentPage(number);
  };

  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      // Light mode
      setTheme("Light");
      setThemeOS("Light");
    }
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        const newColorScheme = e.matches ? "Dark" : "Light";
        if (newColorScheme === "Dark") {
          setTheme("Dark");
          setThemeOS("Dark");
        } else {
          setTheme("Light");
          setThemeOS("Light");
        }
      });
  }, []);

  const handleThemeSwitchCallback = (event) => {
    event.preventDefault();
    setTheme(theme === "Dark" ? "Light" : "Dark");
  };

  return (
    <div
      id="HomepageContainer"
      style={{
        backgroundImage:
          theme === "Dark"
            ? `url(${HomeBackgroundImageDarkMode})`
            : `url(${LightModeBackground})`,
      }}
    >
      <HomeNavbar
        setCurrentPage={setCurrentPage}
        navLabels={navLabels}
        theme={theme}
        currentPage={currentPage}
        handleThemeSwitchCallback={handleThemeSwitchCallback}
      />
      <ReactPageScroller
        pageOnChange={handlePageChange}
        customPageNumber={currentPage}
        renderAllPagesOnFirstRender={true}
        containerHeight={window.innerWidth > 900 ? "89vh" : "100vh"}
      >
        <div
          className={
            theme === "Light"
              ? "CenterMain LightModeHomeCenterMain"
              : "CenterMain"
          }
        >
          <div
            className={
              theme === "Light"
                ? "MainMessageDiv LightModeHomeMainMessageDiv"
                : "MainMessageDiv"
            }
          >
            <p>
              1Cademy is a large-scale,<br></br>online platform for students and
              researchers
            </p>
          </div>
          <div
            className={
              theme === "Light"
                ? "ButtonDiv LightModeHomeButtonDiv"
                : "ButtonDiv"
            }
          >
            <button
              className={
                theme === "Light"
                  ? "ButtonMore LightModeHomeButtonMore"
                  : "ButtonMore"
              }
            >
              {" "}
              Learn More{" "}
            </button>
            <div>Scroll</div>
            <div>
              {" "}
              <i
                className={
                  theme === "Light"
                    ? "ArrowHome LightModeHomeArrow"
                    : "ArrowHome"
                }
              ></i>{" "}
            </div>
          </div>
        </div>
        <div
          className={
            theme === "Light"
              ? "UniversitiesMapDiv LightModeUniversitiesMapDiv"
              : "UniversitiesMapDiv"
          }
        >
          <UniversitiesMap theme={theme} />
        </div>
        <div
          className={
            theme === "Light" ? "TeamsDiv  LightModeTeamsDiv " : "TeamsDiv"
          }
        >
          <img
            className="TeamsImage"
            src={theme === "Light" ? HomeTeamLightMode : HomeTeamDarkMode}
            alt="Teams"
          />
        </div>
      </ReactPageScroller>
    </div>
  );
};

export default React.memo(Homepage);
