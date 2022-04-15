import React from "react";

import "./Thoughts.css";

const Thoughts = (props) => {
  return (
    <div className="ThoughtsContainer">
      <div id="FirstThought" className="thought">
        {props.phrase1}
      </div>
      <div id="SecondThought" className="thought">
        {props.phrase2}
      </div>
      <div id="ThirdThought" className="thought">
        {props.phrase3}
      </div>
    </div>
  );
};

export default React.memo(Thoughts);
