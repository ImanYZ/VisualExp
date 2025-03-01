const { db } = require("../admin");
const { openai } = require("../helpers/openai");

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
    const { documentDetailed } = req.body;
    const promptDoc = await db.collection("diagramPrompts").doc("generate").get();
    const promptData = promptDoc.data();
    const llmPrompt = promptData.prompt;
    console.log("llmPrompt", llmPrompt);
    const prompt = `
  ${llmPrompt}
  ${documentDetailed}`;

    const messages = [
      {
        role: "user",
        content: prompt
      }
    ];
    const model = "o1";
    const completion = await openai.chat.completions.create({
      messages,
      model
    });
    const response = extractJSON(completion.choices[0].message.content || "").jsonObject;
    console.log(response);
    if (!response?.groupHierarchy || !response?.nodes || !response?.links) {
      throw Error("Incomplete JSON");
    }
    return res.status(200).json({ response });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: e.message
    });
  }
};
