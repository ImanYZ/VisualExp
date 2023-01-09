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
  const [recallGradeIdx, setRecallGradeIdx] = useState(0);
  const [passages, setPassages] = useState({});

  const [notSatisfiedRecallGrades, setNotSatisfiedRecallGrades] = useState([]);
  const [retrieveNext, setRetrieveNext] = useState(0);

  const [lastRetreivedDocument, setLastRetreivedDocument] = useState(null);
  const [lastRetreivedDocumentAutoGrading, setRetreivedDocumentAutoGrading] = useState("");
  const [allowNextBatch, setAllowNextBatch] = useState(false);

  const [originalBatchOf, setOriginalBatchOf] = useState([]);

  const [response, setResponse] = useState("");

  const [viewedRecalllDocument, setViewedRecalllDocument] = useState([]);

  const [showTheSchemaGen, setShowTheSchemaGen] = useState(false);
  const QuerySearching = schemaEp => {
    const text = firstBatchOfRecallGrades[0]?.data.response;
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
    const _newBatchRecallGrades = [];
    const _notSatisfiedRecallGrades = [];
    for (let recallGrade of originalBatchOf) {
      if (booleanHashMap.hasOwnProperty(recallGrade.data.phrase)) {
        const schemaE = booleanHashMap[recallGrade.data.phrase][0].schema;
        if (QuerySearching(schemaE)) {
          _newBatchRecallGrades.push(recallGrade);
        } else {
          _notSatisfiedRecallGrades.push(recallGrade);
        }
      }
    }

    if (firstBatchOfRecallGrades[0]?.data.response !== response) {
      setResponse(firstBatchOfRecallGrades[0]?.data.response);
      const shuffledRecallGrades = _notSatisfiedRecallGrades.sort(() => 0.5 - Math.random());
      const randomRecallGrades = shuffledRecallGrades.slice(0, 4);
      const newBatchRecallGrades = _newBatchRecallGrades.concat(randomRecallGrades);
      setNotSatisfiedRecallGrades(_notSatisfiedRecallGrades);
      setFirstBatchOfRecallGrades(newBatchRecallGrades.sort(() => 0.5 - Math.random()));
    }
  };

  useEffect(() => {
    if (!passageData.title) return;
    if (!firstBatchOfRecallGrades) return;
    searchAnyBooleanExpression();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passageData, firstBatchOfRecallGrades]);

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

      let sessionNums = Object.keys(recallGradeData.sessions)
        .map((sessionKey) => parseInt(sessionKey.replace(/[^0-9]+/g, "")));
      sessionNums.sort((a, b) => a < b ? -1 : 1);

      for(const sessionNum of sessionNums) {
        for(const conditionItem of recallGradeData.sessions[toOrdinal(sessionNum)]) {
          const filtered = (conditionItem.response || "").replace(/[\.,]/g, " ").split(" ").filter(w => w.trim());
          if (
            recallGradeData.user !== fullname &&
            !conditionItem.researchers.includes(fullname) &&
            !conditionItem.viewers.includes(fullname) &&
            filtered.length > 2
          ) {
            _recallGrades.push({
              docId: recallGradeDoc.id,
              session: toOrdinal(sessionNum),
              ...conditionItem
            }); 
          }
        }
      }

      setRecallGrades(_recallGrades);
      setRecallGradeIdx(0);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const recallGradesLogsDoc = await firebase.db.collection("recallGradesLogs").doc(fullname).get();
    if (recallGradesLogsDoc.exists) {
      const recallGradesLogsData = recallGradesLogsDoc.data();
      if (recallGradesLogsData.hasOwnProperty("wrongRecallGrades") && recallGradesLogsData.wrongRecallGrades.length) {
        // setNotSatisfiedRecallGrades(recallGradesLogsData.wrongRecallGrades);
        // setFirstBatchOfRecallGrades(recallGradesLogsData.firstBatchOfRecallGrades);
        // setShowTheSchemaGen(true);
      }
    }
  }, []);

  useEffect(() => {
    loadedRecallGrades();
  }, []);

  useEffect(() => {
    (async () => {
      const passageId = recallGrades[recallGradeIdx].passage;
      if(!passages[passageId]) {
        const passageDoc = await firebase.db.collection("passages").doc(passageId).get();
        setPassages((passages) => {
          return {...passages, [passageId]: passageDoc.data() }
        })
      }
    })()
  }, [passages, recallGrades, recallGradeIdx]);

  useEffect(() => {
    let firstBatch = [];

    const retrieveFreeRecallResponse = async () => {
      // recallGrades collection is huge and it's extremely inefficient to
      // search through it if all the docs for all projects are in the same
      // collection. Also, when querying them to find the appropriate doc to
      // show the authenticated researcher to grade, we cannot combine the
      // where clause on the project and the researchersNum < 4. As a
      // solution, we separated the collections per project, other than the
      // H2K2 project that we have already populated the data in and it's very
      // costly to rename.
      /* while (firstBatch.length === 0) {
        firstBatch = await loadedRecallGrades();
      } */

      const passageDoc = await firebase.db.collection("passages").doc(firstBatch[0].data.passage).get();

      setPassageData(passageDoc.data());
      setOriginalBatchOf(firstBatch);
      setFirstBatchOfRecallGrades(firstBatch);
      setViewedRecalllDocument(firstBatch);
      setSubmitting(false);
      // ASA we find five free-recall phrases for a particular response
      // we set this flag to true to stop searching.
      return null;
    };
    if (firebase && !notAResearcher && project) {
      retrieveFreeRecallResponse();
      searchAnyBooleanExpression();
    }

    // cleanup function
    return () => retrieveFreeRecallResponse();
    // Every time the value of retrieveNext changes, retrieveFreeRecallResponse
    // should be called regardless of its value.
  }, [firebase, fullname, notAResearcher, project, retrieveNext]);

  // Clicking the Yes or No buttons would trigger this function. grade can be
  // either true, meaning the researcher responded Yes, or false if they
  // responded No.
  const gradeIt = async newBatch => {
    let firstBatch;
    if (newBatch.length) {
      firstBatch = newBatch;
    } else {
      firstBatch = firstBatchOfRecallGrades;
    }
    setSubmitting(true);
    try {
      const phrasesWithGrades = firstBatch.map(recall => ({
        phrase: recall.data.phrase,
        grade: recall.grade
      }));
      const userData = (await firebase.db.collection("users").doc(`${firstBatch[0].data.user}`).get()).data();
      let passageIdx = userData.pConditions.findIndex(pCon => pCon.passage === firstBatch[0].data.passage);
      const freeRecallGradeBulkData = {
        fullname,
        project: firstBatch[0].data.project,
        phraseNum: passageData?.phrases?.length,
        user: firstBatch[0].data.user,
        passageId: firstBatch[0].data.passage,
        passageIdx,
        condition: firstBatch[0].data.condition,
        phrasesWithGrades,
        session: firstBatch[0].data.session,
        response: firstBatch[0].data.response,
        voterProject: project,
        viewedRecalllDocument
      };

      await firebase.idToken();
      await axios.post("/bulkGradeFreeRecall", freeRecallGradeBulkData);
      setSubmitting(false);
      // Increment retrieveNext to get the next free-recall response to grade.
      setRetrieveNext(oldValue => oldValue + 1);
      setSnackbarMessage("You successfully submitted your evaluation!");
      setOriginalBatchOf([]);
      setFirstBatchOfRecallGrades([]);
      setShowTheSchemaGen(false);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Your evaluation is NOT submitted! Please try again. If the issue persists, contact Iman!");
    }
  };

  const handleGradeChange = index => {
    const grades = [...firstBatchOfRecallGrades];
    grades[index].grade = !firstBatchOfRecallGrades[index].grade;
    setFirstBatchOfRecallGrades(grades);
  };

  const handleSubmit = () => {
    const notSatisfiedRecalls = [];
    for (let recallGrade of firstBatchOfRecallGrades) {
      if (recallGrade.grade && notSatisfiedRecallGrades.includes(recallGrade)) {
        notSatisfiedRecalls.push(recallGrade);
      }
    }

    if (notSatisfiedRecalls.length) {
      setShowTheSchemaGen(true);
    } else {
      gradeIt([]);
    }
  };

  if (showTheSchemaGen)
    return (
      <SchemaGenRecalls
        firstBatchOfRecallGrades={firstBatchOfRecallGrades}
        notSatisfiedRecallGrades={notSatisfiedRecallGrades}
        gradeIt={gradeIt}
      />
    );

  return !firstBatchOfRecallGrades || !firstBatchOfRecallGrades.length ? (
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
          {firstBatchOfRecallGrades[0]?.data.response}
        </Paper>
        <p>
          2- Identify whether this participant has mentioned the following key phrases from the original passage in
          their free-recall response, and then submit your answers:
        </p>

        {firstBatchOfRecallGrades?.map((row, index) => (
          <div key={index}>
            <Paper sx={{ p: "4px 19px 4px 19px", m: "4px 19px 6px 19px" }}>
              <Box sx={{ display: "inline", mr: "19px" }}>
                NO
                <Switch checked={row.grade} onChange={() => handleGradeChange(index)} color="secondary" />
                YES
              </Box>
              <Box sx={{ display: "inline" }}>{row.data.phrase}</Box>
            </Paper>
          </div>
        ))}
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
          {passageData.text}
        </Paper>
      </Paper>
      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </div>
  );
};

export default withRoot(FreeRecallGrading);
