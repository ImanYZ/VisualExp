import { Container } from "@mui/material";
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
import { getContributorsForAutocomplete } from "../lib/users";
import {
  getQueryParameter,
  getQueryParameterAsBoolean,
  getQueryParameterAsNumber,
  SortedByTimeOptions
} from "../lib/utils";
import {
  FilterValue,
  SimpleNode,
  SortTypeWindowOption,
  TimeWindowOption,
  TypesenseNodesSchema
} from "../src/knowledgeTypes";

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
  timeWindow: SortedByTimeOptions[0]
};

type Props = {
  data: SimpleNode[];
  page: number;
  numResults: number;
  contributorsFilter?: FilterValue[];
  institutionFilter?: FilterValue[];
  filtersSelected: {
    mostRecent: boolean;
    upvotes: boolean;
    anyType: TimeWindowOption;
    reference: string;
    label: string;
  };
};

const buildSortBy = (upvotes: boolean, mostRecent: boolean) => {
  if (upvotes) return "corrects:desc";
  if (mostRecent) return "changedAtMillis:desc";
  return "";
};

const buildFilterBy = (
  timeWindow: TimeWindowOption,
  tags: string,
  institutions: string,
  contributors: string,
  nodeTypes: string,
  reference: string,
  label: string
) => {
  const filters: string[] = [];
  let updatedAt: number;
  if (timeWindow === TimeWindowOption.ThisWeek) {
    updatedAt = dayjs().subtract(1, "week").valueOf();
  } else if (timeWindow === TimeWindowOption.ThisMonth) {
    updatedAt = dayjs().subtract(1, "month").valueOf();
  } else if (timeWindow === TimeWindowOption.ThisYear) {
    updatedAt = dayjs().subtract(1, "year").valueOf();
  } else {
    updatedAt = dayjs().subtract(10, "year").valueOf();
  }

  filters.push(`changedAtMillis:>${updatedAt}`);

  if (tags.length > 0) filters.push(`tags: [${tags}]`);
  if (institutions.length > 0) filters.push(`institutionsNames: [${institutions}]`);
  if (contributors.length > 0) filters.push(`contributorsNames: [${contributors}]`);
  if (nodeTypes.length > 0) filters.push(`nodeType: [${nodeTypes}]`);
  if (reference) filters.push(`titlesReferences: ${reference}`);
  if (label && label !== "All Sections" && label !== "All Pages") filters.push(`labelsReferences: ${label}`);

  return filters.join("&& ");
};

const getTypesenseClient = () => {
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

  return client;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const q = getQueryParameter(query.q) || "*";
  const upvotes = getQueryParameterAsBoolean(query.upvotes) || sortByDefaults.upvotes;
  const mostRecent = getQueryParameterAsBoolean(query.mostRecent) || sortByDefaults.mostRecent;
  const timeWindow: TimeWindowOption =
    (getQueryParameter(query.timeWindow) as TimeWindowOption) || sortByDefaults.timeWindow;
  const tags = getQueryParameter(query.tags) || "";
  const institutions = getQueryParameter(query.institutions) || "";
  const contributors = getQueryParameter(query.contributors) || "";
  const contributorsSelected = await getContributorsForAutocomplete(contributors.split(","));
  const institutionsSelected = await getInstitutionsForAutocomplete(institutions.split(","));
  const institutionNames = institutionsSelected.map(el => el.name).join(",");
  const reference = getQueryParameter(query.reference) || "";
  const label = getQueryParameter(query.label) || "";
  const nodeTypes = getQueryParameter(query.nodeTypes) || "";
  const page = getQueryParameterAsNumber(query.page);

  const client = getTypesenseClient();

  const searchParameters: SearchParams = {
    q,
    query_by: "title,content",
    sort_by: buildSortBy(upvotes, mostRecent),
    per_page: perPage,
    page,
    filter_by: buildFilterBy(timeWindow, tags, institutionNames, contributors, nodeTypes, reference, label)
  };

  const searchResults = await client.collections<TypesenseNodesSchema>("nodes").documents().search(searchParameters);

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
      institutions: el.document.institutions,
      choices: el.document.choices || []
    })
  );
  return {
    props: {
      data: allPostsData || [],
      page: searchResults.page,
      numResults: searchResults.found,
      contributorsFilter: contributorsSelected,
      institutionFilter: institutionsSelected,
      filtersSelected: {
        mostRecent: mostRecent,
        upvotes: upvotes,
        anyType: timeWindow,
        reference,
        label
      }
    }
  };
};

const HomePage: NextPage<Props> = ({
  data,
  page,
  numResults,
  contributorsFilter,
  institutionFilter,
  filtersSelected
}) => {
  const getDefaultSortedByType = (filtersSelected: { mostRecent: boolean; upvotes: boolean }) => {
    if (filtersSelected.mostRecent) return SortTypeWindowOption.MOST_RECENT;
    if (filtersSelected.upvotes) return SortTypeWindowOption.UPVOTES_DOWNVOTES;
    return SortTypeWindowOption.NONE;
  };

  const [sortedByType, setSortedByType] = useState<SortTypeWindowOption>(getDefaultSortedByType(filtersSelected));
  const [timeWindow, setTimeWindow] = useState(filtersSelected.anyType || sortByDefaults.timeWindow);

  const router = useRouter();

  const handleSearch = (text: string) => {
    router.push({ query: { ...router.query, q: text } });
  };

  const handleChangePage = (newPage: number) => {
    router.push({ query: { ...router.query, page: newPage } });
  };

  const handleByType = (val: SortTypeWindowOption) => {
    if (val === SortTypeWindowOption.MOST_RECENT) {
      router.push({ query: { ...router.query, mostRecent: true, upvotes: false } });
      return setSortedByType(val);
    }
    if (val === SortTypeWindowOption.UPVOTES_DOWNVOTES) {
      router.push({ query: { ...router.query, mostRecent: false, upvotes: true } });
      return setSortedByType(val);
    }
    router.push({ query: { ...router.query, mostRecent: false, upvotes: false } });
    setSortedByType(SortTypeWindowOption.NONE);
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

  const handleReferencesChange = (title: string, label: string) => {
    router.push({ query: { ...router.query, reference: title, label } });
  };

  const reference = (): { title: string; label: string } | null => {
    if (!filtersSelected.reference) return null;
    return { title: filtersSelected.reference, label: filtersSelected.label };
  };

  return (
    <PagesNavbar
      headingComponent={
        <HomeSearchContainer sx={{ mt: "var(--navbar-height)" }} onSearch={handleSearch}></HomeSearchContainer>
      }
    >
      <HomeFilter
        onTagsChange={handleTagsChange}
        onInstitutionsChange={handleInstitutionsChange}
        onContributorsChange={handleContributorsChange}
        onNodeTypesChange={handleNodeTypesChange}
        onReferencesChange={handleReferencesChange}
        contributors={contributorsFilter}
        institutions={institutionFilter}
        reference={reference()}
      ></HomeFilter>
      <Container sx={{ pt: 10 }}>
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
      </Container>
    </PagesNavbar>
  );
};

export default HomePage;
