// Particles (sunlight sparks, ink droplets, colour motes), tracers, flower blooms, and rig baking.
import * as THREE from 'three';
import { scene } from './render.js';
import { bakeStatic } from '../assetlib.js';

// ---- point particles ------------------------------------------------------------------------------
function makeSystem(max, additive) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3), size = new Float32Array(max), alpha = new Float32Array(max);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uScale: { value: 400 } },
    vertexShader: `attribute float size; attribute float alpha; attribute vec3 color; varying vec3 vC; varying float vA; uniform float uScale;
      void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix*vec4(position,1.0); gl_PointSize = size * uScale / max(0.1, -mv.z); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ vec2 q = gl_PointCoord-0.5; float d = length(q); if (d > 0.5) discard;
      float a = ${additive ? 'pow(1.0 - d*2.0, 1.6)' : 'smoothstep(0.5, 0.36, d)'} * vA; gl_FragColor = vec4(vC, a); }`,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 5; scene.add(pts);
  const P = [];
  return { geo, pos, col, size, alpha, max, mat, P, additive };
}
const ADD = makeSystem(1400, true), INK = makeSystem(900, false);
export function setParticleScale(h) { ADD.mat.uniforms.uScale.value = INK.mat.uniforms.uScale.value = h * 0.9; }

export function emit(sys, x, y, z, n, { speed = 4, up = 2, life = 0.6, size = 0.15, color = [1, 0.8, 0.4], grav = 9, spread = 1, drag = 1.5, home = null } = {}) {
  const S = sys === 'ink' ? INK : ADD;
  for (let i = 0; i < n; i++) {
    if (S.P.length >= S.max) S.P.shift();
    const a = Math.random() * Math.PI * 2, b = Math.acos(Math.random() * 2 - 1);
    const sp = speed * (0.4 + Math.random() * 0.6);
    S.P.push({ x: x + (Math.random() - 0.5) * spread * 0.3, y, z: z + (Math.random() - 0.5) * spread * 0.3,
      vx: Math.sin(b) * Math.cos(a) * sp, vy: Math.abs(Math.cos(b)) * sp * 0.6 + up * Math.random(), vz: Math.sin(b) * Math.sin(a) * sp,
      life, t: 0, size: size * (0.6 + Math.random() * 0.8), c: color, grav, drag, home });
  }
}
export function updateParticles(dt, target) {
  for (const S of [ADD, INK]) {
    let k = 0;
    for (let i = S.P.length - 1; i >= 0; i--) {
      const p = S.P[i]; p.t += dt;
      if (p.t >= p.life) { S.P.splice(i, 1); continue; }
      if (p.home && target) {   // motes fly home to the player
        const dx = target.x - p.x, dy = target.y - 0.4 - p.y, dz = target.z - p.z, d = Math.hypot(dx, dy, dz) || 1;
        const pull = Math.min(60, 6 + p.t * 40); p.vx += dx / d * pull * dt; p.vy += dy / d * pull * dt; p.vz += dz / d * pull * dt;
        p.vx *= 1 - 2.5 * dt; p.vy *= 1 - 2.5 * dt; p.vz *= 1 - 2.5 * dt;
        if (d < 0.8) { p.t = p.life; if (p.home.onArrive) p.home.onArrive(); continue; }
      } else { p.vy -= p.grav * dt; const f = Math.exp(-p.drag * dt); p.vx *= f; p.vz *= f; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    }
    for (const p of S.P) {
      if (k >= S.max) break;
      S.pos[k * 3] = p.x; S.pos[k * 3 + 1] = p.y; S.pos[k * 3 + 2] = p.z;
      S.col[k * 3] = p.c[0]; S.col[k * 3 + 1] = p.c[1]; S.col[k * 3 + 2] = p.c[2];
      const f = p.t / p.life; S.size[k] = p.size * (S.additive ? (1 - f * 0.6) : 1); S.alpha[k] = S.additive ? 1 - f * f : Math.min(1, (1 - f) * 3);
      k++;
    }
    for (let i = k; i < S.max; i++) S.alpha[i] = 0;
    S.geo.setDrawRange(0, Math.max(k, 1));
    for (const n of ['position', 'color', 'size', 'alpha']) S.geo.attributes[n].needsUpdate = true;
  }
}

// ---- tracers: one instanced beam --------------------------------------------------------------------
const TR_MAX = 32;
const trGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true); trGeo.translate(0, 0.5, 0); trGeo.rotateX(Math.PI / 2);   // along +z, 0..1
const trMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
trMat.userData.noPaint = true;
const tracers = new THREE.InstancedMesh(trGeo, trMat, TR_MAX); tracers.frustumCulled = false; tracers.count = 0; tracers.renderOrder = 6;
tracers.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(TR_MAX * 3), 3);
scene.add(tracers);
const trList = [];
export function tracer(from, to, width = 0.035, color = [1.6, 1.15, 0.55]) {
  if (trList.length >= TR_MAX) trList.shift();
  trList.push({ from: from.clone(), to: to.clone(), t: 0, life: 0.09, w: width, c: color });
}
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _z = new THREE.Vector3(0, 0, 1);
export function updateTracers(dt) {
  for (let i = trList.length - 1; i >= 0; i--) { trList[i].t += dt; if (trList[i].t > trList[i].life) trList.splice(i, 1); }
  trList.forEach((t, i) => {
    _d.subVectors(t.to, t.from); const L = _d.length(); _d.divideScalar(L || 1);
    _q.setFromUnitVectors(_z, _d); const f = 1 - t.t / t.life;
    _s.set(t.w * (0.6 + f * 0.6), t.w * (0.6 + f * 0.6), L);
    tracers.setMatrixAt(i, _m.compose(t.from, _q, _s));
    tracers.instanceColor.setXYZ(i, t.c[0] * f, t.c[1] * f, t.c[2] * f);
  });
  tracers.count = trList.length; tracers.instanceMatrix.needsUpdate = true; tracers.instanceColor.needsUpdate = true;
}

