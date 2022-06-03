import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, ReactNode, useState } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";
import FullScreenImage from "./FullScreenImage";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import NodeVotes from "./NodeVotes";
import QuestionItem from "./QuestionItem";

dayjs.extend(relativeTime);

type Props = {
  node: KnowledgeNode;
  contributors?: ReactNode;
};

export const NodeItemFull: FC<Props> = ({ node, contributors }) => {
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const handleClickImageFullScreen = () => {
    setImageFullScreen(true);
  };

  return (
    <Card sx={{ width: "100%", m: 0, padding: { xs: "4px 9px", md: "34px 36px" } }}>
      <CardHeader title={<MarkdownRender text={node.title || ""} />}></CardHeader>

      {node.content && (
        <CardContent>
          <Typography variant="body1" color="text.secondary" component="div">
            <MarkdownRender text={node.content || ""} />
          </Typography>
        </CardContent>
      )}

      {node.nodeType === "Question" && (
        <CardContent>{node.nodeType === "Question" && <QuestionItem node={node} />}</CardContent>
      )}

      {node.nodeImage && (
        <Tooltip title="Click to view image in full-screen!">
          <Box
            onClick={handleClickImageFullScreen}
            sx={{
              display: "block",
              width: "100%",
              px: "16px",
              cursor: "pointer"
            }}
          >
            <img src={node.nodeImage} width="100%" height="100%" loading="lazy" />
          </Box>
        </Tooltip>
      )}

      <CardActions sx={{ p: "16px" }}>
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
        </Box>
      </CardActions>
      <Divider sx={{ m: "24px 16px" }} />
      <CardContent>{contributors}</CardContent>
      {node.nodeImage && (
        <FullScreenImage src={node.nodeImage} open={imageFullScreen} onClose={() => setImageFullScreen(false)} />
      )}
    </Card>
  );
};
