// MOVEMENT ASSIST for Farseek. The tester names a destination; this moves the explorer there, including the
// court's traversal (the gap jump, the hang and drop, the jump to the crack, the shimmy and climb, the stair, the
// vault onto the mirror island). It never pulls a block, turns a mirror, reads notes or throws the disc: those
// puzzle actions stay with the tester (USE and the other on-screen buttons).
// Reused: the movement legs of the entrant's own play-through recorder (repo/scripts/record-trailer.mjs:
// steer, go, jumpToward, until and the court() / checkpoint() routes), with camera-relative strafes replaced by
// steering toward world points (the tester may have turned the camera), and waits on this harness's frames.
// Input is the game's keyboard controls (WASD, Space, C), sent while the phone view is shown; the game accepts both.
const FR = 1000 / 60;
export async function init(ctx) {
  const pg = () => ctx.page();
  const state = () => pg().evaluate(() => window.__GAME__);
  const sleep = (ms) => ctx.frames(Math.max(1, Math.round(ms / FR)));
  const held = new Set();
  async function hold(keys) {
    for (const k of [...held]) if (!keys.has(k)) { await pg().keyboard.up(k); held.delete(k); }
    for (const k of keys) if (!held.has(k)) { await pg().keyboard.down(k); held.add(k); }
  }
  const tap = async (keys, ms) => { await hold(new Set(keys)); await sleep(ms); await hold(new Set()); };
  function steer(s, x, z, lat = .38) {
    const dx = x - s.pos[0], dz = z - s.pos[1], d = Math.hypot(dx, dz) || 1, fx = Math.sin(s.camYaw), fz = Math.cos(s.camYaw);
    const f = (dx * fx + dz * fz) / d, r = (dx * -fz + dz * fx) / d, keys = [];
    if (f > .38) keys.push('KeyW'); if (f < -.38) keys.push('KeyS'); if (r > lat) keys.push('KeyD'); if (r < -lat) keys.push('KeyA');
    return { keys, d };
  }
  async function go(x, z, { tol = .35, walk = true, timeout = 12000 } = {}) {
    for (let t = 0; t < timeout; t += FR) {
      const s = await state(), { keys, d } = steer(s, x, z);
      if (d < tol) { await hold(new Set()); return s; }
      if (walk && d < 1.5) keys.push('ShiftLeft');
      await hold(new Set(keys)); await ctx.frames(1);
    }
    await hold(new Set()); const s = await state(); throw Error(`stuck at ${s.pos.map((v) => v.toFixed(1))}`);
  }
  async function until(test, timeout, label) { for (let t = 0; t < timeout; t += FR) { const s = await state(); if (test(s)) return s; await ctx.frames(1); } throw Error(`failed: ${label}`); }
  async function jumpToward(x, z, ms = 800) { const s = await state(); await tap([...steer(s, x, z).keys, 'Space'], ms); await sleep(250); }
  const near = (a, b, e = .1) => Math.abs(a - b) < e;
  // where the explorer is in the court's route graph
  function nodeOf(s) {
    if (s.where !== 'court') return s.where;
    if (s.state !== 'ground') return 'airborne';
    if (near(s.feet, 8) && s.pos[1] > 35.5) return s.pos[0] < 6.2 ? 'west platform' : 'terrace';
    if (near(s.feet, 5.5) && s.pos[0] < 6.5) return 'ledge';
    if (near(s.feet, 7) && s.pos[1] < 33) return 'crack top';
    if (near(s.feet, 1, .15)) return 'low block';
    if (near(s.feet, 0)) return s.pos[1] > 29.6 ? 'island' : 'court floor';
    return 'court floor';
  }
  // one leg each, from the node before it on the way down
  const LEG = {
    'west platform': async () => { await go(12, 37.2); const s = await state(); await hold(new Set([...steer(s, 4, 37.2).keys])); await until((s) => s.pos[0] < 8.75, 4000, 'run at the gap'); const s2 = await state(); await tap([...steer(s2, 4, 37.2).keys, 'Space'], 500); if ((await state()).state === 'hang') await tap(['KeyW'], 600); await until((s) => s.state === 'ground' && s.pos[0] < 6.2, 3000, 'land on the west platform'); },
    'ledge': async () => { await go(4, 36.45); const s = await state(); await tap(steer(s, 4, 35).keys, 120); await tap(['KeyC'], 120); await until((s) => s.state === 'hang', 2000, 'hang from the edge'); await sleep(400); await tap(['KeyC'], 120); await until((s) => s.state === 'ground' && near(s.feet, 5.5, .05), 3000, 'drop to the ledge'); },
    'crack top': async () => { await go(4.5, 34.5); await jumpToward(4.5, 30, 800); await until((s) => s.state === 'hang', 3000, 'catch the crack'); await hold(new Set(['KeyD'])); await until((s) => s.pos[0] > 9.4, 9000, 'shimmy along the crack'); await hold(new Set()); await tap(['KeyW'], 500); await until((s) => s.state === 'ground' && near(s.feet, 7, .05), 3000, 'climb up'); },
    'court floor': async () => { await go(9, 27); await go(19, 27, { walk: false }); await until((s) => s.state === 'ground' && near(s.feet, 0, .05), 3000, 'reach the floor'); },
  };
  const DOWN = ['terrace', 'west platform', 'ledge', 'crack top', 'court floor'];
  async function toFloor() {
    let s = await state(), n = nodeOf(s);
    if (n === 'island') { await go(17.2, 30.35); await jumpToward(17.2, 26.5, 800); if ((await state()).state === 'hang') await tap(['KeyW'], 600); await until((s) => s.state === 'ground' && s.pos[1] < 28.1, 3000, 'leave the island'); n = nodeOf(await state()); }
    if (n === 'low block') { await go(17.2, 24.6, { walk: false }); await until((s) => s.state === 'ground' && near(s.feet, 0, .05), 3000, 'step off the low block'); return; }
    if (n === 'court floor') return;
    let i = DOWN.indexOf(n); if (i < 0) throw Error(`not on the route (${n}); move onto solid ground first`);
    for (i = i + 1; i < DOWN.length; i++) await LEG[DOWN[i]]();
  }
  const corridor = async (x) => { let s = await state(); if (s.pos[1] < 19.5) { await go(13.4, 15.8, { walk: false }); await go(13.4, 19, { walk: false }); await go(13.4, 23.8, { walk: false }); s = await state(); } if (s.pos[1] > 25) await go(Math.min(19, Math.max(9, s.pos[0])), 25, { walk: false }); await go(x, 23.8, { walk: false }); };
  const FLOOR = {
    'stone block': async () => { await corridor(5); await go(5, 22.3, { tol: .1, timeout: 3000 }).catch(() => {}); },
    'mirror 1 (west)': async () => { await corridor(9); await go(9, 21.9, { tol: .1, timeout: 3000 }).catch(() => {}); },
    'mirror 2 (east)': async () => { await corridor(20); await go(21, 23.2); await go(21, 24.0, { tol: .1, timeout: 3000 }).catch(() => {}); },
    'mirror 3 (on the island)': async () => { await corridor(17.2); await go(17.2, 25.3); await jumpToward(17.2, 27, 450); await until((s) => s.state === 'ground' && near(s.feet, 1, .05), 3000, 'vault onto the low block'); await go(17.2, 27.5); await jumpToward(17.2, 31, 800); await until((s) => s.state === 'ground' && near(s.feet, 0, .05) && s.pos[1] > 29.8, 3000, 'land on the island'); await go(17, 30.35, { tol: .1, timeout: 3000 }).catch(() => {}); },
    'stelae and gate': async () => { await corridor(13.4); await go(13.4, 19); await go(13.4, 15.8); await go(15, 15.3); },
    'through the far door': async () => { await corridor(13.4); await go(13.4, 19); await go(15, 15.3); await go(15, 9, { walk: false, timeout: 8000 }); },
  };
  const TERRACE = {
    'expedition camp (notes)': async () => { const s = await state(); if (nodeOf(s) !== 'terrace') throw Error('the camp is up on the terrace you started on'); await go(21.6, 39.8, { tol: .5 }); },
  };
  const TWO = {
    'clerk': [[-0.5, -12], [-4, -24.2]], 'disc': [[-7.2, -24.2], [-7.9, -28.05]],
    'crescent plate': [[-8, -19.5]], 'waves plate': [[0, -22.8]], 'disc plate': [[8, -19.5]], 'lamp throwing spot': [[-1.8, -23.2]],
    'far door': [[-0.4, -30], [0, -38], [0, -41.6]],
  };
  async function list() {
    const s = await state();
    if (s.where === 'court') {
      const out = ['objective: walk on to the next spot the game\'s objective marker points at'];
      if (nodeOf(s) === 'terrace') out.push(...Object.keys(TERRACE));
      out.push('court floor', ...Object.keys(FLOOR)); return out;
    }
    if (s.where === 'two') return Object.keys(TWO);
    return [];
  }
  return {
    async places() { const L = await list(); return L.length ? L : ['(no movement assist in this part of the game: use direct touch control)']; },
    async goto(name) {
      const s = await state(), want = String(name).toLowerCase().trim(), L = (await list()).map((x) => x.split(':')[0]);
      const hit = L.find((x) => x.toLowerCase() === want);
      if (!hit) return `unknown place "${name}". Places from here: ${L.join(', ') || 'none (direct control only here)'}`;
      try {
        if (s.where === 'two') { for (const [x, z] of TWO[hit]) await go(x, z, { walk: false, timeout: 15000 }); }
        else if (hit === 'objective') {
          // the court's steps: the camp, then the way down, then the puzzle (whose marker is the block or the last lit mirror)
          const step = s.step;
          if (step === 'camp') await TERRACE['expedition camp (notes)']();
          else if (['gap', 'drop', 'crack', 'climb', 'stair'].includes(step)) await toFloor();
          else if (step === 'block') { await toFloor(); await FLOOR['stone block'](); }
          else if (step === 'enter') { await toFloor(); await FLOOR['through the far door'](); }
          else return `the current objective (${s.objective || step}) is about what to do, not where to go: pick a place by name`;
        } else if (TERRACE[hit]) await TERRACE[hit]();
        else { if (nodeOf(await state()) !== 'court floor') await toFloor(); if (hit !== 'court floor') await FLOOR[hit](); }
        await hold(new Set()); return `arrived: ${hit}`;
      } catch (e) { await hold(new Set()); return `could not get to ${hit}: ${e.message}`; }
    },
    async release() { await hold(new Set()); },
  };
}
