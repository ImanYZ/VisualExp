import React from "react";
import { useRecoilValue } from "recoil";

import "./Passage.css";

import {
  stepState,
  secondSessionState,
  thirdSessionState,
} from "../../store/ExperimentAtoms";

import thankYouImg from "../../assets/ThankYou.jpg";

const PassageLeft = (props) => {
  const step = useRecoilValue(stepState);
  const secondSession = useRecoilValue(secondSessionState);
  const thirdSession = useRecoilValue(thirdSessionState);

  return [1.5, 2].includes(step) ? (
    <div id="QuestionsInstructions">
      <h2>Test of Your Prior Knowledge!</h2>
      <p>
        Please answer the questions on the right only based on your prior
        knowledge.
      </p>
      <p>Please do not search or use any other sources.</p>
      <p>
        Please only focus on what you see on this page and do not take notes or
        use other devices!
      </p>
      <p>
        The time left to complete this step is shown on top of the questions.
      </p>
      <p>
        After you feel comfortable with your answer to each question, click the
        "NEXT" button to continue with the next question.
      </p>
      <p>
        After you completely answer all the questions, click the "SUBMIT &amp;
        CONTINUE!" button to submit your answers and continue to the next step.
      </p>
    </div>
  ) : [13, 16].includes(step) ? (
    <div id="QuestionsInstructions">
      <h2>Test What You Recall!</h2>
      <p>
        Please answer the questions on the right only based on what you recall.
      </p>
      <p>Please do not search or use any notes or other sources.</p>
      <p>
        Please only focus on what you see on this page and do not take notes or
        use other devices!
      </p>
      <p>
        The time left to complete this step is shown on top of the questions.
      </p>
      <p>
        After you feel comfortable with your answer to each question, click the
        "NEXT" button to continue with the next question.
      </p>
      <p>
        After you completely answer all the questions, click the "SUBMIT &amp;
        CONTINUE!" button to submit your answers and continue to the next step.
      </p>
    </div>
  ) : [10, 20].includes(step) ? (
    <div>
      <div>
        <img src={thankYouImg} alt="Thank you Image!" width="100%" />
      </div>
      <div>
        <img src={thankYouImg} alt="Thank you Image!" width="100%" />
      </div>
    </div>
  ) : step === 11 ? (
    <div id="QuestionsInstructions">
      <h2>
        Welcome to the {secondSession ? "second" : thirdSession && "last"} phase
        of our UX Research Experiment!
      </h2>
      <p>
        In this short session, we're going to ask you to recall the two passages
        that you learned in the first session and answer some questions about
        them.
      </p>
    </div>
  ) : (
    <div id="PassageContainer">
      {[0, 4, 7, 14].includes(step) ? (
        <iframe
          width="100%"
          height="100%"
          src={
            step === 0
              ? "https://www.youtube.com/embed/uHKfrz65KSU?start=22&amp;autoplay=1"
              : step == 4
              ? "https://www.youtube.com/embed/C6RUp21s6BQ?start=4&amp;autoplay=1"
              : "https://www.youtube.com/embed/5ojcqpaO_Jo?autoplay=1"
          }
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <iframe id="PassageFrame" frameBorder="0" src={props.pConURL}></iframe>
      )}
    </div>
  );
};

export default PassageLeft;
