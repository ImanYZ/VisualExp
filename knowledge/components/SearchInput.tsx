import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

type Props = {
  onSearch: (text: string) => void;
  // sx?: SxProps<Theme>;
};

const SearchInput: FC<Props> = ({ onSearch }) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>((router.query.q as string) || "");

  useEffect(() => setSearchText((router.query.q as string) || ""), [router.query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText);
  };

  return (
    <Box component="form" onSubmit={handleSearch}>
      <Autocomplete
        id="custom-input-demo"
        fullWidth
        options={[]}
        freeSolo={true}
        sx={{
          display: "inline-block",
          fontSize: "inherit",
          "& input": {
            width: "100%",
            p: "0",
            fontSize: { xs: "16px", md: "25px" },
            fontWeight: 300,
            border: "none",
            background: theme => theme.palette.common.white
          },
          "& input:focus": {
            outline: "none"
          }
        }}
        renderInput={params => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: { xs: "40px", md: "62px" },
              px: { xs: "12px", md: "25px" },
              background: theme => theme.palette.common.white
            }}
            ref={params.InputProps.ref}
          >
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search on 1Cademy "
              {...params.inputProps}
            />
            <IconButton
              type="submit"
              sx={{ p: "5px", color: theme => theme.palette.common.black, fontSize: "inherit" }}
              aria-label="search"
              onClick={handleSearch}
            >
              <SearchIcon sx={{ color: "inherit", fontSize: { xs: "25px", md: "35px" } }} />
            </IconButton>
          </Box>
        )}
      />
    </Box>
  );
};

export default SearchInput;
