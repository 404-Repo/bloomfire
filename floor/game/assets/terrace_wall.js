// Dry-stone terrace wall section, 8 m long, 1.2 m high, 0.6 m thick, with a capstone row.
export default function (THREE) {
  const g = new THREE.Group();
  const st = new THREE.MeshStandardMaterial({ color: 0xc9b48f, roughness: 0.97, flatShading: true }); st.name = 'stone';
  const st2 = new THREE.MeshStandardMaterial({ color: 0xb59f7c, roughness: 0.97, flatShading: true }); st2.name = 'stone';
  let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const rows = 3, L = 8;
  for (let row = 0; row < rows; row++) {
    let x = -L / 2 + (row % 2) * 0.3;
    while (x < L / 2 - 0.1) {
      const w = Math.min(0.5 + r() * 0.6, L / 2 - x); const h = 0.3 + r() * 0.06;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, h, 0.6 - r() * 0.08), r() > 0.5 ? st : st2);
      b.position.set(x + w / 2, 0.17 + row * 0.33, (r() - 0.5) * 0.05); b.rotation.z = (r() - 0.5) * 0.06; g.add(b); x += w;
    }
  }
  const cap = new THREE.Mesh(new THREE.BoxGeometry(L, 0.16, 0.7), st); cap.position.y = 1.12; g.add(cap);
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
