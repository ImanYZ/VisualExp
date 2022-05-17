import React, { useEffect, useState } from "react";

// Add this import
import Head from "next/head";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

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

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import PagesNavbar from "../../../components/PagesNavbar";
import Leaderboard from "../../../components/leaderboards/Leaderboard";
import LinkedNode from "../../../components/linkedNodes/LinkedNode";

import { getNodeData, logViews } from "../../../lib/nodes";

// This value is considered fresh for ten seconds (s-maxage=10).
// If a request is repeated within the next 10 seconds, the previously
// cached value will still be fresh. If the request is repeated before 59 seconds,
// the cached value will be stale but still render (stale-while-revalidate=59).
//
// In the background, a revalidation request will be made to populate the cache
// with a fresh value. If you refresh the page, you will see the new value.
export const getServerSideProps = async ({ req, res, params }) => {
  logViews(req, params.id);
  // res.setHeader("Pragma", "no-cache");
  // res.setHeader("Expires", "-1");
  // res.setHeader("Cache-Control", "no-cache");
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

const Node = (props) => {
  console.log({ props });
  return (
    <PagesNavbar thisPage="Node">
      <Head>
        <title>{props.title}</title>
      </Head>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={3}>
          <LinkedNode header="Learn Before" data={props.parents} />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Card sx={{ minWidth: "340px" }}>
            <CardContent>
              <Box sx={{ margin: "-10px 19px 7px 19px", fontSize: "40px" }}>
                <MarkdownRender children={props.title} />
              </Box>
              <MarkdownRender children={props.content} />
              <Box style={{ display: "inline-block", color: "#ff9100" }}>
                {props.nodeType === "Code" ? (
                  <CodeIcon />
                ) : props.nodeType === "Concept" ? (
                  <LocalLibraryIcon />
                ) : props.nodeType === "Relation" ? (
                  <ShareIcon />
                ) : props.nodeType === "Question" ? (
                  <HelpOutlineIcon />
                ) : props.nodeType === "Profile" ? (
                  <PersonIcon />
                ) : props.nodeType === "Sequel" ? (
                  <MoreHorizIcon />
                ) : props.nodeType === "Advertisement" ? (
                  <EventIcon />
                ) : props.nodeType === "Reference" ? (
                  <MenuBookIcon />
                ) : props.nodeType === "Idea" ? (
                  <EmojiObjectsIcon />
                ) : props.nodeType === "News" ? (
                  <ArticleIcon />
                ) : props.nodeType === "Private" ? (
                  <LockIcon />
                ) : (
                  <LockIcon />
                )}
                <Typography
                  sx={{
                    fontSize: 13,
                    padding: "0px 0px 0px 5.5px",
                    verticalAlign: "5.5px",
                  }}
                  component="span"
                >
                  {props.nodeType} Type
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    padding: "0px 0px 0px 25px",
                    verticalAlign: "5.5px",
                  }}
                  component="span"
                  color="text.secondary"
                  gutterBottom
                >
                  Last updated: {new Date(props.date).toLocaleString()}
                </Typography>
              </Box>
              <Leaderboard data={props.contributors} objType="Contributors" />
              <Leaderboard data={props.institutions} objType="Institutions" />
            </CardContent>
          </Card>
          {/* <div className={utilStyles.lightText}>{props.date}</div> */}
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <LinkedNode header="Learn After" data={props.children} />
        </Grid>
      </Grid>
    </PagesNavbar>
  );
};

export default Node;
