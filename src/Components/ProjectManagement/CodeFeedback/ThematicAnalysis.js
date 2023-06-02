import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { DataGrid } from "@mui/x-data-grid";
import { Grid, Box, Scrollbar } from "@mui/material";
import axios from "axios";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Sheet from "@mui/joy/Sheet";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { _codesColumn, feedBackCodesColumns } from "./Columns";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import Paper from "@mui/material/Paper";
import LoadingButton from "@mui/lab/LoadingButton";
import orderBy from "lodash.orderby";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
import SnackbarComp from "../../SnackbarComp";

import arrayToChunks from "../../../utils/arrayToChunks";
import { fetchRecentParticipants } from "../../../utils/researcher";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import { Card, CardHeader, CardContent } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { set } from "lodash";

const culumns = [{ field: "participant", headerName: "Participant", width: 300 }];
const ThematicAnalysis = props => {
  const [converstaion, setConversation] = useState([]);
  const firebase = useRecoilValue(firebaseState);
  const [codeBooksChanges, setCodeBooksChanges] = useState([]);
  const [codeBooksLoaded, setCodeBooksLoaded] = useState(false);
  const [allExperimentCodes, setAllExperimentCodes] = useState([]);
  const project = useRecoilValue(projectState);
  const online = project === "OnlineCommunities";
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const email = useRecoilValue(emailState);
  const [newCode, setNewCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fullname = useRecoilValue(fullnameState);
  const [creating, setCreating] = useState(false);
  const [clickedCell, setCilckedCell] = useState(false);
  const [openAdminEditModal, setOpenEditAdminModal] = useState(false);
  const [openDeleteModalAdmin, setOpenDeleteModalAdmin] = useState(false);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [feedbackCode, setFeedbackCode] = useState({});
  const [category, setCategory] = useState("");
  const [choiceConditions, setChoiceConditions] = useState({});
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [explanationIdsList, setExplanationIdsList] = useState({});
  const [adminCodeData, setAdminCodeData] = useState({});
  const handleOpenAdminEditModal = () => setOpenEditAdminModal(true);
  const handleCloseAdminEditModal = () => setOpenEditAdminModal(false);
  const handleOpenDeleteModalAdmin = () => setOpenDeleteModalAdmin(true);
  const handleCloseDeleteModalAdmin = () => setOpenDeleteModalAdmin(false);
  const [code, setCode] = useState("");
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const [listOfTranscript, setListOfTranscript] = useState([]);

  const [transcriptId, setTranscriptId] = useState(null);

  const [codesBook, setCodesBook] = useState({});
  const [previousTranscipt, setPreviousTranscipt] = useState([]);

  const [nextIndex, setNextIndex] = useState(0);

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
                console.log("first");
                setCode(cellValues.row.code);
                setCategory(cellValues.row.category || "");
                setAdminCodeData(cellValues.row);
                handleOpenAdminEditModal();
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => {
                console.log("first");
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
  ];
  useEffect(() => {
    const getTranscript = async () => {
      const _listOfTranscript = [];
      const _previousTranscipt = [];
      const _transcriptBooks = {};
      const transcriptDocs = await firebase.db.collection("transcript").get();
      const transcriptBooksDocs = await firebase.db.collection("thematicAnalysis").get();
      for (let doc of transcriptBooksDocs.docs) {
        const data = doc.data();
        if (data.researcher === fullname) {
          _transcriptBooks[data.transcriptId] = { id: doc.id, ...data };
        }
      }
      for (let doc of transcriptDocs.docs) {
        const data = doc.data();
        if (data.coders && data.coders.includes(fullname)) {
          _previousTranscipt.push({ id: doc.id, ...data, codesBook: _transcriptBooks[doc.id]?.codesBook || {} });
        } else {
          _listOfTranscript.push({ id: doc.id, ...data });
        }
      }
      setListOfTranscript(_listOfTranscript);
      setPreviousTranscipt(_previousTranscipt);
      setTranscriptId(_listOfTranscript[nextIndex].id);
      setConversation(_listOfTranscript[nextIndex].conversation);
    };
    getTranscript();
  }, [firebase]);

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
  }, [codeBooksChanges]);

  const approvedCodes = useMemo(() => {
    const codeMap = {};
    const filtered = allExperimentCodes.filter(c => {
      let exist = codeMap[c.code] || false;
      codeMap[c.code] = true;
      return c.approved && !exist;
    });

    return filtered.sort((a, b) => a.code - b.code);
  }, [allExperimentCodes, project]);

  const adminCodes = useMemo(() => {
    const mapped = allExperimentCodes.map(c => {
      if (online) {
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
      } else {
        if (c.project !== "OnlineCommunities") {
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
    const cards = converstaion.map(conv => (
      <Card key={conv.sentence} sx={{ mb: 1 }}>
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
        category: "no_category",
        title: "Researcher",
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
      const _codesBook = { ...codesBook };
      for (let sentence in _codesBook) {
        if (_codesBook[sentence].length === 0) {
          delete _codesBook[sentence];
        }
      }
      const thematicDocs = await firebase.db
        .collection("thematicAnalysis")
        .where("transcriptId", "==", transcriptId)
        .get();
      if (thematicDocs.docs.length > 0) {
        thematicDocs.docs[0].ref.update({
          codesBook: _codesBook,
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      } else {
        const ref = firebase.db.collection("thematicAnalysis").doc();
        ref.set({
          project,
          codesBook: _codesBook,
          transcriptId,
          researcher: fullname,
          createdAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
      }
      const trabscriptionRef = firebase.db.collection("transcript").doc(transcriptId);

      await trabscriptionRef.update({
        coders: firebase.firestore.FieldValue.arrayUnion(fullname)
      });
      const _listOfTranscript = [...listOfTranscript].filter(transcript => transcript.id !== transcriptId);
      const _previousTranscipt = [...previousTranscipt];
      setListOfTranscript(_listOfTranscript);
      if (_previousTranscipt.filter(transcript => transcript.id === transcriptId).length < 0) {
        _previousTranscipt.push({ id: transcriptId, codesBook: _codesBook });
        setPreviousTranscipt(_previousTranscipt);
      }
      if (_listOfTranscript.length !== 0) {
        setTranscriptId(_listOfTranscript[0].id);
        setConversation(_listOfTranscript[0].conversation);
        setCodesBook({});
      } else {
        setTranscriptId("");
        setConversation([]);
        setCodesBook({});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCellClickTranscript = clickedCell => {
    const findTranscript = previousTranscipt.find(transcript => transcript.id === clickedCell.id);
    setConversation(findTranscript.conversation);
    setTranscriptId(clickedCell.id);
    setCodesBook(findTranscript.codesBook);
    setCilckedCell(true);
  };
  const handleCancel = () => {
    setCilckedCell(false);
    if (listOfTranscript.length !== 0) {
      setTranscriptId(listOfTranscript[0].id);
      setConversation(listOfTranscript[0].conversation);
      setCodesBook({});
    } else {
      setTranscriptId("");
      setConversation([]);
      setCodesBook({});
    }
  };
  const handlChange = event => {
    setCategory(event.target.value);
  };
  const handleAdminEdit = async () => {
    try {
      setSubmittingUpdate(true);
      if (adminCodeData?.code && adminCodeData?.title) {
        const experimentCodes = [...allExperimentCodes];
        const updatefeedbackCodeBooksDoc = await firebase.db
          .collection("feedbackCodeBooks")
          .where("code", "==", adminCodeData.code)
          .where("project", "==", project)
          .get();
        // check if the code already exists in approvedCode or unapprovedCode
        const codes = experimentCodes.filter(elem => elem.code === code);
        if (codes.length >= 1) {
          const codeUpdate = {
            category
          };
          const ref = updatefeedbackCodeBooksDoc.docs[0].ref;
          await ref.update(codeUpdate);
          setSnackbarMessage("Uptaded successful!");
          setCode("");
          setCategory("");
          setAdminCodeData({});
          handleCloseAdminEditModal();
          setOpenEditAdminModal(false);
          setSubmittingUpdate(false);
          return;
        }
        for (let feedbackCodeDoc of updatefeedbackCodeBooksDoc.docs) {
          const codeData = feedbackCodeDoc.data();
          const codeUpdate = {
            ...codeData,
            code: code,
            category
          };
          await feedbackCodeDoc.ref.update(codeUpdate);
        }
        setSnackbarMessage(`Code updated !`);
        setCode("");
        setAdminCodeData({});
        handleCloseAdminEditModal();
        setOpenEditAdminModal(false);
        setSubmittingUpdate(false);
      }
    } catch (err) {
      setSnackbarMessage("There is some error while updating your code, please try after some time!");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleAdminDelete = async () => {
    try {
      setSubmittingDelete(true);
      let _allExperimentCodes = [...allExperimentCodes];
      _allExperimentCodes = _allExperimentCodes.filter(code => code.code !== adminCodeData.code);
      const updatefeedbackCodeBooksDoc = await firebase.db
        .collection("feedbackCodeBooks")
        .where("code", "==", adminCodeData.code)
        .get();
      for (let feedbackCodebookDoc of updatefeedbackCodeBooksDoc.docs) {
        await feedbackCodebookDoc.ref.delete();
      }
      setSnackbarMessage("code successfully deleted!");
      setCode("");
      setAdminCodeData({});
      handleCloseDeleteModalAdmin();
      setAllExperimentCodes(_allExperimentCodes);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("There is some error while deleting your code, please try after some time!");
    } finally {
      setSubmittingDelete(false);
    }
  };
  const categories = useMemo(() => {
    const _categories = [];
    for (let code of approvedCodes) {
      if (!_categories.includes(code.category)) {
        _categories.push(code.category);
      }
    }
    return _categories;
  }, [approvedCodes]);

  return (
    <>
      <Dialog open={openAdminEditModal} onClose={handleCloseAdminEditModal}>
        <DialogTitle sx={{ fontsize: "10px" }}>Update the code</DialogTitle>
        <DialogContent sx={{ width: "500px" }}>
          <TextField
            autoFocus
            margin="dense"
            id="code"
            label="Update the code here."
            fullWidth
            variant="standard"
            value={code}
            width="100%"
            onChange={event => setCode(event.target.value)}
          />
          <>Category : </>
          <Select value={category} onChange={handlChange} label="category" id="category">
            {categories.map(researcher => {
              return <MenuItem value={researcher}>{researcher}</MenuItem>;
            })}
          </Select>
        </DialogContent>
        <DialogActions>
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
            }}
          >
            cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ ml: "15px", mr: "15px", mt: "15px" }}>
        <Grid container spacing={0.5}>
          <Grid item xs={6}>
            <h2 style={{ alignSelf: "center" }}> Converstation : </h2>
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
          <Grid item xs={12} style={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              color="success"
              size="large"
              disabled={submitting}
              className={!submitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
            >
              {submitting ? <CircularProgress color="warning" size="16px" /> : "Submit"}
            </Button>

            {clickedCell && (
              <Button
                variant="contained"
                onClick={handleCancel}
                size="large"
                disabled={submitting}
                className={!submitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
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
        {email === "oneweb@umich.edu" && (
          <Box sx={{ mb: "50px" }}>
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
          <DialogTitle sx={{ fontSize: "15px" }}>Are you sure, you want to delete?</DialogTitle>
          <DialogContent>
            <Typography variant="h7" margin-bottom="20px">
              {adminCodeData.code}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAdminDelete}>Delete</Button>
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
    </>
  );
};

export default ThematicAnalysis;
