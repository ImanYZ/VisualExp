import React from "react";
import Grid from "@mui/material/Grid";

import "./Video.css";

const Video = () => {
  return (
    <div className="VideoDiv">
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/sl8ZBJjfQHY"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  );
};

export default Video;
