import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { FC } from "react";

import { NodeType } from "../src/knowledgeTypes";
import HtmlTooltip from "./HtmlTooltip";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";

type Props = {
  title: string;
  linkSrc: string;
  nodeType: NodeType;
  nodeImageUrl?: string;
  nodeContent?: string;
  showListItemIcon?: boolean;
};
const LinkedNodeItem: FC<Props> = ({ nodeImageUrl, nodeContent, title, nodeType, linkSrc }) => {
  return (
    <HtmlTooltip
      title={
        <Box>
          <Typography variant="body2" sx={{ mb: 3 }} component="div">
            <MarkdownRender text={nodeContent || ""} />
          </Typography>
          {nodeImageUrl && (
            <Box>
              <img src={nodeImageUrl} width="100%" height="100%" />
            </Box>
          )}
        </Box>
      }
      placement="left"
    >
      <ListItemButton component="a" href={linkSrc}>
        {
          <ListItemIcon>
            <NodeTypeIcon nodeType={nodeType} />
          </ListItemIcon>
        }
        <ListItemText primary={<MarkdownRender text={title} />} />
      </ListItemButton>
    </HtmlTooltip>
  );
};

export default LinkedNodeItem;
