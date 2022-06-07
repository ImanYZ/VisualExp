import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import { db } from "../lib/admin";
import { NodeFireStore, TypesenseNodesSchema } from "../src/knowledgeTypes";
import indexCollection from "./populateIndex";

const getUsersFromFirestore = async () => {
  let users: { name: string; username: string; imageUrl: string }[] = [];
  const usersDocs = await db.collection("users").get();
  for (let userDoc of usersDocs.docs) {
    const userData = userDoc.data();
    const name = `${userData.fName || ""} ${userData.lName || ""}`;
    users.push({ name, username: userDoc.id, imageUrl: userData.imageUrl });
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
  const tagDocs = await db.collection("nodes").where("isTag", "==", true).get();
  for (let tagDoc of tagDocs.docs) {
    const tagData = tagDoc.data();
    tags = Array.from(new Set([...tags, tagData.title]));
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

const getInstitutionsName = (nodeData: NodeFireStore) => {
  const institutions: string[] = [];
  const institObjs = Object.keys(nodeData.institutions || {});

  for (let name of institObjs) {
    institutions.push(name);
  }

  return institutions;
};

const getContributorsName = (nodeData: NodeFireStore): string[] => {
  const contributorsNodes = Object.entries(nodeData.contributors || {});

  const contributors = contributorsNodes.map(el => el[0]);
  return contributors;
};

const getNodesFromFirestore = async (): Promise<TypesenseNodesSchema[]> => {
  const getContributorsFromNode = (nodeData: NodeFireStore) => {
    return Object.entries(nodeData.contributors || {})
      .map(cur => cur[1] as { fullname: string; imageUrl: string; reputation: number })
      .sort((a, b) => (b.reputation = a.reputation))
      .map(contributor => ({ fullName: contributor.fullname, imageUrl: contributor.imageUrl }));
  };

  const getInstitutionsFromNode = (nodeData: NodeFireStore) => {
    return Object.entries(nodeData.institutions || {})
      .map(cur => ({ name: cur[0], reputation: cur[1].reputation || 0 }))
      .sort((a, b) => b.reputation - a.reputation)
      .map(institution => ({ name: institution.name }));
  };

  const nodeDocs = await db.collection("nodes").get();

  return nodeDocs.docs.map((nodeDoc): TypesenseNodesSchema => {
    const nodeData = nodeDoc.data() as NodeFireStore;
    const contributors = getContributorsFromNode(nodeData);
    const contributorsNames = getContributorsName(nodeData);
    const institutions = getInstitutionsFromNode(nodeData);
    const institutionsNames = getInstitutionsName(nodeData);
    const tags = getNodeTags(nodeData);

    return {
      changedAt: nodeData.changedAt.toDate().toISOString(),
      changedAtMillis: nodeData.changedAt?.toMillis() || 0,
      choices: nodeData.choices,
      content: nodeData.content || "",
      contributors,
      contributorsNames,
      corrects: nodeData.corrects || 0,
      id: nodeDoc.id,
      institutions,
      institutionsNames,
      nodeImage: nodeData.nodeImage,
      nodeType: nodeData.nodeType,
      tags,
      title: nodeData.title || "",
      updatedAt: nodeData.updatedAt?.toMillis() || 0,
      wrongs: nodeData.wrongs || 0
    };
  });

  // for (let nodeDoc of nodeDocs.docs) {
  //   const nodeData = nodeDoc.data() as NodeFireStore;
  //   if (!nodeData.deleted) {
  //     importData.push({
  //       id: nodeDoc.id,
  //       content: nodeData.content || "",
  //       title: nodeData.title || "",
  //       tags: getNodeTags(nodeData),
  //       institutions: getInstitutions(nodeData),
  //       contributors: getContributors(nodeData),
  //       corrects: nodeData.corrects || 0,
  //       wrongs: nodeData.wrongs || 0,
  //       changedAt: nodeData.changedAt.toDate().toISOString() || '',
  //       changedAtMillis: nodeData.changedAt?.toMillis() || 0,
  //       nodeType: nodeData.nodeType
  //     });
  //   }
  // }

  // return importData;
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
  const fields: CollectionFieldSchema[] = [
    { name: "username", type: "string" },
    { name: "name", type: "string" },
    { name: "imageUrl", type: "string" }
  ];
  await indexCollection("users", fields, data, forceReIndex);
};

const fillTagsIndex = async (forceReIndex?: boolean) => {
  const data = await getTagsFirestore();
  const fields: CollectionFieldSchema[] = [{ name: "name", type: "string" }];

  await indexCollection("tags", fields, data, forceReIndex);
};

const fillNodesIndex = async (forceReIndex?: boolean) => {
  const data = await getNodesFromFirestore();
  const fields: CollectionFieldSchema[] = [
    { name: "changedAtMillis", type: "int64" },
    { name: "content", type: "string" },
    { name: "contributorsNames", type: "string[]" },
    { name: "corrects", type: "int32" },
    { name: "institutionsNames", type: "string[]" },
    { name: "nodeType", type: "string" },
    { name: "tags", type: "string[]" },
    { name: "title", type: "string" }
  ];

  await indexCollection("nodes", fields, data, forceReIndex);
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
  await fillNodesIndex(true);
  console.log("End Filling nodes index");
};

main();
