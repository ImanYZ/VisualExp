// Add this import
import Head from "next/head";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import CodeIcon from "@mui/icons-material/Code";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ShareIcon from "@mui/icons-material/Share";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PersonIcon from "@mui/icons-material/Person";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EventIcon from "@mui/icons-material/Event";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ArticleIcon from "@mui/icons-material/Article";
import LockIcon from "@mui/icons-material/Lock";

import Layout from "../../components/layout";
import { getNodeData } from "../../lib/nodes";

export async function getServerSideProps({ params }) {
  const nodeData = await getNodeData(params.id);
  return {
    props: {
      nodeData,
    },
  };
}

const Node = ({ nodeData }) => {
  return (
    <Layout>
      <Head>
        <title>{nodeData.title}</title>
      </Head>
      <Card sx={{ minWidth: "340px" }}>
        <CardContent>
          <Typography variant="h4" component="div">
            {nodeData.title}
          </Typography>
          <div dangerouslySetInnerHTML={{ __html: nodeData.contentHtml }} />
          <Box style={{ display: "inline-block", color: "#ff9100" }}>
            {nodeData.nodeType === "Code" ? (
              <CodeIcon />
            ) : nodeData.nodeType === "Concept" ? (
              <LocalLibraryIcon />
            ) : nodeData.nodeType === "Relation" ? (
              <ShareIcon />
            ) : nodeData.nodeType === "Question" ? (
              <HelpOutlineIcon />
            ) : nodeData.nodeType === "Profile" ? (
              <PersonIcon />
            ) : nodeData.nodeType === "Sequel" ? (
              <MoreHorizIcon />
            ) : nodeData.nodeType === "Advertisement" ? (
              <EventIcon />
            ) : nodeData.nodeType === "Reference" ? (
              <MenuBookIcon />
            ) : nodeData.nodeType === "Idea" ? (
              <EmojiObjectsIcon />
            ) : nodeData.nodeType === "News" ? (
              <ArticleIcon />
            ) : nodeData.nodeType === "Private" ? (
              <LockIcon />
            ) : (
              <LockIcon />
            )}
            <Typography
              sx={{
                fontSize: 13,
                padding: "0px 0px 0px 19px",
                verticalAlign: "5.5px",
              }}
              component="span"
              color="text.secondary"
              gutterBottom
            >
              {nodeData.date}
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button size="small">Learn More</Button>
        </CardActions>
      </Card>
      {/* <div className={utilStyles.lightText}>{nodeData.date}</div> */}
    </Layout>
  );
};

export default Node;
