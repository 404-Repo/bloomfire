// stone_bridge c3: a different reading. Taller semicircular main arch with a
// ring of extruded wedge voussoirs, two small flood oculi through the
// spandrels, cutwater buttresses, and parapets that splay outward at both ends
// like wing walls.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.92) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const STONE = mat(0xc9b48f, 'stone');
  const CHALK = mat(0xe8e2d4, 'stone');

  const W = 3.6, N = 36, PT = 0.36, PH = 0.7;
  const top = (x) => 0.4 + 2.0 * Math.cos(Math.PI * x / 18);
  const R = 1.75, ring = 0.42, spring = 0.0;   // semicircle, crown 1.75, extrados 2.17

  const body = new THREE.Shape();
  body.moveTo(-9, 0); body.lineTo(-R, 0);
  for (let i = 1; i < 16; i++) { const a = Math.PI - Math.PI * i / 16; body.lineTo(R * Math.cos(a), spring + R * Math.sin(a)); }
  body.lineTo(R, 0); body.lineTo(9, 0);
  for (let i = N; i >= 0; i--) { const x = -9 + 18 * i / N; body.lineTo(x, top(x)); }
  for (const ex of [-1, 1]) {
    const h = new THREE.Path(); const cx = ex * 4.6, cyy = 0.95, r = 0.42;
    for (let i = 0; i <= 10; i++) { const a = -2 * Math.PI * i / 10; i ? h.lineTo(cx + r * Math.cos(a), cyy + r * Math.sin(a)) : h.moveTo(cx + r, cyy); }
    body.holes.push(h);
  }
  const bg = new THREE.ExtrudeGeometry(body, { depth: W, bevelEnabled: false });
  bg.translate(0, 0, -W / 2);
  g.add(new THREE.Mesh(bg, STONE));

  // wedge voussoirs, extruded slightly wider than the body so they stand proud
  const nv = 9;
  for (let k = 0; k < nv; k++) {
    const b0 = Math.PI - Math.PI * k / nv + 0.012, b1 = Math.PI - Math.PI * (k + 1) / nv - 0.012;
    const s = new THREE.Shape();
    s.moveTo(R * Math.cos(b0), R * Math.sin(b0));
    s.lineTo((R + ring) * Math.cos(b0), (R + ring) * Math.sin(b0));
    s.lineTo((R + ring) * Math.cos(b1), (R + ring) * Math.sin(b1));
    s.lineTo(R * Math.cos(b1), R * Math.sin(b1));
    const vg = new THREE.ExtrudeGeometry(s, { depth: W + 0.16, bevelEnabled: false });
    vg.translate(0, 0, -(W + 0.16) / 2);
    g.add(new THREE.Mesh(vg, k === 4 ? CHALK : STONE));
  }
  // oculus rims
  for (const ex of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.08, 4, 10), CHALK);
    for (const side of [-1, 1]) { const r2 = rim.clone(); r2.position.set(ex * 4.6, 0.95, side * (W / 2 + 0.02)); g.add(r2); }
  }
  // parapet band following the deck
  const band = (lo, hi, x0, x1) => {
    const s = new THREE.Shape(); const n = Math.round(N * (x1 - x0) / 18);
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; i ? s.lineTo(x, top(x) + lo) : s.moveTo(x, top(x) + lo); }
    for (let i = n; i >= 0; i--) { const x = x0 + (x1 - x0) * i / n; s.lineTo(x, top(x) + hi); }
    return s;
  };
  const XW = 6.6;   // wing walls start here
  for (const side of [-1, 1]) {
    const p = new THREE.ExtrudeGeometry(band(-0.3, PH, -XW, XW), { depth: PT, bevelEnabled: false });
    p.translate(0, 0, side > 0 ? W / 2 : -W / 2 - PT);
    g.add(new THREE.Mesh(p, STONE));
    const cp = new THREE.ExtrudeGeometry(band(PH, PH + 0.13, -XW, XW), { depth: PT + 0.1, bevelEnabled: false });
    cp.translate(0, 0, side > 0 ? W / 2 - 0.05 : -W / 2 - PT - 0.05);
    g.add(new THREE.Mesh(cp, CHALK));
    // splayed wing walls: low walls from the bridge ends angling outward
    for (const ex of [-1, 1]) {
      const len = Math.hypot(9 - XW, 0.9), ang = Math.atan2(0.9, 9 - XW);
      const hh = top(XW) + PH;
      const w = new THREE.Mesh(new THREE.BoxGeometry(len, hh, PT), STONE);
      w.position.set(ex * (XW + 9) / 2, hh / 2, side * (W / 2 + PT / 2 + 0.45));
      w.rotation.y = -ex * side * ang;
      g.add(w);
      const wc = new THREE.Mesh(new THREE.BoxGeometry(len, 0.13, PT + 0.1), CHALK);
      wc.position.set(ex * (XW + 9) / 2, hh + 0.065, side * (W / 2 + PT / 2 + 0.45));
      wc.rotation.y = w.rotation.y;
      g.add(wc);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.6, hh + 0.35, 0.6), STONE);
      post.position.set(ex * 9.0, (hh + 0.35) / 2, side * (W / 2 + PT / 2 + 0.9));
      g.add(post);
      const pc = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.15, 0.74), CHALK);
      pc.position.set(ex * 9.0, hh + 0.42, side * (W / 2 + PT / 2 + 0.9));
      g.add(pc);
    }
    // cutwater buttresses flanking the arch
    for (const ex of [-1, 1]) {
      const cw = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.62, 1.6, 3, 1), STONE);
      cw.position.set(ex * (R + 0.75), 0.8, side * (W / 2 + 0.05));
      cw.rotation.y = side > 0 ? Math.PI / 6 : -Math.PI / 6 + Math.PI;
      g.add(cw);
    }
  }

  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
