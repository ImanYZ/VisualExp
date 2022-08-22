/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";
import OutlinedInput from "@mui/material/OutlinedInput";
import LoadingButton from "@mui/lab/LoadingButton";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import { batchDelete, batchSet, batchUpdate, commitBatch } from "../../firebase/firebase";
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3
};
const ResearcherPassage = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [passages, setPassages] = useState([]);
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
  const handleCloseEditModal = () => setOpenEditModal(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const handleCloseAddPhraseModal = () => setOpenAddPhraseModal(false);
  const handleOpenddPhraseModal = () => setOpenAddPhraseModal(true);
  const [passagesChanges, setPassagesChanges] = useState([]);
  const [passagesLoaded, setPassagesLoaded] = useState(false);
  const [numberRecorded, setNumberRecorded] = useState(0);
  const [newPhraseAdded, setNewPhraseAdded] = useState();
  const [chosenPassage, setChosenPassage] = useState();
  const [openAddPhraseModal, setOpenAddPhraseModal] = useState(false);
  const [submtingNewPhrase, setSubmtingNewPhrase] = useState(false);
  const email = useRecoilValue(emailState);

  useEffect(() => {
    if (firebase) {
      const passagesQuery = firebase.db.collection("passages");

      const passagesSnapshot = passagesQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setPassagesChanges(oldPassagessChanges => {
          return [...oldPassagessChanges, ...docChanges];
        });
        setPassagesLoaded(true);
      });
      return () => {
        setPassagesChanges([]);
        passagesSnapshot();
      };
    }
  }, [firebase, passagesLoaded]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (passagesLoaded) {
      const tempPassagesChanges = [...passagesChanges];
      setPassagesChanges([]);
      let passags = [];
      let titles = [];
      const userDoc = await firebase.db.collection("researchers").doc(fullname).get();
      const userData = userDoc.data();
      let userProjects = Object.keys(userData.projects);

      for (let change of tempPassagesChanges) {
        const pasageData = change.doc.data();
        let passageProjects = Object.keys(pasageData.projects);
        if (passageProjects.length !== 0) {
          if (passageProjects.find(element => userProjects.includes(element))) {
            passags.push({
              ...pasageData
            });
            titles.push(pasageData.title);
          }
        }
      }

      setPassages(passags);
      setUserCondition(titles[0]);
      setPassageCondition("H2");
      setPConURL(passags[0]["linkH2"]);
      setUserCondition2(titles[0]);
      setPassageCondition2("K2");
      setPConURL2(passags[0]["linkK2"]);
      setPassage2(passags[0]);
      setPassage1(passags[0]);
    }
  }, [firebase, fullname, passagesLoaded]);

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

  const correctionToRecallGrades = async event => {
    const passageDoc = await firebase.db.collection("passages").where("title", "==", passagTitle).get();
    const passageRef = firebase.db.collection("passages").doc(passageDoc.docs[0].id);
    const passageUpdate = passageDoc.docs[0].data();
    passageUpdate.phrases[passageUpdate.phrases.indexOf(selectedPhrase)] = newPhrase;
    await batchUpdate(passageRef, passageUpdate);
    const recallGradesDoc = await firebase.db
      .collection("recallGrades")
      .where("passage", "==", passageDoc.docs[0].id)
      .where("phrase", "==", selectedPhrase)
      .get();
    for (let recallDoc of recallGradesDoc.docs) {
      const recallRef = firebase.db.collection("recallGrades").doc(recallDoc.id);
      const recallUpdate = {
        phrase: newPhrase
      };
      await batchUpdate(recallRef, recallUpdate);
    }
    await commitBatch();
    handleCloseEditModal();
    setPassagesLoaded(false);
  };

  const deleteRecallGrades = async event => {
    const passageDoc = await firebase.db.collection("passages").where("title", "==", passagTitle).get();
    let allowDelete = true;
    let numberRecord = 0;
    const recallGradesDoc = await firebase.db
      .collection("recallGrades")
      .where("passage", "==", passageDoc.docs[0].id)
      .where("phrase", "==", selectedPhrase)
      .get();
    if (numberRecorded === 0) {
      for (let recallDoc of recallGradesDoc.docs) {
        const recallData = recallDoc.data();
        if (recallData.researchersNum !== 0) {
          allowDelete = false;

          numberRecord = numberRecord + 1;
        }
      }
      setNumberRecorded(numberRecord);
    }
    const oldPhrase = selectedPhrase;
    const passageRef = firebase.db.collection("passages").doc(passageDoc.docs[0].id);
    const passageUpdate = passageDoc.docs[0].data();
    if (allowDelete) {
      setNumberRecorded(0);
      passageUpdate.phrases.splice(passageUpdate.phrases.indexOf(oldPhrase), 1);
      await batchUpdate(passageRef, passageUpdate);
      for (let recallDoc of recallGradesDoc.docs) {
        const recallRef = firebase.db.collection("recallGrades").doc(recallDoc.id);
        await batchDelete(recallRef);
      }
      await commitBatch();
      setPassagesLoaded(false);
      handleCloseDeleteModal();
    }
  };

  const addNewPhrase = async () => {
    let responses = new Set();
    const passageDoc = await firebase.db.collection("passages").where("title", "==", chosenPassage).get();
    const passageRef = firebase.db.collection("passages").doc(passageDoc.docs[0].id);
    const passageUpdate = passageDoc.docs[0].data();
    passageUpdate.phrases.push(newPhraseAdded);
    await batchUpdate(passageRef, passageUpdate);
    const recallGradesDoc = await firebase.db
      .collection("recallGrades")
      .where("passage", "==", passageDoc.docs[0].id)
      .get();
    for (let recallDoc of recallGradesDoc.docs) {
      const recallRef = firebase.db.collection("recallGrades").doc(recallDoc.id);
      const recallData = recallDoc.data();
      if (!responses.has(recallData.response)) {
        const newRecallGrade = {
          ...recallData,
          done: false,
          phrase: newPhraseAdded,
          researchers: [],
          researchersNum: 0,
          grades: []
        };
        await batchSet(recallRef, newRecallGrade);
        responses.add(recallData.response);
      }
    }
    await commitBatch();
    handleCloseAddPhraseModal();
    setSubmtingNewPhrase(false);
  };
  return (
    <Paper sx={{ m: "10px 10px 100px 10px" }}>
      <Modal
        open={openEditModal}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...modalStyle,
            width: "500px",
            height: "250px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <Typography variant="h6" margin-bottom="20px">
            Update the phrase below:
          </Typography>
          <Box>
            <TextareaAutosize
              style={{ width: "90%" }}
              minRows={5}
              value={newPhrase}
              placeholder={"Update the Phrase here."}
              onChange={event => setNewPhrase(event.currentTarget.value)}
            />
            <Box sx={{ textAlign: "center" }}>
              <Button className="Button" variant="contained" onClick={correctionToRecallGrades}>
                Update
              </Button>
              <Button
                variant="contained"
                className="Button Red"
                onClick={() => {
                  setNewPhrase("");
                  handleCloseEditModal();
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Alert severity={numberRecorded !== 0 ? "error" : "warning"}>
            Are you sure, you want to delete phrase ?
            <br />
            {numberRecorded !== 0 && `there are ${numberRecorded} already graded records for this phrase.`}
            <br />
          </Alert>
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              className="Button Red"
              onClick={() => {
                deleteRecallGrades();
              }}
            >
              Delete
            </Button>
            <Button
              className="Button"
              variant="contained"
              onClick={() => {
                setSelectedPhrase("");
                setNumberRecorded(0);
                handleCloseDeleteModal();
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openAddPhraseModal}
        onClose={handleCloseAddPhraseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...modalStyle,
            width: "500px",
            height: "350px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <Typography variant="h6">Your Phrase will be added to the passage bellow</Typography>
          <Box>
            <TextareaAutosize
              style={{ width: "90%", marginBottom: "10px" }}
              minRows={5}
              value={newPhraseAdded}
              placeholder={"Add the Phrase here."}
              onChange={event => setNewPhraseAdded(event.currentTarget.value)}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h6" sx={{ mr: "10px" }}>
                Add Phrase for:
              </Typography>
              <Select
                native
                value={chosenPassage}
                input={<OutlinedInput label="Title" id="demo-dialog-native" />}
                onChange={event => setChosenPassage(event.target.value || "")}
              >
                <option value={passage1.title}>{passage1.title}</option>
                <option value={passage2.title}>{passage2.title}</option>
              </Select>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <LoadingButton
                disabled={!newPhraseAdded || !chosenPassage}
                className="Button"
                variant="contained"
                loading={submtingNewPhrase}
                onClick={() => {
                  addNewPhrase();
                  setSubmtingNewPhrase(true);
                }}
              >
                Add
              </LoadingButton>
              <Button
                className="Button Red"
                variant="contained"
                onClick={() => {
                  setNewPhraseAdded("");
                  setChosenPassage("");
                  handleCloseAddPhraseModal();
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <div style={{ userSelect: "none", background: "#e2e2e2" }}>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ width: "70%", margin: "15px 0px 0px 20px", overflow: "scroll", height: "90vh" }}>
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
                <Typography variant="h6" component="div">
                  Passage
                </Typography>

                <Select id="demo-simple-select-helper" value={userCondition} onChange={handlePassageChange}>
                  {passages &&
                    passages?.length > 0 &&
                    passages.map(doc => <MenuItem value={doc.title}>{doc.title}</MenuItem>)}
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" component="div">
                  Passage Condition
                </Typography>
                <Select id="demo-simple-select-helper" value={passageCondition} onChange={handlePassageConditionChange}>
                  {optionsConditions.map(option => {
                    return (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
            </div>
            <iframe id="PassageFrame" frameBorder="0" src={pConURL}></iframe>
            <Typography variant="h5" gutterBottom component="div">
              Questions and Answers
            </Typography>
            {passage1 &&
              passage1?.questions?.length > 0 &&
              passage1.questions.map((question, index) => {
                return (
                  <Accordion key={index}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography variant="h6" component="div">
                        {`${index + 1}. ${question.stem}`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ul>
                        <li>
                          <Typography variant="h6" component="div">
                            {question.a}
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="h6" component="div">
                            {question.b}
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="h6" component="div">
                            {question.c}
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="h6" component="div">
                            {question.d}
                          </Typography>
                        </li>
                      </ul>
                      <Typography variant="h6" gutterBottom component="div" mb={2}>
                        Answer: <mark>{question[question.answer]}</mark>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            {passage1?.phrases?.length > 0 && (
              <>
                <Typography variant="h5" gutterBottom component="div">
                  Phrases
                </Typography>

                {email === "oneweb@umich.edu" && (
                  <Button
                    onClick={() => {
                      handleOpenddPhraseModal();
                      setChosenPassage(passage1.title);
                    }}
                  >
                    <AddIcon /> add New Phrase
                  </Button>
                )}
              </>
            )}
            <div>
              {passage1 &&
                passage1?.phrases?.length > 0 &&
                passage1.phrases.map((phrase, index) => (
                  <ul key={index}>
                    <li>
                      <Typography variant="h6" component="div">
                        {phrase}
                      </Typography>
                      {email === "oneweb@umich.edu" && (
                        <>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => {
                              setPassagTitle(passage1.title);
                              setNewPhrase(phrase);
                              setSelectedPhrase(phrase);
                              handleOpenEditModal(phrase);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => {
                              setPassagTitle(passage1.title);
                              setSelectedPhrase(phrase);
                              handleOpenDeleteModal();
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </li>
                  </ul>
                ))}
            </div>
          </div>
          <div style={{ width: "70%", margin: "15px 0px 0px 20px", overflow: "scroll", height: "90vh" }}>
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
                <Typography variant="h6" component="div">
                  Passage
                </Typography>
                <Select id="demo-simple-select-helper" value={userCondition2} onChange={handlePassageChange2}>
                  {passages &&
                    passages?.length > 0 &&
                    passages?.map(doc => <MenuItem value={doc.title}>{doc.title}</MenuItem>)}
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" component="div">
                  Passage Condition
                </Typography>
                <Select
                  id="demo-simple-select-helper"
                  value={passageCondition2}
                  onChange={handlePassageConditionChange2}
                >
                  {optionsConditions.map(option => {
                    return <MenuItem value={option}>{option}</MenuItem>;
                  })}
                </Select>
              </div>
            </div>
            <iframe id="PassageFrame" frameBorder="0" src={pConURL2}></iframe>
            <Typography variant="h5" gutterBottom component="div">
              Questions and Answers
            </Typography>
            {passage2 &&
              passage2?.questions?.length > 0 &&
              passage2?.questions.map((question, index) => {
                return (
                  <Accordion key={index}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography variant="h6" component="div">
                        {`${index + 1}. ${question.stem}`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ul>
                        <li>
                          <Typography variant="h6" component="div">
                            {question.a}
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="h6" component="div">
                            {question.b}
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="h6" component="div">
                            {question.c}
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="h6" component="div">
                            {question.d}
                          </Typography>
                        </li>
                      </ul>
                      <Typography variant="h6" gutterBottom component="div" mb={2}>
                        Answer: <mark>{question[question.answer]}</mark>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            {passage2?.phrases?.length > 0 && (
              <>
                <Typography variant="h5" gutterBottom component="div">
                  Phrases
                </Typography>

                {email === "oneweb@umich.edu" && (
                  <Button
                    onClick={() => {
                      handleOpenddPhraseModal();
                      setChosenPassage(passage2.title);
                    }}
                  >
                    <AddIcon /> add New Phrase
                  </Button>
                )}
              </>
            )}

            <div>
              {passage2 &&
                passage2?.phrases?.length > 0 &&
                passage2.phrases.map((phrase, index) => (
                  <ul key={index}>
                    <li>
                      <Typography variant="h6" component="div">
                        {phrase}
                      </Typography>
                      {email === "oneweb@umich.edu" && (
                        <>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => {
                              setPassagTitle(passage2.title);
                              setNewPhrase(phrase);
                              setSelectedPhrase(phrase);
                              handleOpenEditModal(phrase);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => {
                              setPassagTitle(passage2.title);
                              setSelectedPhrase(phrase);
                              handleOpenDeleteModal();
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </li>
                  </ul>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default ResearcherPassage;
