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

  const [botVotes, setBotVotes] = useState(0);
  const [pairPhrases, setPairPhrases] = useState(0);
  const [doneProcessing, setDoneProcessing] = useState(true);

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
      let countBotVotes = 0;
      let countPairPhrases = 0;
      let i = 0;
      recallGradesDocs.docs.forEach(recallDoc => {
        const recallData = recallDoc.data();

        console.log(i++);
        for (let session in recallData.sessions) {
          // eslint-disable-next-line no-loop-func
          recallData.sessions[session].forEach((conditionItem, conditionIndex) => {
            conditionItem.phrases.forEach((phraseItem, phraseIndex) => {
              countPairPhrases++;
              if (phraseItem.hasOwnProperty("gpt4Grade")) countBotVotes = countBotVotes + 1;

              if (!phraseItem.hasOwnProperty("majority")) {
                let _grades = phraseItem.grades.slice();

                const trueVotes = _grades.filter(
                  (grade, index) => grade === true && index !== phraseItem.researchers.indexOf(gptResearcher)
                ).length;
                const falseVotes = _grades.filter(
                  (grade, index) => grade === false && index !== phraseItem.researchers.indexOf(gptResearcher)
                ).length;

                if (trueVotes === falseVotes && _grades.length >= 4 && phraseItem.hasOwnProperty("gpt4Grade")) {
                  _noMajority.push({
                    ...phraseItem,
                    grades: _grades.filter((_grade, index) => index !== phraseItem.researchers.indexOf(gptResearcher)),
                    botGrade: phraseItem.gpt4Grade || "NAN",
                    Response: conditionItem.response,
                    session: session,
                    consdition: conditionIndex,
                    id: recallDoc.id,
                    originalPassgae: passagesHash[conditionItem.passage],
                    phraseIndex
                  });
                }
                _grades = phraseItem.grades.slice();
                if (
                  phraseItem.hasOwnProperty("gpt4Grade") &&
                  ((trueVotes >= 3 && !phraseItem.gpt4Grade) || (falseVotes >= 3 && phraseItem.gpt4Grade))
                ) {
                  _majorityDifferentThanBot.push({
                    ...phraseItem,
                    botGrade: phraseItem.gpt4Grade,
                    grades: _grades.filter((grade, index) => index !== phraseItem.researchers.indexOf(gptResearcher)),
                    Response: conditionItem.response,
                    session: session,
                    condition: conditionIndex,
                    id: recallDoc.id,
                    originalPassgae: passagesHash[conditionItem.passage],
                    phraseIndex
                  });
                }
              }
            });
          });
        }
      });

      const __noMajority = _noMajority.filter(gradeMajority => gradeMajority.grades.length !== 0);
      const __majorityDifferentThanBot = _majorityDifferentThanBot.filter(
        gradeMajority => gradeMajority.grades.length !== 0
      );
      setNoMajority(__noMajority);
      setMajorityDifferentThanBot(__majorityDifferentThanBot);
      setBotVotes(countBotVotes);
      setPairPhrases(countPairPhrases);
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

  if (doneProcessing && !majorityDifferentThanBot.length) return <>NO RECORDS TO COMPARE</>;

  if (!majorityDifferentThanBot.length)
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
      <Box>
        <Typography variant="h5" component="h5">
          The Response has three or four grades, but the majority of votes disagrees with Iman's grade : {botVotes} /{" "}
          {pairPhrases}
        </Typography>
        {"\n"}
        <Box>OriginalPassgae :</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {majorityDifferentThanBot.length > 0 &&
            majorityDifferentThanBot[indexOfmajorityDifferentThanBot].originalPassgae}
        </Paper>
        <Box>Response :</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {majorityDifferentThanBot.length > 0 && majorityDifferentThanBot[indexOfmajorityDifferentThanBot].Response}
        </Paper>
        <Box>The key phrase :</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {majorityDifferentThanBot.length > 0 && majorityDifferentThanBot[indexOfmajorityDifferentThanBot].phrase}
        </Paper>
        <Box>The three of four grades :</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {majorityDifferentThanBot.length > 0 &&
            majorityDifferentThanBot[indexOfmajorityDifferentThanBot].grades.map((grade, index) => {
              return <>{grade ? "YES" : "NO"} </>;
            })}
        </Paper>
        <Box>Iman's grade</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {majorityDifferentThanBot.length > 0 && majorityDifferentThanBot[indexOfmajorityDifferentThanBot].botGrade
            ? "YES"
            : "NO"}
        </Paper>
        {indexOfmajorityDifferentThanBot + 1} / {majorityDifferentThanBot.length + 1}
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
          disabled={indexOfmajorityDifferentThanBot === majorityDifferentThanBot.length - 1}
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
      <Box sx={{ mt: "15px" }}>
        <Typography variant="h5" component="h5">
          The Response has four grades, but do not satisfy the majority of votes :
        </Typography>
        <Box>OriginalPassgae :</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {noMajority.length > 0 && noMajority[indexOfNoMajority].originalPassgae}
        </Paper>
        <Box>Response :</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {noMajority.length > 0 && noMajority[indexOfNoMajority].Response}
        </Paper>
        <Box>The key phrase :</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {noMajority.length > 0 && noMajority[indexOfNoMajority].phrase}
        </Paper>
        <Box>Researchers grades :</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {noMajority.length > 0 &&
            noMajority[indexOfNoMajority].grades.map(grade => {
              return <>{grade ? "YES" : "NO"} </>;
            })}
        </Paper>
        <Box>Iman's grade</Box>
        <Paper style={{ padding: "10px 19px 10px 19px", margin: "19px" }}>
          {noMajority.length > 0 && noMajority[indexOfNoMajority].botGrade ? "YES" : "NO"}
        </Paper>
        {indexOfNoMajority + 1} / {noMajority.length + 1}
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
          disabled={indexOfNoMajority === noMajority.length - 1}
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
    </Box>
  );
};
export default RecallForIman;
