import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, emailState } from "../../../store/AuthAtoms";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import axios from "axios";
const RecallForIman = props => {
  const firebase = useRecoilValue(firebaseState);
  const email = useRecoilValue(emailState);

  const [indexOfNoMajority, setIndexOfNoMajority] = useState(0);
  const [indexOfmajorityDifferentThanBot, setIndexOfmajorityDifferentThanBot] = useState(0);
  const [noMajority, setNoMajority] = useState([]);
  const [majorityDifferentThanBot, setMajorityDifferentThanBot] = useState([]);
  const [doneProcessing, setDoneProcessing] = useState(false);
  const [countPhrases, setCountPhrases] = useState([]);

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
    const getRecall = async () => {
      const response = await axios.get("/loadRecallGradesNumbers");
      console.log(response.data);
      setNoMajority(response.data.noMajority);
      setMajorityDifferentThanBot(response.data.majorityDifferentThanBot);
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
    };

    if (firebase) {
      getRecall();
    }
  }, [firebase]);

  const nextPhrase = () => {
    if (indexOfmajorityDifferentThanBot === majorityDifferentThanBot.length - 1)
      return setIndexOfmajorityDifferentThanBot(0);
    setIndexOfmajorityDifferentThanBot(indexBot => indexBot + 1);
  };
  const previousPhrase = () => {
    if (indexOfmajorityDifferentThanBot === 0) return setIndexOfmajorityDifferentThanBot(0);
    setIndexOfmajorityDifferentThanBot(indexBot => indexBot - 1);
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
  if (email !== "oneweb@umich.edu") {
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

  return (
    <Box sx={{ mb: "15px", ml: "15px", height: "100vh", overflow: "auto" }}>
      {majorityDifferentThanBot.length > 0 && majorityDifferentThanBot[indexOfmajorityDifferentThanBot] && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" component="h5">
              The Response has three or four grades, but the majority of votes disagrees with Iman's grade :{" "}
            </Typography>
            <br />
            <Box sx={{ display: "flex", alignItems: "center" }}>
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
            </Box>
          </Box>
          {"\n"}
          <Box>OriginalPassgae :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {majorityDifferentThanBot[indexOfmajorityDifferentThanBot].originalPassgae}
          </Paper>
          <Box>Response :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {majorityDifferentThanBot[indexOfmajorityDifferentThanBot].Response}
          </Paper>
          <Box>The key phrase :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {majorityDifferentThanBot[indexOfmajorityDifferentThanBot].phrase}
          </Paper>
          <Box>The three of four grades :</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {majorityDifferentThanBot[indexOfmajorityDifferentThanBot].grades.map((grade, index) => {
              return <>{grade ? "YES" : "NO"} </>;
            })}
          </Paper>
          <Box>Iman's grade</Box>
          <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
            {majorityDifferentThanBot[indexOfmajorityDifferentThanBot].botGrade ? "YES" : "NO"}
          </Paper>
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
          {noMajority[indexOfNoMajority].botGrade !== null && (
            <>
              <Box>Iman's grade</Box>
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
