const puppeteer = require('puppeteer');

let browser;
let page;

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
