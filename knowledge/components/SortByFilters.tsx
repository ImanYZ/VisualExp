import { FormControl, MenuItem, Select, SelectChangeEvent, Stack, ToggleButton, Typography } from "@mui/material";
import { FC } from "react";

import { SortedByTimeOptions } from "../lib/utils";

type Props = {
  upvotes: boolean;
  mostRecent: boolean;
  timeWindow: string;
  onUpvotesClicked: () => void;
  onMostRecentClicked: () => void;
  onTimeWindowChanged: (val: string) => void;
};

const SortByFilters: FC<Props> = ({
  upvotes,
  mostRecent,
  timeWindow,
  onUpvotesClicked,
  onMostRecentClicked,
  onTimeWindowChanged
}) => {
  const handleSortBy = (event: SelectChangeEvent<string>) => {
    onTimeWindowChanged(event.target.value);
  };

  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      flexWrap="wrap"
      alignItems="center"
      sx={{ my: { xs: 1, md: 1 } }}
    >
      <Typography variant="h5" pr="10px" sx={{ fontSize: { xs: "14px", md: "20px" } }}>
        Sort by:
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap="10px"
        sx={{ width: { xs: "400px", md: "350px" } }}
      >
        <ToggleButton value="check" selected={upvotes} size="small" onClick={onUpvotesClicked} aria-label="list">
          Upvotes
        </ToggleButton>
        <ToggleButton value="check" selected={mostRecent} size="small" onClick={onMostRecentClicked} aria-label="list">
          Most Recent
        </ToggleButton>
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={timeWindow}
            onChange={handleSortBy}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            size="small"
            sx={{ borderRadius: "40px", background: theme => theme.palette.common.white, fontSize: "12px" }}
          >
            {SortedByTimeOptions.map((sortedByTimeOption, idx) => (
              <MenuItem value={sortedByTimeOption} key={idx}>
                {sortedByTimeOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
};

export default SortByFilters;
