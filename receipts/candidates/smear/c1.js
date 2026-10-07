// Smear, candidate 1: primitives. Capsule limbs and torso, hunched forward from a pelvis
// pivot; sheen rib bars on the chest; a cracked bone mask (partial sphere shell) on a
// forward-thrust head; long arms ending in clawed ink hands reaching to the knee.
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
  const seg = (parent, len, r0, r1, mat, ax = 0, az = 0) => {
    // a limb segment hanging DOWN from parent's origin, tilted by ax (about X) / az (about Z)
    const k = J(parent, 0, 0, 0); k.rotation.set(ax, 0, az);
    k.add(M(new THREE.CylinderGeometry(r0, r1, len, 8), mat, 0, -len / 2, 0));
    k.add(M(new THREE.SphereGeometry(r1, 8, 6), mat, 0, -len, 0));
    const end = J(k, 0, -len, 0); return end;
  };
  const body = J(g, 0, 0.98, 0);
  // pelvis + hunched torso
  body.add(M(new THREE.SphereGeometry(0.17, 10, 8), ink, 0, 0, 0, 1.15, 0.8, 0.9));
  const spine = J(body, 0, 0.05, 0); spine.rotation.x = 0.55;
  spine.add(M(new THREE.CapsuleGeometry(0.13, 0.32, 4, 10), ink, 0, 0.26, 0, 1.0, 1, 0.75));
  spine.add(M(new THREE.SphereGeometry(0.2, 12, 9), ink, 0, 0.5, -0.02, 1.15, 0.85, 0.85));
  // ribs on the chest
  for (let i = 0; i < 4; i++) spine.add(M(new THREE.TorusGeometry(0.155 - i * 0.012, 0.016, 4, 10, Math.PI), sheen, 0, 0.47 - i * 0.075, 0.03, 1.1, 1, 0.8, Math.PI / 2 + 0.2, 0, 0));
  // drips
  const drip = new THREE.ConeGeometry(0.025, 0.14, 6);
  [[0.15, 0.3, 0.1], [-0.16, 0.22, 0.05], [0.05, 0.1, 0.12]].forEach(([x, y, z]) => spine.add(M(drip, ink, x, y, z, 1, 1, 1, Math.PI + 0.55)));
  // head: neck forward of the shoulders
  const head = J(spine, 0, 0.66, 0.06); head.rotation.x = -0.35;
  head.add(M(new THREE.CapsuleGeometry(0.05, 0.1, 3, 8), ink, 0, 0.04, 0.0, 1, 1, 1, 0.5));
  head.add(M(new THREE.SphereGeometry(0.13, 12, 10), ink, 0, 0.16, 0.06, 0.9, 1.15, 1.0));
  head.add(M(new THREE.SphereGeometry(0.14, 14, 10, Math.PI / 2 - 1.0, 2.0, 0.25, 2.1), bone, 0, 0.15, 0.08, 0.92, 1.18, 1.0));
  const eye = new THREE.SphereGeometry(0.022, 8, 6);
  head.add(M(eye, core, 0.045, 0.16, 0.215, 1.2, 0.8, 0.5));
  head.add(M(eye, core, -0.045, 0.16, 0.215, 1.2, 0.8, 0.5));
  // crack in the mask: a thin ink wedge
  head.add(M(new THREE.BoxGeometry(0.012, 0.13, 0.03), ink, 0.012, 0.2, 0.215, 1, 1, 1, 0, 0, 0.25));
  // arms from the shoulders (spine space), long, hanging forward
  const joints = { body, head };
  [['armL', 1], ['armR', -1]].forEach(([n, s]) => {
    const sh = J(spine, 0.25 * s, 0.56, 0.0); sh.rotation.x = -0.55; // undo hunch so arm hangs
    sh.add(M(new THREE.SphereGeometry(0.075, 8, 6), ink));
    const elbow = seg(sh, 0.5, 0.06, 0.045, ink, -0.25, 0.12 * s);
    const wrist = seg(elbow, 0.48, 0.045, 0.03, ink, -0.35, -0.05 * s);
    wrist.add(M(new THREE.SphereGeometry(0.05, 8, 6), ink, 0, -0.03, 0, 1, 1.2, 0.8));
    for (let f = 0; f < 4; f++) {
      const fg = J(wrist, (f - 1.5) * 0.025, -0.06, 0.01); fg.rotation.set(0.3, 0, (f - 1.5) * 0.15);
      fg.add(M(new THREE.ConeGeometry(0.014, 0.17, 5), ink, 0, -0.085, 0, 1, 1, 1, Math.PI));
    }
    joints[n] = sh;
  });
  // legs: hip pivot on the pelvis, bent knee
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.12 * s, -0.04, 0);
    const knee = seg(hip, 0.48, 0.085, 0.06, ink, -0.25, 0.05 * s);
    const ankle = seg(knee, 0.47, 0.06, 0.045, ink, 0.35, -0.03 * s);
    ankle.add(M(new THREE.SphereGeometry(0.06, 8, 6), ink, 0, -0.02, 0.06, 1.0, 0.55, 2.0));
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
