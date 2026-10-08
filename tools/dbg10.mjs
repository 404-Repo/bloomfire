import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8797/?stage1&at=-104,80,0.62,0.35', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  await page.evaluate(() => window.__START__()); await sleep(9000);
  console.log(JSON.stringify(await page.evaluate(async () => {
    const W = await import('./src/weapon.js'); const D = window.__DBG2__; const { camera, THREE } = window.__DBG__;
    const o = camera.position.clone(); const out = [];
    for (const t of D.targets()) { if (t.kind !== 'node') continue; const d = t.pos.clone().sub(o); const dist = d.length(); d.normalize();
      const wr = W.worldRay(o, d, dist - t.r); const cd = new THREE.Vector3(); camera.getWorldDirection(cd);
      out.push({ dist: +dist.toFixed(1), wr: +wr.toFixed(2), ang: +(Math.acos(cd.dot(d)) * 57.3).toFixed(1), y: +t.pos.y.toFixed(1) }); }
    return { cam: o.toArray().map((v) => +v.toFixed(1)), lock: !!D.WPN.lock, la: D.WPN.lockAngle, g: window.__GAME__.wellState, out };
  })));
} finally { await browser.close(); }
