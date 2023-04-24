import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { Routes, Route, useNavigate } from "react-router-dom";

import {
  firebaseState,
  emailState,
  emailVerifiedState,
  fullnameState,
  /*   themeState,
  themeOSState, */
  leadingState,
  institutionsState,
  isAdminState,
  resumeUrlState,
  transcriptUrlState,
  applicationsSubmittedState
} from "./store/AuthAtoms";
import {
  choicesState,
  conditionState,
  nullPassageState,
  passageState,
  phaseState,
  startedSessionState,
  stepState,
  hasScheduledState,
  completedExperimentState
} from "./store/ExperimentAtoms";

import App from "./App";
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
import DissertationGantt from "./Components/DissertationGantt";
import OneCademyCollaborationModel from "./Components/OneCademyCollaborationModel";
import { isToday } from "./utils/DateFunctions";

import "./App.css";
import WaitingForSessionStart from "./Components/WaitingForSessionStart";
import { CURRENT_PROJ_LOCAL_S_KEY, notAResearcherState, projectsState, projectState } from "./store/ProjectAtoms";
import { showSignInorUpState } from "./store/GlobalAtoms";
import { firebaseOne } from "./Components/firebase/firebase";
import AppConfig from "./AppConfig";
import GDPRPolicy from "./Components/Home/GDPRPolicy";

