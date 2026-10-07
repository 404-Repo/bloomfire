// Blotling, candidate 2: profiles. Body is a lathe swept along Z (a long ink drop that
// sags at the back), legs are lathe drips that flare into puddle feet, mask is a lathe cup
// turned to face forward, shell is a low lathe dome in the sheen colour.
export default function (THREE) {
//MATS
  const V = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.Group();
  const body = J(g, 0, 0.32, 0);
  // body profile along its own axis (tail y=-0.34 to nose y=0.3), then laid along Z
  const bodyGeo = new THREE.LatheGeometry(V([[0, -0.34], [0.12, -0.3], [0.2, -0.2], [0.24, -0.06], [0.24, 0.08], [0.2, 0.2], [0.13, 0.27], [0, 0.3]]), 14);
  bodyGeo.rotateX(Math.PI / 2);
  body.add(M(bodyGeo, ink, 0, 0, 0, 1.0, 0.8, 1.0));
  // shell dome on the back
  const dome = new THREE.LatheGeometry(V([[0, 0.1], [0.08, 0.095], [0.15, 0.07], [0.2, 0.03], [0.22, 0.0]]), 12);
  body.add(M(dome, sheen, 0, 0.13, -0.06, 0.95, 1.0, 1.25));
  // head
  body.add(M(new THREE.SphereGeometry(0.14, 12, 9), ink, 0, 0.02, 0.25));
  // mask: a lathe cup, apex forward
  const cup = new THREE.LatheGeometry(V([[0, 0], [0.06, -0.008], [0.11, -0.03], [0.15, -0.07], [0.165, -0.12]]), 14);
  cup.rotateX(Math.PI / 2);
  body.add(M(cup, bone, 0, 0.03, 0.4, 0.95, 1.05, 1));
  const eye = new THREE.SphereGeometry(0.03, 8, 6);
  body.add(M(eye, core, 0.055, 0.04, 0.395, 1.2, 0.8, 0.5));
  body.add(M(eye, core, -0.055, 0.04, 0.395, 1.2, 0.8, 0.5));
  // drips from the belly
  const dripGeo = new THREE.LatheGeometry(V([[0, 0.06], [0.03, 0.03], [0.025, -0.03], [0.035, -0.07], [0, -0.1]]), 7);
  [[0.15, -0.16, 0.08], [-0.12, -0.17, -0.12], [0.02, -0.19, -0.02]].forEach(([x, y, z]) => body.add(M(dripGeo, ink, x, y, z)));
  // legs: lathe drip with a puddle foot
  const legGeo = new THREE.LatheGeometry(V([[0, 0.04], [0.07, 0.02], [0.06, -0.08], [0.045, -0.17], [0.05, -0.22], [0.09, -0.25], [0.1, -0.265], [0, -0.27]]), 9);
  const joints = { body };
  [['legFL', 0.17, 0.19], ['legFR', -0.17, 0.19], ['legBL', 0.17, -0.2], ['legBR', -0.17, -0.2]].forEach(([n, x, z]) => {
    const hip = J(body, x, -0.05, z);
    hip.add(M(legGeo, ink, 0, 0, 0, 1, 1, 1.1, 0, 0, x > 0 ? 0.12 : -0.12));
    joints[n] = hip;
  });
  g.userData.joints = joints;
//PLACE
