import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import axios from "axios";
import moment from "moment";

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
  const [submitting, setSubmitting] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [recallGrades, setRecallGrades] = useState([]);
  const [recallGradeIdx, setRecallGradeIdx] = useState(0);
  const [passages, setPassages] = useState({});

  const [notSatisfiedPhrases, setNotSatisfiedPhrases] = useState([]);
  const [notSatisfiedSelections, setNotSatisfiedSelections] = useState([]);
  const [randomizedPhrases, setRandomizedPhrases] = useState([]);
  const [recentParticipants, setRecentParticipants] = useState([]);

  const [showTheSchemaGen, setShowTheSchemaGen] = useState(false);

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

    // sorting boolean expressions based on votes
    for(const phrase in booleanHashMap) {
      booleanHashMap[phrase].sort((e1, e2) => {
        const e1Vote = (e1.upVotes || 0) - (e1.downVotes || 0);
        const e2Vote = (e2.upVotes || 0) - (e2.downVotes || 0);
        return e1Vote < e2Vote ? 1 : -1; // desc order
      })
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
        // pick only 4 wrong phrases
        phrases = phrases.filter(phrase => (notSatisfiedPhrases.includes(phrase.phrase) ? wrongNum++ < 4 : true));
        setRandomizedPhrases(phrases);
        setProcessing(false);
      }
    })();
  }, [recallGradeIdx, passages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Retrieve a free-recall response that is not evaluated by four
  // researchers yet.

  const loadedRecallGrades = async () => {
    setProcessing(true);

    // logic to fetch recently participants names by current researcher
    const recentParticipants = [];
    const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
    const month2WeeksAgo = moment().utcOffset(-4).subtract(16, "days").startOf("month").format("YYYY-MM-DD");
    if(!scheduleMonths.includes(month2WeeksAgo)) {
      scheduleMonths.push(month2WeeksAgo);
    }
    const resSchedules = await firebase.db.collection("resSchedule").where("month", "in", scheduleMonths).get();
    for(const resSchedule of resSchedules.docs) {
      const resScheduleData = resSchedule.data();
      const scheduled = resScheduleData?.scheduled?.[fullname] || {};
      recentParticipants.push(...Object.keys(scheduled));
    }
    setRecentParticipants(recentParticipants);

    const recallGrades = await firebase.db
      .collection("recallGradesV2")
      .where("project", "==", project)
      .where("done", "==", false)
      .get();

    let _recallGrades = [];

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
            filtered.length > 2
          ) {
            _recallGrades.push({
              docId: recallGradeDoc.id,
              session: toOrdinal(sessionNum),
              user: recallGradeData.user,
              project: recallGradeData.project,
              ...conditionItem
            });
          }
        }
      }
    }

    // sorting researcher's related participants first
    _recallGrades.sort((g1, g2) => {
        const p1 = recentParticipants.includes(g1.user);
        const p2 = recentParticipants.includes(g2.user);
        if(p1 && p2) return 0;
        return p1 && !p2 ? -1 : 1;
    })

    setRecallGrades(_recallGrades);
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
    let phrases = [];
    const recallGrade = recallGrades?.[recallGradeIdx];

    if (newBatch?.length) {
      const phraseStatements = [];
      phrases = [...newBatch];
      // need to add missing grades due schema gen recalls
      for(const phrase of phrases) {
        phraseStatements.push(phrase.phrase);
      }
      const recallPhrases = (recallGrades?.[recallGradeIdx]?.phrases || []);
      for(const recallPhrase of recallPhrases) {
        if(phraseStatements.includes(recallPhrase.phrase)) {
          continue;
        }
        phrases.push(recallPhrase);
      }
    } else {
      phrases = [...(recallGrades?.[recallGradeIdx]?.phrases || [])];
    }

    setSubmitting(true);
    try {
      const requestData = {
        recallGrade: {
          ...recallGrade,
          phrases
        },
        voterProject: project,
        viewedPhrases: randomizedPhrases.map((phrase) => phrase.phrase)
      };
      
      await firebase.idToken();
      await axios.post("/researchers/gradeRecalls", requestData);

      setSubmitting(false);
      // Increment retrieveNext to get the next free-recall response to grade.
      if(recallGrades.length !== recallGradeIdx + 1) {
        setProcessing(true);
      }
      setRandomizedPhrases([]);
      setRecallGradeIdx(recallGradeIdx + 1);
      setSnackbarMessage("You successfully submitted your evaluation!");
      setShowTheSchemaGen(false);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Your evaluation is NOT submitted! Please try again. If the issue persists, contact Iman!");
    }
  };

  const handleGradeChange = (index) => {
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
    _recallGrades[recallGradeIdx].phrases[index].grades = grades;
    _recallGrades[recallGradeIdx].phrases[index].grade = grades[researcherIdx];
    
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
  
  if(processing) {
    return (
      <Box sx={{
        display: "flex",
        width: "100%",
        justifyContent: "center"
      }}>
        <CircularProgress />
      </Box>
    );
  }
  return !recallGrades || !recallGrades.length || recallGrades.length <= recallGradeIdx ? (
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
        {
          recentParticipants.includes(recallGrades[recallGradeIdx]?.user) ? (
            <p>
              <b>Participant: </b> {recallGrades[recallGradeIdx].user}
            </p>
          ) : <span />
        }

        <p>1- Carefully read this free-recall response:</p>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {recallGrades[recallGradeIdx]?.response}
        </Paper>
        <p>
          2- Identify whether this participant has mentioned the following key phrases from the original passage in
          their free-recall response, and then submit your answers:
        </p>

        {(randomizedPhrases || []).map((row, index) => {
          const phrase = recallGrades[recallGradeIdx].phrases[row.index];

          const researcherIdx = (phrase.researchers || []).indexOf(fullname);
          const grade = researcherIdx !== -1 && phrase.grades[researcherIdx];
          return (
            <div key={index}>
              <Paper sx={{ p: "4px 19px 4px 19px", m: "4px 19px 6px 19px" }}>
                <Box sx={{ display: "inline", mr: "19px" }}>
                  NO
                  <Switch checked={grade} onChange={() => handleGradeChange(row.index)} color="secondary" />
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
