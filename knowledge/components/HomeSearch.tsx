import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";
import Image from "next/image";
import { forwardRef } from "react";
import { useQuery } from "react-query";

import { getStats } from "../lib/knowledgeApi";
import SearchInput from "./SearchInput";

type HomeSearchProps = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
};

export type Ref = {
  viewState: HTMLElement;
};

const HomeSearch = forwardRef<any, HomeSearchProps>(({ sx, onSearch }, ref) => {
  const { data: stats } = useQuery("stats", getStats);

  return (
    <Box
      ref={ref}
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
      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti aperiam, maiores quaerat eligendi accusamus
        maxime similique, optio officiis rem nihil temporibus magnam dolorem placeat qui, soluta nobis at blanditiis
        voluptatum.
      </div>
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
        {stats && (
          <Typography textAlign="center" sx={{ mt: 4, mb: 10, fontSize: 16 }}>
            Search {stats.nodes} nodes and {stats.links} links through {stats.proposals} proposals
            <br />
            from {stats.users} users in {stats.institutions} institutions
          </Typography>
        )}
      </Box>
      <Box id="nodes-begin" sx={{ position: "absolute", bottom: "70px" }}></Box>
    </Box>
  );
});

HomeSearch.displayName = "HomeSearch";
export default HomeSearch;
