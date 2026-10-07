// Cypress, 10 m. Tall dark flame-shaped column on a short trunk.
export default function (THREE) {
  const g = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.95 }); bark.name = 'timber';
  const leaf = new THREE.MeshStandardMaterial({ color: 0x2f4a2a, roughness: 0.9, flatShading: true }); leaf.name = 'foliage';
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.2, 6), bark); t.position.y = 0.6; g.add(t);
  const pts = [];
  for (let i = 0; i <= 10; i++) { const y = i / 10; pts.push(new THREE.Vector2(Math.max(0.02, 1.05 * Math.sin(Math.PI * Math.pow(y, 0.62)) * (1 - 0.15 * y)), y * 9.2)); }
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 9), leaf); body.position.y = 0.8; g.add(body);
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), leaf);
    const a = i * 2.4; s.position.set(Math.cos(a) * 0.75, 2 + i * 1.3, Math.sin(a) * 0.75); s.scale.set(0.8, 1.6, 0.8); g.add(s);
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
