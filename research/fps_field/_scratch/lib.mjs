import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire('/Users/atlas/404-game-recipe/node_modules/x.js');
const puppeteer = require('puppeteer');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function open(url, { w = 844, h = 390, out, patch } = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 200)));
  if (patch) {
    await page.setRequestInterception(true);
    page.on('request', async (req) => {
      if (patch[0].test(req.url()) && req.resourceType() === 'script') {
        try { const r = await fetch(req.url()); const t = await r.text(); const n = patch[1](t); if (n === t) console.log('PATCH NO-OP', req.url()); await req.respond({ status: 200, contentType: 'application/javascript', body: n }); } catch (e) { console.log('patch fail', e.message); req.continue(); }
      } else req.continue();
    });
  }
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  const cdp = await page.target().createCDPSession();
  const touches = new Map();
  const send = async (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...touches.entries()].map(([id, p]) => ({ x: p.x, y: p.y, id, radiusX: 8, radiusY: 8, force: 1 })) });
  const T = {
    async down(id, x, y) { touches.set(id, { x, y }); await send('touchStart'); },
    async move(id, x, y) { touches.set(id, { x, y }); await send('touchMove'); },
    async up(id) { touches.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); if (touches.size) await send('touchStart'); },
    async tap(x, y) { await T.down(9, x, y); await sleep(70); await T.up(9); },
    async drag(id, x0, y0, dx, dy, steps = 10, ms = 20) { await T.down(id, x0, y0); for (let i = 1; i <= steps; i++) { await T.move(id, x0 + dx * i / steps, y0 + dy * i / steps); await sleep(ms); } await T.up(id); },
    held: () => touches,
  };
  if (out) fs.mkdirSync(out, { recursive: true });
  let n = 0;
  const snap = async (name) => { const f = `${out}/${String(n++).padStart(2, '0')}_${w > h ? 'L' : 'P'}_${name}.jpg`; await page.screenshot({ path: f, type: 'jpeg', quality: 80 }); return f; };
  const G = () => page.evaluate(() => { const g = window.__GAME__; if (!g) return null; const o = {}; for (const k in g) { const v = g[k]; if (typeof v !== 'object' || v === null || Array.isArray(v) && v.length < 4 && v.every((x) => typeof x !== 'object')) o[k] = v; } return o; });
  const gpu = () => page.evaluate(() => { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl'); const e = gl.getExtension('WEBGL_debug_renderer_info'); return gl.getParameter(e.UNMASKED_RENDERER_WEBGL); } catch (e) { return 'n/a ' + e.message; } });
  // list visible interactive / touch elements with rects
  const ui = () => page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('button, a, [id], [role=button]')) {
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
      if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) continue;
      if (r.width >= innerWidth * 0.98 && r.height >= innerHeight * 0.98) continue;
      const txt = (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      out.push(`${e.tagName.toLowerCase()}#${e.id || ''}.${(e.className && e.className.baseVal === undefined ? e.className : '').toString().split(' ')[0]} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}] "${txt}"`);
    }
    return out;
  });
  const clickText = async (re) => {
    const pt = await page.evaluate((src) => { const rx = new RegExp(src, 'i'); for (const e of document.querySelectorAll('button, a, [role=button], .btn, div, span')) { const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const t = (e.innerText || '').trim(); if (t.length < 60 && rx.test(t) && (e.tagName === 'BUTTON' || e.tagName === 'A' || e.children.length === 0)) return { x: r.x + r.width / 2, y: r.y + r.height / 2, t }; } return null; }, re.source);
    if (pt && pt.x > 0 && pt.y > 0 && pt.x < w && pt.y < h) { await T.tap(pt.x, pt.y); return pt.t; } return null;
  };
  return { browser, page, cdp, T, snap, G, gpu, ui, errs, clickText, w, h };
}
