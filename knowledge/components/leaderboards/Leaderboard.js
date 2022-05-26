import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

import LeaderboardChip from "./LeaderboardChip";

const Leaderboard = ({ data, objType, header }) => {
  return (
    <Box>
      <Typography variant="h7" sx={{ mt: 2.5, mb: 2.5 }}>
        {header}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "left",
          flexWrap: "wrap",
          listStyle: "none",
          p: 0.5,
          m: 0,
        }}
        component="ul"
      >
        {data &&
          data.map((obj, idx) => {
            const name =
              objType === "Institutions"
                ? obj.name
                : obj.chooseUname
                ? obj.username
                : obj.fullname;
            const imageUrl =
              objType === "Institutions" ? obj.logoURL : obj.imageUrl;
            return (
              <LeaderboardChip
                key={obj.name + idx.toString()}
                idx={idx}
                objType={objType}
                name={name}
                imageUrl={imageUrl}
                reputation={obj.reputation}
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default Leaderboard;
