import axios from "axios";

import { ResponseAutocompleteInstitutions, ResponseAutocompleteTags } from "../src/knowledgeTypes";

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
