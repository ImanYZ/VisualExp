import { firestore } from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { db } from "../../lib/admin";
import { getQueryParameter } from "../../lib/utils";
import { ResponseAutocompleteInstitutions } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteInstitutions>) {
  const q = getQueryParameter(req.query.q) || "";

  if (!q) {
    res.status(200).json({ results: [] });
  }
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

    const institutions = institutionDocs.docs.map(institutionDoc => {
      const institutionData = institutionDoc.data();
      return {
        logoUrl: institutionData.logoURL,
        name: institutionData.name
      };
    });

    res.status(200).json({ results: institutions || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get institutions" });
  }
}

export default handler;
