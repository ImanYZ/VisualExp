import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";

import backgroundImage from "../../../../assets/darkModeLibraryBackground.jpg";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
// import Collapse from "@mui/material/Collapse";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
// import { CardActionArea } from "@mui/material";

import Button from "../components/Button";
import Typography from "../components/Typography";
import YoutubeEmbed from "../components/YoutubeEmbed/YoutubeEmbed";

import sectionsOrder from "./sectionsOrder";
import { useWindowSize } from "../../hooks/useWindowSize";
const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "HowItWorksSection");

const HowItWorks = props => {

  const { height, width } = useWindowSize();

  const boxLarge = useMemo(() => {
    const offset = width < 600 ? 0 : width < 900 ? 70 : 100
    if (height < width) return height - offset;
    return width - offset;
  }, [height, width]);

  const topCenteredPosition = height / 2 - boxLarge / 2 + 35;

  const getHeightSection = () => props.artboards.reduce((a, c) => a + c.getHeight(height), 0);

  const processedArtboard = useMemo(() => props.artboards.reduce((acu, cur) => {
    const newHeight = cur.getHeight(height);
    return [...acu, { ...cur, top: acu.length ? acu[acu.length - 1].top + acu[acu.length - 1].height : 0, height: newHeight }]
  }, []), [props.artboards, height])

  return (
    <Box
      id="HowItWorksSection"
      component="section"
      sx={{
        height: getHeightSection(),
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <Box
        key={'artboard-1'}
        sx={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: height - 70,
          // borderRight: `dashed 6px #ff28c9`,
          color: "white"

        }}
      >
        {/* {height - 70}px */}
      </Box>
      {processedArtboard.map(artboard => (
        <Box
          key={artboard.name}
          sx={{
            position: "absolute",
            top: artboard.top,
            width: "100%",
            height: artboard.height,
            // borderRight: `dashed 6px ${artboard.color}`,
            color: "white",
            p: "10px"
          }}
        >
          {/* {height - 70}px */}
        </Box>
      ))}

      <Box sx={{ position: "absolute", bottom: "40px", zIndex: 13 }}>{props.animationOptions}</Box>

      <div
        style={{
          position: "sticky",
          top: topCenteredPosition,
          width: boxLarge,
          height: boxLarge,
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          // border: "solid 2px pink"
        }}
      >
        {props.children}
      </div>
    </Box>
  );
};

const HowItWorksForwarded = React.forwardRef((props, ref) => <HowItWorks {...props} innerRef={ref} />);

export default HowItWorksForwarded;
