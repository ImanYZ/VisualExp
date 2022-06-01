import { Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import React, { FC } from "react";

import { encodeTitle, isValidHttpUrl } from "../lib/utils";
import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import LinkedNodeItem from "./LinkedNodeItem";

type Props = {
  references: LinkedKnowledgeNode[];
  sx?: SxProps<Theme>;
};

const ReferencesList: FC<Props> = ({ references, sx }) => {
  // console.log('references', references)
  const getReferenceTitle = (el: LinkedKnowledgeNode) => {
    if (isValidHttpUrl(el.label)) {
      return `${el.title}:  ${el.label}`;
    }
    return el.title || "";
  };
  return (
    <Card sx={{ ...sx }}>
      <CardHeader
        sx={{
          height: "60px",
          px: "50px",
          backgroundColor: theme => theme.palette.grey[100]
        }}
        title={
          <Box>
            <Typography variant="h5" fontWeight={300} fontSize="23px">
              References
            </Typography>
          </Box>
        }
      ></CardHeader>
      <CardContent sx={{ px: "0px" }}>
        <List sx={{ p: "0px" }}>
          {references.map((node, idx, src) => (
            <React.Fragment key={idx}>
              <LinkedNodeItem
                // key={idx}
                title={getReferenceTitle(node)}
                linkSrc={`../${encodeTitle(node.title)}/${node.node}`}
                nodeType={node.nodeType}
                nodeImageUrl={node.nodeImage}
                nodeContent={node.content}
                showListItemIcon={false}
                label={node.label || ""}
                sx={{ p: "40px 50px" }}
              />
              {idx < src.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ReferencesList;
