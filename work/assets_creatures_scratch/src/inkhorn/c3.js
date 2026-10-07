// Inkhorn, candidate 3: hand-built, different reading. A hunched gorilla stance: shoulders
// thrust forward, knuckles near the ground, head sunk below the shoulder line. The armour is
// chunky faceted slabs (low-detail icosahedra and dodecahedra squashed into plates) so it reads
// as heavy stone-like plate against the glossy ink; horns are swept tubes tapered by hand.
export default function (THREE) {
//MATS
  const g = new THREE.Group();
  const slab = (r, sx, sy, sz) => { const geo = new THREE.DodecahedronGeometry(r, 0); geo.scale(sx, sy, sz); return geo; };
  const hornGeo = (s) => {
    const c = new THREE.CatmullRomCurve3([[0, 0, 0], [0.22 * s, 0.1, -0.05], [0.38 * s, 0.32, -0.05], [0.36 * s, 0.55, 0.08]].map((p) => new THREE.Vector3(...p)));
    const geo = new THREE.TubeGeometry(c, 10, 0.08, 7, false), p = geo.attributes.position, q = new THREE.Vector3();
    for (let i = 0; i <= 10; i++) { const k = 1 - i / 10.5, ctr = c.getPointAt(i / 10); for (let j = 0; j <= 7; j++) { const idx = i * 8 + j; q.fromBufferAttribute(p, idx).sub(ctr).multiplyScalar(k).add(ctr); p.setXYZ(idx, q.x, q.y, q.z); } }
    geo.computeVertexNormals(); return geo;
  };
  const body = J(g, 0, 1.15, 0);
  const torso = J(body, 0, 0, 0); torso.rotation.x = 0.35;
  torso.add(M(new THREE.SphereGeometry(0.42, 12, 9), ink, 0, 0.0, 0, 1.15, 0.85, 0.85));
  torso.add(M(new THREE.SphereGeometry(0.66, 14, 10), ink, 0, 0.8, 0, 1.2, 0.95, 0.85));
  torso.add(M(slab(0.38, 1.4, 1.0, 0.4), sheen, 0, 1.0, 0.42, 1, 1, 1, -0.1));
  torso.add(M(slab(0.3, 1.5, 0.6, 0.4), sheen, 0, 0.5, 0.42));
  torso.add(M(slab(0.45, 1.5, 1.2, 0.35), sheen, 0, 1.0, -0.45));
  torso.add(M(new THREE.SphereGeometry(0.17, 12, 9), core, 0, 0.82, 0.55, 1, 1.1, 0.55));
  const head = J(torso, 0, 1.32, 0.38); head.rotation.x = -0.35;
  head.add(M(new THREE.SphereGeometry(0.25, 12, 9), ink, 0, 0.08, -0.1));
  head.add(M(new THREE.SphereGeometry(0.25, 14, 10, Math.PI / 2 - 1.2, 2.4, 0.15, 2.0), bone, 0, 0.12, 0.0, 1, 1.05, 1.1));
  head.add(M(slab(0.12, 1.3, 0.6, 0.8), bone, 0, -0.07, 0.15));
  [1, -1].forEach((s) => {
    head.add(M(hornGeo(s), bone, 0.17 * s, 0.25, -0.02));
    head.add(M(new THREE.ConeGeometry(0.035, 0.18, 6), bone, 0.1 * s, -0.15, 0.22, 1, 1, 1, Math.PI));
    head.add(M(new THREE.SphereGeometry(0.045, 8, 6), core, 0.09 * s, 0.13, 0.26, 1.2, 0.8, 0.5));
  });
  const joints = { body, head };
  [['armL', 1], ['armR', -1]].forEach(([n, s]) => {
    const sh = J(torso, 0.82 * s, 1.08, 0.05); sh.rotation.x = -0.35;
    sh.add(M(slab(0.45, 1.1, 0.7, 1.1), sheen, 0.08 * s, 0.15, 0, 1, 1, 1, 0, 0, -0.35 * s));
    sh.add(M(new THREE.SphereGeometry(0.3, 10, 8), ink));
    sh.add(M(new THREE.CylinderGeometry(0.25, 0.2, 0.62, 10), ink, 0.08 * s, -0.4, 0.08, 1, 1, 1, -0.15));
    sh.add(M(new THREE.CylinderGeometry(0.29, 0.25, 0.6, 10), ink, 0.1 * s, -0.98, 0.2, 1, 1, 1, -0.2));
    sh.add(M(slab(0.3, 1.1, 1.0, 1.1), sheen, 0.1 * s, -0.95, 0.2));
    sh.add(M(slab(0.3, 1.0, 0.85, 1.0), ink, 0.1 * s, -1.38, 0.3));
    for (let c = -1; c <= 1; c++) sh.add(M(new THREE.ConeGeometry(0.045, 0.16, 6), bone, 0.1 * s + c * 0.12, -1.55, 0.44, 1, 1, 1, Math.PI - 0.6));
    joints[n] = sh;
  });
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.33 * s, -0.02, -0.02);
    hip.add(M(new THREE.CylinderGeometry(0.28, 0.22, 0.6, 10), ink, 0.05 * s, -0.32, 0.05, 1, 1, 1, -0.1));
    hip.add(M(slab(0.2, 1.0, 1.0, 0.6), sheen, 0.06 * s, -0.62, 0.18));
    hip.add(M(new THREE.CylinderGeometry(0.21, 0.26, 0.48, 10), ink, 0.06 * s, -0.86, 0.02));
    hip.add(M(new THREE.SphereGeometry(0.3, 10, 6), ink, 0.06 * s, -1.08, 0.1, 1, 0.45, 1.3));
    for (let c = -1; c <= 1; c++) hip.add(M(new THREE.ConeGeometry(0.05, 0.18, 6), bone, 0.06 * s + c * 0.13, -1.1, 0.46, 1, 1, 1, Math.PI / 2));
    joints[n] = hip;
  });
  g.userData.joints = joints;
//PLACE
