import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";

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

  const animation0Ref = useRef(null)
  const animation1Ref = useRef(null)
  const animation2Ref = useRef(null)
  const animation3Ref = useRef(null)
  const animation4Ref = useRef(null)
  const animation5Ref = useRef(null)
  const animation6Ref = useRef(null)
  const { height, width } = useWindowSize();

  useImperativeHandle(props.innerRef, () => {
    return {
      getAnimation0Height: () => animation0Ref?.current?.clientHeight ?? 0,
      getAnimation1Height: () => animation1Ref?.current?.clientHeight ?? 0,
      getAnimation2Height: () => animation2Ref?.current?.clientHeight ?? 0,
      getAnimation3Height: () => animation3Ref?.current?.clientHeight ?? 0,
      getAnimation4Height: () => animation4Ref?.current?.clientHeight ?? 0,
      getAnimation5Height: () => animation5Ref?.current?.clientHeight ?? 0,
      getAnimation6Height: () => animation6Ref?.current?.clientHeight ?? 0,
    };
  }, []);

  const boxLarge = useMemo(() => {
    if (height < width) return height - 100
    return width - 100
  }, [height, width])

  const topCenteredPosition = height / 2 - boxLarge / 2 + 35

  return (
    <>

      <Box
        id="HowItWorksSection"
        component="section"
        sx={{
          // pt: 7,
          // pb: 10,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#28282a"
          // bgcolor: "secondary.light",
          // border: 'dashed 6px orange'
        }}
      >

        {/* <Box
        component="img"
        src="/static/CurvyLines.png"
        alt="curvy lines"
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: -180,
          opacity: 0.7,
          zIndex: 0,
        }}
      /> */}


        {/* --- animations start */}
        <div style={{ position: 'sticky', top: topCenteredPosition, width: boxLarge, height: boxLarge, display: 'flex', flexDirection: 'column', zIndex: 10/* , border: "solid 2px pink" */ }}>
          {props.riveComponent}
        </div>
        <div ref={animation0Ref} style={{ height: boxLarge, width: boxLarge, position: "absolute"/* , background: "#3b5015" */, top: "0px", padding: "20px" }}>
          <Typography variant="h4" marked="center" sx={{ /* mb: 7, */ color: "#f8f8f8", textAlign: "center" }}>
            {sectionsOrder[sectionIdx].title}
          </Typography>
          {/* <h2 style={{ color: 'orange', background: "black" }}>0: {animation0Ref?.current?.clientHeight ?? 0}</h2> */}
        </div>
        <div ref={animation1Ref} style={{ height: "1000vh", width: "100%"/* , borderRight: "solid 20px #8031a5" */ }}>
          {/* <h2 style={{ color: 'orange', background: "black" }}>1: {animation1Ref?.current?.clientHeight ?? 0}</h2> */}
        </div>
        <div ref={animation2Ref} style={{ height: "500vh", width: "100%"/* , borderRight: "solid 20px #2769aa" */ }}>
          {/* <h2 style={{ color: 'orange', background: "black" }}>2: {animation2Ref?.current?.clientHeight ?? 0}</h2> */}
        </div>
        <div ref={animation3Ref} style={{ height: "300vh", width: "100%"/* , borderRight: "solid 20px #3696f7" */ }}>
          {/* <h2 style={{ color: 'orange', background: "black" }}>3: {animation3Ref?.current?.clientHeight ?? 0}</h2> */}
        </div>
        <div ref={animation4Ref} style={{ height: "300vh", width: "100%"/* , borderRight: "solid 20px #26c2ff" */ }}>
          {/* <h2 style={{ color: 'orange', background: "black" }}>4: {animation4Ref?.current?.clientHeight ?? 0}</h2> */}
        </div>
        <div ref={animation5Ref} style={{ height: "300vh", width: "100%"/* , borderRight: "solid 20px #24f0ff" */ }}>
          {/* <h2 style={{ color: 'orange', background: "black" }}>5: {animation5Ref?.current?.clientHeight ?? 0}</h2> */}
        </div>
        {/* <div ref={animation6Ref} style={{ height: "100vh", width: "100%", borderRight: "solid 20px #15e9a2", position: "absolute", bottom: "0px", left: "0px" }}>6</div> */}

        {/* --- animation ends */}
        <Button
        color="secondary"
        variant="contained"
        size="large"
        component="a"
        href="#JoinUsSection"
        sx={{ minWidth: 200, color: "common.white" ,zIndex:"10"}}
      >
        Apply to Join Us!
      </Button>
        <Box sx={{ zIndex: 1, mx: "auto" }}>
          {/* <Grid container spacing={2.5} align="center">
            {howElements.map((elem, idx) => {
              return (
                <Grid key={elem + idx} item xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ ...item, maxWidth: 355 }}>
                    <Box sx={number}>{idx + 1}.</Box>
                    <Box
                      alignItems="center"
                      sx={{
                        display: "flex",
                        justify: "center",
                        alignItems: "center",
                        height: "190px",
                      }}
                    >
                      <CardMedia
                        component="img"
                        src={"/static/" + elem.id + ".svg"}
                        alt={elem.id}
                        height="100%"
                        width="100%"
                        sx={{ px: "10px" }}
                      />
                    </Box>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {elem.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "left" }}
                      >
                        {elem.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid> */}
          <Box sx={{ mt: "19px" }}>
            <YoutubeEmbed embedId="vkNx-QUmbNI" />
          </Box>
        </Box>
        {/* <Button
        color="secondary"
        size="large"
        variant="contained"
        component="a"
        href="#JoinUsSection"
        sx={{ mt: 10, color: "common.white" }}
      >
        Get started
      </Button> */}
      </Box >
    </>
  );
};


const HowItWorksForwarded = React.forwardRef((props, ref) => (<HowItWorks  {...props} innerRef={ref} />));


export default HowItWorksForwarded;
