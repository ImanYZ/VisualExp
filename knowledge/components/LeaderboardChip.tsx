import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import React, { FC } from "react";

type Props = {
  name?: string;
  imageUrl?: string;
  reputation: number;
  isChamp: boolean;
  renderAsAvatar?: boolean;
};

const LeaderboardChip: FC<Props> = ({ name = "", imageUrl, reputation, isChamp, renderAsAvatar = true }) => {
  const renderIcon = () => {
    if (renderAsAvatar) {
      return (
        <Avatar
          src={imageUrl}
          alt={name}
          sx={{
            width: 40,
            height: 40
          }}
        />
      );
    } else {
      return (
        <img
          src={imageUrl}
          alt={name}
          width="40px"
          style={{
            margin: "4px 4px 4px 10px"
          }}
        />
      );
    }
  };
  return (
    <Chip
      sx={{
        height: 49,
        borderRadius: 28
      }}
      icon={
        imageUrl ? (
          renderIcon()
        ) : (
          <Avatar
            sx={{
              width: 40,
              height: 40
            }}
          >
            name.charAt(0)
          </Avatar>
        )
      }
      variant="outlined"
      label={
        <Box sx={{ my: 1 }}>
          <Typography variant="body2" component="div">
            {name}
          </Typography>
          <Typography variant="body2" component="div">
            {isChamp ? "🏆" : "✔️"}
            {" " + Math.round((reputation + Number.EPSILON) * 100) / 100}
          </Typography>
        </Box>
      }
    />
  );
};

export default LeaderboardChip;
