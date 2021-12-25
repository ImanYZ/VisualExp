import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  firebaseOnecademyState,
  themeState,
  themeOSState,
} from "../../store/AuthAtoms";

import UniversitiesMap from "./UniversitiesMap/UniversitiesMap";
import HomeNavbar from "./HomeNavbar/HomeNavbar";
// import Video from "./Video/Video";
import HomeLanding from "./HomeLanding/HomeLanding";
import NetworkClusters from "./NetworkClusters/NetworkClusters";

import HomeBackgroundImageDarkMode from "../../assets/HomeBackGroundDarkMode.png";
import LightModeBackground from "../../assets/LightModeBackground.jpg";
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
      {/* <ReactPageScroller
        pageOnChange={handlePageChange}
        customPageNumber={currentPage}
        renderAllPagesOnFirstRender={true}
        containerHeight={window.innerWidth > 900 ? "89vh" : "100vh"}
      > */}
      <HomeLanding theme={theme} />
      <UniversitiesMap theme={theme} />
      <NetworkClusters theme={theme} />
      {/* </ReactPageScroller> */}
    </div>
  );
};

export default React.memo(Homepage);
