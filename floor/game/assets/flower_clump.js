// Flower clump, about 0.35 m: grass blades with lavender and madder heads.
export default function (THREE) {
  const g = new THREE.Group();
  const grass = new THREE.MeshStandardMaterial({ color: 0x8a9a48, roughness: 0.9 }); grass.name = 'foliage';
  const lav = new THREE.MeshStandardMaterial({ color: 0x8c7bbf, roughness: 0.8 });
  const red = new THREE.MeshStandardMaterial({ color: 0xa8382e, roughness: 0.8 });
  for (let i = 0; i < 7; i++) {
    const a = i * 2.39, r = 0.06 + (i % 3) * 0.05;
    const b = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.3, 3), grass); b.position.set(Math.cos(a) * r, 0.15, Math.sin(a) * r); b.rotation.z = Math.cos(a) * 0.3; g.add(b);
    const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? lav : red); h.position.set(Math.cos(a) * r * 1.4, 0.3 + (i % 2) * 0.04, Math.sin(a) * r * 1.4); g.add(h);
  }
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
