import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

import MarkdownRender from "../Markdown/MarkdownRender";

const LinkedNode = ({ header, data }) => {
  return (
    <Paper sx={{ pt: "25px" }}>
      <Typography
        variant="h5"
        gutterBottom
        marked="center"
        align="center"
        sx={{ fontSize: "25px" }}
      >
        {header}
      </Typography>
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
                  primary={<MarkdownRender children={obj.title} />}
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
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default LinkedNode;
