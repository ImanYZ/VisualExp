const { db } = require("../admin");
/* const { openai } = require("../helpers/openai"); */

const extractJSON = text => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (end === -1 || start === -1) {
      return { jsonObject: {}, isJSON: false };
    }
    const jsonArrayString = text.slice(start, end + 1);
    return { jsonObject: JSON.parse(jsonArrayString), isJSON: true };
  } catch (error) {
    return { jsonObject: {}, isJSON: false };
  }
};
module.exports = async (req, res) => {
  try {
    return res.status(200).json({ response: "response" });
    /*     const { newText, diagramId } = req.body;

    // Retrieve documents for nodes, groups, and links
    const nodesSnapshot = await db.collection("nodes").where("diagramId", "array-contains", diagramId).get();
    const groupsSnapshot = await db.collection("groups").where("diagramId", "array-contains", diagramId).get();
    const linksSnapshot = await db.collection("links").where("diagramId", "array-contains", diagramId).get();

    // Process nodes and include doc.id so we can map IDs to labels.
    const nodes = nodesSnapshot.docs.map(doc => {
      const data = doc.data();
      data.id = doc.id;
      delete data.diagrams;
      return data;
    });

    // Build a map from node IDs to their labels
    const nodeLabelMap = {};
    nodes.forEach(node => {
      nodeLabelMap[node.id] = node.label;
    });

    // Process groups
    const groups = groupsSnapshot.docs.map(doc => {
      const data = doc.data();
      delete data.diagrams;
      return data;
    });

    // Process links and replace source/target IDs with the corresponding node labels
    const links = linksSnapshot.docs.map(doc => {
      const data = doc.data();
      delete data.diagrams;
      data.source = nodeLabelMap[data.source] || data.source;
      data.target = nodeLabelMap[data.target] || data.target;
      return data;
    });

    const previousDiagram = { nodes, groups, links };
    const promptDoc = await db.collection("diagramPrompts").doc("improve").get();
    const promptData = promptDoc.data();
    const llmPrompt = promptData.prompt;
    const prompt = `
    ${llmPrompt}
    
    **Existing Causal Loop Diagram**:
    ${previousDiagram}
    
    **New Text Data**: 
    ${newText}`;

    const completion = await openai.chat.completions.create({
      messages: [{ content: prompt, role: "user" }],
      model: "o1",
      temperature: 0
    });

    const response = completion.choices[0].message.content;

    const isJSONObject = extractJSON(response || "");

    if (!isJSONObject.isJSON) {
      return res.status(400).json({
        message: "Invalid response from the model."
      });
    }

    return res.status(200).json(
      isJSONObject.jsonObject.modifications.map(modification => {
        if (modification.level === "Node" && modification.type === "Modify") {
          modification.targetId = nodes.find(node => node.label === modification.targetId).id;
        }
        if (modification.level === "Link" && modification.type === "Modify") {
          modification.targetId = links.find(link => link.source === modification.targetId).id;
        }
        return modification;
      })
    ); */
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: e.message
    });
  }
};
