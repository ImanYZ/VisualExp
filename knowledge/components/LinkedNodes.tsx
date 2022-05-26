import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import React, { FC } from "react";

import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import LinkedNodeItem from "./LinkedNodeItem";
import TypographyUnderlined from "./TypographyUnderlined";

type Props = {
  data: LinkedKnowledgeNode[];
  header: string;
};

const LinkedNodes: FC<Props> = ({ data, header }) => {
  const renderLinkedNodes = () => {
    return data.map((el, idx) => (
      <React.Fragment key={idx}>
        <LinkedNodeItem node={el} />
        <Divider />
      </React.Fragment>
    ));
  };

  return (
    <Card>
      <CardHeader
        sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}
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

export default LinkedNodes;
