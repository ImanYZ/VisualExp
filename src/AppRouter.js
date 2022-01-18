import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { Routes, Route } from "react-router-dom";

import {
  firebaseState,
  emailState,
  fullnameState,
  isAdminState,
  themeState,
  themeOSState,
} from "./store/AuthAtoms";
import { secondSessionState, thirdSessionState } from "./store/ExperimentAtoms";

import App from "./App";
import RouterNav from "./Components/RouterNav/RouterNav";
import SchedulePage from "./Components/SchedulePage/SchedulePage";
import AuthConsent from "./Components/Auth/AuthConsent";
import Activities from "./Components/ProjectManagement/Activities/Activities";
import ManageEvents from "./Components/ProjectManagement/ManageEvents/ManageEvents";
import Home from "./Components/Home/Home";
import Privacy from "./Components/Home/Privacy";
import Terms from "./Components/Home/Terms";
import CookiePolicy from "./Components/Home/CookiePolicy";
import LifeLogger from "./Components/LifeLogger/LifeLogger";
import Communities from "./Components/Home/Communities";
import communities from "./Components/Home/modules/views/communitiesOrder";

import "./App.css";

const AppRouter = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const [email, setEmail] = useRecoilState(emailState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [isAdmin, setIsAdmin] = useRecoilState(isAdminState);
  const [secondSession, setSecondSession] = useRecoilState(secondSessionState);
  const [thirdSession, setThirdSession] = useRecoilState(thirdSessionState);
  // selected theme for authenticated user (dark mode/light mode)
  const [theme, setTheme] = useRecoilState(themeState);
  const [themeOS, setThemeOS] = useRecoilState(themeOSState);

  const [duringAnExperiment, setDuringAnExperiment] = useState(false);
  const [startedFirstSession, setStartedFirstSession] = useState(false);

  useEffect(() => {
    const areTheyDuringAnExperimentSession = async () => {
      const currentTime = new Date().getTime();
      const scheduleDocs = await firebase.db
        .collection("schedule")
        .where("email", "==", email)
        .get();
      let duringSession = false;
      if (scheduleDocs.docs.length > 0) {
        for (let scheduleDoc of scheduleDocs.docs) {
          const scheduleData = scheduleDoc.data();
          if (scheduleData.id) {
            const session = scheduleData.session.toDate().getTime();
            const minTime = session - 10 * 60 * 1000;
            let maxTime = session + 60 * 60 * 1000;
            if (scheduleData.order === "1st") {
              maxTime = session + 90 * 60 * 1000;
            }
            if (currentTime >= minTime && currentTime <= maxTime) {
              duringSession = true;
              if (scheduleData.order === "2nd") {
                setSecondSession(true);
              } else if (scheduleData.order === "3rd") {
                setThirdSession(true);
              }
            }
            if (currentTime >= session) {
              setStartedFirstSession(true);
            }
          }
        }
      }
      setDuringAnExperiment(duringSession);
    };
    if (firebase && email && fullname) {
      areTheyDuringAnExperimentSession();
    }
  }, [firebase, email, fullname]);

  useEffect(() => {
    if (duringAnExperiment) {
      window.location.hash = "no-back-button";

      // Again because Google Chrome doesn't insert
      // the first hash into the history
      window.location.hash = "Again-No-back-button";

      window.onhashchange = function () {
        window.location.hash = "no-back-button";
      };

      window.onbeforeunload = function (e) {
        e = e || window.event;

        // For IE and Firefox prior to version 4
        if (e) {
          e.returnValue = "Do you want to quit this experiment website?";
        }

        // For Safari
        return "Do you want to quit this experiment website?";
      };

      window.addEventListener("keydown", function (e) {
        if (
          e.keyCode === 114 ||
          ((e.ctrlKey || e.metaKey) && e.keyCode === 70)
        ) {
          e.preventDefault();
        }
      });
    }
    // if (
    //   window.matchMedia &&
    //   window.matchMedia("(prefers-color-scheme: light)").matches
    // ) {
    //   // Light mode
    //   setTheme("Light");
    //   setThemeOS("Light");
    // }
    // window
    //   .matchMedia("(prefers-color-scheme: dark)")
    //   .addEventListener("change", (e) => {
    //     const newColorScheme = e.matches ? "Dark" : "Light";
    //     if (newColorScheme === "Dark") {
    //       setTheme("Dark");
    //       setThemeOS("Dark");
    //     } else {
    //       setTheme("Light");
    //       setThemeOS("Light");
    //     }
    //   });
  }, [duringAnExperiment]);

  return (
    <Routes>
      <Route path="/Home/*" element={<Home />} />
      <Route path="/Privacy/*" element={<Privacy />} />
      <Route path="/Terms/*" element={<Terms />} />
      <Route path="/cookie/*" element={<CookiePolicy />} />
      {communities.map((communi) => (
        <Route
          key={communi.id}
          path={"/community/" + communi.id}
          element={<Communities commId={communi.id} />}
        />
      ))}
      <Route
        path="/*"
        element={<RouterNav duringAnExperiment={duringAnExperiment} />}
      >
        {fullname && email ? (
          <>
            {duringAnExperiment ? (
              <Route path="*" element={<App />} />
            ) : (
              <>
                <Route
                  path="Activities/Experiments"
                  element={
                    isAdmin ? (
                      <ManageEvents />
                    ) : (
                      <Activities activityName="Experiments" />
                    )
                  }
                />
                <Route
                  path="Activities/AddInstructor"
                  element={<Activities activityName="AddInstructor" />}
                />
                <Route
                  path="Activities/1Cademy"
                  element={<Activities activityName="1Cademy" />}
                />
                <Route
                  path="Activities/*"
                  element={<Activities activityName="Intellectual" />}
                />
                <Route
                  path="LifeLog"
                  element={
                    email === "oneweb@umich.edu" ? (
                      <LifeLogger />
                    ) : (
                      <div className="Error">
                        You don't have permission to open this page!
                      </div>
                    )
                  }
                />
                {/* Everything else, including /schedule goes to this one. */}
                <Route
                  path="/*"
                  element={
                    startedFirstSession ? (
                      <div className="Error">
                        At this point, you cannot change your scheduled
                        sessions! Please convey your questions or concerns to
                        Iman Yeckehzaare at oneweb@umich.edu
                      </div>
                    ) : (
                      <SchedulePage />
                    )
                  }
                />
              </>
            )}
          </>
        ) : (
          <Route path="*" element={<AuthConsent />} />
        )}
      </Route>
    </Routes>
  );
};

export default AppRouter;
