import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import React from "react";

import { encodeTitle } from "../lib/utils";
import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import LinkedNodeItem from "./LinkedNodeItem";
import TypographyUnderlined from "./TypographyUnderlined";

type LinkedNodesProps = {
  data: LinkedKnowledgeNode[];
  header: string;
};

export const LinkedNodes = ({ data, header }: LinkedNodesProps) => {
  const renderLinkedNodes = () => {
    return data.map((el, idx) => (
      <React.Fragment key={idx}>
        <LinkedNodeItem
          key={idx}
          title={el.title || ""}
          linkSrc={`../${encodeTitle(el.title)}/${el.node}`}
          nodeType={el.nodeType}
          nodeImageUrl={el.nodeImage}
          nodeContent={el.content}
        />
        <Divider />
      </React.Fragment>
    ));
  };

  return (
    <Card>
      <CardHeader
        sx={{ backgroundColor: theme => theme.palette.grey[100] }}
        title={
          <Box sx={{ textAlign: "center" }}>
            <TypographyUnderlined variant="h5" gutterBottom align="center">
              {header}
            </TypographyUnderlined>
          </Box>
        }
      ></CardHeader>
      <Divider />
      <CardContent sx={{ p: 0 }}>
        <List>{renderLinkedNodes()}</List>
      </CardContent>
    </Card>
  );
};
