import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import Box from "@mui/material/Box";
// import Collapse from "@mui/material/Collapse";
// import { CardActionArea } from "@mui/material";

import Typography from "../components/Typography";

import { useWindowSize } from "../../hooks/useWindowSize";
import { Stack, useMediaQuery } from "@mui/material";

import { RiveComponentMemoized } from "../../../Rive/RiveComponentMemoized";
import { Magnitude } from "../components/Magnitude";
import { forwardRef } from "react";
import { gray03 } from "../../../../utils/colors";
const statsInit = {
  institutions: "0",
  links: "0",
  nodes: "0",
  proposals: "0",
  users: "0",
  communities: "0"
};
export const RE_DETECT_NUMBERS_WITH_COMMAS = /(\[)(0|([1-9](\d*|\d{0,2}(,\d{3})*)))?(\.\d*[1-9])?(\])/;

const HowItWorks = (props, ref)  => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const [canvasDimension, setCanvasDimension] = useState({ width: 0, height: 0 });
  // const [stats, setStats] = useState({});
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);

  const refs = useMemo(() => [ref1, ref2, ref3, ref4, ref5], []);

  useImperativeHandle(ref, () => ({
    getHeight1: () => (ref1?.current ? ref1.current.clientHeight : 0),
    getHeight2: () => (ref2?.current ? ref2.current.clientHeight : 0),
    getHeight3: () => (ref3?.current ? ref3.current.clientHeight : 0),
    getHeight4: () => (ref4?.current ? ref4.current.clientHeight : 0),
    getHeight5: () => (ref5?.current ? ref5.current.clientHeight : 0)
  }));

  const { width } = useWindowSize();

  // useEffect(() => {
  //   fetch("https:/1cademy.com/api/stats")
  //     .then(res => res.json())
  //     .then(data => setStats(data));
      
  // }, []);

  // const memoStats=useMemo(()=>stats,[stats])


  const getDescription = useCallback(artboard => {

    // if (!artboard.getDescription) return artboard.description;
    // if (!stats) return artboard.description;
    return artboard.description;
    // return artboard.getDescription(stats);
  }, []);

  useEffect(() => {
    let newWidth = width / 2;
    if (width > 1536) newWidth = 700;
    else if (width > 1200) newWidth = 500;
    else if (width > 900) newWidth = width / 2;
    else if (width > 600) newWidth = width - 60;
    else if (width > 0) newWidth = width - 40;

    const newHeight = getHeight(newWidth);
    setCanvasDimension({ width: newWidth, height: newHeight });
  }, [width]);

  const AnimationSections = useMemo(() => {
    return props.artboards.map((artboard, idx, src) => (
      <Stack
        ref={refs[idx]}
        key={artboard.name}
        direction={width < 900 ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
        spacing={width < 900 ? "20px" : "40px"}
        alignItems={width < 900 ? "center" : "stretch"}
        alignSelf={width < 900 ? "center" : idx % 2 === 0 ? "flex-end" : "flex-start"}
        sx={{ position: "relative", minHeight: "500px" /* , border: `2px dashed red` */ }}
      >
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: width < 900 ? "relative" : "absolute",

              left: idx % 2 === 0 ? undefined : "0",
              right: idx % 2 === 1 ? undefined : "0",
              /* border: "solid 1px royalBlue", */
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center"
            }}
          >
            {idx < src.length - 1 && (
              <Box sx={{ width: `${canvasDimension.width}px`, height: `${canvasDimension.height}px` }}>
                <RiveComponentMemoized
                  src="notebook.riv"
                  artboard={artboard.artoboard}
                  animations={["Timeline 1", "dark"]}
                  autoplay={true}
                />
              </Box>
            )}
            {idx === src.length - 1 && (
              <Box sx={{ width: `${canvasDimension.width}px`, height: `${canvasDimension.height}px` }}>
                <Magnitude stats={statsInit} width={canvasDimension.width} />
              </Box>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            maxWidth: width < 900 ? "600px" : "400px",
            p: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            "& > *:not(:last-child)": {
              mb: "12px"
            },
            pb: idx < src.length - 1 ? "100px" : "0px"
          }}
        >
          <Typography
            gutterBottom
            variant="h3"
            component="h3"
            sx={{ fontSize: "32px", textAlign: isMobile ? "center" : "start" ,color:"common.white"}}
          >
            {artboard.name}
          </Typography>

          {getDescription(artboard)
            .split("\n")
            .map((paragraph, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{
                  textAlign: "left",
                  color: gray03,
                  fontSize: "16px"
                }}
              >
                {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
              </Typography>
            ))}
        </Box>
      </Stack>
    ));
  }, [canvasDimension.height, canvasDimension.width, getDescription, isMobile, props.artboards, refs, width]);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {AnimationSections}
    </Box>
  );
};

const getHeight = (width) => (300 * width) / 500;


export const wrapStringWithBoldTag = (paragraph, RE) => {
  return paragraph
    .split(" ")
    .map((str, idx) => (
      <React.Fragment key={idx}>
        {str.match(RE) ? <b>{`${str.substring(1, str.length - 1)} `}</b> : `${str} `}
      </React.Fragment>
    ));
};
const HowItWorksFordwarded = forwardRef(HowItWorks);

export default HowItWorksFordwarded;
