import { Box, Card, CardContent, CardHeader, List, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React from "react";

import { encodeTitle, isValidHttpUrl } from "../lib/utils";
import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import LinkedNodeItem from "./LinkedNodeItem";

type TagsListProps = {
  tags: LinkedKnowledgeNode[];
  sx?: SxProps<Theme>;
};

export const TagsList = ({ tags, sx }: TagsListProps) => {
  const getReferenceTitle = (el: LinkedKnowledgeNode) => {
    if (isValidHttpUrl(el.label)) {
      return `${el.title}:  ${el.label}`;
    }
    return el.title || "";
  };

  return (
    <Card sx={{ ...sx }}>
      <CardHeader
        sx={{ backgroundColor: theme => theme.palette.grey[300] }}
        title={
          <Box>
            <Typography variant="h5" fontWeight={100}>
              Tags
            </Typography>
          </Box>
        }
      ></CardHeader>
      <CardContent sx={{ p: 0 }}>
        <List dense>
          {tags.map((node, idx) => (
            <LinkedNodeItem
              key={idx}
              title={getReferenceTitle(node)}
              linkSrc={`../${encodeTitle(node.title)}/${node.node}`}
              nodeType={node.nodeType}
              nodeImageUrl={node.nodeImage}
              nodeContent={node.content}
              showListItemIcon={false}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
