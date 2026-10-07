// lemon_tree_pot c2: profiles. Lathed pot with lip, banded body and foot; trunk forking into three; canopy of four lumpy icosahedron masses with 28 lemons tucked on their surface.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 42463; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const pot = M(0xc0603a, 'tile', 0.85, { side: THREE.DoubleSide }), soil = M(0x5a4030, 'ground', 1.0), bark = M(0x6b5640, 'timber', 0.95);
  const leaf = M(0x557a2e, 'foliage', 0.85, { flatShading: true }), leaf2 = M(0x648a36, 'foliage', 0.85, { flatShading: true }), fruit = M(0xe9c53a, 'foliage', 0.7, { flatShading: true });
  const prof = [[0.0, 0.0], [0.34, 0.0], [0.36, 0.05], [0.34, 0.1], [0.38, 0.14], [0.4, 0.3], [0.45, 0.33], [0.44, 0.38], [0.47, 0.66], [0.56, 0.7], [0.57, 0.84], [0.48, 0.86], [0.46, 0.76]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(prof, 12), pot);
  add(new THREE.CircleGeometry(0.46, 10), soil, 0, 0.76, 0, -Math.PI / 2);
  const fork = V(0.0, 1.55, 0);
  limb(V(0, 0.72, 0), fork, 0.075, 0.06, bark, 6);
  const masses = [[0, 2.55, 0, 0.62], [-0.38, 2.25, 0.18, 0.5], [0.4, 2.3, -0.12, 0.5], [0.05, 2.2, -0.42, 0.48]];
  masses.forEach(([x, y, z, r], i) => {
    if (i) limb(fork, V(x * 0.6, y - 0.3, z * 0.6), 0.045, 0.03, bark, 5); else limb(fork, V(0, 2.2, 0), 0.05, 0.035, bark, 5);
    add(warp(new THREE.IcosahedronGeometry(r, 1), (p) => p.multiplyScalar(1 + 0.12 * noise(p.x * 7 + i, p.y * 7, p.z * 7))), i % 2 ? leaf2 : leaf, x, y, z);
  });
  for (let i = 0; i < 28; i++) {
    const [x, y, z, r] = masses[i % 4]; const u = rr(-0.6, 0.9), a = rr(0, Math.PI * 2); const rxz = Math.sqrt(1 - u * u);
    add(new THREE.OctahedronGeometry(0.07), fruit, x + Math.cos(a) * rxz * r * 0.95, y + u * r * 0.95, z + Math.sin(a) * rxz * r * 0.95, 0, a, 0.2, 1, 1.35, 1);
  }

  // contract placement: measure vertices, base at y=0, centred on x and z
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
