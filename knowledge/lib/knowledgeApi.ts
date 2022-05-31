import axios from "axios";

import { ResponseAutocompleteTags } from "../src/knowledgeTypes";

export const getTagsAutocomplete = async (tagName: string): Promise<ResponseAutocompleteTags> => {
  const response = await axios.get("/knowledge/api/tagsAutocomplete", { params: { q: tagName } });
  return response.data;
};
