import { NextApiRequest, NextApiResponse } from "next";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { clientTypesense } from "../../lib/typesense/typesense.config";
import { getQueryParameter } from "../../lib/utils";
import { ResponseAutocompleteReferencesFilter, TypesenseReferencesSchema } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteReferencesFilter>) {
  const q = getQueryParameter(req.query.q) || "";

  if (!q) return res.status(200).json({ results: [] });

  try {
    const searchParameters: SearchParams = { q, query_by: "title,label" };
    const searchResults = await clientTypesense
      .collections<TypesenseReferencesSchema>("references")
      .documents()
      .search(searchParameters);

    const references: TypesenseReferencesSchema[] = searchResults.hits?.map(el => el.document) || [];
    const response: ResponseAutocompleteReferencesFilter = {
      results: references
    };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get contributors" });
  }
}

export default handler;
