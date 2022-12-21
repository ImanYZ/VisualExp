import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { Routes, Route } from "react-router-dom";

import {
  firebaseState,
  emailState,
  emailVerifiedState,
  fullnameState,
  themeState,
  themeOSState,
  leadingState
} from "./store/AuthAtoms";
import { choicesState, conditionState, nullPassageState, passageState, phaseState, startedSessionState, stepState } from "./store/ExperimentAtoms";

import App from "./App";
import RouterNav from "./Components/RouterNav/RouterNav";
import SchedulePage from "./Components/SchedulePage/SchedulePage";
import ScheduleInstructorPage from "./Components/SchedulePage/ScheduleInstructorPage";
import ScheduleAdministratorPage from "./Components/SchedulePage/ScheduleAdministratorPage";
import AuthConsent from "./Components/Auth/AuthConsent";
import Activities from "./Components/ProjectManagement/Activities/Activities";
import Home from "./Components/Home/Home";
import Privacy from "./Components/Home/Privacy";
import Terms from "./Components/Home/Terms";
import CookiePolicy from "./Components/Home/CookiePolicy";
import LifeLogger from "./Components/LifeLogger/LifeLogger";
import Tutorial from "./Components/Home/Tutorial";
import TutorialFeedback from "./Components/Home/TutorialFeedback";
import Withdraw from "./Components/Home/Withdraw";
import Communities from "./Components/Home/Communities";
import communitiesOrder from "./Components/Home/modules/views/communitiesOrder";
import PaperTest from "./Components/Home/PaperTest";
import ReminderDate from "./Components/Home/ReminderDate";
import CommunityApplications from "./Components/Home/CommunityApplications";
import InviteStudents from "./Components/Home/InviteStudents";
import InstructorNo from "./Components/Home/InstructorNo";
import InstructorLater from "./Components/Home/InstructorLater";
import AdministratorNo from "./Components/Home/AdministratorNo";
import AdministratorLater from "./Components/Home/AdministratorLater";
import QuizFeedBack from "./Components/Home/QuizFeedBack";
import SignUpPage from "./Components/Auth/SignUpPage";
import DissertationGantt from "./Components/DissertationGantt";
import { isToday } from "./utils/DateFunctions";

import "./App.css";
import WaitingForSessionStart from "./Components/WaitingForSessionStart";
import { projectState } from "./store/ProjectAtoms";
import { showSignInorUpState } from "./store/GlobalAtoms";

