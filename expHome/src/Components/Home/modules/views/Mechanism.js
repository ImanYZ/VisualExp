import { Box, Stack, Typography, useTheme } from "@mui/material";
import { gray200, gray600 } from "../../../../utils/colors";
import { RiveComponentMemoized } from "../../../Rive/RiveComponentMemoized";

import { useWindowSize } from "../../hooks/useWindowSize";

export const MECHANISM_ITEMS = [
  {
    id: "summarizing",
    title: "Summarizing",
    description:
      "Through a human-AI collaboration, we gather valuable information from various sources such as books, articles, and videos, divide it into granular pieces, and identify the overlapping pieces. We then combine them into concise notes, each focusing on a single concept. Traditional note-taking methods often only benefit the individual for a short period of time, typically for a semester or two. 1Cademy's human-AI collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics.",
    animation: {
      src: "notebook.riv",
      artboard: "artboard-3"
    }
  },
  {
    id: "linking",
    title: "Linking",
    description:
      "Our notes, which are organized in granular pieces, can be transformed into a knowledge graph that visually illustrates the hierarchical relationships between concepts. The linking of concepts is beneficial as it helps us understand how concepts relate to one another and their place in broader topics, fields, or disciplines. ",
    animation: {
      src: "notebook.riv",
      artboard: "artboard-4"
    }
  },
  {
    id: "Evaluating",
    title: "Voting",
    description:
      "To ensure the quality of the knowledge graph on 1Cademy, we have implemented a peer-review process. Each individual concept, represented as a node, can be voted on by members of the community, and the score of the node will determine its level of modification or the possibility of deletion.",
    animation: {
      src: "notebook.riv",
      artboard: "artboard-5"
    }
  },
  {
    id: "improving",
    title: "Improving",
    description:
      "We work together to improve the knowledge presented by continually updating and refining concepts. For each node, there are multiple versions proposed by different people.",
    animation: {
      src: "notebook.riv",
      artboard: "artboard-6"
    }
  }
];

const Mechanism = ({ mechanisms }) => {
  const theme = useTheme();
  const { width } = useWindowSize();

  return (
    <Box>
      {mechanisms.map((cur, idx) => (
        <Stack
          key={cur.id}
          direction={{ xs: "column", md: idx % 2 === 0 ? "row" : "row-reverse" }}
          spacing={{ xs: "32px", md: "auto" }}
          alignItems="center"
          justifyContent={"space-between"}
          minHeight={{ md: "512px" }}
          sx={{ mb: { xs: "32px", md: "61px" } }}
        >
          <Box sx={{ maxWidth: { md: "528px" }, textAlign: "left" }}>
            <Typography component={"h3"} sx={{ fontSize: "30px", fontWeight: "600px", mb: "16px",color:"common.white" }}>
              {cur.title}
            </Typography>
            <Typography sx={{ color: theme.palette.mode === "light" ? gray200 : gray600 }}>
              {cur.description}
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: `${width - 10}px`, sm: "500px", md: "350px", lg: "550px" },
              height: { xs: getHeight(width - 10), sm: getHeight(500), md: getHeight(350), lg: getHeight(550) }
            }}
          >
            <RiveComponentMemoized
              src={cur.animation.src}
              artboard={cur.animation.artboard}
              animations={["Timeline 1", "dark"]}
              autoplay={true}
            />
          </Box>
        </Stack>
      ))}
    </Box>
  );
};

const getHeight = width => (300 * width) / 500;

export default Mechanism;
