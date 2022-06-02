import HelpIcon from "@mui/icons-material/Help";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { FC } from "react";

import TagsAutocomplete from "../components/TagsAutocomplete";
import ContributorsAutocomplete from "./ContributorsAutocomplete";
import InstitutionsAutocomplete from "./InstitutionsAutocomplete";
import NodeTypesAutocomplete from "./NodeTypesAutocomplete";

type Props = {
  sx?: SxProps<Theme>;
  onTagsChange: (newValues: string[]) => void;
  onInstitutionsChange: (newValues: string[]) => void;
  onContributorsChange: (newValues: string[]) => void;
  onNodeTypesChange: (newValues: string[]) => void;
};

const HomeFilter: FC<Props> = ({ sx, onTagsChange, onInstitutionsChange, onContributorsChange, onNodeTypesChange }) => {
  const [tagsFilter, setTagsFilter] = React.useState<string[]>([]);
  const [institutionsFilter, setInstitutionsFilter] = React.useState<string[]>([]);
  const [nodeTypesFilter, setNodeTypesFilter] = React.useState<string[]>([]);
  const [contributorsFilter, setContributorsFilter] = React.useState<string[]>([]);

  const handleTagsChange = (values: string[]) => {
    setTagsFilter(values);
    onTagsChange(values);
  };

  const handleInstitutionsChange = (values: string[]) => {
    setInstitutionsFilter(values);
    onInstitutionsChange(values);
  };

  const handleContributorsChange = (values: string[]) => {
    setContributorsFilter(values);
    onContributorsChange(values);
  };

  const handleNodeTypesChange = (values: string[]) => {
    setNodeTypesFilter(values);
    onNodeTypesChange(values);
  };

  return (
    <Box
      sx={{
        padding: { xs: "10px 40px", lg: "10px 10px" },
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
          <TagsAutocomplete tags={tagsFilter} onTagsChange={handleTagsChange} />
        </Grid>

        <Grid item xs={1}>
          <InstitutionsAutocomplete value={institutionsFilter} onInstitutionsChange={handleInstitutionsChange} />
        </Grid>

        <Grid item xs={1}>
          <ContributorsAutocomplete value={contributorsFilter} onContributorsChange={handleContributorsChange} />
        </Grid>

        <Grid item xs={1}>
          <NodeTypesAutocomplete onNodesTypeChange={handleNodeTypesChange} value={nodeTypesFilter} />
        </Grid>
        <StyledHelpButton color="primary" aria-label="help" size="small" title="Help">
          <Tooltip title="There are six different types of nodes on 1Cademy: concept, relation, question, code, reference, and idea. You can tell the type of node by looking at the icon at the bottom-right corner of each node.">
            <HelpIcon />
          </Tooltip>
        </StyledHelpButton>
      </Grid>
    </Box>
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
