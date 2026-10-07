// Spitter, candidate 1: primitives. Squat ellipsoid body on four stump legs, overlapping
// sheen plates on the shoulders, a big glossy sac on the back with a magenta core welling
// out of it, a horned bone skull, and a ringed mouth tube hinged at the jaw.
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
  const body = J(g, 0, 0.55, 0);
  body.add(M(new THREE.SphereGeometry(0.5, 16, 12), ink, 0, 0, -0.05, 1.05, 0.8, 1.2));
  // shoulder / flank plates
  const pl = new THREE.SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  [[0.32, 0.18, 0.2, -0.5], [-0.32, 0.18, 0.2, 0.5], [0.36, 0.12, -0.25, -0.6], [-0.36, 0.12, -0.25, 0.6], [0, 0.3, 0.32, 0]].forEach(([x, y, z, rz]) =>
    body.add(M(pl, sheen, x, y, z, 0.9, 0.5, 1.0, z > 0.3 ? -0.4 : 0, 0, rz)));
  // stump legs with bone claws
  const leg = new THREE.CylinderGeometry(0.15, 0.17, 0.42, 10);
  const claw = new THREE.ConeGeometry(0.035, 0.1, 5);
  [[0.38, 0.32], [-0.38, 0.32], [0.38, -0.38], [-0.38, -0.38]].forEach(([x, z]) => {
    body.add(M(new THREE.SphereGeometry(0.2, 10, 8), ink, x, -0.22, z));
    body.add(M(leg, ink, x * 1.05, -0.37, z));
    body.add(M(new THREE.SphereGeometry(0.18, 10, 6), ink, x * 1.05, -0.53, z + 0.03, 1.05, 0.45, 1.15));
    for (let c = -1; c <= 1; c++) body.add(M(claw, bone, x * 1.05 + c * 0.07, -0.55, z + 0.2, 1, 1, 1, Math.PI / 2));
  });
  // sac on the back: pivot at its base
  const sac = J(body, 0, 0.3, -0.18);
  sac.add(M(new THREE.SphereGeometry(0.42, 16, 12), sheen, 0, 0.32, -0.02, 1.0, 1.0, 1.05));
  sac.add(M(new THREE.SphereGeometry(0.25, 12, 9), core, 0.08, 0.36, 0.22, 1.0, 1.0, 0.6));
  sac.add(M(new THREE.SphereGeometry(0.06, 8, 6), ink, -0.2, 0.55, 0.15));
  sac.add(M(new THREE.SphereGeometry(0.05, 8, 6), ink, 0.25, 0.5, -0.2));
  // head and skull
  const skullG = J(body, 0, 0.0, 0.6);
  skullG.add(M(new THREE.SphereGeometry(0.24, 12, 9), ink, 0, 0.02, -0.05));
  skullG.add(M(new THREE.SphereGeometry(0.25, 14, 10, Math.PI / 2 - 1.1, 2.2, 0.3, 2.0), bone, 0, 0.04, 0.0, 1.0, 0.95, 1.05));
  skullG.add(M(new THREE.BoxGeometry(0.2, 0.12, 0.12), bone, 0, -0.1, 0.2));
  const horn = new THREE.ConeGeometry(0.06, 0.3, 7);
  skullG.add(M(horn, bone, 0.18, 0.2, 0.05, 1, 1, 1, -0.2, 0, -0.55));
  skullG.add(M(horn, bone, -0.18, 0.2, 0.05, 1, 1, 1, -0.2, 0, 0.55));
  const eye = new THREE.SphereGeometry(0.04, 8, 6);
  skullG.add(M(eye, core, 0.09, 0.08, 0.235, 1.2, 0.8, 0.5));
  skullG.add(M(eye, core, -0.09, 0.08, 0.235, 1.2, 0.8, 0.5));
  // mouth tube: pivot at its base
  const tube = J(skullG, 0, -0.1, 0.25);
  tube.add(M(new THREE.CylinderGeometry(0.075, 0.09, 0.42, 10, 1, true), sheen, 0, 0, 0.21, 1, 1, 1, Math.PI / 2));
  tube.add(M(new THREE.TorusGeometry(0.09, 0.03, 6, 12), sheen, 0, 0, 0.42));
  tube.add(M(new THREE.TorusGeometry(0.088, 0.018, 5, 12), ink, 0, 0, 0.18));
  tube.add(M(new THREE.CircleGeometry(0.07, 10), ink, 0, 0, 0.38));
  sheen.side = THREE.DoubleSide;
  g.userData.joints = { body, sac, tube };
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
