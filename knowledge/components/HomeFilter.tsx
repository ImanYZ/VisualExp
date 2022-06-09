import HelpIcon from "@mui/icons-material/Help";
import { Container, Grid, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import { useRouter } from "next/router";
import React, { FC } from "react";

import TagsAutocomplete from "../components/TagsAutocomplete";
import { getQueryParameter } from "../lib/utils";
import { FilterValue } from "../src/knowledgeTypes";
import ContributorsAutocomplete from "./ContributorsAutocomplete";
import InstitutionsAutocomplete from "./InstitutionsAutocomplete";
import NodeTypesAutocomplete from "./NodeTypesAutocomplete";
import { ReferencesAutocomplete } from "./ReferencesAutocomplete";

type Props = {
  sx?: SxProps<Theme>;
  onTagsChange: (newValues: string[]) => void;
  onInstitutionsChange: (newValues: FilterValue[]) => void;
  onContributorsChange: (newValues: FilterValue[]) => void;
  onNodeTypesChange: (newValues: string[]) => void;
  onReferencesChange: (title: string, label: string) => void;
  contributors: FilterValue[];
  institutions: FilterValue[];
  reference: { title: string; label: string } | null;
};

const HomeFilter: FC<Props> = ({
  sx,
  onTagsChange,
  onInstitutionsChange,
  onContributorsChange,
  onNodeTypesChange,
  onReferencesChange,
  contributors,
  institutions,
  reference
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

  const handleReferencesChange = (title: string, label: string) => {
    onReferencesChange(title, label);
  };

  return (
    <Container
      sx={{
        py: 2,
        px: { xs: 8, lg: 2 },
        ...sx
      }}
    >
      <Grid
        container
        spacing={{ xs: 1, md: 3 }}
        columns={{ xs: 1, sm: 2, md: 4 }}
        alignItems="flex-end"
        justifyContent="center"
        sx={{ position: "relative" }}
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
        <Grid item xs={1} sm={2} md={4}>
          <ReferencesAutocomplete reference={reference} onReferencesChange={handleReferencesChange} />
        </Grid>
        <StyledHelpButton color="primary" aria-label="help" size="small" title="Help">
          <Tooltip title="There are six different types of nodes on 1Cademy: concept, relation, question, code, reference, and idea. You can tell the type of node by looking at the icon at the bottom-right corner of each node.">
            <HelpIcon />
          </Tooltip>
        </StyledHelpButton>
      </Grid>
    </Container>
  );
};

const StyledHelpButton = styled(IconButton)(({ theme }) => ({
  color: "inherit",
  "&": {
    position: "absolute",
    background: "none",
    bottom: "0px",
    left: "-30px",
    padding: "0px",
    color: theme.palette.common.gray
  },
  "@media (min-width:600px)": {
    "&": {
      left: "auto",
      right: "-30px",
      bottom: "0px"
    }
  }
}));

export default HomeFilter;
