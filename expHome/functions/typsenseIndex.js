const { db } = require("./admin_Knowledge");
const Typesense = require("typesense");

require("dotenv").config();

const indexCollection = async (
  indexName,
  fields,
  dataToImport,
  forceReIndex
) => {
  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.ONECADEMYCRED_TYPESENSE_HOST,
        port: process.env.ONECADEMYCRED_TYPESENSE_PORT,
        protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL,
      },
    ],
    connectionTimeoutSeconds: 1000,
    apiKey: process.env.ONECADEMYCRED_TYPESENSE_APIKEY,
  });

  const schema = {
    name: indexName,
    fields,
  };

  let reindexNeeded = false;
  try {
    const collection = await client.collections(indexName).retrieve();
    if (collection.num_documents !== dataToImport.length || forceReIndex) {
      reindexNeeded = true;
      await client.collections(indexName).delete();
    }
  } catch (e) {
    reindexNeeded = true;
  }

  if (!reindexNeeded) {
    return true;
  }

  await client.collections().create(schema);

  // Bulk Import
  try {
    const returnData = await client
      .collections(indexName)
      .documents()
      .import(dataToImport);
    const failedItems = returnData.filter((item) => item.success === false);
    if (failedItems.length > 0) {
      throw new Error(
        `Error indexing items ${JSON.stringify(failedItems, null, 2)}`
      );
    }
    return returnData;
  } catch (error) {
    console.log(error);
  }
};

const getNodeReferences = (nodeData) => {
  const references = [];
  if (!nodeData.references || nodeData.references.length === 0) {
    return [];
  }
  //The "references" field in the DB can be an array ofra objects or an array of strings
  if (typeof (nodeData.references || [])[0] !== "object") {
    //In this case the field is an array of strings
    const referenceIds = nodeData.referenceIds || [];
    for (let refIdx = 0; refIdx < referenceIds.length; refIdx++) {
      const referenceLabels = nodeData.referenceLabels || [];
      references.push({
        node: referenceIds[refIdx],
        title: nodeData.references[refIdx],
        label: referenceLabels[refIdx] || "",
      });
    }
  } else {
    //In this case the field is an array of objects
    const referencesField = nodeData.references;
    for (let reference of referencesField) {
      if (reference.node && reference.title) {
        references.push({
          node: reference.node,
          title: reference.title,
          label: reference.label,
        });
      }
    }
  }
  return references;
};

const getUsersFromFirestore = async () => {
  let users = [];
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
  return institutionDocs.docs.map((institutionDoc) => {
    const institutionData = institutionDoc.data();
    const institutionName = institutionData.name || "";
    return { id: institutionDoc.id, name: institutionName };
  });
};

const getNodeTags = (nodeData) => {
  const tags = [];
  if (nodeData.tagIds) {
    for (let tagIdx = 0; tagIdx < nodeData.tagIds.length; tagIdx++) {
      tags.push(nodeData.tags[tagIdx]);
    }
  } else {
    const tagsField = nodeData.tags;
    for (let tag of tagsField) {
      if (tag.node && tag.title) {
        tags.push(tag.title);
      }
    }
  }
  return tags;
};

const getInstitutionsName = (nodeData) => {
  const institutions = [];
  const institObjs = Object.keys(nodeData.institutions || {});

  for (let name of institObjs) {
    institutions.push(name);
  }

  return institutions;
};

const getContributorsName = (nodeData) => {
  const contributorsNodes = Object.entries(nodeData.contributors || {});

  const contributors = contributorsNodes.map((el) => el[0]);
  return contributors;
};

