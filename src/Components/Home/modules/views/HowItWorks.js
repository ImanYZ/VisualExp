import React from "react";

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
    </Container>
  );
};

export default HowItWorks;
