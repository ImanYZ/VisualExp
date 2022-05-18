import React from "react";

import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

const LeaderboardChip = ({ name, idx, objType, imageUrl, reputation }) => {
  return (
    <li>
      <Chip
        sx={{
          height: "49px",
          margin: "4px",
          borderRadius: "28px",
        }}
        icon={
          objType === "Institutions" ? (
            <img
              src={imageUrl}
              alt={name}
              width="40px"
              style={{
                margin: "4px 4px 4px 10px",
              }}
            />
          ) : (
            <Avatar
              src={imageUrl}
              alt={name}
              sx={{
                width: "40px",
                height: "40px",
                mr: 2.5,
              }}
            />
          )
        }
        variant="outlined"
        label={
          <>
            <Typography variant="body2" component="div">
              {name}
            </Typography>
            <Typography variant="body2" component="div">
              {idx === 0 ? "🏆" : "✔️"}
              {" " + Math.round((reputation + Number.EPSILON) * 100) / 100}
            </Typography>
          </>
        }
      />
    </li>
  );
};

export default LeaderboardChip;
