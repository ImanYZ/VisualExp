import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { useEffect, useMemo, useState } from "react";
import { gray200, orangeDark } from "../../Communities";


const MAGNITUDE_ITEMS = [
  {
    id: "users",
    value: "1 529",
    title: "Students and Researchers",
    description: "Over the past two years joined 1Cademy."
  },
  {
    id: "institutions",
    value: "183",
    title: "Institutions",
    description: "Have participated in a large-scale collaboration effort through 1Cademy"
  },
  {
    id: "nodes",
    value: "44 665",
    title: "Nodes",
    description: "Are generated through this large-scale collaboration."
  },
  {
    id: "links",
    value: "235 674",
    title: "Prerequisite links",
    description: "Are connected between nodes."
  }
];

const Magnitude = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {

    (async () => {
      const response = await fetch("https://1cademy.com//api/stats");
      const data = await response.json();

      setStats(data);
    })();

  }, []);







  
  const MAGNITUDE_ITEMS_Memo = useMemo(() => {
    if (!stats) return MAGNITUDE_ITEMS;
    
    const x = MAGNITUDE_ITEMS.reduce((acc, item) => {
      item.value = stats[item.id] ?? item.value;
      return [...acc, item];
    }, []);
    return x;
  }, [stats]);

  return (
    <Stack direction={{ sx: "column-reverse", md: "row" }} alignItems={"center"} spacing={"96px"}>
      <Box
        sx={{
          maxWidth: { md: "560px" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          rowGap: "88px",
          columnGap: "32px",
          color:gray200,
        }}
      >
        {MAGNITUDE_ITEMS_Memo.map(cur => (
          <Box key={cur.id} sx={{ textAlign: "center", maxWidth: "264px" }}>
            <Typography sx={{ fontSize: { xs: "48px", md: "60px" }, mb: "12px", color: orangeDark, fontWeight: 600 }}>
              {cur.value}
            </Typography>
            <Typography component={"h3"} sx={{ fontSize: "18px", fontWeight: 600 }}>
              {cur.title}
            </Typography>
            <Typography>{cur.description}</Typography>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          width: { xs: `calc(100% - 100px)`, sm: "560px", dm: "400px", lg: "560px" },
          height: { xs: `calc(100% - 100px)`, sm: "560px", dm: "400px", lg: "560px" }
        }}
      >
        <img src="1Cademy.png" alt="1cademy logo" width="100%" height="100%" />
      </Box>
    </Stack>
  );
};

export default Magnitude;
