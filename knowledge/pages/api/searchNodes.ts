import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { getInstitutionsForAutocomplete } from "../../lib/institutions";
import { getTypesenseClient } from "../../lib/typesense/typesense.config";
import {
  getQueryParameter,
  getQueryParameterAsBoolean,
  getQueryParameterAsNumber,
  homePageSortByDefaults
} from "../../lib/utils";
import { SearchNodesResponse, SimpleNode, TimeWindowOption, TypesenseNodesSchema } from "../../src/knowledgeTypes";

const buildSortBy = (upvotes: boolean, mostRecent: boolean) => {
  if (upvotes) {
    return "mostHelpful:desc";
  }
  if (mostRecent) {
    return "changedAtMillis:desc";
  }
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

async function handler(req: NextApiRequest, res: NextApiResponse<SearchNodesResponse>) {
  const q = getQueryParameter(req.query.q) || "*";
  const upvotes = getQueryParameterAsBoolean(req.query.upvotes || String(homePageSortByDefaults.upvotes));
  const mostRecent = getQueryParameterAsBoolean(req.query.mostRecent || String(homePageSortByDefaults.mostRecent));
  const timeWindow: TimeWindowOption =
    (getQueryParameter(req.query.timeWindow) as TimeWindowOption) || homePageSortByDefaults.timeWindow;
  const tags = getQueryParameter(req.query.tags) || "";
  const institutions = getQueryParameter(req.query.institutions) || "";
  const contributors = getQueryParameter(req.query.contributors) || "";
  // const contributorsSelected = await getContributorsForAutocomplete(contributors.split(","));
  const institutionsSelected = await getInstitutionsForAutocomplete(institutions.split(","));
  const institutionNames = institutionsSelected.map(el => el.name).join(",");
  const reference = getQueryParameter(req.query.reference) || "";
  const label = getQueryParameter(req.query.label) || "";
  const nodeTypes = getQueryParameter(req.query.nodeTypes) || "";
  const page = getQueryParameterAsNumber(req.query.page);

  try {
    const client = getTypesenseClient();

    const searchParameters: SearchParams = {
      q,
      query_by: "title,content",
      sort_by: buildSortBy(upvotes, mostRecent),
      per_page: homePageSortByDefaults.perPage,
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

    res.status(200).json({
      data: allPostsData || [],
      page: searchResults.page,
      numResults: searchResults.found,
      perPage: homePageSortByDefaults.perPage
    });
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;
