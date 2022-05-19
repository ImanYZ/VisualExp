import React, { useState } from "react";

import Image from "next/image";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

import LinkIcon from "@mui/icons-material/Link";

import TypographyUnderlined from "../TypographyUnderlined";
import MarkdownRender from "../Markdown/MarkdownRender";
import NodeTypeIcon from "../NodeTypeIcon";

import { isValidHttpUrl, encodeTitle } from "../../lib/utils";

// import Orange_animated_right_arrow from "../../public/Orange_animated_right_arrow.gif";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgb(0, 0, 0)",
    maxWidth: "340px",
    fontSize: "16px",
    fontWeight: 400,
    border: "1px solid #dadde9",
    padding: "7px 19px 0px 19px",
  },
}));

const LinkedNode = ({ header, data }) => {
  // const [hovering, setHovering] = useState("");

  // const linkHovered = (nodeId) => (event) => {
  //   setHovering(nodeId);
  // };

  // const linkHoverEnded = (event) => {
  //   setHovering("");
  // };

  let headerTooltip = "";
  switch (header) {
    case "Learn Before":
      headerTooltip =
        "These are the prerequisite (parent) nodes that you should learn BEFORE studying this node.";
      break;
    case "Learn After":
      headerTooltip =
        "These are the postrequisite (child) nodes that you should learn AFTER studying this node.";
      break;
    case "References":
      headerTooltip = "These are the references that this node is citing.";
      break;
    case "Tags":
      headerTooltip = "These are the tags assigned to this node.";
      break;
    default:
    // code block
  }
  return (
    <Paper
      sx={{
        pt: "19px",
        mb: "25px",
        backgroundColor: ["References", "Tags"].includes(header)
          ? "#F8F8F8"
          : "#28282a",
      }}
    >
      <Tooltip title={headerTooltip}>
        <Box
          sx={{
            textAlign: "center",
            pb: "10px",
            color: ["References", "Tags"].includes(header) ? "black" : "white",
          }}
        >
          <TypographyUnderlined
            variant="h5"
            gutterBottom
            marked="center"
            align="center"
          >
            {header}
          </TypographyUnderlined>
        </Box>
      </Tooltip>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {data.map((obj) => {
          return (
            <React.Fragment key={obj.node}>
              <Divider />
              <HtmlTooltip
                title={
                  <Box>
                    {/* <Box
                      sx={{ margin: "-10px 19px 7px 19px", fontSize: "25px" }}
                    >
                      <MarkdownRender children={obj.title} />
                    </Box> */}
                    <Box sx={{ fontSize: "13px", mb: 3.4 }}>
                      <MarkdownRender children={obj.content} />
                    </Box>
                    {obj.nodeImage && (
                      <Box
                        sx={{
                          display: "block",
                          width: "100%",
                          mb: 3.4,
                          cursor: "pointer",
                        }}
                      >
                        <img src={obj.nodeImage} width="100%" height="100%" />
                      </Box>
                    )}
                  </Box>
                }
                placement="left"
              >
                <Box>
                  <ListItemButton
                    alignItems="flex-start"
                    component="a"
                    href={`../${encodeTitle(obj.title)}/${obj.node}`}
                    sx={{
                      position: "relative",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    // onMouseOver={linkHovered(obj.node)}
                    // onMouseLeave={linkHoverEnded}
                  >
                    <ListItemText
                      primary={
                        <MarkdownRender
                          children={
                            header === "References"
                              ? !isValidHttpUrl(obj.label)
                                ? obj.title + ": " + obj.label
                                : obj.title
                              : obj.title
                          }
                        />
                      }
                      // secondary={
                      //   <div
                      //     dangerouslySetInnerHTML={{
                      //       __html: obj.contentHTML,
                      //     }}
                      //   />
                      // }
                      disableTypography={true}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 7,
                        color: "#ff9100",
                      }}
                    >
                      <NodeTypeIcon nodeType={obj.nodeType} />
                    </Box>
                  </ListItemButton>
                  {isValidHttpUrl(obj.label) && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 31,
                        right: 7,
                      }}
                    >
                      <Tooltip title="Open the reference specified section in new tab">
                        <Link
                          href={obj.label}
                          target="_blank"
                          sx={{
                            display: "flex",
                            direction: "row",
                            justifyContent: "center",
                          }}
                        >
                          <LinkIcon />
                        </Link>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </HtmlTooltip>
              {/* {hovering === obj.node && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 31,
                    right: 7,
                    color: "#ff9100",
                  }}
                >
                  <Image
                    src={Orange_animated_right_arrow}
                    alt="Animated arrows indicating links."
                    width="25px"
                    height="25px"
                  />
                </Box>
              )} */}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default LinkedNode;
