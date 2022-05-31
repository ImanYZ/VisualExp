import { Box, FormControl, MenuItem, Select, SelectChangeEvent, Stack, ToggleButton, Typography } from "@mui/material";
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

  const [sortedByUpvotes, setSortedByUpvotes] = useState(false);
  const [sortedByTime, setSortedByTime] = useState(SortedByTimeOptions[1]);

  const handleSearch = (text: string) => {
    router.push({ query: { q: text } });
  };

  const handleSortBy = (event: SelectChangeEvent<string>) => {
    setSortedByTime(event.target.value);
  };

  return (
    <PagesNavbar>
      <HomeSearch sx={{ mb: 1 }} onSearch={handleSearch}></HomeSearch>
      <HomeFilter></HomeFilter>
      <Box sx={{ maxWidth: "1180px", margin: "auto", pt: "50px" }}>
        <Stack
          direction="row"
          justifyContent="flex-start"
          flexWrap="wrap"
          alignItems="center"
          // spacing={2}
          sx={{ my: { xs: 1, md: 1 } }}
        >
          <Typography variant="h5" pr="10px" sx={{ fontSize: { xs: "14.5px", md: "20px" } }}>
            Sort by:
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap="10px"
            sx={{ width: { xs: "400px", md: "350px" } }}
          >
            <ToggleButton
              value="check"
              selected={sortedByUpvotes}
              size="small"
              onClick={() => setSortedByUpvotes(!sortedByUpvotes)}
              aria-label="list"
            >
              Upvotes
            </ToggleButton>
            <ToggleButton
              value="check"
              selected={sortedByUpvotes}
              size="small"
              onClick={() => setSortedByUpvotes(!sortedByUpvotes)}
              aria-label="list"
            >
              Most Recent
            </ToggleButton>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={sortedByTime}
                onChange={handleSortBy}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                size="small"
                sx={{ borderRadius: "40px", background: theme => theme.palette.common.white, fontSize: "12px" }}
              >
                {SortedByTimeOptions.map((SortedByTimeOption, idx) => (
                  <MenuItem value={SortedByTimeOption} key={idx}>
                    {SortedByTimeOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
        <MasonryNodes nodes={data} />
      </Box>
    </PagesNavbar>
  );
};

export default HomePage;
