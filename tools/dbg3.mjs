import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  for (let run = 0; run < 3; run++) {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8797/', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  const sb = await page.$eval('#startb', (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.touchscreen.tap(sb[0], sb[1]); await sleep(7500);
  const r = await page.evaluate(() => {
    const D = window.__DBG2__; const { camera, THREE } = window.__DBG__; const d = new THREE.Vector3(); camera.getWorldDirection(d);
    return { g: { shots: window.__GAME__.shots, kills: window.__GAME__.kills, mode: window.__GAME__.mode, pitch: window.__GAME__.pitch }, touch: document.body.classList.contains('touchdev'), lock: !!D.WPN.lock, assist: D.WPN.assist,
      en: D.ENEMIES.map((e) => { const v = new THREE.Vector3(e.pos.x, e.pos.y + e.t.coreY, e.pos.z).sub(camera.position); const dist = v.length(); v.normalize(); return [e.type, e.state, +dist.toFixed(1), +(Math.acos(v.dot(d)) * 57.3).toFixed(1)]; }) };
  });
  console.log(JSON.stringify(r));
  await page.close();
  }
} finally { await browser.close(); }
