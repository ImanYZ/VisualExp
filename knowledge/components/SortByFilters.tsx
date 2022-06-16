import { MenuItem, Select, SelectChangeEvent, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { FC } from "react";

import { SortedByTimeOptions } from "../lib/utils";
import { SortTypeWindowOption, TimeWindowOption } from "../src/knowledgeTypes";
import { ShareButtons } from "./ShareButtons";

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
      direction={{ xs: "column", md: "row" }}
      alignItems="center"
      justifyContent={{ xs: "center", sm: "space-between" }}
      sx={{
        width: "100%",
        padding: { xs: "0px 40px", md: "0px 0px" },
        marginBottom: { xs: "20px", md: "50px" }
      }}
    >
      <Stack
        direction={{ xs: "column-reverse", md: "row" }}
        gap="10px"
        sx={{
          width: "100%",
          padding: { xs: "20px 0px", md: "0px 0px" }
        }}
      >
        <ToggleButtonGroup value={sortedByType} exclusive onChange={handleSortByType} aria-label="Sort options">
          <ToggleButton size="large" value={SortTypeWindowOption.MOST_RECENT} aria-label="sort by the most recent">
            Most Recent
          </ToggleButton>
          <ToggleButton size="large" value={SortTypeWindowOption.UPVOTES_DOWNVOTES} aria-label="sort by upvotes">
            Most Helpful
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title="Only show the nodes that were updated in this last period." placement="top">
          <Select variant="standard" value={timeWindow} onChange={handleSortByTime}>
            {SortedByTimeOptions.map((sortedByTimeOption, idx) => (
              <MenuItem value={sortedByTimeOption} key={idx}>
                {sortedByTimeOption}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>
      </Stack>
      <ShareButtons showHelp />
    </Stack>
  );
};

export default SortByFilters;
