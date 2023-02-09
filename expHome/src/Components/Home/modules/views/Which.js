import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Button, Stack, Typography } from "@mui/material";
import React, {  useMemo } from "react";
import { useEffect, useState } from "react";
import { gray03 } from "../../../../utils/colors";

import { RiveComponentMemoized } from "../../../Rive/RiveComponentMemoized";
import { useWindowSize } from "../../hooks/useWindowSize";
import whichValues from "./whichItems";

export const RE_DETECT_NUMBERS_WITH_COMMAS = /(\[)(0|([1-9](\d*|\d{0,2}(,\d{3})*)))?(\.\d*[1-9])?(\])/;

const GoalsAnimationWidth = 950;
const GoalsAnimationHeight = 380;
const Which = () => {

  const [canvasDimension, setCanvasDimension] = useState({ width: 0, height: 0 });
  const { width } = useWindowSize();

//   const { data: stats } = useQuery("stats", getStats);



  useEffect(() => {
    let newWidth = width / 2;
    if (width > 1536) newWidth = 750;
    else if (width > 1200) newWidth = 600;
    else if (width > 900) newWidth = width / 2;
    else if (width > 600) newWidth = width - 60;
    else if (width > 0) newWidth = width - 40;

    const newHeight = getHeight(newWidth);
    setCanvasDimension({ width: newWidth, height: newHeight });
  }, [width]);

  const AnimationSections = useMemo(() => {
    return whichValues.map((whichItem, idx, src) => (
      <Stack
        // ref={refs[idx]}
        key={whichItem.id}
        direction={"column"}
        spacing={"20px"}
        alignItems={width < 900 ? "center" : "stretch"}
        sx={{ position: "relative", minHeight: "500px" /* , border: `2px dashed red` */ }}
      >
        <Typography gutterBottom variant="h3" component="h3" sx={{ fontSize: "32px", textAlign: "center" ,color:"common.white"}}>
          {whichItem.name}
        </Typography>
        <Box sx={{ position: "relative", alignSelf: "center" }}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            {idx === 0 && (
              <Box
                component={"a"}
                href={whichItem.link}
                target="_blank"
                rel="noreferrer"
                sx={{ width: canvasDimension.width, height: canvasDimension.height }}
              >
                <RiveComponentMemoized
                  src="notebook.riv"
                  artboard={"artboard-6"}
                  animations={["Timeline 1","dark"]}
                  autoplay={true}
                />
              </Box>
            )}
            {idx === 1 && (
              <Box
                sx={{
                  width: width < 900 ? canvasDimension.width : GoalsAnimationWidth,
                  height: width < 900 ? canvasDimension.height : GoalsAnimationHeight,
                }}
              >
                <RiveComponentMemoized
                  src="goals.riv"
                  artboard={"artboard-3"}
                  animations={["Timeline 1", "dark"]}
                  autoplay={true}
                />
              </Box>
            )}
            {idx === 2 && (
              <Box sx={{ width: canvasDimension.width, height: canvasDimension.height }}>
                <RiveComponentMemoized
                  src="extension.riv"
                  artboard={"extension"}
                  animations={["Timeline 1", "dark"]}
                  autoplay={true}
                />
              </Box>
            )}
          </Box>
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
            pb: idx < src.length - 1 ? "100px" : "0px",
          }}
        >
          {(whichItem.body)
            .split("\n")
            .map((paragraph, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{
                  textAlign: "left",
                  color: gray03,
                  fontSize: "16px",
                }}
              >
                {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
              </Typography>
            ))}
          <Box>
            {whichItem.link && (
          
          <Button variant="outlined" href={whichItem.link} target="_blank" rel="noreferrer" color="secondary">
                Visit
                <LaunchIcon fontSize={"small"} sx={{ ml: "10px" }} />
              </Button>
            )}
            {!whichItem.link && (
              <Button variant="outlined" disabled color="secondary">
                Coming Soon
                <LaunchIcon fontSize={"small"} sx={{ ml: "10px" }} />
              </Button>
            )}
          </Box>
        </Box>
      </Stack>
    ));
  }, [canvasDimension.height, canvasDimension.width, width]);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // overflowX: "hidden",
      }}
    >
      {AnimationSections}
      {/* <Stack direction={"column"} spacing={isMobile ? "60px" : "100px"}>
        {WhichSections}
      </Stack> */}
    </Box>
  );
};

export const wrapStringWithBoldTag = (paragraph, RE) => {
    return paragraph
      .split(" ")
      .map((str, idx) => (
        <React.Fragment key={idx}>
          {str.match(RE) ? <b>{`${str.substring(1, str.length - 1)} `}</b> : `${str} `}
        </React.Fragment>
      ));
  };

const getHeight = (width) => (300 * width) / 500;

export default Which;
