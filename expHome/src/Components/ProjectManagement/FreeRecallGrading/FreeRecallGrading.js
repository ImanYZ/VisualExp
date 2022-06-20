import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";

import withRoot from "../../Home/modules/withRoot";

import {
  firebaseState,
  fullnameState,
  isAdminState,
} from "../../../store/AuthAtoms";

import { projectState, notAResearcherState } from "../../../store/ProjectAtoms";

import SnackbarComp from "../../SnackbarComp";

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
//   the phrase, the former researcher gets a 🧟 negative point.
const FreeRecallGrading = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const notAResearcher = useRecoilValue(notAResearcherState);
  const fullname = useRecoilValue(fullnameState);
  const isAdmin = useRecoilValue(isAdminState);
  const project = useRecoilValue(projectState);

  // When the paper gets loaded and every time the researcher submits their
  // answer, we should retrive the next free-recall response for them to
  // evaluate. This states helps us signal the useEffect to invoke
  // retrieveFreeRecallResponse.
  const [retrieveNext, setRetrieveNext] = useState(0);
  // We need to set these states to identify which phrase is assigned to which
  // participant's free-recall response by which researcher, ... to be able to
  // assign these values to the corresponding recallGrades document when
  // submitting the researcher's evaluation of this phrase in this free-recall
  // response.
  const [user, setUser] = useState(null);
  const [condition, setCondition] = useState(null);
  const [passage, setPassage] = useState(null);
  const [passageId, setPassageId] = useState(null);
  const [passageIdx, setPassageIdx] = useState(null);
  const [session, setSession] = useState(null);
  const [phrase, setPhrase] = useState(null);
  const [phraseNum, setPhraseNum] = useState(0);
  const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Retrieve a free-recall response that is not evaluated by four
  // researchers yet.
  useEffect(() => {
    const retrieveFreeRecallResponse = async () => {
      // recallGrades collection is huge and it's extremely inefficient to
      // search through it if all the docs for all projects are in the same
      // collection. Also, when querying them to find the appropriate doc to
      // show the authenticated researcher to grade, we cannot combine the
      // where clause on the project and the researchersNum < 4. As a
      // solution, we separated the collections per project, other than the
      // H2K2 project that we have already populated the data in and it's very
      // costly to rename.
      let collName = "recallGrades";
      if (project !== "H2K2") {
        collName += project;
      }
      const recallGradeDocs = await firebase.db
        .collection(collName)
        .where("researchersNum", "<", 4)
        .limit(1000)
        .get();
      for (let recallGradeDoc of recallGradeDocs.docs) {
        const recallGradeData = recallGradeDoc.data();
        if (
          recallGradeData.user !== fullname &&
          (recallGradeData.researchersNum === 0 ||
            // If there is at least one other researcher who graded
            // this, the 1st researcher should not be the same as
            // the authenticated researcher.
            (recallGradeData.researchers[0] !== fullname &&
              // If there are at least two other researchers who graded
              // this, the 2nd researcher should not be the same as
              // the authenticated researcher.
              (recallGradeData.researchersNum < 2 ||
                recallGradeData.researchers[1] !== fullname) &&
              // If there are at least three other researchers who graded
              // this, the 3rd researcher should not be the same as
              // the authenticated researcher.
              (recallGradeData.researchersNum < 3 ||
                recallGradeData.researchers[2] !== fullname)))
        ) {
          const passageDoc = await firebase.db
            .collection("passages")
            .doc(recallGradeData.passage)
            .get();
          const passageData = passageDoc.data();
          const userDoc = await firebase.db
            .collection("users")
            .doc(recallGradeData.user)
            .get();
          const userData = userDoc.data();
          let passaIdx = 0;
          for (; passaIdx < userData.pConditions.length; passaIdx++) {
            if (
              userData.pConditions[passaIdx].passage === recallGradeData.passage
            ) {
              break;
            }
          }
          // We need to set these states to identify which phrase is
          // assigned to which participant's free-recall response by
          // which researcher, ... to be able to assign these values
          // to the corresponding freeRecallGrades document when
          // submitting the researcher's evaluation of this phrase
          // in this free-recall response.
          setUser(recallGradeData.user);
          setCondition(recallGradeData.condition);
          setPassage(passageData.text);
          setPassageIdx(passaIdx);
          setPassageId(recallGradeData.passage);
          setPhrase(recallGradeData.phrase);
          setPhraseNum(passageData.phrases.length);
          setSession(recallGradeData.session);
          switch (recallGradeData.session) {
            case "1st":
              setResponse(userData.pConditions[passaIdx].recallreText);
              break;
            case "2nd":
              setResponse(userData.pConditions[passaIdx].recall3DaysreText);
              break;
            case "3rd":
              setResponse(userData.pConditions[passaIdx].recall1WeekreText);
              break;
            default:
            // code block
          }
          setTimeout(() => {
            setSubmitting(false);
          }, 4000);
          // ASA we find a free-recall response that is not evaluated by at least
          // four researchers, we set this flag to true to stop searching.
          return null;
        }
      }
    };
    if (firebase && !notAResearcher) {
      retrieveFreeRecallResponse();
    }
    // Every time the value of retrieveNext changes, retrieveFreeRecallResponse
    // should be called regardless of its value.
  }, [firebase, notAResearcher, retrieveNext]);

  // Clicking the Yes or No buttons would trigger this function. grade can be
  // either true, meaning the researcher responded Yes, or false if they
  // responded No.
  const gradeIt = (grade) => async (event) => {
    if (
      !submitting &&
      fullname &&
      passageId &&
      condition &&
      phrase &&
      session &&
      phraseNum &&
      response
    ) {
      setSubmitting(true);
      try {
        await firebase.idToken();
        await axios.post("/gradeFreeRecall", {
          grade,
          fullname,
          project,
          user,
          passageId,
          passageIdx,
          condition,
          phrase,
          session,
          phraseNum,
          response,
        });
        // Increment retrieveNext to get the next free-recall response to grade.
        setRetrieveNext((oldValue) => oldValue + 1);
        setSnackbarMessage("You successfully submitted your evaluation!");
      } catch (err) {
        console.error(err);
        setSnackbarMessage(
          "Your evaluation is NOT submitted! Please try again. If the issue persists, contact Iman!"
        );
      }
    }
  };

  return (
    <div id="FreeRecallGrading">
      <Alert severity="success">
        <ul>
          <li>
            Four researchers examine whether each key phrase from a passage is
            mentioned in each free-recall response.
          </li>
          <li>
            If at least 3 out of 4 researchers identify a specific key phrase in
            a free-recall response by a participant:
            <ul>
              <li>
                The participant receives a point for recalling that key phrase
                about the passage.
              </li>
              <li>
                Each of those 3 or 4 researchers receives a 0.5 🧠 point towards
                this research activity.
              </li>
            </ul>
          </li>
          <li>
            If exactly 3 out of 4 researchers agree on existance (non-existance)
            of a specific key phrase in a free-recall response by a participant,
            but the 4th researcher opposes their majority of vote, the opposing
            researcher gets a 0.5 🧟 negative point. Note that you don't know
            the grades that others have cast, but if the 3 other researchers
            give this case a Yes (or No) and you give it a No (or Yes), you'll
            get a 0.5 🧟 negative point.
          </li>
        </ul>
      </Alert>
      <Paper style={{ paddingBottom: "19px" }}>
        <p>
          Please identify whether this participant has mentioned the following
          key phrase from the original passage:
        </p>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {phrase}
        </Paper>
        <p>Here is their free-recall response:</p>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {response}
        </Paper>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "19px",
          }}
        >
          <Button
            onClick={gradeIt(false)}
            className="Button"
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress color="warning" size="16px" />
            ) : (
              "👎 No"
            )}
          </Button>
          <Button
            onClick={gradeIt(true)}
            className="Button"
            variant="contained"
            color="success"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress color="warning" size="16px" />
            ) : (
              "👍 Yes"
            )}
          </Button>
        </div>
        <p>The original passage is:</p>
        <Paper
          style={{
            padding: "10px 19px 10px 19px",
            margin: "19px 19px 70px 19px",
          }}
        >
          {passage}
        </Paper>
      </Paper>
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </div>
  );
};

export default withRoot(FreeRecallGrading);
