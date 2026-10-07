// GUARDIANS OF THE ROCK (flying-boat sim): quick sortie; fly with the stick, cycle View to a gun, aim with stick, fire.
import { open, sleep } from './lib.mjs';
const L = process.argv[2] !== 'P';
const DUR = +(process.argv[3] || 180) * 1000;
const OUT = process.env.OUT || '/Users/atlas/astrocade-game5/research/fps_field/_scratch/raw/guardians';
const s = await open('https://tommyhgunz14.github.io/202/', { w: L ? 844 : 390, h: L ? 390 : 844, out: OUT });
const { T, page } = s;
const box = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, vis: r.width > 0 && getComputedStyle(e).display !== 'none' }; }).catch(() => null);
const full = () => page.evaluate(() => { const g = window.__GAME__; const o = {}; for (const k in g) if (typeof g[k] !== 'object' || Array.isArray(g[k])) o[k] = g[k]; return o; });
const hudText = () => page.evaluate(() => [...document.querySelectorAll('#log, .log, #hud-log, #msg, .toast, #objective, #brief')].map((e) => e.innerText.trim().replace(/\s+/g, ' ').slice(0, 160)).filter(Boolean).join(' || '));
try {
  console.log('gpu', await s.gpu());
  await page.waitForSelector('#startb', { visible: true, timeout: 90000 }); await sleep(2000);
  await s.snap('title');
  const sb = await box('#startb'); await T.tap(sb.cx, sb.cy);
  const t0 = Date.now(); let ticks = 0, phase = 0, viewTaps = 0; const fpsS = [];
  await sleep(4000); await s.snap('brief');
  console.log((await s.ui()).filter((l) => !/^(p|b|span|small|strong|em|h\d|li|i|td|tr|th)#/.test(l)).slice(0, 40).join('\n'));
  // tap through any briefing buttons
  for (let i = 0; i < 6; i++) { const c = await s.clickText(/^(continue|begin|start|take off|fly|launch|go|ok|skip|press on|next).{0,12}$/); if (!c) break; console.log('tapped', c); await sleep(1500); }
  const stick = await box('#stick'); console.log('stick', JSON.stringify(stick));
  let fireB = await box('#bfire'), viewB = await box('#bview');
  let stickDown = false, fd = false; const ffB = await box('#bff'); await sleep(2000); await T.down(3, ffB.cx, ffB.cy); await sleep(60); await T.up(3); console.log('tapped press-on');
  while (Date.now() - t0 < DUR) {
    const g = await full(); ticks++;
    const el = (Date.now() - t0) / 1000;
    if (stick && stick.vis && viewTaps >= 3) {
      if (!stickDown) { await T.down(1, stick.cx, stick.cy); stickDown = true; }
      await T.move(1, stick.cx + Math.sin(el / 2) * stick.w * 0.25, stick.cy + Math.cos(el / 3) * stick.h * 0.1);
    }
    if (el > 45 && viewTaps < 3 && ticks % 100 === 0 && viewB) { await T.down(3, viewB.cx, viewB.cy); await sleep(60); await T.up(3); viewTaps++; console.log('VIEW tap', viewTaps); await sleep(600); await s.snap('view' + viewTaps); }
    if (fireB && viewTaps >= 3) { const want = ticks % 30 < 12; if (want && !fd) { await T.down(2, fireB.cx, fireB.cy); fd = true; } else if (!want && fd) { await T.up(2); fd = false; } }
    if (ticks % 50 === 0) { fpsS.push(g.fps); console.log(`[${el.toFixed(0)}s] ${JSON.stringify(g).slice(0, 260)} | ${(await hudText()).slice(0, 200)}`); }
    if (ticks % 110 === 55) await s.snap('play');
    await sleep(40);
  }
  if (stickDown) await T.up(1);
  console.log('fps med', Math.round(fpsS.sort((a, b) => a - b)[fpsS.length >> 1]));
  await s.snap('end'); console.log('errs', s.errs.slice(0, 4));
} finally { await s.browser.close(); }
