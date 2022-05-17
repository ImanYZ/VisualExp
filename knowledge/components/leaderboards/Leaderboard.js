import React from "react";

import Box from "@mui/material/Box";

import LeaderboardChip from "./LeaderboardChip";

const Leaderboard = ({ data, objType }) => {
  return (
    <>
      <Box component="h4">{objType}</Box>
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
                key={obj.name + idx}
                idx={idx}
                objType={objType}
                name={name}
                imageUrl={imageUrl}
                reputation={obj.reputation}
              />
            );
          })}
      </Box>
    </>
  );
};

export default Leaderboard;
