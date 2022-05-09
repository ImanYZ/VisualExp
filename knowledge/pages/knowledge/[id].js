// Add this import
import Head from "next/head";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";

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
  if (!nodeData) {
    return {
      // returns the default 404 page with a status code of 404
      notFound: true,
    };
  }
  const contributors = [];
  for (let contriId in nodeData.contributors) {
    const contriIdx = contributors.findIndex(
      (contri) => contri.reputation < nodeData.contributors[contriId].reputation
    );
    const theContributor = {
      ...nodeData.contributors[contriId],
      username: contriId,
    };
    contributors.splice(contriIdx, 0, theContributor);
  }
  const institutions = [];
  for (let institId in nodeData.institutions) {
    const institIdx = institutions.findIndex(
      (instit) => instit.reputation < nodeData.institutions[institId].reputation
    );
    const theInstitution = {
      ...nodeData.institutions[institId],
      name: institId,
    };
    institutions.splice(institIdx, 0, theInstitution);
  }
  console.log({
    nodeData: {
      ...nodeData,
      contributors,
      institutions,
    },
  });
  return {
    props: {
      nodeData: {
        ...nodeData,
        contributors,
        institutions,
      },
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
          <div dangerouslySetInnerHTML={{ __html: nodeData.contentHTML }} />
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "left",
              flexWrap: "wrap",
              listStyle: "none",
              p: 0.5,
              m: 0,
            }}
            component="ul"
          >
            {nodeData.contributors &&
              nodeData.contributors.map((contributor, idx) => {
                return (
                  <li key={contributor.username}>
                    <Chip
                      sx={{
                        height: "49px",
                        margin: "4px",
                        borderRadius: "28px",
                      }}
                      icon={
                        <Avatar
                          src={contributor.imageUrl}
                          alt={contributor.fullname}
                          sx={{
                            width: "40px",
                            height: "40px",
                            mr: 2.5,
                          }}
                        />
                      }
                      variant="outlined"
                      label={
                        <>
                          <Typography variant="body2" component="div">
                            {contributor.fullname}
                          </Typography>
                          <Typography variant="body2" component="div">
                            {idx === 0 ? "🏆" : "✔️"}
                            {" " +
                              Math.round(
                                (contributor.reputation + Number.EPSILON) * 100
                              ) /
                                100}
                          </Typography>
                        </>
                      }
                    />
                  </li>
                );
              })}
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
