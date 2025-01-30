const puppeteer = require('puppeteer');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;
const INSTAGRAM_URL = `https://www.instagram.com/${process.env.INSTAGRAM_TARGET}/`;
const CHECK_INTERVAL = 60000;
const CLASS_TAG_POST = process.env.INSTAGRAM_CLASS_POST;
const CLASS_TAG_TEXT = process.env.INSTAGRAM_CLASS_TEXT;

let browser;
let page;
let lastPost = null;
let isLoggedIn = false;

async function initializeBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  }
}

async function loginToInstagram() {
  if (isLoggedIn) {
    console.log('\n✅ Já estamos logados no Instagram. Pulando login...');
    return;
  }

  console.log('\nVerificando login no Instagram...');
  await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

  // Verifica se já estamos logados
  const alreadyLoggedIn = await page.evaluate(() => {
    return document.querySelector('input[name="username"]') === null;
  });

  if (alreadyLoggedIn) {
    console.log('\n✅ Já estamos logados no Instagram!');
    isLoggedIn = true; // Atualiza a flag
    return;
  }

  console.log('🔑 Realizando login no Instagram...');
  await page.waitForSelector('input[name="username"]', { visible: true });
  await page.type('input[name="username"]', process.env.INSTAGRAM_USERNAME, { delay: 100 });
  await page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD, { delay: 100 });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);

  console.log('✅ Login no Instagram realizado com sucesso!');
  isLoggedIn = true; // Atualiza a flag após o login bem-sucedido
}

async function checkNewPost() {
  if (!browser || !page) {
    await initializeBrowser();
  }

  await loginToInstagram();

  console.log('\n🔍 Acessando a URL:', INSTAGRAM_URL);
  await page.goto(INSTAGRAM_URL, { waitUntil: 'networkidle2' });

  const post = await page.evaluate(async (selectorPost, selectorText) => {
    let element = document.querySelector(selectorPost);
    if (!element) return null;

    let firstPost = element ? element.children[0] : null;
    let modalPost = firstPost ? firstPost.children[0] : null;
  
    if (!firstPost || !modalPost) return null;
  
    // Clicar na postagem para abrir o modal
    modalPost.click();
  
    // Esperar um tempo para o conteúdo carregar
    await new Promise(resolve => setTimeout(resolve, 500));
  
    // Capturar o texto dentro do modal
    let textElements = document.querySelectorAll('h1');
    let textElement = '';
    textElements.forEach(element => {
      if (element.textContent.length > 10) {
        textElement = element;
      }
    });

    let textContent = textElement ? textElement.textContent : '';
  
    return {
      image: firstPost.querySelector('img') ? firstPost.querySelector('img').src : null,
      link: firstPost.href || null,
      text: textContent || null,
    };
  }, CLASS_TAG_POST, CLASS_TAG_TEXT);
  
  if (post && post.image && post.link && post.link !== lastPost) {
    lastPost = post.link;
    sendNotification(post);
    console.log('\nNova postagem detectada:', post);
  } else {
    console.log('\nSem novas postagens.');
  }
}

async function sendNotification(post) {
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

  if (post && !post.image) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: `🚀 Post novo de ${process.env.INSTAGRAM_TARGET}: ${post.text}\n\n Segue o link: ${post.link}`
    });
  } else {
    await axios.post(`${TELEGRAM_API}/sendPhoto`, {
      chat_id: TELEGRAM_CHAT_ID,
      photo: post.image,
      caption: `🚀 Post novo de ${process.env.INSTAGRAM_TARGET}: ${post.text}\n\n Segue o link: ${post.link}`
    });
  }
  // volte pra url
  await page.goto(INSTAGRAM_URL, { waitUntil: 'networkidle2' });
}

app.use(express.json());

app.post('/telegram', (req, res) => {
    const { message } = req.body;
    if (message) {
        const chatId = message.chat.id;
        const text = message.text;
        console.log(`Mensagem recebida: ${text}`);
        sendTelegramMessage(chatId, `Recebi sua mensagem: ${text}`);
    }
    res.sendStatus(200);
});

async function sendTelegramMessage(chatId, text) {
  const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
  await axios.post(TELEGRAM_API, {
    chat_id: chatId,
    text: text
  });
}

function testTelegramBot() {
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    sendTelegramMessage(TELEGRAM_CHAT_ID, "🚀 Teste de mensagem do bot Telegram!");
    console.log("Mensagem de teste enviada para o Telegram.");
}

setInterval(checkNewPost, CHECK_INTERVAL);

app.listen(PORT, () => {
  (async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    await initializeBrowser();
    await checkNewPost();
  })();
});
