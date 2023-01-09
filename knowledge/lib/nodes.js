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

export async function getSortedPostsData() {
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
}

export async function getNodeData(id) {
  const nodeDoc = await db.collection("nodes").doc(id).get();
  const nodeData = nodeDoc.data();
  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(nodeData.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    nodeType: nodeData.nodeType,
    title: nodeData.title,
    date: nodeData.createdAt.toDate().toLocaleString(),
  };
}