const AppRouter = props => {
  const firebase = useRecoilValue(firebaseState);
  // selected theme for authenticated user (dark mode/light mode)
  const [theme, setTheme] = useRecoilState(themeState);
  const [themeOS, setThemeOS] = useRecoilState(themeOSState);

  const [duringAnExperiment, setDuringAnExperiment] = useState(false);
  const [startedSession, setStartedSession] = useRecoilState(startedSessionState);
  const [startedByResearcher, setStartedByResearcher] = useState(false);

  const [showSignInorUp, setShowSignInorUp] = useRecoilState(showSignInorUpState);
  const [leading, setLeading] = useRecoilState(leadingState);
  const [email, setEmail] = useRecoilState(emailState);
  const [emailVerified, setEmailVerified] = useRecoilState(emailVerifiedState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [phase, setPhase] = useRecoilState(phaseState);
  const [step, setStep] = useRecoilState(stepState);
  const [passage, setPassage] = useRecoilState(passageState);
  const [condition, setCondition] = useRecoilState(conditionState);
  const [nullPassage, setNullPassage] = useRecoilState(nullPassageState);
  const [choices, setChoices] = useRecoilState(choicesState);
  const [project, setProject] = useRecoilState(projectState);

  const processAuth = async (user) => {
    const { db } = firebase;
    // const uid = user.uid;
    const uEmail = user.email.toLowerCase();
    const users = await db.collection("users").where("email", "==", uEmail).get();
    let isSurvey = false;

    let userData = null;
    let fullName = null;

    if(!users.docs.length) {
      const usersStudentSurvey = await db.collection("usersStudentCoNoteSurvey").where("email", "==", uEmail).get()
      if(usersStudentSurvey.docs.length) {
        isSurvey = true;
        fullName = usersStudentSurvey.docs[0].id;
        userData = usersStudentSurvey.docs[0].data()
      }
    } else {
      fullName = users.docs[0].id;
      userData = users.docs[0].data()
    }

    if(!userData) return; // if user document doesn't exists
    const researcherDoc = await firebase.db.collection("researchers").doc(fullName).get();
    let isResearcher = researcherDoc.exists

    if(!isSurvey) {
      setPhase(userData.phase);
      setStep(userData.step);
      setPassage(userData.currentPCon.passage);
      setCondition(userData.currentPCon.condition);
      setNullPassage(userData.nullPassage);
      setChoices(userData.choices);
    }

    if (userData.leading && userData.leading.length > 0) {
      setLeading(userData.leading);
    }

    setFullname(fullName)
    setEmailVerified("Verified")
    setEmail(uEmail)

    if(!isResearcher) {
      setProject(userData.project)
    }
  }

  useEffect(() => {
    firebase.auth.onAuthStateChanged(async (user) => {
      if(user) {
        // sign in logic
        if(!user.emailVerified) {
          setEmailVerified("Sent")
          await user.sendEmailVerification();
          const intvl = setInterval(() => {
            if(!firebase.auth.currentUser) {
              clearInterval(intvl);
              return;
            }
            firebase.auth.currentUser.reload();
            if (firebase.auth.currentUser.emailVerified) {
              processAuth(user);
              clearInterval(intvl);
            }
          }, 1000)
        } else {
          processAuth(user);
        }
      } else {
        setShowSignInorUp(true);
        setEmailVerified("NotSent");
        setFullname("");
        setPhase(0);
        setStep(0);
        setPassage("");
        setCondition("");
        setNullPassage("");
        setChoices([]);
      }
    })
  }, [])

  useEffect(() => {
    let schedulUnsubscribe;
    const areTheyDuringAnExperimentSession = async () => {
      const currentTime = new Date().getTime();
      const scheduleDocs = await firebase.db.collection("schedule").where("email", "==", email).get();
      let duringSession = false;

      let firtSessionDoc, secondSessionDoc, thirdSessionDoc;
      if (scheduleDocs.docs.length > 0) {
        for (let scheduleDoc of scheduleDocs.docs) {
          const scheduleData = scheduleDoc.data();

          // Google Calendar ID
          if (scheduleData.id) {
            const session = scheduleData.session.toDate().getTime();
            const minTime = session - 10 * 60 * 1000;
            let maxTime = session + 60 * 60 * 1000;
            if (scheduleData.order === "1st") {
              maxTime = session + 90 * 60 * 1000;
              firtSessionDoc = scheduleDoc;
            }
            if (currentTime >= minTime && currentTime <= maxTime) {
              duringSession = true;
              if (scheduleData.order === "2nd") {
                setStartedSession(2);
                secondSessionDoc = scheduleDoc;
              } else if (scheduleData.order === "3rd") {
                setStartedSession(3);
                thirdSessionDoc = scheduleDoc;
              }
            }
            if (currentTime >= session) {
              setStartedSession(1);
            }
          }
        }
      }
      let onGoingScheduleDoc = null;
      if (thirdSessionDoc) {
        onGoingScheduleDoc = thirdSessionDoc;
      } else if (secondSessionDoc) {
        onGoingScheduleDoc = secondSessionDoc;
      } else {
        onGoingScheduleDoc = firtSessionDoc;
      }
      setDuringAnExperiment(duringSession);

      if (duringSession && onGoingScheduleDoc !== null) {
        // if they are during a sessoion then check if the session has started by the researcher or not.
        const onGoingScheduleData = onGoingScheduleDoc.data();
        if (onGoingScheduleData.hasStarted && onGoingScheduleData.attended) {
          setStartedByResearcher(true);
        } else {
          // keep listening to the schedule until the researcher starts the session.
          const schedulUnsubscribe = firebase.db
            .collection("schedule")
            .doc(onGoingScheduleDoc.id)
            .onSnapshot(docSnapshot => {
              const changedSchedule = docSnapshot.data();
              if (changedSchedule.hasStarted && changedSchedule.attended) {
                setStartedByResearcher(true);
                schedulUnsubscribe();
              }
            });
        }
      }

      return () => {
        if (schedulUnsubscribe) {
          schedulUnsubscribe();
        }
      };
    };
    const reloadIfNotLoadedToday = async () => {
      const userRef = firebase.db.collection("users").doc(fullname);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (!("lastLoad" in userData) || !isToday(userData.lastLoad.toDate())) {
          await userRef.update({
            lastLoad: firebase.firestore.Timestamp.fromDate(new Date())
          });
          window.location.reload(true);
        }
      }
    };
    if (firebase && fullname) {
      setInterval(() => {
        reloadIfNotLoadedToday();
      }, 3600000);
    }
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
        if (e.keyCode === 114 || ((e.ctrlKey || e.metaKey) && e.keyCode === 70)) {
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
      <Route path="/" element={<Home />} />
      <Route path="/home/*" element={<Home />} />
      <Route path="/Privacy/*" element={<Privacy />} />
      <Route path="/Terms/*" element={<Terms />} />
      <Route path="/cookie/*" element={<CookiePolicy />} />
      <Route path="/DissertationGantt" element={<DissertationGantt />} />
      {fullname && emailVerified === "Verified" && (
        <>
          <Route path="/tutorial/*" element={<Tutorial />} />
          <Route path="/ReminderDate/*" element={<ReminderDate />} />
          <Route path="/withdraw/*" element={<Withdraw />} />
          {leading.length > 0 && (
            <>
              <Route path="/tutorialfeedback/*" element={<TutorialFeedback />} />

              <Route path="/CommunityApplications/*" element={<CommunityApplications communiIds={leading} />} />
              <Route path={"/QuizFeedBack/*"} element={<QuizFeedBack communiIds={leading} />} />
            </>
          )}
        </>
      )}

      <Route path="/communities/" element={<Communities />} />
      {communitiesOrder.map((communi, idx) => (
        <React.Fragment key={communi.id}>
          <Route path={"/community/" + communi.id} element={<Communities commIdx={idx} />} />

          {fullname && emailVerified === "Verified" && (
            <Route
              path={"/paperTest/" + communi.id}
              element={<PaperTest communiId={communi.id} communiTitle={communi.title} />}
            />
          )}
        </React.Fragment>
      ))}
      <Route path={"/inviteStudents/:collection/:instructorId"} element={<InviteStudents />} />
      <Route path={"/notInterestedFaculty/:instructorId"} element={<InstructorNo />} />
      <Route path={"/interestedFacultyLater/:instructorId"} element={<InstructorLater />} />
      <Route path={"/notInterestedAdministrator/:administratorId"} element={<AdministratorNo />} />
      <Route path={"/interestedAdministratorLater/:administratorId"} element={<AdministratorLater />} />
      <Route path="auth" element={<SignUpPage />} />
      {fullname && email && emailVerified === "Verified" ? (
        <>
          {duringAnExperiment ? (
            <>
              {startedByResearcher ? (
                <Route path="Activities/Experiment" element={<App />} />
              ) : (
                <Route path="Activities/Experiment" element={<WaitingForSessionStart />} />
              )}
            </>
          ) : (
            <>
              <Route path="Activities/Experiments" element={<Activities activityName="Experiments" />} />
              <Route path="Activities/AddInstructor" element={<Activities activityName="AddInstructor" />} />
              <Route path="Activities/AddAdministrator" element={<Activities activityName="AddAdministrator" />} />
              <Route path="Activities/1Cademy" element={<Activities activityName="1Cademy" />} />
              <Route
                path="Activities/FreeRecallGrading"
                element={<Activities activityName="FreeRecallGrading" hideLeaderBoard={true} />}
              />
              <Route
                path="Activities/SchemaGeneration"
                element={<Activities hideLeaderBoard activityName="SchemaGenerationTool" />}
              />
              <Route
                path="Activities/ResearcherPassage"
                element={<Activities hideLeaderBoard={true} activityName="ResearcherPassage" />}
              />
              <Route path="Activities/*" element={<Activities activityName="Intellectual" />} />
              <Route path="Activities/CodeFeedback" element={<Activities activityName="CodeFeedback" />} />
              <Route
                path="LifeLog"
                element={
                  email === "oneweb@umich.edu" ? (
                    <LifeLogger />
                  ) : (
                    <div className="Error">You don't have permission to open this page!</div>
                  )
                }
              />
              {/* Everything else, including /schedule goes to this one. */}
              <Route
                path="Activities/Experiment"
                element={
                  startedSession === 1 ? (
                    <div className="Error">
                      At this point, you cannot change your scheduled sessions! Please convey your questions or concerns
                      to Iman Yeckehzaare at oneweb@umich.edu
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
        <>
          <Route path="ScheduleInstructorSurvey/:instructorId" element={<ScheduleInstructorPage />} />
          <Route path="ScheduleAdministratorSurvey/:administratorId" element={<ScheduleAdministratorPage />} />
          <Route path="InstructorCoNoteSurvey/*" element={<AuthConsent project="InstructorCoNoteSurvey" />} />
          <Route path="StudentCoNoteSurvey/*" element={<AuthConsent project="StudentCoNoteSurvey" />} />
          <Route path="Activities/*" element={<AuthConsent />} />
          <Route path="*" element={<SignUpPage />} />
        </>
      )}
    </Routes>
  );
};

export default AppRouter;
