const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  organization: process.env.ORG_ID
});

module.exports = {
  openai
};
