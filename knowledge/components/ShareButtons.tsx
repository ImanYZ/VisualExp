// import { useRouter } from "next/router";
import CloseIcon from "@mui/icons-material/Close";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import LinkIcon from "@mui/icons-material/Link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Box, IconButton, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";

export const ShareButtons = () => {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const URL = window.location.href;
    console.log("URL", URL);
    setUrl(URL);
  }, []);

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const messageTwitter = () => {
    return `1Cademy - Collaboratively Designing Learning Pathways 
        ${encodeURIComponent(url)}`;
  };

  const onShareByLink = () => {
    navigator.clipboard.writeText(url);
    console.log(URL);
    setOpen(true);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <IconButton href={`https://twitter.com/intent/tweet?text=${messageTwitter()}`} target="_blank" rel="noopener">
        <TwitterIcon />
      </IconButton>
      {/* this works with different urls from localhost */}
      <IconButton href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noopener">
        <FacebookRoundedIcon />
      </IconButton>
      {/* this works with different urls from localhost */}
      <IconButton href={`https://www.linkedin.com/shareArticle?mini=true&url=${url}`} target="_blank" rel="noopener">
        <LinkedInIcon />
      </IconButton>
      <IconButton onClick={onShareByLink}>
        <LinkIcon />
      </IconButton>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Link copied to clipboard!"
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};
