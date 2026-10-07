// stone_steps c1: primitives arm. Each step is a course of 2 or 3 staggered
// blocks that run to the ground; stepped cheek walls with chalk coping either
// side; proud course blocks on the back and outer faces.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.92) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const STONE = mat(0xc9b48f, 'stone');
  const CHALK = mat(0xe8e2d4, 'stone');

  const NS = 8, RISE = 0.3, RUN = 0.6, WALL = 0.4, IN = 3.0 - 2 * WALL;
  const add = (w, h, d, x, y, z, m = STONE) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };

  for (let i = 0; i < NS; i++) {
    const zf = 2.4 - RUN * i, h = RISE * (i + 1), zc = zf - RUN / 2;
    const n = i % 2 ? 2 : 3, gap = 0.035, w = (IN - gap * (n - 1)) / n;
    for (let k = 0; k < n; k++) {
      const x = -IN / 2 + w / 2 + k * (w + gap);
      add(w, h, RUN - 0.02, x, h / 2, zc);
      // tread slab, slightly proud at the nose
      add(w - 0.02, 0.1, RUN + 0.02, x, h - 0.04, zc + 0.03, (i + k) % 3 ? STONE : CHALK);
    }
    // stepped cheek walls
    for (const s of [-1, 1]) {
      const wh = h + 0.45;
      add(WALL, wh, RUN, s * (IN / 2 + WALL / 2), wh / 2, zc);
      add(WALL + 0.08, 0.12, RUN + 0.04, s * (IN / 2 + WALL / 2), wh + 0.06, zc, CHALK);
      // outer face course blocks
      if (i % 2 === 0) add(0.08, 0.26, RUN * 0.8, s * (1.5 + 0.04), 0.2 + (i % 4 ? 0.3 : 0), zc, CHALK);
    }
  }
  // back face: proud courses of blocks
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
    const off = r % 2 ? 0.45 : 0;
    const x = -1.0 + k * 1.0 + off - 0.2;
    if (Math.abs(x) > 1.2) continue;
    add(0.9, 0.5, 0.08, x, 0.3 + r * 0.6, -2.4 - 0.04, (r + k) % 2 ? STONE : CHALK);
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
