import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Link from "@mui/material/Link";

import LinkIcon from "@mui/icons-material/Link";

import TypographyUnderlined from "../TypographyUnderlined";
import MarkdownRender from "../Markdown/MarkdownRender";

import { isValidHttpUrl } from "../../lib/utils";

const LinkedNode = ({ header, data }) => {
  return (
    <Paper sx={{ pt: "25px", mb: "25px" }}>
      <Box sx={{ textAlign: "center" }}>
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
              <ListItemButton
                alignItems="flex-start"
                component="a"
                href={`../${obj.node}/${encodeURIComponent(obj.title)}`}
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
              </ListItemButton>
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
