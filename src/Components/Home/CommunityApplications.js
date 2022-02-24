import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

import { DataGrid } from "@mui/x-data-grid";

import {
  firebaseState,
  fullnameState,
  leadingState,
} from "../../store/AuthAtoms";

import GridCellToolTip from "../GridCellToolTip";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const applicantsColumns = [
  { field: "createdAt", headerName: "Started", type: "dateTime", width: 178 },
  {
    field: "user",
    headerName: "Applicant",
    width: 190,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 190,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "readingImmediate",
    headerName: "ReImScore",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Reading Comprehension Immediate Score"
        />
      );
    },
  },
  {
    field: "reading3Days",
    headerName: "Re3DaysScore",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Reading Comprehension After Three Days Score"
        />
      );
    },
  },
  {
    field: "reading1Week",
    headerName: "Re1WeekScore",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Reading Comprehension After One Week Score"
        />
      );
    },
  },
  {
    field: "tutorialWrongs",
    headerName: "Tut-",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Tutorial Wrong Attemps"
        />
      );
    },
  },
  {
    field: "quizWrongs",
    headerName: "Quiz-",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Quiz Wrong Attemps"
        />
      );
    },
  },
  {
    field: "transcript",
    headerName: "Transcript",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    },
  },
  {
    field: "resume",
    headerName: "Resume",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    },
  },
  {
    field: "portfolio",
    headerName: "Portfolio",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    },
  },
  {
    field: "accept",
    headerName: "Accept",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <Tooltip title="Accept" placement="top">
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
    field: "reject",
    headerName: "Reject",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <Tooltip title="Reject" placement="top">
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
    field: "leader",
    headerName: "Leader",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip={"Decision made by " + cellValues.value}
        />
      );
    },
  },
];

const CommunityApplications = () => {
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

export default CommunityApplications;
