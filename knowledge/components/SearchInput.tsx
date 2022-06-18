import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { alpha, styled } from "@mui/material/styles";
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        height: "50px",
        flexDirection: "row",
        alignItems: "center",
        background: theme => theme.palette.common.white,
        ...sx
      }}
      component="form"
      onSubmit={handleSearch}
    >
      <SearchStyled>
        <StyledInputBase
          fullWidth
          placeholder="What do you want to learn now?"
          inputProps={{ "aria-label": "search" }}
          value={searchText}
          onChange={handleChange}
        />
      </SearchStyled>
      <StyledButton aria-label="Begin Search" variant="contained" type="submit">
        <SearchIcon fontSize="large" />
      </StyledButton>
    </Box>
  );
};

const SearchStyled = styled("div")(({ theme }) => ({
  position: "relative",
  borderColor: theme.palette.common.white,
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[300], 0.06)
  },
  width: "100%"
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.grey[600],
  borderRadius: 0,
  fontSize: 15,
  fontWeight: 500,
  border: "none",
  "&:hover": {
    backgroundColor: theme.palette.grey[200]
  }
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.common.black,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 2, 1, 2),
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: 15,
    height: "36px",
    fontWeight: 300,
    background: theme.palette.common.white
  },
  "@media (min-width:900px)": {
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 5, 1, 5),
      fontSize: 25,
      fontWeight: 300
    }
  }
}));

export default SearchInput;
