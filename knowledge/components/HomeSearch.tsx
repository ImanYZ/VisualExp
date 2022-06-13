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
      <Box sx={{ position: "absolute", maxWidth: "100vw", width: { md: "60%", xs: "85%" } }}>
        {/* <Typography
          textAlign="center"
          variant="h3"
          component="h1"
          fontWeight="500"
          sx={{ mt: 0, marginBottom: { xs: 1, md: 2 }, fontSize: { xs: "23px", md: "50px" } }}
        >
          What do you want to learn now?
        </Typography> */}
        <Box
          sx={{
            textAlign: "center",
            display: {
              md: "block",
              xs: "none"
            }
          }}
        >
          <img src="/LogoExtended.svg" alt="1Cademy Logo" width="421px" height="130px" />
        </Box>
        <Box
          sx={{
            width: "100%",
            mt: { xs: 15, md: 5 },
            display: "flex",
            flexDirection: "row"
          }}
        >
          <SearchInput onSearch={onSearch}></SearchInput>
        </Box>
        <Typography textAlign="center" sx={{ mt: 4, mb: 10, fontSize: 16 }}>
          Search {stats.nodes} nodes and {stats.links} links through {stats.proposals} proposals
          <br />
          from {stats.users} users in {stats.institutions} institutions
        </Typography>
      </Box>
      <Box id="nodes-begin" sx={{ position: "absolute", bottom: "70px" }}></Box>
    </Box>
  );
};
