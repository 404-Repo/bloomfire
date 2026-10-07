// chalk_block c1: segmented box. One box with a few segments per face; the long faces carry horizontal chisel grooves pushed in by a stepped sine, one top corner is clamped off by a plane as a chip, and the whole is slightly irregular.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 63139; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const chalk = M(0xe8e2d4, 'stone', 0.95, { flatShading: true });
  const W = 1.7, H = 1.3, D = 1.15;
  const chip = V(1, 1, 1).normalize();
  const ge = warp(new THREE.BoxGeometry(W, H, D, 4, 6, 3), (p) => {
    const onSide = Math.abs(Math.abs(p.z) - D / 2) < 1e-3 || Math.abs(Math.abs(p.x) - W / 2) < 1e-3;
    if (onSide && Math.abs(p.y) < H / 2 - 1e-3) { const g = Math.sin((p.y + H / 2) / H * Math.PI * 6) > 0.3 ? 0.03 : 0; if (Math.abs(p.z) > D / 2 - 1e-3) p.z -= Math.sign(p.z) * g; else p.x -= Math.sign(p.x) * g; }
    p.x += 0.02 * noise(p.x * 3, p.y * 3, p.z * 3); p.z += 0.02 * noise(p.z * 3, p.x * 3, p.y * 3);
    const s = (p.x - W / 2 + 0.0) * chip.x + (p.y - H / 2) * chip.y + (p.z - D / 2) * chip.z; if (s > -0.42) p.addScaledVector(chip, -0.42 - s);
  });
  add(ge, chalk, 0, H / 2, 0);

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
