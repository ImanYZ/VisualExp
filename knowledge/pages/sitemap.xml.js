import { encodeTitle } from "../lib/utils";

const EXTERNAL_DATA_URL = "https://jsonplaceholder.typicode.com/posts";

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  const tagDoc = await db.collection("nodes").doc(req.params.nodeId).get();
  if (!tagDoc.exists) {
    res.writeHeader(404, { "Content-Type": "text/xml" });
    res.write("No Sitemap for Id: " + req.params.nodeId);
    res.end();
  } else {
    const tagData = tagDoc.data();
    const nodesDocs = await db
      .collection("nodes")
      .where("deleted", "==", false)
      .where("tags", "array-contains", {
        node: req.params.nodeId,
        title: tagData.title,
      })
      .get();
    if (nodesDocs.docs.length === 0) {
      res.writeHeader(404, { "Content-Type": "text/xml" });
      res.write("No Sitemap!");
      res.end();
    } else {
      let xmlContent =
        '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      for (let nodeDoc of nodesDocs.docs) {
        const nodeData = nodeDoc.data();
        xmlContent += `
          <url>
            <loc>https://1cademy.us/knowledge/node/${encodeTitle(
              nodeData.title
            )}/${nodeDoc.id}</loc>
            <lastmod>${nodeData.updatedAt.toDate().toISOString()}</lastmod>
            <changefreq>hourly</changefreq>
          </url>`;
      }
      xmlContent += "</urlset>";
      res.writeHeader(200, { "Content-Type": "text/xml" });
      res.write(xmlContent);
      res.end();
    }
  }
  return {
    props: {},
  };
}

export default SiteMap;
