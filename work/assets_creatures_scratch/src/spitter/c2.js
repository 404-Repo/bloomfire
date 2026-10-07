// Spitter, candidate 2: profiles. Body is a lathe laid along Z with a hunched shoulder hump,
// the sac is a lathe bulb with a puckered neck, the mouth tube is a lathe with a flared,
// rimmed muzzle; legs are lathe pillars with puddle feet; a horned skull caps the front.
export default function (THREE) {
//MATS
  const V = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.Group();
  const body = J(g, 0, 0.55, 0);
  const torso = new THREE.LatheGeometry(V([[0, -0.62], [0.25, -0.58], [0.42, -0.42], [0.5, -0.15], [0.52, 0.1], [0.47, 0.35], [0.33, 0.52], [0, 0.58]]), 16);
  torso.rotateX(Math.PI / 2);
  body.add(M(torso, ink, 0, 0, -0.05, 1.05, 0.82, 1));
  // plates: a lathe saddle draped over the shoulders
  const saddle = new THREE.LatheGeometry(V([[0.0, 0.2], [0.25, 0.17], [0.42, 0.06], [0.47, -0.05]]), 14);
  body.add(M(saddle, sheen, 0, 0.2, 0.22, 1.05, 1, 0.8));
  body.add(M(saddle, sheen, 0, 0.14, -0.3, 1.0, 0.9, 0.75));
  const legGeo = new THREE.LatheGeometry(V([[0, 0.12], [0.19, 0.08], [0.16, -0.15], [0.15, -0.36], [0.2, -0.47], [0.22, -0.52], [0, -0.55]]), 10);
  const claw = new THREE.ConeGeometry(0.035, 0.1, 5);
  [[0.38, 0.3], [-0.38, 0.3], [0.38, -0.38], [-0.38, -0.38]].forEach(([x, z]) => {
    body.add(M(legGeo, ink, x, -0.0, z));
    for (let c = -1; c <= 1; c++) body.add(M(claw, bone, x + c * 0.08, -0.52, z + 0.21, 1, 1, 1, Math.PI / 2));
  });
  const sac = J(body, 0, 0.3, -0.18);
  const bulb = new THREE.LatheGeometry(V([[0.18, 0.0], [0.3, 0.06], [0.42, 0.22], [0.45, 0.4], [0.4, 0.58], [0.26, 0.72], [0.1, 0.78], [0.05, 0.82], [0, 0.82]]), 16);
  sac.add(M(bulb, sheen));
  // the core wells out through the sac skin: a big bulge at the front, smaller ones behind
  sac.add(M(new THREE.SphereGeometry(0.24, 12, 9), core, 0.04, 0.4, 0.33, 1.0, 1.1, 0.6));
  sac.add(M(new THREE.SphereGeometry(0.13, 10, 8), core, 0.26, 0.52, -0.24, 0.9, 1.0, 0.7, 0, 0.9, 0));
  sac.add(M(new THREE.SphereGeometry(0.1, 8, 6), core, -0.3, 0.3, -0.22, 0.8, 1.0, 0.7, 0, -0.9, 0));
  const dot = new THREE.SphereGeometry(0.045, 8, 6);
  [[-0.22, 0.62, 0.18], [0.18, 0.7, 0.05], [-0.05, 0.66, -0.3], [0.36, 0.3, 0.1]].forEach(([x, y, z]) => sac.add(M(dot, ink, x, y, z)));
  const skullG = J(body, 0, 0.02, 0.58);
  skullG.add(M(new THREE.SphereGeometry(0.24, 12, 9), ink, 0, 0, -0.06));
  const skull = new THREE.LatheGeometry(V([[0, 0], [0.1, -0.02], [0.18, -0.07], [0.23, -0.14], [0.25, -0.24]]), 14);
  skull.rotateX(Math.PI / 2);
  skullG.add(M(skull, bone, 0, 0.03, 0.22, 1, 0.95, 1));
  const hornGeo = new THREE.LatheGeometry(V([[0.065, 0], [0.055, 0.1], [0.04, 0.2], [0.02, 0.28], [0, 0.32]]), 7);
  skullG.add(M(hornGeo, bone, 0.17, 0.15, 0.05, 1, 1, 1, -0.25, 0, -0.6));
  skullG.add(M(hornGeo, bone, -0.17, 0.15, 0.05, 1, 1, 1, -0.25, 0, 0.6));
  skullG.add(M(new THREE.SphereGeometry(0.04, 8, 6), core, 0.09, 0.08, 0.21, 1.2, 0.8, 0.5));
  skullG.add(M(new THREE.SphereGeometry(0.04, 8, 6), core, -0.09, 0.08, 0.21, 1.2, 0.8, 0.5));
  const tube = J(skullG, 0, -0.1, 0.2);
  const tubeGeo = new THREE.LatheGeometry(V([[0.1, 0], [0.085, 0.08], [0.075, 0.2], [0.08, 0.3], [0.1, 0.38], [0.12, 0.42], [0.11, 0.46], [0.07, 0.45], [0.06, 0.4]]), 12);
  tubeGeo.rotateX(Math.PI / 2);
  tube.add(M(tubeGeo, sheen));
  sheen.side = THREE.DoubleSide;
  g.userData.joints = { body, sac, tube };
//PLACE
