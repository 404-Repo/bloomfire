// stone_steps c2: profile arm. The flight is one staircase profile extruded
// across its width; each tread gets a rounded bullnose; the side walls are
// extruded sloping profiles with a sloped coping slab.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.92) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const STONE = mat(0xc9b48f, 'stone');
  const CHALK = mat(0xe8e2d4, 'stone');

  const NS = 8, RISE = 0.3, RUN = 0.6, WALL = 0.42, IN = 3.0 - 2 * WALL;
  // profile in (z, y) drawn as (u = -z, y) so +u runs uphill to the back
  const s = new THREE.Shape();
  s.moveTo(-2.4, 0);
  for (let i = 0; i < NS; i++) { const u = -2.4 + RUN * i; s.lineTo(u, RISE * (i + 1) - 0.08); s.lineTo(u + RUN, RISE * (i + 1) - 0.08); }
  s.lineTo(2.4, 0);
  const sg = new THREE.ExtrudeGeometry(s, { depth: IN, bevelEnabled: false });
  sg.translate(0, 0, -IN / 2);
  const flight = new THREE.Mesh(sg, STONE);
  flight.rotation.y = Math.PI / 2;     // profile u axis -> -z
  g.add(flight);
  // tread slabs with bullnose fronts, split into two stones per tread
  for (let i = 0; i < NS; i++) {
    const zf = 2.4 - RUN * i, y = RISE * (i + 1);
    for (const half of [-1, 1]) {
      const off = (i % 2 ? 0.25 : -0.25);
      const x0 = half < 0 ? -IN / 2 : off + 0.02, x1 = half < 0 ? off - 0.02 : IN / 2;
      const w = x1 - x0, xc = (x0 + x1) / 2;
      const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, RUN - 0.1), (i + (half > 0 ? 1 : 0)) % 3 ? STONE : CHALK);
      slab.position.set(xc, y - 0.05, zf - RUN / 2 - 0.02);
      g.add(slab);
      const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, w, 8), slab.material);
      nose.rotation.z = Math.PI / 2;
      nose.position.set(xc, y - 0.09, zf - 0.08);
      g.add(nose);
    }
  }
  // sloping side walls
  for (const sd of [-1, 1]) {
    const w = new THREE.Shape();
    w.moveTo(-2.4, 0); w.lineTo(-2.4, 0.75); w.lineTo(2.4, 2.4 + 0.5); w.lineTo(2.4, 0);
    const wg = new THREE.ExtrudeGeometry(w, { depth: WALL, bevelEnabled: false });
    wg.translate(0, 0, -WALL / 2);
    const wall = new THREE.Mesh(wg, STONE);
    wall.rotation.y = Math.PI / 2;
    wall.position.x = sd * (IN / 2 + WALL / 2);
    g.add(wall);
    const len = Math.hypot(4.8, 2.15), ang = Math.atan2(2.15, 4.8);
    const cop = new THREE.Mesh(new THREE.BoxGeometry(WALL + 0.1, 0.14, len + 0.1), CHALK);
    cop.position.set(sd * (IN / 2 + WALL / 2), (0.75 + 2.9) / 2 + 0.06, 0);
    cop.rotation.x = ang;    // positive tilts the front (+z) down: front is the low end
    g.add(cop);
    // end blocks at the foot of each wall
    const post = new THREE.Mesh(new THREE.BoxGeometry(WALL + 0.12, 0.95, 0.5), STONE);
    post.position.set(sd * (IN / 2 + WALL / 2), 0.475, 2.4 - 0.25);
    g.add(post);
    const pc = new THREE.Mesh(new THREE.BoxGeometry(WALL + 0.2, 0.12, 0.6), CHALK);
    pc.position.set(sd * (IN / 2 + WALL / 2), 1.01, 2.4 - 0.25);
    g.add(pc);
    // proud ashlar on the outer face
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
      const z = 1.6 - k * 1.5 - (r % 2) * 0.5, y = 0.3 + r * 0.55;
      if (y > 0.75 + (2.4 - z) / 4.8 * 2.15 - 0.4) continue;
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.9), (r + k) % 2 ? CHALK : STONE);
      b.position.set(sd * (1.5 + 0.03), y, z);
      g.add(b);
    }
  }
  // back face ashlar
  for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 0.06), (r + k) % 2 ? CHALK : STONE);
    b.position.set(-0.5 + k * 1.0 + (r % 2 ? 0.2 : -0.2), 0.3 + r * 0.58, -2.4 - 0.03);
    g.add(b);
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
