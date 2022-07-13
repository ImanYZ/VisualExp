import React, { useState, useEffect } from "react";
import { firebaseState, fullnameState } from "../../../src/store/AuthAtoms";
import { useRecoilValue, useRecoilState } from "recoil";
import MCQuestion from "../MCQuestion/MCQuestion";
import QualitativeCoding from "./qualitativeCoding/QualitativeCoding";
import "./Passage.css";

const PostQuestionsPage = props => {
  const fullname = useRecoilValue(fullnameState);
  const firebase = useRecoilValue(firebaseState);
  const [experimentType, setExperimentType] = useState();

  useEffect(async () => {
    const userDoc = await firebase.db.collection("users").doc(fullname).get();
    const experiment = ["easyResponse", "activeCoding"];
    const random = Math.floor(Math.random() * experiment.length);
    setExperimentType("activeCoding");
    console.log(random, experiment[random]);
  }, []);

  if (experimentType === "easyResponse") {
    return (
      <div id="QuestionsInstructions">
        <MCQuestion
          setCurrentQIdx={props.setCurrentQIdx}
          currentQIdx={props.currentQIdx}
          questions={props.questions}
          nextStep={props.nextStep}
          explanations={props.explanations}
          setExplanations={props.setExplanations}
        />
      </div>
    );
  }
  if (experimentType === "activeCoding") {
    return (
      <div id="QuestionsInstructions">
        <QualitativeCoding
          currentQIdx={props.currentQIdx}
          questions={props.questions} />
      </div>
    );
  }
  return null;
};

export default PostQuestionsPage;