// ---- flower blooms: patches that spring up where colour returns -------------------------------------
let bloomMesh = [], bloomData = [], BL_MAX = 700, blIdx = 0;
export function setBloomProto(proto) {
  proto.updateMatrixWorld(true);
  proto.traverse((o) => { if (o.isMesh) { const g = o.geometry.clone().applyMatrix4(o.matrixWorld); const im = new THREE.InstancedMesh(g, o.material, BL_MAX); im.count = 0; im.frustumCulled = false; im.receiveShadow = true; scene.add(im); bloomMesh.push(im); } });
}
export function bloomAt(x, y, z, yaw, s) {
  if (!bloomMesh.length) return;
  const i = blIdx++ % BL_MAX; bloomData[i] = { x, y, z, yaw, s, t: 0 };
  for (const im of bloomMesh) im.count = Math.min(BL_MAX, Math.max(im.count, i + 1));
}
export function updateBlooms(dt) {
  if (!bloomMesh.length) return; let any = false;
  bloomData.forEach((b, i) => {
    if (!b || b.t >= 1) return; any = true; b.t = Math.min(1, b.t + dt * 2.2);
    const e = 1 - Math.pow(1 - b.t, 3), over = 1 + Math.sin(b.t * Math.PI) * 0.25;
    _q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.yaw); _s.setScalar(b.s * e * over); _d.set(b.x, b.y, b.z);
    for (const im of bloomMesh) im.setMatrixAt(i, _m.compose(_d, _q, _s));
  });
  if (any) for (const im of bloomMesh) im.instanceMatrix.needsUpdate = true;
}

// ---- rig baking: merge an articulated asset per joint, so it keeps its motion at a few draws ----------
export function bakeJoints(root) {
  const joints = root.userData.joints || {};
  const jointSet = new Set(Object.values(joints).filter((j) => j && j.isObject3D));
  root.updateMatrixWorld(true);
  const owners = new Map();
  root.traverse((o) => {
    if (!o.isMesh) return;
    let p = o.parent; while (p && !jointSet.has(p) && p !== root) p = p.parent;
    const owner = p || root; if (!owners.has(owner)) owners.set(owner, []); owners.get(owner).push(o);
  });
  const inv = new THREE.Matrix4();
  for (const [owner, meshes] of owners) {
    inv.copy(owner.matrixWorld).invert();
    const tmp = new THREE.Group();
    for (const m of meshes) {
      const c = m.clone(false); c.matrixAutoUpdate = false; c.matrix.multiplyMatrices(inv, m.matrixWorld); tmp.add(c);
      // a mesh can parent a joint: keep its children by swapping the mesh for a bare Group in place
      if (m.children.length) {
        const g = new THREE.Group(); g.position.copy(m.position); g.quaternion.copy(m.quaternion); g.scale.copy(m.scale); g.name = m.name;
        for (const ch of [...m.children]) g.add(ch);
        m.parent.add(g);
      }
      m.parent.remove(m);
    }
    const merged = bakeStatic(tmp);
    for (const ch of [...merged.children]) { ch.castShadow = true; owner.add(ch); }
  }
  return root;
}
