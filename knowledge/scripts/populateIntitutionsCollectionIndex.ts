import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import { db } from "../lib/admin";
import { client } from "./typesence";

const getInstitutionsFirestore = async () => {
  const institutionDocs = await db.collection("institutions").get();
  return institutionDocs.docs.map(institutionDoc => {
    const institutionData = institutionDoc.data();
    const institutionName = institutionData.name;
    return { name: institutionName };
  });
};

const main = async () => {
  const fields: CollectionFieldSchema[] = [{ name: "name", type: "string" }];
  const schema = { name: "institutions", fields };

  const institutions = await getInstitutionsFirestore();

  let reindexNeeded = false;
  try {
    const collection = await client.collections("institutions").retrieve();
    if (collection.num_documents !== institutions.length) {
      reindexNeeded = true;
      await client.collections("institutions").delete();
    }
  } catch (e) {
    reindexNeeded = true;
  }

  if (!reindexNeeded) {
    return true;
  }

  console.log("Creating schema: ");
  console.log(JSON.stringify(schema, null, 2));
  await client.collections().create(schema);

  console.log("Adding records: ");

  // Bulk Import
  try {
    const returnData = await client.collections("institutions").documents().import(institutions);
    console.log(returnData);
    console.log("Done indexing.");

    const failedItems = returnData.filter(item => item.success === false);
    if (failedItems.length > 0) {
      throw new Error(`Error indexing items ${JSON.stringify(failedItems, null, 2)}`);
    }
    return returnData;
  } catch (error) {
    console.log(error);
  }
};

main();
