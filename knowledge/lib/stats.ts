import { db } from "./admin";

export const getStats = async () => {
  const statDocs = await db.collection("stats").orderBy("createdAt", "desc").limit(1).get();
  if (statDocs.docs.length > 0) {
    const statsData = statDocs.docs[0].data();
    delete statsData.createdAt;
    return statsData;
  }

  return {
    institutions: 0,
    users: 0,
    proposals: 0,
    nodes: 0,
    links: 0
  };
};
