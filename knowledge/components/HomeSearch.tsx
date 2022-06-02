import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";

import backgroundImage from "../public/LibraryBackground.jpg";
import SearchInput from "./SearchInput";

type HomeSearchProps = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
};

export const HomeSearch = ({ sx, onSearch }: HomeSearchProps) => {
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${backgroundImage.src})`,
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
          {/* <StyledButton variant="contained">Search</StyledButton> */}
        </Box>
      </Box>
    </Box>
  );
};
