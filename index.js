const puppeteer = require('puppeteer');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// App vars
const app = express();
app.use(express.json());

// Consts
const PORT = process.env.PORT || 3000;
const INSTAGRAM_URL = `https://www.instagram.com/${process.env.INSTAGRAM_TARGET}/`;
const CHECK_INTERVAL = 30000;
const CLASS_TAG_POST = process.env.INSTAGRAM_CLASS_POST;
const CLASS_TAG_TEXT = process.env.INSTAGRAM_CLASS_TEXT;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Vars
let isChecking = false;
let browser;
let page;
let lastPost = null;
let isLoggedIn = false;

// Inicializa o browser
async function initializeBrowser() {
  if (!browser || !page || page.isClosed()) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  }
}

// Faz o login no Instagram
async function loginToInstagram() {
  if (isLoggedIn) {
    // console.log('\n✅ Já estamos logados no Instagram...');
    return;
  }

  console.log('\n🔎 Verificando login no Instagram...');
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

  console.log('\n🔑 Realizando login no Instagram...');
  await page.waitForSelector('input[name="username"]', { visible: true });
  await page.type('input[name="username"]', process.env.INSTAGRAM_USERNAME, { delay: 100 });
  await page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD, { delay: 100 });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);

  console.log('\n✅ Login no Instagram realizado com sucesso!');
  console.log('\n==============================');
  isLoggedIn = true; // Atualiza a flag após o login bem-sucedido
}

// Checa novas postagens
async function checkNewPost() {
  try {
    if (!browser || !page || page.isClosed()) {
      console.log("\n🛠️ Navegador fechado ou página indisponível. Reinicializando...");
      await initializeBrowser();
    }

    // ⚠️ Verifica se o frame ainda está anexado
    if (!page.mainFrame()) {
      console.log("\n⚠️ Frame desconectado! Reinicializando navegador...");
      await initializeBrowser();
    }

    await loginToInstagram();

    console.log('\n🔍 Acessando a URL:', INSTAGRAM_URL);
    await page.goto(INSTAGRAM_URL, { waitUntil: 'networkidle2' });
  
    await page.waitForSelector(CLASS_TAG_POST, { timeout: 5000 });

    let elementSelected = null;

    const post = await page.evaluate(async (selectorPost, selectorText) => {

      let elements = Array.from(document.querySelectorAll(selectorPost));

      elementSelected = elements.find((element, index) => {
        let svgElement = element.querySelector('svg');
        if (svgElement && svgElement.ariaLabel && !svgElement.ariaLabel.includes('publicação fixada')) {
          return elements[index + 1] || element; // Garante que existe um próximo elemento antes de acessá-lo
        }
      });
      
      if (!elementSelected) return null;
  
      let firstPost = elementSelected ? elementSelected.children[0] : null;
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

    let date = new Date();
    let formattedDate = date.toLocaleDateString('pt-BR') + ' - ' + date.toLocaleTimeString('pt-BR');
    console.log('\n🕑 Data/horário:', formattedDate);

    if (post && post.image && post.link && post.link !== lastPost) {
      lastPost = post.link;
      sendNotification(post);
      elementSelected = null;
      console.log('\n✅ Nova postagem detectada:', post);
      console.log('\n==============================');
    } else {
      elementSelected = null;
      console.log('\n🫠  Sem novas postagens.');
      console.log('\n==============================');
    }
  } catch (error) {
    elementSelected = null;
    console.error('\n❌ Erro ao verificar novas postagens:', error.message);
    console.log('\n==============================');

    // ⚠️ Se for um erro relacionado ao frame desconectado, reinicia o navegador
    if (error.message.includes('detached Frame')) {
      console.log("\n🔄 Tentando reiniciar o navegador devido a frame desconectado...");
      console.log('\n==============================');

      if (browser) {
        await browser.close();  // Fecha o navegador
      }
      await initializeBrowser();
    }
  }
}

// Envia notificacao para o Telegram
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

// Valida e checa novas postagens, só passa após fazer o check completo.
setInterval(async () => {
  if (isChecking) return; // Evita execuções simultâneas

  isChecking = true;
  try {
    await checkNewPost();
  } catch (error) {
    console.error("Erro ao verificar novo post:", error);
  } finally {
    isChecking = false;
  }
}, CHECK_INTERVAL);

// Inicializando app/server
app.listen(PORT, () => {
  (async () => {
    console.log(`\n🛜 Servidor rodando na porta ${PORT}`);
    console.log('\n==============================');
    await initializeBrowser();
    await checkNewPost();
  })();
});
