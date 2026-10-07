// arcade_section c2: primitives arm with a different part breakdown. A
// two-row loggia: front AND back rows of square stone piers carry half-torus
// archivolts with stepped box spandrels, so the walkway is open on both long
// sides; the upper storey is a limewash block on beams; hipped roof from a
// 4-sided cone.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.9) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const LIME = mat(0xeee3cf, 'plaster');
  const STONE = mat(0xc9b48f, 'stone');
  const TILE = mat(0xc0603a, 'tile', 0.8);
  const TEAL = mat(0x3f8a8a, 'timber');
  const DARK = mat(0x4a3324, 'timber');
  const TIMB = mat(0x7a5534, 'timber');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const L = 12, D = 4, PW = 0.8, PD = 0.7, SPR = 2.9, GF = 5.0;
  const clear = (L - 4 * PW) / 3, r = clear / 2;
  const pierX = [0, 1, 2, 3].map((i) => -L / 2 + PW / 2 + i * (clear + PW));
  const bayX = [0, 1, 2].map((i) => -L / 2 + PW + r + i * (clear + PW));
  for (const z of [D / 2 - PD / 2, -D / 2 + PD / 2]) {
    for (const x of pierX) {
      add(B(PW + 0.24, 0.3, PD + 0.24), STONE, x, 0.15, z);
      add(B(PW, SPR, PD), STONE, x, SPR / 2, z);
      add(B(PW + 0.26, 0.22, PD + 0.26), STONE, x, SPR - 0.05, z);
    }
    for (const cx of bayX) {
      const arch = add(new THREE.TorusGeometry(r + 0.16, 0.2, 4, 12, Math.PI), STONE, cx, SPR, z);
      arch.rotation.z = 0; arch.scale.z = PD / 0.4 * 1.05 / Math.SQRT2 * 1.4;
      // stepped spandrel fill, limewash, between arch and string course
      for (let k = 0; k < 4; k++) {
        const y0 = SPR + r * Math.sin(Math.acos(Math.min(1, (r - k * 0.25) / r))) * 0.0;
        const xIn = r + 0.36 - k * 0.0;
        // two corner columns of boxes per bay side, each up to the arch curve
        for (const s of [-1, 1]) {
          const dx = r + 0.36 - k * 0.32;               // distance from bay centre
          if (dx < 0.2) continue;
          const yArc = SPR + Math.sqrt(Math.max(0, (r + 0.36) ** 2 - dx * dx));
          const hh = GF - yArc;
          if (hh <= 0.02) continue;
          add(B(0.34, hh, PD - 0.06), LIME, cx + s * (dx - 0.17), yArc + hh / 2, z);
        }
        void y0; void xIn;
      }
      add(B(clear * 0.5, GF - (SPR + r + 0.3), PD - 0.06), LIME, cx, (GF + SPR + r + 0.3) / 2, z);
    }
    // limewash band above the arches
    add(B(L, 0.35, PD), LIME, 0, GF - 0.175, z);
  }
  // end walls: limewash with a stone-framed doorway
  for (const sx of [-1, 1]) {
    add(B(PW, GF, D - 2 * PD), LIME, sx * (L / 2 - PW / 2), GF / 2, 0);
    add(B(0.12, 2.3, 1.4), STONE, sx * (L / 2 + 0.02), 1.15, 0);
    add(B(0.1, 2.1, 1.0), DARK, sx * (L / 2 + 0.05), 1.05, 0);
  }
  // paving + ceiling beams
  add(B(L, 0.12, D), STONE, 0, 0.06, 0);
  for (let i = 0; i < 9; i++) add(B(0.22, 0.26, D - 0.2), TIMB, -L / 2 + 0.9 + i * (L - 1.8) / 8, GF - 0.13, 0);
  add(B(L, 0.18, D), TIMB, 0, GF + 0.04, 0);
  // string course + upper storey
  add(B(L + 0.3, 0.2, D + 0.3), STONE, 0, GF + 0.23, 0);
  const UY = GF + 0.33, UH = 1.95;
  add(B(L, UH, D), LIME, 0, UY + UH / 2, 0);
  for (const [x, z, ry] of [[-4, 1, 0], [0, 1, 0], [4, 1, 0], [-4, -1, Math.PI], [0, -1, Math.PI], [4, -1, Math.PI], [-6, 0, -Math.PI / 2], [6, 0, Math.PI / 2]]) {
    const w = new THREE.Group(); w.rotation.y = ry;
    const zz = z ? z * D / 2 : 0, xx = z ? x : x;
    w.position.set(xx, UY + 1.0, zz); g.add(w);
    const parts = [[B(0.8, 1.1, 0.04), DARK, 0, 0, 0.02], [B(0.46, 1.12, 0.07), TEAL, -0.66, 0, 0.05], [B(0.46, 1.12, 0.07), TEAL, 0.66, 0, 0.05], [B(1.1, 0.1, 0.22), STONE, 0, -0.6, 0.08], [B(1.0, 0.1, 0.18), STONE, 0, 0.6, 0.06]];
    for (const [geo, m, px, py, pz] of parts) { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); w.add(o); }
  }
  // hipped roof: 4-sided cone, rotated to square, stretched to the plan
  const RT = UY + UH, RH = 0.85, OV = 0.45;
  const roof = add(new THREE.ConeGeometry(Math.SQRT1_2 * 2, RH, 4, 1).rotateY(Math.PI / 4), TILE, 0, RT + RH / 2, 0);
  roof.scale.set((L + 2 * OV) / 2, 1, (D + 2 * OV) / 2);
  // ridge courses can't follow a hip cleanly; chunky eave course instead
  for (const sz of [-1, 1]) add(B(L + 2 * OV, 0.14, 0.24), TILE, 0, RT + 0.02, sz * (D / 2 + OV - 0.12));
  for (const sx of [-1, 1]) add(B(0.24, 0.14, D + 2 * OV), TILE, sx * (L / 2 + OV - 0.12), RT + 0.02, 0);

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
