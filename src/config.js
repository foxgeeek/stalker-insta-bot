require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  INSTAGRAM_URL: `https://www.instagram.com/${process.env.INSTAGRAM_TARGET}`,
  CHECK_INTERVAL: 30000,
  TARGET_CLASS: process.env.INSTAGRAM_TARGET_CLASS,
  TARGET_TAG: process.env.INSTAGRAM_TARGET_TAG,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  INSTAGRAM_USERNAME: process.env.INSTAGRAM_USERNAME,
  INSTAGRAM_PASSWORD: process.env.INSTAGRAM_PASSWORD,
  INSTAGRAM_TARGET: process.env.INSTAGRAM_TARGET
};
