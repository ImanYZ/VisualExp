import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import { firebaseState, fullnameState } from "./store/AuthAtoms";
import {
  phaseState,
  stepState,
  passageState,
  conditionState,
  nullPassageState,
  choicesState,
  secondSessionState,
  thirdSessionState,
} from "./store/ExperimentAtoms";

import PassageLeft from "./Components/Passage/PassageLeft";
import PassageRight from "./Components/Passage/PassageRight";
import NullPassageInstructions from "./Components/Passage/NullPassageInstructions";
import PostQuestionsPage from "./Components/Passage/PostQuestionsPage";
import FreeRecallPage from "./Components/Passage/FreeRecallPage";
// import ConceptMapping from "./Components/ConceptMapping/ConceptMapping";
// import ConceptMappingInput from "./Components/ConceptMapping/ConceptMappingInput";
import PersonalInfo from "./Components/PersonalInfo/PersonalInfo";

import { tokenize, textCosineSimilarity } from "./utils/CosineSimilarity";
import Array2CSV from "./utils/Array2CSV";

import "./App.css";

{
  // const changeQuestions = async () => {
  //   const passagesDocs = await firebase.db.collection("passages").get();
  //   for (let passageDoc of passagesDocs.docs) {
  //     const passageData = passageDoc.data();
  //     const passageRef = firebase.db.collection("passages").doc(passageDoc.id);
  //     if ("question" in passageData) {
  //       await passageRef.update({
  //         questions: passageData.question,
  //         question: firebase.firestore.FieldValue.delete(),
  //       });
  //     }
  //   }
  // };
  // const recalculateFreeRecall = async () => {
  //   const usersDocs = await firebase.db.collection("users").get();
  //   for (let userDoc of usersDocs.docs) {
  //     const userData = userDoc.data();
  //     const pConditions = userData.pConditions;
  //     for (let pCondIdx = 0; pCondIdx < pConditions.length; pCondIdx++) {
  //       const pCond = pConditions[pCondIdx];
  //       const reText = pCond.recallreText;
  //       const passage = pCond.passage;
  //       const passageDoc = await firebase.db
  //         .collection("passages")
  //         .doc(passage)
  //         .get();
  //       const passageData = passageDoc.data();
  //       const text = passageData.text;
  //       let score = 0;
  //       const mainText = tokenize(text.toLowerCase());
  //       const recalledText = tokenize(reText.toLowerCase());
  //       for (let t1 of mainText) {
  //         if (recalledText.includes(t1)) {
  //           score += 1;
  //         }
  //       }
  //       pConditions[pCondIdx] = {
  //         ...pConditions[pCondIdx],
  //         recallScore: score,
  //         recallScoreRatio: score / mainText.length,
  //       };
  //       const userRef = firebase.db.collection("users").doc(userDoc.id);
  //       await userRef.update({
  //         pConditions,
  //       });
  //     }
  //   }
  // };
  // const arraysEqual = (arr1, arr2) => {
  //   if (arr1.length !== arr2.length) {
  //     return false;
  //   }
  //   for (let idx = 0; idx < arr1.length; idx++) {
  //     if (arr1[idx] !== arr2[idx]) {
  //       return false;
  //     }
  //   }
  //   return true;
  // };
  // const initialCMap = [
  //   { from: "Sea", link: "is", to: "A body of water" },
  //   { from: "Different fishes", link: "swim in", to: "Sea" },
  //   { from: "Different fishes", link: "live in", to: "A body of water" },
  //   { from: "", link: "", to: "" },
  // ];
}

const postQuestions = [
  {
    stem: "Comparing the two knowledge representation formats you went through, which one do you think was easier to read?",
    a: "Passage 1",
    b: "Passage 2",
    c: "Both",
    d: "Neither",
  },
  {
    stem: "Which of the knowledge representation formats do you find helpful for your academic learning?",
    a: "Passage 1",
    b: "Passage 2",
    c: "Both",
    d: "Neither",
  },
];

