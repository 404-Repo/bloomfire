// Dev look: load the game on a phone landscape viewport, real tap to start, optional real-touch play, frames + errors.
//   node tools/shot.mjs [--w=844 --h=390] [--secs=6] [--out=dir] [--q=query] [--walk] [--look=dx]
import puppeteer from 'puppeteer';
import fs from 'fs';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const W = +arg('w', 844), H = +arg('h', 390), OUT = arg('out', '/Users/atlas/astrocade-game5/work/lead_scratch/shot'), SECS = +arg('secs', 6);
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = []; page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); page.on('requestfailed', (r) => errs.push('reqfail ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  const t0 = Date.now();
  await page.goto('http://localhost:8797/' + (arg('q') ? '?' + arg('q') : ''), { waitUntil: 'load' });
  await page.waitForFunction('window.__READY__ === true', { timeout: 90000 }).catch(() => errs.push('NOT READY'));
  console.log('ready', (Date.now() - t0) / 1000, 's');
  await page.screenshot({ path: OUT + '/0_title.jpg', quality: 80 });
  const b = await page.$eval('#startb', (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.touchscreen.tap(b[0], b[1]); await sleep(1500);
  const cdp = await page.target().createCDPSession();
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  if (process.argv.includes('--walk')) {
    const sx = 100, sy = H - 80, lx = W * 0.7, ly = H * 0.45;
    await touch('touchStart', [{ x: sx, y: sy, id: 1 }]); await touch('touchMove', [{ x: sx, y: sy - 50, id: 1 }]);
    await touch('touchStart', [{ x: sx, y: sy - 50, id: 1 }, { x: lx, y: ly, id: 2 }]);
    const n = SECS * 5; let cx = lx; const ldx = +arg('look', 0);
    for (let i = 0; i < n; i++) { cx += ldx; await touch('touchMove', [{ x: sx, y: sy - 50, id: 1 }, { x: cx, y: ly, id: 2 }]); await sleep(200); if (i % 5 === 4) await page.screenshot({ path: `${OUT}/${String(i).padStart(3, '0')}.jpg`, quality: 75 }); }
    await touch('touchEnd', []);
  } else { await sleep(SECS * 1000); await page.screenshot({ path: OUT + '/1_play.jpg', quality: 80 }); }
  const g = await page.evaluate(() => JSON.stringify(window.__GAME__));
  console.log(g);
  const gpu = await page.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); const d = c.getExtension('WEBGL_debug_renderer_info'); return c.getParameter(d.UNMASKED_RENDERER_WEBGL); });
  console.log('gpu', gpu); console.log(errs.slice(0, 20).join('\n'));
} finally { await browser.close(); }
