import { Grid } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import { useRouter } from "next/router";
import React, { FC } from "react";

import TagsAutocomplete from "../components/TagsAutocomplete";
import { getQueryParameter } from "../lib/utils";
import { FilterValue } from "../src/knowledgeTypes";
import ContributorsAutocomplete from "./ContributorsAutocomplete";
import InstitutionsAutocomplete from "./InstitutionsAutocomplete";
import NodeTypesAutocomplete from "./NodeTypesAutocomplete";

type Props = {
  sx?: SxProps<Theme>;
  onTagsChange: (newValues: string[]) => void;
  onInstitutionsChange: (newValues: FilterValue[]) => void;
  onContributorsChange: (newValues: FilterValue[]) => void;
  onNodeTypesChange: (newValues: string[]) => void;
  contributors: FilterValue[];
  institutions: FilterValue[];
};

const HomeFilter: FC<Props> = ({
  sx,
  onTagsChange,
  onInstitutionsChange,
  onContributorsChange,
  onNodeTypesChange,
  contributors,
  institutions
}) => {
  const router = useRouter();
  const tags = (getQueryParameter(router.query.tags) || "").split(",").filter(el => el !== "");
  const nodeTypes = (getQueryParameter(router.query.nodeTypes) || "").split(",").filter(el => el !== "");

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
        <TagsAutocomplete tags={tags} onTagsChange={handleTagsChange} />
      </Grid>
      <Grid item xs={1}>
        <NodeTypesAutocomplete onNodesTypeChange={handleNodeTypesChange} nodeTypes={nodeTypes} />
      </Grid>
      <Grid item xs={1}>
        <ContributorsAutocomplete contributors={contributors} onContributorsChange={handleContributorsChange} />
      </Grid>
      <Grid item xs={1}>
        <InstitutionsAutocomplete institutions={institutions} onInstitutionsChange={handleInstitutionsChange} />
      </Grid>
    </Grid>
  );
};

export default HomeFilter;
