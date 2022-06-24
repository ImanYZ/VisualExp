import { NextApiRequest, NextApiResponse } from "next";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { getQueryParameter } from "../../lib/utils";
import { ResponseAutocompleteTags, TypesenseNodesSchema } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteTags>) {
  const q = getQueryParameter(req.query.q) || "";

  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.ONECADEMYCRED_TYPESENSE_HOST as string,
        port: parseInt(process.env.ONECADEMYCRED_TYPESENSE_PORT as string),
        protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL as string
      }
    ],
    apiKey: process.env.ONECADEMYCRED_TYPESENSE_APIKEY as string
  });

  try {
    const searchParameters: SearchParams = { q, query_by: "title", filter_by: "isTag: true" };
    const searchResults = await client.collections<TypesenseNodesSchema>("nodes").documents().search(searchParameters);
    const tags = searchResults.hits?.map(el => el.document.title);
    res.status(200).json({ results: tags || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get tags" });
  }
}

export default handler;
