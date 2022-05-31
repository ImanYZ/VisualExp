import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NextLink from "next/link";
import { FC, ReactNode } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import NodeVotes from "./NodeVotes";
import QuestionItem from "./QuestionItem";

dayjs.extend(relativeTime);

type Props = {
  node: KnowledgeNode;
  contributors?: ReactNode;
};

const NodeItemFull: FC<Props> = ({ node, contributors }) => {
  return (
    <Card sx={{ width: "100%", m: 0 }}>
      <CardHeader
        title={
          <NextLink passHref href={`/${encodeURIComponent(node.title || "")}/${node.id}`}>
            <Link variant="h5" underline="none" color="inherit">
              <MarkdownRender text={node.title || ""} />
            </Link>
          </NextLink>
        }
      ></CardHeader>
      {node.nodeImage && <CardMedia component="img" height="140" image={node.nodeImage} alt={node.title} />}
      <Divider />
      <CardContent>
        <Typography variant="body1" color="text.secondary" component="div">
          <MarkdownRender text={node.content || ""} />
        </Typography>

        {node.nodeType === "Question" && <QuestionItem node={node} />}
      </CardContent>
      <Divider />
      <CardActions>
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, my: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center"
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center"
              }}
            >
              <NodeTypeIcon nodeType={node.nodeType} />
              {node.updatedAt && (
                <Tooltip title={`Last updated on ${new Date(node.updatedAt).toLocaleString()}`}>
                  <Typography sx={{ ml: 1 }} component="span" color="text.secondary" variant="caption">
                    {dayjs(new Date(node.updatedAt)).fromNow()}
                  </Typography>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
              <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          {contributors}
        </Box>
      </CardActions>
    </Card>
  );
};

export default NodeItemFull;
