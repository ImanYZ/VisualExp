import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

import { DataGrid } from "@mui/x-data-grid";

import { firebaseState, fullnameState } from "../../store/AuthAtoms";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

import instructs from "./tutorialIntroductionQuestions";

const explanationsColumns = [
  {
    field: "section",
    headerName: "Section",
    width: 220,
    renderCell: (cellValues) => {
      return (
        <Tooltip title={cellValues.value} placement="top">
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "question",
    headerName: "Question",
    width: 220,
    renderCell: (cellValues) => {
      return (
        <Tooltip title={cellValues.value} placement="top">
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "explanation",
    headerName: "Explanation",
    width: 220,
    renderCell: (cellValues) => {
      return (
        <Tooltip title={cellValues.value} placement="top">
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "checked",
    headerName: "Checked",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <Tooltip title="Click to check/uncheck!" placement="top">
          <div
            style={{
              fontSize: 19,
              fontWeight: "bold",
              cursor: cellValues.value === "O" ? "default" : "pointer",
              width: "100%",
              textAlign: "center",
            }}
          >
            {cellValues.value === "O" ? (
              <CircularProgress color="warning" size="16px" />
            ) : (
              cellValues.value
            )}
          </div>
        </Tooltip>
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
  },
  { field: "posted", headerName: "Posted", type: "dateTime", width: 178 },
];

const TutorialFeedback = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [explanations, setExplanations] = useState([]);
  const [explanationsChanges, setExplanationsChanges] = useState([]);
  const [explanationsLoaded, setExplanationsLoaded] = useState(false);

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
        setExplanationsLoaded(false);
        explanationsSnapshot();
      };
    }
  }, [firebase]);

  useEffect(() => {
    if (explanationsChanges.length > 0) {
      let explans = [...explanations];
      for (let change of explanationsChanges) {
        if (change.type === "removed") {
          explans = explans.filter((explan) => explan.id !== change.doc.id);
        } else {
          const explanData = change.doc.data();
          if (explanData.instrId in instructs) {
            const instr = instructs[explanData.instrId];
            let question;
            if ("qIdx" in explanData) {
              question = Object.values(instr.questions)[explanData.qIdx].stem;
            } else if ("qId" in explanData) {
              question = instr.questions[explanData.qId].stem;
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
      setExplanationsChanges([]);
      setExplanations(explans);
    }
  }, [explanations, explanationsChanges]);

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
          explans[explanIdx] = {
            ...explans[explanIdx],
            [clickedCell.field]: isChecked ? "◻" : "✅",
          };
          setExplanations(explans);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <PagesNavbar>
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
    </PagesNavbar>
  );
};

export default TutorialFeedback;
