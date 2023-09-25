const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORG_ID
});

const openai = new OpenAIApi(configuration);

const sendPromptAndReceiveResponse = async ({ model, prompt }) => {
  try {
    const completion = await openai.createChatCompletion({
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
