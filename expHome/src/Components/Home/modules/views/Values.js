import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Collapse from "@mui/material/Collapse";
import { CardActionArea, Stack, useMediaQuery } from "@mui/material";

import Typography from "../components/Typography";

import valuesItems from "./valuesItems";
import sectionsOrder from "./sectionsOrder";
import { useInView } from "../hooks/useObserver";
import { useTheme } from "@mui/styles";
import { gray03 } from "../../Home";
const observerOption = { options: { root: null, rootMargin: "0px", threshold: 0.5 } };

const iniStepChecked = [];
for (let value of valuesItems) {
  iniStepChecked.push(false);
}

const sectionIdx = sectionsOrder.findIndex(
  (sect) => sect.id === "ValuesSection"
);

const Values = (props) => {

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:900px)");

  const { ref: ref1, inViewOnce: inViewOnce1 } = useInView(observerOption);
  const { ref: ref2, inViewOnce: inViewOnce2 } = useInView(observerOption);
  const { ref: ref3, inViewOnce: inViewOnce3 } = useInView(observerOption);
  const { ref: ref4, inViewOnce: inViewOnce4 } = useInView(observerOption);
  const { ref: ref5, inViewOnce: inViewOnce5 } = useInView(observerOption);
  const { ref: ref6, inViewOnce: inViewOnce6 } = useInView(observerOption);
  const { ref: ref7, inViewOnce: inViewOnce7 } = useInView(observerOption);
  const { ref: ref8, inViewOnce: inViewOnce8 } = useInView(observerOption);
  const { ref: ref9, inViewOnce: inViewOnce9 } = useInView(observerOption);

  const refs = [ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9];
  const inViewOnces = [
    inViewOnce1,
    inViewOnce2,
    inViewOnce3,
    inViewOnce4,
    inViewOnce5,
    inViewOnce6,
    inViewOnce7,
    inViewOnce8,
    inViewOnce9,
  ];

  const getGrayColorText = () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2);

  const [stepChecked, setStepChecked] = useState(iniStepChecked);

  const flipCard = (idx) => (event) => {
    const sChecked = [...stepChecked];
    sChecked[idx] = !sChecked[idx];
    setStepChecked(sChecked);
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowX: "hidden",
      }}
    >
      <Stack direction={"column"} spacing={isMobile ? "60px" : "100px"}>
        {valuesItems.map((value, idx) => (
          <Stack
            ref={refs[idx]}
            key={idx}
            direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
            spacing={isMobile ? "0px" : "40px"}
            // alignItems={"center"}
            alignItems={"stretch"}
          // alignSelf={"stretch"}
          >
            <Box
              component={"picture"}
              sx={{
                // border: "solid 2px orange",
                minWidth: isTablet ? "350px" : "300px",
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "center" : idx % 2 === 0 ? "flex-start" : "flex-end",
              }}
              className={inViewOnces[idx] ? (idx % 2 === 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
            >
              <img
                alt={value.name}
                src={theme.palette.mode === "light" ? "/static/why-section/" + value.image : "/static/why-section/" + value.imageDark}
                style={{ flex: 1, width: "100%" }}
              />
            </Box>
            <Box
              sx={{
                p: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                "& > *:not(:last-child)": {
                  mb: "12px",
                },
              }}
              className={inViewOnces[idx] ? (idx % 2 !== 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
            >
              <Typography
                gutterBottom
                variant="h3"
                component="h3"
                sx={{ fontSize: "24px", textAlign: isMobile ? "center" : "start", color: "white" }}
              >
                {value.name}
              </Typography>
              {value.body.split("\n").map((paragraph, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    textAlign: "left",
                    color: getGrayColorText(),
                    fontSize: "16px",
                    color: "white"
                  }}
                >
                  {paragraph}
                </Typography>
              ))}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
    // <Box
    //   id="ValuesSection"
    //   component="section"
    //   sx={{

    //     position: "relative",
    //     display: "flex",
    //     flexDirection: "column",
    //     alignItems: "center",
    //   }}
    // >
    //   <Grid container spacing={2.5} align="center">
    //     {valuesItems.map((value, idx) => {
    //       return (
    //         <Grid key={value.name} item xs={12} sm={6} md={4} lg={3}>
    //           <Card sx={{ maxWidth: 340, background: "#202020", color: "#f8f8f8" }}>
    //             <CardActionArea onClick={flipCard(idx)}>
    //               <Box
    //                 sx={{
    //                   display: "flex",
    //                   justify: "center",
    //                   alignItems: "center",
    //                   height: "250px",

    //                 }}
    //               >
    //                 <CardMedia
    //                   component="img"
    //                   width="100%"
    //                   image={"/static/" + value.image}
    //                   alt={value.name}
    //                   sx={{ padding: "10px 37px 0px 37px" }}
    //                 />
    //               </Box>
    //               <CardContent>
    //                 <Typography gutterBottom variant="h5" component="div">
    //                   {value.name}
    //                 </Typography>
    //                 <Collapse in={!stepChecked[idx]} timeout={1000}>
    //                   Learn more ...
    //                 </Collapse>
    //                 <Collapse in={stepChecked[idx]} timeout={1000}>
    //                   <Typography
    //                     variant="body2"
    //                     sx={{ textAlign: "left", color: "#AAAAAA" }}
    //                   >
    //                     {value.body}
    //                   </Typography>
    //                 </Collapse>
    //               </CardContent>
    //             </CardActionArea>
    //           </Card>
    //         </Grid>
    //       );
    //     })}
    //   </Grid>
    // </Box>
  );
};

export default Values;
