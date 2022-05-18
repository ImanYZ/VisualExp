import React, { useEffect, useState } from "react";

// Add this import
import Head from "next/head";
import Image from "next/image";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import PagesNavbar from "../../../components/PagesNavbar";
import Leaderboard from "../../../components/leaderboards/Leaderboard";
import LinkedNode from "../../../components/linkedNodes/LinkedNode";
import NodeTypeIcon from "../../../components/NodeTypeIcon";
import FullScreenImage from "../../../components/FullScreenImage";

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
  const [imageFullScreen, setImageFullScreen] = useState(false);

  const handleClickImageFullScreen = () => {
    setImageFullScreen(true);
  };

  return (
    <PagesNavbar thisPage="Node">
      <Head>
        <title>{props.title}</title>
      </Head>
      <Grid container spacing={3.1}>
        <Grid item xs={12} sm={12} md={3}>
          <LinkedNode header="Learn Before" data={props.parents} />
          <LinkedNode header="References" data={props.references} />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Card sx={{ minWidth: "340px" }}>
            <CardContent>
              <Box sx={{ margin: "-10px 19px 7px 19px", fontSize: "31px" }}>
                <MarkdownRender children={props.title} />
              </Box>
              <Box sx={{ fontSize: "19px", mb: 3.4 }}>
                <MarkdownRender children={props.content} />
              </Box>
              {props.nodeImage && (
                <Tooltip title="Click to view image in full-screen!">
                  <Box
                    onClick={handleClickImageFullScreen}
                    sx={{
                      display: "block",
                      width: "100%",
                      mb: 3.4,
                      cursor: "pointer",
                    }}
                  >
                    <img src={props.nodeImage} width="100%" height="100%" />
                  </Box>
                </Tooltip>
              )}
              <Box
                sx={{ display: "inline-block", color: "#ff9100", mb: "19px" }}
              >
                <NodeTypeIcon nodeType={props.nodeType} />
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
              <Leaderboard
                data={props.contributors}
                header="Contributors are:"
                objType="Contributors"
              />
              <Leaderboard
                data={props.institutions}
                objType="Institutions"
                header="Who are from:"
              />
            </CardContent>
          </Card>
          {/* <div className={utilStyles.lightText}>{props.date}</div> */}
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <LinkedNode header="Learn After" data={props.children} />
          <LinkedNode header="Tags" data={props.tags} />
        </Grid>
      </Grid>
      {props.nodeImage && (
        <FullScreenImage
          src={props.nodeImage}
          open={imageFullScreen}
          setOpen={setImageFullScreen}
        />
      )}
    </PagesNavbar>
  );
};

export default Node;
