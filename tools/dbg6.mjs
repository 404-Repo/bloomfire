import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8797/?skip=5&at=-33,-156,-1.57,0', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  await page.evaluate(() => window.__START__());
  for (let i = 0; i < 6; i++) { await sleep(4000);
    console.log(JSON.stringify(await page.evaluate(() => { const D = window.__DBG2__; const g = window.__GAME__; return { pos: g.pos, shots: g.shots, kills: g.kills, lock: g.lock, near: g.near, en: D.ENEMIES.map((e) => [e.type, e.state, +e.pos.x.toFixed(1), +e.pos.y.toFixed(1), +e.pos.z.toFixed(1), Math.round(e.hp)]) }; }))); }
} finally { await browser.close(); }
