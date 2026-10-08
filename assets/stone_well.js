// stone_well c1: primitives. Four staggered courses of box blocks round a ring, a chunky
// projecting cap course, two dark timber posts with braces and a crossbeam, rope and bucket.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const stone = M(0xc9b48f, 'stone', 0.92), capStone = M(0xd6c4a0, 'stone', 0.9), inner = M(0x6b5d48, 'stone', 1.0, { side: THREE.DoubleSide });
  const dark = M(0x4a3324, 'timber'), timber = M(0x7a5534, 'timber', 0.85, { side: THREE.DoubleSide });
  const iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.5 }), rope = M(0xb89a68, 'fabric', 0.95), water = M(0x2c3a40, 'ground', 0.3);
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); g.add(ms); return ms; };
  const R = 0.7, N = 12, ch = 0.2;
  for (let c = 0; c < 4; c++) {
    for (let i = 0; i < N; i++) {
      const a = (i + (c % 2) * 0.5) / N * Math.PI * 2;
      const w = 2 * Math.PI * R / N - 0.03 + ((i * 7 + c * 3) % 3) * 0.004;
      const b = add(new THREE.BoxGeometry(w, ch - 0.025, 0.28), stone, Math.sin(a) * R, ch / 2 + c * ch, Math.cos(a) * R, 0, a, 0);
      b.scale.y = 1 - ((i + c) % 3) * 0.04;
    }
  }
  // mortar core behind the blocks so no gap is see-through
  add(new THREE.CylinderGeometry(0.6, 0.6, 0.82, 14, 1, true), inner, 0, 0.41, 0);
  add(new THREE.CylinderGeometry(0.78, 0.78, 0.8, 14, 1, true), M(0x9c8a6a, 'stone', 1.0), 0, 0.4, 0);
  // cap course: chunky slabs projecting both ways
  // cap course: ring-sector slabs (extruded annular sectors), overhanging inside and out
  const NC = 10;
  for (let i = 0; i < NC; i++) {
    const a0 = i / NC * Math.PI * 2 + 0.018, a1 = (i + 1) / NC * Math.PI * 2 - 0.018;
    const sh = new THREE.Shape();
    sh.absarc(0, 0, 0.92, a0, a1, false);
    sh.lineTo(Math.cos(a1) * 0.5, Math.sin(a1) * 0.5);
    sh.absarc(0, 0, 0.5, a1, a0, true);
    sh.closePath();
    const hgt = 0.15 + (i % 3) * 0.015;
    add(new THREE.ExtrudeGeometry(sh, { depth: hgt, bevelEnabled: false, curveSegments: 3 }), capStone, 0, 0.82, 0, -Math.PI / 2, 0, 0);
  }
  add(new THREE.CircleGeometry(0.6, 14), water, 0, 0.45, 0, -Math.PI / 2, 0, 0);
  // frame
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.17, 2.52, 0.17), dark, sx * 0.98, 1.26, 0);
    add(new THREE.BoxGeometry(0.1, 0.6, 0.1), dark, sx * 0.78, 2.22, 0, 0, 0, sx * 0.785);
    add(new THREE.BoxGeometry(0.3, 0.2, 0.3), dark, sx * 0.98, 0.1, 0); // foot block
  }
  add(new THREE.BoxGeometry(2.36, 0.18, 0.18), dark, 0, 2.51, 0);
  // rope: coil on the beam, drop to the bucket
  add(new THREE.TorusGeometry(0.13, 0.035, 6, 12), rope, 0, 2.51, 0, 0, Math.PI / 2, 0);
  add(new THREE.TorusGeometry(0.13, 0.035, 6, 12), rope, 0.07, 2.51, 0, 0, Math.PI / 2, 0);
  add(new THREE.CylinderGeometry(0.022, 0.022, 0.75, 5), rope, 0, 2.03, 0);
  // bucket
  const by = 1.28;
  add(new THREE.CylinderGeometry(0.17, 0.14, 0.3, 10, 1, true), timber, 0, by, 0);
  add(new THREE.CircleGeometry(0.14, 10), timber, 0, by - 0.15, 0, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.165, 0.016, 4, 12), iron, 0, by + 0.1, 0, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.148, 0.016, 4, 12), iron, 0, by - 0.1, 0, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.17, 0.014, 4, 10, Math.PI), iron, 0, by + 0.15, 0);
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
