import { Avatar } from "@mui/material";
import { Box } from "@mui/system";
import React, { FC } from "react";

type Props = {
  name?: string;
  imageUrl?: string;
  renderAsAvatar?: boolean;
  contained?: boolean;
};

const OptimizedAvatar: FC<Props> = ({ name = "", imageUrl, renderAsAvatar = true, contained = false }) => {
  // render an Avatar with the firth Letter
  if (!imageUrl) {
    return (
      <Avatar
        sx={{
          width: "50px",
          height: "50px"
        }}
      >
        {name.charAt(0)}
      </Avatar>
    );
  }

  // render an Avatar with image contained
  if (renderAsAvatar && contained) {
    return (
      <Box
        sx={{
          width: "50px",
          height: "50px",
          // border: "solid 2px",
          borderColor: theme => theme.palette.common.gray,
          borderRadius: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme => theme.palette.common.white
        }}
      >
        <Avatar
          sx={{
            width: "34px",
            height: "34px",
            borderRadius: "30px"
          }}
          src={imageUrl}
          alt={name}
        />
      </Box>
    );
  }

  // render an Avatar with Image cover
  if (renderAsAvatar && !contained) {
    return (
      <Box
        sx={{
          width: "50px",
          height: "50px",
          position: "relative",
          // border: "solid 2px",
          borderColor: theme => theme.palette.common.gray,
          borderRadius: "30px"
        }}
      >
        <Avatar
          sx={{
            width: "50px",
            height: "50px",
            borderRadius: "30px"
          }}
          src={imageUrl}
          alt={name}
        />
      </Box>
    );
  }

  // render an image without border
  return (
    <Box sx={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Avatar
        sx={{
          width: "34px",
          height: "34px"
        }}
        src={imageUrl}
        alt={name}
      />
    </Box>
  );
};

export default OptimizedAvatar;
