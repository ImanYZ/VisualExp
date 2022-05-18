import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { FC } from "react";
import { KnowledgeNode } from "../src/knowledgeTypes";

type Props = {
  node: KnowledgeNode;
};

const MasonryNodeItem: FC<Props> = ({ node }) => {
  return (
    <Card>
      {node.nodeImage && (
        <CardMedia
          component="img"
          height="140"
          image={node.nodeImage}
          alt={node.title}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {node.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {node.content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MasonryNodeItem;
