import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";
import Image from "next/image";
import { forwardRef, MutableRefObject, useImperativeHandle, useRef } from "react";
import { useQuery } from "react-query";

import { getStats } from "../lib/knowledgeApi";
import { loadHomeSearchBackground, toBase64 } from "../lib/utils";
import SearchInput from "./SearchInput";

type HomeSearchProps = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
};

export type HomeSearchRef = {
  scroll: () => void;
  containerRef: MutableRefObject<HTMLDivElement | null>;
};

const HomeSearch = forwardRef<HomeSearchRef, HomeSearchProps>(({ sx, onSearch }, ref) => {
  const { data: stats } = useQuery("stats", getStats);

  const beginFiltersRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    scroll: () => {
      const clientPosition = beginFiltersRef.current?.getBoundingClientRect();
      const yPosition = clientPosition ? clientPosition.y + clientPosition.height - 40 : 500;
      setTimeout(() => window.scrollBy({ top: yPosition, behavior: "smooth" }), 150);
    },
    containerRef
  }));

  return (
    <Box
      ref={beginFiltersRef}
      id={"sdfs"}
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
        priority
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(loadHomeSearchBackground())}`}
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
          <Image src="/LogoExtended.svg" alt="1Cademy Logo" width="421px" height="130px" />
        </Box>
        <Box ref={containerRef} sx={{ width: "100%", mt: { xs: 15, md: 5 } }}>
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
    </Box>
  );
});

HomeSearch.displayName = "HomeSearch";
export default HomeSearch;
