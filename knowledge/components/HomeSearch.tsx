import { styled, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SxProps, Theme } from "@mui/system";

import SearchInput from "./SearchInput";

type HomeSearchProps = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
};

const StyledButton = styled(Button)(({ theme }) => ({
  color: "inherit",
  "&": {
    width: "64px",
    color: theme.palette.common.white,
    borderRadius: 0,
    fontSize: 15,
    fontWeight: 500
  },
  "@media (min-width:600px)": {
    "&": {
      width: "165px",
      fontSize: 25
    }
  }
}));

export const HomeSearch = ({ sx, onSearch }: HomeSearchProps) => {
  return (
    <Box
      sx={{
        margin: "auto",
        maxWidth: "1087px",
        padding: "30px",
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
        sx={{ marginBottom: { xs: 1, md: 3 }, fontSize: { xs: "23px", md: "50px" } }}
      >
        What you want to learn today?
      </Typography>
      <Typography
        textAlign="center"
        variant="h5"
        component="h2"
        fontWeight="300"
        sx={{ marginBottom: { xs: 1, md: 3 }, fontSize: { xs: "13px", md: "25px" } }}
      >
        Explore hundreds of knowledge articles shared by the academic community
      </Typography>
      <Box
        sx={{
          width: "100%",
          my: { xs: "10px", md: 7 },
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
