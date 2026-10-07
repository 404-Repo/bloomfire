// Quill, candidate 1: primitives. Ellipsoid ink body leaning forward, bone skull with a
// curved cone beak and two small horns, magenta core in the chest, wings built from a
// two-segment ink arm with a fan of flattened cone quills, tail fan, dangling talons.
export default function (THREE) {
//MATS
  const g = new THREE.Group();
  const body = J(g, 0, 0.32, 0);
  body.add(M(new THREE.SphereGeometry(0.12, 12, 9), ink, 0, 0, 0, 0.95, 1.05, 1.5, -0.35));
  body.add(M(new THREE.SphereGeometry(0.06, 10, 8), core, 0, -0.01, 0.12, 1, 1, 0.6));
  // head + skull
  const head = J(body, 0, 0.09, 0.17);
  head.add(M(new THREE.SphereGeometry(0.075, 10, 8), ink));
  head.add(M(new THREE.SphereGeometry(0.08, 12, 9, Math.PI / 2 - 1.2, 2.4, 0.2, 2.0), bone, 0, 0.01, 0.01, 1, 1, 1.15));
  head.add(M(new THREE.ConeGeometry(0.035, 0.2, 8), bone, 0, -0.04, 0.16, 1, 1, 0.8, Math.PI / 2 + 0.45));
  head.add(M(new THREE.ConeGeometry(0.018, 0.09, 6), bone, 0.045, 0.08, -0.02, 1, 1, 1, -0.5, 0, -0.4));
  head.add(M(new THREE.ConeGeometry(0.018, 0.09, 6), bone, -0.045, 0.08, -0.02, 1, 1, 1, -0.5, 0, 0.4));
  head.add(M(new THREE.SphereGeometry(0.016, 6, 5), core, 0.035, 0.02, 0.083, 1.2, 0.8, 0.5));
  head.add(M(new THREE.SphereGeometry(0.016, 6, 5), core, -0.035, 0.02, 0.083, 1.2, 0.8, 0.5));
  // tail fan
  const tailF = new THREE.ConeGeometry(0.03, 0.26, 5);
  for (let i = -2; i <= 2; i++) body.add(M(tailF, i % 2 ? sheen : ink, i * 0.03, -0.06, -0.26, 1, 1, 0.3, -Math.PI / 2 + 0.5, 0, i * 0.18));
  // legs with talons
  [1, -1].forEach((s) => {
    body.add(M(new THREE.CylinderGeometry(0.018, 0.014, 0.2, 6), ink, 0.04 * s, -0.19, 0.0, 1, 1, 1, 0.2));
    for (let c = -1; c <= 1; c++) body.add(M(new THREE.ConeGeometry(0.008, 0.06, 4), bone, 0.04 * s + c * 0.015, -0.3, 0.03, 1, 1, 1, Math.PI - 0.6));
  });
  // wings: pivot at the shoulder; tip along +x (left) or -x (right); flap about local Z
  const joints = { body };
  const quill = new THREE.ConeGeometry(0.035, 1, 5);
  [['wingL', 1], ['wingR', -1]].forEach(([n, s]) => {
    const w = J(body, 0.08 * s, 0.06, 0.04);
    w.add(M(new THREE.CapsuleGeometry(0.03, 0.2, 2, 6), ink, 0.12 * s, 0.02, 0, 1, 1, 1, 0, 0, Math.PI / 2 - 0.15 * s));
    w.add(M(new THREE.CapsuleGeometry(0.022, 0.2, 2, 6), ink, 0.32 * s, 0.06, -0.02, 1, 1, 1, 0, 0, Math.PI / 2 + 0.2 * s));
    for (let i = 0; i < 7; i++) {
      const t = i / 6, L = 0.24 + 0.14 * t;
      const x = (0.08 + 0.36 * t) * s, z = -0.04 - 0.02 * t;
      const f = M(quill, i % 2 ? sheen : ink, x, 0.04 + 0.04 * t, z, 1, L, 0.25);
      f.rotation.set(-Math.PI / 2 + 0.15, 0, s * (0.1 + 0.9 * t)); f.translateY(L / 2); w.add(f);
    }
    joints[n] = w;
  });
  g.userData.joints = joints;
//PLACE
