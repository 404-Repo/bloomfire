// water_mill c3: a different reading. Overshot wheel fed by a timber flume on trestles
// coming from behind; jettied half-timbered upper storey on exposed joist ends; arched
// stone doorway; clasp-arm wheel (paired arms boxing the axle) with bucket boards.
// userData.joints.wheel: Group at the axle, spins about local X.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (hex, name, r = 0.85, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra }); m.name = name; return m; };
  const stone = M(0xc9b48f, 'stone'), chalk = M(0xe8e2d4, 'stone'), plaster = M(0xeee3cf, 'plaster');
  const tile = M(0xc0603a, 'tile', 0.8), timber = M(0x7a5534, 'timber'), dark = M(0x4a3324, 'timber');
  const teal = M(0x3f8a8a, 'timber'), madder = M(0xa8382e, 'timber'), iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
  const water = M(0x3f8a8a, '', 0.25);
  const put = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); p.add(me); return me; };
  const box = (p, w, h, d, mat, x, y, z, rx, ry, rz) => put(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
  const body = new THREE.Group(); g.add(body);
  const W = 7.6, D = 6.4, H1 = 3.4, H2 = 2.9, RISE = 2.5, J = 0.45;

  box(body, W, H1, D, stone, 0, H1 / 2, 0);
  // plinth course
  box(body, W + 0.2, 0.5, D + 0.2, chalk, 0, 0.25, 0);
  // corner buttress quoins (chunky)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let i = 0; i < 4; i++) box(body, 0.7, 0.7, 0.7, chalk, sx * (W / 2 - 0.25), 0.85 + i * 0.75, sz * (D / 2 - 0.25));
  // arched doorway: dark recess + voussoir ring
  const fz = D / 2;
  box(body, 1.2, 1.6, 0.1, dark, -1.4, 0.8 + 0.5, fz + 0.01);
  const arc = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 10, 1, false, -Math.PI / 2, Math.PI); arc.rotateX(Math.PI / 2);
  put(body, arc, dark, -1.4, 2.1, fz + 0.01);
  for (let k = 0; k <= 6; k++) { const a = Math.PI - (k / 6) * Math.PI; box(body, 0.32, 0.42, 0.3, chalk, -1.4 + Math.cos(a) * 0.82, 2.1 + Math.sin(a) * 0.82, fz + 0.1, 0, 0, a - Math.PI / 2); }
  for (const s of [-1, 1]) box(body, 0.32, 1.6, 0.3, chalk, -1.4 + s * 0.82, 1.3, fz + 0.1);
  box(body, 1.0, 1.95, 0.08, madder, -1.4, 0.975 + 0.5, fz + 0.04);
  // ground window with iron bars, front and back
  for (const sz of [-1, 1]) {
    box(body, 1.0, 0.8, 0.1, dark, 1.6, 2.2, sz * (fz + 0.01));
    box(body, 1.3, 0.2, 0.3, chalk, 1.6, 1.72, sz * (fz + 0.1));
    for (let k = 0; k < 3; k++) box(body, 0.05, 0.8, 0.05, iron, 1.35 + k * 0.25, 2.2, sz * (fz + 0.08));
  }
  box(body, 0.1, 1.4, 1.4, dark, -W / 2 - 0.01, 2.0, 0);
  // jetty: joists sticking out front and back
  const y2 = H1;
  for (const sz of [-1, 1]) for (let k = 0; k < 9; k++) box(body, 0.22, 0.26, J + 0.3, timber, -W / 2 + 0.3 + k * (W - 0.6) / 8, y2 + 0.13, sz * (D / 2 + (J + 0.3) / 2 - 0.15));
  box(body, W + 0.2, 0.26, D + 2 * J, timber, 0, y2 + 0.39, 0);
  // upper storey, deeper than the base (jettied)
  const yb = y2 + 0.52, DU = D + 2 * J, WU = W + 0.1;
  box(body, WU - 0.1, H2, DU - 0.1, plaster, 0, yb + H2 / 2, 0);
  // frame: posts, rail, X braces in panels
  const frameFace = (L, z, ry) => { const f = new THREE.Group(); f.rotation.y = ry; body.add(f);
    const n = 4, step = L / n;
    for (let k = 0; k <= n; k++) box(f, 0.26, H2, 0.14, timber, -L / 2 + k * step, yb + H2 / 2, z);
    box(f, L + 0.2, 0.22, 0.14, timber, 0, yb + H2 - 0.1, z);
    box(f, L + 0.2, 0.2, 0.14, timber, 0, yb + 0.1, z);
    for (let k = 0; k < n; k++) {
      const cx = -L / 2 + (k + 0.5) * step;
      if (k === 1 || k === 2) { // window bay
        box(f, 0.9, 1.1, 0.06, k === 1 ? dark : madder, cx, yb + 1.45, z - 0.02);
        box(f, 0.4, 1.1, 0.08, teal, cx - 0.66, yb + 1.45, z + 0.08, 0, 0.3, 0);
        box(f, 0.4, 1.1, 0.08, teal, cx + 0.66, yb + 1.45, z + 0.08, 0, -0.3, 0);
        box(f, 1.1, 0.14, 0.24, chalk, cx, yb + 0.86, z + 0.06);
      } else {
        const len = Math.hypot(step, H2 - 0.3), a = Math.atan2(H2 - 0.3, step);
        box(f, len - 0.2, 0.18, 0.12, timber, cx, yb + H2 / 2, z, 0, 0, a);
        box(f, len - 0.2, 0.18, 0.12, timber, cx, yb + H2 / 2, z, 0, 0, -a);
      }
    }
  };
  frameFace(WU, DU / 2, 0); frameFace(WU, DU / 2, Math.PI); frameFace(DU, WU / 2, Math.PI / 2); frameFace(DU, WU / 2, -Math.PI / 2);
  // gable prism + roof
  const y3 = yb + H2;
  const prism = new THREE.CylinderGeometry(1, 1, DU - 0.1, 3, 1); prism.rotateX(-Math.PI / 2);
  prism.scale((WU - 0.1) / 1.732, RISE / 1.5, 1); prism.translate(0, RISE / 3, 0);
  put(body, prism, plaster, 0, y3, 0);
  for (const sz of [-1, 1]) { box(body, 0.24, RISE * 0.85, 0.14, timber, 0, y3 + RISE * 0.42, sz * DU / 2); box(body, WU * 0.55, 0.2, 0.14, timber, 0, y3 + 1.0, sz * DU / 2); }
  const OV = 0.55, half = WU / 2, pitch = Math.atan2(RISE, half), run = (half + OV) / Math.cos(pitch), RL = DU + 1.0;
  for (const s of [-1, 1]) {
    const cx = s * (half + OV) / 2, cy = y3 + RISE - Math.tan(pitch) * (half + OV) / 2 + 0.15;
    box(body, run, 0.28, RL, tile, cx, cy, 0, 0, 0, -s * pitch);
    for (let k = 0; k < 12; k++) {
      const rib = new THREE.CylinderGeometry(0.11, 0.11, run, 5, 1, false, 0, Math.PI); rib.rotateZ(Math.PI / 2); rib.rotateX(-Math.PI / 2);
      put(body, rib, tile, cx - s * Math.sin(pitch) * 0.14, cy + Math.cos(pitch) * 0.14, -RL / 2 + 0.3 + k * (RL - 0.6) / 11, 0, 0, -s * pitch);
    }
    // bargeboards on the gables
    for (const sz of [-1, 1]) box(body, run, 0.34, 0.12, dark, cx, cy - 0.08, sz * (RL / 2 + 0.03), 0, 0, -s * pitch);
  }
  box(body, 0.4, 0.32, RL + 0.1, tile, 0, y3 + RISE + 0.3, 0);

  // overshot wheel + flume
  const ax = W / 2 + 1.3, ay = 3.2, R = 3.0;
  // tail race (channel) and side wall
  const Lr = 8.6;
  box(body, 2.0, 0.12, Lr, stone, ax, 0.06, 0.6);
  put(body, new THREE.PlaneGeometry(1.7, Lr - 0.1), water, ax, 0.3, 0.6, -Math.PI / 2);
  box(body, 0.6, 1.0, Lr, stone, ax + 1.3, 0.5, 0.6);
  for (let k = 0; k < 6; k++) box(body, 0.66, 0.2, 1.35, chalk, ax + 1.3, 1.08, 0.6 - Lr / 2 + 0.72 + k * 1.43);
  box(body, 0.8, ay, 1.0, stone, ax + 1.3, ay / 2, 0);
  // flume from the back, on trestles, ending above the wheel crown
  const fy = ay + R + 0.45, fz0 = -0.6, fz1 = -6.2, FL = fz0 - fz1, fzc = (fz0 + fz1) / 2;
  box(body, 1.2, 0.12, FL, timber, ax, fy, fzc);
  for (const s of [-1, 1]) box(body, 0.1, 0.55, FL, timber, ax + s * 0.55, fy + 0.27, fzc);
  put(body, new THREE.PlaneGeometry(1.0, FL - 0.1), water, ax, fy + 0.25, fzc - 0.05, -Math.PI / 2);
  for (const z of [-2.6, -4.6, -6.0]) {
    for (const s of [-1, 1]) box(body, 0.2, fy, 0.2, dark, ax + s * 0.7, fy / 2, z, 0, 0, s * 0.05);
    box(body, 1.7, 0.18, 0.22, dark, ax, fy - 0.15, z);
    box(body, 0.14, 2.2, 0.14, dark, ax, fy * 0.55, z, 0, 0, 0.55);
  }

  const wheel = new THREE.Group(); wheel.position.set(ax, ay, 0); g.add(wheel);
  for (const x of [-0.5, 0.5]) {
    const rim = new THREE.TorusGeometry(R - 0.14, 0.15, 4, 24); rim.rotateY(Math.PI / 2); put(wheel, rim, timber, x);
    // clasp arms: two pairs of parallel beams boxing the axle
    for (const off of [-0.45, 0.45]) {
      box(wheel, 0.16, 2 * R - 0.3, 0.2, timber, x, 0, off);
      box(wheel, 0.16, 0.2, 2 * R - 0.3, timber, x, off, 0);
    }
  }
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    box(wheel, 1.15, 0.7, 0.07, dark, 0, c * (R - 0.45), s * (R - 0.45), a, 0, 0);       // radial board
    box(wheel, 1.15, 0.07, 0.55, dark, 0, c * (R - 0.12), s * (R - 0.12), a, 0, 0);      // sole board
  }
  const axle = new THREE.CylinderGeometry(0.22, 0.22, 3.0, 8); axle.rotateZ(Math.PI / 2); put(wheel, axle, dark, -0.15);
  for (const x of [-0.62, 0.62]) { const b = new THREE.CylinderGeometry(0.26, 0.26, 0.1, 8); b.rotateZ(Math.PI / 2); put(wheel, b, iron, x); }
  g.userData.joints = { wheel };
