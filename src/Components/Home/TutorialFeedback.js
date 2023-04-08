import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import { DataGrid } from "@mui/x-data-grid";

import { firebaseState, fullnameState } from "../../store/AuthAtoms";

import GridCellToolTip from "../GridCellToolTip";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

import instructs from "./tutorialIntroductionQuestions";

const explanationsColumns = [
  {
    field: "section",
    headerName: "Section",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "question",
    headerName: "Question",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "explanation",
    headerName: "Explanation",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "checked",
    headerName: "Checked",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Click to check/uncheck!"
          cellValues={cellValues}
        />
      );
    },
  },
  {
    field: "checkedBy",
    headerName: "Checked By",
    width: 190,
  },
  {
    field: "participant",
    headerName: "Participant",
    width: 190,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  { field: "posted", headerName: "Posted", type: "dateTime", width: 190 },
];

const tutorialsColumns = [
  {
    field: "applicant",
    headerName: "Applicant",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
];
for (let instrId in instructs) {
  for (let questionId in instructs[instrId].questions) {
    const qStem = instructs[instrId].questions[questionId].stem;
    if (
      tutorialsColumns.findIndex(
        (tutCol) => tutCol.field === questionId + "_Wrongs"
      ) === -1
    ) {
      tutorialsColumns.push({
        field: questionId + "_Wrongs",
        headerName: qStem,
        type: "number",
        width: 100,
        disableColumnMenu: true,
        renderCell: (cellValues) => {
          return (
            <GridCellToolTip
              isLink={false}
              cellValues={cellValues}
              Tooltip="# of Wrong Attempts"
            />
          );
        },
      });
      tutorialsColumns.push({
        field: questionId + "_Answers",
        headerName: qStem,
        width: 220,
        renderCell: (cellValues) => {
          return (
            <GridCellToolTip
              isLink={false}
              cellValues={cellValues}
              Tooltip="Final Attempt Answers"
            />
          );
        },
      });
    }
  }
}

const TutorialFeedback = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [explanations, setExplanations] = useState([]);
  const [explanationsChanges, setExplanationsChanges] = useState([]);
  const [explanationsLoaded, setExplanationsLoaded] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [tutorialsChanges, setTutorialsChanges] = useState([]);
  const [wrongAttempts, setWrongAttempts] = useState([]);
  const [tutorialsLoaded, setTutorialsLoaded] = useState(false);

  useEffect(() => {
    if (firebase) {
      const explanationsQuery = firebase.db.collection("explanations");
      const explanationsSnapshot = explanationsQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setExplanationsChanges((oldExplanationsChanges) => {
          return [...oldExplanationsChanges, ...docChanges];
        });
        setExplanationsLoaded(true);
      });
      return () => {
        setExplanations([]);
        setExplanationsLoaded(false);
        explanationsSnapshot();
      };
    }
  }, [firebase]);

  useEffect(() => {
    if (explanationsChanges.length > 0) {
      const tempExplanationsChanges = [...explanationsChanges];
      setExplanationsChanges([]);
      let explans = [...explanations];
      for (let change of tempExplanationsChanges) {
        if (change.type === "removed") {
          explans = explans.filter((explan) => explan.id !== change.doc.id);
        } else {
          const explanData = change.doc.data();
          if (explanData.instrId in instructs) {
            const instr = instructs[explanData.instrId];
            let question;
            if ("qIdx" in explanData) {
              if (explanData.qIdx < Object.keys(instr.questions).length) {
                question = Object.values(instr.questions)[explanData.qIdx].stem;
              } else {
                question = "The Question is deleted!";
              }
            } else if ("qId" in explanData) {
              if (explanData.qId in instr.questions) {
                question = instr.questions[explanData.qId].stem;
              } else {
                question = "The Question is deleted!";
              }
            }
            const newExplan = {
              participant: explanData.fullname,
              explanation: explanData.explanation,
              posted: explanData.createdAt.toDate(),
              section: instr.title,
              question,
              id: change.doc.id,
            };
            if ("checked" in explanData && explanData.checked) {
              newExplan.checked = "✅";
              newExplan.checkedBy = explanData.checkedBy;
            } else {
              newExplan.checked = "◻";
              newExplan.checkedBy = "";
            }
            const explanIdx = explanations.findIndex(
              (acti) => acti.id === change.doc.id
            );
            if (explanIdx !== -1) {
              explans[explanIdx] = {
                ...explans[explanIdx],
                ...newExplan,
              };
            } else {
              explans.push({
                ...newExplan,
              });
            }
          }
        }
      }
      setExplanations(explans);
    }
  }, [explanations, explanationsChanges]);

  useEffect(() => {
    if (firebase) {
      const tutorialsQuery = firebase.db.collection("tutorial");
      const tutorialsSnapshot = tutorialsQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setTutorialsChanges((oldTutorialsChanges) => {
          return [...oldTutorialsChanges, ...docChanges];
        });
      });
      return () => {
        setTutorials([]);
        setTutorialsLoaded(false);
        tutorialsSnapshot();
      };
    }
  }, [firebase]);

  useEffect(() => {
    if (tutorialsChanges.length > 0) {
      const tempTutorialsChanges = [...tutorialsChanges];
      const wAttempts = [...wrongAttempts];
      setTutorialsChanges([]);
      let tutos = [...tutorials];
      for (let change of tempTutorialsChanges) {
        if (change.type === "removed") {
          tutos = tutos.filter((tuto) => tuto.id !== change.doc.id);
        } else {
          const tutoData = change.doc.data();
          const newTuto = {
            id: change.doc.id,
            applicant: change.doc.id,
          };
          for (let instrId in tutoData.attempts) {
            if (instrId in instructs && instrId !== "Congratulations") {
              const questions = tutoData.attempts[instrId].questions;
              for (let questionId in questions) {
                if (questionId in instructs[instrId].questions) {
                  newTuto[questionId + "_Wrongs"] =
                    questions[questionId].wrongs;
                  newTuto[questionId + "_Answers"] =
                    questions[questionId].answers;
                  const wAttemptsIdx = wAttempts.findIndex(
                    (wAtt) => wAtt.questionId === questionId
                  );
                  const wAttemptsLoc = wAttempts.findIndex(
                    (wAtt) => wAtt.wrongs < questions[questionId].wrongs
                  );
                  const newWAttempt = {
                    applicant: change.doc.id,
                    questionId,
                    stem: instructs[instrId].questions[questionId].stem,
                    wrongs: questions[questionId].wrongs,
                  };
                  if (wAttemptsIdx !== -1) {
                    if (
                      questions[questionId].wrongs >
                      wAttempts[wAttemptsIdx].wrongs
                    ) {
                      wAttempts.splice(wAttemptsIdx, 1);
                      wAttempts.splice(wAttemptsLoc, 0, newWAttempt);
                    }
                  } else {
                    wAttempts.splice(wAttemptsLoc, 0, newWAttempt);
                  }
                }
              }
            }
          }
          const tutosIdx = tutos.findIndex((tuto) => tuto.id === change.doc.id);
          if (tutosIdx === -1) {
            tutos.push(newTuto);
          } else {
            tutos.splice(tutosIdx, 1, newTuto);
          }
        }
      }
      setTutorials(tutos);
      setWrongAttempts(wAttempts);
      setTimeout(() => {
        setTutorialsLoaded(true);
      }, 400);
    }
  }, [tutorials, tutorialsChanges, wrongAttempts]);

  const checkExplanation = async (clickedCell) => {
    if (clickedCell.field === "checked") {
      try {
        let explans = [...explanations];
        const explanIdx = explans.findIndex(
          (acti) => acti.id === clickedCell.id
        );
        const isChecked = explans[explanIdx][clickedCell.field] === "✅";
        if (explanIdx !== -1 && explans[explanIdx][clickedCell.field] !== "O") {
          explans[explanIdx] = {
            ...explans[explanIdx],
            [clickedCell.field]: "O",
          };
          setExplanations(explans);
          const explanRef = firebase.db
            .collection("explanations")
            .doc(explans[explanIdx].id);
          await explanRef.update({
            checked: !isChecked,
            checkedBy: fullname,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <PagesNavbar thisPage="Tutorial Feedback">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial Feedback
      </Typography>
      <DataGrid
        rows={explanations}
        columns={explanationsColumns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        autoPageSize
        autoHeight
        // checkboxSelection
        hideFooterSelectedRowCount
        loading={!explanationsLoaded}
        onCellClick={checkExplanation}
      />
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial Question Ids Sorted by # of Wrong Attempts
      </Typography>
      {tutorialsLoaded && (
        <div
          style={{ height: "400px", overflowX: "hidden", overflowY: "auto" }}
        >
          <ul>
            {wrongAttempts.map((wAttempt) => {
              return (
                <li key={wAttempt.questionId}>
                  <p>
                    <strong>{wAttempt.wrongs} Attemps</strong>
                  </p>
                  <div>{wAttempt.stem}</div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial # of Wrong Attempts &amp; Answers
      </Typography>
      {tutorialsLoaded && (
        <DataGrid
          rows={tutorials}
          columns={tutorialsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          // checkboxSelection
          hideFooterSelectedRowCount
          loading={!tutorialsLoaded}
        />
      )}
    </PagesNavbar>
  );
};

export default TutorialFeedback;
