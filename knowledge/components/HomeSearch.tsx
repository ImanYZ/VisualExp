import { styled, Typography } from "@mui/material";
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
        margin: "auto",
        maxWidth: "1087px",
        flexDirection: "column",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx
      }}
    >
      <Typography
        textAlign="center"
        variant="h3"
        component="h1"
        fontWeight="500"
        sx={{ marginBottom: 3, fontSize: { xs: "23px", md: "50px" } }}
      >
        What you want to learn today?
      </Typography>
      <Typography
        textAlign="center"
        variant="h5"
        component="h2"
        fontWeight="300"
        sx={{ marginBottom: 3, fontSize: { xs: "13px", md: "25px" } }}
      >
        Explore hundreds of knowledge articles shared by the academic community
      </Typography>
      <Box
        sx={{
          width: "100%",
          my: { xs: 2, md: 7 },
          display: "flex",
          flexDirection: "row"
        }}
      >
        <SearchInput onSearch={onSearch}></SearchInput>
        <StyledButton variant="contained">Search</StyledButton>
      </Box>
    </Box>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  color: "inherit",
  "&": {
    width: "64px",
    color: theme.palette.common.white,
    borderRadius: 0,
    fontSize: 15,
    fontWeight: 300
  },
  "@media (min-width:600px)": {
    "&": {
      width: "165px",
      fontSize: 25
    }
  }
}));

export default HomeSearch;
