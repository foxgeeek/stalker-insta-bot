const { INSTAGRAM_URL, TARGET_CLASS, TARGET_TAG, INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } = require('./config');
const { initializeBrowser, getPage, browser } = require('./browser');
const { sendNotification } = require('./notifications');

let lastPost = null;
let isLoggedIn = false;

async function loginToInstagram() {
  try {
    const page = await getPage();
  
    if (isLoggedIn) return;
  
    console.log('\n🔎 Verificando login no Instagram...');
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
  
    const alreadyLoggedIn = await page.evaluate(() => document.querySelector('input[name="username"]') === null);
  
    if (alreadyLoggedIn) {
      console.log('\n✅ Já estamos logados no Instagram!');
      isLoggedIn = true;
      return;
    }
  
    console.log('\n🔑 Realizando login no Instagram...');
    await page.waitForSelector('input[name="username"]', { visible: true });
    await page.type('input[name="username"]', INSTAGRAM_USERNAME, { delay: 100 });
    await page.type('input[name="password"]', INSTAGRAM_PASSWORD, { delay: 100 });
  
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
  
    console.log('\n✅ Login realizado com sucesso!');
    console.log('\n==============================');
    isLoggedIn = true;
  } catch (err) {
    console.log('\n❌ Erro ao realizar login no Instagram. ', err);
  }
}

async function checkNewPost() {
  const page = await getPage();
  try {
    if (!page || page.isClosed()) {
      console.log("\n🛠️ Navegador fechado ou página indisponível. Reinicializando...");
      await initializeBrowser();
    }

    // ⚠️ Verifica se o frame ainda está anexado
    if (!page.mainFrame()) {
      console.log("\n⚠️ Frame desconectado! Reinicializando navegador...");
      await initializeBrowser();
    }

    await loginToInstagram();

    console.log('\n🔍 Acessando:', INSTAGRAM_URL);
    await page.goto(INSTAGRAM_URL, { waitUntil: 'networkidle2' });
  
    await page.waitForSelector(TARGET_CLASS, { timeout: 5000 });

    const post = await page.evaluate((classSelector, tagSelector) => {
      let elements = Array.from(document.querySelectorAll(classSelector));

      let elementSelected = elements.find((element, index) => {
        if (!element.querySelector('svg')) return element;

        let svgElement = element.querySelector('svg');
        return svgElement && svgElement.ariaLabel && !svgElement.ariaLabel.includes('publicação fixada');
      });

      if (!elementSelected) return null;

      let firstPost = elementSelected.children[0];
      let modalPost = firstPost.children[0];

      if (!firstPost || !modalPost) return null;

      modalPost.click();

      return new Promise(resolve => setTimeout(() => {
        let textElements = document.querySelectorAll(tagSelector);
        let textContent = Array.from(textElements).find(el => el.textContent.length > 10)?.textContent || '';

        resolve({
          image: firstPost.querySelector('img')?.src || null,
          link: firstPost.href || null,
          text: textContent
        });
      }, 500));
    }, TARGET_CLASS, TARGET_TAG);

    let date = new Date();
    let formattedDate = date.toLocaleDateString('pt-BR') + ' - ' + date.toLocaleTimeString('pt-BR');
    console.log('\n🕑 Data/horário:', formattedDate);

    if (post && post.image && post.link && post.link !== lastPost) {
      lastPost = post.link;
      sendNotification(post);
      console.log('\n✅ Nova postagem detectada:', post);
      console.log('\n==============================');
    } else {
      console.log('\n🫠  Sem novas postagens.');
      console.log('\n==============================');
    }
  } catch (error) {
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

module.exports = { checkNewPost };
