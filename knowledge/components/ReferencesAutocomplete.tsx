import { Autocomplete, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React, { SyntheticEvent, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getReferencesAutocomplete } from "../lib/knowledgeApi";
import { isValidHttpUrl } from "../lib/utils";
import { TypesenseReferencesSchema } from "../src/knowledgeTypes";

type Props = {
  reference: TypesenseReferencesSchema | null;
  onReferencesChange: (newValues: TypesenseReferencesSchema | null) => void;
};

export const ReferencesAutocomplete = ({}: Props) => {
  const [text, setText] = useState("");
  const [referenceSelected, setReferenceSelected] = useState<TypesenseReferencesSchema | null>(null);
  const [searchText] = useDebounce(text, 250);
  const { isLoading, data } = useQuery(["references", searchText], () => getReferencesAutocomplete(searchText));

  const [labelSelected, setLabelSelected] = useState("");

  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    console.log("handleQueryChange", query);
    const queryProcesed = query.trim();
    setText(queryProcesed);
  };

  const handleChange = (event: SyntheticEvent<Element, Event>, newValue: TypesenseReferencesSchema | null) => {
    console.log("handleChange", newValue);
    // onReferencesChange(newValue)
    setReferenceSelected(newValue);
  };

  const onChangeLabel = (event: SelectChangeEvent) => {
    setLabelSelected(event.target.value);
  };

  const isWeb = (currentReference: TypesenseReferencesSchema) => {
    return isValidHttpUrl(currentReference.label);
  };

  // const getLabelOptions = () => {

  // }

  return (
    <Box sx={{ display: "flex" }}>
      <Autocomplete
        options={data?.results || []}
        value={referenceSelected}
        loading={isLoading}
        noOptionsText={"Search references"}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onInputChange={handleQueryChange}
        getOptionLabel={option => option.title} // << ----- ---- ---- --- HERE we are defining to suggest by only title
        renderOption={(props, option) => {
          const newProps = { ...props, key: option.id };
          return <li {...newProps}>{option.title}</li>;
        }}
        onChange={handleChange}
        renderInput={params => <TextField {...params} variant="outlined" label="References" />}
        sx={{ flexGrow: 1 }}
      />
      {referenceSelected && (
        <FormControl sx={{ width: { xs: "10%", md: "30%" } }}>
          <InputLabel id="demo-simple-select-label">{isWeb(referenceSelected) ? "Sections" : "Pages"}</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={labelSelected}
            label={isWeb(referenceSelected) ? "Sections" : "Pages"}
            onChange={onChangeLabel}
          >
            <MenuItem value={""}>{isWeb(referenceSelected) ? "All Sections" : "All Pages"}</MenuItem>
          </Select>
        </FormControl>
      )}
    </Box>
  );
};
