import React, { useEffect, useState } from "react";

// Add this import
import Head from "next/head";
import Script from "next/script";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "../../components/Markdown/MarkdownRender";
import PagesNavbar from "../../components/PagesNavbar";
import Leaderboard from "../../components/leaderboards/Leaderboard";
import LinkedNode from "../../components/linkedNodes/LinkedNode";
import NodeTypeIcon from "../../components/NodeTypeIcon";
import FullScreenImage from "../../components/FullScreenImage";

import { getNodeData, logViews } from "../../lib/nodes";
import { escapeBreaksQuotes, encodeTitle } from "../../lib/utils";

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
  nodeData.keywords = "";
  for (let tag of nodeData.tags) {
    nodeData.keywords += escapeBreaksQuotes(tag.title) + ", ";
  }
  nodeData.changedAt = new Date(nodeData.changedAt);
  const updatedStr =
    nodeData.changedAt.getFullYear() +
    "-" +
    ("0" + (nodeData.changedAt.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + nodeData.changedAt).slice(-2);
  nodeData.createdAt = new Date(nodeData.createdAt);
  const createdStr =
    nodeData.createdAt.getFullYear() +
    "-" +
    ("0" + (nodeData.createdAt.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + nodeData.createdAt).slice(-2);
  delete nodeData.createdAt;

  return {
    props: {
      ...nodeData,
      nodeId: params.id,
      updatedStr,
      createdStr,
      changedAt: nodeData.changedAt.toUTCString(),
    },
  };
};

dayjs.extend(relativeTime);

const Node = ({
  nodeId,
  title,
  keywords,
  parents,
  references,
  content,
  nodeImage,
  nodeType,
  corrects,
  wrongs,
  contributors,
  institutions,
  children,
  tags,
  updatedAt,
  changedAt,
  updatedStr,
  createdStr,
}) => {
  const [imageFullScreen, setImageFullScreen] = useState(false);

  const handleClickImageFullScreen = () => {
    setImageFullScreen(true);
  };

  const jsonObj = {
    "@context": "https://schema.org/",
    "@type": "MediaObject",
    name: "1Cademy - " + escapeBreaksQuotes(title),
    description: escapeBreaksQuotes(
      content +
        " Keywords: " +
        title +
        " " +
        keywords +
        (nodeImage ? " \nImage: " + nodeImage : "")
    ),
    "@id": nodeId,
    url:
      "https://1cademy.us/knowledge/node/" + encodeTitle(title) + "/" + nodeId,
    nodeType: nodeType,
    author: {
      "@type": "Organization",
      name: "1Cademy",
    },
    datePublished: createdStr,
    dateModified: updatedStr,
    publisher: {
      "@type": "Organization",
      name: "1Cademy",
      sameAs: "https://1cademy.us",
      logo: {
        "@type": "ImageObject",
        url: "https://1cademy.us/static/media/Logo_Orange.5a15b5e4.svg",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "" + (corrects - wrongs),
      bestRating: "" + (corrects + wrongs),
      worstRating: "" + -(corrects + wrongs),
      ratingCount: "" + (corrects + wrongs),
    },
  };
  if (nodeImage) {
    jsonObj["image"] = nodeImage;
  }
  jsonObj["prerequisites"] = [];
  for (let parent of parents) {
    jsonObj["prerequisites"].push({
      "@type": "parent",
      link:
        "https://1cademy.us/knowledge/node/" +
        encodeTitle(parent.title) +
        "/" +
        parent.node,
      title: "1Cademy - " + escapeBreaksQuotes(parent.title),
    });
  }
  jsonObj["followUps"] = [];
  for (let child of children) {
    jsonObj["followUps"].push({
      "@type": "child",
      link:
        "https://1cademy.us/knowledge/node/" +
        encodeTitle(child.title) +
        "/" +
        child.node,
      title: "1Cademy - " + escapeBreaksQuotes(child.title),
    });
  }
  jsonObj["tags"] = [];
  for (let tag of tags) {
    jsonObj["tags"].push({
      "@type": "tag",
      link:
        "https://1cademy.us/knowledge/node/" +
        encodeTitle(tag.title) +
        "/" +
        tag.node,
      title: "1Cademy - " + escapeBreaksQuotes(tag.title),
    });
  }
  jsonObj["references"] = [];
  for (let reference of references) {
    jsonObj["references"].push({
      "@type": "reference",
      link:
        "https://1cademy.us/knowledge/node/" +
        encodeTitle(reference.title) +
        "/" +
        reference.node,
      title: "1Cademy - " + escapeBreaksQuotes(reference.title),
      label: reference.label,
    });
  }

  const summary = escapeBreaksQuotes(
    content +
      " Keywords: " +
      title +
      " " +
      keywords +
      (nodeImage ? " \nImage: " + nodeImage : "")
  );
  return (
    <PagesNavbar thisPage="Node">
      <Head>
        <title>1Cademy - {title}</title>
        <link
          rel="canonical"
          href={
            "https://1cademy.us/knowledge/node/" +
            encodeTitle(title) +
            "/" +
            nodeId
          }
          key="canonical"
        />
        <meta name="topic" content={`1Cademy - ${escapeBreaksQuotes(title)}`} />
        <meta
          name="subject"
          content={`1Cademy - ${escapeBreaksQuotes(title)}`}
        />
        <meta name="Classification" content={nodeType} />
        <meta name="keywords" content={keywords} />
        <meta name="date" content={updatedStr} />
        <meta name="revised" content={changedAt} />
        <meta name="summary" content={summary} />
        <meta name="description" content={summary} />
        <meta name="abstract" content={content} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonObj),
          }}
        />
      </Head>
      <Grid container spacing={3.1}>
        <Grid item xs={12} sm={12} md={3}>
          <LinkedNode header="Learn Before" data={parents} />
          <LinkedNode header="References" data={references} />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Card sx={{ minWidth: "340px" }}>
            <CardContent>
              <Box sx={{ margin: "-10px 19px 7px 19px", fontSize: "31px" }}>
                <MarkdownRender children={title} />
              </Box>
              <Box sx={{ fontSize: "19px", mb: 1.9 }}>
                <MarkdownRender children={content} />
              </Box>
              {nodeImage && (
                <Tooltip title="Click to view image in full-screen!">
                  <Box
                    onClick={handleClickImageFullScreen}
                    sx={{
                      display: "block",
                      width: "100%",
                      mb: 1.9,
                      cursor: "pointer",
                    }}
                  >
                    <img src={nodeImage} width="100%" height="100%" />
                  </Box>
                </Tooltip>
              )}
              <Divider />
              <Box
                sx={{
                  display: "inline-block",
                  color: "#ff9100",
                  mt: 1.9,
                  mb: 1.9,
                }}
              >
                <Tooltip title={`This node is of type ${nodeType}.`}>
                  <Box sx={{ display: "inline" }}>
                    <NodeTypeIcon nodeType={nodeType} />
                  </Box>
                  {/* <Typography
                  sx={{
                    fontSize: 13,
                    padding: "0px 0px 0px 5.5px",
                    verticalAlign: "5.5px",
                  }}
                  component="span"
                >
                  {nodeType} Type
                </Typography> */}
                </Tooltip>
                <Tooltip
                  title={`Last updated on ${new Date(
                    updatedAt
                  ).toLocaleString()}`}
                >
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
                    {dayjs(new Date(updatedAt)).fromNow()}
                  </Typography>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  display: "inline-block",
                  float: "right",
                  color: "#ff9100",
                  mb: 1.9,
                  mt: 1.9,
                }}
              >
                <Box sx={{ display: "inline-block" }}>
                  <Tooltip
                    title={`${wrongs} user${wrongs === 1 ? "" : "s"} ha${
                      wrongs === 1 ? "s" : "ve"
                    } marked this node as wrong or not helpful!`}
                  >
                    <span style={{ color: "red" }}>
                      <CloseIcon />
                      <Typography
                        sx={{
                          fontSize: 16,
                          padding: "0px 0px 0px 7px",
                          verticalAlign: "5.5px",
                          color: "red",
                        }}
                        component="span"
                        color="text.secondary"
                        gutterBottom
                      >
                        {wrongs}
                      </Typography>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={`${corrects} user${corrects === 1 ? "" : "s"} ha${
                      corrects === 1 ? "s" : "ve"
                    } marked this node as correct and helpful!`}
                  >
                    <span style={{ color: "green", marginLeft: "19px" }}>
                      <CheckIcon />
                      <Typography
                        sx={{
                          fontSize: 16,
                          padding: "0px 0px 0px 7px",
                          verticalAlign: "5.5px",
                          color: "green",
                        }}
                        component="span"
                        color="text.secondary"
                        gutterBottom
                      >
                        {corrects}
                      </Typography>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ mt: 1.9 }}>
                <Leaderboard
                  data={contributors}
                  header="Contributors are:"
                  objType="Contributors"
                />
                <Leaderboard
                  data={institutions}
                  objType="Institutions"
                  header="Who are from:"
                />
              </Box>
            </CardContent>
          </Card>
          {/* <div className={utilStyles.lightText}>{date}</div> */}
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <LinkedNode header="Learn After" data={children} />
          <LinkedNode header="Tags" data={tags} />
        </Grid>
      </Grid>
      {nodeImage && (
        <FullScreenImage
          src={nodeImage}
          open={imageFullScreen}
          setOpen={setImageFullScreen}
        />
      )}
    </PagesNavbar>
  );
};

export default Node;
