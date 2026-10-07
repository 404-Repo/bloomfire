// stone_bridge c2: primitives arm. Deck is a chain of tilted slabs whose top
// edges meet exactly on the walking line; the arch is a ring of voussoir boxes
// through the full width; spandrels are courses of blocks; parapets are tilted
// box segments.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.92) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const STONE = mat(0xc9b48f, 'stone');
  const CHALK = mat(0xe8e2d4, 'stone');

  const W = 3.6, N = 24, PT = 0.38, PH = 0.7, T = 0.4;
  const top = (x) => 0.4 + 2.0 * Math.cos(Math.PI * x / 18);
  const span = 6.4, rise = 1.6, ring = 0.5;
  const R = (rise * rise + (span / 2) ** 2) / (2 * rise), cy = rise - R;
  const a0 = Math.atan2(-cy, -span / 2), a1 = Math.atan2(-cy, span / 2);
  const extrados = (x) => (Math.abs(x) >= span / 2 + 0.01 ? 0 : cy + Math.sqrt(Math.max(0, (R + ring) ** 2 - x * x)));

  // a slab whose top edge runs from (x0, top(x0)) to (x1, top(x1)), offset dy
  const slab = (x0, x1, thick, depth, z, material, dy = 0) => {
    const y0 = top(x0) + dy, y1 = top(x1) + dy;
    const len = Math.hypot(x1 - x0, y1 - y0), th = Math.atan2(y1 - y0, x1 - x0);
    const s = new THREE.Mesh(new THREE.BoxGeometry(len, thick, depth), material);
    s.position.set((x0 + x1) / 2 + Math.sin(th) * thick / 2, (y0 + y1) / 2 - Math.cos(th) * thick / 2, z);
    s.rotation.z = th;
    g.add(s);
  };
  for (let i = 0; i < N; i++) {
    const x0 = -9 + 18 * i / N, x1 = -9 + 18 * (i + 1) / N;
    slab(x0, x1, T, W, 0, STONE);
    for (const side of [-1, 1]) {
      slab(x0, x1, PH + 0.3, PT, side * (W / 2 + PT / 2), STONE, PH);
      slab(x0, x1, 0.14, PT + 0.12, side * (W / 2 + PT / 2), CHALK, PH + 0.14);
    }
    // spandrel column under this slab
    const xm = (x0 + x1) / 2;
    const lo = extrados(xm), hi = Math.min(top(x0), top(x1)) - T + 0.05;
    if (hi - lo > 0.05) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 0.002, hi - lo, W - 0.08), i % 2 ? STONE : CHALK);
      col.position.set(xm, (hi + lo) / 2, 0);
      g.add(col);
    }
  }
  // arch ring of voussoirs, full width
  const nv = 13;
  for (let k = 0; k < nv; k++) {
    const a = a0 + (a1 - a0) * (k + 0.5) / nv;
    const arc = (R + ring / 2) * Math.abs(a1 - a0) / nv;
    const vb = new THREE.Mesh(new THREE.BoxGeometry(arc * 0.96, ring, W + 0.1), k % 2 ? CHALK : STONE);
    vb.position.set((R + ring / 2) * Math.cos(a), cy + (R + ring / 2) * Math.sin(a), 0);
    vb.rotation.z = a - Math.PI / 2;
    g.add(vb);
  }
  // abutment footings either side of the opening
  for (const ex of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, W + 0.3), CHALK);
    f.position.set(ex * (span / 2 + 0.4), 0.25, 0);
    g.add(f);
  }
  // end piers
  for (const ex of [-1, 1]) for (const side of [-1, 1]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.5, 0.62), STONE);
    pier.position.set(ex * 8.75, 0.75, side * (W / 2 + PT / 2));
    g.add(pier);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 0.78), CHALK);
    cap.position.set(ex * 8.75, 1.58, side * (W / 2 + PT / 2));
    g.add(cap);
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
