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
const RecallForIman = props => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);

  const [indexOfNoMajority, setIndexOfNoMajority] = useState(0);
  const [indexOfmajorityDifferentThanBot, setIndexOfmajorityDifferentThanBot] = useState(0);
  const [noMajority, setNoMajority] = useState([]);
  const [majorityDifferentThanBot, setMajorityDifferentThanBot] = useState([]);
  const [doneProcessing, setDoneProcessing] = useState(false);
  const [countPhrases, setCountPhrases] = useState([]);
  const [passages, setPassages] = useState([]);
  const [currentBot, setCurrentBot] = useState(majorityDifferentThanBot[indexOfmajorityDifferentThanBot]);
  const [updatingPhrase, setUpdatingPhrase] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [resetGrades, setResetGrades] = useState(false);
  const [resetGradesGPT, setResetGradesGPT] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const handleOpenEditModal = () => setOpenEditModal(true);
  const [errorLoading, setErrorLoading] = useState(false);

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
    const getPassges = async () => {
      const passagesDocs = await firebase.db.collection("passages").get();
      const passagesHash = {};
      passagesDocs.forEach(passageDoc => {
        passagesHash[passageDoc.id] = passageDoc.data();
      });
      setPassages(passagesHash);
    };
    if (firebase) {
      getPassges();
    }
  }, [firebase]);

  useEffect(() => {
    const getRecall = async () => {
      try {
        await firebase.idToken();
        const response = await axios.get("/researchers/loadRecallGradesNumbers");
        setNoMajority(response.data.noMajority);
        setMajorityDifferentThanBot(response.data.majorityDifferentThanBot);
        setCurrentBot(response.data.majorityDifferentThanBot[indexOfmajorityDifferentThanBot]);
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
    if (indexOfmajorityDifferentThanBot === majorityDifferentThanBot.length - 1)
      return setIndexOfmajorityDifferentThanBot(0);
    setIndexOfmajorityDifferentThanBot(indexBot => indexBot + 1);
    setCurrentBot(majorityDifferentThanBot[indexOfmajorityDifferentThanBot + 1]);
  };
  const previousPhrase = () => {
    if (indexOfmajorityDifferentThanBot === 0) return setIndexOfmajorityDifferentThanBot(0);
    setIndexOfmajorityDifferentThanBot(indexBot => indexBot - 1);
    setCurrentBot(majorityDifferentThanBot[indexOfmajorityDifferentThanBot + 1]);
  };

  const previousPhraseMajority = () => {
    if (indexOfNoMajority === 0) return setIndexOfNoMajority(0);
    setIndexOfNoMajority(indexOfNoMajority => indexOfNoMajority - 1);
  };

  const nextPhraseMajority = () => {
    if (indexOfNoMajority === noMajority.length - 1) return setIndexOfNoMajority(0);
    setIndexOfNoMajority(indexOfNoMajority => indexOfNoMajority + 1);
  };

  const voteOnPhraseMajority1 = async vote => {
    try {
      const majorityDifferentData = majorityDifferentThanBot[indexOfmajorityDifferentThanBot];

      const recallgradeRef = firebase.db.collection("recallGradesV2").doc(majorityDifferentData.id);
      const recallDoc = await recallgradeRef.get();
      const sessions = recallDoc.data().sessions;
      sessions[majorityDifferentData.session][majorityDifferentData.condition].phrases[
        majorityDifferentData.phraseIndex
      ].majority = vote === "yes" ? true : false;

      await recallgradeRef.update({ sessions });
      if (indexOfmajorityDifferentThanBot < majorityDifferentThanBot.length - 1) {
        setIndexOfmajorityDifferentThanBot(indexBot => indexBot + 1);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const voteOnPhraseMajority2 = async vote => {
    try {
      const noMajorityData = noMajority[indexOfNoMajority];

      const recallgradeRef = firebase.db.collection("recallGradesV2").doc(noMajorityData.id);
      const recallDoc = await recallgradeRef.get();
      const sessions = recallDoc.data().sessions;
      sessions[noMajorityData.session][noMajorityData.condition].phrases[noMajorityData.phraseIndex].majority =
        vote === "yes" ? true : false;

      await recallgradeRef.update({ sessions });
      if (indexOfNoMajority < noMajority.length - 1) {
        setIndexOfNoMajority(indexOfNoMajority => indexOfNoMajority + 1);
      }
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
  if (!researchers.includes(email)) {
    return (
      <div
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
      </div>
    );
  }

  if (errorLoading) {
    return (
      <div
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
      </div>
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
        <br />
        <Typography sx={{ mt: "5px" }}> Loading...</Typography>
      </Box>
    );

  const handlePhraseChange = e => {
    setNewPhrase(e.target.value);
  };

  const hundleUpdatePhrase = async event => {
    try {
      setUpdatingPhrase(true);
      await firebase.idToken();
      await axios.post("/researchers/updatePhraseForPassage", {
        passagTitle: passages[currentBot.passageId].title,
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
        prev.map(item => (item.phrase === currentBot.phrase ? { ...item, phrase: newPhrase } : item));
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
          <Box>OriginalPassgae :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>{currentBot.originalPassgae}</Paper>
          <Box>Response :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>{currentBot.Response}</Paper>
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
            <Typography sx={{ ml: "15px", color: currentBot["majority"] ? "green" : "red" }}>
              {currentBot["majority"] ? "YES" : "NO"}
            </Typography>
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
            onClick={() => voteOnPhraseMajority1("yes")}
            className="Button"
            variant="contained"
            id="recall-submit"
            sx={{ bgcolor: "#4caf50" }}
          >
            YES
          </Button>
          <Button
            onClick={() => voteOnPhraseMajority1("no")}
            className="Button"
            variant="contained"
            id="recall-submit"
            sx={{ bgcolor: "#f44336" }}
          >
            NO
          </Button>
        </Box>
      )}
      {noMajority.length > 0 && noMajority[indexOfNoMajority] && (
        <Box sx={{ mt: "15px" }}>
          <Typography variant="h5" component="h5">
            The Response has four grades, but do not satisfy the majority of votes :
          </Typography>
          <Box>OriginalPassgae :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {noMajority[indexOfNoMajority].originalPassgae}
          </Paper>
          <Box>Response :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {noMajority[indexOfNoMajority].Response}
          </Paper>
          <Box>The key phrase :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {noMajority[indexOfNoMajority].phrase}
          </Paper>
          <Box>Researchers grades :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {noMajority[indexOfNoMajority].grades.map(grade => {
              return <>{grade ? "YES" : "NO"} </>;
            })}
          </Paper>
          {noMajority[indexOfNoMajority].botGrade !== null && email === "oneweb@umich.edu" && (
            <>
              <Box>GPT-4's grade</Box>
              <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
                {noMajority[indexOfNoMajority].botGrade ? "YES" : "NO"}
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
            onClick={() => voteOnPhraseMajority2("yes")}
            className="Button"
            variant="contained"
            id="recall-submit"
            sx={{ bgcolor: "#4caf50" }}
          >
            YES
          </Button>
          <Button
            onClick={() => voteOnPhraseMajority2("no")}
            className="Button"
            variant="contained"
            id="recall-submit"
            sx={{ bgcolor: "#f44336" }}
          >
            NO
          </Button>
        </Box>
      )}
    </Box>
  );
};
export default RecallForIman;
