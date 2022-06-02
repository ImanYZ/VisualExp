import HelpIcon from "@mui/icons-material/Help";
import { Box, Grid, IconButton } from "@mui/material";
import { styled } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { SxProps, Theme } from "@mui/system";
import React, { FC } from "react";

import TagsAutocomplete from "../components/TagsAutocomplete";
import ContributorsAutocomplete from "./ContributorsAutocomplete";
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
  onInstitutionsChange: (newValues: string[]) => void;
  onContributorsChange: (newValues: string[]) => void;
};

const HomeFilter: FC<Props> = ({ sx, onTagsChange, onInstitutionsChange, onContributorsChange }) => {
  const [tagsFilter, setTagsFilter] = React.useState<string[]>([]);
  const [institutionsFilter, setInstitutionsFilter] = React.useState<string[]>([]);
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

  return (
    <Box
      sx={{
        margin: "auto",
        padding: { xs: "10px 50px", lg: "45px 50px" },
        maxWidth: "1300px",
        border: "solid 2px",
        borderColor: theme => theme.palette.grey[200],
        borderRadius: 2
      }}
    >
      <Grid
        container
        spacing={{ xs: 1, md: 3 }}
        columns={{ xs: 1, sm: 2, md: 4 }}
        alignItems="flex-end"
        justifyContent="center"
        sx={{ ...sx, position: "relative" }}
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
          <Autocomplete
            multiple
            id="tags-standard"
            options={dataFilter}
            getOptionLabel={option => option}
            renderInput={params => <TextField {...params} variant="standard" label="Node Types" />}
          />
        </Grid>
        <StyledHelpButton color="primary" aria-label="help" size="small" title="Help">
          <HelpIcon />
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
  "&:hover": {
    color: theme.palette.common.orange
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
