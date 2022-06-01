import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import React, { FC } from "react";

import { encodeTitle } from "../lib/utils";
import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import LinkedNodeItem from "./LinkedNodeItem";
import TypographyUnderlined from "./TypographyUnderlined";

type Props = {
  data: LinkedKnowledgeNode[];
  header: string;
};

const LinkedNodes: FC<Props> = ({ data, header }) => {
  const renderLinkedNodes = () => {
    return data.map((el, idx, src) => (
      <React.Fragment key={idx}>
        <LinkedNodeItem
          key={idx}
          title={el.title || ""}
          linkSrc={`../${encodeTitle(el.title)}/${el.node}`}
          nodeType={el.nodeType}
          nodeImageUrl={el.nodeImage}
          nodeContent={el.content}
        />
        {idx < src.length - 1 && <Divider />}
      </React.Fragment>
    ));
  };

  return (
    <Card>
      <CardHeader
        sx={{
          backgroundColor: theme => theme.palette.common.darkGrayBackground,
          color: theme => theme.palette.common.white
        }}
        title={
          <Box sx={{ textAlign: "center" }}>
            <TypographyUnderlined variant="h6" fontWeight="300" gutterBottom align="center">
              {header}
            </TypographyUnderlined>
          </Box>
        }
      ></CardHeader>
      <CardContent sx={{ p: "12px 0px" }}>
        <List sx={{ p: "0px" }}>{renderLinkedNodes()}</List>
      </CardContent>
    </Card>
  );
};

export default LinkedNodes;
