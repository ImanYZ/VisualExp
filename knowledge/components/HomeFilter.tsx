import { Box, Grid } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { SxProps, Theme } from "@mui/system";
import React, { FC } from "react";

const names = [
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
};

const HomeFilter: FC<Props> = ({ sx }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [personName, setPersonName] = React.useState<string[]>([]);

  const handleChange = (_, newValue: string[]) => {
    setPersonName(newValue);
  };

  return (
    <Box
      sx={{
        margin: "auto",
        padding: { xs: "15px", md: "45px" },
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
        sx={{ ...sx }}
      >
        <Grid item xs={1}>
          <Autocomplete
            multiple
            id="tags-standard"
            options={names}
            getOptionLabel={option => option}
            onChange={handleChange}
            renderInput={params => <TextField {...params} variant="standard" label="Tags" />}
          />
        </Grid>

        <Grid item xs={1}>
          <Autocomplete
            multiple
            id="tags-standard"
            options={names}
            getOptionLabel={option => option}
            onChange={handleChange}
            renderInput={params => <TextField {...params} variant="standard" label="Institutions" />}
          />
        </Grid>

        <Grid item xs={1}>
          <Autocomplete
            multiple
            id="tags-standard"
            options={names}
            getOptionLabel={option => option}
            onChange={handleChange}
            renderInput={params => <TextField {...params} variant="standard" label="Contributors" />}
          />
        </Grid>

        <Grid item xs={1}>
          <Autocomplete
            multiple
            id="tags-standard"
            options={names}
            getOptionLabel={option => option}
            onChange={handleChange}
            renderInput={params => <TextField {...params} variant="standard" label="Node Types" />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeFilter;
