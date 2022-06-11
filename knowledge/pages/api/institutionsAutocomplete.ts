import { firestore } from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { db } from "../../lib/admin";
import { getQueryParameter } from "../../lib/utils";
import { FilterValue, ResponseAutocompleteFilter } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteFilter>) {
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
    const searchParameters: SearchParams = { q, query_by: "name" };
    const searchResults = await client
      .collections<{ name: string; id: "string" }>("institutions")
      .documents()
      .search(searchParameters);
    const institutionsIds = searchResults.hits?.map(el => el.document.id);
    const institutionDocs = await db
      .collection("institutions")
      .where(firestore.FieldPath.documentId(), "in", institutionsIds)
      .get();

    const institutions: FilterValue[] | undefined = institutionDocs.docs.map(institutionDoc => {
      const institutionData = institutionDoc.data();
      const institutionFilter: FilterValue = {
        id: institutionDoc.id,
        imageUrl: institutionData.logoURL,
        name: institutionData.name
      };
      return institutionFilter;
    });

    const response: ResponseAutocompleteFilter = {
      results: institutions || []
    };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get institutions" });
  }
}

export default handler;
