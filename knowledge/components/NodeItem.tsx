import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Checkbox, FormControlLabel, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
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
import { FC, ReactNode, useState } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import NodeVotes from "./NodeVotes";

dayjs.extend(relativeTime);

type Props = {
  node: KnowledgeNode;
  contributors?: ReactNode;
};

const NodeItem: FC<Props> = ({ node, contributors }) => {
  const initialChoicesState = new Array(node.choices?.length || 0).fill(false);

  const [choicesState, setChoicesState] = useState<boolean[]>(initialChoicesState);

  const handleToogleQuestion = (index: number) => {
    setChoicesState(previousChoiceState => {
      const oldPreviousChoiceState = [...previousChoiceState];
      oldPreviousChoiceState[index] = !oldPreviousChoiceState[index];
      return oldPreviousChoiceState;
    });
  };
  return (
    <Card>
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

        {node.nodeType === "Question" && node.choices && (
          <>
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {node.choices.map((value, idx) => {
                return (
                  <>
                    <ListItem key={idx} disablePadding>
                      <ListItemIcon>
                        <FormControlLabel
                          label={value.choice}
                          control={
                            <>
                              {!choicesState[idx] && (
                                <Checkbox checked={choicesState[idx]} onChange={() => handleToogleQuestion(idx)} />
                              )}
                              {choicesState[idx] && !value.correct && (
                                <IconButton onClick={() => handleToogleQuestion(idx)}>
                                  <CloseIcon color="error" />
                                </IconButton>
                              )}
                              {choicesState[idx] && value.correct && (
                                <IconButton onClick={() => handleToogleQuestion(idx)}>
                                  <CheckIcon color="success" />
                                </IconButton>
                              )}
                            </>
                          }
                        />
                      </ListItemIcon>
                    </ListItem>

                    {choicesState[idx] && (
                      <ListItem key={`${idx}-feedback`} disablePadding>
                        <ListItemText primary={value.feedback} />
                      </ListItem>
                    )}
                  </>
                );
              })}
            </List>
          </>
        )}
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

export default NodeItem;
