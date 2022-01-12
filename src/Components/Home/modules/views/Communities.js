import React, { useState, useEffect } from "react";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LinkIcon from "@mui/icons-material/Link";
import EmailIcon from "@mui/icons-material/Email";

import Typography from "../components/Typography";
import Button from "../components/Button";
import YoutubeEmbed from "../components/YoutubeEmbed/YoutubeEmbed";
import JoinUs from "./JoinUs";

import communities from "./communitiesOrder";

import sectionsOrder from "./sectionsOrder";
const sectionIdx = sectionsOrder.findIndex(
  (sect) => sect.id === "CommunitiesSection"
);

const ImageBackdrop = styled("div")(({ theme }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  background: "#000",
  opacity: 0.5,
  transition: theme.transitions.create("opacity"),
}));

const ImageIconButton = styled(ButtonBase)(({ theme }) => ({
  position: "relative",
  display: "block",
  padding: 0,
  borderRadius: 0,
  height: "40vh",
  [theme.breakpoints.down("md")]: {
    width: "100% !important",
    height: 100,
  },
  "&:hover": {
    zIndex: 1,
  },
  "&:hover .imageBackdrop": {
    opacity: 0.15,
  },
  "&:hover .imageMarked": {
    opacity: 0,
  },
  "&:hover .imageTitle": {
    border: "4px solid currentColor",
  },
  "& .imageTitle": {
    position: "relative",
    padding: `${theme.spacing(2)} ${theme.spacing(4)} 14px`,
  },
  "& .imageMarked": {
    height: 3,
    width: 18,
    background: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  },
}));

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

const Communities = (props) => {
  const [open, setOpen] = useState(false);
  const [community, setCommunity] = useState({});

  const handleOpen = (idx) => (event) => {
    setCommunity(communities[idx]);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <Container
      id="CommunitiesSection"
      component="section"
      sx={{ pt: 10, pb: 4 }}
    >
      <Typography variant="h4" marked="center" align="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography>
      <Box sx={{ mt: 7, display: "flex", flexWrap: "wrap" }}>
        {communities.map((communi, idx) => (
          <ImageIconButton
            key={communi.title}
            onClick={handleOpen(idx)}
            style={{
              width: communi.width,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundSize: "cover",
                backgroundPosition: "center 40%",
                backgroundImage: `url(${communi.url})`,
              }}
            />
            <ImageBackdrop className="imageBackdrop" />
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              <Typography
                component="h3"
                variant="h6"
                color="inherit"
                className="imageTitle"
              >
                {communi.title}
                <div className="imageMarked" />
              </Typography>
            </Box>
          </ImageIconButton>
        ))}
      </Box>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="CommunityTitle"
        aria-describedby="CommunityDescription"
      >
        <BootstrapDialogTitle id="CommunityTitle" onClose={handleClose}>
          {community.title + " Community"}
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Paper sx={{ padding: "10px", mb: "19px" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                pt: "19px",
                pb: "19px",
              }}
            >
              Community Introduction
            </Typography>
            <YoutubeEmbed embedId={community.YouTube} />
          </Paper>
          <Paper sx={{ padding: "10px", mb: "19px" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                pt: "19px",
                pb: "19px",
              }}
            >
              Community Description
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "left" }}
            >
              {community.description}
            </Typography>
          </Paper>
          <Paper sx={{ padding: "10px", mb: "19px" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                pt: "19px",
                pb: "19px",
              }}
            >
              Community Accomplishments
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "left" }}
            >
              {community.accomplishments}
            </Typography>
          </Paper>
          <Paper sx={{ padding: "10px", mb: "19px" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                pt: "19px",
                pb: "19px",
              }}
            >
              By Joining Us, You Will ...
            </Typography>
          </Paper>
          <Paper sx={{ padding: "10px", mb: "19px" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                pt: "19px",
                pb: "19px",
              }}
            >
              Community Requirements
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "left" }}
            >
              {community.requirements}
            </Typography>
          </Paper>
          <Paper sx={{ padding: "10px", mb: "19px" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                pt: "19px",
                pb: "19px",
              }}
            >
              Community Leaders
            </Typography>
            <Grid
              container
              spacing={2.5}
              align="center"
              justify="center"
              alignItems="center"
            >
              {community.leaders &&
                community.leaders.map((leader, idx) => {
                  return (
                    <Grid key={leader.name} xs={12}>
                      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar
                              src={"/static/CommunityLeaders/" + leader.image}
                              alt={leader.name}
                              sx={{ width: 100, height: 100, mr: 2.5 }}
                            />
                            {leader.websites.map((wSite) => {
                              return (
                                <IconButton
                                  component="a"
                                  href={wSite.url}
                                  aria-label={wSite.name}
                                >
                                  {wSite.name === "LinkedIn" ? (
                                    <LinkedInIcon />
                                  ) : (
                                    <LinkIcon />
                                  )}
                                </IconButton>
                              );
                            })}
                            <IconButton
                              component="a"
                              href={
                                "mailto:onecademy@umich.edu?subject=" +
                                community.title +
                                " Question for " +
                                leader.name
                              }
                              aria-label="email"
                            >
                              <EmailIcon />
                            </IconButton>
                          </ListItemAvatar>
                          <ListItemText
                            primary={leader.name}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  sx={{ display: "inline" }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {leader.about}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </List>
                    </Grid>
                  );
                })}
            </Grid>
          </Paper>
          <Paper sx={{ padding: "10px", mb: "19px" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                pt: "19px",
              }}
            >
              Apply to Join this Community
            </Typography>
            <JoinUs community={community} />
          </Paper>
        </DialogContent>
      </BootstrapDialog>
    </Container>
  );
};

export default Communities;
