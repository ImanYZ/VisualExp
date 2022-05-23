import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { FC } from "react";
import { KnowledgeNode } from "../src/knowledgeTypes";
import PopularNode from "./PopularNode";
import { SxProps, Theme } from "@mui/system";

type Props = {
  sx?: SxProps<Theme>;
  nodes: KnowledgeNode[];
};

const PopularNodes: FC<Props> = ({ nodes, sx }) => {
  return (
    <Box sx={{ ...sx }}>
      <Typography variant="h3">Popular</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          overflowX: "auto",
          width: "100%",
          mt: 2,
          mx: -1,
        }}
      >
        {nodes.map((el) => (
          // <NodeItem key={el.id} node={el} />
          <Box
            key={el.id}
            sx={{
              maxHeight: "400px",
              //   width: "300px",
              minWidth: "300px",
              mr: 2,
              display: "flex",
              flex: 1,
              p: 1,
            }}
          >
            <PopularNode key={el.id} node={el} height="400px" />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PopularNodes;
