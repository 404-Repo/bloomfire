// water_mill c2: built from profiles. Walls are extruded Shapes with real openings cut
// as holes (doors and windows are genuine recesses), roof is one extruded cross-section,
// wheel rims are extruded annuli. userData.joints.wheel: Group at the axle, local X spin.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (hex, name, r = 0.85, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra }); m.name = name; return m; };
  const stone = M(0xc9b48f, 'stone'), chalk = M(0xe8e2d4, 'stone'), plaster = M(0xeee3cf, 'plaster');
  const tile = M(0xc0603a, 'tile', 0.8), timber = M(0x7a5534, 'timber'), dark = M(0x4a3324, 'timber');
  const teal = M(0x3f8a8a, 'timber'), madder = M(0xa8382e, 'timber'), iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
  const water = M(0x3f8a8a, '', 0.25);
  const put = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); p.add(me); return me; };
  const box = (p, w, h, d, mat, x, y, z, rx, ry, rz) => put(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
  const rect = (s, x0, y0, w, h) => { const h2 = new THREE.Path(); h2.moveTo(x0, y0); h2.lineTo(x0, y0 + h); h2.lineTo(x0 + w, y0 + h); h2.lineTo(x0 + w, y0); h2.lineTo(x0, y0); s.holes.push(h2); };
  // An extruded wall panel in its own XY plane, outer face at local z = 0, thickness t into -z.
  const panel = (outline, holes, t, mat) => { const s = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y))); holes.forEach((h) => rect(s, ...h)); const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 6 }); geo.translate(0, 0, -t); return geo; };
  const body = new THREE.Group(); g.add(body);

  const W = 8, D = 7, H1 = 3.6, H2 = 2.8, RISE = 2.6, T = 0.45;
  // dark interior core, visible through every opening
  box(body, W - 2 * T + 0.02, H1 + H2 + 0.3, D - 2 * T + 0.02, dark, 0, (H1 + H2 + 0.3) / 2, 0);
  // ground storey: four stone walls with openings
  const faces = [ // [rotY, half-length along wall, offset to face]
    { ry: 0, L: W, off: D / 2 }, { ry: Math.PI, L: W, off: D / 2 }, { ry: Math.PI / 2, L: D, off: W / 2 }, { ry: -Math.PI / 2, L: D, off: W / 2 }];
  const ground = [
    [[-1.7, 0, 1.0, 2.1], [1.0, 1.6, 1.1, 0.8]],          // front: door + window
    [[-0.5, 1.8, 1.0, 0.7]],                               // back: vent
    [[-1.4, 0.0, 2.8, 1.2]],                               // +X: tailrace arch opening at the wheel
    [[-2.0, 1.7, 0.9, 0.7], [1.1, 1.7, 0.9, 0.7]]];       // -X: vents
  faces.forEach((f, i) => {
    const holder = new THREE.Group(); holder.rotation.y = f.ry; body.add(holder);
    const L = f.L;
    put(holder, panel([[-L / 2, 0], [L / 2, 0], [L / 2, H1], [-L / 2, H1]], ground[i], T, stone), stone, 0, 0, f.off);
    // stone surrounds around each opening
    for (const [x0, y0, w, h] of ground[i]) {
      box(holder, 0.25, h + 0.3, 0.2, chalk, x0 - 0.12, y0 + h / 2 + 0.05, f.off + 0.08);
      box(holder, 0.25, h + 0.3, 0.2, chalk, x0 + w + 0.12, y0 + h / 2 + 0.05, f.off + 0.08);
      box(holder, w + 0.7, 0.3, 0.24, chalk, x0 + w / 2, y0 + h + 0.15, f.off + 0.1);
      if (y0 > 0) box(holder, w + 0.5, 0.15, 0.3, chalk, x0 + w / 2, y0 - 0.07, f.off + 0.12);
    }
    // quoins at this face's left end
    for (let k = 0; k < 5; k++) box(holder, k % 2 ? 0.5 : 0.85, 0.6, 0.12, chalk, -L / 2 + (k % 2 ? 0.25 : 0.42), 0.36 + k * 0.72, f.off + 0.04);
    for (let k = 0; k < 5; k++) box(holder, k % 2 ? 0.85 : 0.5, 0.6, 0.12, chalk, L / 2 - (k % 2 ? 0.42 : 0.25), 0.36 + k * 0.72, f.off + 0.04);
  });
  // door leaf inside the front opening
  box(body, 1.0, 2.1, 0.08, madder, -1.2, 1.05, D / 2 - T + 0.12);
  // timber sill beam (jetty)
  const y2 = H1;
  box(body, W + 0.4, 0.3, D + 0.4, timber, 0, y2 + 0.15, 0);
  // upper storey: plaster panels with window holes, timber frame in front
  const WU = W + 0.2, DU = D + 0.2, y2b = y2 + 0.3, TU = 0.3;
  const upperHoles = (L) => [[-L / 4 - 0.45, 0.85, 0.9, 1.1], [L / 4 - 0.45, 0.85, 0.9, 1.1]];
  const sides = [{ ry: 0, L: WU, off: DU / 2, gable: true }, { ry: Math.PI, L: WU, off: DU / 2, gable: true }, { ry: Math.PI / 2, L: DU, off: WU / 2 }, { ry: -Math.PI / 2, L: DU, off: WU / 2 }];
  sides.forEach((f, i) => {
    const holder = new THREE.Group(); holder.rotation.y = f.ry; holder.position.y = y2b; body.add(holder);
    const L = f.L, hs = upperHoles(L);
    const out = f.gable ? [[-L / 2, 0], [L / 2, 0], [L / 2, H2], [0, H2 + RISE], [-L / 2, H2]] : [[-L / 2, 0], [L / 2, 0], [L / 2, H2], [-L / 2, H2]];
    put(holder, panel(out, hs, TU, plaster), plaster, 0, 0, f.off);
    // frame
    for (const x of [-L / 2 + 0.15, -L / 2 + L * 0.5, L / 2 - 0.15]) box(holder, 0.28, H2, 0.14, timber, x, H2 / 2, f.off + 0.06);
    box(holder, L, 0.24, 0.14, timber, 0, H2 - 0.12, f.off + 0.06);
    for (const [x0, y0, w, h] of hs) {
      box(holder, w + 0.2, 0.16, 0.26, chalk, x0 + w / 2, y0 - 0.06, f.off + 0.1);
      box(holder, 0.42, h, 0.08, teal, x0 - 0.25, y0 + h / 2, f.off + 0.16, 0, 0.35, 0);
      box(holder, 0.42, h, 0.08, teal, x0 + w + 0.25, y0 + h / 2, f.off + 0.16, 0, -0.35, 0);
      box(holder, w, h, 0.06, i % 2 ? madder : dark, x0 + w / 2, y0 + h / 2, f.off - TU + 0.05);
    }
    if (f.gable) {
      const a = Math.atan2(RISE, L / 2);
      box(holder, 0.24, RISE, 0.14, timber, 0, H2 + RISE / 2 - 0.1, f.off + 0.06);
      box(holder, 2.3, 0.2, 0.14, timber, -1.0, H2 + 0.75, f.off + 0.06, 0, 0, a * 1.2);
      box(holder, 2.3, 0.2, 0.14, timber, 1.0, H2 + 0.75, f.off + 0.06, 0, 0, -a * 1.2);
    }
  });
  // roof: one extruded cross-section (inverted V with thickness and eaves), along Z
  const OV = 0.6, half = WU / 2 + OV, top = y2b + H2 + RISE, eavesY = top - RISE * (half / (WU / 2)), TH = 0.32;
  const rs = new THREE.Shape([new THREE.Vector2(-half, eavesY), new THREE.Vector2(0, top), new THREE.Vector2(half, eavesY), new THREE.Vector2(half, eavesY + TH), new THREE.Vector2(0, top + TH * 1.15), new THREE.Vector2(-half, eavesY + TH)]);
  const RL = DU + 1.1;
  const roof = new THREE.ExtrudeGeometry(rs, { depth: RL, bevelEnabled: false }); roof.translate(0, 0.02, -RL / 2);
  put(body, roof, tile);
  // tile courses: stepped strips along Z, down each slope
  const pitch = Math.atan2(RISE, WU / 2);
  for (const s of [-1, 1]) for (let k = 1; k < 7; k++) {
    const t = k / 7, x = s * half * t, y = top - (top - eavesY) * t + TH + 0.06;
    box(body, 0.16, 0.12, RL, tile, x, y, 0, 0, 0, -s * pitch);
  }
  // mill race + wheel on +X
  const ax = W / 2 + 1.35, ay = 3.25, R = 3.0, Lr = 9.0;
  const race = panel([[-Lr / 2, 0], [Lr / 2, 0], [Lr / 2, 0.9], [-Lr / 2, 0.9]], [], 0.6, stone);
  put(body, race, stone, ax + 1.6, 0, 0, 0, Math.PI / 2, 0);
  box(body, 2.0, 0.12, Lr, stone, ax, 0.06, 0);
  put(body, new THREE.PlaneGeometry(1.7, Lr - 0.1), water, ax, 0.42, 0, -Math.PI / 2);
  for (let k = 0; k < 6; k++) box(body, 0.66, 0.2, 1.4, chalk, ax + 1.3, 0.98, -Lr / 2 + 0.75 + k * 1.5);
  // pier: extruded stepped profile
  const pier = panel([[-0.6, 0], [0.6, 0], [0.45, ay - 0.1], [-0.45, ay - 0.1]], [], 0.9, stone);
  put(body, pier, stone, ax + 1.75, 0, 0, 0, Math.PI / 2, 0);

  const wheel = new THREE.Group(); wheel.position.set(ax, ay, 0); g.add(wheel);
  const ring = (ro, ri, t) => { const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h); const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 28 }); geo.translate(0, 0, -t / 2); geo.rotateY(Math.PI / 2); return geo; };
  for (const x of [-0.5, 0.5]) {
    put(wheel, ring(R, R - 0.3, 0.16), timber, x);
    put(wheel, ring(R - 1.0, R - 1.2, 0.14), timber, x);
    for (let k = 0; k < 4; k++) box(wheel, 0.14, 2 * R - 0.2, 0.18, timber, x, 0, 0, (k * Math.PI) / 4 + Math.PI / 8, 0, 0);
  }
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    box(wheel, 1.2, 0.85, 0.08, dark, 0, Math.cos(a) * (R - 0.6), Math.sin(a) * (R - 0.6), a, 0, 0);
  }
  const lat = new THREE.LatheGeometry([[0.2, -0.75], [0.5, -0.65], [0.5, 0.65], [0.2, 0.75]].map(([r, y]) => new THREE.Vector2(r, y)), 10);
  lat.rotateZ(Math.PI / 2); put(wheel, lat, dark);
  const axle = new THREE.CylinderGeometry(0.16, 0.16, 3.4, 8); axle.rotateZ(Math.PI / 2); put(wheel, axle, iron, 0.0);
  g.userData.joints = { wheel };
