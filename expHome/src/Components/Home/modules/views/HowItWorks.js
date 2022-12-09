import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import React, { useCallback, useEffect, useRef } from "react";

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


  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const step5Ref = useRef(null);
  const step6Ref = useRef(null);
  const step7Ref = useRef(null);

  const { height, width } = useWindowSize();

  const { rive, RiveComponent } = useRive({
    src: "gg.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  const scrollInput = useStateMachineInput(rive, "State Machine 1", "scroll");

  const onChangeObserver = useCallback(
    (e) => {
      if (!scrollInput) return;

      e.forEach(({ isIntersecting, target }) => {
        let idx = null;
        if (target.id === "step-0") idx = 0;
        if (target.id === "step-1") idx = 1;
        if (target.id === "step-2") idx = 2;
        if (target.id === "step-3") idx = 3;
        if (target.id === "step-4") idx = 4;
        if (target.id === "step-5") idx = 5;
        if (target.id === "step-6") idx = 6;
        if (target.id === "step-7") idx = 7;
        if (isIntersecting && idx !== null) {
          scrollInput.value = 5 + idx * 10;
        }

        // let cumulativeHeight = 0;
        // for (let sIdx = -1; sIdx < newValue; sIdx++) {
        //   const sectOffsetHeight = window.document.getElementById(
        //     sectionsOrder[sIdx + 1].id
        //   ).scrollHeight;
        //   cumulativeHeight += sectOffsetHeight;
        // }
        // window.document.getElementById("ScrollableContainer").scroll({
        //   top: cumulativeHeight,
        //   left: 0,
        //   behavior: "smooth",
        // });
      });
    },
    [scrollInput]
  );

  useEffect(() => {
    if (
      !props.innerRef ||
      !step1Ref.current ||
      !step2Ref.current ||
      !step3Ref.current ||
      !step4Ref.current ||
      !step5Ref.current ||
      !step6Ref.current ||
      !step7Ref.current
    )
      return;

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.51,
    };
    const ob = new IntersectionObserver(onChangeObserver, options);
    ob.observe(props.innerRef.current);
    ob.observe(step1Ref.current);
    ob.observe(step2Ref.current);
    ob.observe(step3Ref.current);
    ob.observe(step4Ref.current);
    ob.observe(step5Ref.current);
    ob.observe(step6Ref.current);
    ob.observe(step7Ref.current);
    return () => {
      ob.disconnect();
    };
  }, [onChangeObserver, props.innerRef]);

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

  return (
    <Container
      id="HowItWorksSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "secondary.light",
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
      <Typography variant="h4" marked="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography>

      {/* --- animations start */}


      <Box sx={{ position: "relative", /* border: "dashed 2px royalBlue" */ background: "#cacaca79", width: "inherit" }}>
        <div id="step-1" ref={step1Ref} style={{ height: height - 100, borderBottom: "2px solid #eee", padding: "20px", fontSize: "20px", textAlign: "center" /* background: "#0f375f79" */ }}>Learning a topic is challenging because there are an ever growing number of sources. How can we learn as much as possible with our limited available time?</div>
        <div id="step-2" ref={step2Ref} style={{ height: height - 100, borderBottom: "2px solid #eee", padding: "20px", fontSize: "20px", textAlign: "center" /* background: "#218f7d79" */ }}>As a community, people can identify more concepts in available literature.</div>
        <div id="step-3" ref={step3Ref} style={{ height: height - 100, borderBottom: "2px solid #eee", padding: "20px", fontSize: "20px", textAlign: "center" /* background: "#4bb48079" */ }}>They can explain these concepts in a concise way.</div>
        <div id="step-4" ref={step4Ref} style={{ height: height - 100, borderBottom: "2px solid #eee", padding: "20px", fontSize: "20px", textAlign: "center" /* background: "#73bed179" */ }}>They can visualize how concepts are related by linking them together.</div>
        <div id="step-5" ref={step5Ref} style={{ height: height - 100, borderBottom: "2px solid #eee", padding: "20px", fontSize: "20px", textAlign: "center" /* background: "#e864a679" */ }}>By adding prerequisite concepts they can learn concepts they do not understand</div>
        <div id="step-6" ref={step6Ref} style={{ height: height - 100, borderBottom: "2px solid #eee", padding: "20px", fontSize: "20px", textAlign: "center" /* background: "#edb05579" */ }}>And they can dive deeper into subjects by adding children concepts.</div>
        <div id="step-7" ref={step7Ref} style={{ height: height - 100, borderBottom: "2px solid #eee", padding: "20px", fontSize: "20px", textAlign: "center", position: "absolute", bottom: "0px", left: "0px" /* background: "#f4fa5779" */ }}>What starts as a collection of notes becomes a community generated learning pathway. </div>
        {/* step-4 is an empty reference to know show last animation */}
        {/* <div
          id="step-8"
          ref={step7Ref}
          style={{ height, background: "#c5f35b79", position: "absolute", bottom: "0px", left: "0px" }}
        ></div> */}
        <Box
          sx={{
            height,
            borderRight: "solid 6px pink",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "sticky",
            bottom: "0px",
          }}
        >
          <Box sx={{ height: (10 * Math.min(height, width)) / 12, width: (10 * Math.min(height, width)) / 12 }}>
            <RiveComponent className="rive-canvas" />
          </Box>
        </Box>
      </Box>

      {/* animation ends */}

      <Box sx={{ zIndex: 1, mx: "auto" }}>
        <Grid container spacing={2.5} align="center">
          {howElements.map((elem, idx) => {
            return (
              <Grid key={elem + idx} item xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ ...item, maxWidth: 355 }}>
                  {/* <CardActionArea onClick={flipCard(idx)}> */}
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
                    {/* <Collapse in={!stepChecked[idx]} timeout={1000}>
                        Learn more ...
                      </Collapse>
                      <Collapse in={stepChecked[idx]} timeout={1000}> */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "left" }}
                    >
                      {elem.content}
                    </Typography>
                    {/* </Collapse> */}
                  </CardContent>
                  {/* </CardActionArea> */}
                </Card>
              </Grid>
            );
          })}
        </Grid>
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
    </Container >
  );
};


const HowItWorksForwarded = React.forwardRef((props, ref) => (<HowItWorks  {...props} innerRef={ref} />));


export default HowItWorksForwarded;
