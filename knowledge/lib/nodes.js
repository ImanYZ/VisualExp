import { remark } from "remark";
import html from "remark-html";

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

const retrieveNode = async (nodeId) => {
  const nodeDoc = await db.collection("nodes").doc(id).get();
  if (!nodeDoc.exists) {
    return null;
  }
  const nodeData = nodeDoc.data();
  const contentHTML = await getNodeHTMLContent(nodeData.content);
  return { nodeData, contentHTML };
};

export const getNodeData = async (id) => {
  const nodeObj = await retrieveNode(id);
  if (!nodeObj) {
    return null;
  }
  const { nodeData, contentHTML } = nodeObj;

  const children = [];
  for (let child of nodeData.children) {
    const childObj = await retrieveNode(child.node);
    children.push(childObj);
  }
  const parents = [];
  for (let parent of nodeData.parents) {
    const parentObj = await retrieveNode(parent.node);
    parents.push(parentObj);
  }

  // nodeData.institutions
  // const institutionsCollection = await firebase.db
  // .collection("institutions")
  // .get();

  // Combine the data with the id and contentHTML
  return {
    id,
    contentHTML,
    nodeType: nodeData.nodeType,
    title: nodeData.title,
    contributors: nodeData.contributors,
    institutions: nodeData.institutions,
    children: nodeData.children,
    parents: nodeData.parents,
    corrects: nodeData.corrects,
    wrongs: nodeData.wrongs,
    date: nodeData.updatedAt.toDate().toLocaleString(),
  };
};
