import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";
import { FC } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";
import NodeItem from "./NodeItem";

type Props = {
  nodes: KnowledgeNode[];
  sx?: SxProps<Theme>;
};

const TrendingNodes: FC<Props> = ({ nodes, sx }) => {
  const renderMasonry = () => {
    return nodes.map(el => <NodeItem key={el.id} node={el} />);
  };

  return (
    <Box sx={{ ...sx }}>
      <Masonry sx={{ my: 0 }} columns={{ xm: 1, md: 2 }} spacing={2} defaultHeight={450}>
        {renderMasonry()}
      </Masonry>
    </Box>
  );
};

export default TrendingNodes;
