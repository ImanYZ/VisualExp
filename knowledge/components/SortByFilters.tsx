import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from "@mui/material";
import { FC } from "react";

import { SortedByTimeOptions } from "../lib/utils";
import { SortTypeWindowOption, TimeWindowOption } from "../src/knowledgeTypes";

type Props = {
  sortedByType: SortTypeWindowOption;
  handleByType: (val: SortTypeWindowOption) => void;
  timeWindow: string;
  onTimeWindowChanged: (val: TimeWindowOption) => void;
};

const SortByFilters: FC<Props> = ({ sortedByType, handleByType, timeWindow, onTimeWindowChanged }) => {
  const handleSortByTime = (event: SelectChangeEvent<string>) => {
    onTimeWindowChanged(event.target.value as TimeWindowOption);
  };

  const handleSortByType = (event: React.MouseEvent<HTMLElement>, newAlignment: SortTypeWindowOption | null) => {
    handleByType(newAlignment || SortTypeWindowOption.NONE);
  };

  return (
    <Stack
      direction={{ xs: "column-reverse", md: "row" }}
      alignItems="center"
      justifyContent={{ xs: "center", sm: "space-between" }}
      gap="10px"
      sx={{
        width: { xs: "100%", md: "750px" },
        py: { xs: 0, md: 0 },
        px: { xs: 8, md: 0 },
        marginBottom: "50px"
      }}
    >
      <ToggleButtonGroup value={sortedByType} exclusive onChange={handleSortByType} aria-label="Sort options" fullWidth>
        <ToggleButton value={SortTypeWindowOption.MOST_RECENT} aria-label="sort by the most recent">
          Most Recent
        </ToggleButton>
        <ToggleButton value={SortTypeWindowOption.UPVOTES_DOWNVOTES} aria-label="sort by upvotes">
          Upvotes - Downvotes
        </ToggleButton>
      </ToggleButtonGroup>

      <Tooltip title="Only show the nodes that were updated in this last period." placement="top">
        <FormControl variant="standard" sx={{ m: 1, width: "100%" }} size="small">
          <Select labelId="any-time-label" id="any-time" value={timeWindow} onChange={handleSortByTime}>
            {SortedByTimeOptions.map((sortedByTimeOption, idx) => (
              <MenuItem value={sortedByTimeOption} key={idx}>
                {sortedByTimeOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>
    </Stack>
  );
};

export default SortByFilters;
