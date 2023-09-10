import React, { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { Typography } from "@mui/material";

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
  const [processing, setProcessing] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [recallGrades, setRecallGrades] = useState([]);

  const [notSatisfiedSelections, setNotSatisfiedSelections] = useState([]);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [showTheSchemaGen, setShowTheSchemaGen] = useState(false);
  const setHideLeaderBoard = useSetRecoilState(hideLeaderBoardState);
  const [allRecallGrades, setAllRecallGrades] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const loadedRecallGrades = async () => {
    try {
      if (allRecallGrades !== null && !allRecallGrades.hasOwnProperty(project) && project !== "Autograding") {
        setRecallGrades([]);
        setSelectedGrade(null);
        return;
      }

      let tempRecallGrades = allRecallGrades ? allRecallGrades[project] || [] : [];

      if (project === "Autograding") {
        tempRecallGrades = [];
        for (let project in allRecallGrades) {
          tempRecallGrades = tempRecallGrades.concat(tempRecallGrades[project]);
        }
      }

      setProcessing(true);
      const recentParticipants = await fetchRecentParticipants(fullname, project);
      setRecentParticipants(recentParticipants);
      await firebase.idToken();
      let response =
        tempRecallGrades.length === 0
          ? await axios.post("/researchers/loadRecallGrades", { project })
          : { data: allRecallGrades };
      let _recallGrades = response.data;
      setAllRecallGrades(_recallGrades);
      let __recallGrades = [];
      if (project === "Autograding") {
        for (let project in _recallGrades) {
          __recallGrades = __recallGrades.concat(_recallGrades[project]);
        }
      } else {
        __recallGrades = _recallGrades[project] || [];
      }
      if (Object.keys(recentParticipants).length > 0) {
        __recallGrades.sort((g1, g2) => {
          const p1 =
            Object.keys(recentParticipants).includes(g1.user) && recentParticipants[g1?.user].includes(g1.session);
          const p2 =
            Object.keys(recentParticipants).includes(g2.user) && recentParticipants[g2?.user].includes(g2.session);
          if (p1 && p2) return 0;
          return p1 && !p2 ? -1 : 1;
        });
      } else {
        __recallGrades.sort((g1, g2) => (g1.researchers.length > g2.researchers.length ? -1 : 1));
      }
      setRecallGrades(__recallGrades);
      setSelectedGrade(__recallGrades[0] || null);
      setSubmitting(false);
      setProcessing(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    // Retrieve a free-recall response that is not evaluated by four
    // researchers yet.
    if (firebase && fullname && project) {
      return loadedRecallGrades();
    }
  }, [firebase, fullname, project]);

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

      setSubmitting(false);
      // Increment retrieveNext to get the next free-recall response to grade.
      const _recallGrades = [...recallGrades];
      _recallGrades.shift();

      let _allRecallGrades = { ...allRecallGrades };
      const index = _allRecallGrades[selectedGrade.project].findIndex(g => {
        return (
          g.docId === selectedGrade.id && g.session === selectedGrade.session && g.condition === selectedGrade.condition
        );
      });
      _allRecallGrades[selectedGrade.project].splice(index, 1);
      if (_recallGrades.length === 0) {
        await loadedRecallGrades();
        return;
      }
      setAllRecallGrades(_allRecallGrades);
      setRecallGrades(_recallGrades);
      setSelectedGrade(_recallGrades[0] || null);
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

  if (showTheSchemaGen && fullname !== gptResearcher)
    return (
      <SchemaGenRecalls
        recallGrade={recallGrades?.[0]}
        notSatisfiedSelections={notSatisfiedSelections}
        setNotSatisfiedSelections={setNotSatisfiedSelections}
        gradeIt={gradeIt}
        selectedPassageId={recallGrades?.[0]?.passage}
        projectParticipant={recallGrades?.[0].project}
      />
    );

  if (processing) {
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
          const grade = !!phrase?.grades[researcherIdx];
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
        <Button
          onClick={handleSubmit}
          className="Button"
          variant="contained"
          color="success"
          disabled={submitting}
          id="recall-submit"
        >
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
          id="recall-passage"
          style={{
            padding: "10px 19px 10px 19px",
            margin: "19px 19px 70px 19px"
          }}
        >
          {recallGrades?.[0]?.originalText || ""}
        </Paper>
      </Paper>
      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </div>
  );
};

export default withRoot(FreeRecallGrading);
