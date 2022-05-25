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

const NodeTypeIcon: FC<Props> = ({ nodeType, color = "primary", ...rest }) => {
  const renderIcon = () => {
    switch (nodeType) {
      case "Code":
        return <CodeIcon color={color} {...rest} />;
      case "Concept":
        return <LocalLibraryIcon color={color} {...rest} />;
      case "Relation":
        return <ShareIcon color={color} {...rest} />;
      case "Question":
        return <HelpOutlineIcon color={color} {...rest} />;
      case "Profile":
        return <PersonIcon color={color} {...rest} />;
      case "Sequel":
        return <MoreHorizIcon color={color} {...rest} />;
      case "Advertisement":
        return <EventIcon color={color} {...rest} />;
      case "Reference":
        return <MenuBookIcon color={color} {...rest} />;
      case "Idea":
        return <EmojiObjectsIcon color={color} {...rest} />;
      case "News":
        return <ArticleIcon color={color} {...rest} />;
      case "Private":
        return <LockIcon color={color} {...rest} />;
      case "Tag":
        return <LocalOfferIcon color={color} {...rest} />;
      default:
        return <LockIcon color={color} {...rest} />;
    }
  };
  return <Tooltip title={`${nodeType} node`}>{renderIcon()}</Tooltip>;
};

export default NodeTypeIcon;
