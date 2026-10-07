// Smear, 2.0 m: a hunched shambling ink husk, long arms, bone mask, magenta chest core.
export default function (THREE) {
  const g = new THREE.Group();
  const ink = new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.25 });
  const sheen = new THREE.MeshStandardMaterial({ color: 0x2b2a45, roughness: 0.3 });
  const bone = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.7 });
  const core = new THREE.MeshStandardMaterial({ color: 0xff3d8b, emissive: 0xff3d8b, emissiveIntensity: 2.5 });
  const add = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); g.add(o); return o; };
  for (const s of [-1, 1]) add(new THREE.CapsuleGeometry(0.13, 0.7, 3, 6), ink, s * 0.22, 0.45, 0);
  const torso = add(new THREE.CapsuleGeometry(0.42, 0.6, 4, 8), ink, 0, 1.25, 0.1); torso.rotation.x = 0.35;
  add(new THREE.SphereGeometry(0.36, 8, 6), sheen, 0, 1.55, -0.15).scale.set(1.3, 0.8, 1);
  add(new THREE.SphereGeometry(0.16, 10, 8), core, 0, 1.25, 0.5);
  for (const s of [-1, 1]) { const arm = add(new THREE.CapsuleGeometry(0.1, 0.9, 3, 6), ink, s * 0.55, 1.05, 0.3); arm.rotation.set(0.5, 0, s * 0.2);
    for (let k = -1; k <= 1; k++) add(new THREE.ConeGeometry(0.03, 0.18, 4), bone, s * 0.62 + k * 0.05, 0.55, 0.62).rotation.x = Math.PI * 0.8; }
  add(new THREE.SphereGeometry(0.22, 8, 6), ink, 0, 1.75, 0.38);
  const mask = add(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), bone, 0, 1.78, 0.5); mask.rotation.x = Math.PI / 2; mask.scale.set(1, 1.3, 0.6);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.04, 6, 5), core, s * 0.07, 1.82, 0.62);
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
