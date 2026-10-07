import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8797/?skip=5&at=47,-204,-1.15,0', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  await page.evaluate(() => window.__START__()); await sleep(1500);
  await page.keyboard.down('KeyW');
  for (let i = 0; i < 10; i++) { await sleep(500); console.log(JSON.stringify(await page.evaluate(() => [window.__GAME__.pos, window.__GAME__.y, window.__GAME__.objective, window.__GAME__.speed]))); }
  await page.screenshot({ path: '/Users/atlas/astrocade-game5/work/lead_scratch/stair.jpg' });
} finally { await browser.close(); }
