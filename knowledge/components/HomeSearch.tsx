import { styled, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SxProps, Theme } from "@mui/system";
import { FC } from "react";

import backgroundImage from "../public/LibraryBackground.jpg";
import SearchInput from "./SearchInput";

type Props = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
};

const HomeSearch: FC<Props> = ({ sx, onSearch }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "236px", md: "479px" },
        margin: "auto",
        padding: "30px",
        flexDirection: "column",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        color: theme => theme.palette.common.white,
        ...sx
      }}
    >
      <Box sx={{ maxWidth: { xs: "340px", md: "1087px" } }}>
        <Typography
          textAlign="center"
          variant="h3"
          component="h1"
          fontWeight="500"
          sx={{ marginBottom: { xs: 1, md: 3 }, marginTop: 8, fontSize: { xs: "23px", md: "50px" } }}
        >
          What do you want to learn today?
        </Typography>
        <Typography
          textAlign="center"
          variant="h5"
          component="h2"
          fontWeight="300"
          sx={{ marginBottom: { xs: 0, md: 0 }, fontSize: { xs: "13px", md: "25px" } }}
        >
          We Synthesize Books & Research Papers Together
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
    fontWeight: 500
  },
  "@media (min-width:900px)": {
    "&": {
      width: "165px",
      fontSize: 25
    }
  }
}));

export default HomeSearch;
