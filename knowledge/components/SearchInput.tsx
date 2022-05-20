import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { alpha, styled } from "@mui/material/styles";
import { FC, useState } from "react";

type Props = {
  onSearch: (text: string) => void;
};

const SearchInput: FC<Props> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText);
  };

  return (
    <form onSubmit={handleSearch} style={{ width: "100%" }}>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>

        <StyledInputBase
          fullWidth
          placeholder="Search..."
          inputProps={{ "aria-label": "search" }}
          value={searchText}
          onChange={handleChange}
        />
      </Search>
    </form>
  );
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  border: "1px solid",
  borderRadius: theme.shape.borderRadius,
  borderColor: theme.palette.grey[500],
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[300], 0.06),
  },
  marginLeft: 0,
  width: "100%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

export default SearchInput;
