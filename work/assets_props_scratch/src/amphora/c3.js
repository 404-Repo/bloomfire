// amphora c3: another reading. A plumper ten-sided lathed jar with a short neck and loop handles, seated through the round hole of a square timber stand (four legs, top frame of four boards, low stretchers).
const terra = M(0xc0603a, 'tile', 0.85, { side: THREE.DoubleSide, flatShading: true }), wood = M(0x7a5534, 'timber', 0.9), dark = M(0x4a3324, 'timber', 0.9);
const prof = [[0.0, 0.05], [0.07, 0.07], [0.16, 0.18], [0.23, 0.36], [0.235, 0.5], [0.2, 0.62], [0.12, 0.7], [0.085, 0.74], [0.085, 0.84], [0.11, 0.87], [0.1, 0.9], [0.075, 0.885]].map(([r, y]) => new THREE.Vector2(r, y));
add(new THREE.LatheGeometry(prof, 10), terra);
for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.06, 0.018, 4, 6), terra, s * 0.14, 0.72, 0, 0, 0, 0);
for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) add(new THREE.BoxGeometry(0.05, 0.4, 0.05), dark, x * 0.22, 0.2, z * 0.22);
for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.52, 0.05, 0.08), wood, 0, 0.38, s * 0.2); add(new THREE.BoxGeometry(0.08, 0.05, 0.36), wood, s * 0.2, 0.38, 0); add(new THREE.BoxGeometry(0.44, 0.035, 0.035), dark, 0, 0.1, s * 0.22); add(new THREE.BoxGeometry(0.035, 0.035, 0.44), dark, s * 0.22, 0.1, 0); }
