// MOVEMENT ASSIST for The Last Bellkeeper. The tester names a destination; this walks the hero there with the
// on-screen touch stick (and the jump key for planned jumps), the way a competent thumb would. It never presses
// the action button, never chooses a gust, never decides what to do: those stay the tester's.
// Reused: the entrant's own route planner (repo/tools/route-planner.mjs, A* over the world's walkable ground) and
// the path-following driver the trailer agent adapted from the entrant's known-route regression
// (~/404_jam_site/work/trailers/bellkeeper/capture2.mjs: go, travel, approach, ride), with the virtual-clock
// waits replaced by this harness's frame stepping.
import os from 'os'; import path from 'path';
const TR = path.join(os.homedir(), '404_jam_site/work/trailers/bellkeeper');
const THREE = await import(path.join(TR, 'repo/node_modules/three/build/three.module.js'));
const { createPlanner } = await import(path.join(TR, 'repo/tools/route-planner.mjs'));
const { adaptWorld } = await import(path.join(TR, 'repo/game/bellhollow/adapt-world.js'));
const { buildBellhollow } = await import(path.join(TR, 'repo/game/bellhollow/world.js'));

// Expose the game's own objective marker (the point its chart already shows the player) as window.__OBJ__.
export const patch = { match: /\/the-last-bellkeeper\/main\.js$/, from: 'objective:quest.objectiveTarget()', to: 'objective:(window.__OBJ__=quest.objectiveTarget())' };

