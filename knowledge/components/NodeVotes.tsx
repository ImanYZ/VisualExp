import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { FC } from "react";

type Props = {
  corrects?: number;
  wrongs?: number;
};

const NodeVotes: FC<Props> = ({ corrects = 0, wrongs = 0 }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <Tooltip title={`${corrects} upvotes`}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            mr: 2,
          }}
        >
          <ThumbUpIcon fontSize="small" color="disabled" />
          <Typography
            sx={{ ml: 1, color: (theme) => theme.palette.text.disabled }}
            color="disabled"
          >
            {corrects}
          </Typography>
        </Box>
      </Tooltip>
      <Tooltip title={`${wrongs} downvotes`}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ThumbDownIcon fontSize="small" color="disabled" />
          <Typography
            sx={{ ml: 1, color: (theme) => theme.palette.text.disabled }}
            color="disabled"
          >
            {wrongs}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default NodeVotes;
