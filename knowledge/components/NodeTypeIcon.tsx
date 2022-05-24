import React, { FC } from "react";

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
import { NodeType } from "../src/knowledgeTypes";
import { SvgIconProps } from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";

type Props = {
  nodeType: NodeType;
} & SvgIconProps;

const NodeTypeIcon: FC<Props> = ({ nodeType, ...rest }) => {
  const renderIcon = () => {
    switch (nodeType) {
      case "Code":
        return <CodeIcon {...rest} />;
      case "Concept":
        return <LocalLibraryIcon {...rest} />;
      case "Relation":
        return <ShareIcon {...rest} />;
      case "Question":
        return <HelpOutlineIcon {...rest} />;
      case "Profile":
        return <PersonIcon {...rest} />;
      case "Sequel":
        return <MoreHorizIcon {...rest} />;
      case "Advertisement":
        return <EventIcon {...rest} />;
      case "Reference":
        return <MenuBookIcon {...rest} />;
      case "Idea":
        return <EmojiObjectsIcon {...rest} />;
      case "News":
        return <ArticleIcon {...rest} />;
      case "Private":
        return <LockIcon {...rest} />;
      case "Tag":
        return <LocalOfferIcon {...rest} />;
      default:
        return <LockIcon {...rest} />;
    }
  };
  return <Tooltip title={`${nodeType} node`}>{renderIcon()}</Tooltip>;
};

export default NodeTypeIcon;
