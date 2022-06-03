import { Box } from "@mui/material";
import dayjs from "dayjs";
import { GetServerSideProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { ComponentType, useState } from "react";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import PagesNavbar from "../components/PagesNavbar";
import SortByFilters from "../components/SortByFilters";
import { getSortedPostsData } from "../lib/nodes";
import { getContributorsForAutocomplete } from "../lib/users";
import {
  existValueInEnum,
  getQueryParameter,
  getQueryParameterAsBoolean,
  getQueryParameterAsNumber,
  SortedByTimeOptions
} from "../lib/utils";
import { ContributorValue, KnowledgeNode, TimeWindowOption, TypesenseNodesSchema } from "../src/knowledgeTypes";

const perPage = 10;

export const HomeSearchContainer: ComponentType<any> = dynamic(
  () => import("../components/HomeSearch").then(m => m.HomeSearch),
  { ssr: false }
);

export const HomeFilter: ComponentType<any> = dynamic(() => import("../components/HomeFilter").then(m => m.default), {
  ssr: false
});

const MasonryNodes: ComponentType<any> = dynamic(
  () => import("../components/MasonryNodes").then(m => m.TrendingNodes),
  { ssr: false }
);

export const sortByDefaults = {
  upvotes: true,
  mostRecent: true,
  timeWindow: SortedByTimeOptions[2]
};

type Props = {
  data: KnowledgeNode[];
  page: number;
  numResults: number;
  contributorsFilter?: ContributorValue[];
};

const buildSortBy = (upvotes: boolean, mostRecent: boolean) => {
  return `corrects:${!upvotes ? "asc" : "desc"}, updatedAt:${!mostRecent ? "asc" : "desc"}`;
};

const buildFilterBy = (
  timeWindow: TimeWindowOption,
  tags: string,
  institutions: string,
  contributors: string,
  nodeTypes: string
) => {
  const filters: string[] = [];
  let updatedAt: number = dayjs().subtract(1, "year").valueOf();
  if (timeWindow === TimeWindowOption.ThisWeek) {
    updatedAt = dayjs().subtract(1, "week").valueOf();
  } else if (timeWindow === TimeWindowOption.ThisMonth) {
    updatedAt = dayjs().subtract(1, "month").valueOf();
  }

  filters.push(`updatedAt:>${updatedAt}`);
  if (tags.length > 0) {
    filters.push(`tags: [${tags}]`);
  }
  if (institutions.length > 0) {
    filters.push(`institutions: [${institutions}]`);
  }
  if (contributors.length > 0) {
    filters.push(`contributors: [${contributors}]`);
  }
  if (nodeTypes.length > 0) {
    filters.push(`nodeType: [${nodeTypes}]`);
  }

  return filters.join("&& ");
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const q = getQueryParameter(query.q) || "*";
  const upvotes = getQueryParameterAsBoolean(query.upvotes) || sortByDefaults.upvotes;
  const mostRecent = getQueryParameterAsBoolean(query.mostRecent) || sortByDefaults.mostRecent;
  const timeWindow: TimeWindowOption = existValueInEnum(TimeWindowOption, getQueryParameter(query.timeWindow))
    ? (getQueryParameter(query.timeWindow) as TimeWindowOption)
    : sortByDefaults.timeWindow;
  const tags = getQueryParameter(query.tags) || "";
  const institutions = getQueryParameter(query.institutions) || "";
  const contributors = getQueryParameter(query.contributors) || "";
  const contributorsSelected = await getContributorsForAutocomplete(contributors.split(","));

  const nodeTypes = getQueryParameter(query.nodeTypes) || "";
  const page = getQueryParameterAsNumber(query.page);
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
  const searchParameters: SearchParams = {
    q,
    query_by: "title,content",
    per_page: perPage,
    page,
    sort_by: buildSortBy(upvotes, mostRecent),
    filter_by: buildFilterBy(timeWindow, tags, institutions, contributors, nodeTypes)
  };
  const searchResults = await client.collections<TypesenseNodesSchema>("nodes").documents().search(searchParameters);
  const nodeIds: string[] = searchResults.hits?.map(el => el.document.id) || [];
  const allPostsData = await getSortedPostsData(nodeIds);

  return {
    props: {
      data: allPostsData,
      page: searchResults.page,
      numResults: searchResults.found,
      contributorsFilter: contributorsSelected
    }
  };
};

const HomePage: NextPage<Props> = ({ data, page, numResults, contributorsFilter }) => {
  const [sortedByType, setSortedByType] = useState("");
  const [timeWindow, setTimeWindow] = useState(sortByDefaults.timeWindow);

  const router = useRouter();

  const handleSearch = (text: string) => {
    router.push({ query: { ...router.query, q: text } });
  };

  const handleChangePage = (newPage: number) => {
    router.replace({ query: { ...router.query, page: newPage } });
  };

  const handleByType = (val: string) => {
    if (val === "most-recent") {
      router.replace({ query: { ...router.query, mostRecent: true, upvotes: false } });
      return setSortedByType(val);
    }
    if (val === "upvotes-downvotes") {
      router.replace({ query: { ...router.query, mostRecent: false, upvotes: true } });
      return setSortedByType(val);
    }
    router.replace({ query: { ...router.query, mostRecent: false, upvotes: false } });
    setSortedByType("");
  };

  const handleChangeTimeWindow = (val: TimeWindowOption) => {
    router.replace({ query: { ...router.query, timeWindow: val } });
    setTimeWindow(val);
  };

  const handleTagsChange = (tags: string[]) => {
    router.replace({ query: { ...router.query, tags: tags.join(",") } });
  };

  const handleInstitutionsChange = (institutions: string[]) => {
    router.replace({ query: { ...router.query, institutions: institutions.join(",") } });
  };

  const handleContributorsChange = (contributors: string[]) => {
    router.replace({ query: { ...router.query, contributors: contributors.join(",") } });
  };

  const handleNodeTypesChange = (nodeTypes: string[]) => {
    router.replace({ query: { ...router.query, nodeTypes: nodeTypes.join(",") } });
  };

  return (
    <PagesNavbar
      headingComponent={<HomeSearchContainer sx={{ mt: "72px" }} onSearch={handleSearch}></HomeSearchContainer>}
    >
      <HomeFilter
        sx={{ maxWidth: "1180px", margin: "auto" }}
        onTagsChange={handleTagsChange}
        onInstitutionsChange={handleInstitutionsChange}
        onContributorsChange={handleContributorsChange}
        onNodeTypesChange={handleNodeTypesChange}
        contributors={contributorsFilter}
      ></HomeFilter>
      <Box sx={{ maxWidth: "1180px", margin: "auto", pt: "50px" }}>
        <SortByFilters
          sortedByType={sortedByType}
          handleByType={handleByType}
          timeWindow={timeWindow}
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
