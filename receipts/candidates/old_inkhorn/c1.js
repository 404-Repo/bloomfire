// Old Inkhorn, candidate 1: primitives. A hunched colossus built in a 3.4 m rig unit inside a
// scaled wrapper: sphere-and-cylinder ink muscle, faceted sheen pauldrons and bracers with
// strap bands, a bone rib cage of torus arcs around a separate core joint, a horned skull with
// fangs, long arms ending in four hooked bone claws, ink drips hanging off everything.
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
  const g = new THREE.Group();
  const rig = J(g, 0, 0, 0); rig.scale.setScalar(4.15);
  const slab = (r, sx, sy, sz) => { const geo = new THREE.DodecahedronGeometry(r, 0); geo.scale(sx, sy, sz); return geo; };
  const drip = new THREE.ConeGeometry(0.022, 0.16, 6);
  const drips = (p, list) => list.forEach(([x, y, z]) => p.add(M(drip, ink, x, y, z, 1, 1, 1, Math.PI)));
  const body = J(rig, 0, 1.2, 0);
  const torso = J(body, 0, 0, 0); torso.rotation.x = 0.4;
  torso.add(M(new THREE.SphereGeometry(0.44, 16, 12), ink, 0, 0, 0, 1.1, 0.85, 0.85));
  torso.add(M(new THREE.SphereGeometry(0.62, 18, 14), ink, 0, 0.82, -0.02, 1.2, 1.05, 0.88));
  torso.add(M(new THREE.SphereGeometry(0.4, 14, 10), ink, 0, 1.2, -0.25, 1.4, 0.8, 1.0));       // hump
  torso.add(M(slab(0.42, 1.6, 1.25, 0.35), sheen, 0, 1.05, -0.5, 1, 1, 1, 0.15));
  // rib cage: bone arcs from the sternum, open in the middle to show the core
  const rib = new THREE.TorusGeometry(0.42, 0.04, 6, 14, 1.25);
  for (let i = 0; i < 5; i++) [1, -1].forEach((s) => {
    const r = M(rib, bone, 0.1 * s, 1.05 - i * 0.13, 0.12, s * (1 - i * 0.06), 1, 1, 0, 0, 0);
    r.rotation.set(Math.PI / 2 + 0.25, 0, s > 0 ? -0.35 : Math.PI + 0.35); torso.add(r);
  });
  torso.add(M(new THREE.CapsuleGeometry(0.045, 0.5, 3, 8), bone, 0, 0.85, 0.52, 1, 1, 1, -0.1));  // sternum
  const coreJ = J(torso, 0, 0.78, 0.4);
  coreJ.add(M(new THREE.SphereGeometry(0.26, 16, 12), core, 0, 0, 0, 1, 1.1, 0.75));
  drips(torso, [[0.45, 0.4, 0.3], [-0.5, 0.5, 0.2], [0.3, 0.15, 0.35], [-0.2, 0.05, 0.4], [0.62, 0.8, 0.1]]);
  // head: skull below the shoulder line
  const head = J(torso, 0, 1.38, 0.42); head.rotation.x = -0.4;
  head.add(M(new THREE.SphereGeometry(0.26, 14, 10), ink, 0, 0.08, -0.12));
  head.add(M(new THREE.SphereGeometry(0.26, 16, 12, Math.PI / 2 - 1.2, 2.4, 0.15, 2.0), bone, 0, 0.12, 0.0, 1, 1.05, 1.1));
  head.add(M(slab(0.13, 1.35, 0.6, 0.85), bone, 0, -0.08, 0.15));
  const hornC = (s) => new THREE.CatmullRomCurve3([[0, 0, 0], [0.25 * s, 0.05, -0.05], [0.45 * s, 0.3, -0.08], [0.45 * s, 0.62, 0.02], [0.36 * s, 0.8, 0.12]].map((p) => new THREE.Vector3(...p)));
  [1, -1].forEach((s) => {
    const c = hornC(s), hg = new THREE.TubeGeometry(c, 14, 0.1, 8, false), p = hg.attributes.position, q = new THREE.Vector3();
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
    sh.add(M(new THREE.SphereGeometry(0.32, 12, 10), ink));
    sh.add(M(new THREE.CylinderGeometry(0.27, 0.21, 0.72, 12), ink, 0.1 * s, -0.42, 0.06, 1, 1, 1, -0.12, 0, 0.1 * s));
    sh.add(M(new THREE.SphereGeometry(0.23, 10, 8), ink, 0.15 * s, -0.8, 0.12));
    sh.add(M(new THREE.CylinderGeometry(0.3, 0.24, 0.7, 12), ink, 0.17 * s, -1.15, 0.25, 1, 1, 1, -0.3));
    sh.add(M(slab(0.32, 1.15, 1.15, 1.1), sheen, 0.19 * s, -1.08, 0.24, 1, 1, 1, -0.3));
    sh.add(M(new THREE.CylinderGeometry(0.33, 0.33, 0.08, 12), sheen, 0.17 * s, -1.38, 0.32, 1, 1, 1, -0.3));
    sh.add(M(new THREE.SphereGeometry(0.28, 12, 9), ink, 0.18 * s, -1.55, 0.42, 1.1, 0.9, 1.0));
    for (let c = 0; c < 4; c++) {
      const cl = J(sh, 0.18 * s + (c - 1.5) * 0.13, -1.66, 0.5); cl.rotation.set(-0.5, 0, (c - 1.5) * 0.2);
      cl.add(M(new THREE.SphereGeometry(0.07, 8, 6), ink)); cl.add(M(claw, bone, 0, -0.03, 0, 1, 1, 1, 0.45));
    }
    drips(sh, [[0.3 * s, -0.4, 0.1], [0.05 * s, -1.3, 0.45], [0.35 * s, -1.0, 0.2]]);
    joints[n] = sh;
  });
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.36 * s, -0.02, -0.04);
    hip.add(M(new THREE.CylinderGeometry(0.32, 0.25, 0.62, 12), ink, 0.06 * s, -0.32, 0.05, 1, 1, 1, -0.15));
    hip.add(M(new THREE.SphereGeometry(0.25, 10, 8), ink, 0.07 * s, -0.66, 0.12));
    hip.add(M(new THREE.CylinderGeometry(0.24, 0.29, 0.5, 12), ink, 0.07 * s, -0.9, 0.04));
    hip.add(M(new THREE.SphereGeometry(0.34, 12, 8), ink, 0.07 * s, -1.12, 0.12, 1, 0.45, 1.3));
    for (let c = -1; c <= 1; c++) hip.add(M(new THREE.ConeGeometry(0.06, 0.22, 6), bone, 0.07 * s + c * 0.15, -1.14, 0.53, 1, 1, 1, Math.PI / 2));
    drips(hip, [[0.25 * s, -0.4, 0.1], [-0.1 * s, -0.6, 0.2]]);
    joints[n] = hip;
  });
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
