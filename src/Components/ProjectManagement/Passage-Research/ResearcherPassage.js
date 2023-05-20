/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import PassageComponent from "./PassageComponent";

import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

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
  const [passagesLoaded, setPassagesLoaded] = useState(false);
  const [passagesLoadedUse, setPassagesLoadedUse] = useState(false);
  const [numberRecorded, setNumberRecorded] = useState(0);
  const [newPhraseAdded, setNewPhraseAdded] = useState();
  const [chosenPassage, setChosenPassage] = useState();
  const [openAddPhraseModal, setOpenAddPhraseModal] = useState(false);
  const [submtingNewPhrase, setSubmtingNewPhrase] = useState(false);
  const [updatingPhrase, setUpdatingPhrase] = useState(false);
  const [deletingPhrase, setDeletingPhrase] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const email = useRecoilValue(emailState);

  const editor = email === "oneweb@umich.edu";

  useEffect(() => {
    if (firebase && !passagesLoaded) {
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
  }, [firebase, passagesLoaded]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let passags = passages;
    if (passagesLoadedUse) {
      const tempPassagesChanges = [...passagesChanges];
      setPassagesChanges([]);
      let titls = titles;
      const userDoc = await firebase.db.collection("researchers").doc(fullname).get();
      const userData = userDoc.data();
      let userProjects = ["H2K2",...Object.keys(userData.projects)];

      for (let change of tempPassagesChanges) {
        const pasageData = change.doc.data();
        let passageProjects = Object.keys(pasageData.projects);
        if (passageProjects.length !== 0) {
          if (passageProjects.find(element => userProjects.includes(element)) ) {
            if (change.type === "modified") {
              passags[titls.indexOf(pasageData.title)] = { ...pasageData };
            } else {
              passags.push({
                ...pasageData
              });
              titls.push(pasageData.title);
            }
          }
        }
      }

      setPassages(passags);
      if (firstLoad) {
        setTitles(titls);
        setUserCondition(titles[0]);
        setPassageCondition("H2");
        setPConURL(passags[0]["linkH2"]);
        setUserCondition2(titles[0]);
        setPassageCondition2("K2");
        setPConURL2(passags[0]["linkK2"]);
        setPassage2(passags[0]);
        setPassage1(passags[0]);
        setFirstLoad(false);
      } else {
        const index1 = titles.indexOf(passage1.title);
        const index2 = titles.indexOf(passage2.title);
        setPassage1(passags[index1]);
        setPassage2(passags[index2]);
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
      const passageDoc = await firebase.db.collection("passages").where("title", "==", passagTitle).get();
      const passageRef = firebase.db.collection("passages").doc(passageDoc.docs[0].id);
      const passageUpdate = passageDoc.docs[0].data();
      passageUpdate.phrases[passageUpdate.phrases.indexOf(selectedPhrase)] = newPhrase;

      const recallGradesDoc = await firebase.db
        .collection("recallGradesV2")
        .where("passages", "array-contains", passageDoc.docs[0].id)
        .get();

      recallGradesDoc.docs.forEach(async recallDoc => {
        let needUpdate = false;
        const recallData = recallDoc.data();
        let sessions = recallData.sessions;

        for (let session in sessions) {
          for (let conditionItem of sessions[session]) {
            for (let phraseItem of conditionItem.phrases) {
              needUpdate = true;
              if (phraseItem.phrase === selectedPhrase) {
                phraseItem.phrase = newPhrase;
                if (phraseItem.hasOwnProperty("GPT-4-Mentioned")) {
                  delete phraseItem["GPT-4-Mentioned"];
                  conditionItem.doneGPT4Mentioned = false;
                }
              }
            }
          }
        }

        const recallRef = firebase.db.collection("recallGradesV2").doc(recallDoc.id);
        if (needUpdate) {
          await recallRef.update({
            sessions
          });
        }
      });

      await passageRef.update(passageUpdate);
      handleCloseEditModal();
      setPassagesLoaded(false);
      setUpdatingPhrase(false);
    } catch (error) {
      handleCloseEditModal();
      setPassagesLoaded(false);
      setUpdatingPhrase(false);
      console.log(error);
    }
  };

  const handleDeletePhrase = async event => {
    setDeletingPhrase(true);
    let updateDocuments = [];
    const passageDoc = await firebase.db.collection("passages").where("title", "==", passagTitle).get();
    let allowDelete = true;
    let numberRecord = 0;

    const recallGradesDoc = await firebase.db
      .collection("recallGradesV2")
      .where("passages", "array-contains", passageDoc.docs[0].id)
      .get();

    if (numberRecorded === 0) {
      for (let recallDoc of recallGradesDoc.docs) {
        const recallData = recallDoc.data();
        let sessions = recallData.sessions;
        for (let session in sessions) {
          for (let conditionItem of sessions[session]) {
            if (conditionItem.passage === passageDoc.docs[0].id) {
              const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === selectedPhrase);
              if (phraseIndex !== -1 && conditionItem.phrases[phraseIndex].hasOwnProperty("researchers")) {
                console.log("researchers", conditionItem.phrases[phraseIndex].researchers);
              }
              if (
                phraseIndex !== -1 &&
                conditionItem.phrases[phraseIndex].hasOwnProperty("researchers") &&
                conditionItem.phrases[phraseIndex].researchers.length > 0
              ) {
                if (!updateDocuments.includes(recallDoc.id)) {
                  updateDocuments.push(recallDoc.id);
                }
                allowDelete = false;
                numberRecord = numberRecord + 1;
              }
            }
          }
        }
      }
    }
    setNumberRecorded(numberRecord);

    const oldPhrase = selectedPhrase;
    const passageRef = firebase.db.collection("passages").doc(passageDoc.docs[0].id);
    const passageUpdate = passageDoc.docs[0].data();
    if (allowDelete) {
      setNumberRecorded(0);
      passageUpdate.phrases.splice(passageUpdate.phrases.indexOf(oldPhrase), 1);
      if (passageUpdate.phrasesTypes) {
        passageUpdate.phrasesTypes.splice(passageUpdate.phrases.indexOf(oldPhrase), 1);
      }
      if (passageUpdate.keys) {
        delete passageUpdate.keys[oldPhrase];
      }

      for (let updateDoc of recallGradesDoc.docs) {
        const recallRef = firebase.db.collection("recallGradesV2").doc(updateDoc.id);
        const recallData = updateDoc.data();
        let updateSessions = recallData.sessions;
        let needUpdate = false;
        for (let session in updateSessions) {
          for (let conditionItem of updateSessions[session]) {
            const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === selectedPhrase);
            if (conditionItem.passage === passageDoc.docs[0].id && phraseIndex !== -1) {
              needUpdate = true;
              conditionItem.phrases.splice(phraseIndex, 1);
            }
          }
        }
        if (needUpdate) {
          await recallRef.update({ sessions: updateSessions });
        }
      }
      await passageRef.update(passageUpdate);
      setPassagesLoaded(false);
      handleCloseDeleteModal();
    }
    setDeletingPhrase(false);
  };

  const handleAddNewPhrase = async () => {
    const passageDoc = await firebase.db.collection("passages").where("title", "==", chosenPassage).get();
    const passageRef = firebase.db.collection("passages").doc(passageDoc.docs[0].id);
    const passageUpdate = passageDoc.docs[0].data();
    passageUpdate.phrases.push(newPhraseAdded);

    const recallGradesDoc = await firebase.db
      .collection("recallGradesV2")
      .where("passages", "array-contains", passageDoc.docs[0].id)
      .get();

    for (let recallDoc of recallGradesDoc.docs) {
      let needUpdate = false;
      const recallRef = firebase.db.collection("recallGradesV2").doc(recallDoc.id);
      const recallData = recallDoc.data();
      let updateSessions = recallData.sessions;
      for (let session in updateSessions) {
        for (let conditionItem of recallData.sessions[session]) {
          needUpdate = true;
          if (conditionItem.passage === passageDoc.docs[0].id) {
            conditionItem.phrases.push({ phrase: newPhraseAdded, researchers: [], grades: [] });
          }
        }
      }
      if (needUpdate) {
        await recallRef.update({ sessions: updateSessions });
      }
    }
    await passageRef.update(passageUpdate);
    handleCloseAddPhraseModal();
    setPassagesLoaded(false);
    setSubmtingNewPhrase(false);
    setNewPhraseAdded("");
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
    const passageDoc = await firebase.db.collection("passages").where("title", "==", title).get();
    let passageUpdate = passageDoc.docs[0].data();
    const initPhrasesTypes = new Array(passageUpdate.phrases.length).fill("");
    if (!passageUpdate.phrasesTypes) {
      passageUpdate = {
        ...passageUpdate,
        phrasesTypes: initPhrasesTypes
      };
    }
    passageUpdate.phrasesTypes[phraseIndex] = type;

    const passageRef = firebase.db.collection("passages").doc(passageDoc.docs[0].id);
    passageRef.update(passageUpdate);
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
  };
  return (
    <Paper sx={{ m: "10px 10px 100px 10px" }}>
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
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={updatingPhrase} variant="contained" onClick={hundleUpdatePhrase}>
            Update
          </LoadingButton>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
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
          <Box sx={{ display: "flex", alignItems: "center", mt: "15px" }}>
            Add phrase for:
            <Select
              sx={{ ml: "15px" }}
              value={chosenPassage}
              onChange={event => setChosenPassage(event.target.value || "")}
            >
              <MenuItem value={passage1.title}>{passage1.title}</MenuItem>
              <MenuItem value={passage2.title}>{passage2.title}</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            disabled={!newPhraseAdded || !chosenPassage}
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
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Box style={{ background: "#e2e2e2" }}>
        <Box style={{ display: "flex", height: "100%" }}>
          <PassageComponent
            editor={editor}
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
          />
          <PassageComponent
            editor={editor}
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
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ResearcherPassage;
