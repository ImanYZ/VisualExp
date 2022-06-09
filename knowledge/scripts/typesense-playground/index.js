const Typesense = require("typesense");
const client = new Typesense.Client({
  nodes: [{ host: "localhost", port: "8108", protocol: "http" }],
  apiKey: "xyz"
});

// const buildSortBy = (upvotes, mostRecent) => {
//   if (upvotes) {
//     return "corrects:desc";
//   }
//   if (mostRecent) {
//     return "changedAt:asc";
//   }
//   return "";
// };

// // cant create your functions here to test
// const getNodes = async () => {
//   const sortBy = buildSortBy(true, false);
//   console.log("SORT BY:", sortBy);
//   return await client.collections("nodes").documents().search({
//     // 'query_by': 'title,content',
//     // 'q': 'machine learning wi',
//     // 'sort_by': sortBy
//     q: "machine learning wi",
//     query_by: "title,content",
//     sort_by: "changedAt:asc",
//     per_page: 10
//   });
// };

// const getIntitutions = async () => {
//   return await client.collections("tags").documents().search({
//     query_by: "name",
//     q: "dat"
//     // 'sort_by': sortBy
//   });
// };

// const getReferences = async () => {
//   return await client.collections("references").documents().search({
//     query_by: "title,label",
//     q: "a"
//     // 'sort_by': sortBy
//   });
// };

const getProcessedReferences = async () => {
  return await client.collections("processedReferences").documents().search({
    query_by: "title",
    q: "wikiped"
  });
};

// Dont delete this function
const run = async () => {
  // const res = await getIntitutions();
  // // const data = res.hits
  // //   .map(cur => cur.document)
  // //   .map(cur => ({ title: cur.title.substring(0, 20), corrects: cur.corrects, changedAt: cur.changedAt }));

  // const data = res.hits.map(cur => cur.document);
  // // .map(cur => ({ title: cur.title.substring(0, 20), corrects: cur.corrects, changedAt: cur.changedAt }));

  //----------------------------------
  // get references
  // const res = await getReferences()
  // const data = res.hits.map(cur => cur.document)
  // console.log(data.map(cur => ({ label: cur.label, node: cur.node, title: cur.title.substring(0, 10) })));

  //----------------------------------
  // get processedReferences
  const res = await getProcessedReferences();
  const data = res.hits.map(cur => cur.document);
  data.map(cur => {
    console.log("TITLE:", cur.title.substring(0, 10));
    cur.data.map(c => console.log("   DD__II", c));
  });
  // console.log(data);
};

run();
