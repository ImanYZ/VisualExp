import { remark } from "remark";
import html from "remark-html";
import geoip from "geoip-lite";

import {
  admin,
  db,
  MAX_TRANSACTION_WRITES,
  checkRestartBatchWriteCounts,
  commitBatch,
  isFirestoreDeadlineError,
  batchSet,
  batchUpdate,
  batchDelete,
} from "./admin";

export const getSortedPostsData = async () => {
  const nodes = [];
  const nodeDocs = await db.collection("nodes").limit(25).get();
  for (let nodeDoc of nodeDocs.docs) {
    const nodeData = nodeDoc.data();
    nodes.push({
      id: nodeDoc.id,
      title: nodeData.title,
      nodeType: nodeData.nodeType,
      date: nodeData.createdAt.toDate().toLocaleString(),
    });
  }
  return nodes;
};

// Use remark to convert markdown into HTML string
const getNodeHTMLContent = async (content) => {
  const processedContent = await remark().use(html).process(content);
  return processedContent.toString();
};

// Retrieve all helpful data about the node corresponding to nodeId.
const retrieveNode = async (nodeId) => {
  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  if (!nodeDoc.exists) {
    return null;
  }
  const nodeData = nodeDoc.data();
  // const contentHTML = await getNodeHTMLContent(nodeData.content);
  // In onecademy database, we have:
  // "references" with the structure {node: ..., title: ..., label: ...}
  // and "tags" with the structure {node: ..., title: ...}.
  // In onecademy-dev database, we refactorred the structure of references and tags.
  // There, we have the following arrays for references and tags; in each set of
  // arrays, there is a one-to-one correspondance between the items with the same index:
  // references: an array of reference node titles that this node is citing
  // referenceIds: an array of reference node ids that this node is citing
  // referenceLabels: an array lables indicating how this reference node is veing cited
  // tags: an array of tag node titles that this node is citing
  // tagIds: an array of tag node ids that this node is citing
  // Because we have not migrated 1Cademy.com in production to the new data structure
  // yet, we should cover both structures for now. Later, after deploying the new
  // version of 1Cademy.com, we will rewrite this part of the code.
  const references = [];
  if ("referenceIds" in nodeData) {
    for (let refIdx = 0; refIdx < nodeData.referenceIds.length; refIdx++) {
      references.push({
        node: nodeData.referenceIds[refIdx],
        title: nodeData.references[refIdx],
      });
    }
  } else {
    for (let reference of nodeData.references) {
      if (reference.node && reference.title) {
        references.push({
          node: reference.node,
          title: reference.title,
        });
      }
    }
  }
  const tags = [];
  if ("tagIds" in nodeData) {
    for (let tagIdx = 0; tagIdx < nodeData.tagIds.length; tagIdx++) {
      tags.push({
        node: nodeData.tagIds[tagIdx],
        title: nodeData.tags[tagIdx],
      });
    }
  } else {
    for (let tag of nodeData.tags) {
      if (tag.node && tag.title) {
        tags.push({
          node: tag.node,
          title: tag.title,
        });
      }
    }
  }
  return {
    nodeId,
    content: nodeData.content,
    nodeType: nodeData.nodeType,
    title: nodeData.title,
    nodeImage: nodeData.nodeImage,
    contributors: nodeData.contributors,
    institutions: nodeData.institutions,
    children: nodeData.children,
    parents: nodeData.parents,
    references,
    tags,
    corrects: nodeData.corrects,
    wrongs: nodeData.wrongs,
    date: nodeData.updatedAt.toDate().toUTCString(),
  };
};

// Endpoint retrieving the node data and its direct parents and children
// data based on the id requested.
export const getNodeData = async (id) => {
  const nodeData = await retrieveNode(id);
  if (!nodeData) {
    return null;
  }

  // Retrieve the content of all the direct children of the node.
  // const children = [];
  // for (let child of nodeData.children) {
  //   const childData = await retrieveNode(child.node);
  //   children.push(childData);
  // }
  // Retrieve the content of all the direct parents of the node.
  // const parents = [];
  // for (let parent of nodeData.parents) {
  //   const parentData = await retrieveNode(parent.node);
  //   parents.push(parentData);
  // }

  // Descendingly sort the contributors array based on the reputation points.
  const contributors = [];
  for (let username in nodeData.contributors) {
    const contriIdx = contributors.findIndex(
      (contri) => contri.reputation < nodeData.contributors[username].reputation
    );
    const theContributor = {
      ...nodeData.contributors[username],
      username,
    };
    if (contriIdx === -1) {
      contributors.push(theContributor);
    } else {
      contributors.splice(contriIdx + 1, 0, theContributor);
    }
  }
  // Descendingly sort the contributors array based on the reputation points.
  const institutions = [];
  for (let institId in nodeData.institutions) {
    const institIdx = institutions.findIndex(
      (instit) => instit.reputation < nodeData.institutions[institId].reputation
    );
    const theInstitution = {
      ...nodeData.institutions[institId],
      name: institId,
    };
    if (institIdx === -1) {
      institutions.push(theInstitution);
    } else {
      institutions.splice(institIdx + 1, 0, theInstitution);
    }
  }
  return {
    ...nodeData,
    contributors,
    institutions,
  };
};

// Get the user's useragent and location and log views in the database.
export const logViews = async (req, nodeId) => {
  let userAgent;
  if (req) {
    // if you are on the server and you get a 'req' property from your context
    userAgent = req.headers["user-agent"]; // get the user-agent from the headers
  } else {
    userAgent = navigator.userAgent; // if you are on the client you can access the navigator from the window object
  }
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(/, /)[0]
    : req.connection.remoteAddress;
  const geo = geoip.lookup(ip);
  const viewerRef = db.collection("viewers").doc();
  await batchSet(viewerRef, {
    nodeId,
    ip,
    userAgent,
    country: geo.country,
    state: geo.region,
    city: geo.city,
  });
  const viewNumRef = db.collection("viewNums").doc();
  await batchSet(viewNumRef, {
    nodeId,
    num: admin.firestore.FieldValue.increment(1),
  });
  const countryViewRef = db.collection("countryViews").doc();
  await batchSet(countryViewRef, {
    country: geo.country,
    num: admin.firestore.FieldValue.increment(1),
  });
  const stateViewRef = db.collection("stateViews").doc();
  await batchSet(stateViewRef, {
    state: geo.region,
    num: admin.firestore.FieldValue.increment(1),
  });
  const cityViewRef = db.collection("cityViews").doc();
  await batchSet(cityViewRef, {
    city: geo.city,
    num: admin.firestore.FieldValue.increment(1),
  });
  const userAgentViewRef = db.collection("userAgentViews").doc();
  await batchSet(userAgentViewRef, {
    userAgent,
    num: admin.firestore.FieldValue.increment(1),
  });
  await commitBatch();
};
