import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses,TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { FC } from "react";

import { encodeTitle } from "../lib/utils";
import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";

type Props = {
  node: LinkedKnowledgeNode;
};
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    maxWidth: "340px",
    fontWeight: theme.typography.fontWeightRegular,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    border: `1px solid ${theme.palette.grey[400]}`,
  },
}));

const LinkedNodeItem: FC<Props> = ({ node }) => {
  return (
    <HtmlTooltip
      title={
        <Box>
          <Typography variant="body2" sx={{ mb: 3 }} component="div">
            <MarkdownRender text={node.content || ""}></MarkdownRender>
          </Typography>
          {node.nodeImage && (
            <Box>
              <img src={node.nodeImage} width="100%" height="100%" alt={node.title || ""} />
            </Box>
          )}
        </Box>
      }
      placement="left"
    >
      <ListItemButton component="a" href={`../${encodeTitle(node.title)}/${node.node}`}>
        <ListItemIcon>
          <NodeTypeIcon nodeType={node.nodeType} />
        </ListItemIcon>
        <ListItemText primary={<MarkdownRender text={node.title || ""} />} disableTypography={true} />
      </ListItemButton>
    </HtmlTooltip>
  );
};

export default LinkedNodeItem;
