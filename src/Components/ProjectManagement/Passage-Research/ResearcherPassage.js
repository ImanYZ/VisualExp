/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import PassageComponent from "./PassageComponent";
import axios from "axios";
import SnackbarComp from "../../SnackbarComp";

import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Switch } from "@mui/material";

const ResearcherPassage = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [passages, setPassages] = useState([]);
  const [titles, setTitles] = useState([]);
  const [pConURL, setPConURL] = useState("");
  const [pConURL2, setPConURL2] = useState("");
  const [userCondition, setUserCondition] = React.useState({});
  const [userCondition2, setUserCondition2] = React.useState({});
  const [passage2, setPassage2] = useState({});
  const [passage1, setPassage1] = useState({});
  const [passageCondition, setPassageCondition] = React.useState(0);
  const [passageCondition2, setPassageCondition2] = React.useState(0);
  const [openEditModal, setOpenEditModal] = useState(false);
  const optionsConditions = ["H1", "H2", "K1", "K2", "L1", "L2"];
  const [newPhrase, setNewPhrase] = useState("");
  const [selectedPhrase, setSelectedPhrase] = useState("");
  const [passagTitle, setPassagTitle] = useState("");
  const handleOpenEditModal = () => setOpenEditModal(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const handleCloseAddPhraseModal = () => setOpenAddPhraseModal(false);
  const handleOpenddPhraseModal = () => setOpenAddPhraseModal(true);
  const [passagesChanges, setPassagesChanges] = useState([]);
  const [passagesLoadedUse, setPassagesLoadedUse] = useState(false);
  const [numberRecorded, setNumberRecorded] = useState(0);
  const [newPhraseAdded, setNewPhraseAdded] = useState();
  const [chosenPassage, setChosenPassage] = useState();
  const [openAddPhraseModal, setOpenAddPhraseModal] = useState(false);
  const [submtingNewPhrase, setSubmtingNewPhrase] = useState(false);
  const [updatingPhrase, setUpdatingPhrase] = useState(false);
  const [deletingPhrase, setDeletingPhrase] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [resetGrades, setResetGrades] = useState(false);
  const email = useRecoilValue(emailState);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editor, setEditor] = useState(false);

  useEffect(() => {
    const checkEditor = async () => {
      const researcherDoc = await firebase.db.collection("researchers").where("email", "==", email).get();
      if (researcherDoc.docs.length > 0) {
        const researcherData = researcherDoc.docs[0].data();
        setEditor(researcherData?.passageEditor || false);
      }
    };
    if (email && firebase) checkEditor();
  }, [email, firebase]);

  useEffect(() => {
    if (firebase) {
      const passagesQuery = firebase.db.collection("passages");

      const passagesSnapshot = passagesQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setPassagesChanges(oldPassagessChanges => {
          return [...oldPassagessChanges, ...docChanges];
        });
        setPassagesLoadedUse(true);
      });
      return () => {
        setPassagesChanges([]);
        passagesSnapshot();
      };
    }
  }, [firebase]);

  useEffect(() => {
    let _passages = [...passages];
    if (passagesLoadedUse) {
      const tempPassagesChanges = [...passagesChanges];
      setPassagesChanges([]);
      let _titles = titles;

      for (let change of tempPassagesChanges) {
        const pasageData = change.doc.data();
        let passageProjects = Object.keys(pasageData.projects);
        if (passageProjects.length !== 0) {
          if (change.type === "modified") {
            const passageIdx = _passages.findIndex(p => p.id === change.doc.id);
            _passages[passageIdx] = { ...pasageData, id: change.doc.id };
          } else {
            _passages.push({
              ...pasageData,
              id: change.doc.id
            });
            _titles.push(pasageData.title);
          }
        }
      }

      setPassages(_passages);
      if (firstLoad) {
        setTitles(_titles);
        setUserCondition(titles[0]);
        setPassageCondition("H2");
        setPConURL(_passages[0]["linkH2"]);
        setUserCondition2(titles[0]);
        setPassageCondition2("K2");
        setPConURL2(_passages[0]["linkK2"]);
        setPassage2(_passages[0]);
        setPassage1(_passages[0]);
        setFirstLoad(false);
      } else {
        const index1 = _passages.findIndex(p => p.id === passage1.id);
        const index2 = _passages.findIndex(p => p.id === passage2.id);
        setPassage1(_passages[index1]);
        setPassage2(_passages[index2]);
      }
      setPassagesLoadedUse(false);
    }
  }, [firebase, fullname, passagesLoadedUse]);

  const handlePassageChange = event => {
    const userCondition = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === userCondition);
    const passage = allPassages[fIndex];
    setPConURL(passage["linkH2"]);
    setUserCondition(userCondition);
    setPassageCondition("H2");
    setPassage1(passage);
  };

  const handlePassageConditionChange = event => {
    const pCondition = event.target.value;
    setPConURL(passage1[`link${pCondition}`]);
    setPassageCondition(pCondition);
  };

  const handlePassageChange2 = event => {
    const userCondition = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === userCondition);
    const passage = allPassages[fIndex];
    setPConURL2(passage["linkK2"]);
    setUserCondition2(userCondition);
    setPassageCondition2("K2");
    setPassage2(passage);
  };

  const handlePassageConditionChange2 = event => {
    const pCondition = event.target.value;
    setPConURL2(passage2[`link${pCondition}`]);
    setPassageCondition2(pCondition);
  };

  const hundleUpdatePhrase = async event => {
    try {
      setUpdatingPhrase(true);
      await firebase.idToken();
      await axios.post("/researchers/updatePhraseForPassage", { passagTitle, selectedPhrase, newPhrase, resetGrades });
      handleCloseEditModal();
      setUpdatingPhrase(false);
      setResetGrades(false);
      setSnackbarMessage("Phrase updated successfully");
    } catch (error) {
      handleCloseEditModal();
      setUpdatingPhrase(false);
      setResetGrades(false);
      console.log(error);
      window.alert("There was an error updating the phrase");
    }
  };

  const handleDeletePhrase = async event => {
    try {
      setDeletingPhrase(true);
      await firebase.idToken();
      const passageDoc = await firebase.db.collection("passages").where("title", "==", passagTitle).get();
      let numberRecord = 0;
      let allowDelete = true;
      if (numberRecorded === 0) {
        await firebase.idToken();
        const response = await axios.post("/researchers/calcultesRecallGradesRecords", {
          passageId: passageDoc.docs[0].id,
          selectedPhrase
        });
        numberRecord = response.data.numberRecord;
        setNumberRecorded(numberRecord);
        allowDelete = numberRecord === 0;
      }
      if (allowDelete) {
        setNumberRecorded(0);
        await firebase.idToken();
        await axios.post("/researchers/deletePhraseFromPassage", {
          passageId: passageDoc.docs[0].id,
          selectedPhrase
        });
        handleCloseDeleteModal();
        setSnackbarMessage("Phrase deleted successfully");
      }
      setDeletingPhrase(false);
    } catch (error) {
      console.log(error);
      window.alert("There was an error deleting the phrase");
      handleCloseDeleteModal();
      setDeletingPhrase(true);
    }
  };

  const handleAddNewPhrase = async () => {
    try {
      await firebase.idToken();
      await axios.post("/researchers/addNewPhraseForPassage", { chosenPassage, newPhraseAdded });
      handleCloseAddPhraseModal();
      setSubmtingNewPhrase(false);
      setNewPhraseAdded("");
      setSnackbarMessage("Phrase added successfully");
    } catch (error) {
      alert("There was an error adding the phrase");
      setSubmtingNewPhrase(false);
    }
  };

  const handleTypeOfQuestion = async (type, title, questionIndex) => {
    const passageDoc = await firebase.db.collection("passages").where("title", "==", title).get();
    const passageUpdate = passageDoc.docs[0].data();
    passageUpdate.questions[questionIndex] = {
      ...passageUpdate.questions[questionIndex],
      type
    };
    const passageRef = firebase.db.collection("passages").doc(passageDoc.docs[0].id);
    passageRef.update(passageUpdate);
  };

  const handleTypeOfPhrase = async (type, title, phraseIndex) => {
    try {
      const passageDoc = await firebase.db.collection("passages").where("title", "==", title).get();
      let passageData = passageDoc.docs[0].data();
      const newPhrasesTypes = new Array(passageData.phrases.length).fill("null");
      if (passageData.hasOwnProperty("phrasesTypes")) {
        newPhrasesTypes.forEach(
          (type, index) =>
            (newPhrasesTypes[index] = passageData.phrasesTypes[index] ? passageData.phrasesTypes[index] : "null")
        );
      }
      newPhrasesTypes[phraseIndex] = type;
      passageDoc.docs[0].ref.update({
        phrasesTypes: newPhrasesTypes
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handlNewPharse = event => {
    setNewPhrase(event.target.value);
  };

  const handlEditPharse = event => {
    setNewPhraseAdded(event.target.value);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setNewPhrase("");
    setUpdatingPhrase(false);
    setResetGrades(false);
  };

  const savePhrasesOrder = async ({ passageId, phrasesOrder, passageNum }) => {
    if (!editor) return;
    const passageIdx = passages.findIndex(p => p.id === passageId);
    const passage = passages[passageIdx];
    passage.phrases = phrasesOrder;
    if (passageNum === 1) {
      setPassage1(passage);
    } else {
      setPassage2(passage);
    }
    const passageRef = firebase.db.collection("passages").doc(passageId);
    await passageRef.update({
      phrases: phrasesOrder
    });
  };
  return (
    <Box>
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle sx={{ fontSize: "15px" }}> Update the phrase below:</DialogTitle>
        <DialogContent sx={{ width: "500px", mt: "5px" }}>
          <TextField
            label="Update the Phrase here."
            variant="outlined"
            value={newPhrase}
            onChange={handlNewPharse}
            fullWidth
            multiline
            rows={3}
            sx={{ width: "95%", m: 0.5 }}
          />
          <Switch checked={resetGrades} onChange={() => setResetGrades(previous => !previous)} color="secondary" />{" "}
          Toggle This if you think this Phrase needs to be graded again.
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={updatingPhrase} variant="contained" onClick={hundleUpdatePhrase}>
            Update
          </LoadingButton>
          <Button onClick={handleCloseEditModal} disabled={updatingPhrase}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <DialogTitle sx={{ fontSize: "15px" }}>Delete phrase : {selectedPhrase}</DialogTitle>
        <DialogContent sx={{ width: "500px", mt: "5px" }}>
          <Alert severity={numberRecorded !== 0 ? "error" : "warning"}>
            Are you sure, you want to delete this phrase ?
            <br />
            {numberRecorded !== 0 && `there are ${numberRecorded} already graded records for this phrase.`}
            <br />
          </Alert>
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={deletingPhrase} onClick={handleDeletePhrase}>
            Delete
          </LoadingButton>
          <Button
            onClick={() => {
              setSelectedPhrase("");
              setNumberRecorded(0);
              handleCloseDeleteModal();
              setDeletingPhrase(false);
            }}
            disabled={deletingPhrase}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddPhraseModal} onClose={handleCloseAddPhraseModal}>
        <DialogTitle sx={{ fontSize: "15px" }}>Your phrase will be added to the passage bellow</DialogTitle>
        <DialogContent sx={{ width: "500px" }}>
          <TextField
            label="New Phrase"
            variant="outlined"
            value={newPhraseAdded}
            onChange={handlEditPharse}
            fullWidth
            multiline
            rows={3}
            sx={{ width: "95%", m: 0.5 }}
          />
          {passages.find(p => p.title === chosenPassage)?.phrases.includes(newPhraseAdded) && (
            <Alert severity={numberRecorded !== 0 ? "error" : "warning"}>
              This phrase already exists in this passage.
              <br />
            </Alert>
          )}
          <Box sx={{ display: "flex", alignItems: "center", mt: "15px" }}>
            Add phrase for:
            <Select
              sx={{ ml: "15px" }}
              value={chosenPassage}
              onChange={event => setChosenPassage(event.target.value || "")}
            >
              <MenuItem value={chosenPassage}>{chosenPassage}</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            disabled={
              !newPhraseAdded ||
              !chosenPassage ||
              passages.find(p => p.title === chosenPassage).phrases.includes(newPhraseAdded)
            }
            variant="contained"
            loading={submtingNewPhrase}
            onClick={() => {
              handleAddNewPhrase();
              setSubmtingNewPhrase(true);
            }}
          >
            Add
          </LoadingButton>
          <Button
            variant="contained"
            onClick={() => {
              setNewPhraseAdded("");
              setChosenPassage("");
              handleCloseAddPhraseModal();
            }}
            disabled={submtingNewPhrase}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Box style={{ background: "#e2e2e2" }}>
        <Box style={{ display: "flex", height: "100%" }}>
          <PassageComponent
            editor={editor}
            email={email}
            passage={passage1}
            handleTypeOfQuestion={handleTypeOfQuestion}
            handleOpenddPhraseModal={handleOpenddPhraseModal}
            handleOpenEditModal={handleOpenEditModal}
            handlePassageChange={handlePassageChange}
            setChosenPassage={setChosenPassage}
            passages={passages}
            optionsConditions={optionsConditions}
            pConURL={pConURL}
            passageCondition={passageCondition}
            handlePassageConditionChange={handlePassageConditionChange}
            userCondition={userCondition}
            setPassagTitle={setPassagTitle}
            setNewPhrase={setNewPhrase}
            setSelectedPhrase={setSelectedPhrase}
            handleOpenDeleteModal={handleOpenDeleteModal}
            handleTypeOfPhrase={handleTypeOfPhrase}
            savePhrasesOrder={savePhrasesOrder}
            passageNum={1}
          />
          <PassageComponent
            editor={editor}
            email={email}
            passage={passage2}
            handleTypeOfQuestion={handleTypeOfQuestion}
            handleOpenddPhraseModal={handleOpenddPhraseModal}
            handleOpenEditModal={handleOpenEditModal}
            handlePassageChange={handlePassageChange2}
            setChosenPassage={setChosenPassage}
            passages={passages}
            optionsConditions={optionsConditions}
            pConURL={pConURL2}
            passageCondition={passageCondition2}
            handlePassageConditionChange={handlePassageConditionChange2}
            userCondition={userCondition2}
            setPassagTitle={setPassagTitle}
            setNewPhrase={setNewPhrase}
            setSelectedPhrase={setSelectedPhrase}
            handleOpenDeleteModal={handleOpenDeleteModal}
            handleTypeOfPhrase={handleTypeOfPhrase}
            savePhrasesOrder={savePhrasesOrder}
            passageNum={2}
          />
        </Box>
        <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
      </Box>
    </Box>
  );
};

export default ResearcherPassage;
