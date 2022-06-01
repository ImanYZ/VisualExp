import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";

import { KnowledgeNode } from "../src/knowledgeTypes";
import { NodeItem } from "./NodeItem";

type TrendingNodesProps = {
  nodes: KnowledgeNode[];
  sx?: SxProps<Theme>;
};

export const TrendingNodes = ({ sx, nodes }: TrendingNodesProps) => {
  return (
    <Box sx={{ ...sx }}>
      <Masonry sx={{ my: "20px" }} columns={{ xm: 1, md: 2 }} spacing={2} defaultHeight={450}>
        {nodes.map(el => (
          <NodeItem key={el.id} node={el} />
        ))}
      </Masonry>
    </Box>
  );
};
