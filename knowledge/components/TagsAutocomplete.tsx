import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getTagsAutocomplete } from "../lib/knowledgeApi";

type Props = {
  tags: string[];
  onTagsChange: (newValues: string[]) => void;
};

const TagsAutocomplete: FC<Props> = ({ tags = [], onTagsChange }) => {
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { data } = useQuery(["tags", searchText], () => getTagsAutocomplete(searchText));

  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (event && query.trim().length > 0) {
      setText(query);
    }
  };

  const handleChange = (_: React.SyntheticEvent, newValue: string[]) => {
    console.log("handleChange newValue", newValue);
    onTagsChange(newValue);
  };

  return (
    <Autocomplete
      multiple
      options={data?.results || []}
      freeSolo
      onInputChange={handleQueryChange}
      onChange={handleChange}
      value={tags}
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
