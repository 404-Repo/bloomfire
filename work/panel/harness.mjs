#!/usr/bin/env node
// PLAYER PANEL harness: one emulated phone, one game, one blind tester agent.
//   node panel/harness.mjs --url=http://localhost:8760/ --out=<dir> --port=8770 [--w=390 --h=844] [--cadence=750]
// The game runs on a virtual clock (shim.js): game time only passes inside an /act call, so the agent's thinking
// time costs no game time. Inside an act the harness takes a screenshot every --cadence ms of game time and
// returns them as one contact sheet, plus a text log of every sound (WebAudio and HTMLAudio), console message and
// page error in that stretch. Input is real CDP touch (multi-touch capable). The tester never sees the URL.
// HTTP (GET): /act?s=<script>   /look   /status   /reload   /rotate?o=portrait|landscape   /quit
// Script: commands separated by ';' or ',':  tap x y | hold x y ms | drag x1 y1 x2 y2 ms | down x y [id] |
//         move x y [id] | up [id] | wait ms | swipe x1 y1 x2 y2   (an act may advance at most 8000 ms of game time)
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import { summarise, newState } from './sound.mjs';
const { default: puppeteer } = await import(path.join(os.homedir(), '404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js'));
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const URL0 = arg('url'), OUT = path.resolve(arg('out', 'panel/work/session')), PORT = +arg('port', 8770);
let W = +arg('w', 390), H = +arg('h', 844);
const CAD = Math.max(500, Math.min(1000, +arg('cadence', 500))), MIN = +arg('min', 180), MAXACT = 8000, FRAME = 1000 / 60;
const HERE = path.dirname(new URL(import.meta.url).pathname);
fs.mkdirSync(path.join(OUT, 'f'), { recursive: true });
const log = (o) => fs.appendFileSync(path.join(OUT, 'log.jsonl'), JSON.stringify({ wall: Date.now(), ...o }) + '\n');
const hideUrl = (s) => String(s).replace(/https?:\/\/[^\s)'"]+/g, (u) => '<' + (u.split('?')[0].split('/').pop() || 'url') + '>');

const b = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', '--mute-audio'] });
let sst = newState(), p, cdp, handles = {}, shots = 0, actN = 0, aSeen = 0, cSeen = 0, nodeCons = [], playMs = 0, loads = 0, firstSound = null, anySound = false;
async function open() {
  if (p) await p.close().catch(() => {});
  p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
  if (process.argv.includes('--realtime')) await p.evaluateOnNewDocument('window.__PANEL_REALTIME__ = true');
  await p.evaluateOnNewDocument(fs.readFileSync(path.join(HERE, arg('shim', 'shim.js')), 'utf8'));
  p.on('console', (m) => nodeCons.push({ type: m.type(), text: hideUrl(m.text()).slice(0, 240) }));
  p.on('pageerror', (e) => nodeCons.push({ type: 'pageerror', text: hideUrl(e.message).slice(0, 240) }));
  p.on('framenavigated', (f) => { if (f === p.mainFrame()) { aSeen = 0; cSeen = 0; loads++; sst = newState(); sst.anySound = anySound; nodeCons.push({ type: 'harness', text: 'page (re)loaded' }); } });
  cdp = await p.createCDPSession();
  if (ASSIST?.patch) { // the assist may expose a value the game already computes (read-only), see assist/<game>.mjs
    await p.setRequestInterception(true);
    p.on('request', async (req) => {
      try { if (!ASSIST.patch.match.test(new URL(req.url()).pathname)) return req.continue();
        const body = await (await fetch(req.url())).text(); if (!body.includes(ASSIST.patch.from)) nodeCons.push({ type: 'harness', text: 'assist patch did not apply' });
        return req.respond({ status: 200, contentType: 'text/javascript', body: body.replace(ASSIST.patch.from, ASSIST.patch.to) });
      } catch (e) { req.continue().catch(() => {}); }
    });
  }
  handles = {};
  await p.goto(URL0, { waitUntil: 'load', timeout: 90000 }).catch((e) => nodeCons.push({ type: 'harness', text: 'load slow: ' + e.message.slice(0, 80) }));
  // pump the clock a little so loaders and title screens settle (counts as game time, not play time)
  for (let i = 0; i < 40; i++) { await step(3); await new Promise((r) => setTimeout(r, 25)); }
}
let frozen = 0;
async function step(k) {
  if (process.argv.includes('--realtime')) { await new Promise((r) => setTimeout(r, k * FRAME)); return 0; }
  try { return await Promise.race([p.evaluate((n) => (window.__PANEL__ ? window.__PANEL__.step(n) : 0), k), new Promise((_, rej) => setTimeout(() => rej(new Error('frozen')), 20000))]); }
  catch (e) { if (e.message === 'frozen' && !frozen++) nodeCons.push({ type: 'harness', text: 'the page stopped responding for 20 s (frozen)' }); return 0; }
}
async function shot(frames) {
  const f = path.join(OUT, 'f', `${String(++shots).padStart(5, '0')}.jpg`);
  await Promise.race([p.evaluate(() => window.__PANEL__ && window.__PANEL__.realFrame && window.__PANEL__.realFrame()).catch(() => {}), new Promise((r) => setTimeout(r, 500))]);
  await new Promise((r) => setTimeout(r, 30)); // real-time settle before capture (from game 3 tester.mjs v9.2: HUD text could be captured unpainted)
  try {
    const opt = { path: f, type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: W, height: H, scale: 0.5 } };
    await p.screenshot(opt);
    // judge_final r2: a capture far smaller than the last one is usually a WebGL frame grabbed before it was presented
    // (seen only under this headless harness, never in real-time headed play). Re-shoot once after advancing ONE game frame
    // (16.7 ms, counted in play time). A real fade stays dark on the re-shoot, so it is kept; after 12 dark frames in a row
    // the dark size becomes the new reference.
    const sz = fs.statSync(f).size;
    if (lastShotSize && sz < lastShotSize * 0.4) { await step(1); playMs += FRAME; await Promise.race([p.evaluate(() => window.__PANEL__ && window.__PANEL__.realFrame && window.__PANEL__.realFrame()).catch(() => {}), new Promise((r) => setTimeout(r, 500))]); await new Promise((r) => setTimeout(r, 30)); await p.screenshot(opt); const s2 = fs.statSync(f).size; reshoots++; if (s2 >= lastShotSize * 0.4) { reshootFixed++; lastShotSize = s2; } else if (++smallRun > 12) { lastShotSize = s2; smallRun = 0; } fs.appendFileSync(path.join(OUT, 'reshoot.log'), `${path.basename(f)} ${sz} -> ${s2}\n`); } else { smallRun = 0; lastShotSize = sz; }
    frames.push({ f, t: playMs });
  } catch (e) { nodeCons.push({ type: 'harness', text: 'screenshot failed' }); }
}
let lastShotSize = 0, reshoots = 0, reshootFixed = 0, smallRun = 0;
const gt = () => p.evaluate(() => (window.__PANEL__ ? window.__PANEL__.t : performance.now())).catch(() => 0);
// advance ms of game time, screenshot every CAD ms, call onFrame each frame (for drags)
let sinceShot = 0;
async function advance(ms, frames, onFrame) {
  const n = Math.max(1, Math.round(ms / FRAME));
  for (let i = 0; i < n; i++) {
    if (onFrame) await onFrame(i + 1, n);
    await step(1); playMs += FRAME; sinceShot += FRAME;
    if (sinceShot >= CAD) { sinceShot = 0; await shot(frames); }
  }
}
function parse(s) {
  return String(s).split(/[;,\n]/).map((x) => x.trim()).filter(Boolean).map((c) => { const [op, ...r] = c.split(/\s+/); return { op: op.toLowerCase(), a: r.map(Number) }; });
}
async function runScript(cmds, frames) {
  let budget = MAXACT; const done = [];
  for (const { op, a } of cmds) {
    if (budget <= 0) { done.push('(stopped: act limit 8000 ms of game time)'); break; }
    const ms = (x) => Math.max(FRAME, Math.min(budget, x || 0));
    if (op === 'tap') { const h = await p.touchscreen.touchStart(a[0], a[1]); await advance(50, frames); await h.end(); await advance(ms(50), frames); budget -= 100; } /* a real tap lasts about 50 ms */
    else if (op === 'hold') { const h = await p.touchscreen.touchStart(a[0], a[1]); const t = ms(a[2] || 500); await advance(t, frames); await h.end(); budget -= t; }
    else if (op === 'drag' || op === 'swipe') {
      const t = ms(op === 'swipe' ? (a[4] || 200) : (a[4] || 500)); const h = await p.touchscreen.touchStart(a[0], a[1]);
      await advance(t, frames, async (i, n) => { await h.move(a[0] + (a[2] - a[0]) * i / n, a[1] + (a[3] - a[1]) * i / n); });
      await h.end(); budget -= t;
    }
    else if (op === 'down') { const id = a[2] || 1; if (handles[id]) await handles[id].end().catch(() => {}); handles[id] = await p.touchscreen.touchStart(a[0], a[1]); await advance(FRAME, frames); }
    else if (op === 'move') { const id = a[2] || 1; if (handles[id]) await handles[id].move(a[0], a[1]); await advance(FRAME, frames); }
    else if (op === 'up') { const id = a[0] || 1; if (handles[id]) { await handles[id].end().catch(() => {}); delete handles[id]; } await advance(FRAME, frames); }
    else if (op === 'wait') { const t = ms(a[0] || 500); await advance(t, frames); budget -= t; }
    else { done.push(`(unknown command "${op}" ignored)`); continue; }
    done.push(`${op} ${a.join(' ')}`.trim());
  }
  return done;
}
let actVt0 = 0, actPlay0 = 0;
async function mark() { actVt0 = await gt(); actPlay0 = playMs; }
async function drain() {
  let pa = { audio: [], cons: [], ctx: [] };
  try { pa = await p.evaluate((a0, c0) => ({ audio: window.__PANEL__ ? window.__PANEL__.audio.slice(a0) : [], cons: window.__PANEL__ ? window.__PANEL__.cons.slice(c0) : [], ctx: window.__PANEL__ ? window.__PANEL__.ctxs.map((c) => c.state) : [] }), aSeen, cSeen); } catch (e) {}
  aSeen += pa.audio.length; cSeen += pa.cons.length;
  for (const e of pa.audio) e.t = Math.max(0, actPlay0 + (e.t - actVt0)); /* game-clock ms -> play-time ms */
  const cons = [...pa.cons.map((c) => ({ type: c.type, text: hideUrl(c.text) })), ...nodeCons.splice(0)];
  if (pa.audio.some((x) => !['ctx', 'decode', 'stop'].includes(x.kind) && (!x.ctxState || x.ctxState === 'running'))) { anySound = true; if (firstSound === null) firstSound = +(playMs / 1000).toFixed(1); }
  return { audio: pa.audio, cons, ctx: pa.ctx };
}
function sheet(frames) {
  const out = path.join(OUT, `sheet_${String(actN).padStart(4, '0')}.jpg`);
  try { execFileSync('python3', [path.join(HERE, 'sheet.py'), out, ...frames.flatMap((x) => [x.f, (x.t / 1000).toFixed(1)])]); return out; } catch (e) { return frames.length ? frames[frames.length - 1].f : null; }
}
function report(frames, done, d) {
  const lines = [];
  lines.push(`ACT ${actN}: did [${done.join('; ')}]`);
  lines.push(`play time so far: ${(playMs / 1000).toFixed(1)} s of game time (minimum session ${MIN} s)`);
  const sh = sheet(frames), last = frames.length ? frames[frames.length - 1].f : null;
  lines.push(`frames: ${frames.length} screenshots, every ${CAD} ms of game time, in one contact sheet (left to right, oldest first, scaled down): ${sh}`);
  lines.push(`latest frame at exact touch coordinates (${W}x${H}, pixel = touch point): ${last}`);
  lines.push('SOUND (what a player would hear in this stretch):');
  for (const l of summarise(d.audio, sst, playMs)) lines.push('  ' + l);
  const seen = new Map(); for (const c of d.cons) { const k = c.type + ':' + c.text; seen.set(k, (seen.get(k) || 0) + 1); }
  if (seen.size) { lines.push('CONSOLE:'); let i = 0; for (const [k, n] of seen) { if (i++ >= 12) { lines.push(`  ... ${seen.size - 12} more distinct lines`); break; } lines.push(`  ${k}${n > 1 ? `  (x${n})` : ''}`); } }
  return lines.join('\n');
}
for (const sig of ['SIGTERM', 'SIGINT', 'SIGHUP']) process.on(sig, () => { b.process()?.kill('SIGKILL'); process.exit(0); });
// MOVEMENT ASSIST (--assist=<name> loads assist/<name>.mjs): /places lists destinations, /goto?to=<place> walks there.
const ASSIST = arg('assist') ? await import(path.join(HERE, 'assist', arg('assist') + '.mjs')) : null;
let assist = null, gotoBudget = 0;
const assistCtx = { page: () => p, frames: async (n) => { if (gotoBudget <= 0) throw Error('took more than 60 s of game time, stopped'); gotoBudget -= n * FRAME; await advance(n * FRAME, assistCtx.out); } };
await open();
if (ASSIST) assist = await ASSIST.init(assistCtx);
log({ e: 'start', w: W, h: H, cadence: CAD });
http.createServer(async (q, r) => {
  const u = new URL(q.url, 'http://x'); let text = '';
  try {
    if (u.pathname === '/act') { actN++; const frames = []; await mark(); const done = await runScript(parse(u.searchParams.get('s') || 'wait 1000'), frames); if (!frames.length || sinceShot > 0) { await shot(frames); } const d = await drain(); text = report(frames, done, d); log({ e: 'act', n: actN, s: u.searchParams.get('s'), done, playMs, audio: d.audio, cons: d.cons, frames: frames.map((x) => x.f) }); }
    else if (u.pathname === '/places') text = assist ? 'PLACES you can ask to walk to (/goto?to=<name>):\n' + (await assist.places()).map((x) => '  ' + x).join('\n') : 'no movement assist for this game: use direct touch control';
    else if (u.pathname === '/goto') {
      if (!assist) text = 'no movement assist for this game';
      else { actN++; const frames = []; await mark(); for (const h of Object.values(handles)) await h.end().catch(() => {}); handles = {};
        assistCtx.out = frames; gotoBudget = 60000; const res = await assist.goto(u.searchParams.get('to') || ''); await assist.release?.();
        if (!frames.length || sinceShot > 0) await shot(frames); const d = await drain(); text = report(frames, [`goto "${u.searchParams.get('to')}": ${res}`], d); log({ e: 'goto', n: actN, to: u.searchParams.get('to'), res, playMs, audio: d.audio, cons: d.cons }); }
    }
    else if (u.pathname === '/look') { actN++; const frames = []; await mark(); await shot(frames); const d = await drain(); text = report(frames, ['look (no time passed)'], d); log({ e: 'look', n: actN, audio: d.audio, cons: d.cons }); }
    else if (u.pathname === '/reload') { await open(); text = 'reloaded the page (game restarted from its first screen). Use /look.'; log({ e: 'reload', playMs }); }
    else if (u.pathname === '/rotate') { const o = u.searchParams.get('o'); const land = o === 'landscape'; [W, H] = land ? [Math.max(W, H), Math.min(W, H)] : [Math.min(W, H), Math.max(W, H)]; await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await step(10); text = `phone is now ${land ? 'landscape' : 'portrait'} ${W}x${H}. Use /look.`; log({ e: 'rotate', o }); }
    else if (u.pathname === '/status') text = JSON.stringify({ playSeconds: +(playMs / 1000).toFixed(1), acts: actN, screen: `${W}x${H}`, anySoundSoFar: anySound, firstSoundAtPlaySecond: firstSound, reloads: loads - 1 });
    else if (u.pathname === '/eval' && process.argv.includes('--debug')) text = JSON.stringify(await p.evaluate(u.searchParams.get('js')));
    else if (u.pathname === '/quit') { text = 'bye'; log({ e: 'quit', playMs }); r.end(text); await b.close(); process.exit(0); }
    else text = 'unknown endpoint';
  } catch (e) { text = 'harness error: ' + hideUrl(e.message).slice(0, 200); }
  r.writeHead(200, { 'Content-Type': 'text/plain' }); r.end(text + '\n');
}).listen(PORT, () => console.log('panel harness on', PORT));
