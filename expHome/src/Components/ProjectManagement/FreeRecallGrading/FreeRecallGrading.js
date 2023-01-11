import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";

import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";

import withRoot from "../../Home/modules/withRoot";

import { firebaseState, fullnameState } from "../../../store/AuthAtoms";

import { projectState, notAResearcherState } from "../../../store/ProjectAtoms";

import SnackbarComp from "../../SnackbarComp";

import SchemaGenRecalls from "../SchemaGeneration/SchemaGenRecalls";
import { toOrdinal } from "number-to-words";
import { set } from "lodash";

// Group grading participants' free-recall responses by researchers.
// - Each free-recall response should be compared with every signle key phrase
//   from the original passage, by four researchers.
// - If at least three out of four researchers assign a specific phrase to a
//   free-recall response:
//    - The participant gets the point for that phrase;
//    - The three (or four) researchers who assigned that phrase, each will get
//      a point in our project management system.
// - After assignment of a phrase to a free-recall response is evaluated by four
//   researchers, if a researcher has identified a key phrase in a specific
//   free-recall response, but the other three researchers have not identified
//   the phrase, the former researcher gets a ❌ negative point.
const FreeRecallGrading = props => {
  const firebase = useRecoilValue(firebaseState);
  const notAResearcher = useRecoilValue(notAResearcherState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);

  // When the paper gets loaded and every time the researcher submits their
  // answer, we should retrive the next free-recall response for them to
  // evaluate. This states helps us signal the useEffect to invoke
  // retrieveFreeRecallResponse.
  // We need to set these states to identify which phrase is assigned to which
  // participant's free-recall response by which researcher, ... to be able to
  // assign these values to the corresponding recallGrades document when
  // submitting the researcher's evaluation of this phrase in this free-recall
  // response.
  const [passageData, setPassageData] = useState({});
  // const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [firstBatchOfRecallGrades, setFirstBatchOfRecallGrades] = useState([]);
  const [recallGrades, setRecallGrades] = useState([]);
  const [oRecallGrades, setORecallGrades] = useState([]);
  const [recallGradeIdx, setRecallGradeIdx] = useState(0);
  const [passages, setPassages] = useState({});

  const [notSatisfiedPhrases, setNotSatisfiedPhrases] = useState([]);
  const [notSatisfiedSelections, setNotSatisfiedSelections] = useState([]);
  const [randomizedPhrases, setRandomizedPhrases] = useState([]);
  const [retrieveNext, setRetrieveNext] = useState(0);

  const [lastRetreivedDocument, setLastRetreivedDocument] = useState(null);
  const [lastRetreivedDocumentAutoGrading, setRetreivedDocumentAutoGrading] = useState("");
  const [allowNextBatch, setAllowNextBatch] = useState(false);

  const [originalBatchOf, setOriginalBatchOf] = useState([]);

  const [response, setResponse] = useState("");

  const [viewedRecalllDocument, setViewedRecalllDocument] = useState([]);

  const [showTheSchemaGen, setShowTheSchemaGen] = useState(false);

  const [currentRecallGrade, setCurrentRecallGrade] = useState(null);

  const QuerySearching = schemaEp => {
    const text = recallGrades?.[recallGradeIdx]?.response;
    if (!text) return;
    let keys = {};
    let notKeywords = [];
    for (let schemaE of schemaEp) {
      if (!schemaE.not) {
        let keywords = [...schemaE.alternatives];
        keywords = keywords.filter(x => x && x !== "");
        if (schemaE.keyword !== "") {
          keys[schemaE.keyword] = keywords;
        }
      } else {
        const noKeywords = [...schemaE.alternatives];
        if (schemaE.keyword !== "") {
          noKeywords.push(schemaE.keyword);
        }
        notKeywords = [...notKeywords, ...noKeywords];
      }
    }

    notKeywords = notKeywords.filter(x => x && x !== "");
    let containsWord = true;
    const notContainsWord = notKeywords.some(element => text.toLowerCase().includes(element.toLowerCase()));
    for (let key in keys) {
      const containsKeys = [key, ...keys[key]];
      containsWord = containsKeys.some(element => text.toLowerCase().includes(element.toLowerCase()));
      if (!containsWord) {
        break;
      }
    }
    if (!notContainsWord && containsWord) {
      return true;
    } else {
      return false;
    }
  };

  const searchAnyBooleanExpression = async () => {
    const recallGrade = recallGrades?.[recallGradeIdx];
    const passageData = passages?.[recallGrade?.passage];
    if (!passageData.title) return;
    const booleanScratchDoc = await firebase.db
      .collection("booleanScratch")
      .where("passage", "==", passageData.title)
      .get();
    const booleanHashMap = {};
    for (let booleanDoc of booleanScratchDoc.docs) {
      const booleanData = booleanDoc.data();
      if (booleanHashMap.hasOwnProperty(booleanData.phrase)) {
        booleanHashMap[booleanData.phrase].push(booleanData);
      } else {
        booleanHashMap[booleanData.phrase] = [booleanData];
      }
    }

    const nonSatisfiedPhrases = [];

    const phrases = recallGrade.phrases || [];

    for (let phrase of phrases) {
      if (booleanHashMap.hasOwnProperty(phrase.phrase)) {
        const schemaE = booleanHashMap[phrase.phrase][0].schema;
        if (!QuerySearching(schemaE)) {
          nonSatisfiedPhrases.push(phrase.phrase);
        }
      } else {
        nonSatisfiedPhrases.push(phrase.phrase);
      }
    }

    setNotSatisfiedPhrases(nonSatisfiedPhrases);

    return nonSatisfiedPhrases;
  };

  useEffect(() => {
    (async () => {
      const recallGrade = recallGrades?.[recallGradeIdx];
      const passageData = passages?.[recallGrade?.passage];
      if (passageData?.title) {
        const notSatisfiedPhrases = await searchAnyBooleanExpression();
        let phrases = [...recallGrade.phrases].map((phrase, idx) => ({ ...phrase, index: idx }));
        phrases.sort(() => 0.5 - Math.random());
        let wrongNum = 0;
        console.log(notSatisfiedPhrases.length, phrases.length);
        // pick only 4 wrong phrases
        phrases = phrases.filter(phrase => (notSatisfiedPhrases.includes(phrase.phrase) ? wrongNum++ < 4 : true));
        setRandomizedPhrases(phrases);
      }
    })();
  }, [recallGradeIdx, passages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Retrieve a free-recall response that is not evaluated by four
  // researchers yet.

  const loadedRecallGrades = async () => {
    const recallGrades = await firebase.db
      .collection("recallGradesV2")
      .where("project", "==", project)
      .where("done", "==", false)
      .get();

    const _recallGrades = [];

    for (const recallGradeDoc of recallGrades.docs) {
      const recallGradeData = recallGradeDoc.data();
      if (recallGradeData.researchers.includes(fullname)) continue;
      let sessionNums = Object.keys(recallGradeData.sessions).map(sessionKey =>
        parseInt(sessionKey.replace(/[^0-9]+/g, ""))
      );
      sessionNums.sort((a, b) => (a < b ? -1 : 1));

      for (const sessionNum of sessionNums) {
        if (!sessionNum) continue;
        for (const conditionItem of recallGradeData.sessions[toOrdinal(sessionNum)]) {
          const filtered = (conditionItem.response || "")
            .replace(/[\.,]/g, " ")
            .split(" ")
            .filter(w => w.trim());
          if (
            recallGradeData.user !== fullname &&
            !conditionItem.researchers.includes(fullname) &&
            !conditionItem.viewers.includes(fullname) &&
            filtered.length > 2
          ) {
            _recallGrades.push({
              docId: recallGradeDoc.id,
              session: toOrdinal(sessionNum),
              user: recallGradeData.user,
              ...conditionItem
            });
          }
        }
      }
    }

    setRecallGrades(_recallGrades);
    setORecallGrades(_recallGrades);
    setRecallGradeIdx(0);
    setSubmitting(false);
  };

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(async () => {
  //   const recallGradesLogsDoc = await firebase.db.collection("recallGradesLogs").doc(fullname).get();
  //   if (recallGradesLogsDoc.exists) {
  //     const recallGradesLogsData = recallGradesLogsDoc.data();
  //     if (recallGradesLogsData.hasOwnProperty("wrongRecallGrades") && recallGradesLogsData.wrongRecallGrades.length) {
  //       // setNotSatisfiedRecallGrades(recallGradesLogsData.wrongRecallGrades);
  //       // setFirstBatchOfRecallGrades(recallGradesLogsData.firstBatchOfRecallGrades);
  //       // setShowTheSchemaGen(true);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    if (firebase) {
      loadedRecallGrades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebase]);

  useEffect(() => {
    (async () => {
      const passageId = recallGrades?.[recallGradeIdx]?.passage;
      if (!passages[passageId]) {
        const passageDoc = await firebase.db.collection("passages").doc(passageId).get();
        setPassages(passages => {
          return { ...passages, [passageId]: passageDoc.data() };
        });
      }
    })();
  }, [passages, recallGrades, recallGradeIdx]);

  // Clicking the Yes or No buttons would trigger this function. grade can be
  // either true, meaning the researcher responded Yes, or false if they
  // responded No.
  const gradeIt = async newBatch => {
    console.log("randomizedPhrases",randomizedPhrases);
    const recallGrade = recallGrades?.[recallGradeIdx];
    console.log("before recallGrade ::: ",recallGrade);
    setSubmitting(true);
    console.log("after recallGrade ::: ",recallGrade);
    try {
      const requestData = {
        fullname,
        recallGrade,
        voterProject: project,
        randomizedPhrases,
        notSatisfiedPhrases,
      };
      await firebase.idToken();
      console.log({requestData});
      // await axios.post("/GradeFreeRecall", requestData);
      setSubmitting(false);
      // Increment retrieveNext to get the next free-recall response to grade.
      setRetrieveNext(oldValue => oldValue + 1);
      setSnackbarMessage("You successfully submitted your evaluation!");
      setFirstBatchOfRecallGrades([]);
      setShowTheSchemaGen(false);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Your evaluation is NOT submitted! Please try again. If the issue persists, contact Iman!");
    }
  };

  const handleGradeChange = (index,key) => {
    console.log(key);
    console.log("randomizedPhrases",randomizedPhrases);
    const _randomizedPhrases = [...randomizedPhrases];
    const _recallGrades = [...recallGrades];
    const researchers = [...(_recallGrades[recallGradeIdx].phrases[index].researchers || [])];
    let researcherIdx = researchers.indexOf(fullname);
    if (researcherIdx === -1) {
      researchers.push(fullname);
      researcherIdx = researchers.length - 1;
    }

    const grades = [...(_recallGrades[recallGradeIdx].phrases[index].grades || [])];
    grades[researcherIdx] = !grades[researcherIdx];

    _recallGrades[recallGradeIdx].phrases[index].researchers = researchers;
    _randomizedPhrases[key].researchers = researchers;
    _randomizedPhrases[key].grades = grades;
    _recallGrades[recallGradeIdx].phrases[index].grades = grades;
    _recallGrades[recallGradeIdx].phrases[index].grade = grades[researcherIdx];
    setRandomizedPhrases(_randomizedPhrases);
    // console.log(_randomizedPhrases)
    console.log("recallGrades", _recallGrades);
    setRecallGrades(_recallGrades);
  };

  const handleSubmit = () => {
    let hasNotSatisfiedPhrases = false;
    const recallGrade = recallGrades?.[recallGradeIdx];
    const phrases = [...(recallGrade?.phrases || [])];

    const notSatisfiedSelections = [];

    for (const _phrase of phrases) {
      const researchers = _phrase.researchers || [];
      const researcherIdx = researchers.indexOf(fullname);

      const grades = _phrase.grades || [];
      const grade = !!grades[researcherIdx];

      if (grade && notSatisfiedPhrases.includes(_phrase.phrase)) {
        hasNotSatisfiedPhrases = true;
        notSatisfiedSelections.push(_phrase.phrase);
      }
    }

    setNotSatisfiedSelections(notSatisfiedSelections);

    if (hasNotSatisfiedPhrases) {
      setShowTheSchemaGen(true);
    } else {
      gradeIt([]);
    }
  };

  if (showTheSchemaGen)
    return (
      <SchemaGenRecalls
        recallGrade={recallGrades?.[recallGradeIdx]}
        notSatisfiedPhrases={notSatisfiedSelections}
        gradeIt={gradeIt}
      />
    );

  return !recallGrades || !recallGrades.length ? (
    <Alert severity="info" size="large">
      <AlertTitle>Info</AlertTitle>
      You've graded all the recalls from participants
    </Alert>
  ) : (
    <div id="FreeRecallGrading">
      <Alert severity="success">
        <ul>
          <li>
            Four researchers examine whether each key phrase from a passage is mentioned in each free-recall response.
          </li>
          <li>
            If at least 3 out of 4 researchers identify a specific key phrase in a free-recall response by a
            participant:
            <ul>
              <li>The participant receives a point for recalling that key phrase about the passage.</li>
              <li>Each of those 3 or 4 researchers receives a 0.5 🧠 point towards this research activity.</li>
            </ul>
          </li>
          <li>
            If exactly 3 out of 4 researchers agree on existance (non-existance) of a specific key phrase in a
            free-recall response by a participant, but the 4th researcher opposes their majority of vote, the opposing
            researcher gets a 0.5 ❌ negative point. Note that you don't know the grades that others have cast, but if
            the 3 other researchers give this case a Yes (or No) and you give it a No (or Yes), you'll get a 0.5 ❌
            negative point.
          </li>
        </ul>
      </Alert>
      <Paper style={{ paddingBottom: "19px" }}>
        <p>1- Carefully read this free-recall response:</p>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {recallGrades[recallGradeIdx]?.response}
        </Paper>
        <p>
          2- Identify whether this participant has mentioned the following key phrases from the original passage in
          their free-recall response, and then submit your answers:
        </p>

        {(randomizedPhrases || []).map((row, key) => {
          const phrase = recallGrades[recallGradeIdx].phrases[row.index];

          const researcherIdx = (phrase.researchers || []).indexOf(fullname);
          const grade = researcherIdx !== -1 && phrase.grades[researcherIdx];
          return (
            <div key={key}>
              <Paper sx={{ p: "4px 19px 4px 19px", m: "4px 19px 6px 19px" }}>
                <Box sx={{ display: "inline", mr: "19px" }}>
                  NO
                  <Switch checked={grade} onChange={() => handleGradeChange(row.index,key)} color="secondary" />
                  YES
                </Box>
                <Box sx={{ display: "inline" }}>{phrase.phrase}</Box>
              </Paper>
            </div>
          );
        })}
        <Button onClick={handleSubmit} className="Button" variant="contained" color="success" disabled={submitting}>
          {submitting ? <CircularProgress color="warning" size="16px" /> : "SUBMIT"}
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "19px",
            position: "relative",
            left: "45%"
          }}
        ></div>
        <p>The original passage is:</p>
        <Paper
          style={{
            padding: "10px 19px 10px 19px",
            margin: "19px 19px 70px 19px"
          }}
        >
          {passages?.[recallGrades?.[recallGradeIdx]?.passage]?.text || ""}
        </Paper>
      </Paper>
      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </div>
  );
};

export default withRoot(FreeRecallGrading);
