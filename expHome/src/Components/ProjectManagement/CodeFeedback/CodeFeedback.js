import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Sheet from "@mui/joy/Sheet";
import { DataGrid } from "@mui/x-data-grid";
import GridCellToolTip from "../../GridCellToolTip";

import Typography from "@mui/material/Typography";

import Paper from "@mui/material/Paper";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import Box from "@mui/material/Box";

import { firebaseState, fullnameState, isAdminState } from "../../../store/AuthAtoms";
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
  const fullname = useRecoilValue(fullnameState);
  console.log('fullname', fullname);
  const project = useRecoilValue(projectState);
  const [newCode, setNewCode] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [codes, setCodes] = useState([]);
  const [feed, setFeed] = useState({});
  const [retrieveNext, setRetrieveNext] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [checked, setChecked] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [selected, setSelected] = useState(new Array(100).fill(false));
  const [quotesSelectedForCodes, setQuotesSelectedForCodes] = useState({});
  const [selecte, setSelecte] = useState(null);
  const [docId, setDocId] = useState("");
  const isAdmin = useRecoilValue(isAdminState);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let approvedFeedbackCodeBooks = [];
    const feedbackCodeBooksDocs = await firebase.db
      .collection("feedbackCodeBooks")
      .where("project", "==", project)
      .get();

    let FeedbackCodeBooksCodes = [];
    console.log(feedbackCodeBooksDocs);
    for (let Doc of feedbackCodeBooksDocs.docs) {
      let data = Doc.data();
      const newCode = {
        code: data.code,
        checked: data.approved ? "✅" : "◻",
        id: Doc.id
      };
      FeedbackCodeBooksCodes.push(newCode);
      if (data.approved) {
        approvedFeedbackCodeBooks.push(data.code);
      }
    }
    console.log(approvedFeedbackCodeBooks.length);
    setCodes(approvedFeedbackCodeBooks);
    setNewCodes(FeedbackCodeBooksCodes);
    console.log(approvedFeedbackCodeBooks);
    let quotesSelectedForCode = { ...quotesSelectedForCodes };
    for (let code of approvedFeedbackCodeBooks) {
      quotesSelectedForCode[code] = [];
    }
    setQuotesSelectedForCodes(quotesSelectedForCode);
    console.log({ quotesSelectedForCode });
  }, [project]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let foundResponse = false;
    const feedbackCodesDocs = await firebase.db
      .collection("codefeedbacks")
      .where("approved", "==", false)
      .where("project", "==", project)
      .get();

    for (let feedbackDoc of feedbackCodesDocs.docs) {
      const feedbackData = feedbackDoc.data();
      let response = feedbackData.explanation.split(".").filter(e => !["", " "].includes(e));
      setSentences(response);
      setDocId(feedbackDoc.id);
      console.log({ feedbackDoc: feedbackDoc.id });
      const myCodesLength = Object.keys(feedbackData.codes[fullname]).length;
      if (codes.length > myCodesLength && fullname) {
        foundResponse = true;
        const myCodes = Object.keys(feedbackData.codes[fullname]);
        for (let code of myCodes) {
          quotesSelectedForCodes[code] = feedbackData.codes[fullname][code];
        }
        setQuotesSelectedForCodes(quotesSelectedForCodes);
      } else {
        foundResponse = true;
      }

      setSubmitting(false);

      if (foundResponse) {
        break;
      }
    }
  }, [firebase, retrieveNext, project]);

  // set new code.
  const handleCodeChange = event => setNewCode(event.currentTarget.value);

  // add new code to the database
  const handleAddNewCode = async () => {
    debugger;
    setCreating(true);

    const researcherRef = await firebase.db.collection("researchers").doc(fullname);
    const researcherGet = await researcherRef.get();
    const researcherData = await researcherGet.data();
    console.log({ researcherData });

    const researcherUpdates = {
      projects: {
        ...researcherData.projects,
        [project]: {
          ...researcherData.projects[project]
        }
      }
    };
    const codesRef = firebase.db.collection("feedbackCodeBooks").doc();
    const feedCodesRef = firebase.db.collection("feedbackCodes").doc();

    let codef = [];
    codes.forEach(code => codef.push(code.code));
    if (!codef.includes(newCode) && newCode !== "") {
      codesRef.set({
        approved: false,
        project,
        code: newCode,
        coder: fullname,
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      });

      if ("codesGenerated" in researcherUpdates.projects[project]) {
        researcherUpdates.projects[project].codesGenerated += 1;
      } else {
        researcherUpdates.projects[project].codesGenerated = 1;
      }
      setSnackbarMessage("You successfully submitted your code!");
      setCodes([...codes, newCode]);
    } else {
      setSnackbarMessage("this code already exist try to add new code! ");
    }
    if ("codesNum" in researcherUpdates.projects[project]) {
      researcherUpdates.projects[project].codesNum += 1;
    } else {
      researcherUpdates.projects[project].codesNum = 1;
    }

    await researcherRef.update(researcherUpdates);

    setNewCode("");
    setCreating(false);
  };

  const handleSelectedCode = async idx => {
    let selecting = new Array(codes.length).fill(false);
    selecting[idx] = true;
    setSelected(selecting);
    setSelecte(codes[idx]);
  };

  const handleQuotesSelected = value => () => {
    const currentIndex = quotesSelectedForCodes[selecte].indexOf(value);
    const newChecked = quotesSelectedForCodes[selecte];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
    let quotesSelectedForCode = { ...quotesSelectedForCodes };
    quotesSelectedForCode[selecte] = newChecked;
    setQuotesSelectedForCodes(quotesSelectedForCode);
    console.log({ quotesSelectedForCodes });
  };

  // here we go through all the codes and check the ones
  // that the voter have chosen and append them to his name in the codefeedbacks collection
  const handleSubmit = async () => {
    setSubmitting(true);
    console.log({ docId });
    const feedbackCodesDoc = await firebase.db.collection("codefeedbacks").doc(docId).get();
    const feedbackCodeData = feedbackCodesDoc.data();
    let researcherVotes = {};
    let codesVotes = {};
    console.log({ quotesSelectedForCodes });
    codes.forEach(code => {
      researcherVotes[code] = quotesSelectedForCodes[code];
      if (quotesSelectedForCodes[code].length !== 0) {
        codesVotes[code] = [fullname];
      } else {
        codesVotes[code] = [];
      }
    });
    console.log({ coders: feedbackCodeData.coders });
    let feedbackCodeUpdate = {
      codes: {
        ...feedbackCodeData.codes,
        [fullname]: researcherVotes
      },
      coders: feedbackCodeData.coders.includes(fullname)
        ? feedbackCodeData.coders
        : [...feedbackCodeData.coders, fullname],
      codesVotes
    };
    let recievePoints = [];
    let recieveNegativePoints = [];
    const keys = Object.keys(feedbackCodeData.codesVotes);
    console.log({ keys });
    console.log({ feedbackCodeData: feedbackCodeData.coders.length });
    if (feedbackCodeData.coders.length === 3) {
      for (let key of keys) {
        if (feedbackCodeData.codesVotes[key].length >= 3) {
          for (let researcher of feedbackCodeData.codesVotes[key]) {
            recievePoints.push(researcher);
          }
        } else {
          for (let researcher of feedbackCodeData.codesVotes[key]) {
            recieveNegativePoints.push(researcher);
          }

        }
      }
      console.log("recievePoints::::::::::::::::", recievePoints);
    }

    for (let res of recieveNegativePoints) {
      const researcherRef = await firebase.db.collection("researchers").doc(res);
      const researcherData = researcherRef.get().data();

      const researcherUpdates = {
        projects: {
          ...researcherData.projects,
          [project]: {
            ...researcherData.projects[project]
          }
        }
      };
      if ("negativeGradingPoints" in researcherUpdates.projects[project]) {
        researcherUpdates.projects[project].negativeGradingPoints += 0.5;
      } else {
        researcherUpdates.projects[project].negativeGradingPoints = 0.5;
      }
      await researcherRef.update(researcherUpdates);
    }

    for (let res of recievePoints) {
      const researcherRef = await firebase.db.collection("researchers").doc(res);
      const researcherData = researcherRef.get().data();

      const researcherUpdates = {
        projects: {
          ...researcherData.projects,
          [project]: {
            ...researcherData.projects[project]
          }
        }
      };
      if ("positiveGradingPoints" in researcherUpdates.projects[project]) {
        researcherUpdates.projects[project].positiveGradingPoints += 0.5;
      } else {
        researcherUpdates.projects[project].positiveGradingPoints = 0.5;
      }
      await researcherRef.update(researcherUpdates);
    }
    const feedbackCodesRef = await firebase.db.collection("codefeedbacks").doc(docId);

    feedbackCodesRef.update(feedbackCodeUpdate);
    setRetrieveNext(oldValue => oldValue + 1);
    console.log(feedbackCodeUpdate);
  };

  const checkCodeAdmin = async (clickedCell) => {

    if (clickedCell.field === "checked") {

      let codesApp = [...newCodes];
      const appIdx = codesApp.findIndex((acti) => acti.id === clickedCell.id);
      const isChecked = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;

        codesApp[appIdx] = {
          ...codesApp[appIdx],
          checked: isChecked ? "◻" : "✅",
        };
        setNewCodes(codesApp);


        const codesAppDoc = await firebase.db
          .collection("feedbackCodeBooks")
          .doc(id)
          .get();

        const codesAppData = codesAppDoc.data();

        let codeUpdate = {
          ...codesAppData,
          approved: !isChecked,
        };
        let feedbackCodeBookRef = await firebase.db.collection("feedbackCodeBooks").doc(id);
        await feedbackCodeBookRef.update(codeUpdate);
      }
    }
  };

  const checkCodeExperimentAdmin = async (clickedCell) => {

    if (clickedCell.field === "checked") {

      let codesApp = [...newexperimentCodes];
      const appIdx = codesApp.findIndex((acti) => acti.id === clickedCell.id);
      const isChecked = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;

        codesApp[appIdx] = {
          ...codesApp[appIdx],
          checked: isChecked ? "◻" : "✅",
        };
        setNewexperimentCodes(codesApp);


        const codesAppDoc = await firebase.db
          .collection("experimentCodes")
          .doc(id)
          .get();

        const codesAppData = codesAppDoc.data();

        let codeUpdate = {
          ...codesAppData,
          approved: !isChecked,
        };
        let feedbackCodeBookRef = await firebase.db.collection("experimentCodes").doc(id);
        await feedbackCodeBookRef.update(codeUpdate);
      }
    }
  };

  console.log('RETURN:::::', { quotesSelectedForCodes });
  return (
    <>
      <Paper elevation={3} sx={{ margin: "19px 5px 70px 19px", height: 900 }}>
        <Typography variant="h6" margin-bottom="20px">
          For each different code,please choose which response(s) contains the code:
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 0
          }}
        >
          <Box>
            <Sheet variant="outlined" sx={{ position: "relative", overflow: "auto" }}>
              <List
                sx={{
                  paddingBlock: 1,
                  minWidth: 500,
                  height: 500,
                  "--List-decorator-width": "48px",
                  "--List-item-paddingLeft": "1.5rem",
                  "--List-item-paddingRight": "1rem"
                }}
              >
                {codes.map((code, idx) => (
                  <ListItem key={idx} disablePadding selected={selected[codes.indexOf(code)]}>
                    <ListItemButton role={undefined} onClick={() => handleSelectedCode(codes.indexOf(code))}>
                      <ListItemText id={`checkbox-list-label-${code}`} primary={`${code}`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Sheet>

            <Typography variant="h7">
              If the code you're looking for does not exist in the list above, add it below :
              <br />
            </Typography>

            <TextareaAutosize
              style={{ width: "80%", alignItems: "center" }}
              minRows={7}
              placeholder={"Add your code here."}
              onChange={handleCodeChange}
              value={newCode}
            />
            <Button variant="contained" style={{ margin: "5px" }} onClick={handleAddNewCode} disabled={creating}>
              {creating ? <CircularProgress color="warning" size="16px" /> : "Create"}
            </Button>
          </Box>
          <Box>
            <Sheet variant="outlined" sx={{ position: "relative", overflow: "auto" }}>
              <List
                sx={{
                  paddingBlock: 1,
                  minWidth: 500,
                  height: 500,

                  "--List-decorator-width": "48px",
                  "--List-item-paddingLeft": "1.5rem",
                  "--List-item-paddingRight": "1rem"
                }}
              >
                {sentences.map((value, idx) => {
                  const labelId = `checkbox-list-label-${value}`;

                  return (
                    <ListItem key={value} disablePadding>
                      <ListItemButton role={undefined} onClick={handleQuotesSelected(value)} dense>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selecte ? quotesSelectedForCodes[selecte].indexOf(value) !== -1 : false}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ "aria-labelledby": labelId }}
                          />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={` ${value}`} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Sheet>
          </Box>
        </Box>
        <Button
          variant="contained"
          style={{ margin: "19px 500px 0 580px" }}
          onClick={handleSubmit}
          color="success"
          size="large"
          disabled={submitting}
        >
          {submitting ? <CircularProgress color="warning" size="16px" /> : "Submit"}
        </Button>
      </Paper>
      {fullname === "Iman YeckehZaare" && <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          "& > :not(style)": {
            m: 3,
            m: 0,
            width: 700,
            height: "100%",
          },
          height: "96%",

        }}
      >
        <Paper>
          <Typography variant="h6" gutterBottom marked="center" align="center"> Code added by researchers </Typography>
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
          <Typography variant="h6" gutterBottom marked="center" align="center">Code Added by Participants in the Experiment </Typography>
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
      </Box>}
    </>
  );
};
export default CodeFeedback;
