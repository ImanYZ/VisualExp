import React, { useState, useEffect } from "react";
import moment from "moment";
import { useRecoilValue, useRecoilState } from "recoil";

import { firebaseState, fullnameState } from "./store/AuthAtoms";
import {
  phaseState,
  stepState,
  passageState,
  conditionState,
  nullPassageState,
  choicesState,
  startedSessionState
} from "./store/ExperimentAtoms";

import PassageLeft from "./Components/Passage/PassageLeft";
import PassageRight from "./Components/Passage/PassageRight";
import NullPassageInstructions from "./Components/Passage/NullPassageInstructions";
import PostQuestionsPage from "./Components/Passage/PostQuestionsPage";
import FreeRecallPage from "./Components/Passage/FreeRecallPage";
// import ConceptMapping from "./Components/ConceptMapping/ConceptMapping";
// import ConceptMappingInput from "./Components/ConceptMapping/ConceptMappingInput";
import PersonalInfo from "./Components/PersonalInfo/PersonalInfo";

import { tokenize, textCosineSimilarity } from "./utils";

import "./App.css";
import { toOrdinal } from "number-to-words";

const postQuestions = [
  {
    stem: "Comparing the two knowledge representation formats you went through, which one do you think was easier to read?",
    a: "Passage 1",
    b: "Passage 2",
    c: "Both",
    d: "Neither"
  },
  {
    stem: "Which of the knowledge representation formats do you find helpful for your academic learning?",
    a: "Passage 1",
    b: "Passage 2",
    c: "Both",
    d: "Neither"
  },
  {
    stem: "Which type of question did you prefer to enter your feedback?",
    a: "Open-ended free text",
    b: "Choosing/entering the options"
  }
];

