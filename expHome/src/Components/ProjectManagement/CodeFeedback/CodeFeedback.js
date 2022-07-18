import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";

import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import Paper from "@mui/material/Paper";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import Box from "@mui/material/Box";

import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
import SnackbarComp from "../../SnackbarComp";
import { projectState } from "../../../store/ProjectAtoms";

const CodeFeedback = props => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  const [newCode, setNewCode] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [codes, setCodes] = useState([]);
  const [feed, setFeed] = useState({});
  const [retrieveNext, setRetrieveNext] = useState(0);
  const [submitting, setSubmitting] = useState(true);
  const [creating, setCreating] = useState(false);
  const [codeSelect, setCodeSelect] = useState([]);
  const [quotesSelect, setQuotesSelect] = useState([]);
  const [checked, setChecked] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [selected, setSelected] = useState(new Array(100).fill(false));
  const [quotesSelectedForCodes, setQuotesSelectedForCodes] = useState({});
  const [selecte, setSelecte] = useState("Final review of content");
  const [docId, setDocId] = useState("");

  useEffect(async () => {
    const feedbackCodeBooksDocs = await firebase.db.collection("feedbackCodeBooks").get();
    let coding = [];
    console.log(feedbackCodeBooksDocs);
    for (let Doc of feedbackCodeBooksDocs.docs) {
      let data = Doc.data();
      coding.push(data.code);
    }
    console.log(coding.length);
    setCodes(coding);
    console.log(coding);
    let quotesSelectedForCode = { ...quotesSelectedForCodes };
    for (let code of coding) {
      quotesSelectedForCode[code] = [];
    }
    setQuotesSelectedForCodes(quotesSelectedForCode);
    console.log(quotesSelectedForCode);
  }, [project]);

  useEffect(async () => {
    let foundResponse = false;
    const feedbackCodesDocs = await firebase.db.collection("codefeedbacks").where("project", "==", project).get();

    for (let feedbackDoc of feedbackCodesDocs.docs) {
      const feedbackData = feedbackDoc.data();
      let response = feedbackData.explanation.split(".").filter(e => !["", " "].includes(e));
      setSentences(response);
      if (!feedbackData.coders.includes(fullname)) {
        setDocId(feedbackDoc.id);
        const myCodes = Object.keys(feedbackData.codes[fullname]);
        for (let code of myCodes) {
          quotesSelectedForCodes[code] = feedbackData.codes[fullname][code];
        }
        setQuotesSelectedForCodes(quotesSelectedForCodes);
      }
      foundResponse = true;
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
      if (foundResponse) {
        break;
      }
    }
  }, [firebase, retrieveNext, project]);

  const codeChange = event => {
    setNewCode(event.currentTarget.value);
  };

  const addCode = async () => {
    setCreating(true);

    const researcherRef = await firebase.db.collection("researchers").doc(fullname);
    const researcherData = researcherRef.get().data();

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
    for (let code of codes) {
      codef.push(code.code);
    }
    if (!codef.includes(newCode) && newCode !== "") {
      codesRef.set({
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
    setTimeout(() => {
      setCreating(false);
    }, 1000);
  };

  const codeSelected = async idx => {
    let selecting = new Array(1000).fill(false);
    selecting[idx] = true;
    setSelected(selecting);
    setSelecte(codes[idx]);
  };

  const quotesSelected = value => () => {
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
    console.log(quotesSelectedForCodes);
  };

  //here we go through all the codes and check the ones
  //that the voter have chosen and append them to his name in the codefeedbacks collection
  const submit = async () => {
    setSubmitting(true);
    const feedbackCodesDoc = await firebase.db.collection("codefeedbacks").doc(docId).get();
    const feedbackCodeData = feedbackCodesDoc.data();
    console.log(docId);
    let researcherVotes = {};
    let codesVotes = {};
    console.log(quotesSelectedForCodes);
    for (let code of codes) {
      researcherVotes[code] = quotesSelectedForCodes[code];
      if (quotesSelectedForCodes[code].length !== 0) {
        codesVotes[code] = [fullname];
      } else {
        codesVotes[code] = [];
      }
    }
    console.log(feedbackCodeData.coders);
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
    const feedbackCodesRef = await firebase.db.collection("codefeedbacks").doc(docId);

    feedbackCodesRef.update(feedbackCodeUpdate);
    setRetrieveNext(oldValue => oldValue + 1);
    console.log(feedbackCodeUpdate);
  };
  return (
    <Box sx={{ m: "13px 13px 40px 13px", p: "19px" }}>
      <Typography variant="h5" margin-bottom="20px">
        For each different code,please choose which response(s) contains the code:
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          "& > :not(style)": {
            m: 0,
            width: 700,
            height: "96%"
          }
        }}
      >
        <Box
          sx={{
            width: 300,
            height: "30px"
          }}
        >
          <Paper sx={{ m: "13px 13px 40px 13px", p: "19px" }} square={true}>
            <List sx={{ width: "100%", maxWidth: 700, maxheight: 300, bgcolor: "background.paper" }}>
              {codes.map((code, idx) => {
                const labelId = `checkbox-list-label-${code}`;

                return (
                  <ListItem key={idx} disablePadding selected={selected[codes.indexOf(code)]}>
                    <ListItemButton role={undefined} onClick={() => codeSelected(codes.indexOf(code))}>
                      <ListItemText id={labelId} primary={`${code}`} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            <hr />
            <div style={{ padding: "0px 25px 25px 25px" }}>
              <Typography variant="h7" margin-bottom="20px">
                If the code you're looking for does not exist in the list above, add it below :
                <br />
              </Typography>

              <TextareaAutosize
                style={{ width: "80%", alignItems: "center" }}
                minRows={7}
                placeholder={"Add your code here."}
                onChange={codeChange}
                value={newCode}
              />
            </div>
            <Button variant="contained" style={{ margin: "5px" }} onClick={addCode} disabled={creating}>
              {creating ? <CircularProgress color="warning" size="16px" /> : "Create"}
            </Button>
          </Paper>
        </Box>
        <Paper sx={{ m: "13px 13px 40px 13px" }}>
          <List sx={{ width: "100%", maxWidth: 700, bgcolor: "background.paper" }}>
            {sentences.map((value, idx) => {
              const labelId = `checkbox-list-label-${value}`;

              return (
                <ListItem key={value} disablePadding>
                  <ListItemButton role={undefined} onClick={quotesSelected(value)} dense>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={quotesSelectedForCodes[selecte].indexOf(value) !== -1}
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
        </Paper>

        <Button
          variant="contained"
          style={{ margin: "10px" }}
          onClick={submit}
          color="success"
          size="large"
          disabled={submitting}
        >
          {submitting ? <CircularProgress color="warning" size="16px" /> : "Submit"}
        </Button>
      </Box>
    </Box>
  );
};
export default CodeFeedback;
