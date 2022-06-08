import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getInstitutionsAutocomplete } from "../lib/knowledgeApi";
import { FilterValue } from "../src/knowledgeTypes";

type Props = {
  institutions: FilterValue[];
  onInstitutionsChange: (newValues: FilterValue[]) => void;
};

const InstitutionsAutocomplete: FC<Props> = ({ onInstitutionsChange, institutions }) => {
  const [hasBeenCleared, setHasBeenCleared] = useState(false);
  const [value, setValue] = useState<FilterValue[]>([]);
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { isLoading, data } = useQuery(["institutions", searchText], () => getInstitutionsAutocomplete(searchText), {
    enabled: searchText.length > 0
  });

  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (event && query.trim().length > 0) {
      setText(query);
    }
  };

  const handleChange = (_: React.SyntheticEvent, newValue: FilterValue[]) => {
    if (newValue.length === 0) {
      setHasBeenCleared(true);
    }
    setValue(newValue);
    onInstitutionsChange(newValue);
  };

  useEffect(() => {
    if (value.length === 0 && institutions.length > 0 && !hasBeenCleared) {
      setValue(institutions);
    }
  }, [institutions, hasBeenCleared, value.length]);

  return (
    <Autocomplete
      multiple
      options={data?.results || []}
      value={value}
      loading={isLoading}
      onInputChange={handleQueryChange}
      noOptionsText={"Search institutions"}
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
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
      getOptionLabel={option => option.name}
      onChange={handleChange}
      renderTags={(value: readonly FilterValue[], getTagProps) =>
        value.map((option, index: number) => (
          <Chip
            avatar={option.imageUrl ? <Avatar alt={option.name} src={option.imageUrl} /> : undefined}
            variant="outlined"
            label={option.name}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      renderInput={params => <TextField {...params} variant="outlined" label="Institutions" />}
    />
  );
};
export default InstitutionsAutocomplete;
