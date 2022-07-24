import React, { useState, useEffect } from "react";
import { firebaseState, fullnameState } from "../../../src/store/AuthAtoms";
import { useRecoilValue, useRecoilState } from "recoil";
import MCQuestion from "../MCQuestion/MCQuestion";
import "./Passage.css";


const PostQuestionsPage = (props) => {
    return (
      <>
      <div id="QuestionsInstructions">
        <MCQuestion
          setCurrentQIdx={props.setCurrentQIdx}
          currentQIdx={props.currentQIdx}
          questions={props.questions}
          nextStep={props.nextStep}
          explanations={props.explanations}
          setExplanations={props.setExplanations}
          step={props.step}
        />
      </div>
   
    </>
       
    );


};

export default PostQuestionsPage;
