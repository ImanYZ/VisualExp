import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getContributorsAutocomplete } from "../lib/knowledgeApi";
import { ContributorValue } from "../src/knowledgeTypes";

type Props = {
  contributors?: ContributorValue[];
  onContributorsChange: (newValues: string[]) => void;
};

const ContributorsAutocomplete: FC<Props> = ({ onContributorsChange, contributors = [] }) => {
  const [value, setValue] = useState<ContributorValue[]>([]);
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { isLoading, data } = useQuery(["contributors", searchText], () => getContributorsAutocomplete(searchText), {
    enabled: searchText.length > 0
  });
  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (event && query.trim().length > 0) {
      setText(query);
    }
  };
  const handleChange = (_: React.SyntheticEvent, newValue: ContributorValue[]) => {
    setValue(newValue);
    onContributorsChange(newValue.map((el: ContributorValue) => el.id));
  };

  useEffect(() => {
    if (value.length === 0 && contributors.length > 0) {
      setValue(contributors);
    }
  }, [contributors, value.length]);

  return (
    <Autocomplete
      multiple
      options={data?.results || []}
      value={value}
      loading={isLoading}
      noOptionsText={"Search contributors"}
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      onInputChange={handleQueryChange}
      renderOption={(props, option) => {
        const newProps = { ...props, key: option.id };
        return (
          <li {...newProps}>
            {option.imageUrl ? (
              <Avatar sizes="small" alt={option.name} src={option.imageUrl} sx={{ mr: 1 }} />
            ) : undefined}
            {option.name}
          </li>
        );
      }}
      getOptionLabel={option => (typeof option === "string" ? option : option.name)}
      onChange={handleChange}
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
