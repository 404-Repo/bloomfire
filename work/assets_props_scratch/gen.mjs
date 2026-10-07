// Wraps src/<obj>/cN.js build bodies into self-contained contract modules in receipts/candidates/<obj>/cN.js
import fs from 'fs'; import path from 'path';
const SRC = '/Users/atlas/astrocade-game5/work/assets_props_scratch/src';
const OUT = '/Users/atlas/astrocade-game5/receipts/candidates';
const EXPECT = JSON.parse(fs.readFileSync(path.join(SRC, 'expect.json'), 'utf8'));
const only = process.argv[2];
const HEAD = (seed) => `export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = ${seed}; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
`;
const TAIL = `
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
`;
let seed = 1009;
for (const obj of fs.readdirSync(SRC).sort()) {
  const d = path.join(SRC, obj); if (!fs.statSync(d).isDirectory()) continue;
  if (only && obj !== only) continue;
  const od = path.join(OUT, obj); fs.mkdirSync(od, { recursive: true });
  for (const f of fs.readdirSync(d).filter((f) => /^c\d\.js$/.test(f)).sort()) {
    const body = fs.readFileSync(path.join(d, f), 'utf8').trimEnd();
    const lines = body.split('\n');
    const desc = lines[0].startsWith('//') ? lines.shift() : `// ${obj} ${f}`;
    seed = 1; for (const ch of obj + '/' + f) seed = (seed * 31 + ch.charCodeAt(0)) % 99991; seed += 1;
    const indented = lines.map((l) => (l ? '  ' + l : l)).join('\n');
    fs.writeFileSync(path.join(od, f), `${desc}\n${HEAD(seed)}${indented}\n${TAIL}`);
    if (EXPECT[obj]) fs.writeFileSync(path.join(od, f.replace('.js', '.expect.json')), JSON.stringify(EXPECT[obj]) + '\n');
  }
  console.log('wrote', obj);
}
