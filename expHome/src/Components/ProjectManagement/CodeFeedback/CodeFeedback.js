import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { DataGrid } from "@mui/x-data-grid";
import GridCellToolTip from "../../GridCellToolTip";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

import { firebaseState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";

const codesColumn = [
  {
    field: "code",
    headerName: "Code",
    width: 220,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "checked",
    headerName: "Approved",
    width: 160,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return (
        <GridCellToolTip isLink={false} actionCell={true} Tooltip="Click to check/uncheck!" cellValues={cellValues} />
      );
    }
  }
];

const CodeFeedback = props => {
  const firebase = useRecoilValue(firebaseState);
  // const fullname = useRecoilValue(fullnameState);
  const email = useRecoilValue(emailState);
  const project = useRecoilValue(projectState);
  const [newCodes, setNewCodes] = useState([]);
  const [newexperimentCodes, setNewexperimentCodes] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (project) {
      const feedbackCodeBooksDocs = await firebase.db
        .collection("experimentCodes")
        .where("project", "==", project)
        .get();

      let experimentCodes = [];
      for (let Doc of feedbackCodeBooksDocs.docs) {
        let data = Doc.data();
        const newCode = {
          code: data.code,
          checked: data.approved ? "✅" : "◻",
          id: Doc.id
        };
        experimentCodes.push(newCode);
      }
      setNewexperimentCodes(experimentCodes);
    }
  }, [project]);


  const checkCodeAdmin = async clickedCell => {
    if (clickedCell.field === "checked") {
      let codesApp = [...newCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isChecked = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;

        codesApp[appIdx] = {
          ...codesApp[appIdx],
          checked: isChecked ? "◻" : "✅"
        };
        setNewCodes(codesApp);

        const codesAppDoc = await firebase.db.collection("feedbackCodeBooks").doc(id).get();

        const codesAppData = codesAppDoc.data();

        let codeUpdate = {
          ...codesAppData,
          approved: !isChecked
        };
        let feedbackCodeBookRef = await firebase.db.collection("feedbackCodeBooks").doc(id);
        await feedbackCodeBookRef.update(codeUpdate);
      }
    }
  };

  const checkCodeExperimentAdmin = async clickedCell => {
    if (clickedCell.field === "checked") {
      let codesApp = [...newexperimentCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isChecked = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;

        codesApp[appIdx] = {
          ...codesApp[appIdx],
          checked: isChecked ? "◻" : "✅"
        };
        setNewexperimentCodes(codesApp);

        const codesAppDoc = await firebase.db.collection("experimentCodes").doc(id).get();

        const codesAppData = codesAppDoc.data();

        let codeUpdate = {
          ...codesAppData,
          approved: !isChecked
        };
        let feedbackCodeBookRef = await firebase.db.collection("experimentCodes").doc(id);
        await feedbackCodeBookRef.update(codeUpdate);
      }
    }
  };

  return (
    <>
      {email === "oneweb@umich.edu" && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            "& > :not(style)": {
              m: 3,
              m: 0,
              width: 700,
              height: "100%"
            },
            height: "96%",
            m: "50px 10px 100px 50px"
          }}
        >
          <Paper>
            <Typography variant="h6" gutterBottom marked="center" align="center">
              {" "}
              Code added by researchers{" "}
            </Typography>
            <DataGrid
              rows={newCodes}
              columns={codesColumn}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoPageSize
              autoHeight
              hideFooterSelectedRowCount
              loading={false}
              onCellClick={checkCodeAdmin}
            />
          </Paper>
          <Paper>
            <Typography variant="h6" gutterBottom marked="center" align="center">
              Code Added by Participants in the Experiment{" "}
            </Typography>
            <DataGrid
              rows={newexperimentCodes}
              columns={codesColumn}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoPageSize
              autoHeight
              hideFooterSelectedRowCount
              loading={false}
              onCellClick={checkCodeExperimentAdmin}
            />
          </Paper>
        </Box>
      )}
    </>
  );
};

export default CodeFeedback;