// BLOOMFIRE's own gate. Plays the game on a phone with REAL multi-touch through CDP: the left thumb holds the
// stick and steers toward the objective, the right thumb drags the look toward the nearest ink (read from
// __GAME__.aim, which is where the target IS, never how to shoot it) and keeps the pitch level otherwise.
// Firing is whatever the game does with a real thumb on target (auto-fire) or the FIRE button.
// Asserts the genre happened: moved, fired, killed, painted; and the jam budgets. Frames in motion.
//   node tools/fpsgate.mjs [--url=http://localhost:8797/] [--secs=90] [--w=844 --h=390] [--out=dir] [--until=cleansed:1] [--q=]
import puppeteer from 'puppeteer';
import fs from 'fs';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const URL_ = arg('url', 'http://localhost:8797/'), SECS = +arg('secs', 90), W = +arg('w', 844), H = +arg('h', 390);
const OUT = arg('out', '/Users/atlas/astrocade-game5/work/gate/last'), UNTIL = arg('until', '');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const fails = [], notes = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = [], missing = [];
  page.on('console', (m) => { if (m.text().startsWith('NODE')) console.log(m.text().slice(0,300)); if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400) missing.push(r.status() + ' ' + r.url()); });
  const t0 = Date.now();
  await page.goto(URL_ + (arg('q') ? '?' + arg('q') : ''), { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction('window.__READY__ === true', { timeout: 60000 });
  const readyS = (Date.now() - t0) / 1000;
  const G = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__GAME__)));
  // start with a real tap on the real button
  const sb = await page.$eval('#startb', (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.touchscreen.tap(sb[0], sb[1]); await sleep(1500);
  const g0 = await G();
  if (g0.mode !== 'play') fails.push('a real tap on #startb did not start the game (mode ' + g0.mode + ')');
  const cdp = await page.target().createCDPSession();
  const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, p]) => ({ x: p[0], y: p[1], id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); if (fingers.size) await send('touchStart'); };
  const stickBox = await page.$eval('#stickb', (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const SX = stickBox[0], SY = stickBox[1];
  const LX0 = W * (H > W ? 0.55 : 0.62), LY0 = H * (H > W ? 0.42 : 0.42);
  await down(1, SX, SY); await sleep(60); await down(2, LX0, LY0);
  let bloomsUsed = 0, dashes = 0, lx = LX0, ly = LY0, start = Date.now(), lastShot = 0, shotN = 0, peakD = 0, peakT = 0, path = 0, last = g0.pos;
  const series = [];
  const route = (arg('route', '') || '').split(';').filter(Boolean).map((s) => s.split(',').map(Number));
  while ((Date.now() - start) / 1000 < SECS) {
    const g = await G();
    peakD = Math.max(peakD, g.draws); peakT = Math.max(peakT, g.tris);
    path += Math.hypot(g.pos[0] - last[0], g.pos[1] - last[1]); last = g.pos;
    // where to walk: the route, else the nearest inkwell, else the summit
    let tgt = route.length ? route[0] : (g.well || [40, -286]);
    if (route.length && Math.hypot(tgt[0] - g.pos[0], tgt[1] - g.pos[1]) < 4) route.shift();
    const dx = tgt[0] - g.pos[0], dz = tgt[1] - g.pos[1], d = Math.hypot(dx, dz) || 1;
    const fx = -Math.sin(g.yaw), fz = -Math.cos(g.yaw), rx = Math.cos(g.yaw), rz = -Math.sin(g.yaw);
    let my = (dx * fx + dz * fz) / d, mx = (dx * rx + dz * rz) / d;
    const fighting = (g.near && g.near[2] < 45) && g.enemies > 0;
    if (fighting) { my *= 0.25; mx = Math.sin(Date.now() / 700) * 0.6; }   // strafe while fighting
    if (d < 6 && !fighting) { my = 0.2; }
    await move(1, SX + mx * 48, SY - my * 48);
    // look: toward the target on screen, else toward the walking direction with a level pitch
    // a thumb moves in small steps toward where it wants to look (the game's look speed is ~0.0058 rad/px plus a little acceleration)
    let aim = null;
    if (g.near && g.near[2] < 45) aim = g.near;
    if (g.nearNode && g.nearNode[2] < 40 && !(g.near && g.near[2] < 10 && g.enemies > 0)) aim = g.nearNode;
    let dyaw, dpitch;
    if (aim) { dyaw = aim[0]; dpitch = aim[1]; }
    else { const want = Math.atan2(-dx, -dz); dyaw = want - g.yaw; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw)); dpitch = -0.03 - g.pitch; }
    let ddx = Math.max(-12, Math.min(12, -dyaw / 0.0072 * 0.6)), ddy = Math.max(-12, Math.min(12, -dpitch / (0.0072 * 0.8) * 0.6));
    lx += ddx; ly += ddy;
    if (lx < W * 0.5 || lx > W - 20 || ly < 20 || ly > H - 20) { await up(2); lx = LX0; ly = LY0; await down(2, lx, ly); }
    else await move(2, lx, ly);
    // the buttons, pressed by a third finger like a thumb would
    const tapBtn = async (sel) => { const b = await page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await down(3, b[0], b[1]); await sleep(50); await up(3); };
    if (g.bloom >= 1 && g.enemies >= 4 && g.near && g.near[2] < 14) { await tapBtn('#bbloom'); bloomsUsed++; }
    if (g.hp < 40 && g.near && g.near[2] < 4 && Math.random() < 0.3) { await tapBtn('#bdash'); dashes++; }
    const el = (Date.now() - start) / 1000;
    if (el - lastShot > SECS / 8 && shotN < 8) { lastShot = el; await page.screenshot({ path: `${OUT}/f${shotN++}.jpg`, type: 'jpeg', quality: 80 }); }
    series.push({ t: +el.toFixed(1), pos: g.pos, kills: g.kills, shots: g.shots, restored: g.restored, hp: g.hp, stage: g.stage, cleansed: g.cleansed, score: g.score });
    if (UNTIL) { const [k, v] = UNTIL.split(':'); if (g[k] >= +v) { notes.push(`reached ${k} ${g[k]} at ${el.toFixed(0)} s`); break; } }
    await sleep(110);
  }
  await up(2); await up(1);
  await sleep(800); await page.screenshot({ path: `${OUT}/end.jpg`, type: 'jpeg', quality: 80 });
  const g = await G();
  fs.writeFileSync(`${OUT}/series.json`, JSON.stringify(series));
  const moved = Math.hypot(g.pos[0] - g0.pos[0], g.pos[1] - g0.pos[1]);
  const gpu = await page.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); const x = c.getExtension('WEBGL_debug_renderer_info'); return c.getParameter(x.UNMASKED_RENDERER_WEBGL); });
  if (path < 30) fails.push(`walked only ${path.toFixed(1)} m`);
  if (g.shots < 20) fails.push(`fired ${g.shots} shots`);
  if (g.kills < 5) fails.push(`killed ${g.kills}`);
  if (g.restored <= 0.05) fails.push(`restored only ${g.restored}%`);
  if (peakD > 900) fails.push(`peak draws ${peakD} > 900`); if (peakT > 1.5e6) fails.push(`peak tris ${peakT} > 1.5M`);
  if (errs.length) fails.push(`${errs.length} console errors: ${errs[0]}`);
  if (missing.length) fails.push(`${missing.length} failed requests: ${missing[0]}`);
  const report = { url: URL_, viewport: `${W}x${H}`, gpu, readyS, secs: +((Date.now() - start) / 1000).toFixed(0), path_m: +path.toFixed(1), moved_m: +moved.toFixed(1),
    shots: g.shots, kills: g.kills, score: g.score, restored: g.restored, stage: g.stage, cleansed: g.cleansed, hp: g.hp, deaths: g.deaths, bloomsUsed, dashes, lenses: g.lenses, bestCombo: null, peakDraws: peakD, peakTris: peakT, fps: g.fps, notes, fails };
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  console.log(fails.length ? 'GATE: FAIL' : 'GATE: PASS');
} finally { await browser.close(); }
process.exit(fails.length ? 1 : 0);
