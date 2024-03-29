import React, { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { Typography } from "@mui/material";
import { database } from "../../firebase/realtimedatabase.js";
import { ref, onValue, off } from "firebase/database";
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

import { projectState } from "../../../store/ProjectAtoms";
import { hideLeaderBoardState } from "../../../store/ExperimentAtoms";

import SnackbarComp from "../../SnackbarComp";

import SchemaGenRecalls from "../SchemaGeneration/SchemaGenRecalls";
import { fetchRecentParticipants } from "../../../utils/researcher";

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

// When the paper gets loaded and every time the researcher submits their
// answer, we should retrive the next free-recall response for them to
// evaluate. This states helps us signal the useEffect to invoke
// retrieveFreeRecallResponse.
// We need to set these states to identify which phrase is assigned to which
// participant's free-recall response by which researcher, ... to be able to
// assign these values to the corresponding recallGrades document when
// submitting the researcher's evaluation of this phrase in this free-recall
// response.

const FreeRecallGrading = props => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);

  const gptResearcher = "Iman YeckehZaare";
  const [submitting, setSubmitting] = useState(true);
  const [processing, setProcessing] = useState(true);

  const [errorProcessing, setErrorProcessing] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [notSatisfiedSelections, setNotSatisfiedSelections] = useState([]);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [showTheSchemaGen, setShowTheSchemaGen] = useState(false);
  const setHideLeaderBoard = useSetRecoilState(hideLeaderBoardState);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [recallGradesList, setRecallGradesList] = useState([]);

  const loadedRecallGrades = async () => {
    try {
      setProcessing(true);
      setSubmitting(false);
      setErrorProcessing(false);
      const recentParticipants = await fetchRecentParticipants(fullname, project);
      setRecentParticipants(recentParticipants);
      await firebase.idToken();
      let response = await axios.post("/researchers/loadRecallGrades", { project });
      let _recallGrade = response.data.recallgrades[0];
      setRecallGradesList(response.data.recallgrades);
      setSelectedGrade(_recallGrade || null);
      setSubmitting(false);
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      setErrorProcessing(true);
      console.log(error);
    }
  };
  const getMajority = (phrase, upvotes, downvotes) => {
    if (phrase.hasOwnProperty("majority")) {
      return phrase.majority ? "YES" : "NO";
    }
    if (upvotes < 3 && downvotes < 3) return null;

    return upvotes > downvotes ? "YES" : "NO";
  };
  useEffect(() => {
    // Retrieve a free-recall response that doesn't have the majority

    if (firebase && fullname && project) {
      return loadedRecallGrades();
    }
  }, [firebase, fullname, project]);

  const getNextRecall = async () => {
    const recallIdx = (recallGradesList || []).findIndex(
      r =>
        r.docId === selectedGrade?.docId &&
        r.session === selectedGrade?.session &&
        r.conditionIdx === selectedGrade?.conditionIdx
    );
    if (recallIdx !== -1 && recallIdx < recallGradesList.length - 1) {
      const newRecall = recallGradesList[recallIdx + 1];
      setSelectedGrade(newRecall);
    } else {
      setSelectedGrade(null);
      await loadedRecallGrades();
    }
  };

  const handleNext = () => {
    getNextRecall();
  };
  useEffect(() => {
    if (!recallGradesList.length || processing) return;
    for (let recall of recallGradesList) {
      const dataRef = ref(
        database,
        `recallGradesV2/${recall.docId}/sessions/${recall.session}/${recall.conditionIdx}/phrases`
      );

      onValue(dataRef, snapshot => {
        const data = snapshot.val();
        if (data && data.length > 0) {
          recall.phrases = recall.phrases.filter(p => {
            const phraseIdx = data.findIndex(_p => p.phrase === _p.phrase);
            const upVotes = (p.grades || []).filter(grade => grade).length;
            const downVotes = (p.grades || []).filter(grade => !grade).length;
            return (
              (data[phraseIdx].researchers || []).length < 4 &&
              !(data[phraseIdx].researchers || []).includes(fullname) &&
              !getMajority(p, upVotes, downVotes)
            );
          });
          setRecallGradesList(recallGradesList => {
            const _recallGradesList = [...recallGradesList];
            const recallIdx = _recallGradesList.findIndex(
              r => r.docId === recall.docId && r.session === recall.session && r.conditionIdx === recall.conditionIdx
            );
            if (
              selectedGrade?.docId !== recall.docId ||
              selectedGrade?.session !== recall.session ||
              selectedGrade?.conditionIdx !== recall.conditionIdx
            ) {
              if (recallIdx !== -1) {
                if (recall.phrases.length === 0) {
                  _recallGradesList.splice(recallIdx, 1);
                } else {
                  _recallGradesList[recallIdx] = recall;
                }
              }
            }
            return _recallGradesList;
          });
          if (
            selectedGrade &&
            selectedGrade.docId === recall.docId &&
            selectedGrade.session === recall.session &&
            selectedGrade.conditionIdx === recall.conditionIdx &&
            recall.phrases.length === 0
          ) {
            getNextRecall();
          }
          setSelectedGrade(r => {
            if (
              r &&
              r.docId === recall.docId &&
              r.session === recall.session &&
              r.conditionIdx === recall.conditionIdx
            ) {
              return recall;
            }
            return r;
          });
        }
      });
    }
    return () => {
      for (let recall of recallGradesList) {
        const dataRef = ref(
          database,
          `recallGradesV2/${recall.docId}/sessions/${recall.session}/${recall.conditionIdx}/phrases`
        );
        off(dataRef); // Assuming off is a function to remove the listener, adjust accordingly
      }
    };
  }, [processing]);

  // Clicking the Yes or No buttons would trigger this function. grade can be
  // either true, meaning the researcher responded Yes, or false if they
  // responded No.
  const gradeIt = async notSatisfiedSelections => {
    if (notSatisfiedSelections?.length) {
      notSatisfiedSelections.forEach(p => {
        const index = selectedGrade.phrases.findIndex(_p => _p.phrase === p.phrase);
        if (index !== -1) {
          selectedGrade.phrases[index].grades = p.grades;
        }
      });
    }
    setSubmitting(true);
    try {
      const postData = {
        recallGrade: selectedGrade,
        voterProject: project
      };

      await firebase.idToken();
      await axios.post("/researchers/gradeRecalls", postData);
      // Increment retrieveNext to get the next free-recall response to grade.
      const recallIdx = recallGradesList.findIndex(
        r =>
          r.docId === selectedGrade.docId &&
          r.session === selectedGrade.session &&
          r.conditionIdx === selectedGrade.conditionIdx
      );
      if (recallIdx < recallGradesList.length - 1) {
        const newRecall = recallGradesList[recallIdx + 1];
        setSelectedGrade(newRecall);
        setSubmitting(false);
      } else {
        await loadedRecallGrades();
        setSelectedGrade(null);
      }

      setSnackbarMessage("You successfully submitted your evaluation!");
      setShowTheSchemaGen(false);
      setHideLeaderBoard(false);
    } catch (err) {
      setHideLeaderBoard(false);
      setShowTheSchemaGen(false);
      setSubmitting(false);
      console.error(err);
      setSnackbarMessage("Your evaluation is NOT submitted! Please try again. If the issue persists, contact Iman!");
    }
  };
  const handleGradeChange = index => {
    setSelectedGrade(prevSelectedGrade => {
      const newSelectedGrade = { ...prevSelectedGrade };
      const newPhrases = [...newSelectedGrade.phrases];

      const phrase = { ...newPhrases[index] };
      const researchers = [...(phrase.researchers || [])];
      const grades = [...(phrase.grades || [])];

      const researcherIdx = researchers.indexOf(fullname);

      if (researcherIdx !== -1) {
        grades[researcherIdx] = !grades[researcherIdx];
      } else {
        researchers.push(fullname);
        grades.push(true);
      }

      phrase.researchers = researchers;
      phrase.grades = grades;

      newPhrases[index] = phrase;
      newSelectedGrade.phrases = newPhrases;

      return newSelectedGrade;
    });
  };

  const handleSubmit = () => {
    const phrases = [...(selectedGrade?.phrases || [])];
    const notSatisfiedSelections = phrases.filter(_p => {
      const researchers = _p.researchers || [];
      const researcherIdx = researchers.indexOf(fullname);

      const grades = _p.grades || [];
      const grade = !!grades[researcherIdx];
      const notSatisfiedIdx = selectedGrade.notSatisfiedphrases.findIndex(p => p.phrase === _p.phrase);
      return grade && notSatisfiedIdx > 0;
    });
    setNotSatisfiedSelections(notSatisfiedSelections);

    if (notSatisfiedSelections.length > 0) {
      setShowTheSchemaGen(true);
      setHideLeaderBoard(true);
    } else {
      gradeIt([]);
    }
  };

  if (processing && !selectedGrade) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <CircularProgress />
        <br />
        <Typography sx={{ mt: "5px" }}> Loading...</Typography>
      </Box>
    );
  }

  if (showTheSchemaGen && fullname !== gptResearcher)
    return (
      <SchemaGenRecalls
        recallGrade={selectedGrade}
        notSatisfiedSelections={notSatisfiedSelections}
        setNotSatisfiedSelections={setNotSatisfiedSelections}
        gradeIt={gradeIt}
        selectedPassageId={selectedGrade?.passage}
        projectParticipant={selectedGrade?.project}
      />
    );

  if (!selectedGrade && !processing) {
    return (
      <Box>
        {/* {errorProcessing ? ( */}
        <Alert severity="error" size="large">
          <AlertTitle>Error</AlertTitle>
          There was an issue processing your request; please try to refresh the page or contact Iman to solve the bug.
        </Alert>
        {/* ) : (
          <Alert severity="info" size="large">
            <AlertTitle>Info</AlertTitle>
            You've graded all the recalls from participants
          </Alert>
        )} */}
      </Box>
    );
  }

  return (
    <Box id="FreeRecallGrading">
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
      {Object.keys(recentParticipants).includes(selectedGrade?.user) &&
      recentParticipants[selectedGrade?.user].includes(selectedGrade.session) ? (
        <Alert
          severity="error"
          sx={{
            color: "rgb(95, 33, 32)",
            background: "rgb(253, 237, 237)",
            marginTop: "10px"
          }}
        >
          <ul>
            <li>
              <b>{selectedGrade.user}</b> is the last participant in one of your experiement sessions.
            </li>
            <li>you will not receive points for running that session until you grade this participant's responses.</li>
          </ul>
        </Alert>
      ) : (
        <span />
      )}
      <Paper style={{ paddingBottom: "19px" }}>
        <p>1- Carefully read this free-recall response:</p>
        <Paper
          style={{
            position: "sticky",
            top: "0",
            backgroundColor: "#e0e0e0",
            zIndex: "1",
            padding: "10px 19px 10px 19px",
            margin: "19px"
          }}
          id="recall-response"
        >
          {selectedGrade?.response}
        </Paper>
        <p>
          2- Identify whether this participant has mentioned the following key phrases from the original passage in
          their free-recall response, and then submit your answers:
        </p>

        {(selectedGrade.phrases || []).map((phrase, index) => {
          const researcherIdx = (phrase?.researchers || []).indexOf(fullname);
          const grade = !!(phrase?.grades || [])[researcherIdx];
          return (
            <div key={index}>
              <Paper sx={{ p: "4px 19px 4px 19px", m: "4px 19px 6px 19px" }} className="recall-phrase">
                <Box sx={{ display: "inline", mr: "19px" }}>
                  NO
                  <Switch checked={grade} onChange={() => handleGradeChange(index)} color="secondary" />
                  YES
                </Box>
                <Box sx={{ display: "inline" }}>{phrase?.phrase}</Box>
              </Paper>
            </div>
          );
        })}
        {selectedGrade?.phrases.length > 0 ? (
          <Button
            onClick={handleSubmit}
            className="Button"
            variant="contained"
            color="success"
            disabled={submitting || !(selectedGrade?.phrases || []).length}
            id="recall-submit"
          >
            {submitting ? <CircularProgress color="warning" size="16px" /> : "SUBMIT"}
          </Button>
        ) : (
          <Button onClick={handleNext} className="Button" variant="contained" color="success">
            Next
          </Button>
        )}
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
          id="recall-passage"
          style={{
            padding: "10px 19px 10px 19px",
            margin: "19px 19px 70px 19px"
          }}
        >
          {selectedGrade?.originalText || ""}
        </Paper>
      </Paper>
      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </Box>
  );
};

export default withRoot(FreeRecallGrading);
