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
const sectionIdx = sectionsOrder.findIndex(
  (sect) => sect.id === "HowItWorksSection"
);


const HowItWorks = (props) => {

  const sectionHeaderRef = useRef(null)
  const animation0Ref = useRef(null)
  // const animation1Ref = useRef(null)
  // const animation2Ref = useRef(null)
  // const animation3Ref = useRef(null)
  // const animation4Ref = useRef(null)
  // const animation5Ref = useRef(null)
  // const animation6Ref = useRef(null)
  const { height, width } = useWindowSize();

  useImperativeHandle(props.innerRef, () => {
    return {
      getSectionHeaderHeight: () => sectionHeaderRef?.current?.clientHeight ?? 0,
      getAnimation0Height: () => animation0Ref?.current?.clientHeight ?? 0,
      // getAnimation1Height: () => animation1Ref?.current?.clientHeight ?? 0,
      // getAnimation2Height: () => animation2Ref?.current?.clientHeight ?? 0,
      // getAnimation3Height: () => animation3Ref?.current?.clientHeight ?? 0,
      // getAnimation4Height: () => animation4Ref?.current?.clientHeight ?? 0,
      // getAnimation5Height: () => animation5Ref?.current?.clientHeight ?? 0,
      // getAnimation6Height: () => animation6Ref?.current?.clientHeight ?? 0,
    };
  }, []);

  const boxLarge = useMemo(() => {
    if (height < width) return height - 100
    return width - 100
  }, [height, width])

  const topCenteredPosition = height / 2 - boxLarge / 2 + 35

  const getHeightSection = () => props.artboards.reduce((a, c) => a + c.getHeight(height), 0)
  console.log({ res: getHeightSection() })

  return (
    <Box
      id="HowItWorksSection"
      component="section"
      sx={{
        // pt: 7,
        // pb: 10,
        // minHeight: height - 70 + height + height + height,
        height: getHeightSection(),
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // backgroundColor: "#28282a"
        // bgcolor: "secondary.light",
        // border: 'dashed 6px orange'
      }}
    >
      <Box sx={{ position: "absolute", top: "0px", width: width, height: height - 70, borderRight: "dashed 6px red", color: "white" }}>{height - 70}px</Box>
      <Box sx={{ position: "absolute", top: height - 70, width: width, height: height, borderRight: "dashed 6px #ff5e00", color: "white" }}>{height}px</Box>
      <Box sx={{ position: "absolute", top: height - 70 + height, width: width, height: height, borderRight: "dashed 6px #ffae00", color: "white" }}>{height}px</Box>
      <Box sx={{ position: "absolute", top: height - 70 + height + height, width: width, height: height, borderRight: "dashed 6px #88ff00", color: "white" }}>{height}px</Box>

      {/* <div style={{
          height: height - 70, width: '100%', position: "absolute", top: 0, padding: "20px",
          backgroundImage: `url(${backgroundImage})`,
        }}> 

      </div>*/}


      {/* --- animations start */}
      <div style={{ position: 'sticky', top: topCenteredPosition, width: boxLarge, height: boxLarge, display: 'flex', flexDirection: 'column', zIndex: 10, border: "solid 2px pink" }}>
        {props.riveComponent}
      </div>

      {/* <div ref={sectionHeaderRef} style={{
          position: "absolute", height: boxLarge / 3, width: boxLarge,
          border: 'dashed 2px #48ff00',
          top: "0px", padding: "20px"
        }}>

        </div>
        <div ref={animation0Ref} style={{
          height: boxLarge / 3 * 2, width: boxLarge, position: "absolute", top: boxLarge / 3, padding: "20px",
          border: 'dashed 2px red'
        }}>

        </div> */}

      {/* <div ref={animation1Ref} style={{ height: "1000vh", width: "100%", borderRight: "solid 20px #8031a5" }}>

        </div> */}
      {/* <div ref={animation2Ref} style={{ height: "500vh", width: "100%", borderRight: "solid 20px #2769aa" }}>

        </div>
        <div ref={animation3Ref} style={{ height: "300vh", width: "100%", borderRight: "solid 20px #3696f7" }}>

        </div>
        <div ref={animation4Ref} style={{ height: "300vh", width: "100%", borderRight: "solid 20px #26c2ff" }}>

        </div> */}


      {/* --- animation ends */}
      {/* <Button
          color="secondary"
          variant="contained"
          size="large"
          component="a"
          href="#JoinUsSection"
          sx={{ minWidth: 200, color: "common.white", zIndex: "10" }}
        >
          Apply to Join Us!
        </Button>
        <Box sx={{ zIndex: 1, mx: "auto" }}>
          
          <Box sx={{ mt: "19px" }}>
            <YoutubeEmbed embedId="vkNx-QUmbNI" />
          </Box>
        </Box> */}
    </Box >
  );
};


const HowItWorksForwarded = React.forwardRef((props, ref) => (<HowItWorks  {...props} innerRef={ref} />));


export default HowItWorksForwarded;
