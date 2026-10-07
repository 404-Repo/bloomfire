// lemon_tree_pot c3: another reading. Chunky eight-sided lathed pot with a thick rolled rim, a trunk that splits into three visible branches, a flattened dome canopy of dodecahedron leaf clusters, 14 rounder icosahedron lemons standing proud of it.
const pot = M(0xc0603a, 'tile', 0.85, { side: THREE.DoubleSide, flatShading: true }), soil = M(0x5a4030, 'ground', 1.0), bark = M(0x6b5640, 'timber', 0.95);
const leaf = M(0x557a2e, 'foliage', 0.85, { flatShading: true }), leaf2 = M(0x648a36, 'foliage', 0.85, { flatShading: true }), fruit = M(0xe9c53a, 'foliage', 0.7, { flatShading: true });
const prof = [[0, 0], [0.36, 0], [0.4, 0.08], [0.5, 0.7], [0.6, 0.72], [0.62, 0.84], [0.5, 0.86], [0.48, 0.76]].map(([r, y]) => new THREE.Vector2(r, y));
add(new THREE.LatheGeometry(prof, 8), pot);
add(new THREE.CircleGeometry(0.48, 8), soil, 0, 0.76, 0, -Math.PI / 2);
const fork = V(0.02, 1.7, 0);
limb(V(0, 0.72, 0), fork, 0.08, 0.06, bark, 6);
[[-0.45, 2.25, 0.2], [0.45, 2.3, 0.15], [0.0, 2.35, -0.45]].forEach(([x, y, z]) => limb(fork, V(x, y, z), 0.05, 0.03, bark, 5));
const cl = [];
for (let i = 0; i < 9; i++) { const a = i * 2.39996; const ring = i === 0 ? 0 : (i < 4 ? 0.42 : 0.62); const y = i === 0 ? 2.75 : (i < 4 ? 2.6 : 2.3); cl.push([Math.cos(a) * ring, y, Math.sin(a) * ring]); }
cl.forEach(([x, y, z], i) => add(new THREE.DodecahedronGeometry(i === 0 ? 0.5 : 0.42, 0), i % 2 ? leaf2 : leaf, x, y, z, i, i * 0.7, 0, 1, 0.85, 1));
for (let i = 0; i < 14; i++) { const [x, y, z] = cl[1 + (i % 8)]; const a = rr(0, 6.28); add(new THREE.IcosahedronGeometry(0.08, 0), fruit, x + Math.cos(a) * 0.36, y + rr(-0.25, 0.2), z + Math.sin(a) * 0.36, 0, 0, 0, 1, 1.3, 1); }
