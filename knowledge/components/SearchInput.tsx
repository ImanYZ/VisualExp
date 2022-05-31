import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { alpha, styled } from "@mui/material/styles";
import { SxProps, Theme } from "@mui/system";
import { FC, useState } from "react";

type Props = {
  onSearch: (text: string) => void;
  sx?: SxProps<Theme>;
};

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
    <Box sx={{ width: "100%", ...sx }} component="form" onSubmit={handleSearch}>
      <Search>
        <StyledInputBase
          fullWidth
          placeholder="Start learning..."
          inputProps={{ "aria-label": "search" }}
          value={searchText}
          onChange={handleChange}
        />
      </Search>
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
  color: theme.palette.common.black,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 2, 1, 2),
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: 15,
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
