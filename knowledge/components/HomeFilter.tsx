import HelpIcon from "@mui/icons-material/Help";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { SxProps, Theme } from "@mui/system";
import React, { FC } from "react";

import TagsAutocomplete from "../components/TagsAutocomplete";
import InstitutionsAutocomplete from "./InstitutionsAutocomplete";

const dataFilter = [
  "Oliver Hansen",
  "Van Henry",
  "April Tucker",
  "Ralph Hubbard",
  "Omar Alexander",
  "Carlos Abbott",
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Kelly Snyder"
];

type Props = {
  sx?: SxProps<Theme>;
  onTagsChange: (newValues: string[]) => void;
};

const HomeFilter: FC<Props> = ({ sx, onTagsChange }) => {
  const [tagsFilter, setTagsFilter] = React.useState<string[]>([]);
  const [institutionsFilter, setInstitutionsFilter] = React.useState<string[]>([]);
  const [filter, setFilter] = React.useState<string[]>([]);

  const handleChange = (_: React.SyntheticEvent, newValue: string[]) => {
    console.log("filter", filter);
    setFilter(newValue);
  };

  const handleTagsChange = (tags: string[]) => {
    setTagsFilter(tags);
    onTagsChange(tags);
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
          <InstitutionsAutocomplete value={institutionsFilter} setValue={setInstitutionsFilter} />
        </Grid>

        <Grid item xs={1}>
          <Autocomplete
            multiple
            id="tags-standard"
            options={dataFilter}
            getOptionLabel={option => option}
            onChange={handleChange}
            renderInput={params => <TextField {...params} variant="standard" label="Contributors" />}
          />
        </Grid>

        <Grid item xs={1}>
          <Autocomplete
            multiple
            id="tags-standard"
            options={dataFilter}
            getOptionLabel={option => option}
            onChange={handleChange}
            renderInput={params => <TextField {...params} variant="standard" label="Node Types" />}
          />
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
