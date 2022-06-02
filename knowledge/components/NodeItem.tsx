import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Avatar, Button, Collapse, Grid } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NextLink from "next/link";
import { useState } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import NodeVotes from "./NodeVotes";
import QuestionItem from "./QuestionItem";

dayjs.extend(relativeTime);

type NodeItemProps = {
  node: KnowledgeNode;
};

export const NodeItem = ({ node }: NodeItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const ExpandMore = ({ expand }: { expand: boolean }) => {
    return (
      <Button
        onClick={handleExpandClick}
        aria-expanded={expanded}
        aria-label="show more"
        sx={{
          transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
          color: theme => theme.palette.common.black
        }}
      >
        <Tooltip title={expand ? "Hide the tags and contributors." : "Show the tags and contributors."}>
          <ArrowDropDownIcon />
        </Tooltip>
      </Button>
    );
  };

  return (
    <Card sx={{ width: "100%", my: 1, padding: { xs: "4px 9px", md: "14px 34px" } }}>
      <CardHeader
        title={
          <NextLink passHref href={`/${encodeURIComponent(node.title || "")}/${node.id}`}>
            <Tooltip title="Click to learn more...">
              <Link
                variant="h3"
                underline="hover"
                color="inherit"
                component="h2"
                sx={{ fontSize: "25px", cursor: "pointer" }}
              >
                <MarkdownRender text={node.title || ""} />
              </Link>
            </Tooltip>
          </NextLink>
        }
      ></CardHeader>

      <CardContent>
        <Typography variant="body1" color="text.secondary" component="div">
          <MarkdownRender text={node.content || ""} />
        </Typography>

        {node.nodeType === "Question" && <QuestionItem node={node} />}
        {node.nodeImage && <CardMedia component="img" width="100%" image={node.nodeImage} alt={node.title} />}
      </CardContent>

      <CardActions>
        <Box
          sx={{ display: "flex", flexDirection: "row", flex: 1, justifyContent: "space-between", alignItems: "center" }}
        >
          <Box sx={{ display: "flex", flex: 1, justifyContent: "space-between" }}>
            <Box sx={{ padding: "0px 8px", display: "flex", alignItems: "center" }}>
              <NodeTypeIcon nodeType={node.nodeType} sx={{ marginLeft: "10px" }} />
              {node.updatedAt && (
                <Tooltip title={`Last updated on ${new Date(node.updatedAt).toLocaleString()}`}>
                  <Typography sx={{ ml: 1 }} component="span" color="text.secondary" variant="caption">
                    {dayjs(new Date(node.updatedAt)).fromNow()}
                  </Typography>
                </Tooltip>
              )}
            </Box>
            <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />
          </Box>
          <ExpandMore expand={expanded} />
        </Box>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box py={1}>
            {node.tags &&
              node.tags.map((tag, idx) => (
                <Chip key={idx} label={tag.title} sx={{ marginRight: "10px", marginBottom: "8px" }} />
              ))}
          </Box>
          <Grid container spacing={2} py={1}>
            <Grid item xs={6}>
              <Box>
                {node.contributors &&
                  node.contributors.map((contributor, idx) => (
                    <Box key={idx} sx={{ display: "inline-block", transform: `translateX(${idx * -10}px)` }}>
                      <Tooltip title={`${contributor.fullname} contributed to the evolution of this node.`}>
                        <Avatar
                          alt="Image contributor"
                          src={contributor.imageUrl}
                          sx={{
                            border: "solid",
                            width: 56,
                            height: 56,
                            borderColor: theme => theme.palette.common.gray
                          }}
                        />
                      </Tooltip>
                    </Box>
                  ))}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                {node.institutions &&
                  node.institutions.map((institution, idx) => (
                    <Box key={idx} sx={{ display: "inline-block", transform: `translateX(${idx * -10}px)` }}>
                      <Tooltip
                        title={`Students/researchers at ${institution.name} contributed to the evolution of this node.`}
                      >
                        <Avatar
                          alt="Image contributor"
                          src={institution.logoURL}
                          sx={{
                            border: "solid",
                            width: 56,
                            height: 56,
                            borderColor: theme => theme.palette.common.gray
                          }}
                        />
                      </Tooltip>
                    </Box>
                  ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
};
