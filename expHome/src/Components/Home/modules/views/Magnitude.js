import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { useEffect, useMemo, useState } from "react";
import { gray200, orangeDark } from "../../../../utils/colors";

const MAGNITUDE_ITEMS = [
  {
    id: "users",
    value: "1,529",
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
    value: "44,665",
    title: "Nodes",
    description: "Are generated through this large-scale collaboration."
  },
  {
    id: "links",
    value: "235,674",
    title: "Prerequisite links",
    description: "Are connected between nodes."
  }
];

const Magnitude = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    (async () => {
      // const response = await fetch("https://1cademy.com//api/stats");
      // const data = await response.json();

      setStats([]);
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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(200px,max-content))",
        alignItems:"start",
        color: gray200,
        gap:"96px",
        mb: "64px"
      }}
    >
      {MAGNITUDE_ITEMS_Memo.map(cur => (
        <Box key={cur.id} sx={{ textAlign: "center", maxWidth: "264px", flex: 1 }}>
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
  );
};

export default Magnitude;
