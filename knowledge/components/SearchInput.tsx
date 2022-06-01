import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { alpha, styled } from "@mui/material/styles";
import { SxProps, Theme } from "@mui/system";
import { FC, useState } from "react";

type Props = {
  onSearch: (text: string) => void;
  sx?: SxProps<Theme>;
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

const SearchInput: FC<Props> = ({ onSearch, sx }) => {
  const [searchText, setSearchText] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText);
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "row", ...sx }} component="form" onSubmit={handleSearch}>
      <Search>
        <StyledInputBase
          fullWidth
          placeholder="Start learning..."
          inputProps={{ "aria-label": "search" }}
          value={searchText}
          onChange={handleChange}
        />
      </Search>
      <StyledButton variant="contained" type="submit">
        Search
      </StyledButton>
    </Box>
  );
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  border: "2px solid",
  borderColor: theme.palette.grey[200],
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[300], 0.06)
  },
  width: "100%"
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 2, 1, 2),
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: 15,
    fontWeight: 300,
    background: theme.palette.common.white
  },
  "@media (min-width:600px)": {
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 5, 1, 5),
      fontSize: 25,
      fontWeight: 300
    }
  }
}));

export default SearchInput;
