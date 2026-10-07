// BLACKSITE: thumbs-only play (left thumb = stick, right thumb = look OR fire), real CDP multi-touch.
import { open, sleep } from './lib.mjs';
const L = process.argv[2] !== 'P';
const DUR = +(process.argv[3] || 150) * 1000;
const OUT = process.env.OUT || '/Users/atlas/astrocade-game5/research/fps_field/_scratch/raw/blacksite';
const s = await open('https://dairus01.github.io/blacksite/', { w: L ? 844 : 390, h: L ? 390 : 844, out: OUT, patch: [/main\.js/, (t) => t.replace('window.__READY__ = true;', 'window.__READY__ = true; window.__PL__ = player;')] });
const { T, page, G } = s;
const box = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; });
const full = () => page.evaluate(() => window.__GAME__);
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
try {
  console.log('gpu', await s.gpu());
  await sleep(4000);
  const sb = await box('#startb'); await T.tap(sb.cx, sb.cy); await sleep(2500);
  const ui = await s.ui(); console.log(ui.filter((l) => /#(stick|look|fire|ads|reload|jump|swap|camera-button|menu-button|crouch|use|frag|heal|smoke|plate|map)\./.test(l)).join('\n'));
  await s.snap('deploy');
  const stick = await box('#stick'), look = await box('#look'), fire = await box('#fire');
  const SENS = 1.25 * 0.00235; // from source; verified below
  // calibrate: hold stick forward, read facing from velocity, drag 120px right, read again
  await T.down(1, stick.cx, stick.cy); await T.move(1, stick.cx, stick.cy - 40); await sleep(1200);
  let g = await full(); const f0 = Math.atan2(-g.velocity[0], -g.velocity[2]);
  const lx = look.x + look.w * 0.55, ly = look.y + look.h * 0.45;
  await T.down(2, lx, ly); for (let i = 1; i <= 12; i++) { await T.move(2, lx + i * 10, ly); await sleep(16); } await T.up(2);
  await sleep(1000); g = await full(); const f1 = Math.atan2(-g.velocity[0], -g.velocity[2]);
  const measured = wrap(f1 - f0) / 120;
  console.log(`CALIB stick+look together: facing ${f0.toFixed(3)} -> ${f1.toFixed(3)} rad, ${measured.toFixed(5)} rad/px (source ${(-SENS).toFixed(5)}) speed ${g.speed}`);
  let yaw = f1, pitch = 0; // camera yaw (three.js: forward = -sin, -cos)
  const t0 = Date.now(); let firstKill = null, lastKills = 0, lastShot = 0, mode = 'look', modeT = 0, rightDown = false, rx = lx, ry = ly;
  let shots = 0, ticks = 0, stuckN = 0; const fpsS = [];
  while (Date.now() - t0 < DUR) {
    g = await full(); ticks++;
    if (!g.alive || g.missionPhase === 'failed') { console.log('DIED at', ((Date.now() - t0) / 1000).toFixed(1)); await s.snap('dead'); break; }
    if (g.missionPhase === 'complete') { console.log('COMPLETE at', ((Date.now() - t0) / 1000).toFixed(1)); await s.snap('complete'); break; }
    { const pl = await page.evaluate(() => window.__PL__ ? [window.__PL__.yaw, window.__PL__.pitch] : null); if (pl) { yaw = pl[0]; pitch = pl[1]; } }
    if (g.ammo === 0 && !g.reloading) { const rb = await box('#reload'); await T.down(4, rb.cx, rb.cy); await sleep(60); await T.up(4); }
    const p = g.pos; const ens = (g.enemies || []).map((e) => ({ ...e, d: Math.hypot(e.pos[0] - p[0], e.pos[1] - p[1]) })).sort((a, b) => a.d - b.d);
    const tgt = ens[0];
    // left thumb: walk toward the objective, slower when an enemy is near
    const op = g.objectivePosition || [0, 0, 0];
    const goal = tgt && tgt.d < 30 ? null : [op[0], op[2]];
    let mx = 0, my = 0;
    if (goal) { const dx = goal[0] - p[0], dz = goal[1] - p[1], dd = Math.hypot(dx, dz) || 1; const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rxv = Math.cos(yaw), rz = -Math.sin(yaw); my = (dx * fx + dz * fz) / dd; mx = (dx * rxv + dz * rz) / dd; }
    else { mx = Math.sin(Date.now() / 700) * 0.6; my = 0.2; } // strafe in a fight
    if (goal && g.speed < 0.4) { stuckN = (stuckN || 0) + 1; if (stuckN > 30) { mx = (stuckN % 120 < 60) ? 1 : -1; my = 0.3; if (stuckN % 25 === 0) { const jb = await box('#jump'); await T.down(5, jb.cx, jb.cy); await sleep(50); await T.up(5); } } } else stuckN = 0;
    await T.move(1, stick.cx + mx * 34, stick.cy - my * 34);
    // right thumb
    let err = 0, perr = 0;
    if (tgt) { const want = Math.atan2(-(tgt.pos[0] - p[0]), -(tgt.pos[1] - p[1])); err = wrap(want - yaw); const wantP = Math.atan2((tgt.elevation || 0) + 1.25 - (g.elevation + 1.7), tgt.d); perr = wantP - pitch; }
    else { const want = Math.atan2(-(op[0] - p[0]), -(op[2] - p[1])); err = wrap(want - yaw); perr = -pitch; }
    if (mode === 'look') {
      if (!rightDown) { rx = lx; ry = ly; await T.down(2, rx, ry); rightDown = true; }
      const dxp = Math.max(-45, Math.min(45, -err / SENS * 0.7)), dyp = Math.max(-20, Math.min(20, -perr / SENS * 0.7));
      rx += dxp; ry += dyp; yaw -= dxp * SENS; pitch -= dyp * SENS;
      if (rx < look.x + 10 || rx > look.x + look.w - 10) { await T.up(2); rx = lx; ry = ly; await T.down(2, rx, ry); } else await T.move(2, rx, ry);
      if (tgt && Math.abs(err) < 0.05 && tgt.d < 60) { await T.up(2); rightDown = false; mode = 'fire'; modeT = Date.now(); await T.down(3, fire.cx, fire.cy); shots++; }
    } else if (Date.now() - modeT > 600) { await T.up(3); mode = 'look'; }
    if (g.kills > lastKills) { if (firstKill === null) { firstKill = (Date.now() - t0) / 1000; console.log('FIRST KILL', firstKill.toFixed(1), 's'); } lastKills = g.kills; await s.snap('kill' + g.kills); }
    if (ticks % 40 === 0) { fpsS.push(g.fps); console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] kills ${g.kills}/${g.requiredKills} hp ${g.health} enemies ${g.enemyCount} near ${tgt ? tgt.d.toFixed(0) : '-'}m err ${err.toFixed(2)} phase ${g.missionPhase} obj ${g.objective} | draws ${g.draws} tris ${g.tris} fps ${g.fps} shots ${g.shots} hits ${g.hits}`); }
    if (ticks % 60 === 30) await s.snap('play');
    await sleep(40);
  }
  if (rightDown) await T.up(2); if (mode === 'fire') await T.up(3); await T.up(1);
  g = await full();
  console.log(`END kills ${g.kills} firstKill ${firstKill} shots ${g.shots} hits ${g.hits} acc ${(g.hits / Math.max(1, g.shots)).toFixed(2)} hp ${g.health} deaths ${g.deaths} fps med ${fpsS.sort((a, b) => a - b)[fpsS.length >> 1]}`);
  await s.snap('end');
  console.log('errs', s.errs.slice(0, 5));
} finally { await s.browser.close(); }
