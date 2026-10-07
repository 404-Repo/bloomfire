// RUST 17: thumbs-only. Left thumb floating stick; right thumb lands on FIRE and drags (FIRE feeds look).
import { open, sleep } from './lib.mjs';
const L = process.argv[2] !== 'P';
const DUR = +(process.argv[3] || 150) * 1000;
const STYLE = process.argv[4] || 'firedrag'; // firedrag | lookthenfire
const OUT = process.env.OUT || '/Users/atlas/astrocade-game5/research/fps_field/_scratch/raw/rust17';
const s = await open('https://404-repo.github.io/rust17/game/', { w: L ? 844 : 390, h: L ? 390 : 844, out: OUT });
const { T, page } = s;
const box = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; });
const full = () => page.evaluate(() => { const g = window.__GAME__; return { ...g, visibleAssets: undefined, hostileJoints: undefined }; });
try {
  console.log('gpu', await s.gpu());
  await page.waitForSelector('#startb', { visible: true, timeout: 60000 }); await sleep(3000);
  await s.snap('menu');
  const sb = await box('#startb'); await T.tap(sb.cx, sb.cy); await sleep(3000);
  console.log((await s.ui()).filter((l) => /#(stick|look|b\w+)\./.test(l)).join('\n'));
  await s.snap('deploy');
  const stickA = await box('#stick'), look = await box('#look'), fire = await box('#bfire');
  const sx = stickA.x + stickA.w * 0.4, sy = stickA.y + stickA.h * 0.6;
  // calibration: stick + look at once
  let g = await full(); const y0 = g.yaw;
  await T.down(1, sx, sy); await T.move(1, sx, sy - 30);
  const lx = look.x + look.w * 0.3, ly = look.y + look.h * 0.4;
  await T.down(2, lx, ly); for (let i = 1; i <= 12; i++) { await T.move(2, lx + i * 10, ly); await sleep(16); } await T.up(2); await sleep(300);
  g = await full(); console.log(`CALIB yaw ${y0} -> ${g.yaw}: ${((g.yaw - y0) / 120).toFixed(5)} rad/px, moving speed ${g.speed} (stick held)`);
  const t0 = Date.now(); let firstKill = null, lastKills = 0, ticks = 0, rightDown = false, rx = 0, ry = 0, firing = false; const fpsS = [];
  let contact = null;
  while (Date.now() - t0 < DUR) {
    g = await full(); ticks++;
    if (g.over) { console.log('OVER at', ((Date.now() - t0) / 1000).toFixed(1), 'hp', g.hp); await s.snap('over'); break; }
    const has = g.aim && g.aim[2];
    if (process.env.TRACE && has) console.log("  has", g.aimDist, g.aimDrag, g.yaw, rightDown, firing);
    if (has && contact === null) { contact = (Date.now() - t0) / 1000; console.log('FIRST VISIBLE HOSTILE', contact.toFixed(1), 's dist', g.aimDist); }
    // left thumb: forward with a weave; back off when close
    const fwd = has && g.aimDist < 12 ? -0.2 : 0.9;
    await T.move(1, sx + Math.sin(Date.now() / 900) * 22, sy - fwd * 38);
    // right thumb
    const wantFire = has && Math.hypot(...g.aimDrag) < 60 && g.aimDist < 115;
    if (rightDown && STYLE === 'firedrag' && firing !== wantFire) { await T.up(2); rightDown = false; }
    if (!rightDown) { const start = wantFire ? [fire.cx, fire.cy] : [lx, ly]; firing = wantFire; rx = start[0]; ry = start[1]; await T.down(2, rx, ry); rightDown = true; }
    let dx = 0, dy = 0;
    if (has) { dx = g.aimDrag[0]; dy = g.aimDrag[1]; } else { dx = 4; dy = g.pitch * 150 * 0.5; } // scan
    dx = Math.max(-40, Math.min(40, dx * 0.6)); dy = Math.max(-25, Math.min(25, dy * 0.6));
    rx += dx; ry += dy;
    if (rx < 20 || rx > s.w - 10 || ry < 10 || ry > s.h - 10) { await T.up(2); rightDown = false; }
    else await T.move(2, rx, ry);
    if (g.kills > lastKills) { if (firstKill === null) { firstKill = (Date.now() - t0) / 1000; console.log('FIRST KILL', firstKill.toFixed(1)); } lastKills = g.kills; if (g.kills <= 3) await s.snap('kill' + g.kills); }
    if (ticks % 40 === 0) { fpsS.push(g.fps); console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] kills ${g.kills} hp ${g.hp} alive ${g.alive} aim ${JSON.stringify(g.aim)} dist ${g.aimDist} shots ${g.shots} | draws ${g.draws} tris ${g.tris} fps ${g.fps} pitch ${g.pitch} pos ${g.pos} score ${g.scoreRangers}-${g.scoreMilitia} t ${g.timeLeft}`); }
    if (ticks % 90 === 45) await s.snap('play');
    await sleep(40);
  }
  if (rightDown) await T.up(2); await T.up(1);
  g = await full();
  console.log(`END kills ${g.kills} firstKill ${firstKill} contact ${contact} shots ${g.shots} hp ${g.hp} fps med ${fpsS.sort((a, b) => a - b)[fpsS.length >> 1]} quality ${g.quality}`);
  await s.snap('end'); console.log('errs', s.errs.slice(0, 5));
} finally { await s.browser.close(); }
