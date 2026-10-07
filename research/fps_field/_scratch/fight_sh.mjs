// SHARDS (third-person ARPG): left thumb stick steers toward the nearest target on screen, right thumb holds ATTACK.
import { open, sleep } from './lib.mjs';
const L = process.argv[2] !== 'P';
const DUR = +(process.argv[3] || 150) * 1000;
const OUT = process.env.OUT || '/Users/atlas/astrocade-game5/research/fps_field/_scratch/raw/shards';
const s = await open('https://matidendrite.github.io/shards-of-the-blighted-march/', { w: L ? 844 : 390, h: L ? 390 : 844, out: OUT });
const { T, page } = s;
const box = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; });
const full = () => page.evaluate(() => { const g = window.__GAME__; return { pos: g.pos, hp: g.hp, kills: g.kills, hits: g.hits, attacks: g.attacks, fps: g.fps, draws: g.draws, tris: g.tris, over: g.over, targets: (g.targets || []).filter((t) => t.hp > 0), shard: g.shard, cam: g.camera, req: g.requiredKills, inTown: g.inTown }; });
try {
  console.log('gpu', await s.gpu());
  await sleep(5000); await s.snap('menu');
  const sb = await box('#startb'); await T.tap(sb.cx, sb.cy); await sleep(3500);
  console.log((await s.ui()).filter((l) => /#(stick|attack|dodge|cleave|slam|cry|weapon-button|menu-button|camera-reset|map-button|bag-button|potion-button)\./.test(l)).join('\n'));
  await s.snap('start');
  const stick = await box('#stick'), atk = await box('#attack');
  let g = await full(); console.log('cam', JSON.stringify(g.cam).slice(0, 300));
  // check: stick + camera-drag together
  await T.down(1, stick.cx, stick.cy); await T.move(1, stick.cx, stick.cy - 30); await sleep(600);
  const c0 = JSON.stringify((await full()).cam).slice(0, 120);
  await T.down(2, s.w * 0.55, s.h * 0.35); for (let i = 1; i <= 10; i++) { await T.move(2, s.w * 0.55 + i * 10, s.h * 0.35); await sleep(20); } await T.up(2); await sleep(300);
  const c1 = JSON.stringify((await full()).cam).slice(0, 120);
  console.log('CAM before/after 100px drag while stick held:\n ', c0, '\n ', c1);
  const t0 = Date.now(); let lastPos = null, stuck = 0, wpi = 0; let firstKill = null, last = 0, ticks = 0, atkDown = false, contact = null; const fpsS = [];
  while (Date.now() - t0 < DUR) {
    g = await full(); ticks++;
    if (g.over) { console.log('OVER at', ((Date.now() - t0) / 1000).toFixed(1)); await s.snap('over'); break; }
    const px = s.w / 2, py = s.h * 0.55;
    const ts = g.targets.map((t) => ({ ...t, d: Math.hypot(t.x - g.pos[0], t.z - g.pos[1]) })).sort((a, b) => a.d - b.d);
    const t = ts[0];
    if (t && t.d < 20 && contact === null) { contact = (Date.now() - t0) / 1000; console.log('CONTACT <20m', contact.toFixed(1)); }
    let mx = 0, my = 0;
    const WP = JSON.parse(process.env.WP || '[]'); while (wpi < WP.length && Math.hypot(WP[wpi][0] - g.pos[0], WP[wpi][1] - g.pos[1]) < 1.5) wpi++;
    const goal = t && t.d < 9 ? t : wpi < WP.length ? { x: WP[wpi][0], z: WP[wpi][1], d: 99 } : (ts.find((q) => q.kind !== 'wolf') || t);
    if (goal) { const yaw = g.cam.yaw || 0; const dx = goal.x - g.pos[0], dz = goal.z - g.pos[1], dd = Math.hypot(dx, dz) || 1; const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw); mx = (dx * rx + dz * rz) / dd; my = -(dx * fx + dz * fz) / dd; if (goal.d < 2.2) { mx *= 0.2; my *= 0.2; } }
    if (lastPos && Math.hypot(g.pos[0] - lastPos[0], g.pos[1] - lastPos[1]) < 0.02 && Math.hypot(mx, my) > 0.5) stuck++; else stuck = Math.max(0, stuck - 1);
    lastPos = g.pos; if (stuck > 15) { const a = (stuck % 60 < 30 ? 1 : -1); const ox = mx; mx = -my * a; my = ox * a; if (stuck > 90) stuck = 0; }
    await T.move(1, stick.cx + mx * 30, stick.cy + my * 30);
    const wantAtk = t && t.d < 6;
    if (wantAtk && !atkDown) { await T.down(2, atk.cx, atk.cy); atkDown = true; } else if (!wantAtk && atkDown) { await T.up(2); atkDown = false; }
    if (g.kills > last) { if (firstKill === null) { firstKill = (Date.now() - t0) / 1000; console.log('FIRST KILL', firstKill.toFixed(1)); } last = g.kills; if (g.kills <= 2) await s.snap('kill' + g.kills); }
    if (ticks % 40 === 0) { fpsS.push(g.fps); console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] kills ${g.kills}/${g.req} hp ${g.hp} pos ${g.pos.map((v) => v.toFixed(1))} wp ${wpi} near ${t ? t.kind + ' ' + t.d.toFixed(0) + 'm' : '-'} attacks ${g.attacks} hits ${g.hits} | draws ${g.draws} tris ${g.tris} fps ${Math.round(g.fps)}`); }
    if (ticks % 90 === 45) await s.snap('play');
    await sleep(40);
  }
  if (atkDown) await T.up(2); await T.up(1);
  g = await full(); console.log(`END kills ${g.kills} firstKill ${firstKill} contact ${contact} hits ${g.hits} hp ${g.hp} fps med ${Math.round(fpsS.sort((a, b) => a - b)[fpsS.length >> 1])}`);
  await s.snap('end'); console.log('errs', s.errs.slice(0, 4));
} finally { await s.browser.close(); }
