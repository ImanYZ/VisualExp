import axios from "axios";

import {
  ResponseAutocompleteContributors,
  ResponseAutocompleteInstitutions,
  ResponseAutocompleteTags
} from "../src/knowledgeTypes";

export const getTagsAutocomplete = async (tagName: string): Promise<ResponseAutocompleteTags> => {
  const response = await axios.get("/knowledge/api/tagsAutocomplete", { params: { q: tagName } });
  return response.data;
};

export const getInstitutionsAutocomplete = async (
  institutionName: string
): Promise<ResponseAutocompleteInstitutions> => {
  const response = await axios.get("/knowledge/api/institutionsAutocomplete", { params: { q: institutionName } });
  return response.data;
};

export const getContributorsAutocomplete = async (
  contributorName: string
): Promise<ResponseAutocompleteContributors> => {
  const response = await axios.get("/knowledge/api/contributorsAutocomplete", { params: { q: contributorName } });
  return response.data;
};