const AppRouter = props => {
  const firebase = useRecoilValue(firebaseState);
  const { db: dbOne } = firebaseOne;
  const navigateTo = useNavigate();

  // selected theme for authenticated user (dark mode/light mode)
  // const [theme, setTheme] = useRecoilState(themeState);
  // const [themeOS, setThemeOS] = useRecoilState(themeOSState);

  const [duringAnExperiment, setDuringAnExperiment] = useState(false);
  const [startedSession, setStartedSession] = useRecoilState(startedSessionState);
  const [startedByResearcher, setStartedByResearcher] = useState(false);

  const [notAResearcher, setNotAResearcher] = useRecoilState(notAResearcherState);
  const setIsAdmin = useSetRecoilState(isAdminState);
  const setProjects = useSetRecoilState(projectsState);

  const setShowSignInorUp = useSetRecoilState(showSignInorUpState);
  const [leading, setLeading] = useRecoilState(leadingState);
  const [email, setEmail] = useRecoilState(emailState);
  const [emailVerified, setEmailVerified] = useRecoilState(emailVerifiedState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const setPhase = useSetRecoilState(phaseState);
  const setStep = useSetRecoilState(stepState);
  const setPassage = useSetRecoilState(passageState);
  const setCondition = useSetRecoilState(conditionState);
  const setNullPassage = useSetRecoilState(nullPassageState);
  const setChoices = useSetRecoilState(choicesState);
  const setProject = useSetRecoilState(projectState);
  const setInstitutions = useSetRecoilState(institutionsState);
  const setHasScheduled = useSetRecoilState(hasScheduledState);
  const setCompletedExperiment = useSetRecoilState(completedExperimentState);
  const setApplicationsSubmitted = useSetRecoilState(applicationsSubmittedState);
  const setResumeUrl = useSetRecoilState(resumeUrlState);
  const setTranscriptUrl = useSetRecoilState(transcriptUrlState);

  const processAuth = async user => {
    const { db } = firebase;
    // const uid = user.uid;
    const uEmail = user.email.toLowerCase();
    const users = await db.collection("users").where("email", "==", uEmail).get();
    let isSurvey = false;

    let userData = null;
    let fullName = null;

    if (!users.docs.length) {
      const usersStudentSurvey = await db.collection("usersStudentCoNoteSurvey").where("email", "==", uEmail).get();
      if (usersStudentSurvey.docs.length) {
        isSurvey = true;
        fullName = usersStudentSurvey.docs[0].id;
        userData = usersStudentSurvey.docs[0].data();
      }
    } else {
      fullName = users.docs[0].id;
      userData = users.docs[0].data();
      setEmail(uEmail.toLowerCase());
      if (!userData.firstname || !userData.lastname) {
        window.location.href = "/";
      }
      if (userData.applicationsSubmitted) {
        setApplicationsSubmitted(userData.applicationsSubmitted);
      }
      if ("Resume" in userData) {
        setResumeUrl(userData["Resume"]);
      }
      if ("Transcript" in userData) {
        setTranscriptUrl(userData["Transcript"]);
      }
      if ("projectDone" in userData && userData.projectDone) {
        setHasScheduled(true);
        setCompletedExperiment(true);
      } else {
        const scheduleDocs = await firebase.db.collection("schedule").where("email", "==", uEmail).get();
        const nowTimestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let allPassed = true;
        if (scheduleDocs.docs.length >= 3) {
          let scheduledSessions = 0;
          for (let scheduleDoc of scheduleDocs.docs) {
            const scheduleData = scheduleDoc.data();
            if (scheduleData.order) {
              scheduledSessions += 1;
              if (scheduleData.session >= nowTimestamp) {
                allPassed = false;
              }
            }
          }
          if (scheduledSessions >= 3) {
            setHasScheduled(true);
            if (allPassed) {
              setCompletedExperiment(true);
            }
          }
        }
      }
    }

    if (!userData) return; // if user document doesn't exists
    const researcherDoc = await firebase.db.collection("researchers").doc(fullName).get();
    let isResearcher = researcherDoc.exists;

    if (!isSurvey) {
      setPhase(userData?.phase || 0);
      setStep(userData?.step || 0);
      setPassage(userData?.currentPCon?.passage || "");
      setCondition(userData?.currentPCon?.condition || "");
      setNullPassage(userData?.nullPassage || "");
      setChoices(userData?.choices || []);
    }

    if (userData.leading && userData.leading.length > 0) {
      setLeading(userData.leading.filter(id => !!communitiesOrder.find(com => com.id === id)));
    }

    setFullname(fullName);
    setEmailVerified("Verified");
    setEmail(uEmail);

    if (!isResearcher) {
      setProject(userData.project);
    } else {
      // if current user a researcher
      const researcherData = researcherDoc.data();
      if (researcherData.isAdmin) {
        setIsAdmin(true);
      }

      const myProjects = [];
      for (let pr in researcherData.projects) {
        myProjects.push(pr);
      }
      setProjects(myProjects);
      const prevProj = localStorage.getItem(CURRENT_PROJ_LOCAL_S_KEY);
      if (myProjects.includes(prevProj)) {
        setProject(prevProj);
      } else {
        setProject(myProjects[0]);
      }
    }

    setNotAResearcher(!isResearcher);

    // if redirects required
    const nonAuthUrls = ["/auth", "/InstructorCoNoteSurvey", "/StudentCoNoteSurvey"];
    for (const nonAuthUrl of nonAuthUrls) {
      if (String(window.location.pathname).startsWith(nonAuthUrl)) {
        navigateTo("/");
        break;
      }
    }
  };

  useEffect(() => {
    firebase.auth.onAuthStateChanged(async user => {
      if (user) {
        // sign in logic
        if (!user.emailVerified) {
          setEmailVerified("Sent");
          await user.sendEmailVerification();
          const intvl = setInterval(() => {
            if (!firebase.auth.currentUser) {
              clearInterval(intvl);
              return;
            }
            firebase.auth.currentUser.reload();
            if (firebase.auth.currentUser.emailVerified) {
              processAuth(user);
              clearInterval(intvl);
            }
          }, 1000);
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
        setProject(AppConfig.defaultProject);
        setChoices([]);
        setEmail("");
        setHasScheduled(false);
        setCompletedExperiment(false);
        setApplicationsSubmitted({});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebase, fullname]);

  useEffect(() => {
    (async () => {
      dbOne
        .collection("institutions")
        .where("usersNum", ">=", 1)
        .onSnapshot(snapshot => {
          setInstitutions(insitutions => {
            let _insitutions = [...insitutions];
            const docChanges = snapshot.docChanges();
            for (const docChange of docChanges) {
              const institutionData = docChange.doc.data();
              if (docChange.type === "added") {
                _insitutions.push(institutionData);
                continue;
              }
              const idx = _insitutions.findIndex(insitution => insitution.name === institutionData.name);
              if (docChange.type === "modified") {
                _insitutions[idx] = institutionData;
              } else {
                _insitutions.splice(idx, 1);
              }
            }
            return _insitutions;
          });
        });
    })();
  }, []);

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
              } else {
                setStartedSession(1);
              }
            } else if (currentTime >= session && !duringSession) {
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
      <Route path="/gdpr/*" element={<GDPRPolicy />} />
      <Route path="/Iman-Dissertation-Prospectus" element={<DissertationGantt />} />
      <Route path="/OneCademyCollaborationModel" element={<OneCademyCollaborationModel />} />
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
      <Route path="/community/*" element={<Communities />} />
      {communitiesOrder.map((communi, idx) => (
        <React.Fragment key={communi.id}>
          <Route path={"/community/" + communi.link} element={<Communities commIdx={idx} />} />

          {fullname && emailVerified === "Verified" && (
            <Route
              path={"/paperTest/" + communi.link}
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
      {fullname && email && emailVerified === "Verified" ? (
        <>
          {duringAnExperiment ? (
            <>
              {startedByResearcher ? (
                <Route path="Activities/*" element={<App />} />
              ) : (
                <Route path="Activities/*" element={<WaitingForSessionStart />} />
              )}
            </>
          ) : (
            <>
              <>
                <Route
                  path="Activities/*"
                  element={
                    !notAResearcher ? (
                      <Activities activityName="Intellectual" />
                    ) : startedSession === 1 ? (
                      <div className="Error">
                        At this point, you cannot change your scheduled sessions! Please convey your questions or
                        concerns to Iman Yeckehzaare at oneweb@umich.edu
                      </div>
                    ) : (
                      <SchedulePage />
                    )
                  }
                />

                <Route
                  path="Activities/Experiments"
                  element={
                    !notAResearcher ? (
                      <Activities activityName="Experiments" />
                    ) : startedSession === 1 ? (
                      <div className="Error">
                        At this point, you cannot change your scheduled sessions! Please convey your questions or
                        concerns to Iman Yeckehzaare at oneweb@umich.edu
                      </div>
                    ) : (
                      <SchedulePage />
                    )
                  }
                />
                <Route path="Activities/AddInstructor" element={<Activities activityName="AddInstructor" />} />
                <Route path="Activities/AddAdministrator" element={<Activities activityName="AddAdministrator" />} />
                <Route path="Activities/RecallForIman" element={<Activities activityName="RecallForIman" />} />
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
              </>
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
        </>
      )}
    </Routes>
  );
};

export default AppRouter;
