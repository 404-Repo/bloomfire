import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('console', (m) => console.log('[c]', m.text().slice(0, 200)));
  await page.goto('http://localhost:8797/', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  await page.evaluate(() => window.__START__()); await sleep(7000);
  const r = await page.evaluate(() => {
    const D = window.__DBG2__ || window.__DBG__; const { camera, THREE } = window.__DBG__;
    const tg = D.targets(); const d = new THREE.Vector3(); camera.getWorldDirection(d);
    return { n: tg.length, cam: camera.position.toArray().map((v) => +v.toFixed(1)), dir: d.toArray().map((v) => +v.toFixed(2)),
      t: tg.slice(0, 5).map((t) => ({ kind: t.kind, pos: t.pos.toArray().map((v) => +v.toFixed(1)), r: t.r, ang: +(Math.acos(t.pos.clone().sub(camera.position).normalize().dot(d)) * 57.3).toFixed(1) })),
      lock: !!D.WPN.lock, la: D.WPN.lockAngle, en: D.ENEMIES.map((e) => [e.type, e.state, +e.pos.x.toFixed(1), +e.pos.y.toFixed(1), +e.pos.z.toFixed(1)]) };
  });
  console.log(JSON.stringify(r, null, 1));
} finally { await browser.close(); }
