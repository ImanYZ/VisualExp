import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SxProps, Theme } from "@mui/system";
import { FC } from "react";

import SearchInput from "./SearchInput";

type Props = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
};

const HomeSearch: FC<Props> = ({ sx, onSearch }) => {
  return (
    <Box
      sx={{
        flexDirection: "column",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx
      }}
    >
      <Typography textAlign="center" variant="h2" component="h1">
        What you want to learn today?
      </Typography>
      <Typography textAlign="center" variant="h5" component="h2">
        Explore hundreds of knowledge articles shared by the academic community
      </Typography>
      <Box
        sx={{
          width: "50%",
          my: 5,
          display: "flex",
          flexDirection: "row"
        }}
      >
        <SearchInput onSearch={onSearch}></SearchInput>
        <Button variant="contained" sx={{ ml: 2 }}>
          Search
        </Button>
      </Box>
    </Box>
  );
};

export default HomeSearch;
