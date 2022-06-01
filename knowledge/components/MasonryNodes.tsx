import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { SxProps, Theme } from "@mui/system";
import { FC } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";
import NodeItem from "./NodeItem";

type Props = {
  nodes: KnowledgeNode[];
  page: number;
  totalPages: number;
  sx?: SxProps<Theme>;
  onChangePage: (page: number) => void;
};

const TrendingNodes: FC<Props> = ({ nodes, sx, page, totalPages, onChangePage }) => {
  const renderMasonry = () => {
    return nodes.map(el => <NodeItem key={el.id} node={el} />);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    onChangePage(value);
  };

  if (nodes.length === 0) {
    return <Box sx={{ textAlign: "center", mt: 3, ...sx }}>No data found</Box>;
  }

  return (
    <Box sx={{ ...sx }}>
      <Masonry sx={{ my: "20px" }} columns={{ xm: 1, md: 2 }} spacing={2} defaultHeight={450}>
        {renderMasonry()}
      </Masonry>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Pagination count={totalPages} page={page} onChange={handleChangePage} />
      </Box>
    </Box>
  );
};

export default TrendingNodes;
