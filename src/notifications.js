const axios = require('axios');
const { TELEGRAM_CHAT_ID, TELEGRAM_TOKEN, INSTAGRAM_URL, INSTAGRAM_TARGET } = require('./config');
const { getAIResponse } = require('./openai');
const { getPage } = require('./browser');

async function sendNotification(post) {
  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  post.text = await getAIResponse(post.text, `Responda de forma curta.`);

  if (post && !post.image) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: `🚀 Novo post de ${INSTAGRAM_TARGET}: ${post.text}\n\n Segue o link: ${post.link}`
    });
  } else {
    await axios.post(`${TELEGRAM_API}/sendPhoto`, {
      chat_id: TELEGRAM_CHAT_ID,
      photo: post.image,
      caption: `🚀 Novo post de ${INSTAGRAM_TARGET}: ${post.text}\n\n Segue o link: ${post.link}`
    });
  }

  const page = await getPage();
  await page.goto(INSTAGRAM_URL, { waitUntil: 'networkidle2' });
}

module.exports = { sendNotification };
