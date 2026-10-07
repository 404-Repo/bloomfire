// Olive tree, 4.5 m. Gnarled split trunk, broad lumpy silver-green canopy.
export default function (THREE) {
  const g = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: 0x7a5534, roughness: 0.95 }); bark.name = 'timber';
  const leaf = new THREE.MeshStandardMaterial({ color: 0x6f7d3c, roughness: 0.85, flatShading: true }); leaf.name = 'foliage';
  const limb = (x, z, len, rx, rz, r0, r1) => {
    const piv = new THREE.Group(); piv.position.set(x, 0, z); piv.rotation.set(rx, 0, rz);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 7), bark); mesh.position.y = len / 2;
    piv.add(mesh); g.add(piv); return piv;
  };
  limb(0, 0, 1.0, 0, 0, 0.32, 0.26);
  const a = limb(0.05, 0, 1.0, 0, 0, 0.26, 0.2); a.position.y = 0.9; a.rotation.z = 0.35;
  const b = limb(-0.05, 0, 1.2, 0.2, -0.4, 0.24, 0.16); b.position.y = 0.9;
  const d = limb(0, 0.05, 1.1, -0.45, 0.1, 0.2, 0.14); d.position.y = 0.95;
  const blobs = [[0.5, 2.4, 0.1, 1.2], [-0.6, 2.5, 0.2, 1.1], [0, 3.3, -0.1, 1.2], [0.2, 2.6, -0.8, 1.0], [-0.2, 2.7, 0.9, 1.0], [0.9, 3.0, 0.6, 0.8], [-1.0, 3.1, -0.5, 0.8]];
  for (const [x, y, z, r] of blobs) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leaf);
    s.position.set(x, y, z); s.scale.set(1.15, 0.7, 1.15); g.add(s);
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
