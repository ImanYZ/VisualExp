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
import { getInstitutionsForAutocomplete } from "../lib/institutions";
// import { getNodesByIds } from "../lib/nodes";
import { getContributorsForAutocomplete } from "../lib/users";
import {
  existValueInEnum,
  getQueryParameter,
  getQueryParameterAsBoolean,
  getQueryParameterAsNumber,
  SortedByTimeOptions
} from "../lib/utils";
import { FilterValue, SimpleNode, TimeWindowOption, TypesenseNodesSchema } from "../src/knowledgeTypes";

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
  upvotes: false,
  mostRecent: false,
  timeWindow: SortedByTimeOptions[2]
};

type Props = {
  data: SimpleNode[];
  page: number;
  numResults: number;
  contributorsFilter?: FilterValue[];
  institutionFilter?: FilterValue[];
};

const buildSortBy = (upvotes: boolean, mostRecent: boolean) => {
  if (upvotes) {
    return "corrects:desc";
  }
  if (mostRecent) {
    return "changedAtMillis:asc";
  }
  return "";
};

// const buildFirestoreSortBy = (upvotes: boolean, mostRecent: boolean) => {
//   if (upvotes) { return 'CORRECT' }
//   if (mostRecent) { return 'CHANGED_AT' }
//   return undefined
// };

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
  const institutionsSelected = await getInstitutionsForAutocomplete(institutions.split(","));
  const institutionNames = institutionsSelected.map(el => el.name).join(",");

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

  console.log("SORT:", upvotes, mostRecent, buildSortBy(upvotes, mostRecent));

  const searchParameters: SearchParams = {
    q,
    query_by: "title,content",
    sort_by: buildSortBy(upvotes, mostRecent),
    per_page: perPage,
    page,
    filter_by: buildFilterBy(timeWindow, tags, institutionNames, contributors, nodeTypes)
  };
  console.log("search params", searchParameters);
  const searchResults = await client.collections<TypesenseNodesSchema>("nodes").documents().search(searchParameters);

  console.log(
    "DATA",
    searchResults.hits
      ?.map(cur => cur.document)
      .map(cur => ({ title: cur.title.substring(0, 20), corrects: cur.corrects, changedAt: cur.changedAt }))
  );
  // console.log(data))
  // const nodeIds: string[] = searchResults.hits?.map(el => el.document.id) || [];
  // const allPostsData = await getSortedPostsData(nodeIds);
  // const allPostsData = await getNodesByIds(nodeIds, buildFirestoreSortBy(upvotes, mostRecent));
  const allPostsData = searchResults.hits?.map(
    (el): SimpleNode => ({
      id: el.document.id,
      title: el.document.title,
      changedAt: el.document.changedAt,
      content: el.document.content,
      nodeType: el.document.nodeType,
      nodeImage: el.document.nodeImage || "",
      corrects: el.document.corrects,
      wrongs: el.document.wrongs,
      tags: el.document.tags,
      contributors: el.document.contributors,
      institutions: el.document.institutions
    })
  );

  // console.log('data', allPostsData.map(cur => ({ name: cur.title?.substring(0, 20), corrects: cur.corrects, changedAt: cur.changedAt })))
  return {
    props: {
      data: allPostsData || [],
      page: searchResults.page,
      numResults: searchResults.found,
      contributorsFilter: contributorsSelected,
      institutionFilter: institutionsSelected
    }
  };
};

const HomePage: NextPage<Props> = ({ data, page, numResults, contributorsFilter, institutionFilter }) => {
  // console.log('data', data.map(cur => ({ name: cur.title?.substring(0, 20), corrects: cur.corrects, changedAt: cur.changedAt })))
  const [sortedByType, setSortedByType] = useState("");
  const [timeWindow, setTimeWindow] = useState(sortByDefaults.timeWindow);

  const router = useRouter();

  const handleSearch = (text: string) => {
    router.push({ query: { ...router.query, q: text } });
  };

  const handleChangePage = (newPage: number) => {
    router.push({ query: { ...router.query, page: newPage } });
  };

  const handleByType = (val: string) => {
    if (val === "most-recent") {
      router.push({ query: { ...router.query, mostRecent: true, upvotes: false } });
      return setSortedByType(val);
    }
    if (val === "upvotes-downvotes") {
      router.push({ query: { ...router.query, mostRecent: false, upvotes: true } });
      return setSortedByType(val);
    }
    router.push({ query: { ...router.query, mostRecent: false, upvotes: false } });
    setSortedByType("");
  };

  const handleChangeTimeWindow = (val: TimeWindowOption) => {
    router.push({ query: { ...router.query, timeWindow: val } });
    setTimeWindow(val);
  };

  const handleTagsChange = (tags: string[]) => {
    router.push({ query: { ...router.query, tags: tags.join(",") } });
  };

  const handleInstitutionsChange = (newValue: FilterValue[]) => {
    const institutions = newValue.map((el: FilterValue) => el.id);
    router.push({ query: { ...router.query, institutions: institutions.join(",") } });
  };

  const handleContributorsChange = (newValue: FilterValue[]) => {
    const contributors = newValue.map((el: FilterValue) => el.id);
    router.push({ query: { ...router.query, contributors: contributors.join(",") } });
  };

  const handleNodeTypesChange = (nodeTypes: string[]) => {
    router.push({ query: { ...router.query, nodeTypes: nodeTypes.join(",") } });
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
        institutions={institutionFilter}
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
