import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getTagsAutocomplete } from "../lib/knowledgeApi";

type Props = {
  value: string[];
  setValue: (newValues: string[]) => void;
};

const TagsAutocomplete: FC<Props> = ({ value = [], setValue }) => {
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { data } = useQuery(["tags", searchText], () => getTagsAutocomplete(searchText), {
    enabled: searchText.length > 2
  });

  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (event && query.trim().length > 0) {
      setText(query);
    }
  };

  const handleChange = (_: React.SyntheticEvent, newValue: string[]) => {
    setValue(newValue);
  };

  return (
    <Autocomplete
      multiple
      options={data?.results || []}
      freeSolo
      onInputChange={handleQueryChange}
      onChange={handleChange}
      value={value}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
        ))
      }
      renderInput={params => <TextField {...params} variant="standard" label="Tags" />}
    />
  );
};
export default TagsAutocomplete;
