import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";
import Image from "next/image";
import { forwardRef, MutableRefObject, useImperativeHandle, useRef } from "react";
import { useQuery } from "react-query";

import { getStats } from "../lib/knowledgeApi";
import SearchInput from "./SearchInput";

type HomeSearchProps = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
};

export type HomeSearchRef = {
  scroll: () => void;
  containerRef: MutableRefObject<HTMLDivElement | null>;
};

const blurImage = () => {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QEERXhpZgAATU0AKgAAAAgACAEaAAUAAAABAAAAbgEbAAUAAAABAAAAdgEoAAMAAAABAAIAAAExAAIAAAAoAAAAfgEyAAIAAAAUAAAApgE7AAIAAAAMAAAAuoKYAAIAAAAMAAAAxodpAAQAAAABAAAA0gAAAAAAAABIAAAAAQAAAEgAAAABQWRvYmUgUGhvdG9zaG9wIExpZ2h0cm9vbSA2LjEgKFdpbmRvd3MpADIwMjI6MDY6MTYgMTM6MDE6MzUARGF2aWQgSWxpZmYARGF2aWQgSWxpZmYAAAOgAQADAAAAAQABAACgAgADAAAAAQAKAACgAwADAAAAAQAHAAAAAAAA/+EOLWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpJcHRjNHhtcENvcmU9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBDb3JlLzEuMC94bWxucy8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBMaWdodHJvb20gNi4xIChXaW5kb3dzKSIgeG1wOk1vZGlmeURhdGU9IjIwMjItMDYtMTZUMTM6MDE6MzUtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjItMDYtMTZUMTM6MDE6MzUtMDU6MDAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MEFENTI2N0VFNTIzMTFFQzhENENCMTM2RjI4MkVBNjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MEFENTI2N0RFNTIzMTFFQzhENENCMTM2RjI4MkVBNjMiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0iRTdFRUFBODE2NUEzNUU4RDA5NzRCRTI3ODhFRThFM0YiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSI+IDxJcHRjNHhtcENvcmU6Q3JlYXRvckNvbnRhY3RJbmZvIElwdGM0eG1wQ29yZTpDaUVtYWlsV29yaz0iZGlsaWZmQHlhaG9vLmNvbSIvPiA8ZGM6Y3JlYXRvcj4gPHJkZjpTZXE+IDxyZGY6bGk+RGF2aWQgSWxpZmY8L3JkZjpsaT4gPC9yZGY6U2VxPiA8L2RjOmNyZWF0b3I+IDxkYzpyaWdodHM+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPkRhdmlkIElsaWZmPC9yZGY6bGk+IDwvcmRmOkFsdD4gPC9kYzpyaWdodHM+IDx4bXBNTTpEZXJpdmVkRnJvbSB4bXBNTTpkb2N1bWVudElEPSJ4bXAuZGlkOmI0NGM4ODJhLTVkMjQtYmI0Ny05YmJhLWZjNjg1N2YzMDEzYSIgeG1wTU06aW5zdGFuY2VJRD0ieG1wLmlpZDo2MDg5ZDNlYi01ODI2LTQzNWQtODI3Ny0yOTJmNzJhNDYxMDQiLz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0icHJvZHVjZWQiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFmZmluaXR5IFBob3RvIDEuMTAuNSIgc3RFdnQ6d2hlbj0iMjAyMi0wNi0xNlQxMzowMTozNS0wNTowMCIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/Pv/tAGhQaG90b3Nob3AgMy4wADhCSU0EBAAAAAAALxwBWgADGyVHHAIAAAIABBwCUAALRGF2aWQgSWxpZmYcAnQAC0RhdmlkIElsaWZmADhCSU0EJQAAAAAAENtMYE8rO8sVpyMHLLVGxwj/4gJkSUNDX1BST0ZJTEUAAQEAAAJUbGNtcwQwAABtbnRyUkdCIFhZWiAH5gAGABAAEgAAAC5hY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtkZXNjAAABCAAAAD5jcHJ0AAABSAAAAEx3dHB0AAABlAAAABRjaGFkAAABqAAAACxyWFlaAAAB1AAAABRiWFlaAAAB6AAAABRnWFlaAAAB/AAAABRyVFJDAAACEAAAACBnVFJDAAACEAAAACBiVFJDAAACEAAAACBjaHJtAAACMAAAACRtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACIAAAAcAHMAUgBHAEIAIABJAEUAQwA2ADEAOQA2ADYALQAyAC4AMQAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAwAAAAHABOAG8AIABjAG8AcAB5AHIAaQBnAGgAdAAsACAAdQBzAGUAIABmAHIAZQBlAGwAeVhZWiAAAAAAAAD21gABAAAAANMtc2YzMgAAAAAAAQxCAAAF3v//8yUAAAeTAAD9kP//+6H///2iAAAD3AAAwG5YWVogAAAAAAAAb6AAADj1AAADkFhZWiAAAAAAAAAknwAAD4QAALbDWFlaIAAAAAAAAGKXAAC3hwAAGNlwYXJhAAAAAAADAAAAAmZmAADypwAADVkAABPQAAAKW2Nocm0AAAAAAAMAAAAAo9cAAFR7AABMzQAAmZoAACZmAAAPXP/bAEMAUDc8RjwyUEZBRlpVUF94yIJ4bm549a+5kcj////////////////////////////////////////////////////bAEMBVVpaeGl464KC6//////////////////////////////////////////////////////////////////////////AABEIAAcACgMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAA//EABkQAAMAAwAAAAAAAAAAAAAAAAABERIiMf/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/AJY2NDWcAJhr/9k=";
};

const HomeSearch = forwardRef<HomeSearchRef, HomeSearchProps>(({ sx, onSearch }, ref) => {
  const { data: stats } = useQuery("stats", getStats);

  const beginFiltersRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    scroll: () => {
      console.log("beginFiltersRef.current", beginFiltersRef.current);
      const clientPosition = beginFiltersRef.current?.getBoundingClientRect();
      console.log("clientPosition", clientPosition);
      const yPosition = clientPosition ? clientPosition.y + clientPosition.bottom - 120 : 500;
      console.log(yPosition);
      return window.scrollBy({ top: yPosition, behavior: "smooth" });
      // return window.scrollTo(0, yPosition || 0)
      // return beginFiltersRef.current?.scrollIntoView({ behavior: "smooth" })
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
        placeholder="blur"
        blurDataURL={blurImage()}
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
        <Box
          ref={containerRef}
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
    </Box>
  );
});

HomeSearch.displayName = "HomeSearch";
export default HomeSearch;
