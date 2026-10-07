// Blotling, 0.6 m: a fast ink blob on stubby legs with a bone mask and two magenta eyes.
export default function (THREE) {
  const g = new THREE.Group();
  const ink = new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.25 });
  const bone = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.7 });
  const core = new THREE.MeshStandardMaterial({ color: 0xff3d8b, emissive: 0xff3d8b, emissiveIntensity: 2.5 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 9), ink); body.position.y = 0.32; body.scale.set(1, 0.85, 1.1); g.add(body);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const l = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 5), ink); l.position.set(Math.cos(a) * 0.2, 0.08, Math.sin(a) * 0.2); l.rotation.x = Math.PI; g.add(l); }
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), bone); mask.rotation.x = Math.PI / 2; mask.position.set(0, 0.36, 0.22); mask.scale.set(1, 1, 0.5); g.add(mask);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), core); e.position.set(s * 0.08, 0.4, 0.33); g.add(e); }
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 5), bone); h.position.set(s * 0.15, 0.6, 0.05); h.rotation.z = -s * 0.5; g.add(h); }
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
