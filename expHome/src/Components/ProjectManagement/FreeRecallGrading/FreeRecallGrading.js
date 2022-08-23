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

import { firebaseState, fullnameState, isAdminState } from "../../../store/AuthAtoms";

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
//   the phrase, the former researcher gets a ❌ negative point.
const FreeRecallGrading = props => {
  const firebase = useRecoilValue(firebaseState);
  const notAResearcher = useRecoilValue(notAResearcherState);
  const fullname = useRecoilValue(fullnameState);
  const isAdmin = useRecoilValue(isAdminState);
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
  const [retrieveNext, setRetrieveNext] = useState(0);

  const [lastRetreivedDocument, setLastRetreivedDocument] = useState("");
  const [lastRetreivedDocumentAutoGrading, setRetreivedDocumentAutoGrading] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(async () => {
  //   if (firstBatchOfRecallGrades.length === 0) {
  //     const lastVisibleRecallGradesDoc = recallGradesDocs.docs[recallGradeDocsInitial.docs.length - 1];
  //     if (lastVisibleRecallGradesDoc) {
  //       const recallGradeDocs = await firebase.db
  //         .collection(collName)
  //         .where("done", "==", false)
  //         .orderBy("passage")
  //         .orderBy("user")
  //         .orderBy("session")
  //         .startAfter(lastRetreivedDocument)
  //         .limit(1000)
  //         .get();

  //       setRecallGradeDocs(recallGradeDocs);
  //     }
  //   }
  // }, [firstBatchOfRecallGrades]);

  // Retrieve a free-recall response that is not evaluated by four
  // researchers yet.
  const bulkGradeFreeRecall = async (
    project,
    phraseNum,
    phrasesWithGrades,
    user,
    condition,
    passageId,
    passageIdx,
    session,
    response,
    voterProject
  ) => {

    debugger
    if (fullname) {
      // const phrasesWithGrades = req.body.phrasesWithGrades || [];
      // const fullname = req.body.fullname;
      // const project = req.body.project;
      // const user = req.body.user;
      // const condition = req.body.condition;
      // const passageId = req.body.passageId;
      // const passageIdx = req.body.passageIdx;
      // const session = req.body.session;
      // const phraseNum = req.body.phraseNum;
      // const voterProject= req.body.voterProject;
      firebase.db
        .runTransaction(async t => {
          // Accumulate all the transaction writes in an array to commit all of them
          // after all the reads to abide by the Firestore transaction law
          // https://firebase.google.com/docs/firestore/manage-data/transactions#transactions.
          const transactionWrites = [];
          // Because there will be multiple places to update this researcher data,
          // we should accumulate all the updates for this researcher to commit them
          // at the end of the transaction.
          const currentResearcherRef = firebase.db.collection("researchers").doc(`${fullname}`);
          const currentResearcherDoc = await t.get(currentResearcherRef);
          const currentResearcherData = currentResearcherDoc.data();
          const currentResearcherUpdates = currentResearcherData.projects[voterProject];
          // The very first update we need to apply is to increment the number of
          // times they have graded a free-recall response.
          currentResearcherUpdates.gradingNum = currentResearcherUpdates.gradingNum
            ? currentResearcherUpdates.gradingNum + phrasesWithGrades.length
            : phrasesWithGrades.length;
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
          // user references
          const userRef = firebase.db.collection("users").doc(`${user}`);
          const userDoc = await t.get(userRef);
          const userData = userDoc.data();
          const userUpdates = userData;

          // researcher references
          const otherResearchersData = {};

          // phraseGrade loop
          for (let phraseGrade of phrasesWithGrades) {
            console.log("phrase & grade::::", phraseGrade);
            const recallGradeQuery = firebase.db
              .collection(collName)
              .where("user", "==", user)
              .where("session", "==", session)
              .where("condition", "==", condition)
              .where("passage", "==", passageId)
              .where("phrase", "==", phraseGrade.phrase);
            const recallGradeDocs = await t.get(recallGradeQuery);
            console.log("Getting data from recallGrade Doc Id", `${recallGradeDocs.docs[0].id}`);
            const recallGradeRef = firebase.db.collection(collName).doc(`${recallGradeDocs.docs[0].id}`);
            const recallGradeData = recallGradeDocs.docs[0].data();
            if (!recallGradeData.researchers.includes(fullname)) {
              const recallGradeUpdates = {};
              // Only if all the 4 researchers (this one and 3 others) have graded
              // this case, then check whether it should be approved and assign the
              // points to the researchers and the participants.
              let approved = false;
              if (recallGradeData.researchersNum === 3) {
                // We need to figure out whether at least 3 out of 4 researchers marked it
                // as: (Yes), then it should be approved and we should give points to the
                // reseachers and the user; (No), then it should be approved and we should
                // give points to the researchers, but not the user.
                let identified = 0;
                let notIdentified = 0;
                for (let thisGrade of recallGradeData.grades) {
                  identified += thisGrade;
                  notIdentified += !thisGrade;
                }
                identified += phraseGrade.grade;
                notIdentified += !phraseGrade.grade;
                // It should be approved if more than or equal to 3 researchers have
                // unanimously identified/not identified this phrase in this free-recall
                // response.
                approved = identified >= 3 || notIdentified >= 3;
                if (approved) {
                  // If identified >= 3, we should give the participant their free-recall
                  // point.
                  if (identified >= 3) {
                    // Because the participant answers the free-recall questions for each
                    // passage 3 time, in the 1st, 2nd, and 3rd sessions, we should
                    // differentiate them when assigning their grades.
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
                    // The only piece of the user data that should be modified is
                    // pCondition based on the point received.
                    let theGrade = 1;
                    if (recallResponse && userUpdates.pConditions[passageIdx][recallResponse]) {
                      // We should add up points here because each free recall response
                      // may get multiple points from each of the key phrases identified
                      // in it.
                      theGrade += userUpdates.pConditions[passageIdx][recallResponse];
                    }
                    userUpdates.pConditions[passageIdx][recallResponse] = theGrade;
                    // Depending on how many key phrases were in the passage, we should
                    // calculate the free-recall response ratio.
                    userUpdates.pConditions[passageIdx][`${recallResponse}Ratio`] = theGrade / phraseNum;
                  }
                  // For both identified >= 3 AND notIdentified >= 3 cases, we should give
                  // a point to each of the researchers who unanimously
                  // identified/notIdentified this phrase in this free recall response.
                  for (let fResearcherIdx = 0; fResearcherIdx < recallGradeData.researchers.length; fResearcherIdx++) {
                    if (!otherResearchersData[recallGradeData.researchers[fResearcherIdx]]) {
                      console.log("NEW RESEARCHER ADDED::::", recallGradeData.researchers[fResearcherIdx]);
                      const researcherRef = firebase.db
                        .collection("researchers")
                        .doc(`${recallGradeData.researchers[fResearcherIdx]}`);
                      const researcherDoc = await t.get(researcherRef);
                      const researcherData = researcherDoc.data();
                      otherResearchersData[recallGradeData.researchers[fResearcherIdx]] = researcherData;
                    }

                    // fetch all the researcher projects and
                    // check if it has in payload or not.
                    const researcherObj = otherResearchersData[recallGradeData.researchers[fResearcherIdx]];
                    const researcherProjects = Object.keys(researcherObj.projects);
                    const researcherHasProjectFromPayloadProject = researcherProjects.includes(project);
                    if (
                      (identified >= 3 && recallGradeData.grades[fResearcherIdx]) ||
                      (notIdentified >= 3 && !recallGradeData.grades[fResearcherIdx])
                    ) {
                      // Approve the recallGrade for all the researchers who
                      // unanimously identified/notIdentified this phrase in this free
                      // recall response.
                      recallGradeUpdates.approved = approved;
                      if (researcherHasProjectFromPayloadProject) {
                        researcherObj.projects[project].gradingPoints = researcherObj.projects[project].gradingPoints
                          ? researcherObj.projects[project].gradingPoints + 0.5
                          : 0.5;
                      }
                    }
                    // If there are exactly 3 researchers who graded the same, but only
                    // this researcher's grade (Yes/No) is different from the majority of
                    // grades; we should give the opposing researcher a negative point.
                    else if (
                      (identified === 3 && !recallGradeData.grades[fResearcherIdx]) ||
                      (notIdentified === 3 && recallGradeData.grades[fResearcherIdx])
                    ) {
                      if (researcherHasProjectFromPayloadProject) {
                        researcherObj.projects[project].gradingPoints = researcherObj.projects[project].gradingPoints
                          ? researcherObj.projects[project].gradingPoints - 0.5
                          : -0.5;
                        researcherObj.projects[project].negativeGradingPoints = researcherObj.projects[project]
                          .negativeGradingPoints
                          ? researcherObj.projects[project].negativeGradingPoints + 0.5
                          : 0.5;
                      }
                    }
                    otherResearchersData[recallGradeData.researchers[fResearcherIdx]] = researcherObj;
                  }
                  // If the authenticated researcher has graded the same as the majority
                  // of grades:
                  if ((identified >= 3 && phraseGrade.grade) || (notIdentified >= 3 && !phraseGrade.grade)) {
                    // Because it's approved, we should also give the authenticated
                    // researcher a point. We should update thisResearcherUpdates and
                    // commit all the updates at the end to their document.
                    currentResearcherUpdates.gradingPoints = currentResearcherUpdates.gradingPoints
                      ? currentResearcherUpdates.gradingPoints + 0.5
                      : 0.5;
                  }
                  // If there are exactly 3 researchers who graded the same, but only the
                  // authenticated researcher's grade (Yes/No) is different from the
                  // majority of grades; we should give the the authenticated researcher a
                  // negative point.
                  else if ((identified === 3 && !phraseGrade.grade) || (notIdentified === 3 && phraseGrade.grade)) {
                    currentResearcherUpdates.gradingPoints = currentResearcherUpdates.gradingPoints
                      ? currentResearcherUpdates.gradingPoints - 0.5
                      : -0.5;
                    currentResearcherUpdates.negativeGradingPoints = currentResearcherUpdates.negativeGradingPoints
                      ? currentResearcherUpdates.negativeGradingPoints + 0.5
                      : 0.5;
                  }
                }
              }
              // Finally, we should create RecallGrade doc for this new grade.
              // this done variable if for testing if 4 researchers have voted on this
              transactionWrites.push({
                type: "update",
                refObj: recallGradeRef,
                updateObj: {
                  ...recallGradeUpdates,
                  done: recallGradeData.researchersNum >= 3,
                  researchers: [...recallGradeData.researchers, fullname],
                  grades: [...recallGradeData.grades, phraseGrade.grade],
                  researchersNum: recallGradeData.researchersNum + 1,
                  updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
                }
              });
            }
          }
          // for phrase grades loop ends above

          // write all the transactions for other researcher's data
          for (let researcherId of Object.keys(otherResearchersData)) {
            const researcherRef = firebase.db.collection("researchers").doc(`${researcherId}`);
            transactionWrites.push({
              type: "update",
              refObj: researcherRef,
              updateObj: otherResearchersData[researcherId]
            });
          }

          // write user transactions
          transactionWrites.push({
            type: "update",
            refObj: userRef,
            updateObj: userUpdates
          });

          // write currentResearcherRef
          transactionWrites.push({
            type: "update",
            refObj: currentResearcherRef,
            updateObj: {
              projects: {
                ...currentResearcherData.projects,
                [project]: currentResearcherUpdates
              }
            }
          });

          // After accumulating all the updates for the authenticated researcher,
          // now we can update their document's.
          for (let transactionWrite of transactionWrites) {
            if (transactionWrite.type === "update") {
              t.update(transactionWrite.refObj, transactionWrite.updateObj);
            } else if (transactionWrite.type === "set") {
              t.set(transactionWrite.refObj, transactionWrite.updateObj);
            } else if (transactionWrite.type === "delete") {
              t.delete(transactionWrite.refObj);
            }
          }
        })
        .then(() => {
          console.log({ success: true, endpoint: "Bulk Upload", successData: phrasesWithGrades });
        })
        .catch(err => {
          console.log({ errMsg: err.message, success: false });
        });
    } else {
      console.log({ errMsg: "some parameters missing", success: false });
    }
  };

  const loadedRecallGrades = async () => {
    let lastVisibleRecallGradesDoc;
    let lastVisibleRecallGradesDocAutoGrading;
    let collName = "recallGrades";
    if (project !== "H2K2" && project !== "AutoGrading") {
      collName = "recallGrades" + project;
    }
    if (lastRetreivedDocument === "") {
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
      let recallGradeDocs = await firebase.db
        .collection(collName)
        .where("done", "==", false)
        .orderBy("passage")
        .orderBy("user")
        .orderBy("session")
        .startAfter(lastVisibleRecallGradesDoc)
        .limit(1000)
        .get();

      lastVisibleRecallGradesDoc = recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
      setLastRetreivedDocument(lastVisibleRecallGradesDoc);
      return recallGradeDocs;
    } else {
      if (project === "AutoGrading") {
        if (lastRetreivedDocumentAutoGrading === "") {
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
          let recallGradeDocs = await firebase.db
            .collection("recallGradesH1L2")
            .where("done", "==", false)
            .orderBy("passage")
            .orderBy("user")
            .orderBy("session")
            .startAfter(lastVisibleRecallGradesDocAutoGrading)
            .limit(1000)
            .get();

          lastVisibleRecallGradesDocAutoGrading = recallGradeDocs.docs[recallGradeDocs.docs.length - 1];
          setRetreivedDocumentAutoGrading(lastVisibleRecallGradesDocAutoGrading);
          return recallGradeDocs;
        } else {
          return [];
        }
      } else {
        return [];
      }
    }

    // if (recallGradeDocs.docs.length === 0) {
    //   setFirstBatchOfRecallGrades([]);
    // }
  };

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
      const firstBatch = [];
      const recallGradeDocs = await loadedRecallGrades();

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
              (recallGradeData.researchersNum < 2 || recallGradeData.researchers[1] !== fullname) &&
              // If there are at least three other researchers who graded
              // this, the 3rd researcher should not be the same as
              // the authenticated researcher.
              (recallGradeData.researchersNum < 3 || recallGradeData.researchers[2] !== fullname)))
        ) {
          if (firstBatch.length > 0 && recallGradeData.response !== firstBatch[0].data.response) {
            setFirstBatchOfRecallGrades(firstBatch);

            const passageDoc = await firebase.db.collection("passages").doc(firstBatch[0].data.passage).get();
            setPassageData(passageDoc.data());
            break;
          }
          firstBatch.push({ data: recallGradeData, grade: false });
        }
      }
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
      let passageIdx = 0;

      for (; passageIdx < userData.pConditions.length; passageIdx++) {
        if (userData.pConditions[passageIdx].passage === firstBatchOfRecallGrades[0].data.passage) {
          break;
        }
      }
      const freeRecallGradeBulkData = {
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

      
      debugger
      await bulkGradeFreeRecall(
        firstBatchOfRecallGrades[0].data.project,
        passageData?.phrases?.length,
        phrasesWithGrades,
        firstBatchOfRecallGrades[0].data.user,
        firstBatchOfRecallGrades[0].data.condition,
        firstBatchOfRecallGrades[0].data.passage,
        passageIdx,
        firstBatchOfRecallGrades[0].data.session,
        firstBatchOfRecallGrades[0].data.response,
        project
      );
      // await axios.post("/bulkGradeFreeRecall", freeRecallGradeBulkData);
      setSubmitting(false);
      // Increment retrieveNext to get the next free-recall response to grade.
      setRetrieveNext(oldValue => oldValue + 1);
      setSnackbarMessage("You successfully submitted your evaluation!");
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

  console.log(firstBatchOfRecallGrades);
  return firstBatchOfRecallGrades.length === 0 ? (
    <Alert severity="info" size="large">
      <AlertTitle>Info</AlertTitle>
      There're no new recall Grades
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
