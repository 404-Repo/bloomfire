// Old Inkhorn, candidate 2: sweeps. Torso is a lathe hunched forward, every limb is a single
// tapered tube swept along a bent curve (shoulder to wrist, hip to ankle) so the arms hang long
// and heavy, ribs are swept bone tubes curving from spine to sternum around the core joint,
// horns are tapered sweeps, armour is lathe-shell pauldrons and bracer rings.
export default function (THREE) {
//MATS
  const V2 = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const V3 = (a) => a.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const tube = (pts, radii, segs = 16, rad = 10) => {
    const curve = new THREE.CatmullRomCurve3(V3(pts)), geo = new THREE.TubeGeometry(curve, segs, 1, rad, false);
    const p = geo.attributes.position, c = new THREE.Vector3(), q = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      const t = i / segs; curve.getPointAt(t, c);
      const f = t * (radii.length - 1), k = Math.min(radii.length - 2, Math.floor(f)), r = radii[k] + (radii[k + 1] - radii[k]) * (f - k);
      for (let j = 0; j <= rad; j++) { const idx = i * (rad + 1) + j; q.fromBufferAttribute(p, idx).sub(c).multiplyScalar(r).add(c); p.setXYZ(idx, q.x, q.y, q.z); }
    }
    geo.computeVertexNormals(); return geo;
  };
  const g = new THREE.Group();
  const rig = J(g, 0, 0, 0); rig.scale.setScalar(4.15);
  const body = J(rig, 0, 1.2, 0);
  const torso = J(body, 0, 0, 0); torso.rotation.x = 0.42;
  torso.add(M(new THREE.LatheGeometry(V2([[0, -0.3], [0.38, -0.25], [0.46, 0.0], [0.44, 0.3], [0.58, 0.6], [0.72, 0.9], [0.72, 1.15], [0.55, 1.35], [0.28, 1.45], [0, 1.47]]), 18), ink, 0, 0, 0, 1.15, 1, 0.82));
  torso.add(M(new THREE.SphereGeometry(0.45, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), sheen, 0, 0.95, -0.35, 1.5, 1.0, 0.75, -0.5));
  const coreJ = J(torso, 0, 0.82, 0.52);
  coreJ.add(M(new THREE.SphereGeometry(0.3, 16, 12), core, 0, 0, 0, 1, 1.1, 0.7));
  for (let i = 0; i < 5; i++) [1, -1].forEach((s) => {
    const y = 1.1 - i * 0.14, w = 0.62 - i * 0.04;
    torso.add(M(tube([[0.5 * s, y + 0.05, -0.15], [w * s, y, 0.25], [0.4 * s, y - 0.06, 0.6], [0.22 * s, y - 0.1, 0.68]], [0.045, 0.05, 0.045, 0.035], 8, 6), bone));
  });
  const head = J(torso, 0, 1.4, 0.42); head.rotation.x = -0.42;
  head.add(M(new THREE.SphereGeometry(0.26, 14, 10), ink, 0, 0.08, -0.12));
  const cup = new THREE.LatheGeometry(V2([[0, 0], [0.12, -0.02], [0.21, -0.08], [0.26, -0.18], [0.27, -0.3]]), 16); cup.rotateX(Math.PI / 2);
  head.add(M(cup, bone, 0, 0.13, 0.25, 1, 1.1, 1));
  head.add(M(new THREE.BoxGeometry(0.3, 0.12, 0.2), bone, 0, -0.08, 0.14));
  [1, -1].forEach((s) => {
    head.add(M(tube([[0.16 * s, 0.24, -0.04], [0.42 * s, 0.3, -0.1], [0.62 * s, 0.55, -0.1], [0.6 * s, 0.86, 0.02], [0.5 * s, 1.02, 0.14]], [0.1, 0.085, 0.06, 0.035, 0.004], 16, 8), bone));
    for (let f = 0; f < 2; f++) head.add(M(new THREE.ConeGeometry(0.03, 0.16, 6), bone, (0.05 + f * 0.07) * s, -0.16, 0.22, 1, 1, 1, Math.PI));
    head.add(M(new THREE.SphereGeometry(0.05, 8, 6), core, 0.09 * s, 0.13, 0.25, 1.2, 0.8, 0.5));
  });
  const joints = { body, head, core: coreJ };
  const shell = new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  [['armL', 1], ['armR', -1]].forEach(([n, s]) => {
    const sh = J(torso, 0.84 * s, 1.1, 0); sh.rotation.x = -0.42;
    sh.add(M(shell, sheen, 0.1 * s, 0.05, 0, 1.0, 0.8, 1.0, 0, 0, -0.45 * s));
    sh.add(M(tube([[0, 0.05, 0], [0.12 * s, -0.4, 0.05], [0.16 * s, -0.8, 0.12], [0.18 * s, -1.2, 0.3], [0.18 * s, -1.5, 0.42]], [0.33, 0.26, 0.22, 0.29, 0.25], 18, 12), ink));
    sh.add(M(new THREE.CylinderGeometry(0.32, 0.33, 0.42, 12, 1, true), sheen, 0.17 * s, -1.1, 0.26, 1, 1, 1, -0.35));
    sh.add(M(new THREE.TorusGeometry(0.32, 0.04, 5, 14), sheen, 0.17 * s, -1.33, 0.34, 1, 1, 1, Math.PI / 2 - 0.35));
    sh.add(M(new THREE.SphereGeometry(0.27, 12, 9), ink, 0.18 * s, -1.56, 0.45));
    for (let c = 0; c < 4; c++) {
      const x = 0.18 * s + (c - 1.5) * 0.13;
      sh.add(M(tube([[x, -1.62, 0.52], [x + (c - 1.5) * 0.04, -1.85, 0.6], [x + (c - 1.5) * 0.06, -2.05, 0.5]], [0.06, 0.04, 0.003], 8, 6), bone));
    }
    joints[n] = sh;
  });
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.36 * s, -0.02, -0.04);
    hip.add(M(tube([[0, 0.05, 0], [0.06 * s, -0.35, 0.12], [0.08 * s, -0.66, 0.16], [0.08 * s, -0.95, 0.02], [0.08 * s, -1.12, 0.02]], [0.34, 0.3, 0.25, 0.27, 0.3], 16, 12), ink));
    hip.add(M(new THREE.SphereGeometry(0.34, 12, 8), ink, 0.08 * s, -1.12, 0.12, 1, 0.45, 1.3));
    for (let c = -1; c <= 1; c++) hip.add(M(new THREE.ConeGeometry(0.06, 0.22, 6), bone, 0.08 * s + c * 0.15, -1.14, 0.53, 1, 1, 1, Math.PI / 2));
    joints[n] = hip;
  });
  sheen.side = THREE.DoubleSide;
  g.userData.joints = joints;
//PLACE
