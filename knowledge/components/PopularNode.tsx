import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { FC } from "react";
import { KnowledgeNode } from "../src/knowledgeTypes";
import CardActions from "@mui/material/CardActions";
import NextLink from "next/link";

type Props = {
  node: KnowledgeNode;
  height?: string;
};

const NodeItem: FC<Props> = ({ node, height }) => {
  return (
    <Card data-testid="node-item" sx={{ position: "relative" }}>
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
      <CardActions
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <NextLink
          href={`/${encodeURIComponent(node.title)}/${node.id}`}
          passHref
        >
          <Button size="small">Learn More</Button>
        </NextLink>
      </CardActions>
    </Card>
  );
};

export default NodeItem;
