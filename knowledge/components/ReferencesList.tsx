import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import { FC } from "react";

import { encodeTitle, isValidHttpUrl } from "../lib/utils";
import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import LinkedNodeItem from "./LinkedNodeItem";

type Props = {
  references: LinkedKnowledgeNode[];
  sx?: SxProps<Theme>;
};

const ReferencesList: FC<Props> = ({ references, sx }) => {
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
              References
            </Typography>
          </Box>
        }
      ></CardHeader>
      <CardContent sx={{ p: 0 }}>
        <List dense>
          {references.map((node, idx) => (
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

export default ReferencesList;
