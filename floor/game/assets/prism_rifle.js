// Prism rifle, about 0.85 m long, barrel along -Z (it is held, the muzzle points away from the
// viewer), walnut stock, brass fittings, a glowing sunlight prism in the receiver.
export default function (THREE) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a5534, roughness: 0.6 }); wood.name = 'timber';
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.35, metalness: 0.85 }); brass.name = 'metal';
  const iron = new THREE.MeshStandardMaterial({ color: 0x3c3a38, roughness: 0.45, metalness: 0.7 }); iron.name = 'metal';
  const sun = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffd27a, emissiveIntensity: 2.5, roughness: 0.2 });
  const add = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); g.add(o); return o; };
  add(new THREE.BoxGeometry(0.07, 0.12, 0.3), wood, 0, 0.08, 0.28);
  add(new THREE.BoxGeometry(0.06, 0.08, 0.12), wood, 0, -0.02, 0.12).rotation.x = 0.4;
  add(new THREE.BoxGeometry(0.09, 0.1, 0.24), brass, 0, 0.12, 0.0);
  add(new THREE.OctahedronGeometry(0.06, 0), sun, 0, 0.21, 0.0).scale.set(1, 1.3, 1.6);
  const bar = add(new THREE.CylinderGeometry(0.022, 0.026, 0.45, 8), iron, 0, 0.13, -0.33); bar.rotation.x = Math.PI / 2;
  for (const z of [-0.2, -0.38, -0.55]) { const r = add(new THREE.TorusGeometry(0.035, 0.01, 5, 10), brass, 0, 0.13, z); }
  add(new THREE.BoxGeometry(0.05, 0.06, 0.22), wood, 0, 0.07, -0.22);
  add(new THREE.CylinderGeometry(0.03, 0.045, 0.06, 8), sun, 0, 0.13, -0.58).rotation.x = Math.PI / 2;
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
