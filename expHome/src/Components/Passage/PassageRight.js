import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import moment from "moment";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { Fireworks } from "fireworks-js/dist/react";

import {
  phaseState,
  stepState,
  startedSessionState,
  personalInfoProcessChoicesState
} from "../../store/ExperimentAtoms";
import { projectSpecsState } from "../../store/ProjectAtoms";

import MCQuestion from "../MCQuestion/MCQuestion";

import "./Passage.css";
import AppConfig from "../../AppConfig";

const options = {
  speed: 3
};

const style = {
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  position: "fixed"
};

const PassageRight = props => {
  const phase = useRecoilValue(phaseState);
  const step = useRecoilValue(stepState);
  const startedSession = useRecoilValue(startedSessionState);
  const projectSpecs = useRecoilValue(projectSpecsState);
  const [personalInfoProcessChoices, setPersonalInfoProcessChoices] = useRecoilState(personalInfoProcessChoicesState);

  const [nextSessionDate, setNextSessionDate] = useState("");

  useEffect(() => {
    if (startedSession !== 3 && [10, 20].includes(step)) {
      const daysLater = projectSpecs?.daysLater || AppConfig.daysLater;
      const daysInNextSession = startedSession === 2 ? daysLater?.[1] - daysLater?.[0] : daysLater?.[0];
      setNextSessionDate(moment().add(daysInNextSession, "days").format("dddd MMM DD, YYYY"));
    }
  }, [startedSession, step]);

  function renderPassageScores(passageIndex, passageScores, showTitle = true) {
    const {
      title,
      pretestScore,
      testScore,
      test3DaysScore,
      test1WeekScore,
      recallScore,
      recall3DaysScore,
      recall1WeekScore,
      questionsNum,
      keywordsLen
    } = passageScores;

    return (
      <Box key={`passage-${passageIndex}`} sx={{mb:6}}>
        {showTitle && <Typography variant="h6">{`Passage ${passageIndex + 1}: ${title}`}</Typography>}
        <Box id="ScoresContainer">
          <Typography variant="subtitle1" className="ScoreTitle">
            Pretest Score
          </Typography>
          <Box></Box>
          <Typography variant="subtitle1" className="ScoreNum">{`${pretestScore} / ${questionsNum}`}</Typography>

          <Typography variant="subtitle1" className="ScoreTitle">
            Test Score
          </Typography>
          <Box></Box>
          <Typography variant="subtitle1" className="ScoreNum">{`${testScore} / ${questionsNum}`}</Typography>

          <Typography variant="subtitle1" className="ScoreTitle">{`${
            test1WeekScore ? "3 Days Later" : "Today's"
          } Test Score`}</Typography>
          <Box></Box>
          <Typography variant="subtitle1" className="ScoreNum">{`${test3DaysScore} / ${questionsNum}`}</Typography>

          {test1WeekScore !== undefined && (
            <>
              <Typography variant="subtitle1" className="ScoreTitle">
                Today's Test Score
              </Typography>
              <Box></Box>
              <Typography variant="subtitle1" className="ScoreNum">{`${test1WeekScore} / ${questionsNum}`}</Typography>
            </>
          )}

          <Typography variant="subtitle1" className="ScoreTitle">
            Written Response Score
          </Typography>
          <Box></Box>
          <Typography variant="subtitle1" className="ScoreNum">{`${recallScore} / ${
            recallScore !== 0 ? keywordsLen : ""
          }`}</Typography>

          <Typography variant="subtitle1" className="ScoreTitle">{`${
            recall1WeekScore ? "3 Days Later" : "Today's"
          } Written Response Score`}</Typography>
          <Box></Box>
          <Typography variant="subtitle1" className="ScoreNum">{`${recall3DaysScore} / ${
            recall3DaysScore !== 0 ? keywordsLen : ""
          }`}</Typography>

          {recall1WeekScore !== undefined && (
            <>
              <Typography variant="subtitle1" className="ScoreTitle">
                Today's Written Response Score
              </Typography>
              <Box></Box>
              <Typography variant="subtitle1" className="ScoreNum">{`${recall1WeekScore} / ${
                recall1WeekScore !== 0 ? keywordsLen : ""
              }`}</Typography>
            </>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <div id="QuestionsContainer">
      {[0, 4, 7, 14].includes(step) ? (
        <>
          {[0, 4].includes(step) ? (
            <h2>Welcome to the {step === 0 ? "Second" : "Test"} Phase!</h2>
          ) : (
            <h2>You Have One More Test Left for Today!</h2>
          )}
          <h3>
            Please enjoy watching this video and click "START THE{" "}
            {step === 0 ? "SECOND PHASE" : step === 4 ? "TEST PHASE" : "NEXT TEST"}
            !" button whenever you feel comfortable!
          </h3>
          <div id="StartTestContainer">
            <Button id="StartTestButton" className="Button" onClick={props.nextStep} variant="contained">
              START THE {step === 0 ? "SECOND PHASE" : step === 4 ? "TEST PHASE" : "NEXT TEST"}
              !"
            </Button>
          </div>
        </>
      ) : step === 1.5 ? (
        <>
          <h2>Welcome to the Pretest Phase!</h2>
          <p>
            Please carefully read the instructions on the left and when you feel comfortable, click the "START THE
            PRE-TEST!" button.
          </p>
          <div id="StartTestContainer">
            <Button id="StartTestButton" className="Button" onClick={props.nextStep} variant="contained">
              START THE PRE-TEST!
            </Button>
          </div>
        </>
      ) : [6, 8, 12, 15].includes(step) ? (
        <>
          <h2>Let's Recall!</h2>
          <div id="Timer">
            {props.minutes} : {props.seconds} left!
          </div>
          <p>
            Please carefully think about the passage "{props.passageTitle}," and write the key points you recall from it
            in the left text box.
          </p>
          <p>Your time left to complete this task is shown on top.</p>
          <p>If you'd rather end it earlier, click the "CONTINUE!" button.</p>
          <div id="StartTestContainer">
            <Button
              id="StartTestButton"
              onClick={props.nextStep}
              variant="contained"
              disabled={props.reText.length < 4}
              className={props.reText.length < 4 ? "Button Disabled" : "Button"}
            >
              CONTINUE!
            </Button>
          </div>
        </>
      ) : [5, 19].includes(step) ? (
        <>
          {startedSession === 3 && step === 19 && (
            <p>Now that you know your scores, rethink through these two questions.</p>
          )}
          <p>Please click the "Submit &amp; Continue!" button on the left after answering both questions.</p>
          {startedSession === 3 &&
            props.scores.length > 0 &&
            step === 19 &&
            props.scores.map((passageScores, index) => renderPassageScores(index, passageScores))}
        </>
      ) : step === 9 && props.answeredPersonalTrait ? (
        <>
          <h2>Demographics!</h2>
          <p>
            Please enter your demographic data on the left. We need this data to better customize the results of our
            research for different demographics.
          </p>
          <p>In our research publications, we will never use your name and all our reports will be anonymized.</p>
          <p>Whenever you feel comfortable, click the "CONTINUE!" button.</p>
          {props.error ? (
            <div className="Error">Please enter your {props.error}!</div>
          ) : (
            <div id="StartTestContainer">
              <Button id="StartTestButton" className="Button" onClick={props.nextStep} variant="contained">
                CONTINUE!
              </Button>
            </div>
          )}
        </>
      ) : step === 9 && !props.answeredPersonalTrait ? (
        <>
          <p>This test measures key personality traits. Once you complete all items, click "Next".</p>
          <p>
            Here are a number of characteristics that may or may not apply to you. For example, do you agree that you
            are someone who likes to spend time with others? Please indicate the extent to which you agree or disagree
            with each statement.
          </p>
          <Button       
            id="QuestionNextBtn"
            onClick={() => setPersonalInfoProcessChoices({...personalInfoProcessChoices, submit: true})}
            disabled={!personalInfoProcessChoices.submitEnabled}
            className={!personalInfoProcessChoices.submitEnabled ? "Button Disabled" : "Button"}
            variant="contained"
          >
            NEXT!
          </Button> 
        </>
      ) : [10, 20].includes(step) ? (
        <>
          <h1>Thank you for taking part in this study!</h1>
          {nextSessionDate ? (
            <>
              <h1>
                See you at our {startedSession === 2 ? "final" : "second"} session on <i>{nextSessionDate}!</i>
              </h1>
              <Fireworks options={options} style={style} />
            </>
          ) : (
            <h1>
              You can now click{" "}
              <a href="https://1cademy.us/communities" target="_blank" rel="noreferrer">
                this link
              </a>{" "}
              to explore 1Cademy communities, at your convenience, and complete the requirements of whichever community
              you'd like to apply to.
            </h1>
          )}
        </>
      ) : step === 11 ? (
        <>
          {(startedSession === 2 || startedSession === 3) && (
            <>
              <h2>Welcome to the {startedSession === 2 ? "second" : startedSession === 3 && "last"} session!</h2>
              <p>When you feel comfortable, please click the "START THE TEST!" button.</p>
              <div id="StartTestContainer">
                <Button id="StartTestButton" className="Button" onClick={props.nextStep} variant="contained">
                  START THE TEST!
                </Button>
              </div>
            </>
          )}
        </>
      ) : [17, 18].includes(step) ? (
        <>
          <h2>All Your Scores based on the passage "{props.passageTitle}"!</h2>
          <p>
            You went through multiple tests based on the content of the passage on the left. You can see your scores
            below. Whenever you feel comfortable, please click the "CONTINUE" button.
          </p>
          {props.scores.length > 0 && renderPassageScores(phase, props.scores[phase], false)}
          <div id="StartTestContainer">
            <Button id="StartTestButton" className="Button" onClick={props.nextStep} variant="contained">
              CONTINUE
            </Button>
          </div>
          <p>If for any reason the passage on the left does not load, click the "RELOAD" button and wait.</p>
          <div id="ReloadContainer">
            <Button id="ReloadButton" className="Button" onClick={props.changePConURL} variant="contained">
              RELOAD
            </Button>
          </div>
        </>
      ) : (
        <>
          <div id="Timer">
            {props.minutes} : {props.seconds} left!
          </div>
          {props.questions.length > 0 && (
            <MCQuestion
              setCurrentQIdx={props.setCurrentQIdx}
              currentQIdx={props.currentQIdx}
              questions={props.questions}
              setOrderQuestions={props.setOrderQuestions}
              nextStep={props.nextStep}
              showSubmit={true}
            />
          )}
          {step !== 2 && (
            <>
              <p>Please navigate through the passage on the left and answer the questions.</p>
              <p>
                Then, click the "NEXT" button to continue with the next question. You can revise your answers to the
                previous questions using the "PREVIOUS" button.
              </p>
              <p>
                After completely answering all the questions, click the "SUBMIT &amp; CONTINUE!" button to continue to
                the next step.
              </p>
              <p>If for any reason the passage on the left does not load, click the "RELOAD" button and wait.</p>
              <div id="ReloadContainer">
                <Button id="ReloadButton" className="Button" onClick={props.changePConURL} variant="contained">
                  RELOAD
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PassageRight;
