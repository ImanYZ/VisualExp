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

const item = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "white",
};

const number = {
  fontSize: 24,
  fontFamily: "default",
  color: "secondary.main",
  fontWeight: "medium",
  margin: "10px 0px 10px 0px",
};

const image = {
  height: 130,
  my: 4,
};

const artboards = [
  { name: "animation1", durationMs: 5000 },
  { name: "animation2", durationMs: 30000 },
  { name: "animation3", durationMs: 1000 }
  // {name:"animation1",durationMs:2000},
  // {name:"animation2",durationMs:1000},
  // {name:"animation3",durationMs:1500}
]

const howElements = [
  {
    id: "Summarizing",
    title: "Summarize",
    content: `We summarize the gist of every valuable piece of knowledge
    on the Web into small chunks of knowledge that we call
    "nodes."`,
  },
  {
    id: "Linking",
    title: "Link",
    content: `We identify and visualize the prerequisite knowledge "links"
    between nodes.`,
  },
  {
    id: "Evaluating",
    title: "Evaluate",
    content: `We group-evaluate the nodes and links, through up/down-votes
    and comments.`,
  },
  {
    id: "Improving",
    title: "Improve",
    content: `We collaboratively improve and up-date nodes and links
    through proposals and community approvals.`,
  },
];

// const iniStepChecked = [];
// for (let value of howElements) {
//   iniStepChecked.push(false);
// }

const HowItWorks = (props) => {

  const animation1Ref = useRef(null)
  const animation2Ref = useRef(null)
  const animation3Ref = useRef(null)
  const animation4Ref = useRef(null)
  const animation5Ref = useRef(null)
  const animation6Ref = useRef(null)

  useImperativeHandle(props.innerRef, () => {
    return {
      getAnimation1Height: () => animation1Ref?.current?.clientHeight ?? 0,
      getAnimation2Height: () => animation2Ref?.current?.clientHeight ?? 0,
      getAnimation3Height: () => animation3Ref?.current?.clientHeight ?? 0,
      getAnimation4Height: () => animation4Ref?.current?.clientHeight ?? 0,
      getAnimation5Height: () => animation5Ref?.current?.clientHeight ?? 0,
      getAnimation6Height: () => animation6Ref?.current?.clientHeight ?? 0,
    };
  }, []);
  const { height, width } = useWindowSize();

  // const { rive, RiveComponent } = useRive({
  //   src: "gg.riv",
  //   stateMachines: artboards[0].name,
  //   autoplay: false,
  // });

  // const [stepChecked, setStepChecked] = useState(iniStepChecked);

  // const flipCard = (idx) => (event) => {
  //   const sChecked = [...stepChecked];
  //   sChecked[idx] = !sChecked[idx];
  //   setStepChecked(sChecked);
  // };

  // const [stepChecked, setStepChecked] = useState([false, false, false, false]);

  // useEffect(() => {
  //   if (props.section >= sectionIdx - 1 && !stepChecked[0]) {
  //     setStepChecked([true, false, false, false]);
  //     setTimeout(() => {
  //       setStepChecked([true, true, false, false]);
  //       setTimeout(() => {
  //         setStepChecked([true, true, true, false]);
  //         setTimeout(() => {
  //           setStepChecked([true, true, true, true]);
  //         }, 1000);
  //       }, 1000);
  //     }, 1000);
  //   }
  // }, [props.section, stepChecked]);

  const boxLarge = useMemo(() => {
    if (height < width) return height - 100
    return width - 100
  }, [height, width])

  return (
    <>

      <Box
        id="HowItWorksSection"
        component="section"
        sx={{
          pt: 7,
          pb: 10,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#28282a"
          // bgcolor: "secondary.light",
          // border: 'dashed 6px orange'
        }}
      >
        <Typography variant="h4" marked="center" sx={{ mb: 7, color: "#f8f8f8" }}>
          {sectionsOrder[sectionIdx].title}
        </Typography>
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

        <div style={{ position: 'sticky', top: height / 2 - boxLarge / 2 + 35, /* border: 'solid 2px royalBlue', */ width: boxLarge, height: boxLarge, display: 'flex', flexDirection: 'column' }}>
          {props.riveComponent}
        </div>
        <div ref={animation1Ref} style={{ height: "100vh", width: "100%" /* background: "#123" */ }}></div>
        <div ref={animation2Ref} style={{ height: "500vh", width: "100%" /* background: "#2769aa" */ }}></div>
        <div ref={animation3Ref} style={{ height: "300vh", width: "100%" /* background: "#3696f7" */ }}></div>
        <div ref={animation4Ref} style={{ height: "300vh", width: "100%" /* background: "#26c2ff" */ }}></div>
        <div ref={animation5Ref} style={{ height: "300vh", width: "100%" /* background: "#24f0ff" */ }}></div>
        <div ref={animation6Ref} style={{ height: "100vh", width: "100%" /* background: "#15e9a2" */, position: "absolute", bottom: "0px", left: "0px" }}></div>

        {/* --- animation ends */}

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