export async function init(ctx) {
  const W = adaptWorld(buildBellhollow({ THREE, scene: new THREE.Scene() }), { THREE });
  const P = W.points, vent = (id) => W.vents.find((v) => v.id === id), wheel = (id) => W.wheels.find((v) => v.id === id), sail = (id) => W.sails.find((v) => v.id === id);
  const read = () => ctx.page().evaluate(() => window.__GAME__);
  const sleep = (ms) => ctx.frames(Math.max(1, Math.round(ms / (1000 / 60))));
  let handle = null, stick = null;
  const release = async () => { if (handle) { await handle.end().catch(() => {}); handle = null; } };
  async function steer(dx, dz, d, yaw, slow = false) {
    if (!stick) stick = await ctx.page().evaluate(() => { const r = document.querySelector('#stick').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width * .36 }; });
    const sx = dx * Math.cos(yaw) - dz * Math.sin(yaw), sy = -dx * Math.sin(yaw) - dz * Math.cos(yaw), n = Math.hypot(sx, sy) || 1, m = slow ? .3 : Math.min(1, Math.max(.3, d * .8));
    if (!handle) handle = await ctx.page().touchscreen.touchStart(stick.x, stick.y);
    await handle.move(stick.x + sx / n * stick.r * m, stick.y - sy / n * stick.r * m);
  }
  const jump = () => ctx.page().keyboard.press('KeyA');
  async function waitFor(fn, timeout = 8000, arg) { for (let t = 0; t < timeout; t += 50) { if (await ctx.page().evaluate(fn, arg)) return true; await sleep(50); } return false; }
  async function go(x, z, { tol = .45, jumpWhen = null, timeout = 400, keep = false, slow = false } = {}) {
    let stuck = 0, old = await read(), jumped = false, best = Infinity, sinceBest = 0;
    for (let i = 0; i < timeout; i++) {
      const g = await read(), dx = x - g.pos[0], dz = z - g.pos[1], d = Math.hypot(dx, dz);
      if (d < best - .05) { best = d; sinceBest = 0; } else if (++sinceBest > 55 && !g.knocked && !g.lifting) { await release(); return { recovered: true }; }
      if (d < tol) { if (!keep) { await release(); await sleep(100); } return g; }
      if (jumpWhen && !jumped && jumpWhen(g)) { jumped = true; await jump(); }
      await steer(dx, dz, d, g.cameraYaw, slow);
      await sleep(50);
      const n = await read(); if (n.recoveredCount > (g.recoveredCount ?? 0)) return { recovered: true };
      if (n.knocked) { await release(); await waitFor(() => !window.__GAME__.knocked && window.__GAME__.grounded, 6000); return { recovered: true }; }
      stuck = Math.hypot(n.pos[0] - old.pos[0], n.pos[1] - old.pos[1]) < .01 && !n.knocked && !n.lifting && !n.introActive && !n.finaleActive ? stuck + 1 : 0; old = n;
      if (stuck === 12 || stuck === 30) {
        const a = Math.atan2(dx, dz) + (stuck === 12 ? Math.PI / 2 : -Math.PI / 2); await release();
        for (let j = 0; j < 5; j++) { const h = await read(); await steer(Math.sin(a), Math.cos(a), 1, h.cameraYaw); await sleep(60); }
        await release(); if (stuck === 30) return { recovered: true };
      }
      if (stuck > 45) throw Error('blocked');
    }
    throw Error('did not arrive in time');
  }
  async function mirror() { const g = await read(); for (let i = 0; i < 150; i++) W.update(1 / 60, i / 60, { wind: { push: g.wind.push, wheels: g.wind.wheels }, restored: g.restoration }); return g; }
  async function travel(p, { tol = .6 } = {}) {
    for (let attempt = 0; attempt < 4; attempt++) {
      await waitFor(() => window.__GAME__.grounded && !window.__GAME__.knocked, 8000);
      const g = await mirror(), from = { x: g.pos[0], y: g.y, z: g.pos[1] };
      const planner = createPlanner(W, { maxDrop: 5.5 }), r = planner.plan(from, p);
      if (!r.ok) throw Error('no walkable path from here (' + r.reason + ')');
      const wps = planner.waypoints(r.path); let fell = false;
      for (let i = 1; i < wps.length; i++) {
        const w = wps[i], prev = wps[i - 1], last = i === wps.length - 1;
        if (prev.kind === 'jump' && (await read()).speed < 4.5) {
          const L = Math.hypot(w.x - prev.x, w.z - prev.z) || 1, back = planner.snap({ x: prev.x - (w.x - prev.x) / L * 2.4, y: prev.y, z: prev.z - (w.z - prev.z) / L * 2.4 });
          if (back) { await go(back.ix * .5, back.iz * .5, { tol: .4 }); await go(prev.x, prev.z, { tol: .45, keep: true }); }
        }
        let res;
        if (prev.kind === 'jump') res = await go(w.x, w.z, { tol: .7, keep: !last, jumpWhen: () => true });
        else if (prev.kind === 'drop' && !last && (await read()).y > w.y + 1) {
          const L = Math.hypot(w.x - prev.x, w.z - prev.z) || 1; res = await go(w.x + (w.x - prev.x) / L * .7, w.z + (w.z - prev.z) / L * .7, { tol: .3, slow: true });
          await waitFor(() => window.__GAME__.grounded, 4000);
        } else res = await go(w.x, w.z, { tol: last ? tol : .55, keep: !last && prev.kind !== 'drop', slow: prev.kind === 'drop' });
        if (res.recovered) { fell = true; await release(); await sleep(900); break; }
      }
      if (!fell) return await read();
    }
    throw Error('kept falling or getting pushed back on the way');
  }
  async function approach(target, range = 4.5) {
    const g = await mirror(), planner = createPlanner(W, { maxDrop: 5.5 }), from = { x: g.pos[0], y: g.y, z: g.pos[1] };
    if (planner.snap(target) && planner.plan(from, target).ok) return travel(target, { tol: .9 });
    let best = null;
    for (let r = 1.2; r <= range && !best; r += .6) for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, c = { x: target.x + Math.cos(a) * r, y: target.y, z: target.z + Math.sin(a) * r };
      for (const dy of [0, -1, -2, 1]) { const q = { ...c, y: target.y + dy }; if (!planner.snap(q)) continue; const pl = planner.plan(from, q); if (pl.ok && (!best || pl.path.length < best.n)) best = { q, n: pl.path.length }; break; }
    }
    if (!best) throw Error('no standable spot near it that can be walked to from here');
    return travel(best.q, { tol: .6 });
  }
  // Ride a grille's updraft after the tester has released a gust into it: board, rise, step onto the ledge.
  async function ride(v) {
    await go(v.x, v.z, { tol: .3 });
    const up = await waitFor((a) => { const g = window.__GAME__; return g.lifting && g.y > a.y; }, 12000, { y: v.ledge.y + .3 });
    if (!up) throw Error('no updraft is rising from that grille (release a gust into it first)');
    const dx = v.ledge.x - v.x, dz = v.ledge.z - v.z, L = Math.hypot(dx, dz) || 1;
    await go(v.ledge.x + dx / L * .6, v.ledge.z + dz / L * .6, { tol: .35 });
    await waitFor(() => window.__GAME__.grounded && !window.__GAME__.lifting, 6000);
  }
  const named = () => {
    const L = [
      ['morning bell', P.morningBell, 'travel'], ['Mara', P.mara, 'travel'], ['seed wheel', wheel('seed'), 'approach'],
      ['terrace gate', P.terraceGateInside || P.terraceGate, 'travel'], ['loft', P.loft, 'travel'],
      ['Mill of Sails', P.millSails, 'approach'], ['bridge sail', sail('sailsBridge'), 'approach'],
      ['Mill of Pipes', P.millPipes, 'approach'], ['pipe wheel A', wheel('pipesA'), 'approach'], ['pipe wheel B', wheel('pipesB'), 'approach'],
      ['pipes valve', P.pipes?.valve || P.pipesValve, 'travel'], ['ladders shutter sail', sail('laddersShutter'), 'approach'],
      ['Mill of Ladders', P.millLadders, 'approach'], ['sky bridge', P.skyBridge, 'travel'], ['Hollow gate', P.hollowGate, 'travel'],
      ['carving (out)', P.carvingOut, 'approach'], ['carving (return)', P.carvingReturn, 'approach'], ['paired bells', P.bellOut, 'travel'],
    ];
    for (const v of W.vents) { L.push([`grille ${v.id}`, v, 'travel']); L.push([`ride the updraft at grille ${v.id}`, v, 'ride']); }
    return L.filter((x) => x[1]);
  };
  // Only places near the hero (about what a player can see or has on the chart nearby) are offered.
  async function list() {
    const g = await read(), h = { x: g.pos[0], y: g.y, z: g.pos[1] }, near = (p) => Math.hypot(p.x - h.x, p.z - h.z) < 30 && Math.abs((p.y ?? h.y) - h.y) < 4;
    const out = [{ name: 'objective', note: 'the spot the game\'s own chart marks for the current objective' }];
    for (const [n, p, how] of named()) if (near(p)) out.push({ name: n, note: how === 'ride' ? 'stand on it and ride its updraft to the ledge above' : `${Math.round(Math.hypot(p.x - h.x, p.z - h.z))} m away` });
    for (const s of g.wind.sources || []) if (near(s)) out.push({ name: `gust ${s.id}`, note: 'a live gust you could catch' });
    return out;
  }
  return {
    async places() { return (await list()).map((x) => `${x.name}: ${x.note}`); },
    async goto(name) {
      const all = await list(), hit = all.find((x) => x.name.toLowerCase() === String(name).toLowerCase().trim());
      if (!hit) return `unknown place "${name}". Places from here: ${all.map((x) => x.name).join(', ')}`;
      try {
        if (hit.name === 'objective') {
          const o = await ctx.page().evaluate(() => window.__OBJ__ && { x: window.__OBJ__.x, y: window.__OBJ__.y, z: window.__OBJ__.z });
          if (!o) return 'the game shows no objective marker right now';
          await approach(o);
        } else if (hit.name.startsWith('gust ')) {
          const g = await read(), s = g.wind.sources.find((x) => `gust ${x.id}` === hit.name); if (!s) return 'that gust is gone';
          await travel(s, { tol: .5 });
        } else {
          const [, p, how] = named().find((x) => x[0] === hit.name);
          if (how === 'ride') await ride(p); else if (how === 'approach') await approach(p); else await travel(p, { tol: 1 });
        }
        await release(); return `arrived near ${hit.name}`;
      } catch (e) { await release(); return `could not get to ${hit.name}: ${e.message}`; }
    },
    release,
  };
}
