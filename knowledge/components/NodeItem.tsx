import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import { FC, ReactNode, useState } from "react";

import { KnowledgeNode, KnowledgeNodeContributor } from "../src/knowledgeTypes";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import NodeVotes from "./NodeVotes";
import QuestionItem from "./QuestionItem";

dayjs.extend(relativeTime);

const CONTRIBUTORS: KnowledgeNodeContributor[] = [
  {
    username: "Maria",
    imageUrl: "https://lenstax.com/auth/app-assets/images/profile/user-uploads/user-04.jpg"
  },
  {
    username: "Juan",
    imageUrl: "https://preview.keenthemes.com/metronic-v4/theme_rtl/assets/pages/media/profile/profile_user.jpg"
  }
];

const TAGS: { node: string; title?: string; label?: string }[] = [
  { node: "", title: "tag 1", label: "tag1" },
  { node: "", title: "tag 2", label: "tag2" },
  { node: "", title: "tag 3", label: "tag3" }
];

type Props = {
  node: KnowledgeNode;
  contributors?: ReactNode;
};

const NodeItem: FC<Props> = ({ node }) => {
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
          transform: !expand ? "rotate(0deg)" : "rotate(180deg)"
        }}
      >
        <ExpandMoreIcon />
      </Button>
    );
  };

  return (
    <Card sx={{ width: "100%", m: 0, padding: { xs: "4px 9px", md: "14px 36px" } }}>
      <CardHeader
        title={
          <NextLink passHref href={`/${encodeURIComponent(node.title || "")}/${node.id}`}>
            <Link variant="h5" underline="none" color="inherit">
              <MarkdownRender text={node.title || ""} />
            </Link>
          </NextLink>
        }
      ></CardHeader>
      <Box sx={{ padding: "0px 8px", display: "flex", alignItems: "center" }}>
        {node.updatedAt && (
          <Tooltip title={`Last updated on ${new Date(node.updatedAt).toLocaleString()}`}>
            <Typography sx={{ ml: 1 }} component="span" color="text.secondary" variant="caption">
              {dayjs(new Date(node.updatedAt)).fromNow()}
            </Typography>
          </Tooltip>
        )}
        <NodeTypeIcon nodeType={node.nodeType} sx={{ marginLeft: "10px" }} />
      </Box>

      <CardContent>
        <Typography variant="body1" color="text.secondary" component="div">
          <MarkdownRender text={node.content || ""} />
        </Typography>

        {node.nodeType === "Question" && <QuestionItem node={node} />}
        {node.nodeImage && <CardMedia component="img" height="140" image={node.nodeImage} alt={node.title} />}
      </CardContent>

      <CardActions>
        <Box
          sx={{ display: "flex", flexDirection: "row", flex: 1, justifyContent: "space-between", alignItems: "center" }}
        >
          <NextLink passHref href={`/${encodeURIComponent(node.title || "")}/${node.id}`}>
            <Link variant="h6" component="a" sx={{ fontWeight: "400" }}>
              Learn more
            </Link>
          </NextLink>
          <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
            <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />
          </Box>
          <ExpandMore expand={expanded} />
        </Box>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box py={1}>
            {TAGS.map((tag, idx) => (
              <Chip key={idx} label={tag.title} sx={{ marginRight: "10px" }} />
            ))}
          </Box>
          <Grid container spacing={2} py={1}>
            <Grid item xs={6}>
              <Box>
                {CONTRIBUTORS.map((contributor, idx) => (
                  <Box key={idx} sx={{ display: "inline-block", transform: `translateX(${idx * -10}px)` }}>
                    <Avatar
                      alt="Image contributor"
                      src={contributor.imageUrl}
                      sx={{ border: "solid", width: 56, height: 56, borderColor: theme => theme.palette.common.gray }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                {CONTRIBUTORS.map((contributor, idx) => (
                  <Box key={idx} sx={{ display: "inline-block", transform: `translateX(${idx * -10}px)` }}>
                    <Avatar
                      alt="Image contributor"
                      src={contributor.imageUrl}
                      sx={{ border: "solid", width: 56, height: 56, borderColor: theme => theme.palette.common.gray }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
          {/* </Box> */}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default NodeItem;
