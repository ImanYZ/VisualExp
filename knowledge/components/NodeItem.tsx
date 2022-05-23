import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { FC } from "react";
import { KnowledgeNode } from "../src/knowledgeTypes";
import CardActions from "@mui/material/CardActions";
import NextLink from "next/link";
import MarkdownRender from "./Markdown/MarkdownRender";

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
          <MarkdownRender children={node.title} />
        </Typography>
        <Typography variant="body1" color="text.secondary" component="div">
          <MarkdownRender children={node.content} />
        </Typography>
      </CardContent>
      <CardActions>
        <NextLink
          href={`/knowledge/${node.id}/${encodeURIComponent(node.title)}`}
          passHref
        >
          <Button size="small">Learn More</Button>
        </NextLink>
      </CardActions>
    </Card>
  );
};

export default MasonryNodeItem;
