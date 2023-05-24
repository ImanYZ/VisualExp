import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState } from "../../../store/AuthAtoms";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";

const RecallForIman = props => {
  const firebase = useRecoilValue(firebaseState);
  const gptResearcher = "Iman YeckehZaare";

  const [indexOfNoMajority, setIndexOfNoMajority] = useState(0);
  const [indexOfmajorityDifferentThanBot, setIndexOfmajorityDifferentThanBot] = useState(0);

  const [noMajority, setNoMajority] = useState([]);
  const [majorityDifferentThanBot, setMajorityDifferentThanBot] = useState([]);

  const [passagesHash, setPassagesHash] = useState({});

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
    const getPassages = async () => {
      const _passagesHash = {};
      const passageDocs = await firebase.db.collection("passages").get();
      passageDocs.forEach(passageDoc => {
        _passagesHash[passageDoc.id] = passageDoc.data().text;
      });
      setPassagesHash(_passagesHash);
    };
    if (firebase) {
      getPassages();
    }
  }, [firebase]);

  useEffect(() => {
    if (!Object.keys(passagesHash).length) return;
    const getRecall = async () => {
      const _noMajority = [];
      const _majorityDifferentThanBot = [];
      const recallGradesDocs = await firebase.db.collection("recallGradesV2").get();
      //records that the bot should grade (remaining ) : their boolean expressions are satisfied and less than 2  researchers graded them
      let _countGraded = 0;
      //number of records it's already graded : their boolean expressions are satisfied and  less than 2 researchers graded them
      let _notGrades = 0;
      // # of phrases that the bot has graded and their boolean expressions are not satisfied
      let _countNSatisfiedGraded = 0;
      //# of phrases that the bot has graded and their boolean expressions are satisfied and 2 or more researchers graded them
      let _countSatifiedGraded = 0;
      //# of phrases that their boolean expressions are not satisfied
      let _notSatisfied = 0;
      //# of phrases that their boolean expressions are satisfied and 2 or more researchers graded them
      let _satisfiedThreeRes = 0;

      //Total # of phrases
      let countPairPhrases = 0;

      let i = 0;
      for (let recallDoc of recallGradesDocs.docs) {
        const recallData = recallDoc.data();

        for (let session in recallData.sessions) {
          for (let conditionItem of recallData.sessions[session]) {
            const conditionIndex = recallData.sessions[session].indexOf(conditionItem);
            for (let phraseItem of conditionItem.phrases) {
              const phraseIndex = conditionItem.phrases.indexOf(phraseItem);
              countPairPhrases++;
              const researcherIdx = phraseItem.researchers.indexOf(gptResearcher);
              let otherResearchers = phraseItem.researchers.slice();
              let otherGrades = phraseItem.grades.slice();
              if (researcherIdx !== -1) {
                otherResearchers.splice(researcherIdx, 1);
                otherGrades.splice(researcherIdx, 1);
              }
              const trueVotes = otherGrades.filter(grade => grade).length;
              const falseVotes = otherGrades.filter(grade => !grade).length;
              if(!phraseItem.hasOwnProperty("GPT-4-Mentioned") && phraseItem.satisfied && otherResearchers.length <=2) {
                _notGrades++;
              }
              if(phraseItem.hasOwnProperty("GPT-4-Mentioned") && phraseItem.satisfied && otherResearchers.length <=2) {
                _countGraded++;
              }


              if (phraseItem.hasOwnProperty("GPT-4-Mentioned") && !phraseItem.satisfied) {
                _countNSatisfiedGraded++;
              }
              if (
                phraseItem.hasOwnProperty("GPT-4-Mentioned") &&
                phraseItem.satisfied &&
                otherResearchers.length >= 2
              ) {
                _countSatifiedGraded++;
              }
              if (!phraseItem.satisfied) {
                _notSatisfied++;
              }
              if (otherResearchers.length >= 2 && phraseItem.satisfied) {
                _satisfiedThreeRes++;
              }
              const botGrade = phraseItem.hasOwnProperty("GPT-4-Mentioned") ? phraseItem["GPT-4-Mentioned"] : null;
              if (!phraseItem.hasOwnProperty("majority") && phraseItem.hasOwnProperty("GPT-4-Mentioned")) {
                if ((trueVotes >= 3 && !botGrade) || (falseVotes >= 3 && botGrade)) {
                  _majorityDifferentThanBot.push({
                    ...phraseItem,
                    botGrade,
                    grades: otherGrades,
                    Response: conditionItem.response,
                    session: session,
                    condition: conditionIndex,
                    id: recallDoc.id,
                    originalPassgae: passagesHash[conditionItem.passage],
                    phraseIndex
                  });
                }
              }
              if (!phraseItem.hasOwnProperty("majority") && trueVotes === falseVotes && otherGrades.length >= 4) {
                _noMajority.push({
                  ...phraseItem,
                  botGrade,
                  grades: otherGrades,
                  Response: conditionItem.response,
                  session: session,
                  condition: conditionIndex,
                  id: recallDoc.id,
                  originalPassgae: passagesHash[conditionItem.passage],
                  phraseIndex
                });
              }
            }
          }
        }
      }

      const __noMajority = _noMajority.filter(gradeMajority => gradeMajority.grades.length !== 0);
      const __majorityDifferentThanBot = _majorityDifferentThanBot.filter(
        gradeMajority => gradeMajority.grades.length !== 0
      );
      setNoMajority(__noMajority);
      setMajorityDifferentThanBot(__majorityDifferentThanBot);
      setCountPhrases([
        _notGrades,
        _countGraded,
        _countNSatisfiedGraded,
        _countSatifiedGraded,
        _notSatisfied,
        _satisfiedThreeRes,
        countPairPhrases
      ]);
      setDoneProcessing(true);
    };

    if (firebase && passagesHash) {
      getRecall();
    }
  }, [firebase, passagesHash]);

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

  if (!doneProcessing && !majorityDifferentThanBot.length)
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: "center"
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ mb: "15px", ml: "15px" }}>
      {majorityDifferentThanBot.length > 0 && majorityDifferentThanBot[indexOfmajorityDifferentThanBot] && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" component="h5">
              The Response has three or four grades, but the majority of votes disagrees with Iman's grade :{" "}
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
