import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";

import LinkIcon from "@mui/icons-material/Link";

import TypographyUnderlined from "../TypographyUnderlined";
import MarkdownRender from "../Markdown/MarkdownRender";
import NodeTypeIcon from "../NodeTypeIcon";

import { isValidHttpUrl } from "../../lib/utils";

const LinkedNode = ({ header, data }) => {
  return (
    <Paper sx={{ pt: "19px", mb: "25px", backgroundColor: "#28282a" }}>
      <Box sx={{ textAlign: "center", pb: "10px" }}>
        <TypographyUnderlined
          variant="h5"
          gutterBottom
          marked="center"
          align="center"
        >
          {header}
        </TypographyUnderlined>
      </Box>

      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {data.map((obj) => {
          return (
            <React.Fragment key={obj.node}>
              <Divider />
              <Tooltip
                title={
                  <Box>
                    <Box
                      sx={{ margin: "-10px 19px 7px 19px", fontSize: "25px" }}
                    >
                      <MarkdownRender children={obj.title} />
                    </Box>
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
                <ListItemButton
                  alignItems="flex-start"
                  component="a"
                  href={`../${obj.node}/${encodeURIComponent(obj.title)}`}
                  sx={{ position: "relative" }}
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
              </Tooltip>
              {isValidHttpUrl(obj.label) && (
                <Box sx={{ ml: 1.9 }}>
                  <Link
                    href={obj.label}
                    target="_blank"
                    sx={{
                      display: "flex",
                      direction: "row",
                      justifyContent: "center",
                    }}
                  >
                    <LinkIcon sx={{ mr: 1 }} />
                    Open the URL in new tab
                  </Link>
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default LinkedNode;
