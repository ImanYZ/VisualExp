const Typesense = require("typesense");
const client = new Typesense.Client({
  nodes: [{ host: "localhost", port: "8108", protocol: "http" }],
  apiKey: "xyz"
});

const buildSortBy = (upvotes, mostRecent) => {
  if (upvotes) {
    return "corrects:desc";
  }
  if (mostRecent) {
    return "changedAt:asc";
  }
  return "";
  // return `changedAt:${!mostRecent ? "asc" : "desc"}`;
  // return `corrects:${!upvotes ? "asc" : "desc"},changedAt:${!mostRecent ? "asc" : "desc"}`;
};

// cant create your functions here to test
const getNodes = async () => {
  const sortBy = buildSortBy(true, false);
  console.log("SORT BY:", sortBy);
  return await client.collections("nodes").documents().search({
    // 'query_by': 'title,content',
    // 'q': 'machine learning wi',
    // 'sort_by': sortBy
    q: "machine learning wi",
    query_by: "title,content",
    sort_by: "changedAt:asc",
    per_page: 10
  });
};

// Dont delete this function
const run = async () => {
  const res = await getNodes();
  const data = res.hits
    .map(cur => cur.document)
    .map(cur => ({ title: cur.title.substring(0, 20), corrects: cur.corrects, changedAt: cur.changedAt }));
  console.log(data);
};

run();
