const puppeteer = require('puppeteer');

let browser;
let page;

async function initializeBrowser() {
  if (!browser || !page || page.isClosed()) {
    browser = await puppeteer.launch({
      headless: false,
      // executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  }
}

async function getPage() {
  return page;
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}

module.exports = { initializeBrowser, getPage, closeBrowser };
