// amphora c1: primitives. Squashed sphere belly, cylinder shoulder and neck, torus lip, cone foot, two half-torus handles; a dark timber ring stand on three splayed legs with a lower tie ring.
const terra = M(0xc0603a, 'tile', 0.85), dark = M(0x4a3324, 'timber', 0.9);
add(new THREE.SphereGeometry(0.2, 12, 8), terra, 0, 0.42, 0, 0, 0, 0, 1, 1.45, 1);
add(new THREE.CylinderGeometry(0.075, 0.15, 0.14, 12, 1, true), terra, 0, 0.66, 0);
add(new THREE.CylinderGeometry(0.068, 0.075, 0.16, 12, 1, true), terra, 0, 0.8, 0);
add(new THREE.TorusGeometry(0.075, 0.022, 4, 12), terra, 0, 0.88, 0, Math.PI / 2);
add(new THREE.ConeGeometry(0.08, 0.2, 8), terra, 0, 0.08, 0, Math.PI);
for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.075, 0.016, 4, 6, Math.PI), terra, s * 0.1, 0.74, 0, 0, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2);
add(new THREE.TorusGeometry(0.205, 0.025, 4, 12), dark, 0, 0.32, 0, Math.PI / 2);
add(new THREE.TorusGeometry(0.22, 0.018, 4, 12), dark, 0, 0.12, 0, Math.PI / 2);
for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + Math.PI / 2; limb(V(Math.cos(a) * 0.29, 0, Math.sin(a) * 0.29), V(Math.cos(a) * 0.2, 0.36, Math.sin(a) * 0.2), 0.022, 0.02, dark, 5); }
