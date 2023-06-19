import React, { useState, useEffect, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { DataGrid } from "@mui/x-data-grid";
import { Grid, Box } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import axios from "axios";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { _codesColumn } from "./Columns";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import moment from "moment";

import Paper from "@mui/material/Paper";
import LoadingButton from "@mui/lab/LoadingButton";
import orderBy from "lodash.orderby";
import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
import SnackbarComp from "../../SnackbarComp";
import FormControl from "@mui/material/FormControl";

import Select from "@mui/material/Select";
import { Card, CardHeader, CardContent } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

const culumns = [
  { field: "participant", headerName: "Participant", width: 300 },
  { field: "surveyType", headerName: "Intreview for ", width: 300 },
  { field: "createdAt", headerName: "Submitted At", width: 300 }
];
const ThematicAnalysis = props => {
  const [converstaion, setConversation] = useState([]);
  const firebase = useRecoilValue(firebaseState);
  const [codeBooksChanges, setCodeBooksChanges] = useState([]);
  const [codeBooksLoaded, setCodeBooksLoaded] = useState(false);
  const [allExperimentCodes, setAllExperimentCodes] = useState([]);
  const project = useRecoilValue(projectState);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [newCode, setNewCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fullname = useRecoilValue(fullnameState);
  const [creating, setCreating] = useState(false);
  const [clickedCell, setCilckedCell] = useState(false);
  const [openAdminEditModal, setOpenEditAdminModal] = useState(false);
  const [openDeleteModalAdmin, setOpenDeleteModalAdmin] = useState(false);
  const [category, setCategory] = useState("");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [adminCodeData, setAdminCodeData] = useState({});
  const handleOpenAdminEditModal = () => setOpenEditAdminModal(true);
  const handleCloseAdminEditModal = () => setOpenEditAdminModal(false);
  const handleOpenDeleteModalAdmin = () => setOpenDeleteModalAdmin(true);
  const handleCloseDeleteModalAdmin = () => setOpenDeleteModalAdmin(false);
  const [code, setCode] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [mergeCode, setMergeCode] = useState(null);
  const [editor, setEditor] = useState(false);
  const [listOfTranscript, setListOfTranscript] = useState([]);
  const [allOfTranscript, setAllOfTranscript] = useState([]);
  const [surveyType, setSurveyType] = useState("");
  const [thematicAnalysisChanges, setThematicAnalysisChanges] = useState([]);
  const [addCodeFor, setAddCodeFor] = useState("");
  const [transcriptId, setTranscriptId] = useState(null);

  const [codesBook, setCodesBook] = useState({});
  const [previousTranscipt, setPreviousTranscipt] = useState([]);

  const codesColumn = [
    ..._codesColumn,
    {
      field: "action",
      headerName: "Action",
      renderCell: cellValues => {
        return (
          <>
            <IconButton
              sx={{ mR: "10px" }}
              edge="end"
              aria-label="edit"
              onClick={() => {
                setCode(cellValues.row.code);
                setCategory(cellValues.row.category || "");
                setAdminCodeData(cellValues.row);
                handleOpenAdminEditModal();
                setAddCodeFor(cellValues.row.title);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => {
                setAdminCodeData(cellValues.row);
                handleOpenDeleteModalAdmin();
              }}
            >
              <DeleteIcon />
            </IconButton>
          </>
        );
      }
    }
  ].filter(c => c.field !== "question" && c.field !== "addedBy");
  codesColumn[0].width = "900";
  useEffect(() => {
    const getResearcher = async () => {
      const researcher = await firebase.db.collection("researchers").doc(fullname).get();
      const data = researcher.data();
      setEditor(data?.isEditor);
    };
    if (firebase && fullname) {
      getResearcher();
    }
  }, [firebase, fullname]);

  //snapshots
  useEffect(() => {
    if (firebase) {
      const thematicAnalysisQuery = firebase.db.collection("thematicAnalysis").where("researcher", "==", fullname);
      const thematicAnalysisSnapshot = thematicAnalysisQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setThematicAnalysisChanges([...docChanges]);
      });
      return () => {
        setThematicAnalysisChanges([]);
        thematicAnalysisSnapshot();
      };
    }
  }, [firebase, fullname]);

  useEffect(() => {
    if (firebase) {
      let CodeBooksQuery = firebase.db.collection("feedbackCodeBooks").where("project", "==", project);
      const passagesSnapshot = CodeBooksQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setCodeBooksChanges([...docChanges]);
        setCodeBooksLoaded(true);
      });
      return () => {
        setCodeBooksChanges([]);
        passagesSnapshot();
      };
    }
  }, [firebase, project]);

  useEffect(() => {
    const allPrevious = [...previousTranscipt];
    if (!thematicAnalysisChanges.length) return;
    for (let change of thematicAnalysisChanges) {
      const data = change.doc.data();
      if (data.hasOwnProperty("ignore") && data.ignore) continue;
      const id = data.transcriptId;
      const createdAt = moment(new Date(data.createdAt.toDate())).format("MMM DD YYYY HH:mm");
      if (change.type === "added") {
        const obj = { id, ...data, createdAt };
        const existingIndex = allPrevious.findIndex(t => {
          return t.id === id;
        });
        if (existingIndex === -1) {
          allPrevious.push(obj);
        } else {
          allPrevious[existingIndex] = {
            ...allPrevious[existingIndex],
            ...data,
            createdAt
          };
        }
      } else if (change.type === "modified") {
        const existingIndex = allPrevious.findIndex(c => {
          return c.id === id;
        });
        if (existingIndex !== -1) {
          allPrevious[existingIndex] = {
            ...allPrevious[existingIndex],
            ...data,
            createdAt
          };
        }
      }
    }
    setPreviousTranscipt(allPrevious);
  }, [firebase, fullname, thematicAnalysisChanges]);

  useEffect(() => {
    const getTranscript = async () => {
      const _listOfTranscript = [];
      const _allOfTranscript = [];
      const transcriptDocs = await firebase.db.collection("transcript").get();
      for (let doc of transcriptDocs.docs) {
        const data = doc.data();
        if (!data.coders || !data.coders.includes(fullname)) {
          _listOfTranscript.push({ id: doc.id, ...data });
        }
        _allOfTranscript.push({ id: doc.id, ...data });
      }
      setListOfTranscript(_listOfTranscript);
      setTranscriptId(_listOfTranscript[0]?.id || "");
      setConversation(_listOfTranscript[0]?.conversation || []);
      setAllOfTranscript(_allOfTranscript);
      setSurveyType(_listOfTranscript[0]?.surveyType || "");
    };
    getTranscript();
  }, [firebase]);

  useEffect(() => {
    const func = async () => {
      const allCodes = [...allExperimentCodes];
      for (let change of codeBooksChanges) {
        const data = change.doc.data();
        const id = change.doc.id;

        if (change.type === "added") {
          const obj = { id, ...data };
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex === -1) {
            allCodes.push(obj);
          } else {
            allCodes[existingIndex] = { ...allCodes[existingIndex], ...data };
          }
        } else if (change.type === "modified") {
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex !== -1) {
            allCodes[existingIndex] = { ...allCodes[existingIndex], ...data };
          }
        } else if (change.type === "removed") {
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex !== -1) {
            allCodes.splice(existingIndex, 1);
          }
        }
      }
      setAllExperimentCodes(allCodes);
    };

    if (codeBooksChanges.length > 0) {
      func();
    }
  }, [codeBooksChanges, codeBooksLoaded]);

  const approvedCodes = useMemo(() => {
    const codeMap = {};
    const filtered = allExperimentCodes.filter(c => {
      let exist = codeMap[c.code] || false;
      codeMap[c.code] = true;
      return c.approved && !exist && c.title === surveyType;
    });

    return filtered.sort((a, b) => a.code - b.code);
  }, [allExperimentCodes, project, surveyType]);

  const adminCodes = useMemo(() => {
    const mapped = allExperimentCodes.map(c => {
      if (c.project === "OnlineCommunities") {
        return {
          id: c.id,
          code: c.code,
          coder: c.coder,
          addedBy: c.addedBy,
          category: c.category,
          title: c?.title || "",
          question: c.question,
          approved: c.approved ? "✅" : "◻",
          rejected: c.rejected ? "❌" : "◻"
        };
      }
      return {};
    });

    return orderBy(
      mapped.filter(row => row.id),
      ["coder", "code"],
      ["asc", "asc"]
    );
  }, [allExperimentCodes, project]);

  const handleCellClick = async clickedCell => {
    if (clickedCell.field === "approved") {
      let codesApp = [...adminCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isApproved = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;
        let codeUpdate;

        codeUpdate = {
          approved: !isApproved
        };
        codeUpdate["rejected"] = false;

        const codeRef = firebase.db.collection("feedbackCodeBooks").doc(id);
        await codeRef.update(codeUpdate);

        const msg = !isApproved ? "Code approved" : "Code rejected";
        setSnackbarMessage(msg);
      }
    }
    if (clickedCell.field === "rejected") {
      let codesApp = [...adminCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isRejected = codesApp[appIdx][clickedCell.field] === "❌";
      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;
        let codeUpdate;
        codeUpdate = {
          rejected: !isRejected
        };
        codeUpdate["approved"] = false;
        const codeRef = firebase.db.collection("feedbackCodeBooks").doc(id);
        await codeRef.update(codeUpdate);

        const msg = !isRejected ? "Code rejected" : "Code approved";
        setSnackbarMessage(msg);
      }
    }
  };

  const handleSentencesSelect = c => {
    const _codesBook = { ...codesBook };
    if (!_codesBook.hasOwnProperty(c)) {
      _codesBook[c] = [];
    }
    setSelectedQuote(c);
    setCodesBook(_codesBook);
  };

  const handleCodesSelected = code => {
    const _codesBook = { ...codesBook };
    if (!selectedQuote || !_codesBook.hasOwnProperty(selectedQuote)) return;
    if (!_codesBook[selectedQuote].includes(code)) {
      _codesBook[selectedQuote].push(code);
    } else {
      _codesBook[selectedQuote] = _codesBook[selectedQuote].filter(c => c !== code);
    }
    setCodesBook(_codesBook);
  };

  const CodeList = ({ codes }) => {
    const codesByCategory = {};
    for (const code of codes) {
      if (!codesByCategory[code.category]) {
        codesByCategory[code.category] = [];
      }
      codesByCategory[code.category].push(code);
    }
    const cards = Object.entries(codesByCategory).map(([category, codes]) => (
      <Card key={category} sx={{ mb: 1 }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              {category}
            </Typography>
          }
          sx={{ bgcolor: "grey.300" }}
        />
        <CardContent sx={{ p: 0 }}>
          {codes.map(codeData => (
            <ListItem key={codeData.id} disablePadding>
              <ListItemButton value={codeData.code} onClick={() => handleCodesSelected(codeData.code)} sx={{ p: 0 }}>
                {codesBook.hasOwnProperty(selectedQuote) && codesBook[selectedQuote].includes(codeData.code) ? (
                  <Checkbox checked={true} color="success" />
                ) : (
                  <Checkbox checked={false} />
                )}
                <Box sx={{ display: "inline" }}>{codeData.code}</Box>
              </ListItemButton>
            </ListItem>
          ))}
        </CardContent>
      </Card>
    ));

    return <div>{cards}</div>;
  };

  const ConversationList = ({ codes }) => {
    // group the codes by category
    // create a card for each category
    const cards = converstaion.map((conv, index) => (
      <Card key={conv.sentence + index} sx={{ mb: 1 }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              {conv.speaker + " : "}
            </Typography>
          }
          sx={{ bgcolor: "grey.300" }}
        />
        <CardContent sx={{ p: 0 }}>
          {[
            ...new Set(
              conv.sentence
                .replace(/"/g, "")
                .split(".")
                .filter(x => x.trim())
            )
          ].map((sentence, index) => (
            <ListItem key={sentence + index} disablePadding>
              <ListItemButton
                value={sentence}
                onClick={() => handleSentencesSelect(sentence)}
                sx={{
                  p: 2.5,
                  backgroundColor:
                    selectedQuote?.trim() === sentence?.trim()
                      ? "#e0f7fa"
                      : codesBook.hasOwnProperty(sentence) && codesBook[sentence] && codesBook[sentence].length > 0
                      ? "#a2cf6e"
                      : "transparent",
                  zIndex: selectedQuote?.trim() === sentence?.trim() ? 100 : "auto"
                }}
              >
                <Box sx={{ display: "inline" }}>{sentence}</Box>
              </ListItemButton>
            </ListItem>
          ))}
        </CardContent>
      </Card>
    ));

    return <div>{cards}</div>;
  };

  const handleAddNewCode = async () => {
    setCreating(true);
    const researcherRef = firebase.db.collection("researchers").doc(fullname);
    const researcherGet = await researcherRef.get();
    const researcherData = researcherGet.data();

    const researcherUpdates = {
      projects: {
        ...researcherData.projects,
        [project]: {
          ...researcherData.projects[project]
        }
      }
    };
    const codesRef = firebase.db.collection("feedbackCodeBooks").doc();
    const findCode = approvedCodes.find(codeData => codeData.code === newCode);
    if (!approvedCodes.includes(findCode) && newCode !== "") {
      codesRef.set({
        project,
        addedBy: "Researcher",
        code: newCode,
        coder: fullname,
        checked: false,
        approved: true,
        rejected: false,
        title: surveyType,
        category: "no_category",
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      });

      if ("codesGenerated" in researcherUpdates.projects[project]) {
        researcherUpdates.projects[project].codesGenerated += 1;
      } else {
        researcherUpdates.projects[project].codesGenerated = 1;
      }
      setSnackbarMessage("You successfully submitted your code!");
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
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const _codesBook = { ...codesBook };
      for (let sentence in _codesBook) {
        if (_codesBook[sentence].length === 0) {
          delete _codesBook[sentence];
        }
      }
      await axios.post("/submitThematic", {
        codesBook: _codesBook,
        transcriptId,
        fullname,
        surveyType,
        participant: allOfTranscript.find(transcript => transcript.id === transcriptId).participant,
        project: "OnlineCommunities"
      });
      const _listOfTranscript = [...listOfTranscript].filter(transcript => transcript.id !== transcriptId);
      setListOfTranscript(_listOfTranscript);
      if (_listOfTranscript.length !== 0) {
        setTranscriptId(_listOfTranscript[0].id);
        setConversation(_listOfTranscript[0].conversation);
        setSurveyType(_listOfTranscript[0].surveyType);
        setCodesBook({});
      } else {
        setTranscriptId("");
        setConversation([]);
        setCodesBook({});
        setSurveyType("");
      }
      setSnackbarMessage("You successfully submitted your selection!");
      setCilckedCell(false);
    } catch (error) {
      setSnackbarMessage(
        "There is some error while submitting your selection, please try again or talk to iman about the issue!"
      );
      setSubmitting(false);
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };
  const handleCellClickTranscript = clickedCell => {
    const findTranscript = previousTranscipt.find(t => t.id === clickedCell.id);
    const findT = allOfTranscript.find(t => t.id === clickedCell.id);
    setConversation(findT.conversation);
    setTranscriptId(clickedCell.id);
    setCodesBook(findTranscript.codesBook);
    setCilckedCell(true);
    setSurveyType(findT.surveyType);
  };
  const handleCancel = () => {
    setCilckedCell(false);
    if (listOfTranscript.length !== 0) {
      setTranscriptId(listOfTranscript[0].id);
      setConversation(listOfTranscript[0].conversation);
      setSurveyType(listOfTranscript[0].surveyType);
      setCodesBook({});
    } else {
      setTranscriptId("");
      setConversation([]);
      setCodesBook({});
      setSurveyType("");
    }
  };
  const handleAdminEdit = async () => {
    try {
      setSubmittingUpdate(true);
      await axios.post("/updateThematicCode", {
        oldCodeId: adminCodeData.id,
        newCode: code,
        mergeCode,
        category,
        title: addCodeFor
      });
      setCode("");
      setCategory("");
      setAdminCodeData({});
      handleCloseAdminEditModal();
      setOpenEditAdminModal(false);
      setSubmittingUpdate(false);
      setMergeCode(null);
      setSnackbarMessage("Uptaded successful!");
    } catch (err) {
      setSnackbarMessage("There is some error while updating your code, please try after some time!");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleAdminDelete = async () => {
    try {
      setDeleting(true);
      axios.post("/deleteThematicCode", {
        deleteCode: adminCodeData
      });
      setCode("");
      setAdminCodeData({});
      handleCloseDeleteModalAdmin();
      setSnackbarMessage("code successfully deleted!");
      setDeleting(false);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("There is some error while deleting your code, please try after some time!");
    }
  };
  let categories = useMemo(() => {
    const _categories = [];
    for (let code of allExperimentCodes) {
      if (!_categories.includes(code.category)) {
        _categories.push(code.category);
      }
    }
    return _categories;
  }, [allExperimentCodes]);
  const handleChange = event => {
    setCategory(event.target.value);
  };

  const handleInputChange = event => {
    setNewCategory(event.target.value);
  };

  const handleNewCategory = () => {
    const _newCategory = newCategory.trim();

    if (_newCategory !== "" && !categories.includes(_newCategory)) {
      categories.push(_newCategory);
      setCategory(_newCategory);
    }
    setNewCategory("");
  };

  const handleMerge = event => {
    setMergeCode(event.target.value);
  };
  const handleTitle = event => {
    setAddCodeFor(event.target.value);
  };
  return (
    <Box>
      {surveyType && <h2 style={{ alignSelf: "center", marginLeft: "5px" }}> Intreview Session for : {surveyType}</h2>}
      <Box sx={{ ml: "15px", mr: "15px", mt: "15px" }}>
        <Grid container spacing={0.5}>
          <Grid item xs={6}>
            <h2 style={{ alignSelf: "center" }}> Conversation : </h2>
            <Box height={600} overflow="auto">
              {converstaion.length > 0 ? (
                <ConversationList />
              ) : (
                <Alert severity="info" variant="outlined" className="VoteActivityAlert">
                  unfortunately there is no new Converstation for you to Code{" "}
                </Alert>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <h2 style={{ display: "flex", alignItems: "center" }}>The Codebook</h2>
            <Box height={600} overflow="auto">
              <CodeList codes={approvedCodes} />
              <Alert severity="success" className="VoteActivityAlert" sx={{ ml: "0px" }}>
                If the code you're looking for does not exist in the list above, add it below:
                <br />
              </Alert>
              <TextField
                label="Add your code here."
                variant="outlined"
                value={newCode}
                fullWidth
                multiline
                rows={4}
                sx={{ width: "95%", m: 0.5 }}
                onChange={event => setNewCode(event.currentTarget.value)}
              />
              <Box>
                <Button
                  variant="contained"
                  style={{ margin: "5px 5px 5px 5ox" }}
                  onClick={handleAddNewCode}
                  disabled={(!newCode || newCode === "") && !creating}
                >
                  {creating ? <CircularProgress color="warning" size="16px" /> : "Create"}
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} style={{ display: "flex", justifyContent: "left" }}>
            {converstaion.length > 0 && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                color="success"
                size="large"
                disabled={submitting}
                className={!submitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
              >
                {submitting ? <CircularProgress color="warning" size="16px" /> : clickedCell ? "update" : "Submit"}
              </Button>
            )}
            {clickedCell && (
              <Button
                variant="contained"
                onClick={handleCancel}
                size="large"
                disabled={submitting}
                className={!submitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
                style={{ backgroundColor: "red" }}
              >
                {submitting ? <CircularProgress color="warning" size="16px" /> : "Cancel"}
              </Button>
            )}
          </Grid>
        </Grid>
        <Alert severity="warning" className="VoteActivityAlert">
          Click any of the conversations that you previously coded. It'll populate your codes on top. Then, you can
          revise them.
        </Alert>
        <Box sx={{ mb: "50px" }}>
          <Paper>
            <DataGrid
              rows={previousTranscipt}
              columns={culumns}
              pageSize={15}
              rowsPerPageOptions={[10]}
              autoPageSize
              autoHeight
              hideFooterSelectedRowCount
              loading={false}
              onCellClick={handleCellClickTranscript}
            />
          </Paper>
        </Box>

        {mergeCode && (
          <Alert severity="error" className="VoteActivityAlert">
            This code <strong>{code}</strong> will be merged into this code <strong>{mergeCode}</strong>!<br></br>
            The new code will be <strong>{mergeCode}</strong>!
          </Alert>
        )}
        {editor && (
          <Box sx={{ mb: "50px" }}>
            {openAdminEditModal && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "15px", justifyContent: "center" }}>
                <TextField
                  label="Add your code here."
                  variant="outlined"
                  value={code}
                  multiline
                  rows={4}
                  sx={{ width: "45%", m: 0.5 }}
                  onChange={event => setCode(event.target.value)}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "15px", justifyContent: "center" }}>
                  <Select value={category} onChange={handleChange} label="category" id="category">
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    label="New Category"
                    value={newCategory}
                    onChange={handleInputChange}
                    onBlur={handleNewCategory}
                    onKeyDown={event => {
                      if (event.key === "Enter") {
                        handleNewCategory();
                      }
                    }}
                  />
                  <FormControl className="select" variant="outlined" style={{ width: "160px" }}>
                    <InputLabel>Code For</InputLabel>
                    <Select label="Code For" value={addCodeFor} onChange={handleTitle} id="merge-code">
                      {["instructor", "student"].map(title => (
                        <MenuItem key={title} value={title}>
                          {title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl className="select" variant="outlined" style={{ width: "160px" }}>
                    <InputLabel>Merge Code</InputLabel>
                    <Select label="New Category" value={mergeCode} onChange={handleMerge} id="merge-code">
                      <MenuItem key={null} value={null}>
                        {"Ignore merging"}
                      </MenuItem>
                      {approvedCodes
                        .filter(c => c.code !== code)
                        .map(c => (
                          <MenuItem key={c.id} value={c.code}>
                            {c.code}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <LoadingButton
                    loading={submittingUpdate}
                    disabled={submittingUpdate}
                    onClick={handleAdminEdit}
                    loadingPosition="start"
                    variant="outlined"
                  >
                    {submittingUpdate ? `Updating...` : `Update`}
                  </LoadingButton>

                  <Button
                    onClick={() => {
                      setCode("");
                      handleCloseAdminEditModal();
                      setMergeCode(null);
                      setAddCodeFor("");
                    }}
                  >
                    cancel
                  </Button>
                </Box>
              </Box>
            )}
            <Paper>
              <DataGrid
                rows={adminCodes}
                columns={codesColumn}
                pageSize={10}
                rowsPerPageOptions={[10]}
                autoPageSize
                autoHeight
                hideFooterSelectedRowCount
                loading={false}
                onCellClick={handleCellClick}
              />
            </Paper>
          </Box>
        )}
        <Dialog open={openDeleteModalAdmin} onClose={handleCloseDeleteModalAdmin}>
          <DialogTitle sx={{ fontSize: "15px" }}></DialogTitle>
          <DialogContent>Are you sure, you want to delete?</DialogContent>
          <DialogActions>
            <Button disabled={deleting} onClick={handleAdminDelete}>
              Yes
            </Button>
            <Button
              onClick={() => {
                setAdminCodeData({});
                handleCloseDeleteModalAdmin();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
      </Box>
    </Box>
  );
};

export default ThematicAnalysis;
