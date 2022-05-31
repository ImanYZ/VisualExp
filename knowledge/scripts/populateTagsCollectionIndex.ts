import Typesense from "typesense";
import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import { db } from "../lib/admin";
import config from "./typesenseConfig";

const getTagsFirestore = async () => {
  let tags: string[] = [];
  const tagDocs = await db.collection("tags").get();
  for (let tagDoc of tagDocs.docs) {
    const tagData = tagDoc.data();
    const tagsArr = tagData.tags;
    tags = Array.from(new Set(tags.concat(tagsArr)));
  }
  const tagsObjArr = tags.map((el: string) => ({ name: el }));

  return tagsObjArr;
};

const main = async () => {
  const client = new Typesense.Client({
    nodes: [
      {
        host: config.host,
        port: config.port,
        protocol: config.protocol
      }
    ],
    apiKey: "xyz"
  });

  const fields: CollectionFieldSchema[] = [{ name: "name", type: "string" }];
  const schema = {
    name: "tags",
    fields
  };

  console.log("Populating tags index in Typesense");

  const tags = await getTagsFirestore();

  let reindexNeeded = false;
  try {
    const collection = await client.collections("tags").retrieve();
    console.log("Found existing schema: Tags");
    if (collection.num_documents !== tags.length) {
      console.log("Deleting existing schema");
      reindexNeeded = true;
      await client.collections("tags").delete();
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
    const returnData = await client.collections("tags").documents().import(tags);
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
