import { Box } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import HomeFilter from "../components/HomeFilter";
import HomeSearch from "../components/HomeSearch";
import MasonryNodes from "../components/MasonryNodes";
import PagesNavbar from "../components/PagesNavbar";
import SortByFilters from "../components/SortByFilters";
import { getSortedPostsData } from "../lib/nodes";
import {
  getQueryParameter,
  getQueryParameterAsBoolean,
  getQueryParameterAsNumber,
  SortedByTimeOptions
} from "../lib/utils";
import { KnowledgeNode, TypesenseNodesSchema } from "../src/knowledgeTypes";

const perPage = 10;

export const sortByDefaults = {
  upvotes: true,
  mostRecent: true,
  timeWindow: SortedByTimeOptions[1]
};

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

const buildSortBy = (upvotes: boolean, mostRecent: boolean) => {
  return `corrects:${!upvotes ? "asc" : "desc"}, updatedAt:${!mostRecent ? "asc" : "desc"}`;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const q = getQueryParameter(query.q) || "*";
  const upvotes = getQueryParameterAsBoolean(query.upvotes) || sortByDefaults.upvotes;
  const mostRecent = getQueryParameterAsBoolean(query.mostRecent) || sortByDefaults.mostRecent;
  // const timeWindow = getQueryParameter(query.timeWindow) || sortByDefaults.timeWindow;
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
  const searchParameters: SearchParams = {
    q,
    query_by: "title,content",
    per_page: perPage,
    page,
    sort_by: buildSortBy(upvotes, mostRecent)
  };
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
  const [sortedByUpvotes, setSortedByUpvotes] = useState(sortByDefaults.upvotes);
  const [sortedByMostRecent, setSortedByMostRecent] = useState(sortByDefaults.mostRecent);
  const [timeWindow, setTimeWindow] = useState(sortByDefaults.timeWindow);

  const router = useRouter();

  const handleSearch = (text: string) => {
    router.push({ query: { q: text } });
  };

  const handleChangePage = (newPage: number) => {
    router.replace({ query: { ...router.query, page: newPage } });
  };

  const handleChangeUpvotes = () => {
    router.replace({ query: { ...router.query, upvotes: !sortedByUpvotes } });
    setSortedByUpvotes(!sortedByUpvotes);
  };

  const handleChangeMostRecent = () => {
    router.replace({ query: { ...router.query, mostRecent: !sortedByMostRecent } });
    setSortedByMostRecent(!sortedByMostRecent);
  };

  const handleChangeTimeWindow = (val: string) => {
    router.replace({ query: { ...router.query, timeWindow: val } });
    setTimeWindow(val);
  };

  return (
    <PagesNavbar>
      <HomeSearch sx={{ mb: 1 }} onSearch={handleSearch}></HomeSearch>
      <HomeFilter></HomeFilter>
      <Box sx={{ maxWidth: "1180px", margin: "auto", pt: "50px" }}>
        <SortByFilters
          upvotes={sortedByUpvotes}
          mostRecent={sortedByMostRecent}
          timeWindow={timeWindow}
          onUpvotesClicked={handleChangeUpvotes}
          onMostRecentClicked={handleChangeMostRecent}
          onTimeWindowChanged={handleChangeTimeWindow}
        />
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
