import Box from "@mui/material/Box";
import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { FC } from "react";
import { KnowledgeNode } from "../src/knowledgeTypes";
import CardActions from "@mui/material/CardActions";
import NextLink from "next/link";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import NodeVotes from "./NodeVotes";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import { CardHeader } from "@mui/material";

type Props = {
  node: KnowledgeNode;
};

const MasonryNodeItem: FC<Props> = ({ node }) => {
  return (
    <Card>
      <CardHeader
        title={
          <NextLink
            passHref
            href={`/${encodeURIComponent(node.title)}/${node.id}`}
          >
            <Link variant="h5" underline="none" color="inherit">
              <MarkdownRender children={node.title} />
            </Link>
          </NextLink>
        }
        action={<NodeTypeIcon nodeType={node.nodeType} color="primary" />}
      ></CardHeader>
      {node.nodeImage && (
        <CardMedia
          component="img"
          height="140"
          image={node.nodeImage}
          alt={node.title}
        />
      )}
      <Divider />
      <CardContent>
        <Typography variant="body1" color="text.secondary" component="div">
          <MarkdownRender children={node.content} />
        </Typography>
      </CardContent>
      <Divider />
      <CardActions>
        <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
          <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />
        </Box>
      </CardActions>
    </Card>
  );
};

export default MasonryNodeItem;
