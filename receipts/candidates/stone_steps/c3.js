// stone_steps c3: a different reading, closest to the painted reference. Every
// tread is a course of chunky pillow stones (rounded-rectangle profile, each
// stone its own width) sitting on a plain stepped core; cheek walls are rubble
// courses of the same pillow stones, stepping down with the flight.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.92) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const STONE = mat(0xc9b48f, 'stone');
  const CHALK = mat(0xe8e2d4, 'stone');
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const NS = 8, RISE = 0.3, RUN = 0.6, WALL = 0.42, IN = 3.0 - 2 * WALL;
  // rounded-rect section (h x d), extruded along local z, rotated so z -> x
  const geoCache = new Map();
  const pillowGeo = (h, d, w) => {
    const key = [h, d, w].map((n) => n.toFixed(2)).join(',');
    if (geoCache.has(key)) return geoCache.get(key);
    const r = Math.min(0.08, h * 0.3), s = new THREE.Shape();
    s.moveTo(-d / 2 + r, -h / 2); s.lineTo(d / 2 - r, -h / 2); s.absarc(d / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0);
    s.lineTo(d / 2, h / 2 - r); s.absarc(d / 2 - r, h / 2 - r, r, 0, Math.PI / 2);
    s.lineTo(-d / 2 + r, h / 2); s.absarc(-d / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI);
    s.lineTo(-d / 2, -h / 2 + r); s.absarc(-d / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5);
    const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 2 });
    geo.translate(0, 0, -w / 2);
    geo.rotateY(Math.PI / 2);   // depth (shape x) -> -z... width (extrude z) -> x
    geoCache.set(key, geo);
    return geo;
  };
  const pillow = (w, h, d, x, y, z, m) => { const p = new THREE.Mesh(pillowGeo(h, d, w), m); p.position.set(x, y, z); g.add(p); };

  // stepped core
  for (let i = 0; i < NS; i++) {
    const h = RISE * (i + 1) - 0.12, zc = 2.4 - RUN * i - RUN / 2 - 0.04;
    const core = new THREE.Mesh(new THREE.BoxGeometry(IN, h, RUN), STONE);
    core.position.set(0, h / 2, zc - 0.02);
    g.add(core);
    // tread course: random widths
    let x = -IN / 2;
    while (x < IN / 2 - 0.05) {
      let w = 0.55 + rnd() * 0.5; if (IN / 2 - (x + w) < 0.4) w = IN / 2 - x;
      pillow(w - 0.04, 0.28, RUN + 0.04, x + w / 2, RISE * (i + 1) - 0.14, 2.4 - RUN * i - RUN / 2, rnd() < 0.25 ? CHALK : STONE);
      x += w;
    }
  }
  // cheek walls: courses of pillow stones, top steps down with the flight
  for (const sd of [-1, 1]) {
    const xc = sd * (IN / 2 + WALL / 2);
    for (let r = 0; r < 10; r++) {
      const y = 0.15 + r * 0.3;
      let z = 2.4;
      while (z > -2.4 + 0.05) {
        let d = 0.6 + rnd() * 0.5; if (z - d < -2.4 + 0.3) d = z + 2.4;
        const zc = z - d / 2;
        const stepTop = RISE * (Math.min(NS - 1, Math.floor((2.4 - zc) / RUN)) + 1);
        if (y + 0.15 <= stepTop + 0.42) {
          // a pillow rotated to run along z
          const p = new THREE.Mesh(pillowGeo(0.28, WALL, d - 0.04), (r * 7 + Math.floor(z * 3)) % 5 ? STONE : CHALK);
          p.rotation.y = Math.PI / 2; p.position.set(xc, y, zc); g.add(p);
        }
        z -= d;
      }
    }
    // a filled core inside the cheek wall so no light leaks through gaps
    for (let i = 0; i < NS; i++) {
      const h = RISE * (i + 1) + 0.3, core = new THREE.Mesh(new THREE.BoxGeometry(WALL - 0.1, h, RUN), STONE);
      core.position.set(xc, h / 2, 2.4 - RUN * i - RUN / 2); g.add(core);
    }
  }
  // back face: pillow courses across the full height
  for (let r = 0; r < 8; r++) {
    let x = -IN / 2;
    while (x < IN / 2 - 0.05) {
      let w = 0.5 + rnd() * 0.45; if (IN / 2 - (x + w) < 0.35) w = IN / 2 - x;
      pillow(w - 0.04, 0.28, 0.2, x + w / 2, 0.15 + r * 0.3, -2.4 + 0.06, rnd() < 0.2 ? CHALK : STONE);
      x += w;
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
