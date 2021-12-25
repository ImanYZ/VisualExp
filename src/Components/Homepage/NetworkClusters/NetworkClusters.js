import React from "react";

import HomepageNetworkingDark from "../../../assets/HomepageNetworkingDark.jpg";
import HomepageNetworkingLight from "../../../assets/HomepageNetworkingLight.jpg";

import "./NetworkClusters.css";

const NetworkClusters = (props) => {
  return (
    <div
      className={
        props.theme === "Light" ? "TeamsDiv LightModeTeamsDiv " : "TeamsDiv"
      }
    >
      <div id="KnowledgeGraphClustersHeader" className="HeaderGradientText">
        1Cademy Knowledge Graph Clusters
      </div>
      <img
        className="TeamsImage"
        src={
          props.theme === "Light"
            ? HomepageNetworkingLight
            : HomepageNetworkingDark
        }
        alt="Teams"
      />
    </div>
  );
};

export default NetworkClusters;
