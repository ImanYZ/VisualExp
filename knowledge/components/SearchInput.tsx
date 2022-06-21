import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getSearchAutocomplete } from "../lib/knowledgeApi";

type Props = {
  onSearch: (text: string) => void;
  // sx?: SxProps<Theme>;
};

const SearchInput: FC<Props> = ({ onSearch }) => {
  const router = useRouter();
  const [text, setText] = useState<string>((router.query.q as string) || "");
  const [searchText] = useDebounce(text, 250);

  const { data, isLoading } = useQuery(["searchAutocomplete", searchText], () => getSearchAutocomplete(searchText));

  useEffect(() => {
    setText((router.query.q as string) || "");
  }, [router.query]);

  const handleSearch = (e: React.FormEvent) => {
    (document.activeElement as HTMLElement).blur();
    e.preventDefault();
    onSearch(text);
  };

  const handleChangeOption = (value: string) => {
    (document.activeElement as HTMLElement).blur();
    setText(value);
    onSearch(value);
  };

  return (
    <Box component="form" onSubmit={handleSearch}>
      <Autocomplete
        id="custom-input-demo"
        fullWidth
        options={data?.results || []}
        freeSolo={true}
        loading={isLoading}
        onChange={(e, value) => handleChangeOption(value || "")}
        openOnFocus={true}
        sx={{
          display: "inline-block",
          fontSize: "inherit",
          "& input": {
            width: "100%",
            p: "0",
            fontSize: { xs: "16px", md: "25px" },
            fontWeight: 300,
            border: "none",
            color: theme => theme.palette.common.black,
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
              {...params.inputProps}
              value={text}
              onChange={e => {
                setText(e.target.value);
              }}
              placeholder="Search on 1Cademy"
            />
            <IconButton
              type="submit"
              sx={{ p: "5px", color: "#757575", fontSize: "inherit" }}
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
