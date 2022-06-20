import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Button from "@mui/material/Button";

import { Fireworks } from "fireworks-js/dist/react";

import {
  phaseState,
  stepState,
  secondSessionState,
  thirdSessionState,
} from "../../store/ExperimentAtoms";

import MCQuestion from "../MCQuestion/MCQuestion";

import "./Passage.css";

const options = {
  speed: 3,
};

const style = {
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  position: "fixed",
};

const PassageRight = (props) => {
  const phase = useRecoilValue(phaseState);
  const step = useRecoilValue(stepState);
  const secondSession = useRecoilValue(secondSessionState);
  const thirdSession = useRecoilValue(thirdSessionState);

  const [nextSessionDate, setNextSessionDate] = useState("");

  useEffect(() => {
    if (!thirdSession && [10, 20].includes(step)) {
      let d = new Date();
      d.setDate(d.getDate() + (secondSession ? 4 : 3));
      const weekDays = new Array(7);
      weekDays[0] = "Sunday";
      weekDays[1] = "Monday";
      weekDays[2] = "Tuesday";
      weekDays[3] = "Wednesday";
      weekDays[4] = "Thursday";
      weekDays[5] = "Friday";
      weekDays[6] = "Saturday";
      const weekDay = weekDays[d.getDay()];
      const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
      const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
      const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
      setNextSessionDate(weekDay + ", " + mo + " " + da + ", " + ye);
    }
  }, [secondSession, thirdSession, step]);

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
            {step === 0
              ? "SECOND PHASE"
              : step === 4
              ? "TEST PHASE"
              : "NEXT TEST"}
            !" button whenever you feel comfortable!
          </h3>
          <div id="StartTestContainer">
            <Button
              id="StartTestButton"
              className="Button"
              onClick={props.nextStep}
              variant="contained"
            >
              START THE{" "}
              {step === 0
                ? "SECOND PHASE"
                : step === 4
                ? "TEST PHASE"
                : "NEXT TEST"}
              !"
            </Button>
          </div>
        </>
      ) : step === 1.5 ? (
        <>
          <h2>Welcome to the Pretest Phase!</h2>
          <p>
            Please carefully read the instructions on the left and when you feel
            comfortable, click the "START THE PRE-TEST!" button.
          </p>
          <div id="StartTestContainer">
            <Button
              id="StartTestButton"
              className="Button"
              onClick={props.nextStep}
              variant="contained"
            >
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
            Please carefully think about the passage "{props.passageTitle}," and
            write the key points you recall from it in the left text box.
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
          {thirdSession && step === 19 && (
            <p>
              Now that you know your scores, rethink through these two
              questions.
            </p>
          )}
          <p>
            Please click the "Submit &amp; Continue!" button on the left after
            answering both questions.
          </p>
          {thirdSession &&
            props.scores.length > 0 &&
            step === 19 &&
            [0, 1].map((num) => {
              return (
                <div key={"Key" + num}>
                  <h2>Passage {num + 1 + ": " + props.scores[num].title}</h2>
                  <div id="ScoresContainer">
                    <div className="ScoreTitle">Pretest Score</div>
                    <div></div>
                    <div className="ScoreNum">
                      {props.scores[num].pretestScore +
                        " / " +
                        props.scores[num].questionsNum}
                    </div>
                    <div className="ScoreTitle">Test Score</div>
                    <div></div>
                    <div className="ScoreNum">
                      {props.scores[num].testScore +
                        " / " +
                        props.scores[num].questionsNum}
                    </div>
                    <div className="ScoreTitle">
                      {(typeof props.scores[num].test1WeekScore !== "undefined"
                        ? "3 Days Later"
                        : "Today's") + " Test Score"}
                    </div>
                    <div></div>
                    <div className="ScoreNum">
                      {props.scores[num].test3DaysScore +
                        " / " +
                        props.scores[num].questionsNum}
                    </div>
                    {typeof props.scores[num].test1WeekScore !==
                      "undefined" && (
                      <>
                        <div className="ScoreTitle">Today's Test Score</div>
                        <div></div>
                        <div className="ScoreNum">
                          {props.scores[num].test1WeekScore +
                            " / " +
                            props.scores[num].questionsNum}
                        </div>
                      </>
                    )}
                    <div className="ScoreTitle">Written Response Score</div>
                    <div></div>
                    <div className="ScoreNum">
                      {props.scores[num].recallScore +
                        (props.scores[num].recallScore !== 0
                          ? " / " + props.scores[num].keywordsLen
                          : "")}
                    </div>
                    <div className="ScoreTitle">
                      {(typeof props.scores[num].recall1WeekScore !==
                      "undefined"
                        ? "3 Days Later"
                        : "Today's") + " Written Response Score"}
                    </div>
                    <div></div>
                    <div className="ScoreNum">
                      {props.scores[num].recall3DaysScore +
                        (props.scores[num].recall3DaysScore !== 0
                          ? " / " + props.scores[num].keywordsLen
                          : "")}
                    </div>
                    {typeof props.scores[num].recall1WeekScore !==
                      "undefined" && (
                      <>
                        <div className="ScoreTitle">
                          Today's Written Response Score
                        </div>
                        <div></div>
                        <div className="ScoreNum">
                          {props.scores[num].recall1WeekScore +
                            (props.scores[num].recall1WeekScore !== 0
                              ? " / " + props.scores[num].keywordsLen
                              : "")}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </>
      ) : step === 9 ? (
        <>
          <h2>Demographics!</h2>
          <p>
            Please enter your demographic data on the left. We need this data to
            better customize the results of our research for different
            demographics.
          </p>
          <p>
            In our research publications, we will never use your name and all
            our reports will be anonymized.
          </p>
          <p>Whenever you feel comfortable, click the "CONTINUE!" button.</p>
          {props.error ? (
            <div className="Error">Please enter your {props.error}!</div>
          ) : (
            <div id="StartTestContainer">
              <Button
                id="StartTestButton"
                className="Button"
                onClick={props.nextStep}
                variant="contained"
              >
                CONTINUE!
              </Button>
            </div>
          )}
        </>
      ) : [10, 20].includes(step) ? (
        <>
          <h1>Thank you for taking part in this study!</h1>
          {nextSessionDate ? (
            <>
              <h1>
                See you at our {secondSession ? "final" : "second"} session on{" "}
                <i>{nextSessionDate}!</i>
              </h1>
              <Fireworks options={options} style={style} />
            </>
          ) : (
            <h1>
              You can now click{" "}
              <a href="https://1cademy.us/communities" target="_blank">
                this link
              </a>{" "}
              to explore 1Cademy communities, at your convenience, and complete
              the requirements of whichever community you'd like to apply to.
            </h1>
          )}
        </>
      ) : step === 11 ? (
        <>
          {(secondSession || thirdSession) && (
            <>
              <h2>
                Welcome to the{" "}
                {secondSession ? "second" : thirdSession && "last"} session!
              </h2>
              <p>
                When you feel comfortable, please click the "START THE TEST!"
                button.
              </p>
              <div id="StartTestContainer">
                <Button
                  id="StartTestButton"
                  className="Button"
                  onClick={props.nextStep}
                  variant="contained"
                >
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
            You went through multiple tests based on the content of the passage
            on the left. You can see your scores below. Whenever you feel
            comfortable, please click the "CONTINUE" button.
          </p>
          {props.scores.length > 0 && (
            <div id="ScoresContainer">
              <div className="ScoreTitle">Pretest Score</div>
              <div></div>
              <div className="ScoreNum">
                {props.scores[phase].pretestScore +
                  " / " +
                  props.scores[phase].questionsNum}
              </div>
              {/* <div className="ScoreTitle">Pretest Score Ratio</div>
            <div></div>
            <div className="ScoreNum">
              {props.scores[phase].pretestScoreRatio.toFixed(2)}
            </div> */}
              <div className="ScoreTitle">Test Score</div>
              <div></div>
              <div className="ScoreNum">
                {props.scores[phase].testScore +
                  " / " +
                  props.scores[phase].questionsNum}
              </div>
              {/* <div className="ScoreTitle">Test Score Ratio</div>
            <div></div>
            <div className="ScoreNum">
              {props.scores[phase].testScoreRatio.toFixed(2)}
            </div> */}
              <div className="ScoreTitle">
                {(typeof props.scores[phase].test1WeekScore !== "undefined"
                  ? "3 Days Later"
                  : "Today's") + " Test Score"}
              </div>
              <div></div>
              <div className="ScoreNum">
                {props.scores[phase].test3DaysScore +
                  " / " +
                  props.scores[phase].questionsNum}
              </div>
              {typeof props.scores[phase].test1WeekScore !== "undefined" && (
                <>
                  <div className="ScoreTitle">Today's Test Score</div>
                  <div></div>
                  <div className="ScoreNum">
                    {props.scores[phase].test1WeekScore +
                      " / " +
                      props.scores[phase].questionsNum}
                  </div>
                </>
              )}
              {/* <div className="ScoreTitle">Test After 4 Days Score Ratio</div>
            <div></div>
            <div className="ScoreNum">
              {props.scores[phase].test3DaysScoreRatio.toFixed(2)}
            </div> */}
              <div className="ScoreTitle">Written Response Score</div>
              <div></div>
              <div className="ScoreNum">
                {props.scores[phase].recallScore +
                  (props.scores[phase].recallScore !== 0
                    ? " / " + props.scores[phase].keywordsLen
                    : "")}
              </div>
              {/* <div className="ScoreTitle">Recall Score Ratio</div>
            <div></div>
            <div className="ScoreNum">
              {props.scores[phase].recallScoreRatio.toFixed(2)}
            </div> */}
              <div className="ScoreTitle">
                {(typeof props.scores[phase].recall1WeekScore !== "undefined"
                  ? "3 Days Later"
                  : "Today's") + " Written Response Score"}
              </div>
              <div></div>
              <div className="ScoreNum">
                {props.scores[phase].recall3DaysScore +
                  (props.scores[phase].recall3DaysScore !== 0
                    ? " / " + props.scores[phase].keywordsLen
                    : "")}
              </div>
              {typeof props.scores[phase].recall1WeekScore !== "undefined" && (
                <>
                  <div className="ScoreTitle">
                    Today's Written Response Score
                  </div>
                  <div></div>
                  <div className="ScoreNum">
                    {props.scores[phase].recall1WeekScore +
                      (props.scores[phase].recall1WeekScore !== 0
                        ? " / " + props.scores[phase].keywordsLen
                        : "")}
                  </div>
                </>
              )}
              {/* <div className="ScoreTitle">Recall After 4 Days Score Ratio</div>
            <div></div>
            <div className="ScoreNum">
              {props.scores[phase].recall3DaysScoreRatio.toFixed(2)}
            </div> */}
            </div>
          )}
          <div id="StartTestContainer">
            <Button
              id="StartTestButton"
              className="Button"
              onClick={props.nextStep}
              variant="contained"
            >
              CONTINUE
            </Button>
          </div>
          <p>
            If for any reason the passage on the left does not load, click the
            "RELOAD" button and wait.
          </p>
          <div id="ReloadContainer">
            <Button
              id="ReloadButton"
              className="Button"
              onClick={props.changePConURL}
              variant="contained"
            >
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
              nextStep={props.nextStep}
            />
          )}
          {step !== 2 && (
            <>
              <p>
                Please navigate through the passage on the left and answer the
                questions.
              </p>
              <p>
                Then, click the "NEXT" button to continue with the next
                question. You can revise your answers to the previous questions
                using the "PREVIOUS" button.
              </p>
              <p>
                After completely answering all the questions, click the "SUBMIT
                &amp; CONTINUE!" button to continue to the next step.
              </p>
              <p>
                If for any reason the passage on the left does not load, click
                the "RELOAD" button and wait.
              </p>
              <div id="ReloadContainer">
                <Button
                  id="ReloadButton"
                  className="Button"
                  onClick={props.changePConURL}
                  variant="contained"
                >
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
