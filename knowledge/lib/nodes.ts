import geoip from "geoip-lite";
import {
  KnowledgeNode,
  KnowledgeNodeContributor,
  LinkedKnowledgeNode,
  KnowledgeNodeInstitutions,
} from "../src/knowledgeTypes";

import { admin, db, commitBatch, batchSet } from "./admin";

export const getSortedPostsData = async () => {
  const nodes: KnowledgeNode[] = [];
  const nodeDocs = await db.collection("nodes").limit(25).get();
  for (let nodeDoc of nodeDocs.docs) {
    const nodeData = nodeDoc.data();
    nodes.push({
      id: nodeDoc.id,
      title: nodeData.title,
      nodeType: nodeData.nodeType,
      createdAt: nodeData.createdAt.toDate().toISOString(),
      nodeImage: nodeData.nodeImage,
      content: nodeData.content,
      viewers: nodeData.viewers,
      corrects: nodeData.corrects,
      wrongs: nodeData.wrongs,
    });
  }
  return nodes;
};

// Retrieve all helpful data about the node corresponding to nodeId.
const retrieveNode = async (nodeId: string) => {
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
  if (typeof nodeData.references[0] !== "object") {
    for (let refIdx = 0; refIdx < nodeData.referenceIds.length; refIdx++) {
      references.push({
        node: nodeData.referenceIds[refIdx],
        title: nodeData.references[refIdx],
        label:
          "referenceLabels" in nodeData ? nodeData.referenceLabels[refIdx] : "",
      });
    }
  } else {
    for (let reference of nodeData.references) {
      if (reference.node && reference.title) {
        references.push({
          node: reference.node,
          title: reference.title,
          label: reference.label,
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
  const node: KnowledgeNode = {
    id: nodeId,
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
    updatedAt: nodeData.updatedAt.toDate().toUTCString(),
    changedAt: nodeData.changedAt.toDate().toUTCString(),
    createdAt: nodeData.createdAt.toDate().toUTCString(),
  };
  return node;
};

// Endpoint retrieving the node data and its direct parents and children
// data based on the id requested.
export const getNodeData = async (id: string) => {
  const nodeData = await retrieveNode(id);
  // console.log("nodeData", nodeData);
  if (!nodeData) {
    return null;
  }

  // Retrieve the content of all the direct children of the node.
  const children: KnowledgeNode[] = [];
  for (let child of nodeData.children) {
    const childData = await retrieveNode(child.node);
    children.push({
      id: childData.id,
      title: childData.title,
      content: childData.content,
      nodeImage: childData.nodeImage,
      nodeType: childData.nodeType,
    });
  }
  // Retrieve the content of all the direct parents of the node.
  const parents: LinkedKnowledgeNode[] = [];
  for (let parent of nodeData.parents) {
    const parentData = await retrieveNode(parent.node);
    parents.push({
      node: parent.node,
      title: parentData.title,
      content: parentData.content,
      nodeImage: parentData.nodeImage,
      nodeType: parentData.nodeType,
    });
  }
  // Retrieve the content of all the tags of the node.
  const tags: LinkedKnowledgeNode[] = [];
  for (let tag of nodeData.tags) {
    const tagData = await retrieveNode(tag.node);
    tags.push({
      node: tag.node,
      title: tagData.title,
      content: tagData.content,
      nodeImage: tagData.nodeImage,
      nodeType: tagData.nodeType,
    });
  }
  // Retrieve the content of all the references of the node.
  const references: LinkedKnowledgeNode[] = [];
  for (let reference of nodeData.references) {
    const referenceData = await retrieveNode(reference.node);
    references.push({
      label: reference.label,
      node: reference.node,
      title: referenceData.title,
      content: referenceData.content,
      nodeImage: referenceData.nodeImage,
      nodeType: referenceData.nodeType,
    });
  }

  // Descendingly sort the contributors array based on the reputation points.
  const contributors: KnowledgeNodeContributor[] = Object.entries(
    nodeData.contributors
  )
    .sort(([aId, aObj], [bId, bObj]) => {
      return bObj.reputation - aObj.reputation;
    })
    .reduce((r, [name, obj]) => [...r, { ...obj, fullname: name }], []);
  // Descendingly sort the contributors array based on the reputation points.
  const institObjs = Object.entries(nodeData.institutions).sort(
    ([aId, aObj], [bId, bObj]) => {
      return bObj.reputation - aObj.reputation;
    }
  );
  const institutions: KnowledgeNodeInstitutions[] = [];
  for (let [name, obj] of institObjs) {
    const institutionDocs = await db
      .collection("institutions")
      .where("name", "==", name)
      .get();
    if (institutionDocs.docs.length > 0) {
      obj.logoURL = institutionDocs.docs[0].data().logoURL;
    } else {
      obj.logoURL = "";
    }
    institutions.push({ ...obj, name });
  }
  return {
    ...nodeData,
    children,
    parents,
    tags,
    references,
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
