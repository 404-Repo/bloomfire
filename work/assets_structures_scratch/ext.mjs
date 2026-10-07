import * as THREE from '/Users/atlas/404_assetlib/node_modules/three/build/three.module.js';
const g = (await import(process.argv[2])).default(THREE); g.updateMatrixWorld(true);
const v = new THREE.Vector3();
g.children.forEach((n, i) => { if (!n.isMesh) return; const b = new THREE.Box3(); const p = n.geometry.attributes.position;
  for (let k = 0; k < p.count; k++) b.expandByPoint(v.fromBufferAttribute(p, k).applyMatrix4(n.matrixWorld));
  if (Math.abs(b.min.z) > +process.argv[3] || Math.abs(b.max.z) > +process.argv[3]) console.log(i, n.geometry.type, b.min.toArray().map(x=>x.toFixed(2)), b.max.toArray().map(x=>x.toFixed(2))); });
