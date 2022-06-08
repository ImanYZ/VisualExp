import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";
import Image from "next/image";

import { StatsSchema } from "../src/knowledgeTypes";
import SearchInput from "./SearchInput";

type HomeSearchProps = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
  stats: StatsSchema;
};

export const HomeSearch = ({ sx, onSearch, stats }: HomeSearchProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: "236px", md: "479px" },
        margin: "auto",
        padding: 6,
        flexDirection: "column",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        top: 0,
        left: 0,
        color: theme => theme.palette.common.white,
        ...sx
      }}
    >
      <Image
        style={{ filter: "brightness(.6)" }}
        alt="1cademy library"
        src="/LibraryBackground.jpg"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />
      <Box sx={{ position: "absolute", maxWidth: "100vw", width: "60%" }}>
        {/* <Typography
          textAlign="center"
          variant="h3"
          component="h1"
          fontWeight="500"
          sx={{ mt: 0, marginBottom: { xs: 1, md: 2 }, fontSize: { xs: "23px", md: "50px" } }}
        >
          What do you want to learn today?
        </Typography> */}
        <Box
          sx={{
            width: "100%",
            mt: { xs: 1, md: 5 },
            display: "flex",
            flexDirection: "row"
          }}
        >
          <SearchInput onSearch={onSearch}></SearchInput>
        </Box>
        <Typography
          textAlign="center"
          variant="h5"
          component="h2"
          fontWeight="400"
          sx={{ marginBottom: { xs: 0, md: 0 }, mt: 5.5, fontSize: { xs: "13px", md: "25px" } }}
        >
          We Visualize Learning Pathways from Books &amp; Research Papers.
        </Typography>
        <Typography
          textAlign="center"
          variant="h5"
          component="h2"
          fontWeight="400"
          sx={{ mt: 4, mb: 10, fontSize: { xs: "10px", md: "16px" } }}
        >
          {stats.users} students and researchers from {stats.institutions} have contributed {stats.nodes} nodes and{" "}
          {stats.links} links through {stats.proposals} proposals.
        </Typography>
        <Box sx={{ mt: 0, textAlign: "center" }}>
          <img src="/DarkModeLogo.svg" alt="1Cademy Logo" width="130px" height="130px" />
          <Box
            sx={{
              borderBottom: "2.5px solid #ff8a33",
              width: "70px",
              height: "19px",
              ml: "auto",
              mr: "auto",
              mb: "19px",
              textAlign: "center"
            }}
          ></Box>
        </Box>
      </Box>
    </Box>
  );
};
