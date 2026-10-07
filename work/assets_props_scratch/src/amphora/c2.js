// amphora c2: profiles. One lathed body (pointed toe, full belly, sharp shoulder, tall neck, rolled lip) and two swept tube handles from shoulder to neck; a ring stand of a top and bottom torus joined by three splayed legs.
const terra = M(0xc0603a, 'tile', 0.85, { side: THREE.DoubleSide }), dark = M(0x4a3324, 'timber', 0.9);
const prof = [[0.0, 0.03], [0.035, 0.04], [0.06, 0.1], [0.12, 0.2], [0.18, 0.32], [0.205, 0.45], [0.195, 0.56], [0.16, 0.64], [0.09, 0.69], [0.068, 0.74], [0.065, 0.83], [0.09, 0.86], [0.085, 0.9], [0.06, 0.89]].map(([r, y]) => new THREE.Vector2(r, y));
add(new THREE.LatheGeometry(prof, 12), terra);
for (const s of [-1, 1]) { const c = new THREE.CatmullRomCurve3([V(s * 0.15, 0.63, 0), V(s * 0.17, 0.74, 0), V(s * 0.12, 0.8, 0), V(s * 0.068, 0.8, 0)]); add(new THREE.TubeGeometry(c, 6, 0.017, 4, false), terra); }
add(new THREE.TorusGeometry(0.19, 0.025, 4, 12), dark, 0, 0.3, 0, Math.PI / 2);
add(new THREE.TorusGeometry(0.24, 0.018, 4, 12), dark, 0, 0.1, 0, Math.PI / 2);
for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + Math.PI / 2; limb(V(Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28), V(Math.cos(a) * 0.19, 0.34, Math.sin(a) * 0.19), 0.022, 0.02, dark, 5); }
