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
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

import CloseIcon from "@mui/icons-material/Close";

import Typography from "../components/Typography";

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

const style = {
  position: "absolute",
  top: "2.5%",
  left: "2.5%",
  width: "94%",
  height: "94%",
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 25,
  p: 4,
};

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

export default function Communities() {
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
          <Paper sx={{ padding: "10px" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{ pt: "19px", pb: "19px", borderBottom: "1px solid #AAAAAA" }}
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
              {howElements.map((elem, idx) => {
                return (
                  <Grid key={elem + idx} item xs={12} sm={6} md={4} lg={3}>
                    <Card sx={{ ...item, maxWidth: 355 }}>
                      <Box sx={number}>{idx + 1}.</Box>
                      {/* <Box sx={{ width: "100%", height: "190px" }}> */}
                      <Collapse in={stepChecked[idx]} timeout={1000}>
                        <CardMedia
                          component="img"
                          src={"/static/" + elem.id + ".svg"}
                          alt={elem.id}
                          height="100%"
                          width="100%"
                          sx={{ px: "10px" }}
                        />
                      </Collapse>
                      {/* </Box> */}
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {elem.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: "left" }}
                        >
                          {elem.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </DialogContent>
      </BootstrapDialog>
    </Container>
  );
}
