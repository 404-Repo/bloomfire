// Assemble self-contained candidate modules: helpers + body + contract centring snippet.
import fs from 'fs'; import path from 'path';
const H = path.dirname(new URL(import.meta.url).pathname);
const helpers = fs.readFileSync(path.join(H, 'helpers.txt'), 'utf8');
const OUT = '/Users/atlas/astrocade-game5/receipts/candidates';
const foot = `
  {
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
  }
  return g;
}
`;
const only = process.argv[2];
for (const obj of fs.readdirSync(path.join(H, 'src'))) {
  if (only && obj !== only) continue;
  const dir = path.join(OUT, obj); fs.mkdirSync(dir, { recursive: true });
  const exp = path.join(H, 'src', obj, 'expect.json');
  for (const f of fs.readdirSync(path.join(H, 'src', obj)).filter((f) => f.endsWith('.body.js'))) {
    const name = f.replace('.body.js', '');
    const body = fs.readFileSync(path.join(H, 'src', obj, f), 'utf8');
    const head = `// ${obj} ${name}: ${(body.match(/^\/\/ (.*)/) || [, ''])[1]}\nexport default function (THREE) {\n`;
    fs.writeFileSync(path.join(dir, name + '.js'), head + helpers + '\n' + body + foot);
    if (fs.existsSync(exp)) fs.copyFileSync(exp, path.join(dir, name + '.expect.json'));
  }
}
