// Inkhorn, candidate 2: profiles. Torso and limbs are lathes (a deep barrel chest tapering
// to the waist, thick tapered limbs), armour plates are bevelled extrusions of plate
// outlines (bevel accounted for), the skull is a lathe cup with extruded tusks and lathe horns
// swept outward, fists are lathe mitts.
export default function (THREE) {
//MATS
  const V = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const plate = (pts, depth) => {
    const s = new THREE.Shape(); s.moveTo(...pts[0]); pts.slice(1).forEach((p) => s.lineTo(...p));
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 });
    geo.translate(0, 0, -depth / 2); return geo;
  };
  const g = new THREE.Group();
  const body = J(g, 0, 1.1, 0);
  const torso = new THREE.LatheGeometry(V([[0, -0.15], [0.4, -0.1], [0.46, 0.15], [0.42, 0.45], [0.6, 0.8], [0.72, 1.05], [0.66, 1.3], [0.42, 1.45], [0.2, 1.5], [0, 1.5]]), 14);
  body.add(M(torso, ink, 0, 0, 0, 1.12, 1, 0.75));
  // chest plates (pectoral pair), abdomen plates, back plate
  const pec = plate([[-0.38, -0.2], [0.34, -0.26], [0.38, 0.2], [-0.3, 0.26]], 0.08);
  body.add(M(pec, sheen, 0.33, 1.08, 0.48, 1, 1, 1, -0.2, 0.25, 0.05));
  body.add(M(pec, sheen, -0.33, 1.08, 0.48, -1, 1, 1, -0.2, -0.25, -0.05));
  const ab = plate([[-0.3, -0.12], [0.3, -0.12], [0.26, 0.12], [-0.26, 0.12]], 0.06);
  body.add(M(ab, sheen, 0, 0.55, 0.34, 1, 1, 1, 0.05));
  body.add(M(ab, sheen, 0, 0.3, 0.34, 0.9, 1, 1, 0.1));
  body.add(M(plate([[-0.5, -0.35], [0.5, -0.35], [0.55, 0.3], [-0.55, 0.3]], 0.08), sheen, 0, 1.0, -0.47, 1, 1, 1, 0.12));
  body.add(M(new THREE.SphereGeometry(0.17, 12, 9), core, 0, 0.82, 0.37, 1, 1.1, 0.6));
  const head = J(body, 0, 1.45, 0.16);
  head.add(M(new THREE.SphereGeometry(0.25, 12, 9), ink, 0, 0.12, -0.1));
  const cup = new THREE.LatheGeometry(V([[0, 0], [0.12, -0.02], [0.21, -0.08], [0.26, -0.18], [0.27, -0.3]]), 14);
  cup.rotateX(Math.PI / 2);
  head.add(M(cup, bone, 0, 0.15, 0.24, 1, 1.0, 1));
  head.add(M(plate([[-0.14, 0], [0.14, 0], [0.11, -0.12], [-0.11, -0.12]], 0.1), bone, 0, -0.02, 0.15));
  const hornGeo = new THREE.LatheGeometry(V([[0.08, 0], [0.07, 0.12], [0.055, 0.24], [0.035, 0.36], [0.012, 0.46], [0, 0.5]]), 8);
  [1, -1].forEach((s) => {
    const h1 = M(hornGeo, bone, 0.17 * s, 0.25, -0.04, 1, 1, 1, 0, 0, -1.1 * s); head.add(h1);
    const h2 = M(hornGeo, bone, 0.55 * s, 0.4, -0.04, 0.75, 0.75, 0.75, 0, 0, -0.1 * s); head.add(h2);
    head.add(M(new THREE.ConeGeometry(0.035, 0.18, 6), bone, 0.09 * s, -0.12, 0.22, 1, 1, 1, Math.PI));
    head.add(M(new THREE.SphereGeometry(0.045, 8, 6), core, 0.09 * s, 0.17, 0.235, 1.2, 0.8, 0.5));
  });
  const joints = { body, head };
  const armGeo = new THREE.LatheGeometry(V([[0.28, 0.05], [0.25, -0.2], [0.21, -0.55], [0.23, -0.72], [0.28, -0.9], [0.27, -1.15], [0.24, -1.22]]), 10);
  const mitt = new THREE.LatheGeometry(V([[0, 0.05], [0.25, 0.02], [0.3, -0.15], [0.3, -0.3], [0.22, -0.42], [0, -0.45]]), 10);
  const pauld = plate([[-0.42, -0.25], [0.42, -0.25], [0.36, 0.2], [0, 0.32], [-0.36, 0.2]], 0.1);
  [['armL', 1], ['armR', -1]].forEach(([n, s]) => {
    const sh = J(body, 0.8 * s, 1.18, 0);
    sh.add(M(new THREE.SphereGeometry(0.3, 10, 8), ink));
    sh.add(M(pauld, sheen, 0.12 * s, 0.12, 0, 1, 1, 1.05, Math.PI / 2 - 0.2, 0, -0.45 * s));
    sh.add(M(pauld, sheen, 0.3 * s, -0.12, 0, 0.6, 0.8, 1, 0, Math.PI / 2, 0));
    sh.add(M(armGeo, ink, 0.08 * s, 0, 0.04));
    sh.add(M(new THREE.CylinderGeometry(0.31, 0.31, 0.32, 10, 1, true), sheen, 0.08 * s, -0.95, 0.04));
    sh.add(M(mitt, ink, 0.1 * s, -1.2, 0.06, 1, 1, 1.1));
    sh.add(M(new THREE.BoxGeometry(0.5, 0.12, 0.2), sheen, 0.1 * s, -1.36, 0.28));
    joints[n] = sh;
  });
  const legGeo = new THREE.LatheGeometry(V([[0.28, 0.05], [0.26, -0.25], [0.21, -0.6], [0.22, -0.82], [0.26, -0.95], [0.32, -1.02], [0.33, -1.07], [0, -1.1]]), 10);
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.3 * s, 0, 0);
    hip.add(M(legGeo, ink, 0.04 * s, 0, 0, 1, 1, 1.15));
    hip.add(M(plate([[-0.18, -0.18], [0.18, -0.18], [0.14, 0.2], [-0.14, 0.2]], 0.06), sheen, 0.04 * s, -0.55, 0.22, 1, 1, 1, -0.1));
    for (let c = -1; c <= 1; c++) hip.add(M(new THREE.ConeGeometry(0.05, 0.18, 6), bone, 0.04 * s + c * 0.13, -1.03, 0.42, 1, 1, 1, Math.PI / 2));
    joints[n] = hip;
  });
  sheen.side = THREE.DoubleSide;
  g.userData.joints = joints;
//PLACE
