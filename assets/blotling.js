// Blotling, candidate 1: primitives. Ellipsoid ink body, sheen shell plates on the back,
// a bone mask as a partial sphere shell on the front, magenta eyes, four tapered legs with
// puddle feet hanging from hip pivots.
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
  const body = J(g, 0, 0.3, 0);
  body.add(M(new THREE.SphereGeometry(0.25, 14, 10), ink, 0, 0.02, -0.02, 0.95, 0.78, 1.25));
  // back plates (the shell in the reference)
  const plate = new THREE.SphereGeometry(0.14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  body.add(M(plate, sheen, 0, 0.17, -0.05, 1.3, 0.55, 1.4));
  body.add(M(plate, sheen, 0.1, 0.13, -0.2, 0.9, 0.5, 0.9, 0.3, 0, -0.4));
  body.add(M(plate, sheen, -0.1, 0.13, -0.2, 0.9, 0.5, 0.9, 0.3, 0, 0.4));
  body.add(M(plate, sheen, 0, 0.12, 0.12, 1.0, 0.45, 0.8, -0.3));
  // head lump and bone mask
  const head = new THREE.SphereGeometry(0.15, 12, 9);
  body.add(M(head, ink, 0, 0.0, 0.26, 1.0, 0.95, 1.0));
  const mask = new THREE.SphereGeometry(0.165, 14, 10, Math.PI / 2 - 1.15, 2.3, 0.35, 1.9);
  body.add(M(mask, bone, 0, 0.0, 0.28, 1.0, 1.0, 1.05));
  // jaw ridge under the mask
  body.add(M(new THREE.SphereGeometry(0.07, 8, 6), bone, 0, -0.11, 0.36, 1.2, 0.5, 0.8));
  const eye = new THREE.SphereGeometry(0.032, 8, 6);
  body.add(M(eye, core, 0.06, 0.02, 0.425, 1.1, 0.8, 0.6));
  body.add(M(eye, core, -0.06, 0.02, 0.425, 1.1, 0.8, 0.6));
  // drips hanging off the belly and flanks
  const drip = new THREE.ConeGeometry(0.03, 0.12, 6);
  [[0.2, -0.12, 0.05], [-0.21, -0.1, -0.08], [0.05, -0.18, -0.15], [-0.08, -0.17, 0.12]].forEach(([x, y, z]) =>
    body.add(M(drip, ink, x, y, z, 1, 1, 1, Math.PI)));
  // legs: pivot at the hip, geometry hanging below
  const legGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.24, 8);
  const foot = new THREE.SphereGeometry(0.075, 10, 6);
  const joints = { body };
  [['legFL', 0.16, 0.2], ['legFR', -0.16, 0.2], ['legBL', 0.16, -0.22], ['legBR', -0.16, -0.22]].forEach(([n, x, z]) => {
    const hip = J(body, x, -0.08, z);
    hip.add(M(new THREE.SphereGeometry(0.085, 8, 6), ink, 0, 0, 0));
    hip.add(M(legGeo, ink, x > 0 ? 0.02 : -0.02, -0.13, 0, 1, 1, 1, 0, 0, x > 0 ? 0.35 : -0.35));
    hip.add(M(foot, ink, x > 0 ? 0.085 : -0.085, -0.225, 0.02, 1.2, 0.45, 1.35));
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
