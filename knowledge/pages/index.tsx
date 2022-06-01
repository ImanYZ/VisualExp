import { Box, FormControl, MenuItem, Select, SelectChangeEvent, Stack, ToggleButton, Typography } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import HomeFilter from "../components/HomeFilter";
import HomeSearch from "../components/HomeSearch";
import MasonryNodes from "../components/MasonryNodes";
import PagesNavbar from "../components/PagesNavbar";
import { getSortedPostsData } from "../lib/nodes";
import { getQueryParameter, getQueryParameterAsNumber } from "../lib/utils";
import { KnowledgeNode, TypesenseNodesSchema } from "../src/knowledgeTypes";

const SortedByTimeOptions = ["This Week", "This Month", "This Year"];
const perPage = 10;

type Props = {
  data: KnowledgeNode[];
  page: number;
  numResults: number;
};

// const addQueryBy = ({ tags }: { tags?: string }) => {
//   const searchBy = [];
//   if (tags && tags.length > 0) {
//     searchBy.push("tags");
//   }
//   return searchBy.join(",");
// };

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const q = getQueryParameter(query.q) || "*";
  // const tags = getQueryParameter(query.tags);
  const page = getQueryParameterAsNumber(query.page);
  console.log("page", page);
  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.ONECADEMYCRED_TYPESENSE_HOST as string,
        port: parseInt(process.env.ONECADEMYCRED_TYPESENSE_PORT as string),
        protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL as string
      }
    ],
    apiKey: "xyz"
  });
  // const query_by = addQueryBy({ tags });
  const searchParameters: SearchParams = { q, query_by: "title,content", per_page: perPage, page };
  const searchResults = await client.collections<TypesenseNodesSchema>("nodes").documents().search(searchParameters);
  const nodeIds: string[] = searchResults.hits?.map(el => el.document.id) || [];
  console.log("nodeIds", nodeIds);
  const allPostsData = await getSortedPostsData(nodeIds);
  return {
    props: {
      data: allPostsData,
      page: searchResults.page,
      numResults: searchResults.found
    }
  };
};

const HomePage: NextPage<Props> = ({ data, page, numResults }) => {
  const router = useRouter();

  const [sortedByUpvotes, setSortedByUpvotes] = useState(false);
  const [sortedByTime, setSortedByTime] = useState(SortedByTimeOptions[1]);

  const handleSearch = (text: string) => {
    router.push({ query: { q: text } });
  };

  const handleSortBy = (event: SelectChangeEvent<string>) => {
    setSortedByTime(event.target.value);
  };

  const handleChangePage = (newPage: number) => {
    router.replace({ query: { ...router.query, page: newPage } });
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
        <MasonryNodes
          nodes={data}
          page={page}
          totalPages={Math.floor(numResults / perPage)}
          onChangePage={handleChangePage}
        />
      </Box>
    </PagesNavbar>
  );
};

export default HomePage;