const getNodesData = (nodeDocs) => {
  const getContributorsFromNode = (nodeData) => {
    return Object.entries(nodeData.contributors || {})
      .map((cur) => ({ ...cur[1], username: cur[0] }))
      .sort((a, b) => (b.reputation = a.reputation))
      .map((contributor) => ({
        fullName: contributor.fullname,
        imageUrl: contributor.imageUrl,
        username: contributor.username,
      }));
  };

  const getInstitutionsFromNode = (nodeData) => {
    return Object.entries(nodeData.institutions || {})
      .map((cur) => ({ name: cur[0], reputation: cur[1].reputation || 0 }))
      .sort((a, b) => b.reputation - a.reputation)
      .map((institution) => ({ name: institution.name }));
  };

  return nodeDocs.docs.map((nodeDoc) => {
    const nodeData = nodeDoc.data();
    const contributors = getContributorsFromNode(nodeData);
    const contributorsNames = getContributorsName(nodeData);
    const institutions = getInstitutionsFromNode(nodeData);
    const institutionsNames = getInstitutionsName(nodeData);
    const tags = getNodeTags(nodeData);
    const references = getNodeReferences(nodeData);

    const titlesReferences = references
      .map((cur) => cur.title || "")
      .filter((cur) => cur);
    const labelsReferences = references
      .map((cur) => cur.label)
      .filter((cur) => cur);

    return {
      changedAt: nodeData.changedAt.toDate().toISOString(),
      changedAtMillis: nodeData.changedAt?.toMillis() || 0,
      choices: nodeData.choices,
      content: nodeData.content || "",
      contribNames: nodeData.contribNames || [],
      institNames: nodeData.institNames || [],
      contributors,
      contributorsNames,
      corrects: nodeData.corrects || 0,
      mostHelpful: (nodeData.corrects || 0) - (nodeData.wrongs || 0),
      id: nodeDoc.id,
      institutions,
      institutionsNames,
      labelsReferences,
      nodeImage: nodeData.nodeImage,
      nodeType: nodeData.nodeType,
      isTag: nodeData.isTag || false,
      tags,
      title: nodeData.title || "",
      titlesReferences,
      updatedAt: nodeData.updatedAt?.toMillis() || 0,
      wrongs: nodeData.wrongs || 0,
    };
  });
};

const retrieveNode = async (nodeId) => {
  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  const nodeData = nodeDoc.data();

  if (!nodeDoc.exists || !nodeData) {
    return null;
  }
  return nodeData;
};

const getReferencesData = async (nodeDocs) => {
  const references = nodeDocs.docs
    .map((nodeDoc) => {
      const nodeData = nodeDoc.data();
      const data = getNodeReferences(nodeData);
      return data;
    })
    .flat();

  const fullReferences = await Promise.all(
    references.map(async (reference) => {
      const nodeReference = await retrieveNode(reference.node);
      return {
        node: reference.node,
        title: nodeReference?.title || "",
        label: reference.label,
      };
    })
  );

  const processedReferences = fullReferences.reduce(
    (referencesSet, currentReference) => {
      const indexReference = referencesSet.findIndex(
        (cur) => cur.title === currentReference.title
      );
      const processedReference = {
        title: currentReference.title,
        data: [{ label: currentReference.label, node: currentReference.node }],
      };
      if (indexReference < 0) return [...referencesSet, processedReference];
      referencesSet[indexReference].data = [
        ...referencesSet[indexReference].data,
        ...processedReference.data,
      ];
      return referencesSet;
    },
    []
  );

  return { processedReferences };
};

const fillInstitutionsIndex = async (forceReIndex) => {
  const data = await getInstitutionsFirestore();
  const fields = [
    { name: "id", type: "string" },
    { name: "name", type: "string" },
  ];

  await indexCollection("institutions", fields, data, forceReIndex);
};

const fillUsersIndex = async (forceReIndex) => {
  const data = await getUsersFromFirestore();
  const fields = [
    { name: "username", type: "string" },
    { name: "name", type: "string" },
    { name: "imageUrl", type: "string" },
  ];
  await indexCollection("users", fields, data, forceReIndex);
};

const fillNodesIndex = async (nodeDocs, forceReIndex) => {
  const data = getNodesData(nodeDocs);
  const fields = [
    { name: "changedAtMillis", type: "int64" },
    { name: "content", type: "string" },
    { name: "contributorsNames", type: "string[]" },
    { name: "mostHelpful", type: "int32" },
    { name: "corrects", type: "int32" },
    { name: "labelsReferences", type: "string[]" },
    { name: "institutionsNames", type: "string[]" },
    { name: "nodeType", type: "string" },
    { name: "tags", type: "string[]" },
    { name: "title", type: "string" },
    { name: "titlesReferences", type: "string[]" },
    { name: "isTag", type: "bool" },
  ];

  await indexCollection("nodes", fields, data, forceReIndex);
};

const fillReferencesIndex = async (nodeDocs, forceReIndex) => {
  const { processedReferences } = await getReferencesData(nodeDocs);
  const fieldsProcessedReferences = [{ name: "title", type: "string" }];
  if (!processedReferences.length) {
    return;
  }
  await indexCollection(
    "processedReferences",
    fieldsProcessedReferences,
    processedReferences,
    forceReIndex
  );
};

exports.typesenseIndex = async () => {
  await fillUsersIndex(true);
  await fillInstitutionsIndex(true);
  const nodeDocs = await db.collection("nodes").get();
  await fillNodesIndex(nodeDocs, true);
  await fillReferencesIndex(nodeDocs, true);
};
