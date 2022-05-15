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
  // assign these values to the corresponding freeRecallGrades document when
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
      // ASA we find a free-recall response that is not evaluated by at least
      // four researchers, we set this flag to true to stop searching.
      let foundFreeRecallResponse = false;
      const userDocs = await firebase.db
        .collection("users")
        .where("project", "==", project)
        .get();
      for (let userDoc of userDocs.docs) {
        const userData = userDoc.data();
        // Because some researchers had previously been participants, we should
        // not let them grade their own free-recall responses.
        if (userDoc.id !== fullname) {
          // Get the free-recall responses of this participant for all passages,
          // for now they are two because each participant goes through only two
          // random passages under random conditions.
          for (
            let passaIdx = 0;
            passaIdx < userData.pConditions.length;
            passaIdx++
          ) {
            // There are three types of free-recall responses:
            for (let recallResponse of [
              "recallreText",
              "recall3DaysreText",
              "recall1WeekreText",
            ]) {
              // There are some users who have not attended some sessions or they
              // did not answer some free-recall questions. We only need to ask
              // our researchers to grade answered free-recall responses.
              if (
                recallResponse in userData.pConditions[passaIdx] &&
                userData.pConditions[passaIdx][recallResponse]
              ) {
                // We need to retrieve the phrases for this passage from the
                // corresponding passage document.
                const passageDoc = await firebase.db
                  .collection("passages")
                  .doc(userData.pConditions[passaIdx].passage)
                  .get();
                if (passageDoc.exists) {
                  const passageData = passageDoc.data();
                  // We need to do this for every key phrase in the passage that
                  // we expect the participants have recalled and mentioned in
                  // their free-recall response of this passage.
                  for (let phras of passageData.phrases) {
                    // freeRecallGrades is the collection that identifies which
                    // phrase is assigned to which participant's free-recall
                    // response by which researcher,
                    // and whether it is approved or not.
                    const freeRecallGradeDocs = await firebase.db
                      .collection("freeRecallGrades")
                      .where("user", "==", userDoc.id)
                      .where("project", "==", project)
                      .where(
                        "passage",
                        "==",
                        userData.pConditions[passaIdx].passage
                      )
                      .where("phrase", "==", phras)
                      .get();
                    // Only if less than four researchers have already graded
                    // the identification of this phrase in this specific
                    // free-recall response AND the authenticated researcher has
                    // never graded this specific phrase in this free-recall
                    // response before:
                    if (
                      freeRecallGradeDocs.docs.length < 4 &&
                      // If there are no more researchers who graded this, we
                      // should take it.
                      (freeRecallGradeDocs.docs.length === 0 ||
                        // If there is at least one other researcher who graded
                        // this, the 1st researcher should not be the same as
                        // the authenticated researcher.
                        (freeRecallGradeDocs.docs[0].data().researcher !==
                          fullname &&
                          // If there are at least two other researchers who graded
                          // this, the 2nd researcher should not be the same as
                          // the authenticated researcher.
                          (freeRecallGradeDocs.docs.length < 2 ||
                            freeRecallGradeDocs.docs[1].data().researcher !==
                              fullname) &&
                          // If there are at least three other researchers who graded
                          // this, the 3rd researcher should not be the same as
                          // the authenticated researcher.
                          (freeRecallGradeDocs.docs.length < 3 ||
                            freeRecallGradeDocs.docs[2].data().researcher !==
                              fullname)))
                    ) {
                      foundFreeRecallResponse = true;
                      // We need to set these states to identify which phrase is
                      // assigned to which participant's free-recall response by
                      // which researcher, ... to be able to assign these values
                      // to the corresponding freeRecallGrades document when
                      // submitting the researcher's evaluation of this phrase
                      // in this free-recall response.
                      setUser(userDoc.id);
                      setCondition(userData.pConditions[passaIdx].condition);
                      setPassage(passageData.text);
                      setPassageIdx(passaIdx);
                      setPassageId(passageDoc.id);
                      setPhrase(phras);
                      setPhraseNum(passageData.phrases.length);
                      setResponse(
                        userData.pConditions[passaIdx][recallResponse]
                      );
                      switch (recallResponse) {
                        case "recallreText":
                          setSession("1st");
                          break;
                        case "recall3DaysreText":
                          setSession("2nd");
                          break;
                        case "recall1WeekreText":
                          setSession("3rd");
                          break;
                        default:
                        // code block
                      }
                      setTimeout(() => {
                        setSubmitting(false);
                      }, 10000);
                      break;
                    }
                  }
                }
              }
              if (foundFreeRecallResponse) {
                break;
              }
            }
            if (foundFreeRecallResponse) {
              break;
            }
          }
          if (foundFreeRecallResponse) {
            break;
          }
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
