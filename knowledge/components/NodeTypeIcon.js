import React from "react";

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
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const NodeTypeIcon = ({ nodeType }) => {
  return nodeType === "Code" ? (
    <CodeIcon />
  ) : nodeType === "Concept" ? (
    <LocalLibraryIcon />
  ) : nodeType === "Relation" ? (
    <ShareIcon />
  ) : nodeType === "Question" ? (
    <HelpOutlineIcon />
  ) : nodeType === "Profile" ? (
    <PersonIcon />
  ) : nodeType === "Sequel" ? (
    <MoreHorizIcon />
  ) : nodeType === "Advertisement" ? (
    <EventIcon />
  ) : nodeType === "Reference" ? (
    <MenuBookIcon />
  ) : nodeType === "Idea" ? (
    <EmojiObjectsIcon />
  ) : nodeType === "News" ? (
    <ArticleIcon />
  ) : nodeType === "Private" ? (
    <LockIcon />
  ) : nodeType === "Tag" ? (
    <LocalOfferIcon />
  ) : (
    <LockIcon />
  );
};

export default NodeTypeIcon;