const App = () => {
  const firebase = useRecoilValue(firebaseState);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [phase, setPhase] = useRecoilState(phaseState);
  const [step, setStep] = useRecoilState(stepState);
  const [passage, setPassage] = useRecoilState(passageState);
  const [condition, setCondition] = useRecoilState(conditionState);
  const [nullPassage, setNullPassage] = useRecoilState(nullPassageState);
  const [choices, setChoices] = useRecoilState(choicesState);
  const [secondSession, setSecondSession] = useRecoilState(secondSessionState);
  const [thirdSession, setThirdSession] = useRecoilState(thirdSessionState);

  const [passageTitle, setPassageTitle] = useState("");
  const [pConURL, setPConURL] = useState("");
  const [nullPConURL, setNullPConURL] = useState("");
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(5 * 60);
  const [reText, setReText] = useState("");
  // const [cMap, setCMap] = useState(initialCMap);
  // const [fromOptions, setFromOptions] = useState([]);
  // const [linkOptions, setLinkOptions] = useState([]);
  // const [toOptions, setToOptions] = useState([]);
  const [explanations, setExplanations] = useState(["", ""]);
  const [birthDate, setBirthDate] = useState(null);
  const [major, setMajor] = useState({
    Major: "Information Sciences",
    Major_Category: "Computers & Mathematics",
  });
  const [education, setEducation] = useState("");
  const [language, setLanguage] = useState("English");
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState([]);
  const [genderOtherValue, setGenderOtherValue] = useState("");
  const [ethnicityOtherValue, setEthnicityOtherValue] = useState("");
  const [error, setError] = useState("");
  const [scores, setScores] = useState([]);

  const educationChange = (event) => {
    setEducation(event.target.value);
  };

  const languageChange = (event) => {
    setLanguage(event.target.value);
  };

  const genderChange = (event) => {
    setGender(event.target.value);
  };

  const ethnicityChange = (event) => {
    setEthnicity(event.target.value);
  };

  const onGenderOtherValueChange = (event) =>
    setGenderOtherValue(event.target.value);

  const onEthnicityOtherValueChange = (event) =>
    setEthnicityOtherValue(event.target.value);

  useEffect(() => {
    if (ethnicity.length === 0) {
      setError("Ethnicities");
    } else if (!birthDate) {
      setError("Birth date");
    } else if (!education) {
      setError("Education");
    } else if (!gender) {
      setError("Gender");
    } else {
      setError("");
    }
  }, [ethnicity, birthDate, education, gender]);

  const resetChoices = () => {
    setCurrentQIdx(0);
    const initChoices = new Array(10).fill("");
    setChoices(initChoices);
    return initChoices;
  };

  const setUserStep = async (userRef, userUpdates, newStep) => {
    await userRef.update({
      ...userUpdates,
      step: newStep,
    });
    const userLogRef = firebase.db.collection("userLogs").doc();
    await userLogRef.set({
      ...userUpdates,
      step: newStep,
      id: userRef.id,
      updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
    });
    setStep(newStep);
  };

  const submitAnswers = async (
    currentTime,
    timeSpent,
    userRef,
    userData,
    userUpdates,
    newStep
  ) => {
    const pConditions = userData.pConditions;
    if (step === 1) {
      pConditions[phase] = {
        ...pConditions[phase],
        previewEnded: currentTime,
        previewTime: timeSpent,
      };
    } else {
      let testName = "pretest";
      if (step === 3) {
        testName = "test";
      } else if (step === 13 || step === 16) {
        if (secondSession) {
          testName = "test3Days";
        } else if (thirdSession) {
          testName = "test1Week";
        }
      }
      let score = 0;
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        if (questions[qIdx].answer === choices[qIdx]) {
          score += 1;
        }
      }
      pConditions[phase] = {
        ...pConditions[phase],
        [testName]: choices,
        [testName + "Score"]: score,
        [testName + "ScoreRatio"]: score / questions.length,
        [testName + "Ended"]: currentTime,
        [testName + "Time"]: timeSpent,
      };
    }
    await setUserStep(
      userRef,
      { ...userUpdates, pConditions, choices: resetChoices() },
      newStep
    );
  };

  {
    // const submitCMap = async (currentTime, timeSpent, userRef, userData) => {
    //   const passageDoc = await firebase.db
    //     .collection("passages")
    //     .doc(passage)
    //     .get();
    //   const passageData = passageDoc.data();
    //   const conMap = passageData.cMap;
    //   const pConditions = userData.pConditions;
    //   let score = 0;
    //   for (let cRow of cMap) {
    //     for (let conRow of conMap) {
    //       const tCFrom = tokenize(cRow.from);
    //       const tConFrom = tokenize(conRow.from);
    //       if (arraysEqual(tCFrom, tConFrom)) {
    //         const tCTo = tokenize(cRow.to);
    //         const tConTo = tokenize(conRow.to);
    //         if (arraysEqual(tCTo, tConTo)) {
    //           score += 1;
    //         }
    //       }
    //     }
    //   }
    //   pConditions[phase] = {
    //     ...pConditions[phase],
    //     cMap,
    //     cMapScore: score,
    //     cMapScoreRatio: score / conMap.length,
    //     cMapEnded: currentTime,
    //     cMapTime: timeSpent,
    //   };
    //   await userRef.update({
    //     pConditions,
    //   });
    // };
  }

  const submitFreeRecall = async (
    currentTime,
    timeSpent,
    userRef,
    userData,
    userUpdates,
    newStep
  ) => {
    const passageDoc = await firebase.db
      .collection("passages")
      .doc(passage)
      .get();
    const passageData = passageDoc.data();
    const keywords = passageData.keywords.join(" ");
    const text = passageData.text;
    const pConditions = userData.pConditions;
    let score = 0;
    const keywordsText = tokenize(keywords.toLowerCase());
    const mainText = tokenize(text.toLowerCase());
    const recalledText = tokenize(reText.toLowerCase());
    for (let t1 of keywordsText) {
      if (recalledText.includes(t1)) {
        score += 1;
      }
    }
    let prefieldName = "recall";
    if (step > 10) {
      if (secondSession) {
        prefieldName = "recall3Days";
      } else if (thirdSession) {
        prefieldName = "recall1Week";
      }
    }
    pConditions[phase] = {
      ...pConditions[phase],
      [prefieldName + "reText"]: reText,
      [prefieldName + "Score"]: score,
      [prefieldName + "ScoreRatio"]: score / keywordsText.length,
      [prefieldName + "CosineSim"]: textCosineSimilarity(
        mainText,
        recalledText
      ),
      [prefieldName + "Ended"]: currentTime,
      [prefieldName + "Time"]: timeSpent,
    };
    await setUserStep(
      userRef,
      { ...userUpdates, pConditions, choices: resetChoices() },
      newStep
    );
  };

  useEffect(() => {
    const setAllScores = async () => {
      const userDoc = await firebase.db.collection("users").doc(fullname).get();
      const userData = userDoc.data();
      const pConditions = userData.pConditions;
      const tempScores = [];
      for (let pNum = 0; pNum < 2; pNum++) {
        const passageDoc = await firebase.db
          .collection("passages")
          .doc(pConditions[pNum].passage)
          .get();
        const passageData = passageDoc.data();
        tempScores.push({
          title: passageData.title,
          questionsNum: passageData.questions.length,
          pretestScore: pConditions[pNum].pretestScore,
          pretestScoreRatio: pConditions[pNum].pretestScoreRatio,
          testScore: pConditions[pNum].testScore,
          testScoreRatio: pConditions[pNum].testScoreRatio,
          test3DaysScore: pConditions[pNum].test3DaysScore,
          test3DaysScoreRatio: pConditions[pNum].test3DaysScoreRatio,
          test1WeekScore: pConditions[pNum].test1WeekScore,
          test1WeekScoreRatio: pConditions[pNum].test1WeekScoreRatio,
          recallScore: pConditions[pNum].recallScore,
          recallScoreRatio: pConditions[pNum].recallScoreRatio,
          recall3DaysScore: pConditions[pNum].recall3DaysScore,
          recall3DaysScoreRatio: pConditions[pNum].recall3DaysScoreRatio,
          recall1WeekScore: pConditions[pNum].recall1WeekScore,
          recall1WeekScoreRatio: pConditions[pNum].recall1WeekScoreRatio,
          keywordsLen: passageData.keywords.length,
        });
      }
      setScores(tempScores);
    };
    if (fullname && step > 16 && step !== 20 && scores.length === 0) {
      setAllScores();
    }
  }, [firebase, fullname, step, scores]);

  const convertChoices = (pConditions) => {
    let choice1 = pConditions[0].condition;
    if (choices[0] === "b") {
      choice1 = pConditions[1].condition;
    } else if (choices[0] === "c") {
      choice1 = "Both";
    } else if (choices[0] === "d") {
      choice1 = "Neither";
    }
    let choice2 = pConditions[0].condition;
    if (choices[1] === "b") {
      choice2 = pConditions[1].condition;
    } else if (choices[1] === "c") {
      choice2 = "Both";
    } else if (choices[1] === "d") {
      choice2 = "Neither";
    }
    return { choice1, choice2 };
  };

  const nextStep = async () => {
    const currentTime = firebase.firestore.Timestamp.fromDate(new Date());
    let userRef,
      userDoc,
      userData,
      pConditions,
      choice1,
      choice2,
      newStep,
      userUpdates;
    if (fullname) {
      userRef = firebase.db.collection("users").doc(fullname);
      userDoc = await userRef.get();
      userData = userDoc.data();
      pConditions = userData.pConditions;
    }
    switch (step) {
      case 0:
        userUpdates = {};
        if (phase === 1) {
          userUpdates = {
            cond2Start: currentTime,
          };
        }
        setTimer(5 * 60);
        await setUserStep(userRef, userUpdates, 1);
        break;
      case 1:
        if (phase === 0) {
          newStep = 1.5;
        } else {
          newStep = 2;
        }
        await submitAnswers(
          currentTime,
          5 * 60 - timer,
          userRef,
          userData,
          {},
          newStep
        );
        setTimer(5 * 60);
        break;
      case 1.5:
        setTimer(5 * 60);
        await setUserStep(userRef, {}, 2);
        break;
      case 2:
        await submitAnswers(
          currentTime,
          5 * 60 - timer,
          userRef,
          userData,
          {},
          3
        );
        setTimer(15 * 60);
        break;
      case 3:
        userUpdates = {};
        if (phase === 0) {
          userUpdates = {
            phase: 1,
            currentPCon: {
              passage: pConditions[1].passage,
              condition: pConditions[1].condition,
            },
          };
          newStep = 0;
        } else {
          newStep = 4;
        }
        await submitAnswers(
          currentTime,
          15 * 60 - timer,
          userRef,
          userData,
          userUpdates,
          newStep
        );
        if (phase === 0) {
          setPhase(1);
          setPassage(pConditions[1].passage);
          setCondition(pConditions[1].condition);
        }
        setTimer(15 * 60);
        break;
      case 4:
        setTimer(30 * 60);
        await setUserStep(userRef, { postQsStart: currentTime }, 5);
        break;
      case 5:
        pConditions[0] = {
          ...pConditions[0],
          recallStart: currentTime,
        };
        ({ choice1, choice2 } = convertChoices(pConditions));
        await setUserStep(
          userRef,
          {
            phase: 0,
            postQsEnded: currentTime,
            postQ1Choice: choice1,
            postQ2Choice: choice2,
            explanations,
            pConditions,
            currentPCon: {
              passage: pConditions[0].passage,
              condition: pConditions[0].condition,
            },
            choices: resetChoices(),
          },
          6
        );
        setPhase(0);
        setPassage(pConditions[0].passage);
        setTimer(5 * 60);
        break;
      case 6:
        await submitFreeRecall(
          currentTime,
          5 * 60 - timer,
          userRef,
          userData,
          {},
          7
        );
        setTimer(15 * 60);
        break;
      case 7:
        setTimer(5 * 60);
        setPhase(1);
        await setUserStep(
          userRef,
          {
            phase: 1,
            currentPCon: {
              passage: pConditions[1].passage,
              condition: pConditions[1].condition,
            },
            choices: resetChoices(),
          },
          8
        );
        setPassage(pConditions[1].passage);
        setReText("");
        break;
      case 8:
        await submitFreeRecall(
          currentTime,
          5 * 60 - timer,
          userRef,
          userData,
          {
            demoQsStart: currentTime,
          },
          9
        );
        setTimer(30 * 60);
        break;
      case 9:
        const ethnicityArray = ethnicity.includes("Not listed (Please specify)")
          ? [...ethnicity, ethnicityOtherValue]
          : ethnicity;
        if (ethnicity.length === 0) {
          setError("Ethnicities");
        } else if (!birthDate) {
          setError("Birth date");
        } else if (!education) {
          setError("Education");
        } else if (!gender) {
          setError("Gender");
        } else {
          await setUserStep(
            userRef,
            {
              birthDate,
              education,
              language,
              gender:
                gender === "Not listed (Please specify)"
                  ? genderOtherValue
                  : gender,
              ethnicity: ethnicityArray,
              major: major.Major,
              demoQsEnded: currentTime,
            },
            10
          );
          setTimer(30 * 60);
        }
        break;
      case 11:
        if (secondSession) {
          pConditions[0] = {
            ...pConditions[0],
            recall3DaysStart: currentTime,
          };
        } else if (thirdSession) {
          pConditions[0] = {
            ...pConditions[0],
            recall1WeekStart: currentTime,
          };
        }
        await setUserStep(
          userRef,
          {
            pConditions,
          },
          12
        );
        setTimer(5 * 60);
        break;
      case 12:
        await submitFreeRecall(
          currentTime,
          5 * 60 - timer,
          userRef,
          userData,
          {},
          13
        );
        setTimer(5 * 60);
        break;
      case 13:
        await submitAnswers(
          currentTime,
          5 * 60 - timer,
          userRef,
          userData,
          {
            phase: 1,
            currentPCon: {
              passage: pConditions[1].passage,
              condition: pConditions[1].condition,
            },
          },
          14
        );
        setTimer(15 * 60);
        setPhase(1);
        setPassage(pConditions[1].passage);
        setReText("");
        break;
      case 14:
        if (secondSession) {
          pConditions[1] = {
            ...pConditions[1],
            recall3DaysStart: currentTime,
          };
        } else if (thirdSession) {
          pConditions[1] = {
            ...pConditions[1],
            recall1WeekStart: currentTime,
          };
        }
        await setUserStep(
          userRef,
          {
            pConditions,
          },
          15
        );
        setTimer(5 * 60);
        break;
      case 15:
        await submitFreeRecall(
          currentTime,
          5 * 60 - timer,
          userRef,
          userData,
          {},
          16
        );
        setTimer(5 * 60);
        break;
      case 16:
        await submitAnswers(
          currentTime,
          5 * 60 - timer,
          userRef,
          userData,
          {
            phase: 0,
            currentPCon: {
              passage: pConditions[0].passage,
              condition: pConditions[0].condition,
            },
          },
          secondSession ? 19 : 17
        );
        setTimer(30 * 60);
        setPhase(0);
        setPassage(pConditions[0].passage);
        setCondition(pConditions[0].condition);
        break;
      case 17:
        await setUserStep(
          userRef,
          {
            phase: 1,
            currentPCon: {
              passage: pConditions[1].passage,
              condition: pConditions[1].condition,
            },
          },
          18
        );
        setTimer(30 * 60);
        setPhase(1);
        setPassage(pConditions[1].passage);
        setCondition(pConditions[1].condition);
        break;
      case 18:
        userUpdates = {};
        if (secondSession) {
          userUpdates = {
            post3DaysQsStart: currentTime,
          };
        } else if (thirdSession) {
          userUpdates = {
            post1WeekQsStart: currentTime,
          };
        }
        await setUserStep(
          userRef,
          {
            ...userUpdates,
            choices: resetChoices(),
          },
          19
        );
        setExplanations(["", ""]);
        setTimer(30 * 60);
        break;
      case 19:
        ({ choice1, choice2 } = convertChoices(pConditions));
        userUpdates = {};
        if (secondSession) {
          userUpdates = {
            post3DaysQsEnded: currentTime,
            post3DaysQ1Choice: choice1,
            post3DaysQ2Choice: choice2,
            explanations3Days: explanations,
          };
        } else if (thirdSession) {
          userUpdates = {
            post1WeekQsEnded: currentTime,
            post1WeekQ1Choice: choice1,
            post1WeekQ2Choice: choice2,
            explanations1Week: explanations,
            projectDone: true,
          };
        }
        setTimer(30 * 60);
        await setUserStep(userRef, userUpdates, 20);
        break;
    }
  };

  useEffect(() => {
    const setUserStatus = () => {
      if (secondSession || thirdSession) {
        setTimeout(async () => {
          const userDoc = await firebase.db
            .collection("users")
            .doc(fullname)
            .get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            if (
              (userData.gender && userData.step < 11) ||
              (thirdSession && userData.step === 20 && !userData.projectDone)
            ) {
              setPhase(0);
              setStep(11);
              const pConditions = userData.pConditions;
              setPassage(pConditions[0].passage);
              setCondition(pConditions[0].condition);
            }
            setTimer(10 * 60);
          }
        }, 1000);
      }
    };
    if (fullname) {
      setUserStatus();
    }
  }, [fullname, secondSession, thirdSession]);

  useEffect(() => {
    if (step !== 0 || phase === 1) {
      const timerTimeout = setTimeout(() => {
        if (timer <= 1) {
          nextStep();
        } else {
          setTimer(timer - 1);
        }
      }, 1000);
      return () => {
        clearTimeout(timerTimeout);
      };
    }
  }, [phase, step, timer]);

  useEffect(() => {
    const pConURLSetter = async () => {
      if (fullname && passage && condition) {
        const passageDoc = await firebase.db
          .collection("passages")
          .doc(passage)
          .get();
        const passageData = passageDoc.data();
        setPassageTitle(passageData.title);
        setPConURL(passageData["link" + condition]);
        setQuestions(passageData.questions);
        setCurrentQIdx(0);
        // const fromOps = [""];
        // const linkOps = [""];
        // const toOps = [""];
        // for (let cRow of passageData.cMap) {
        //   fromOps.push(cRow.from);
        //   linkOps.push(cRow.link);
        //   toOps.push(cRow.to);
        // }
        // fromOps.sort();
        // linkOps.sort();
        // toOps.sort();
        // setFromOptions(fromOps);
        // setLinkOptions(linkOps);
        // setToOptions(toOps);
      }
      if (fullname && nullPassage && condition) {
        const passageDoc = await firebase.db
          .collection("passages")
          .doc(nullPassage)
          .get();
        const passageData = passageDoc.data();
        setNullPConURL(passageData["link" + condition]);
      }
    };
    pConURLSetter();
  }, [fullname, passage, nullPassage, condition]);

  let minutes = Math.floor(timer / 60);
  let seconds = timer - minutes * 60;
  minutes = minutes.toString();
  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }
  seconds = seconds.toString();
  if (seconds.length === 1) {
    seconds = "0" + seconds;
  }

  const changePConURL = () => {
    let tempURL;
    if (step === 3) {
      tempURL = pConURL;
      setPConURL(" ");
      setTimeout(() => {
        setPConURL(tempURL);
      }, 400);
    } else {
      tempURL = nullPConURL;
      setNullPConURL(" ");
      setTimeout(() => {
        setNullPConURL(tempURL);
      }, 400);
    }
  };

  return (
    fullname &&
    passage &&
    condition &&
    (pConURL || step > 10) && (
      // <div id={"App" + (![6, 8].includes(step) ? "70" : "50")}>
      <div id="App70">
        {![5, 6, 8, 9, 12, 15, 19].includes(step) ? (
          <PassageLeft
            pConURL={[3, 17, 18].includes(step) ? pConURL : nullPConURL}
          />
        ) : [5, 19].includes(step) ? (
          <PostQuestionsPage
            setCurrentQIdx={setCurrentQIdx}
            currentQIdx={currentQIdx}
            questions={postQuestions}
            nextStep={nextStep}
            explanations={explanations}
            setExplanations={setExplanations}
          />
        ) : [6, 8, 12, 15].includes(step) ? (
          // <ConceptMapping cMap={cMap} />
          <FreeRecallPage
            reText={reText}
            setReText={setReText}
            passageTitle={passageTitle}
          />
        ) : step === 9 ? (
          <PersonalInfo
            onGenderOtherValueChange={onGenderOtherValueChange}
            genderOtherValue={genderOtherValue}
            onEthnicityOtherValueChange={onEthnicityOtherValueChange}
            ethnicityOtherValue={ethnicityOtherValue}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            major={major}
            setMajor={setMajor}
            education={education}
            language={language}
            gender={gender}
            ethnicity={ethnicity}
            educationChange={educationChange}
            languageChange={languageChange}
            genderChange={genderChange}
            ethnicityChange={ethnicityChange}
          />
        ) : null}
        {step === 1 ? (
          <NullPassageInstructions
            condition={condition}
            setStep={setStep}
            minutes={minutes}
            seconds={seconds}
            changePConURL={changePConURL}
            nextStep={nextStep}
          />
        ) : (
          <PassageRight
            currentQIdx={currentQIdx}
            setCurrentQIdx={setCurrentQIdx}
            questions={questions}
            reText={reText}
            minutes={minutes}
            seconds={seconds}
            passageTitle={passageTitle}
            changePConURL={changePConURL}
            nextStep={nextStep}
            error={error}
            scores={scores}
          />
        )}
      </div>
    )
  );
};

export default App;
