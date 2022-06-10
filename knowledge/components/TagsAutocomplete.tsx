import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getTagsAutocomplete } from "../lib/knowledgeApi";

type Props = {
  tags: string[];
  onTagsChange: (newValues: string[]) => void;
};

const TagsAutocomplete: FC<Props> = ({ tags = [], onTagsChange }) => {
  const [value, setValue] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { data, isLoading } = useQuery(["tags", searchText], () => getTagsAutocomplete(searchText));
  const [hasBeenCleared, setHasBeenCleared] = useState(false);

  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (event && query.trim().length > 0) {
      setText(query);
    }
  };

  const handleChange = (_: React.SyntheticEvent, newValue: string[]) => {
    if (newValue.length === 0) {
      setHasBeenCleared(true);
    }
    setValue(newValue);
    onTagsChange(newValue);
  };

  useEffect(() => {
    if (value.length === 0 && tags.length > 0 && !hasBeenCleared) {
      setValue(tags);
    }
  }, [tags, hasBeenCleared, value.length]);

  return (
    <Autocomplete
      multiple
      value={value}
      options={data?.results || []}
      onInputChange={handleQueryChange}
      onChange={handleChange}
      noOptionsText={"Search tags"}
      loading={isLoading}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
        ))
      }
      renderInput={params => <TextField {...params} variant="outlined" label="Tags" />}
    />
  );
};
export default TagsAutocomplete;
