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
import { useNavigate } from "react-router-dom";
import withRoot from "../../Home/modules/withRoot";

import { firebaseState, fullnameState, isAdminState } from "../../../store/AuthAtoms";

import { projectState, notAResearcherState } from "../../../store/ProjectAtoms";

import SnackbarComp from "../../SnackbarComp";
import { Navigate } from "react-router-dom";

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
  const isAdmin = useRecoilValue(isAdminState);
  const project = useRecoilValue(projectState);
  const navigateTo = useNavigate();
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
  const [retrieveNext, setRetrieveNext] = useState(0);

  const [lastRetreivedDocument, setLastRetreivedDocument] = useState("");
  const [lastRetreivedDocumentAutoGrading, setRetreivedDocumentAutoGrading] = useState("");
  const [allowNextBatch, setAllowNextBatch] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Retrieve a free-recall response that is not evaluated by four
  // researchers yet.
  const loadedRecallGrades = async () => {
    let lastVisibleRecallGradesDoc;
    let lastVisibleRecallGradesDocAutoGrading;
    let recallGradeDocs;
    let collName = "recallGrades";
    if (project !== "H2K2" && project !== "Autograding") {
      collName += project;
    }
    if (lastRetreivedDocument === "" || !allowNextBatch) {
      let recallGradeDocsInitial = await firebase.db
        .collection(collName)
        .where("done", "==", false)
        .orderBy("passage")
        .orderBy("user")
        .orderBy("session")
        .limit(1)
        .get();
      lastVisibleRecallGradesDoc = recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];
      setLastRetreivedDocument(lastVisibleRecallGradesDoc);
    } else {
      lastVisibleRecallGradesDoc = lastRetreivedDocument;
    }
    if (lastVisibleRecallGradesDoc) {
      recallGradeDocs = await firebase.db
        .collection(collName)
        .where("done", "==", false)
        .orderBy("passage")
        .orderBy("user")
        .orderBy("session")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(1000)
        .get();
      if (allowNextBatch) {
        lastVisibleRecallGradesDoc = recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
        setLastRetreivedDocument(lastVisibleRecallGradesDoc);
        setAllowNextBatch(false);
      }
    } else {
      if (project === "Autograding") {
        if (lastRetreivedDocumentAutoGrading === "" || !allowNextBatch) {
          let recallGradeDocsInitial = await firebase.db
            .collection("recallGradesH1L2")
            .where("done", "==", false)
            .orderBy("passage")
            .orderBy("user")
            .orderBy("session")
            .limit(1)
            .get();
          lastVisibleRecallGradesDocAutoGrading = recallGradeDocsInitial.docs[recallGradeDocsInitial.docs.length - 1];
          setRetreivedDocumentAutoGrading(lastVisibleRecallGradesDoc);
        } else {
          lastVisibleRecallGradesDocAutoGrading = lastRetreivedDocumentAutoGrading;
        }

        if (lastVisibleRecallGradesDocAutoGrading) {
          recallGradeDocs = await firebase.db
            .collection("recallGradesH1L2")
            .where("done", "==", false)
            .orderBy("passage")
            .orderBy("user")
            .orderBy("session")
            .startAfter(lastVisibleRecallGradesDocAutoGrading)
            .limit(1000)
            .get();
          if (allowNextBatch) {
            lastVisibleRecallGradesDocAutoGrading = recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
            setRetreivedDocumentAutoGrading(lastVisibleRecallGradesDocAutoGrading);
            setAllowNextBatch(false);
          }
        }
      }
    }

    const firstBatch = [];
    const lastVisibleRecallGradesData = lastVisibleRecallGradesDoc.data();

    if (lastVisibleRecallGradesData.user !== fullname && !lastVisibleRecallGradesData.researchers.includes(fullname)) {
      firstBatch.push({ data: lastVisibleRecallGradesData, grade: false });
    }
    for (let recallGradeDoc of recallGradeDocs.docs) {
      const recallGradeData = recallGradeDoc.data();
      const filtered = (recallGradeData.response || "").split(" ").filter(w => w.trim());
      if (recallGradeData.user !== fullname && !recallGradeData.researchers.includes(fullname) && filtered.length > 2) {
        if (firstBatch.length > 0 && recallGradeData.response !== firstBatch[0].data.response) {
          break;
        }
        firstBatch.push({ data: recallGradeData, grade: false });
      }
    }
    if (firstBatch.length === 0) {
      setAllowNextBatch(true);
    }
    return firstBatch;
  };

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
      while (firstBatch.length === 0) {
        firstBatch = await loadedRecallGrades();
      }
      const passageDoc = await firebase.db.collection("passages").doc(firstBatch[0].data.passage).get();
      setPassageData(passageDoc.data());
      setFirstBatchOfRecallGrades(firstBatch);
      setSubmitting(false);
      // ASA we find five free-recall phrases for a particular response
      // we set this flag to true to stop searching.
      return null;
    };
    if (firebase && !notAResearcher && project) {
      retrieveFreeRecallResponse();
    }

    // cleanup function
    return () => retrieveFreeRecallResponse();
    // Every time the value of retrieveNext changes, retrieveFreeRecallResponse
    // should be called regardless of its value.
  }, [firebase, fullname, notAResearcher, project, retrieveNext]);

  // Clicking the Yes or No buttons would trigger this function. grade can be
  // either true, meaning the researcher responded Yes, or false if they
  // responded No.
  const gradeIt = async () => {
    setSubmitting(true);
    try {
      const phrasesWithGrades = firstBatchOfRecallGrades.map(recall => ({
        phrase: recall.data.phrase,
        grade: recall.grade
      }));
      const userData = (
        await firebase.db.collection("users").doc(`${firstBatchOfRecallGrades[0].data.user}`).get()
      ).data();
      let passageIdx = userData.pConditions.findIndex(
        pCon => pCon.passage === firstBatchOfRecallGrades[0].data.passage
      );
      const freeRecallGradeBulkData = {
        fullname,
        project: firstBatchOfRecallGrades[0].data.project,
        phraseNum: passageData?.phrases?.length,
        user: firstBatchOfRecallGrades[0].data.user,
        passageId: firstBatchOfRecallGrades[0].data.passage,
        passageIdx,
        condition: firstBatchOfRecallGrades[0].data.condition,
        phrasesWithGrades,
        session: firstBatchOfRecallGrades[0].data.session,
        response: firstBatchOfRecallGrades[0].data.response,
        voterProject: project
      };

      await firebase.idToken();
      await axios.post("/bulkGradeFreeRecall", freeRecallGradeBulkData);
      setSubmitting(false);
      // Increment retrieveNext to get the next free-recall response to grade.
      setRetrieveNext(oldValue => oldValue + 1);
      setSnackbarMessage("You successfully submitted your evaluation!");
      setFirstBatchOfRecallGrades([]);
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

  const openSchemaGeneration = (phrase) => {
    // eslint-disable-next-line no-useless-concat
    window.open("http://localhost:3001/Activities/SchemaGeneration"+'?phrase='+phrase+'&passage='+firstBatchOfRecallGrades[0].data.passage)
  };

  return firstBatchOfRecallGrades.length === 0 ? (
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
              <Button
                onClick={() => {
                  openSchemaGeneration(row.data.phrase);
                }}
                mode="outlined"
                variant="contained"
                sx={{ ml: "13px", backgroundColor: "#ff9100" }}
              >
                Mistakenly Excluded
              </Button>
            </Paper>
          </div>
        ))}
        <Button onClick={gradeIt} className="Button" variant="contained" color="success" disabled={submitting}>
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
