// MOVEMENT ASSIST for MOONPULL (judge_final, 2026-10-06). Same contract as assist/bellkeeper.mjs and farseek.mjs:
// the tester names a destination; this walks the hero there with the on-screen touch stick, the way a competent
// thumb would. It never presses Use, never talks, never decides anything. It never touches the tide dial UNLESS the
// tester asks for it in the request: "<place>|low" or "<place>|high" holds the dial fully down or up with a second
// finger for the whole walk (the tester's choice of tide; the game's own rule is that the sea drifts home on release).
// Route legs are the straight lines the build team's own gate bot walks (tools/play.mjs), as a small graph.
// MOONPULL has no in-world objective marker, so (unlike Bellkeeper's "objective") no objective place is offered:
// only named people and landmarks within 200 m of the hero.
const FR = 1000 / 60;
const N = {
  'Nell (square above the slipway)': [-151, 48.8],
  'top of the slipway': [-150, 44],
  'harbour beach below the slipway': [-150, 32.5],
  "Tam's stranded boat (harbour)": [-159.5, 30.8],
  "stern of Tam's stranded boat": [-160, 41.2],
  'Marta (harbour terrace)': [-136.5, 42.6],
  'Pip (harbour shore)': [-126, 35.6],
  'beach below the causeway': [-104, 15],
  'causeway, harbour end': [-118, 28],
  'causeway, islet end': [-104, -29],
  'Well Islet': [-100, -36],
  'the well': [-100, -38.4],
  'Sand Bar, west end': [-72, 6],
  'Sand Bar, east end': [-30, 4],
  'Bram (by the weir)': [12, -16.2],
  'edge of the Shellflats': [15, -30],
  'wreck of the Marguerite (near side)': [35, -41],
  'the raft beside the wreck': [47.85, -56.16],
  "the wreck's stern cabin": [50.11, -55.08],
  'east edge of the flats': [75, -25],
  'Gull Head landing': [103, -4],
  'Tam at Gull Head': [99, -1.8],
  "Tam's boat at Gull Head": [100.5, -4.5],
  'start of the stepping stones': [196, -6],
  'stepping stones, middle': [205, -29],
  'end of the stepping stones (the Stack)': [210, -42],
  'ledge under the lighthouse': [221, -48],
  'lighthouse door': [220, -57.5],
};
const E = [
  ['Nell (square above the slipway)', 'top of the slipway'], ['Nell (square above the slipway)', 'causeway, harbour end'],
  ['Nell (square above the slipway)', 'Marta (harbour terrace)'], ['top of the slipway', 'Marta (harbour terrace)'],
  ['top of the slipway', 'harbour beach below the slipway'], ['harbour beach below the slipway', "Tam's stranded boat (harbour)"],
  ['harbour beach below the slipway', 'Pip (harbour shore)'], ["Tam's stranded boat (harbour)", "stern of Tam's stranded boat"],
  ['causeway, harbour end', "Tam's stranded boat (harbour)", 'oneway'],
  ['causeway, harbour end', 'causeway, islet end'],
  ['causeway, islet end', 'Well Islet'], ['Well Islet', 'the well'],
  ["stern of Tam's stranded boat", 'beach below the causeway'], ['beach below the causeway', 'Sand Bar, west end'],
  ['Sand Bar, west end', 'Sand Bar, east end'], ['Sand Bar, east end', 'Bram (by the weir)'], ['Sand Bar, east end', 'edge of the Shellflats'],
  ['Bram (by the weir)', 'edge of the Shellflats'], ['edge of the Shellflats', 'wreck of the Marguerite (near side)'],
  ['wreck of the Marguerite (near side)', 'the raft beside the wreck'], ['the raft beside the wreck', "the wreck's stern cabin"], ["the wreck's stern cabin", 'Gull Head landing'],
  ['wreck of the Marguerite (near side)', 'east edge of the flats'], ['edge of the Shellflats', 'east edge of the flats'], ['east edge of the flats', 'Gull Head landing'],
  ['Gull Head landing', 'Tam at Gull Head'], ['Gull Head landing', "Tam's boat at Gull Head"],
  ['start of the stepping stones', 'stepping stones, middle'], ['stepping stones, middle', 'end of the stepping stones (the Stack)'],
  ['end of the stepping stones (the Stack)', 'ledge under the lighthouse'], ['ledge under the lighthouse', 'lighthouse door'],
];
const adj = {}; for (const k in N) adj[k] = [];
for (const [a, b, one] of E) { adj[a].push(b); if (!one) adj[b].push(a); }
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export async function init(ctx) {
  const pg = () => ctx.page();
  const read = () => pg().evaluate(() => window.__GAME__);
  let stick = null, h1 = null, h2 = null;
  const release = async () => { for (const h of [h1, h2]) if (h) await h.end().catch(() => {}); h1 = h2 = null; };
  async function holdDial(v) {
    const b = await pg().evaluate(() => { const r = document.querySelector('#tidetrack').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top, h: r.height, vis: r.width > 0 }; });
    if (!b.vis) return false;
    const y = b.y + (1 - (v + 1) / 2) * b.h * 0.96 + b.h * 0.02;
    h2 = await pg().touchscreen.touchStart(b.x, y); return true;
  }
  async function leg(tx, tz, r, tideHeld) {
    if (!stick) stick = await pg().evaluate(() => { const r = document.querySelector('#stick').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    let last = null, stuck = 0;
    for (let i = 0; i < 900; i++) {
      const g = await read();
      const dx = tx - g.pos[0], dz = tz - g.pos[1], d = Math.hypot(dx, dz);
      if (d < r) return null;
      const y = g.camYaw, fx = -Math.sin(y), fz = -Math.cos(y), rx = Math.cos(y), rz = -Math.sin(y);
      const my = (dx * fx + dz * fz) / d, mx = (dx * rx + dz * rz) / d, R = d < 3 ? 34 : 58;
      if (!h1) h1 = await pg().touchscreen.touchStart(stick.x, stick.y);
      await h1.move(stick.x + mx * R, stick.y - my * R);
      await ctx.frames(4);
      if (last && dist(g.pos, last) < 0.04) stuck++; else stuck = 0;
      last = g.pos;
      if (stuck > 45) {
        const why = g.depth > 0.6 ? `water too deep (depth ${g.depth.toFixed(1)} m, sea level ${g.tide})` : 'blocked by something';
        return `stopped ${d.toFixed(0)} m short: ${why}`;
      }
    }
    return 'gave up (too long)';
  }
  return {
    release,
    async places() {
      const g = await read();
      const near = Object.keys(N).filter((k) => dist(N[k], g.pos) < 200).sort((a, b) => dist(N[a], g.pos) - dist(N[b], g.pos));
      return [...near.map((k) => `${k}  (${dist(N[k], g.pos).toFixed(0)} m)`),
        '(add "|low" or "|high" after a name to hold the tide dial fully down or up with a second finger during the walk, e.g. to=Well Islet|low)'];
    },
    async goto(q) {
      const [name0, tideReq] = String(q).split('|').map((s) => s.trim());
      const name = Object.keys(N).find((k) => k.toLowerCase() === name0.toLowerCase()) || Object.keys(N).find((k) => k.toLowerCase().includes(name0.toLowerCase()));
      if (!name) return `unknown place "${name0}" (ask /places)`;
      const g0 = await read();
      if (dist(N[name], g0.pos) > 200) return `"${name}" is more than 200 m away; walk nearer first`;
      // nearest graph node to the hero, then shortest path
      const start = Object.keys(N).sort((a, b) => dist(N[a], g0.pos) - dist(N[b], g0.pos))[0];
      const prev = { [start]: null }, dd = { [start]: 0 }, todo = new Set(Object.keys(N));
      while (todo.size) {
        let u = null; for (const k of todo) if (dd[k] !== undefined && (u === null || dd[k] < dd[u])) u = k;
        if (u === null) break; todo.delete(u);
        for (const v of adj[u]) { const alt = dd[u] + dist(N[u], N[v]); if (dd[v] === undefined || alt < dd[v]) { dd[v] = alt; prev[v] = u; } }
      }
      if (dd[name] === undefined) return `no known route to "${name}" from here`;
      const path = []; for (let k = name; k; k = prev[k]) path.unshift(k);
      if (dist(N[path[0]], g0.pos) < 6 && path.length > 1) path.shift();
      if (tideReq === 'low' || tideReq === 'high') { if (!(await holdDial(tideReq === 'low' ? -1 : 1))) return 'the tide dial is not on screen yet'; }
      for (const k of path) {
        const res = await leg(N[k][0], N[k][1], k === name ? 1.2 : 2.5, !!tideReq);
        if (res) { await release(); const g = await read(); return `${res} (on the way to "${k}"); hero at ${g.pos.map((v) => v.toFixed(0)).join(',')}`; }
      }
      await release();
      return `arrived at "${name}"`;
    },
  };
}
