import { Grid } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { FC } from "react";

import TagsAutocomplete from "../components/TagsAutocomplete";
import { FilterValue } from "../src/knowledgeTypes";
import ContributorsAutocomplete from "./ContributorsAutocomplete";
import InstitutionsAutocomplete from "./InstitutionsAutocomplete";
import NodeTypesAutocomplete from "./NodeTypesAutocomplete";
import { ReferencesAutocomplete } from "./ReferencesAutocomplete";

type HomeFilterProps = {
  sx?: SxProps<Theme>;
  onTagsChange: (newValues: string[]) => void;
  onInstitutionsChange: (newValues: FilterValue[]) => void;
  onContributorsChange: (newValues: FilterValue[]) => void;
  onNodeTypesChange: (newValues: string[]) => void;
  onReferencesChange: (title: string, label: string) => void;
};

const HomeFilter: FC<HomeFilterProps> = ({
  sx,
  onTagsChange,
  onInstitutionsChange,
  onContributorsChange,
  onNodeTypesChange,
  onReferencesChange
}) => {
  const handleTagsChange = (values: string[]) => {
    onTagsChange(values);
  };

  const handleInstitutionsChange = (values: FilterValue[]) => {
    onInstitutionsChange(values);
  };

  const handleContributorsChange = (values: FilterValue[]) => {
    onContributorsChange(values);
  };

  const handleNodeTypesChange = (values: string[]) => {
    onNodeTypesChange(values);
  };

  const handleReferencesChange = (title: string, label: string) => {
    onReferencesChange(title, label);
  };

  return (
    <Grid
      container
      spacing={{ xs: 1, md: 3 }}
      columns={{ xs: 1, sm: 2, md: 4 }}
      alignItems="flex-end"
      justifyContent="center"
      sx={{ position: "relative", ...sx }}
    >
      <Grid item xs={1}>
        <TagsAutocomplete onTagsChange={handleTagsChange} />
      </Grid>
      <Grid item xs={1}>
        <NodeTypesAutocomplete onNodesTypeChange={handleNodeTypesChange} />
      </Grid>
      <Grid item xs={1}>
        <ContributorsAutocomplete onContributorsChange={handleContributorsChange} />
      </Grid>
      <Grid item xs={1}>
        <InstitutionsAutocomplete onInstitutionsChange={handleInstitutionsChange} />
      </Grid>
      <Grid item xs={1} sm={2} md={4}>
        <ReferencesAutocomplete onReferencesChange={handleReferencesChange} />
      </Grid>
    </Grid>
  );
};

export default HomeFilter;
