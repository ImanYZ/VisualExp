import { Autocomplete, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getReferencesAutocomplete } from "../lib/knowledgeApi";
import { isValidHttpUrl } from "../lib/utils";
import { FilterProcessedReferences } from "../src/knowledgeTypes";

type Props = {
  reference: { title: string; label: string } | null;
  onReferencesChange: (title: string, label: string) => void;
};

export const ReferencesAutocomplete = ({ onReferencesChange, reference = null }: Props) => {
  const [text, setText] = useState(reference?.title || "");
  const [searchText] = useDebounce(text, 250);
  const { isLoading, data } = useQuery(["references", searchText], () => getReferencesAutocomplete(searchText));

  // const [referenceSelected] = useState()

  const [referenceSelected, setReferenceSelected] = useState<FilterProcessedReferences | null>(null);

  const [labelSelected, setLabelSelected] = useState("");

  useEffect(() => {
    if (!data || !reference) {
      return;
    }

    const getReferenceValue = () => data.results?.find(cur => cur.title === reference.title) || null;
    const referenceValue = getReferenceValue();
    const getLabelValue = () => getLabels(referenceValue).find(cur => cur.label === reference.label);
    const labelValue = getLabelValue()?.label || "";

    setReferenceSelected(referenceValue);
    setLabelSelected(labelValue);
  }, [reference, data]);

  const handleInputChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    const queryProcessed = query.trim();
    setText(queryProcessed);
  };

  const handleChange = (event: SyntheticEvent<Element, Event>, newValue: FilterProcessedReferences | null) => {
    onReferencesChange(newValue?.title || "", "");

    setReferenceSelected(newValue);
    setLabelSelected("");
  };

  const handleChangeLabel = (event: SelectChangeEvent) => {
    setLabelSelected(event.target.value);

    onReferencesChange(referenceSelected?.title || "", event.target.value);
  };

  const isWeb = (currentReference: FilterProcessedReferences) => {
    return isValidHttpUrl(currentReference.data[0]?.label);
  };

  const getLabels = (currentReferenceSelected: FilterProcessedReferences | null): { label: string; node: string }[] => {
    if (!currentReferenceSelected) return [];
    const labels = currentReferenceSelected.data.filter(cur => cur.label);

    const emptyLabel = isWeb(currentReferenceSelected) ? "All Sections" : "All Pages";
    return [{ label: emptyLabel, node: "" }, ...labels];
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Autocomplete
        options={data?.results || []}
        value={referenceSelected}
        loading={isLoading}
        noOptionsText={"Search references"}
        isOptionEqualToValue={(option, value) => option.title === value.title}
        onInputChange={handleInputChange}
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
            onChange={handleChangeLabel}
          >
            {getLabels(referenceSelected).map((data, idx) => (
              <MenuItem key={idx} value={data.label}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};