const App = () => {
  const firebase = useRecoilValue(firebaseState);
  // eslint-disable-next-line no-unused-vars
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [phase, setPhase] = useRecoilState(phaseState);
  const [step, setStep] = useRecoilState(stepState);
  const [passage, setPassage] = useRecoilState(passageState);
  const [condition, setCondition] = useRecoilState(conditionState);
  // eslint-disable-next-line no-unused-vars
  const [nullPassage, setNullPassage] = useRecoilState(nullPassageState);
  const [choices, setChoices] = useRecoilState(choicesState);
  // eslint-disable-next-line no-unused-vars
  const [startedSession, setStartedSession] = useRecoilState(startedSessionState);

  const [passageTitle, setPassageTitle] = useState("");
  const [pConURL, setPConURL] = useState("");
  const [nullPConURL, setNullPConURL] = useState("");
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(5 * 60);
  const [reText, setReText] = useState("");

  const [explanations, setExplanations] = useState([
    { explanation: "", codes: [] },
    { explanation: "", codes: [] },
    { choice: "", explanation: "" }
  ]);

  const [birthDate, setBirthDate] = useState(null);
  const [major, setMajor] = useState({
    Major: "Information Sciences",
    Major_Category: "Computers & Mathematics"
  });
  const [education, setEducation] = useState("");
  const [language, setLanguage] = useState("English");
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState([]);
  const [personalityTraits, setPersonalityTraits] = useState({});
  const [genderOtherValue, setGenderOtherValue] = useState("");
  const [ethnicityOtherValue, setEthnicityOtherValue] = useState("");
  const [error, setError] = useState("");
  const [scores, setScores] = useState([]);
  const [answeredPersonalTrait, setAnsweredPersonalTrait] = useState(false);
  const [orderQuestions, setOrderQuestions] = useState([]);

  const educationChange = event => {
    setEducation(event.target.value);
  };

  const languageChange = event => {
    setLanguage(event.target.value);
  };

  const genderChange = event => {
    setGender(event.target.value);
  };

  const ethnicityChange = event => {
    setEthnicity(event.target.value);
  };

  const onGenderOtherValueChange = event => setGenderOtherValue(event.target.value);

  const onEthnicityOtherValueChange = event => setEthnicityOtherValue(event.target.value);

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
      step: newStep
    });
    const userLogRef = firebase.db.collection("userLogs").doc();
    await userLogRef.set({
      ...userUpdates,
      step: newStep,
      id: userRef.id,
      updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
    });
    setStep(newStep);
  };

  const submitAnswers = async (currentTime, timeSpent, userRef, userData, userUpdates, newStep) => {
    const pConditions = userData.pConditions;
    if (step === 1) {
      pConditions[phase] = {
        ...pConditions[phase],
        previewEnded: currentTime,
        previewTime: timeSpent
      };
    } else {
      let testName = "pretest";
      if (step === 3) {
        testName = "test";
      } else if (step === 13 || step === 16) {
        if (startedSession === 2) {
          testName = "test3Days";
        } else if (startedSession === 3) {
          testName = "test1Week";
        }
      }
      let score = 0;
      let originalChoicesOrder = [];
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        originalChoicesOrder.push(choices[orderQuestions.indexOf(questions[qIdx])] || "");
        if (questions[qIdx].answer === choices[orderQuestions.indexOf(questions[qIdx])]) {
          score += 1;
        }
      }

      pConditions[phase] = {
        ...pConditions[phase],
        [testName]: originalChoicesOrder,
        [testName + "Score"]: score,
        [testName + "ScoreRatio"]: score / questions.length,
        [testName + "Ended"]: currentTime,
        [testName + "Time"]: timeSpent
      };
    }
    await setUserStep(userRef, { ...userUpdates, pConditions, choices: resetChoices() }, newStep);
  };

  const submitFreeRecall = async (currentTime, timeSpent, userRef, userData, userUpdates, newStep) => {
    debugger ; 
    let passageDoc = await firebase.db.collection("passages").doc(passage).get();
    let passageData = passageDoc.data();
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
      if (startedSession === 2) {
        prefieldName = "recall3Days";
      } else if (startedSession === 3) {
        prefieldName = "recall1Week";
      }
    }
    pConditions[phase] = {
      ...pConditions[phase],
      [prefieldName + "reText"]: reText,
      [prefieldName + "Score"]: score,
      [prefieldName + "ScoreRatio"]: score / keywordsText.length,
      [prefieldName + "CosineSim"]: textCosineSimilarity(mainText, recalledText),
      [prefieldName + "Ended"]: currentTime,
      [prefieldName + "Time"]: timeSpent
    };

    userData = {
      ...userData,
      ...userUpdates,
      pConditions
    };
    userUpdates = {
      ...userUpdates,
      pConditions
    };

    const session = toOrdinal(startedSession); // 1st, 2nd, 3rd
    // new logic create recall grades v2 document
    const recallGrades = await firebase.db
      .collection("recallGradesV2")
      .where("user", "==", fullname)
      .where("project", "==", userData.project)
      .get();
    let recallGradeRef = firebase.db.collection("recallGradesV2").doc();
    let recallGradeData = {
      sessions: {
        [session]: []
      },
      done: false,
      createdAt: new Date(),
      project: userData.project,
      user: fullname
    };
    if (recallGrades.docs.length) {
      recallGradeRef = firebase.db.collection("recallGradesV2").doc(recallGrades.docs[0].id);
      recallGradeData = recallGrades.docs[0].data();
    }

    for (let index = 0; index < userData.pConditions.length; ++index) {
      const pCond = userData.pConditions[index];
      passageDoc = await firebase.db.collection("passages").doc(pCond.passage).get();
      passageData = passageDoc.data();

      let responseName = "recallreText";
      if (session === "2nd") {
        responseName = "recall3DaysreText";
      } else if (session === "3rd") {
        responseName = "recall1WeekreText";
      }

      const filtered = (pCond[responseName] || "").split(" ").filter(w => w.trim());

      if (filtered.length <= 2) {
        let recallResponse;
        switch (session) {
          case "1st":
            recallResponse = "recallreGrade";
            break;
          case "2nd":
            recallResponse = "recall3DaysreGrade";
            break;
          case "3rd":
            recallResponse = "recall1WeekreGrade";
            break;
          default:
          // code block
        }
        userUpdates.pConditions[index][recallResponse] = 0;
        continue;
      }

      // finding pCondition item if exists
      recallGradeData.sessions[session] = recallGradeData.sessions[session] || [];
      let conditionIdx = recallGradeData.sessions[session].findIndex(
        conditionItem => conditionItem.condition === pCond.condition
      );
      if (conditionIdx === -1) {
        conditionIdx = recallGradeData.sessions[session].length;
        recallGradeData.sessions[session].push({
          phrases: [],
          passage: pCond.passage,
          condition: pCond.condition,
          response: pCond[responseName],
          researchers: [],
          viewers: [],
          done: false
        });
      }
      const conditionItem = recallGradeData.sessions[session][conditionIdx];
      const existingPhrases = conditionItem.phrases.map(phrase => phrase.phrase);
      for (let phrase of passageData.phrases) {
        if (existingPhrases.includes(phrase)) continue; // we will not replace or duplicate phrase for each passage
        conditionItem.phrases.push({
          phrase,
          grades: [],
          researchers: []
        });
      }

      // marking as not done when new session/condition added
      if (recallGradeData.done) {
        recallGradeData.done = false;
      }
    }

    await firebase.batchSet(recallGradeRef, recallGradeData);

    await firebase.commitBatch();

    await setUserStep(userRef, { ...userUpdates, pConditions, choices: resetChoices() }, newStep);
  };

  const submitFeedbackCode = async (currentTime, timeSpent, userRef, userData, userUpdates, newStep) => {
    const session = toOrdinal(startedSession);
    const pConditions = userData.pConditions || [];
    const { choice1, choice2 } = convertChoices(pConditions);
    if (startedSession === 1) {
      userUpdates = {
        phase: 0,
        postQsEnded: currentTime,
        postQ1Choice: choice1,
        postQ2Choice: choice2,
        explanations,
        pConditions,
        currentPCon: {
          passage: pConditions[0].passage,
          condition: pConditions[0].condition
        },
        choices: resetChoices()
      };
    } else if (startedSession === 2) {
      userUpdates = {
        post3DaysQsEnded: currentTime,
        post3DaysQ1Choice: choice1,
        post3DaysQ2Choice: choice2,
        explanations3Days: explanations
      };
    } else if (startedSession === 3) {
      userUpdates = {
        post1WeekQsEnded: currentTime,
        post1WeekQ1Choice: choice1,
        post1WeekQ2Choice: choice2,
        explanations1Week: explanations,
        projectDone: true
      };
    }
    userData = {
      ...userData,
      ...userUpdates,
      pConditions
    };
    const scheduleMonth = moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD");
    let researcher = "";
    const resSchedules = await firebase.db
      .collection("resSchedule")
      .where("month", "==", scheduleMonth)
      .where("project", "==", userData.project)
      .get();
    // detecting researcher's name
    if (resSchedules.docs.length) {
      const resSchedule = resSchedules.docs[0];
      const resScheduleData = resSchedule.data();
      const scheduled = resScheduleData.scheduled || {};
      for (const _researcher in scheduled) {
        const participants = Object.keys(scheduled[_researcher] || {});
        if (participants.includes(fullname)) {
          // this will help us during testing App.js flow
          if (!researcher) {
            researcher = _researcher;
          }
          const currentDate = moment().utcOffset(-4).format("YYYY-MM-DD");
          const scheduledDate = moment(scheduled[_researcher][fullname][0]).utcOffset(-4, true).format("YYYY-MM-DD");
          if (currentDate === scheduledDate) {
            researcher = _researcher;
            break;
          }
        }
      }
    }

    // Only in the third session, after making sure that the user has submitted
    // all the recall responses for all their passages in all the three
    // sessions, we create all the corresponding recallGrades documents for this
    // user

    const feedbackCodeBooksdocs = await firebase.db.collection("feedbackCodeBooks").where("approved", "==", true).get();
    const approvedCodes = new Set();
    let codesVotes = {};
    for (let feedbackCodeBooksDoc of feedbackCodeBooksdocs.docs) {
      const data = feedbackCodeBooksDoc.data();
      if (!approvedCodes.has(data.code)) {
        codesVotes[data.code] = [];
        approvedCodes.add(data.code);
      }
    }
    let explan;
    switch (session) {
      case "1st":
        explan = "explanations";
        break;
      case "2nd":
        explan = "explanations3Days";
        break;
      case "3rd":
        explan = "explanations1Week";
        break;
      default:
      // code block
    }

    let codeIds = [];
    
    for (let index of [0, 1]) {
      if (userData[explan] && userData[explan][index] !== "") {
        let choice;

        let response;
        if (explan === "explanations") {
          if (index === 0) {
            choice = "postQ1Choice";
          } else {
            choice = "postQ2Choice";
          }
        } else if (explan === "explanations3Days") {
          if (index === 0) {
            choice = "post3DaysQ1Choice";
          } else {
            choice = "post3DaysQ2Choice";
          }
        } else if (explan === "explanations1Week") {
          if (index === 0) {
            choice = "post1WeekQ1Choice";
          } else {
            choice = "post1WeekQ2Choice";
          }
        }
        response = userData[explan][index].explanation || "";
        const filtered = response.split(" ").filter(w => w.trim());
        if (filtered.length > 4) {
          const newFeedbackDdoc = {
            approved: false,
            codersChoices: {},
            coders: [],
            choice: userData[choice],
            project: userData.project,
            fullname: fullname,
            session: session,
            explanation: response,
            createdAt: new Date(),
            expIdx: index,
            codesVotes,
            updatedAt: new Date()
          };
          const feedbackCodeRef = firebase.db.collection("feedbackCode").doc();

          // updating feedback code order
          if (researcher) {
            codeIds.push(feedbackCodeRef.id);
          }

          await firebase.batchSet(feedbackCodeRef, newFeedbackDdoc);
        }
      }
    }

    if(codeIds.length) {
      const feedbackCodeOrders = await firebase.db
        .collection("feedbackCodeOrderV2")
        .where("project", "==", userData.project)
        .where("researcher", "==", researcher)
        .get();
      if (feedbackCodeOrders.docs.length) {
        const _codeIds = feedbackCodeOrders.docs[0].data()?.codeIds || [];
        codeIds = Array.from(new Set([...codeIds, ..._codeIds]));
        const feedbackOrderRef = firebase.db.collection("feedbackCodeOrderV2").doc(feedbackCodeOrders.docs[0].id);
        await firebase.batchUpdate(feedbackOrderRef, {
          codeIds,
          updatedAt: new Date()
        });
      } else {
        await firebase.batchSet(firebase.db.collection("feedbackCodeOrderV2").doc(), {
          project: userData.project,
          researcher,
          codeIds,
          createdAt: new Date()
        });
      }
    }

  
    await firebase.commitBatch();
    pConditions[0] = {
      ...pConditions[0],
      recallStart: currentTime
    };

    await setUserStep(userRef, userUpdates, newStep);
  };
  useEffect(() => {
    const setAllScores = async () => {
      const userDoc = await firebase.db.collection("users").doc(fullname).get();
      const userData = userDoc.data();
      const pConditions = userData.pConditions;
      const tempScores = [];
      for (let pNum = 0; pNum < 2; pNum++) {
        const passageDoc = await firebase.db.collection("passages").doc(pConditions[pNum].passage).get();
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
          keywordsLen: passageData.keywords.length
        });
      }
      setScores(tempScores);
    };
    if (fullname && step > 16 && step !== 20 && scores.length === 0) {
      setAllScores();
    }
  }, [firebase, fullname, step, scores]);

  const convertChoices = pConditions => {
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
    let userRef, userDoc, userData, pConditions, newStep, userUpdates;
    if (fullname) {
      userRef = firebase.db.collection("users").doc(fullname);
      userDoc = await userRef.get();
      userData = userDoc.data();
      pConditions = userData.pConditions;
    }
    // eslint-disable-next-line default-case
    switch (step) {
      case 0:
        userUpdates = {};
        if (phase === 1) {
          userUpdates = {
            cond2Start: currentTime
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
        await submitAnswers(currentTime, 5 * 60 - timer, userRef, userData, {}, newStep);
        setTimer(5 * 60);
        break;
      case 1.5:
        setTimer(5 * 60);
        await setUserStep(userRef, {}, 2);
        break;
      case 2:
        await submitAnswers(currentTime, 5 * 60 - timer, userRef, userData, {}, 3);
        setTimer(15 * 60);
        break;
      case 3:
        // if a pCondition do not have "testScore" field,
        // and it's condition is not equal to the current condition that means
        // the participant has not gone through that paragraph.
        const pendingPConIndex = pConditions.findIndex(pCon => !("testScore" in pCon) && pCon.condition !== condition);
        const pendingPCon = pConditions[pendingPConIndex];
        userUpdates = {};
        if (pendingPCon) {
          userUpdates = {
            phase: pendingPConIndex,
            currentPCon: {
              passage: pendingPCon.passage,
              condition: pendingPCon.condition
            }
          };
          newStep = 0;
        } else {
          newStep = 4;
        }
        await submitAnswers(currentTime, 15 * 60 - timer, userRef, userData, userUpdates, newStep);
        if (pendingPCon) {
          setPhase(1);
          setPassage(pendingPCon.passage);
          setCondition(pendingPCon.condition);
        }
        setTimer(15 * 60);
        break;
      case 4:
        setTimer(30 * 60);
        await setUserStep(userRef, { postQsStart: currentTime ,explanations }, 5);
        break;
      case 5:
        await submitFeedbackCode(currentTime, 5 * 60 - timer, userRef, userData, {}, 6);
        setPhase(0);
        setPassage(pConditions[0].passage);
        setTimer(5 * 60);
        break;
      case 6:
        await submitFreeRecall(currentTime, 5 * 60 - timer, userRef, userData, {}, 7);
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
              condition: pConditions[1].condition
            },
            choices: resetChoices()
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
            demoQsStart: currentTime
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
              personalityTraits,
              gender: gender === "Not listed (Please specify)" ? genderOtherValue : gender,
              ethnicity: ethnicityArray,
              major: major.Major,
              demoQsEnded: currentTime
            },
            10
          );
          setTimer(30 * 60);
        }
        break;
      case 11:
        if (startedSession === 2) {
          pConditions[0] = {
            ...pConditions[0],
            recall3DaysStart: currentTime
          };
        } else if (startedSession === 3) {
          pConditions[0] = {
            ...pConditions[0],
            recall1WeekStart: currentTime
          };
        }
        await setUserStep(
          userRef,
          {
            pConditions
          },
          12
        );
        setTimer(5 * 60);
        break;
      case 12:
        await submitFreeRecall(currentTime, 5 * 60 - timer, userRef, userData, {}, 13);
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
              condition: pConditions[1].condition
            }
          },
          14
        );
        setTimer(15 * 60);
        setPhase(1);
        setPassage(pConditions[1].passage);
        setReText("");
        break;
      case 14:
        if (startedSession === 2) {
          pConditions[1] = {
            ...pConditions[1],
            recall3DaysStart: currentTime
          };
        } else if (startedSession === 3) {
          pConditions[1] = {
            ...pConditions[1],
            recall1WeekStart: currentTime
          };
        }
        await setUserStep(
          userRef,
          {
            pConditions
          },
          15
        );
        setTimer(5 * 60);
        break;
      case 15:
        await submitFreeRecall(currentTime, 5 * 60 - timer, userRef, userData, {}, 16);
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
              condition: pConditions[0].condition
            }
          },
          startedSession === 2 ? 19 : 17
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
              condition: pConditions[1].condition
            }
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
        const { choice1, choice2 } = convertChoices(pConditions);
        if (startedSession === 1) {
          userUpdates = {
            phase: 0,
            postQsEnded: currentTime,
            postQ1Choice: choice1,
            postQ2Choice: choice2,
            explanations,
            pConditions,
            currentPCon: {
              passage: pConditions[0].passage,
              condition: pConditions[0].condition
            },
            choices: resetChoices()
          };
        } else if (startedSession === 2) {
          userUpdates = {
            post3DaysQsEnded: currentTime,
            post3DaysQ1Choice: choice1,
            post3DaysQ2Choice: choice2,
            explanations3Days: explanations
          };
        } else if (startedSession === 3) {
          userUpdates = {
            post1WeekQsEnded: currentTime,
            post1WeekQ1Choice: choice1,
            post1WeekQ2Choice: choice2,
            explanations1Week: explanations,
            projectDone: true
          };
        }
        await setUserStep(
          userRef,
          {
            ...userUpdates,
            choices: resetChoices()
          },
          19
        );
        setExplanations([
          { explanation: "", codes: [] },
          { explanation: "", codes: [] },
          { choice: "", explanation: "" }
        ]);
        setTimer(30 * 60);
        break;
      case 19:
        await submitFeedbackCode(currentTime, 5 * 60 - timer, userRef, userData, {}, 20);
        setTimer(30 * 60);
        break;
    }
  };

  useEffect(() => {
    const setUserStatus = () => {
      if (startedSession === 2 || startedSession === 3) {
        setTimeout(async () => {
          const userDoc = await firebase.db.collection("users").doc(fullname).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            if (
              (userData.gender && userData.step < 11) ||
              (startedSession === 3 && userData.step === 20 && !userData.projectDone)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullname, startedSession]);

  useEffect(() => {
    if (![0, 5, 19].includes(step)) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step, timer]);

  useEffect(() => {
    const pConURLSetter = async () => {
      if (fullname && passage && condition) {
        const passageDoc = await firebase.db.collection("passages").doc(passage).get();
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
        const passageDoc = await firebase.db.collection("passages").doc(nullPassage).get();
        const passageData = passageDoc.data();
        setNullPConURL(passageData["link" + condition]);
      }
    };
    pConURLSetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <PassageLeft pConURL={[3, 17, 18].includes(step) ? pConURL : nullPConURL} />
        ) : [5, 19].includes(step) ? (
          <PostQuestionsPage
            setCurrentQIdx={setCurrentQIdx}
            currentQIdx={currentQIdx}
            questions={postQuestions}
            nextStep={nextStep}
            explanations={explanations}
            setExplanations={setExplanations}
            step={step}
          />
        ) : [6, 8, 12, 15].includes(step) ? (
          // <ConceptMapping cMap={cMap} />
          <FreeRecallPage reText={reText} setReText={setReText} passageTitle={passageTitle} />
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
            setPersonalityTraits={setPersonalityTraits}
            setAnsweredPersonalTrait={setAnsweredPersonalTrait}
            answeredPersonalTrait={answeredPersonalTrait}
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
            setOrderQuestions={setOrderQuestions}
            reText={reText}
            minutes={minutes}
            seconds={seconds}
            passageTitle={passageTitle}
            changePConURL={changePConURL}
            nextStep={nextStep}
            error={error}
            scores={scores}
            answeredPersonalTrait={answeredPersonalTrait}
          />
        )}
      </div>
    )
  );
};

export default App;
