import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getInstitutionsAutocomplete } from "../lib/knowledgeApi";

type Props = {
  value: string[];
  onInstitutionsChange: (newValues: string[]) => void;
};

const InstitutionsAutocomplete: FC<Props> = ({ onInstitutionsChange }) => {
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { data } = useQuery(["institutions", searchText], () => getInstitutionsAutocomplete(searchText));
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
          logoUrl?: string | undefined;
        }
    )[]
  ) => {
    onInstitutionsChange(newValue.map(el => (typeof el === "string" ? el : el.name)));
  };

  return (
    <Autocomplete
      multiple
      options={data?.results || []}
      freeSolo
      onInputChange={handleQueryChange}
      renderOption={(props, option) => (
        <li {...props}>
          {option.logoUrl ? <Avatar sizes="small" alt={option.name} src={option.logoUrl} sx={{ mr: 1 }} /> : undefined}
          {option.name}
        </li>
      )}
      getOptionLabel={option => (typeof option === "string" ? option : option.name)}
      onChange={handleChange}
      // value={value}
      renderTags={(value: readonly { name: string; logoUrl?: string }[], getTagProps) =>
        value.map((option, index: number) => (
          <Chip
            avatar={option.logoUrl ? <Avatar alt={option.name} src={option.logoUrl} /> : undefined}
            variant="outlined"
            label={typeof option === "string" ? option : option.name}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      renderInput={params => <TextField {...params} variant="standard" label="Institutions" />}
    />
  );
};
export default InstitutionsAutocomplete;
