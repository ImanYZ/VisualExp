import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState } from "../../../store/AuthAtoms";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

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

  const [countNSatisfiedGraded, setCountNSatisfiedGraded] = useState(0);
  const [countSatifiedGraded, setCountSatifiedGraded] = useState(0);
  const [notSatisfied, setNotSatisfied] = useState(0);
  const [satisfiedThreeRes, setSatisfiedThreeRes] = useState(0);
  const [totalpairPhrases, setTotalpairPhrases] = useState(0);

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

      // # of phrases that the bot has graded and their boolean expressions are not satisfied
      let _countNSatisfiedGraded = 0;
      //# of phrases that the bot has graded and their boolean expressions are satisfied and three or more researchers graded them
      let _countSatifiedGraded = 0;
      //# of phrases that their boolean expressions are not satisfied
      let _notSatisfied = 0;
      //# of phrases that their boolean expressions are satisfied and three or more researchers graded them
      let _satisfiedThreeRes = 0;

      //Total # of phrases
      let countPairPhrases = 0;

      let i = 0;
      for (let recallDoc of recallGradesDocs.docs) {
        const recallData = recallDoc.data();

        console.log(i++);
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
              if (phraseItem.hasOwnProperty("GPT-4-Mentioned") && !phraseItem.satisfied) {
                _countNSatisfiedGraded++;
              }
              if (
                phraseItem.hasOwnProperty("GPT-4-Mentioned") &&
                phraseItem.satisfied &&
                otherResearchers.length >= 3
              ) {
                _countSatifiedGraded++;
              }
              if (!phraseItem.satisfied) {
                _notSatisfied++;
              }
              if (otherResearchers.length >= 3 && phraseItem.satisfied) {
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
              if (trueVotes === falseVotes && otherGrades.length >= 4) {
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

      setCountNSatisfiedGraded(_countNSatisfiedGraded);
      setCountSatifiedGraded(_countSatifiedGraded);
      setNotSatisfied(_notSatisfied);
      setSatisfiedThreeRes(_satisfiedThreeRes);
      setTotalpairPhrases(countPairPhrases);

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
    console.log(majorityDifferentThanBot[indexOfmajorityDifferentThanBot + 1]);
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
      setIndexOfmajorityDifferentThanBot(indexBot => indexBot + 1);
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
      setIndexOfNoMajority(indexOfNoMajority => indexOfNoMajority + 1);
    } catch (error) {
      console.log("error", error);
    }
  };
  console.log(doneProcessing);
  if (doneProcessing && !majorityDifferentThanBot.length) {
    return (
      <>
        THERE IS NO RECORDS TO COMPARE {countNSatisfiedGraded} /{countSatifiedGraded}/{notSatisfied}/{satisfiedThreeRes}
        /{totalpairPhrases}
      </>
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
      {majorityDifferentThanBot.length > 0 && (
        <Box>
          <Typography variant="h5" component="h5">
            The Response has three or four grades, but the majority of votes disagrees with Iman's grade :{" "}
            {countNSatisfiedGraded} /{countSatifiedGraded}/{notSatisfied}/{satisfiedThreeRes}/{totalpairPhrases}
          </Typography>
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
            color="success"
            id="recall-submit"
          >
            YES
          </Button>
          <Button
            onClick={() => voteOnPhraseMajority1("no")}
            className="Button"
            variant="contained"
            color="error"
            id="recall-submit"
          >
            NO
          </Button>
        </Box>
      )}
      {noMajority.length > 0 && (
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
          {noMajority[indexOfNoMajority].hasOwnProperty("botGrade") && (
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
            color="success"
            id="recall-submit"
          >
            YES
          </Button>
          <Button
            onClick={() => voteOnPhraseMajority2("no")}
            className="Button"
            variant="contained"
            color="error"
            id="recall-submit"
          >
            NO
          </Button>
        </Box>
      )}
    </Box>
  );
};
export default RecallForIman;
