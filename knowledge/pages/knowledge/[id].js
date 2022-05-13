import React, { useEffect, useState } from "react";

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
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

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

import PagesNavbar from "../../components/PagesNavbar";
import { getNodeData, logViews } from "../../lib/nodes";

// This value is considered fresh for ten seconds (s-maxage=10).
// If a request is repeated within the next 10 seconds, the previously
// cached value will still be fresh. If the request is repeated before 59 seconds,
// the cached value will be stale but still render (stale-while-revalidate=59).
//
// In the background, a revalidation request will be made to populate the cache
// with a fresh value. If you refresh the page, you will see the new value.
export const getServerSideProps = async ({ req, res, params }) => {
  logViews(req, params.id);
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "-1");
  res.setHeader("Cache-Control", "no-cache");
  const nodeData = await getNodeData(params.id);
  if (!nodeData) {
    return {
      // returns the default 404 page with a status code of 404
      notFound: true,
    };
  }
  // const nodeRef = db.collection("nodes").doc(params.id);
  // await nodeRef.update({
  //   opened,
  // });
  return {
    props: nodeData,
  };
};

const Node = ({ nodeData, children, parents }) => {
  return (
    <PagesNavbar thisPage="Node">
      <Head>
        <title>{nodeData.title}</title>
      </Head>
      <Grid container spacing={2}>
        <Grid item sm={12} md={3}>
          <Paper sx={{ mt: "40px" }}>
            <Box sx={{ margin: "19px 19px 7px 19px", fontSize: "28px" }}>
              Learn Before
            </Box>
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {parents.map((parent) => {
                return (
                  <React.Fragment key={parent.nodeId}>
                    <Divider />
                    <ListItemButton
                      alignItems="flex-start"
                      component="a"
                      target="_blank"
                      href={parent.nodeId}
                    >
                      <ListItemText
                        primary={parent.title}
                        // secondary={
                        //   <div
                        //     dangerouslySetInnerHTML={{
                        //       __html: parent.contentHTML,
                        //     }}
                        //   />
                        // }
                        disableTypography={true}
                      />
                    </ListItemButton>
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>
        <Grid item sm={12} md={6}>
          <Card sx={{ minWidth: "340px", mt: "40px" }}>
            <CardContent>
              <Box sx={{ margin: "19px 19px 7px 19px", fontSize: "40px" }}>
                {nodeData.title}
              </Box>
              <div
                style={{ fontSize: "19px" }}
                dangerouslySetInnerHTML={{ __html: nodeData.contentHTML }}
              />
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
                                    (contributor.reputation + Number.EPSILON) *
                                      100
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
        </Grid>
        <Grid item sm={12} md={3}>
          <Paper>
            <Box sx={{ margin: "19px 19px 7px 19px", fontSize: "28px" }}>
              Learn After
            </Box>
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {children.map((child) => {
                return (
                  <React.Fragment key={child.nodeId}>
                    <Divider />
                    <ListItemButton
                      alignItems="flex-start"
                      component="a"
                      target="_blank"
                      href={child.nodeId}
                    >
                      <ListItemText
                        primary={child.title}
                        // secondary={
                        //   <div
                        //     dangerouslySetInnerHTML={{
                        //       __html: child.contentHTML,
                        //     }}
                        //   />
                        // }
                        disableTypography={true}
                      />
                    </ListItemButton>
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </PagesNavbar>
  );
};

export default Node;
