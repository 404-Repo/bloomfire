import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8797/?at=-100,76,0.9,0.05', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  await page.evaluate(() => window.__START__()); await sleep(6000);
  console.log(JSON.stringify(await page.evaluate(() => { const g = window.__GAME__; return [g.pos, g.y, g.stage, g.nodesOpen, g.nearNode, g.lock, g.shots, g.enemies]; })));
  const m = await import('file:///dev/null').catch(() => null);
  console.log(JSON.stringify(await page.evaluate(async () => {
    const C = await import('./src/collide.js'); const out = [];
    for (const c of C.nearby(-110, 86, 12)) out.push([c.kind, +c.x.toFixed(1), +c.z.toFixed(1), +(c.hw || c.r || 0).toFixed(2), +(c.hd || 0).toFixed(2), +c.y0.toFixed(1), +c.top.toFixed(1), !!c.noRay]);
    return out; })));
  await page.screenshot({ path: '/Users/atlas/astrocade-game5/work/lead_scratch/well.jpg' });
} finally { await browser.close(); }
