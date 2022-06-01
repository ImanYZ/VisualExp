import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import { db } from "../lib/admin";
import { NodeFireStore, TypesenseNodesSchema } from "../src/knowledgeTypes";
import indexCollection from "./populateIndex";

const getUsersFromFirestore = async () => {
  let users: { name: string }[] = [];
  const usersDocs = await db.collection("users").get();
  for (let userDoc of usersDocs.docs) {
    const userData = userDoc.data();
    const name = `${userData.fname} ${userData.lName}`;
    users.push({ name });
  }

  return users;
};

const getInstitutionsFirestore = async () => {
  const institutionDocs = await db.collection("institutions").get();
  return institutionDocs.docs.map(institutionDoc => {
    const institutionData = institutionDoc.data();
    const institutionName: string = institutionData.name || "";
    return { id: institutionDoc.id, name: institutionName };
  });
};

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

const getNodeTags = (nodeData: NodeFireStore) => {
  const tags: string[] = [];
  if (nodeData.tagIds) {
    for (let tagIdx = 0; tagIdx < nodeData.tagIds.length; tagIdx++) {
      tags.push((nodeData.tags as string[])[tagIdx]);
    }
  } else {
    const tagsField = nodeData.tags as {
      node: string;
      title?: string;
    }[];
    for (let tag of tagsField) {
      if (tag.node && tag.title) {
        tags.push(tag.title);
      }
    }
  }
  return tags;
};

const getInstitutions = (nodeData: NodeFireStore) => {
  const institutions: string[] = [];
  const institObjs = Object.keys(nodeData.institutions || {});

  for (let name of institObjs) {
    institutions.push(name);
  }

  return institutions;
};

const getContributors = (nodeData: NodeFireStore): string[] => {
  const contributorsNodes = Object.entries(nodeData.contributors || {});

  const contributors = contributorsNodes.map(el => el[1].fullname || "").filter(el => el.length > 0);

  return contributors;
};

const getNodesFromFirestore = async () => {
  const importData: TypesenseNodesSchema[] = [];

  const nodeDocs = await db.collection("nodes").where("deleted", "==", false).limit(10000).get();
  for (let nodeDoc of nodeDocs.docs) {
    const nodeData = nodeDoc.data() as NodeFireStore;
    importData.push({
      id: nodeDoc.id,
      content: nodeData.content || "",
      title: nodeData.title || "",
      tags: getNodeTags(nodeData),
      institutions: getInstitutions(nodeData),
      contributors: getContributors(nodeData),
      corrects: nodeData.corrects || 0,
      updatedAt: nodeData.updatedAt?.toMillis() || 0,
      nodeType: nodeData.nodeType
    });
  }

  return importData;
};

const fillInstitutionsIndex = async (forceReIndex?: boolean) => {
  const data = await getInstitutionsFirestore();
  const fields: CollectionFieldSchema[] = [
    { name: "id", type: "string" },
    { name: "name", type: "string" }
  ];

  await indexCollection("institutions", fields, data, forceReIndex);
};

const fillUsersIndex = async (forceReIndex?: boolean) => {
  const data = await getUsersFromFirestore();
  const fields: CollectionFieldSchema[] = [{ name: "name", type: "string" }];

  await indexCollection("users", fields, data, forceReIndex);
};

const fillTagsIndex = async () => {
  const data = await getTagsFirestore();
  const fields: CollectionFieldSchema[] = [{ name: "name", type: "string" }];

  await indexCollection("tags", fields, data);
};

const fillNodesIndex = async () => {
  const data = await getNodesFromFirestore();

  const fields: CollectionFieldSchema[] = [
    { name: "id", type: "string" },
    { name: "content", type: "string" },
    { name: "title", type: "string" },
    { name: "tags", type: "string[]" },
    { name: "institutions", type: "string[]" },
    { name: "contributors", type: "string[]" },
    { name: "nodeType", type: "string" },
    { name: "corrects", type: "int32" },
    { name: "updatedAt", type: "int64" }
  ];

  await indexCollection("nodes", fields, data);
};

const main = async () => {
  console.log("Filling users index");
  await fillUsersIndex();
  console.log("End Filling nodes index");

  console.log("Filling institutions index");
  await fillInstitutionsIndex();
  console.log("End Filling institutions index");

  console.log("Filling tags index");
  await fillTagsIndex();
  console.log("End Filling tags index");

  console.log("Filling nodes index");
  await fillNodesIndex();
  console.log("End Filling nodes index");
};

main();
