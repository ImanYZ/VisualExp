import { CardContent } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
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
    <Card>
      <CardHeader title={<MarkdownRender text={node.title || ""} />}></CardHeader>
      <CardContent>
        {node.content && (
          <Typography variant="body1" color="text.secondary" component="div">
            <MarkdownRender text={node.content || ""} />
          </Typography>
        )}

        {node.nodeType === "Question" && <QuestionItem choices={node.choices} />}

        {node.nodeImage && (
          <Tooltip title="Click to view image in full-screen!">
            <Box
              onClick={handleClickImageFullScreen}
              sx={{
                display: "block",
                width: "100%",
                cursor: "pointer",
                mt: 3
              }}
            >
              <img src={node.nodeImage} width="100%" height="100%" loading="lazy" />
            </Box>
          </Tooltip>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            flex: 1,
            mt: 5
          }}
        >
          <Box sx={{ display: "flex", flex: 1, alignItems: "center" }}>
            <NodeTypeIcon nodeType={node.nodeType} />
            {node.changedAt && (
              <Tooltip title={`Last updated on ${new Date(node.changedAt).toLocaleString()}`}>
                <Typography sx={{ ml: 3 }} component="span" color="text.secondary" variant="caption">
                  {dayjs(new Date(node.changedAt)).fromNow()}
                </Typography>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
            <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />
          </Box>
        </Box>
        <Divider sx={{ my: 5 }} />
        <Box sx={{ mb: 6 }}>{contributors}</Box>
      </CardContent>
      {node.nodeImage && (
        <FullScreenImage src={node.nodeImage} open={imageFullScreen} onClose={() => setImageFullScreen(false)} />
      )}
    </Card>
  );
};
