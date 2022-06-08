import ShareIcon from "@mui/icons-material/Share";
import { Button, CardActions } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
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
import { ShareButtons } from "./ShareButtons";

dayjs.extend(relativeTime);

type Props = {
  node: KnowledgeNode;
  contributors?: ReactNode;
};

export const NodeItemFull: FC<Props> = ({ node, contributors }) => {
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const handleClickImageFullScreen = () => {
    setImageFullScreen(true);
  };

  return (
    <Card sx={{ width: "100%", m: 0, padding: { xs: "4px 9px", md: "34px 36px" } }}>
      <CardHeader title={<MarkdownRender text={node.title || ""} />}></CardHeader>
      <CardContent>
        {node.content && (
          <Typography variant="body1" color="text.secondary" component="div">
            <MarkdownRender text={node.content || ""} />
          </Typography>
        )}

        {node.nodeType === "Question" && (
          <CardContent>
            <QuestionItem choices={node.choices} />
          </CardContent>
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
      </CardContent>

      <CardActions sx={{ p: "16px" }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "center" },
            justifyContent: "space-between"
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "auto" },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <NodeTypeIcon nodeType={node.nodeType} />
              {node.changedAt && (
                <Tooltip title={`Last updated on ${new Date(node.changedAt).toLocaleString()}`}>
                  <Typography sx={{ ml: 1 }} component="span" color="text.secondary" variant="caption">
                    {dayjs(new Date(node.changedAt)).fromNow()}
                  </Typography>
                </Tooltip>
              )}
            </Box>

            <Box sx={{ display: "flex" }}>
              <Button
                sx={{ color: theme => (showShareButtons ? theme.palette.common.orange : theme.palette.grey[600]) }}
                onClick={() => setShowShareButtons(!showShareButtons)}
              >
                <ShareIcon sx={{ mx: "12px" }} />
                {!showShareButtons && <Typography py="2px">Share</Typography>}
              </Button>
              {showShareButtons && <ShareButtons />}
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              pt: { xs: "20px", sm: "0px" },
              display: "flex",
              flex: 1,
              justifyContent: "flex-end",
              alignItems: { xs: "end", sm: "center" }
            }}
          >
            <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />
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
