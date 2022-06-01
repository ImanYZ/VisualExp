import {
  Box,
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
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import HomeFilter from "../components/HomeFilter";
import HomeSearch from "../components/HomeSearch";
import MasonryNodes from "../components/MasonryNodes";
import PagesNavbar from "../components/PagesNavbar";
import { getSortedPostsData } from "../lib/nodes";
import { KnowledgeNode } from "../src/knowledgeTypes";

const SortedByTimeOptions = ["This Week", "This Month", "This Year"];

type Props = {
  data: KnowledgeNode[];
};

export const getServerSideProps: GetServerSideProps<Props> = async ({}) => {
  const allPostsData = await getSortedPostsData();
  return {
    props: {
      data: allPostsData
    }
  };
};

const HomePage: NextPage<Props> = ({ data }) => {
  const router = useRouter();

  const [filterByType, setFilterByType] = useState(() => ["most-Recent", "italic"]);
  const [sortedByTime, setSortedByTime] = useState(SortedByTimeOptions[1]);

  const handleFormat = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
    setFilterByType(newFormats);
  };

  const handleSearch = (text: string) => {
    router.push({ query: { q: text } });
  };

  const handleSortByTime = (event: SelectChangeEvent<string>) => {
    setSortedByTime(event.target.value);
  };

  return (
    <PagesNavbar headingComponent={<HomeSearch sx={{ mt: "72px" }} onSearch={handleSearch}></HomeSearch>}>
      <HomeFilter sx={{ maxWidth: "1180px", margin: "auto" }}></HomeFilter>
      <Box sx={{ maxWidth: "1180px", margin: "auto", pt: "50px" }}>
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          alignItems="center"
          justifyContent={{ xs: "center", sm: "space-between" }}
          gap="10px"
          sx={{
            width: { xs: "100%", md: "750px" },
            padding: { xs: "0px 40px", md: "0px 0px" },
            marginBottom: "50px"
          }}
        >
          <ToggleButtonGroup
            value={filterByType}
            exclusive
            onChange={handleFormat}
            aria-label="text formatting"
            fullWidth
          >
            <ToggleButton value="most-Recent" aria-label="bold">
              Most Recent
            </ToggleButton>
            <ToggleButton value="upvotes-downvotes" aria-label="italic">
              Upvotes - Downvotes
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Only show the nodes that were updated in this last period." placement="top">
            <FormControl variant="filled" sx={{ m: 1, width: "100%" }} size="small">
              <InputLabel id="any-time-label">Any Time</InputLabel>
              <Select labelId="any-time-label" id="any-time" value={sortedByTime} onChange={handleSortByTime}>
                {SortedByTimeOptions.map((SortedByTimeOption, idx) => (
                  <MenuItem value={SortedByTimeOption} key={idx}>
                    {SortedByTimeOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Tooltip>
        </Stack>
        <MasonryNodes nodes={data} />
      </Box>
    </PagesNavbar>
  );
};

export default HomePage;
