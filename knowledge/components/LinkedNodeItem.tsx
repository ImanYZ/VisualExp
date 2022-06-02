import LinkIcon from "@mui/icons-material/Link";
import { Link, ListItem, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import LinkNext from "next/link";
import { FC } from "react";

import { isValidHttpUrl } from "../lib/utils";
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
  label: string;
  sx?: SxProps<Theme>;
};
const LinkedNodeItem: FC<Props> = ({ nodeImageUrl, nodeContent, title, nodeType, linkSrc, label, sx }) => {
  return (
    <HtmlTooltip
      title={
        <Box>
          <Typography variant="body2" component="div">
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
      <ListItem sx={{ display: "flex", justifyContent: "space-between", ...sx }}>
        <LinkNext href={linkSrc}>
          <Link
            sx={{ fontSize: "inherit", cursor: "pointer", color: theme => theme.palette.common.black }}
            component="a"
            underline="none"
          >
            <MarkdownRender text={title} />
          </Link>
        </LinkNext>
        <ListItemIcon>
          <NodeTypeIcon nodeType={nodeType} sx={{ marginLeft: "auto" }} />
        </ListItemIcon>
        {isValidHttpUrl(label) && (
          <Tooltip title="Open the reference specified section in new tab">
            <Link
              target="_blank"
              href={label}
              sx={{
                display: "flex",
                direction: "row",
                justifyContent: "center",
                color: theme => theme.palette.common.darkGrayBackground
              }}
            >
              <LinkIcon />
            </Link>
          </Tooltip>
        )}
      </ListItem>
    </HtmlTooltip>
  );
};

export default LinkedNodeItem;
