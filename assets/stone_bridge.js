// stone_bridge c4: c1 refined (wider, higher arch; thick proud voussoir ring;
// string course; segmented coping; taller end piers).
// Base: profile arm. The whole body is one extruded side profile
// (segmental arch cut out, deck top sampled on the walking line), parapets and
// coping are extruded bands that follow the same curve.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.92) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const STONE = mat(0xc9b48f, 'stone');
  const CHALK = mat(0xe8e2d4, 'stone');

  const W = 3.6, N = 36, PT = 0.4, PH = 0.7;
  const top = (x) => 0.4 + 2.0 * Math.cos(Math.PI * x / 18);
  const span = 9.0, rise = 1.85;
  const R = (rise * rise + (span / 2) ** 2) / (2 * rise), cy = rise - R;
  const a0 = Math.atan2(-cy, -span / 2), a1 = Math.atan2(-cy, span / 2);

  // body
  const body = new THREE.Shape();
  body.moveTo(-9, 0); body.lineTo(-span / 2, 0);
  for (let i = 1; i < 14; i++) { const a = a0 + (a1 - a0) * i / 14; body.lineTo(R * Math.cos(a), cy + R * Math.sin(a)); }
  body.lineTo(span / 2, 0); body.lineTo(9, 0);
  for (let i = N; i >= 0; i--) { const x = -9 + 18 * i / N; body.lineTo(x, top(x)); }
  const bg = new THREE.ExtrudeGeometry(body, { depth: W, bevelEnabled: false, curveSegments: 1 });
  bg.translate(0, 0, -W / 2);
  g.add(new THREE.Mesh(bg, STONE));

  // a band that follows the deck curve between two offsets
  const band = (lo, hi, x0 = -9, x1 = 9) => {
    const s = new THREE.Shape(); const n = Math.round(N * (x1 - x0) / 18);
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; i ? s.lineTo(x, top(x) + lo) : s.moveTo(x, top(x) + lo); }
    for (let i = n; i >= 0; i--) { const x = x0 + (x1 - x0) * i / n; s.lineTo(x, top(x) + hi); }
    return s;
  };
  for (const side of [-1, 1]) {
    const p = new THREE.ExtrudeGeometry(band(-0.35, PH, -8.45, 8.45), { depth: PT, bevelEnabled: false });
    p.translate(0, 0, side > 0 ? W / 2 : -W / 2 - PT);
    g.add(new THREE.Mesh(p, STONE));
    for (let k = 0; k < 9; k++) {
      const xa = -8.45 + 16.9 * k / 9 + 0.04, xb = -8.45 + 16.9 * (k + 1) / 9 - 0.04;
      const c = new THREE.ExtrudeGeometry(band(PH, PH + 0.18, xa, xb), { depth: PT + 0.08, bevelEnabled: false });
      c.translate(0, 0, side > 0 ? W / 2 : -W / 2 - PT - 0.08);
      g.add(new THREE.Mesh(c, CHALK));
    }
    // string course at deck level, proud of the face
    const sc = new THREE.ExtrudeGeometry(band(-0.5, -0.32, -8.45, 8.45), { depth: 0.16, bevelEnabled: false });
    sc.translate(0, 0, side > 0 ? W / 2 : -W / 2 - 0.16);
    g.add(new THREE.Mesh(sc, CHALK));
    // voussoirs proud of each face
    const nv = 13;
    for (let k = 0; k < nv; k++) {
      const a = a0 + (a1 - a0) * (k + 0.5) / nv;
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.7, 0.2), k % 2 ? STONE : CHALK);
      v.position.set((R + 0.35) * Math.cos(a), cy + (R + 0.35) * Math.sin(a), side * (W / 2 + 0.1));
      v.rotation.z = a - Math.PI / 2;
      g.add(v);
    }
    // end piers with caps
    for (const ex of [-1, 1]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.7, 0.7), STONE);
      pier.position.set(ex * 8.7, 0.85, side * (W / 2 + 0.44));
      g.add(pier);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.2, 0.86), CHALK);
      cap.position.set(ex * 8.7, 1.8, side * (W / 2 + 0.44));
      g.add(cap);
    }
    // a few proud ashlar blocks on the abutment faces
    for (const ex of [-1, 1]) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.45, 0.2), CHALK);
      sp.position.set(ex * (span / 2 + 0.5), 0.225, side * (W / 2 + 0.1));
      g.add(sp);
      for (let j = 0; j < 2; j++) {
        const bx = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.1), STONE);
        bx.position.set(ex * (6.3 + j * 1.1), 0.2 + j * 0.34, side * (W / 2 + 0.05));
        g.add(bx);
      }
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
