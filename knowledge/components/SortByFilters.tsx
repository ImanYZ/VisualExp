import {
  FormControl,
  InputLabel,
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
import { TimeWindowOption } from "../src/knowledgeTypes";
import { ShareButtons } from "./ShareButtons";

type Props = {
  sortedByType: string;
  handleByType: (val: string) => void;
  timeWindow: string;
  onTimeWindowChanged: (val: TimeWindowOption) => void;
};

const SortByFilters: FC<Props> = ({ sortedByType, handleByType, timeWindow, onTimeWindowChanged }) => {
  const handleSortByTime = (event: SelectChangeEvent<string>) => {
    onTimeWindowChanged(event.target.value as TimeWindowOption);
  };

  const handleSortByType = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    handleByType(newAlignment || "");
  };

  return (
    <Stack
      direction={{ xs: "column-reverse", md: "row" }}
      alignItems="center"
      justifyContent={{ xs: "center", sm: "space-between" }}
      gap="10px"
      sx={{
        width: "100%",
        padding: { xs: "0px 40px", md: "0px 0px" },
        marginBottom: "50px"
      }}
    >
      <>
        <ToggleButtonGroup
          value={sortedByType}
          exclusive
          onChange={handleSortByType}
          aria-label="Sort options"
          fullWidth
        >
          <ToggleButton value="most-recent" aria-label="sort by the most recent">
            Most Recent
          </ToggleButton>
          <ToggleButton value="upvotes-downvotes" aria-label="sort by upvotes">
            Upvotes - Downvotes
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title="Only show the nodes that were updated in this last period." placement="top">
          <FormControl variant="filled" sx={{ m: 1, width: "100%" }} size="small">
            <InputLabel id="any-time-label">Any Time</InputLabel>
            <Select labelId="any-time-label" id="any-time" value={timeWindow} onChange={handleSortByTime}>
              {SortedByTimeOptions.map((sortedByTimeOption, idx) => (
                <MenuItem value={sortedByTimeOption} key={idx}>
                  {sortedByTimeOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
      </>
      <ShareButtons />
    </Stack>
  );
};

export default SortByFilters;
