// Old Inkhorn, candidate 3: hand-built, a different reading. Each muscle mass is a displaced
// icosphere (lumpy, with drips pulled down out of its underside), so the colossus reads as a
// heap of wet ink rather than a jointed figure; armour is chunky faceted dodecahedron slabs;
// the rib cage is a hand-built fan of bone blades; a larger core erupts through the chest.
export default function (THREE) {
  const ink = new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.25, metalness: 0 });
  const sheen = new THREE.MeshStandardMaterial({ color: 0x2b2a45, roughness: 0.32, metalness: 0 });
  const bone = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.6, metalness: 0, side: THREE.DoubleSide });
  const core = new THREE.MeshStandardMaterial({ color: 0xff3d8b, emissive: 0xff3d8b, emissiveIntensity: 2, roughness: 0.4 });
  core.name = 'core';
  const M = (geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
    const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx, ry, rz); return o;
  };
  const J = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); parent.add(o); return o; };
  const lump = (r, det, sx, sy, sz, seed, dripAmt = 0.25) => {
    const geo = new THREE.IcosahedronGeometry(r, det), p = geo.attributes.position, q = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      q.fromBufferAttribute(p, i);
      const n = Math.sin(q.x * 7 + seed) * Math.sin(q.y * 6 + seed * 1.7) * Math.sin(q.z * 7 + seed * 2.3);
      q.multiplyScalar(1 + 0.07 * n); q.set(q.x * sx, q.y * sy, q.z * sz);
      if (q.y < -r * sy * 0.5) { const d = Math.sin(q.x * 11 + seed) * Math.sin(q.z * 9 + seed); if (d > 0.6) q.y -= (d - 0.6) * dripAmt * r; }
      p.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); return geo;
  };
  const slab = (r, sx, sy, sz) => { const geo = new THREE.DodecahedronGeometry(r, 0); geo.scale(sx, sy, sz); return geo; };
  const g = new THREE.Group();
  const rig = J(g, 0, 0, 0); rig.scale.setScalar(4.15);
  const body = J(rig, 0, 1.2, 0);
  const torso = J(body, 0, 0, 0); torso.rotation.x = 0.4;
  torso.add(M(lump(0.44, 2, 1.1, 0.85, 0.85, 1), ink));
  torso.add(M(lump(0.64, 3, 1.2, 1.05, 0.85, 2), ink, 0, 0.82, -0.03));
  torso.add(M(lump(0.4, 2, 1.4, 0.8, 1.0, 3), ink, 0, 1.2, -0.25));
  torso.add(M(slab(0.42, 1.6, 1.25, 0.35), sheen, 0, 1.05, -0.5, 1, 1, 1, 0.15));
  const coreJ = J(torso, 0, 0.8, 0.42);
  coreJ.add(M(lump(0.27, 2, 1, 1.1, 0.75, 5, 0), core));
  // rib blades: a hand-built curved blade, mirrored
  const blade = () => {
    const pos = [], idx = [], N = 8;
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = -0.2 + t * 1.5, r = 0.55 - 0.15 * t, w = 0.06 * (1 - 0.6 * t);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      pos.push(x, w, z, x, -w, z, x * 1.08, 0, z * 1.08);
    }
    for (let i = 0; i < N; i++) { const a = i * 3; idx.push(a, a + 3, a + 2, a + 3, a + 5, a + 2, a + 1, a + 2, a + 4, a + 2, a + 5, a + 4, a, a + 1, a + 3, a + 1, a + 4, a + 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  };
  const bladeGeo = blade();
  for (let i = 0; i < 5; i++) [1, -1].forEach((s) => torso.add(M(bladeGeo, bone, 0, 1.08 - i * 0.14, 0.05, s * (1.05 - i * 0.05), 1, 1, 0.15, s > 0 ? 0 : Math.PI, 0)));
  const head = J(torso, 0, 1.38, 0.42); head.rotation.x = -0.4;
  head.add(M(lump(0.26, 2, 1, 1, 1, 7), ink, 0, 0.08, -0.12));
  head.add(M(new THREE.SphereGeometry(0.26, 16, 12, Math.PI / 2 - 1.2, 2.4, 0.15, 2.0), bone, 0, 0.12, 0.0, 1, 1.05, 1.1));
  head.add(M(slab(0.13, 1.35, 0.6, 0.85), bone, 0, -0.08, 0.15));
  [1, -1].forEach((s) => {
    const c = new THREE.CatmullRomCurve3([[0, 0, 0], [0.3 * s, 0.0, -0.1], [0.55 * s, 0.25, -0.12], [0.6 * s, 0.6, 0.0], [0.48 * s, 0.85, 0.15]].map((p) => new THREE.Vector3(...p)));
    const hg = new THREE.TubeGeometry(c, 14, 0.11, 8, false), p = hg.attributes.position, q = new THREE.Vector3();
    for (let i = 0; i <= 14; i++) { const k = 1 - i / 14.6, ctr = c.getPointAt(i / 14); for (let j = 0; j <= 8; j++) { const idx = i * 9 + j; q.fromBufferAttribute(p, idx).sub(ctr).multiplyScalar(k).add(ctr); p.setXYZ(idx, q.x, q.y, q.z); } }
    hg.computeVertexNormals(); head.add(M(hg, bone, 0.16 * s, 0.24, -0.04));
    for (let f = 0; f < 2; f++) head.add(M(new THREE.ConeGeometry(0.03, 0.16, 6), bone, (0.05 + f * 0.07) * s, -0.16, 0.24, 1, 1, 1, Math.PI));
    head.add(M(new THREE.SphereGeometry(0.05, 8, 6), core, 0.09 * s, 0.13, 0.27, 1.2, 0.8, 0.5));
  });
  const joints = { body, head, core: coreJ };
  const claw = new THREE.ConeGeometry(0.05, 0.38, 6); claw.translate(0, -0.19, 0);
  [['armL', 1], ['armR', -1]].forEach(([n, s]) => {
    const sh = J(torso, 0.84 * s, 1.1, 0.0); sh.rotation.x = -0.4;
    sh.add(M(slab(0.5, 1.15, 0.75, 1.15), sheen, 0.1 * s, 0.18, -0.02, 1, 1, 1, 0, 0, -0.3 * s));
    sh.add(M(lump(0.3, 2, 0.9, 1.6, 0.9, 11 + s), ink, 0.1 * s, -0.4, 0.06));
    sh.add(M(lump(0.29, 2, 1.0, 1.4, 1.0, 13 + s), ink, 0.17 * s, -1.1, 0.25, 1, 1, 1, -0.3));
    sh.add(M(slab(0.32, 1.15, 1.15, 1.1), sheen, 0.19 * s, -1.05, 0.24, 1, 1, 1, -0.3));
    sh.add(M(lump(0.27, 2, 1.1, 0.9, 1.0, 15 + s, 0), ink, 0.18 * s, -1.55, 0.42));
    for (let c = 0; c < 4; c++) {
      const cl = J(sh, 0.18 * s + (c - 1.5) * 0.13, -1.66, 0.5); cl.rotation.set(-0.5, 0, (c - 1.5) * 0.2);
      cl.add(M(claw, bone, 0, 0, 0, 1, 1, 1, 0.45));
    }
    joints[n] = sh;
  });
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.36 * s, -0.02, -0.04);
    hip.add(M(lump(0.32, 2, 1.0, 1.5, 1.0, 21 + s), ink, 0.07 * s, -0.42, 0.08));
    hip.add(M(lump(0.34, 2, 1.0, 0.45, 1.3, 23 + s, 0), ink, 0.07 * s, -1.08, 0.12));
    hip.add(M(new THREE.CylinderGeometry(0.25, 0.29, 0.45, 12), ink, 0.07 * s, -0.86, 0.06));
    for (let c = -1; c <= 1; c++) hip.add(M(new THREE.ConeGeometry(0.06, 0.22, 6), bone, 0.07 * s + c * 0.15, -1.1, 0.53, 1, 1, 1, Math.PI / 2));
    joints[n] = hip;
  });
  bone.side = THREE.DoubleSide;
  g.userData.joints = joints;
  // contract placement: measure vertices, base at y=0, centred on x and z
  const box = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m4.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const ctr = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= ctr.x; o.position.y -= box.min.y; o.position.z -= ctr.z; });
  return g;
}
