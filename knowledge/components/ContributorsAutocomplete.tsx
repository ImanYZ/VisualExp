import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getContributorsAutocomplete } from "../lib/knowledgeApi";

type Props = {
  value: string[];
  onContributorsChange: (newValues: string[]) => void;
};

const ContributorsAutocomplete: FC<Props> = ({ onContributorsChange }) => {
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { data } = useQuery(["contributors", searchText], () => getContributorsAutocomplete(searchText));
  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (event && query.trim().length > 0) {
      setText(query);
    }
  };

  const handleChange = (
    _: React.SyntheticEvent,
    newValue: (
      | string
      | {
          name: string;
          imageUrl?: string | undefined;
        }
    )[]
  ) => {
    onContributorsChange(newValue.map(el => (typeof el === "string" ? el : el.name)));
  };

  return (
    <Autocomplete
      multiple
      options={data?.results || []}
      freeSolo
      onInputChange={handleQueryChange}
      renderOption={(props, option) => (
        <li {...props}>
          {option.imageUrl ? (
            <Avatar sizes="small" alt={option.name} src={option.imageUrl} sx={{ mr: 1 }} />
          ) : undefined}
          {option.name}
        </li>
      )}
      getOptionLabel={option => (typeof option === "string" ? option : option.name)}
      onChange={handleChange}
      // value={value}
      renderTags={(value: readonly { name: string; imageUrl?: string }[], getTagProps) =>
        value.map((option, index: number) => (
          <Chip
            avatar={option.imageUrl ? <Avatar alt={option.name} src={option.imageUrl} /> : undefined}
            variant="outlined"
            label={typeof option === "string" ? option : option.name}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      renderInput={params => <TextField {...params} variant="standard" label="Contributors" />}
    />
  );
};
export default ContributorsAutocomplete;
