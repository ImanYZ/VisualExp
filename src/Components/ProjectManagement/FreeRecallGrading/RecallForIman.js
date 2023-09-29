import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, emailState } from "../../../store/AuthAtoms";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { TextField, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import axios from "axios";
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Switch } from "@mui/material";
import SnackbarComp from "../../SnackbarComp";
const RecallForIman = props => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);

  const [indexOfNoMajority, setIndexOfNoMajority] = useState(0);
  const [indexOfmajorityDifferentThanBot, setIndexOfmajorityDifferentThanBot] = useState(0);
  const [noMajority, setNoMajority] = useState([]);
  const [majorityDifferentThanBot, setMajorityDifferentThanBot] = useState([]);
  const [doneProcessing, setDoneProcessing] = useState(false);
  const [countPhrases, setCountPhrases] = useState([]);
  const [currentBot, setCurrentBot] = useState(null);
  const [currentNoMajority, setCurrentNoMajority] = useState(null);
  const [updatingPhrase, setUpdatingPhrase] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [resetGrades, setResetGrades] = useState(false);
  const [resetGradesGPT, setResetGradesGPT] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const handleOpenEditModal = () => setOpenEditModal(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [gradingPhrase, setGradingPhrase] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [majorityDecision, setMajorityDecision] = useState(false);

  const researchers = [
    "lewisdeantruong@gmail.com",
    "dahewang0907@gmail.com",
    "shabanagupta11@gmail.com",
    "csakurau@ucsc.edu",
    "tquonwork@gmail.com",
    "fmabud@bu.edu",
    "elhiew@ucdavis.edu",
    "ouhrac@gmail.com",
    "si270@scarletmail.rutgers.edu",
    "oneweb@umich.edu"
  ];

  const text = [
    "records that the bot should grade (remaining ) : their boolean expressions are satisfied and less than 2  researchers graded them",
    "number of records it's already graded : their boolean expressions are satisfied and  less than 2 researchers graded them",
    "of phrases that the bot has graded and their boolean expressions are not satisfied",
    "of phrases that the bot has graded and their boolean expressions are satisfied and 2 or more researchers graded them",
    "of phrases that their boolean expressions are not satisfied",
    "of phrases that their boolean expressions are satisfied and 2 or more researchers graded them",
    "Total of phrases"
  ];

  useEffect(() => {
    const checkEditor = async () => {
      const researcherDoc = await firebase.db.collection("researchers").where("email", "==", email).get();
      if (researcherDoc.docs.length > 0) {
        const researcherData = researcherDoc.docs[0].data();
        setMajorityDecision(researcherData?.majorityDecision || false);
      }
    };
    if (email && firebase) checkEditor();
  }, [email, firebase]);

  useEffect(() => {
    const getRecall = async () => {
      try {
        await firebase.idToken();
        const response = await axios.get("/researchers/loadRecallGradesNumbers");
        setNoMajority(response.data.noMajority);
        setMajorityDifferentThanBot(response.data.majorityDifferentThanBot);
        setCurrentBot(response.data.majorityDifferentThanBot[0]);
        setCurrentNoMajority(response.data.noMajority[0]);
        setCountPhrases([
          response.data.notGrades,
          response.data.countGraded,
          response.data.countNSatisfiedGraded,
          response.data.countSatifiedGraded,
          response.data.notSatisfied,
          response.data.satisfiedThreeRes,
          response.data.countPairPhrases
        ]);
        setDoneProcessing(true);
      } catch (error) {
        setErrorLoading(true);
        console.log(error);
      }
    };

    if (firebase) {
      getRecall();
    }
  }, [firebase]);

  const nextPhrase = () => {
    if (indexOfmajorityDifferentThanBot === majorityDifferentThanBot.length - 1) return;

    setIndexOfmajorityDifferentThanBot(indexBot => indexBot + 1);
    setCurrentBot(current => {
      const indexCurrent = majorityDifferentThanBot.findIndex(m => m.id === current.id);
      return majorityDifferentThanBot[indexCurrent + 1];
    });
  };
  const previousPhrase = () => {
    if (indexOfmajorityDifferentThanBot === 0) return;
    setIndexOfmajorityDifferentThanBot(indexBot => indexBot - 1);
    setCurrentBot(current => {
      const indexCurrent = majorityDifferentThanBot.findIndex(m => m.id === current.id);
      return majorityDifferentThanBot[indexCurrent - 1];
    });
  };

  const previousPhraseMajority = () => {
    if (indexOfNoMajority === 0) return;
    setIndexOfNoMajority(indexOfNoMajority => indexOfNoMajority - 1);
    setCurrentNoMajority(current => {
      const indexCurrent = noMajority.findIndex(m => m.id === current.id);
      return noMajority[indexCurrent - 1];
    });
  };

  const nextPhraseMajority = () => {
    if (indexOfNoMajority === noMajority.length - 1) return;
    setIndexOfNoMajority(indexOfNoMajority => indexOfNoMajority + 1);
    setCurrentNoMajority(current => {
      const indexCurrent = noMajority.findIndex(m => m.id === current.id);
      return noMajority[indexCurrent + 1];
    });
  };

  const voteOnPhraseMajority1 = async vote => {
    try {
      const recallgradeRef = firebase.db.collection("recallGradesV2").doc(currentBot.docId);
      const recallDoc = await recallgradeRef.get();
      const sessions = recallDoc.data().sessions;

      const phrases = sessions[currentBot.session][currentBot.condition].phrases;
      const phraseIdx = phrases.findIndex(p => p.phrase === currentBot.phrase);

      sessions[currentBot.session][currentBot.condition].phrases[phraseIdx].majority = vote === "yes";
      setCurrentBot(prev => ({ ...prev, majority: vote === "yes" }));

      setMajorityDifferentThanBot(prev => {
        prev.map(item => {
          if (item.id === currentBot.id) item.majority = vote === "yes";
          return item;
        });
        return prev;
      });

      await recallgradeRef.update({ sessions });
    } catch (error) {
      console.log("error", error);
    }
  };
  const voteOnPhraseMajority2 = async vote => {
    try {
      const recallgradeRef = firebase.db.collection("recallGradesV2").doc(currentNoMajority.docId);
      const recallDoc = await recallgradeRef.get();
      const sessions = recallDoc.data().sessions;

      const phrases = sessions[currentNoMajority.session][currentNoMajority.condition].phrases;
      const phraseIdx = phrases.findIndex(p => p.phrase === currentNoMajority.phrase);

      sessions[currentNoMajority.session][currentNoMajority.condition].phrases[phraseIdx].majority =
        vote === "yes" ? true : false;
      setCurrentNoMajority(prev => ({ ...prev, majority: vote === "yes" }));

      setNoMajority(prev => {
        prev.map(item => {
          if (item.id === currentNoMajority.id) item.majority = vote === "yes";
          return item;
        });
        return prev;
      });
      await recallgradeRef.update({ sessions });
    } catch (error) {
      console.log("error", error);
    }
  };
  if (doneProcessing && !majorityDifferentThanBot.length) {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h5" component="h5">
          THERE IS NO RECORDS TO COMPARE :{" "}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {text.map((meaning, index) => (
            <Tooltip title={meaning} placement="top">
              <Box
                style={{
                  fontSize: 25,
                  overflow: "hidden"
                }}
              >
                {countPhrases[index] + "/"}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>
    );
  }

  const handlePhraseChange = e => {
    setNewPhrase(e.target.value);
  };

  const hundleUpdatePhrase = async event => {
    try {
      setUpdatingPhrase(true);
      await firebase.idToken();
      const oldPhrase = currentBot.phrase;
      await axios.post("/researchers/updatePhraseForPassage", {
        passagTitle: currentBot.passageTitle,
        selectedPhrase: currentBot.phrase,
        newPhrase,
        resetGrades,
        resetGradesGPT
      });
      handleCloseEditModal();
      setUpdatingPhrase(false);
      setResetGrades(false);
      setResetGradesGPT(false);
      setCurrentBot(prev => ({ ...prev, phrase: newPhrase }));
      setMajorityDifferentThanBot(prev => {
        prev.map(item => (item.id === currentBot.id ? { ...item, phrase: newPhrase } : item));
        return prev;
      });
      setNoMajority(prev => {
        prev.map(item => (item.phrase === oldPhrase ? { ...item, phrase: newPhrase } : item));
        return prev;
      });
    } catch (error) {
      handleCloseEditModal();
      setUpdatingPhrase(false);
      setResetGrades(false);
      setResetGradesGPT(false);
      console.log(error);
      window.alert("There was an error updating the phrase");
    }
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setNewPhrase("");
    setUpdatingPhrase(false);
    setResetGrades(false);
    setResetGradesGPT(false);
  };
  const getGrades = (logs, phrase) => {
    let sentences = [];
    let botGrades = [];
    for (let logIdx in logs) {
      const phraseLogs = logs[logIdx];
      const phraseIdx = phraseLogs.findIndex(p => p.rubric_item === phrase);
      if (phraseIdx !== -1) {
        sentences = sentences.concat(phraseLogs[phraseIdx].sentences);
        botGrades.push(phraseLogs[phraseIdx].correct);
      }
    }

    return { sentences: Array.from(new Set(sentences)), botGrades };
  };

  const gradeItAgain = async () => {
    try {
      setGradingPhrase(true);

      await firebase.idToken();
      const response = await axios.post("/researchers/gradeGPT", { record: currentBot });
      console.log(response);
      const { grade, logs } = response.data;

      setMajorityDifferentThanBot(prev => {
        prev.map(item =>
          item.id === currentBot.id ? { ...item, botGrade: grade, ...getGrades(logs, currentBot.phrase) } : item
        );
        return prev;
      });
      setCurrentBot(prev => ({ ...prev, botGrade: grade, ...getGrades(logs, currentBot.phrase) }));
      setGradingPhrase(false);
      setSnackbarMessage("Graded successfully");
    } catch (error) {
      console.log(error);
      setSnackbarMessage("There was an error grading the phrase");
      setGradingPhrase(false);
    }
  };

  const getMajority = () => {
    if (currentBot.hasOwnProperty("majority")) {
      return currentBot["majority"];
    }
    const upvotes = currentBot.grades.filter(grade => grade).length;
    const downvotes = currentBot.grades.filter(grade => !grade).length;

    return upvotes > downvotes;
  };

  if (!majorityDecision) {
    return (
      <Box
        style={{
          width: "100%",
          height: "100vh",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography align="center" variant="h3">
          You don't have Access!
        </Typography>
      </Box>
    );
  }

  if (errorLoading) {
    return (
      <Box
        style={{
          width: "100%",
          height: "100vh",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography align="center" variant="h3">
          Error Loading!
        </Typography>
      </Box>
    );
  }
  if (!doneProcessing && !majorityDifferentThanBot.length)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column"
        }}
      >
        <CircularProgress />
        {/* <br /> */}
        <Typography sx={{ mt: "5px" }}> Loading...</Typography>
      </Box>
    );

  return (
    <Box sx={{ mb: "15px", ml: "15px", height: "100vh", overflow: "auto" }}>
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle sx={{ fontSize: "15px" }}> Update the phrase below:</DialogTitle>
        <DialogContent sx={{ width: "500px", mt: "5px" }}>
          <TextField
            label="Update the Phrase here."
            variant="outlined"
            value={newPhrase}
            onChange={handlePhraseChange}
            fullWidth
            multiline
            rows={3}
            sx={{ width: "95%", m: 0.5 }}
          />
          Toggle This if you think this Phrase needs to be graded again by:
          <br></br>
          <Switch
            checked={resetGradesGPT}
            onChange={() => setResetGradesGPT(previous => !previous)}
            color="secondary"
          />
          chat-GPT.
          <br></br>
          <Switch checked={resetGrades} onChange={() => setResetGrades(previous => !previous)} color="secondary" />
          Researchers.
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

      {majorityDifferentThanBot.length > 0 && currentBot && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" component="h5">
              The Response has three or four grades, but the majority of votes disagrees with Iman's grade :{" "}
            </Typography>
            <br />
            {/* <Box sx={{ display: "flex", alignItems: "center" }}>
              {text.map((meaning, index) => (
                <Tooltip title={meaning}>
                  <Box
                    style={{
                      fontSize: 25,
                      overflow: "hidden"
                    }}
                  >
                    {countPhrases[index] + "/"}
                  </Box>
                </Tooltip>
              ))}
            </Box> */}
          </Box>
          {"\n"}
          <Box sx={{ mt: "5px" }}>Original Passage:</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>{currentBot.originalPassage}</Paper>
          <Box>Response :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>{currentBot.response}</Paper>
          <Box>The key phrase :</Box>
          <Box sx={{ display: "flex", gap: "10px", mt: "25px", mb: "25px" }}>
            <Paper>{currentBot.phrase}</Paper>
            <Tooltip title={"Edit Phrase"}>
              <Button
                aria-label="edit"
                onClick={() => {
                  setNewPhrase(currentBot.phrase);
                  handleOpenEditModal();
                }}
              >
                Edit
              </Button>
            </Tooltip>
          </Box>
          <Box sx={{ display: "flex" }}>
            Researchers Grades:{" "}
            <Tooltip title={"Majority"}>
              <Typography
                sx={{
                  ml: "15px",
                  color: getMajority() ? "green" : "red"
                }}
              >
                {getMajority() ? "YES" : "NO"}
              </Typography>
            </Tooltip>
          </Box>
          <Paper sx={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {currentBot.grades.map((grade, index) => {
              return <>{grade ? "YES" : "NO"} </>;
            })}
          </Paper>
          <Box sx={{ display: "flex" }}>
            GPT-4's grades :{" "}
            <Typography sx={{ ml: "15px", color: currentBot["gpt-4-0613"] ? "green" : "red" }}>
              {currentBot["gpt-4-0613"] ? "YES" : "NO"}
            </Typography>{" "}
          </Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {currentBot.botGrades.map((grade, index) => {
              return <>{grade} </>;
            })}
          </Paper>
          <Box>Mentioned Sententces</Box>
          <ul>
            {currentBot.sentences.map((sentence, index) => (
              <li key={index}>{sentence}</li>
            ))}
          </ul>
          {indexOfmajorityDifferentThanBot + 1} / {majorityDifferentThanBot.length}
          <Button
            disabled={indexOfmajorityDifferentThanBot === 0}
            onClick={previousPhrase}
            className="Button"
            variant="contained"
            id="recall-submit"
          >
            Previous
          </Button>
          <Button
            disabled={indexOfmajorityDifferentThanBot + 1 >= majorityDifferentThanBot.length}
            onClick={nextPhrase}
            className="Button"
            variant="contained"
            id="recall-submit"
          >
            Next
          </Button>
          <Button
            variant="outlined"
            onClick={() => voteOnPhraseMajority1("yes")}
            sx={{
              ml: "5px",
              backgroundColor: currentBot.hasOwnProperty("majority") && currentBot.majority ? "#91ff35" : "",
              color: currentBot.hasOwnProperty("majority") && currentBot.majority ? "white" : "",
              width: "50px",
              height: "50px"
            }}
          >{`YES `}</Button>
          <Button
            variant="outlined"
            onClick={() => voteOnPhraseMajority1("no")}
            sx={{
              ml: "15px",
              mr: "15px",
              backgroundColor: currentBot.hasOwnProperty("majority") && !currentBot.majority ? "red" : "",
              color: currentBot.hasOwnProperty("majority") && !currentBot.majority ? "white" : "",
              width: "50px",
              height: "50px"
            }}
          >{`NO `}</Button>
          <LoadingButton
            onClick={gradeItAgain}
            className="LoadingButton"
            variant="contained"
            id="recall-submit"
            loading={gradingPhrase}
          >
            Grade It Again
          </LoadingButton>
        </Box>
      )}
      {noMajority.length > 0 && currentNoMajority && (
        <Box sx={{ mt: "15px" }}>
          <Typography variant="h5" component="h5">
            The Response has four grades, but do not satisfy the majority of votes :
          </Typography>
          <Box sx={{ mt: "5px" }}>Original Passage:</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>{currentNoMajority.originalPassage}</Paper>
          <Box>Response :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>{currentNoMajority.response}</Paper>
          <Box>The key phrase :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>{currentNoMajority.phrase}</Paper>
          <Box>Researchers grades :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {currentNoMajority.grades.map(grade => {
              return <>{grade ? "YES" : "NO"} </>;
            })}
          </Paper>
          {currentNoMajority.botGrade !== null && email === "oneweb@umich.edu" && (
            <>
              <Box>GPT-4's grade</Box>
              <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
                {currentNoMajority.botGrade ? "YES" : "NO"}
              </Paper>
            </>
          )}
          {indexOfNoMajority + 1} / {noMajority.length}
          <Button
            onClick={previousPhraseMajority}
            className="Button"
            variant="contained"
            id="recall-submit"
            disabled={indexOfNoMajority === 0}
          >
            Previous
          </Button>
          <Button
            disabled={indexOfNoMajority + 1 >= noMajority.length}
            onClick={nextPhraseMajority}
            className="Button"
            variant="contained"
            id="recall-submit"
          >
            Next
          </Button>
          <Button
            variant="outlined"
            onClick={() => voteOnPhraseMajority2("yes")}
            sx={{
              width: "50px",
              height: "50px",
              mr: "15px",
              backgroundColor:
                currentNoMajority.hasOwnProperty("majority") && currentNoMajority.majority ? "#91ff35" : "",
              color: currentNoMajority.hasOwnProperty("majority") && currentNoMajority.majority ? "white" : ""
            }}
          >{`YES `}</Button>
          <Button
            variant="outlined"
            onClick={() => voteOnPhraseMajority2("no")}
            sx={{
              width: "50px",
              height: "50px",
              backgroundColor: currentNoMajority.hasOwnProperty("majority") && !currentNoMajority.majority ? "red" : "",
              color: currentNoMajority.hasOwnProperty("majority") && !currentNoMajority.majority ? "white" : ""
            }}
          >{`NO `}</Button>
        </Box>
      )}
      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </Box>
  );
};
export default RecallForIman;
