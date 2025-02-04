const { OpenAI } = require('openai');
require('dotenv').config();
const { OPENAI_MODEL, OPENAI_API_KEY } = require('./config');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function getAIResponse(userMessage, systemMessage = "Você é um assistente útil.") {
  try {
    const model = OPENAI_MODEL || "gpt-4o"; // Modelo configurável pelo .env

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Erro ao conectar com OpenAI:", error.message);
    return userMessage;
  }
}

module.exports = { getAIResponse };