import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8797/?skip=5&at=10,-120,3.1,0', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  await page.evaluate(() => window.__START__());
  for (let i = 0; i < 8; i++) { await sleep(2500); console.log(JSON.stringify(await page.evaluate(() => { const g = window.__GAME__; return [g.pos, g.stage, g.objective, g.well, g.enemies, g.kills, g.mode, g.picking]; }))); }
} finally { await browser.close(); }
