// terrace_wall c2: rubble reading. Each face is laid separately with flattened
// low-poly boulders (icosahedra), so the faces bulge and the joints shade like
// dry-stone; a plain core fills the middle; coping slabs on top.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.92) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const STONE = mat(0xc9b48f, 'stone');
  const CHALK = mat(0xe8e2d4, 'stone');
  const TERRA = mat(0xc0603a, 'stone');
  let seed = 23; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = () => { const r = rnd(); return r < 0.04 ? TERRA : r < 0.15 ? CHALK : STONE; };
  const L = 6.0, H = 1.2, D = 0.6, CAP = 0.13, BODY = H - CAP;
  // lay courses: returns [{x, y, w, h}] covering the face
  const courses = () => {
    const out = []; let y = 0;
    while (y < BODY - 0.05) {
      let h = 0.2 + rnd() * 0.12; if (BODY - (y + h) < 0.14) h = BODY - y;
      let x = -L / 2;
      while (x < L / 2 - 0.05) { let w = 0.28 + rnd() * 0.4; if (L / 2 - (x + w) < 0.2) w = L / 2 - x; out.push({ x: x + w / 2, y: y + h / 2, w, h }); x += w; }
      y += h;
    }
    return out;
  };

  const core = new THREE.Mesh(new THREE.BoxGeometry(L - 0.06, BODY, D - 0.2), STONE); core.position.set(0, BODY / 2, 0); g.add(core);
  const ico = new THREE.IcosahedronGeometry(1, 0);
  for (const side of [-1, 1]) for (const s of courses()) {
    const b = new THREE.Mesh(ico, pick());
    b.scale.set(s.w / 2 * 1.02, s.h / 2 * 1.05, 0.14 + rnd() * 0.04);
    b.position.set(s.x, s.y, side * (D / 2 - 0.12));
    b.rotation.set(0, 0, (rnd() - 0.5) * 0.5);
    g.add(b);
  }

  // coping: three chunky slabs, slightly proud on both faces
  for (let k = 0; k < 3; k++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(L / 3 - 0.05, CAP, D + 0.1), CHALK);
    s.position.set(-L / 3 + k * L / 3, BODY + CAP / 2, 0); s.rotation.y = (rnd() - 0.5) * 0.02; g.add(s);
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
