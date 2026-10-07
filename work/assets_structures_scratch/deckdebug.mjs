// Sample the walkway (|z| < 1.79) of a bridge module: the highest surface at each x must be
// 0.4 + 2cos(pi x/18). Reports max deviation over bins, and anything poking above the line.
import * as THREE from '/Users/atlas/404_assetlib/node_modules/three/build/three.module.js';
const file = process.argv[2];
const g = (await import(file)).default(THREE);
g.updateMatrixWorld(true);
const top = (x) => 0.4 + 2 * Math.cos(Math.PI * x / 18);
const NB = 72, best = new Array(NB).fill(-1e9); let above = 0, worstAbove = 0;
const v = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
g.traverse((n) => {
  if (!n.isMesh) return;
  const geo = n.geometry.index ? n.geometry.toNonIndexed() : n.geometry;
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld);
    b.fromBufferAttribute(p, i + 1).applyMatrix4(n.matrixWorld);
    c.fromBufferAttribute(p, i + 2).applyMatrix4(n.matrixWorld);
    // sample a grid of points in the triangle
    for (let u = 0; u <= 6; u++) for (let w = 0; w <= 6 - u; w++) {
      const s = u / 6, t = w / 6;
      v.copy(a).multiplyScalar(1 - s - t).addScaledVector(b, s).addScaledVector(c, t);
      if (Math.abs(v.z) > 1.79 || Math.abs(v.x) > 8.99) continue;
      const k = Math.min(NB - 1, Math.floor((v.x + 9) / 18 * NB));
      if (v.y > best[k]) best[k] = v.y;
      const d = v.y - top(v.x); if (d > 0.005) { above++; (globalThis.H ??= new Map()).set(n.id, [n.geometry.type, v.x.toFixed(2), v.y.toFixed(2), v.z.toFixed(2)]); worstAbove = Math.max(worstAbove, d); }
    }
  }
});
console.log([...(globalThis.H||new Map()).values()].slice(0,12));
let maxDev = 0, at = 0;
for (let k = 0; k < NB; k++) { const x = -9 + 18 * (k + 0.5) / NB; const d = Math.abs(best[k] - top(x)); if (d > maxDev) { maxDev = d; at = x; } }
console.log(`${file.split('/').slice(-2).join('/')}: max |walk-top - curve| ${maxDev.toFixed(3)} m (at x=${at.toFixed(2)}), samples above line ${above} (worst ${worstAbove.toFixed(3)} m)`);
