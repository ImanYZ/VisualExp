const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  organization: process.env.OPENAI_API_ORG_ID ?? ""
});

const sendPromptAndReceiveResponse = async ({ model, prompt }) => {
  try {
    const completion = await openai.chat.completions({
      model,
      temperature: 0,
      messages: [{ role: "user", content: prompt }]
    });
    return completion.data.choices[0].message.content;
  } catch (error) {}
};

module.exports = {
  sendPromptAndReceiveResponse
};
