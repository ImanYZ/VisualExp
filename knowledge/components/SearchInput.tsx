import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Paper } from "@mui/material";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { /* alpha*/ styled } from "@mui/material/styles";
import { SxProps, Theme } from "@mui/system";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

type Props = {
  onSearch: (text: string) => void;
  sx?: SxProps<Theme>;
};

const SearchInput: FC<Props> = ({ onSearch, sx }) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>((router.query.q as string) || "");

  useEffect(() => setSearchText((router.query.q as string) || ""), [router.query]);

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchText(event.target.value);
  // };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText);
  };

  return (
    // <Box
    //   sx={{
    //     width: "100%",
    //     display: "flex",
    //     height: "50px",
    //     flexDirection: "row",
    //     alignItems: "center",
    //     background: theme => theme.palette.common.white,
    //     ...sx
    //   }}
    //   component="form"
    //   onSubmit={handleSearch}
    // >
    //   <SearchStyled>
    //     <StyledInputBase
    //       fullWidth
    //       placeholder="What do you want to learn now?"
    //       inputProps={{ "aria-label": "search" }}
    //       value={searchText}
    //       onChange={handleChange}
    //     />
    //   </SearchStyled>
    //   <StyledButton aria-label="Begin Search" variant="contained" type="submit">
    //     <SearchIcon fontSize="large" />
    //   </StyledButton>
    // </Box>
    <Paper
      component="form"
      sx={{
        p: "0px 25px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        // background: theme => alpha(theme.palette.grey[100], 0.5),
        borderRadius: "3px",
        border: "solid 2px",
        borderColor: theme => theme.palette.grey[600],
        color: theme => theme.palette.common.white,
        fontSize: "25px",
        ":hover": {
          borderColor: theme => theme.palette.common.white,
          color: theme => theme.palette.common.white
        },
        ":focus-within": {
          background: theme => theme.palette.common.white,
          color: theme => theme.palette.common.black
        },
        ...sx
      }}
    >
      <StyledInputBase
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="Search on 1Cademy "
        inputProps={{ "aria-label": "search node" }}
        fullWidth
        sx={{ fontSize: "inherit" }}
        // sx={{ ml: 1, flex: 1 }}
      />
      <IconButton
        type="submit"
        sx={{ p: "5px", color: "inherit", fontSize: "inherit" }}
        aria-label="search"
        onClick={handleSearch}
      >
        <SearchIcon sx={{ color: "inherit", fontSize: "35px" }} />
      </IconButton>
    </Paper>
  );
};

// const SearchStyled = styled("div")(({ theme }) => ({
//   position: "relative",
//   borderColor: theme.palette.common.white,
//   "&:hover": {
//     backgroundColor: alpha(theme.palette.grey[300], 0.06)
//   },
//   width: "100%"
// }));

// const StyledButton = styled(Button)(({ theme }) => ({
//   backgroundColor: theme.palette.common.white,
//   color: theme.palette.grey[600],
//   borderRadius: 0,
//   fontSize: 15,
//   fontWeight: 500,
//   border: "none",
//   "&:hover": {
//     backgroundColor: theme.palette.grey[200]
//   }
// }));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.common.black,
  "& .MuiInputBase-input": {
    width: "100%",
    fontSize: "inherit",
    height: "36px",
    fontWeight: 300,
    background: theme.palette.common.white
  },
  "@media (min-width:900px)": {
    "& .MuiInputBase-input": {
      fontSize: "inherit",
      fontWeight: 300
    }
  }
}));

export default SearchInput;
