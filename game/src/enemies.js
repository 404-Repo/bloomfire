// The ink: creatures, their AI and animation, ink projectiles, and the inkwells that spawn them.
import * as THREE from 'three';
import { ASSET } from '../assetlib.js';
import { scene } from './render.js';
import { pushOut, surfaceAt } from './collide.js';
import { bakeJoints, emit } from './fx.js';
import { P, hurt } from './player.js';
import { sfx } from './audio.js';
import { creep, maskAt } from './paint.js';

let T = null, have = new Set();
export const ENEMIES = [], SHOTS = [];

export const TYPES = {
  blotling: { hp: 18, speed: 7.6, r: 0.45, height: 0.62, score: 100, splat: 4.5, dmg: 8, reach: 1.7, cd: 0.9, coreY: 0.35, coreR: 0.22, bodyR: 0.42 },
  smear: { hp: 62, speed: 3.6, r: 0.6, height: 2.0, score: 200, splat: 6.5, dmg: 14, reach: 2.5, cd: 1.6, windup: 0.55, coreY: 1.25, coreR: 0.26, bodyR: 0.62 },
  spitter: { hp: 46, speed: 2.6, r: 0.75, height: 1.6, score: 250, splat: 6.5, dmg: 15, range: [11, 26], cd: 2.6, windup: 0.7, coreY: 0.8, coreR: 0.3, bodyR: 0.8 },
  quill: { hp: 22, speed: 9.5, r: 0.55, height: 0.7, fly: 4.2, score: 200, splat: 4.5, dmg: 10, reach: 1.4, cd: 1.4, coreY: 0.3, coreR: 0.22, bodyR: 0.55 },
  inkhorn: { hp: 300, speed: 2.9, r: 1.15, height: 3.2, score: 800, splat: 11, dmg: 28, reach: 3.2, cd: 2.0, windup: 0.9, coreY: 2.0, coreR: 0.42, bodyR: 1.2, armour: 0.45 },
};
const PROTO = {};

// A placeholder only while a module does not exist yet (development). The shipped build has every module.
function placeholder(type) {
  const t = TYPES[type], g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(t.bodyR, 12, 8), new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.25 }));
  body.position.y = t.coreY; g.add(body);
  const core = new THREE.Mesh(new THREE.SphereGeometry(t.coreR, 10, 8), new THREE.MeshStandardMaterial({ color: 0xff3d8b, emissive: 0xff3d8b, emissiveIntensity: 2 }));
  core.position.set(0, t.coreY, t.bodyR * 0.8); g.add(core);
  g.userData.joints = {}; return g;
}

async function loadProto(type) {
  let obj;
  if (have.has(type)) {
    obj = await ASSET(`./assets/${type}.js`, { height: TYPES[type].height, keepHierarchy: true });
    bakeJoints(obj);
  } else obj = placeholder(type);
  const names = {}; for (const [k, v] of Object.entries(obj.userData.joints || {})) if (v && v.name) names[k] = v.name;
  obj.traverse((o) => { if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => { m.userData.noPaint = true; }); } if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  PROTO[type] = { obj, names };
}
function instance(type) {
  const p = PROTO[type], o = p.obj.clone(true), joints = {};
  const by = new Map(); o.traverse((n) => { if (n.name) by.set(n.name, n); });
  for (const [k, name] of Object.entries(p.names)) { const n = by.get(name); if (n) joints[k] = { node: n, rx: n.rotation.x, ry: n.rotation.y, rz: n.rotation.z, sy: n.scale.y, py: n.position.y }; }
  return { o, joints };
}

export async function initEnemies(terrain, haveSet) {
  T = terrain; have = haveSet;
  await Promise.all(Object.keys(TYPES).map(loadProto));
}

const tmpP = new THREE.Vector3(), res = {};
let uid = 1;
export function spawn(type, x, z, { owner = null, rise = true, tier = 0 } = {}) {
  const t = TYPES[type], { o, joints } = instance(type);
  const y = T.height(x, z);
  o.position.set(x, y, z); scene.add(o);
  const hpMul = 1 + tier * 0.18;
  const e = { id: uid++, type, t, o, joints, pos: o.position, vel: new THREE.Vector3(), hp: t.hp * hpMul, maxHp: t.hp * hpMul, alive: true, owner,
    state: rise ? 'rise' : 'chase', st: 0, cd: 0.6 + Math.random() * 0.8, phase: Math.random() * 6, stuck: 0, lastD: 1e9, yaw: 0, hitT: 0,
    fly: t.fly || 0, flyY: 0, stagger: 0, dir: new THREE.Vector3() };
  if (rise) { o.scale.set(1, 0.01, 1); emit('ink', x, y + 0.2, z, 14, { speed: 3, up: 4, life: 0.8, size: 0.35, color: [0.08, 0.07, 0.12], grav: 12 }); }
  ENEMIES.push(e); return e;
}

export function damage(e, amount, { core = false, from = null } = {}) {
  if (!e.alive) return false;
  let a = amount * (core ? 2.0 : 1) * (e.t.armour && !core ? (1 - e.t.armour) : 1);
  e.hp -= a; e.hitT = 0.12;
  if (e.hp <= 0) { e.alive = false; return true; }
  return false;
}

function groundY(x, z, y) { return surfaceAt(x, z, y + 1.6, T.height(x, z)); }

function animate(e, dt, moving) {
  const j = e.joints, ph = e.phase, sw = Math.sin(ph) * (moving ? 0.7 : 0.08), sw2 = Math.sin(ph + Math.PI) * (moving ? 0.7 : 0.08);
  const set = (k, ax, v) => { const q = j[k]; if (q) q.node.rotation[ax] = q['r' + ax] + v; };
  switch (e.type) {
    case 'blotling': set('legFL', 'x', sw); set('legBR', 'x', sw); set('legFR', 'x', sw2); set('legBL', 'x', sw2); if (j.body) j.body.node.position.y = j.body.py + Math.abs(Math.sin(ph)) * 0.05; break;
    case 'smear': case 'inkhorn': {
      set('legL', 'x', sw * 0.6); set('legR', 'x', sw2 * 0.6);
      const wind = e.state === 'windup' ? -1.6 * Math.min(1, e.st / e.t.windup) : e.state === 'strike' ? 0.9 : 0;
      set('armL', 'x', sw2 * 0.5 + wind); set('armR', 'x', sw * 0.5 + wind);
      if (j.head) j.head.node.rotation.x = j.head.rx + Math.sin(ph * 0.5) * 0.08; break; }
    case 'spitter': { const sw3 = e.state === 'windup' ? 1 + 0.35 * Math.min(1, e.st / e.t.windup) : 1 + Math.sin(ph * 0.6) * 0.05; if (j.sac) j.sac.node.scale.set(sw3, sw3, sw3); break; }
    case 'quill': set('wingL', 'z', Math.sin(ph * 2.2) * 0.8); set('wingR', 'z', -Math.sin(ph * 2.2) * 0.8); break;
  }
}

export function updateEnemies(dt, now, cam) {
  const pp = P.pos;
  for (let i = ENEMIES.length - 1; i >= 0; i--) {
    const e = ENEMIES[i];
    if (!e.alive) { scene.remove(e.o); ENEMIES.splice(i, 1); continue; }
    e.st += dt; e.cd -= dt; e.hitT = Math.max(0, e.hitT - dt); e.stagger = Math.max(0, e.stagger - dt);
    const dx = pp.x - e.pos.x, dz = pp.z - e.pos.z, d = Math.hypot(dx, dz) || 0.001;
    const t = e.t;
    let moving = false, speed = t.speed * (maskAt(e.pos.x, e.pos.z) > 0.5 ? 0.85 : 1);   // ink is slower on painted ground
    if (e.state === 'rise') {
      const k = Math.min(1, e.st / 0.6); e.o.scale.set(1, Math.max(0.01, k), 1);
      if (k >= 1) { e.state = 'chase'; e.st = 0; }
    } else if (e.stagger > 0) {
      // reeling
    } else if (e.state === 'chase') {
      let want = 0;
      if (e.type === 'spitter') { want = d > t.range[1] ? 1 : d < t.range[0] ? -0.8 : 0.15 * Math.sin(now + e.id); }
      else want = 1;
      if (want !== 0) {
        moving = true; let mx = dx / d * want, mz = dz / d * want;
        if (e.type === 'quill' || e.type === 'blotling') { const s = Math.sin(now * 1.7 + e.id) * 0.5; mx += -dz / d * s; mz += dx / d * s; }
        e.dir.set(mx, 0, mz);
      }
      // attacks
      if (e.cd <= 0) {
        if (e.type === 'spitter' && d < t.range[1] + 4) { e.state = 'windup'; e.st = 0; sfx.telegraph(); }
        else if (t.reach && d < t.reach + (e.type === 'blotling' ? 1.2 : 0.4)) { e.state = t.windup ? 'windup' : 'strike'; e.st = 0; if (t.windup) sfx.telegraph(); }
        else if (e.type === 'inkhorn' && d < 16 && d > 6 && Math.random() < 0.012) { e.state = 'charge_wind'; e.st = 0; sfx.roar(); }
      }
    } else if (e.state === 'windup') {
      if (e.st >= (t.windup || 0.3)) {
        if (e.type === 'spitter') { lob(e, pp); sfx.spit(); e.state = 'chase'; e.cd = t.cd; e.st = 0; }
        else { e.state = 'strike'; e.st = 0; }
      }
    } else if (e.state === 'strike') {
      if (e.st < 0.05 && d < t.reach + 0.6) { if (hurt(t.dmg, e.pos.x, e.pos.z)) sfx.hurt(); }
      if (e.type === 'blotling' && e.st < 0.25) { moving = true; e.dir.set(dx / d, 0, dz / d); speed = 12; }
      if (e.st > 0.35) { e.state = 'chase'; e.cd = t.cd; e.st = 0; }
    } else if (e.state === 'charge_wind') {
      e.yaw = Math.atan2(dx, dz);
      if (e.st > 0.9) { e.state = 'charge'; e.st = 0; e.dir.set(dx / d, 0, dz / d); }
    } else if (e.state === 'charge') {
      moving = true; speed = 15;
      if (d < 2.4) { if (hurt(t.dmg, e.pos.x, e.pos.z)) sfx.hurt(); e.state = 'chase'; e.cd = t.cd + 1; e.st = 0; }
      if (e.st > 1.3) { e.state = 'chase'; e.cd = t.cd; e.st = 0; }
    }
    // move, with separation from other ink
    if (moving) {
      let sx = 0, sz = 0;
      for (const o of ENEMIES) { if (o === e || !o.alive) continue; const ox = e.pos.x - o.pos.x, oz = e.pos.z - o.pos.z, od = Math.hypot(ox, oz), m = e.t.r + o.t.r + 0.3; if (od < m && od > 0.001) { sx += ox / od * (m - od); sz += oz / od * (m - od); } }
      const vx = e.dir.x * speed + sx * 3, vz = e.dir.z * speed + sz * 3;
      e.pos.x += vx * dt; e.pos.z += vz * dt;
      if (!e.fly) pushOut(e.pos, t.r, e.pos.y + 1.4, e.pos.y + t.height, res);
      e.phase += dt * speed * (e.type === 'blotling' ? 2.4 : 1.6);
      if (e.state !== 'charge_wind') e.yaw = Math.atan2(e.dir.x, e.dir.z);
    } else { e.phase += dt * 1.5; if (e.state === 'chase' || e.state === 'windup') e.yaw = Math.atan2(dx, dz); }
    // stuck: dive into the ink and come up nearer
    if (e.state === 'chase' && d > 6) { if (d > e.lastD - 0.05 * dt * speed) e.stuck += dt; else e.stuck = Math.max(0, e.stuck - dt); e.lastD = d; if (e.stuck > 3) { e.stuck = 0; const a = Math.random() * 6.28, r = 10 + Math.random() * 6; const nx = pp.x + Math.cos(a) * r, nz = pp.z + Math.sin(a) * r; emit('ink', e.pos.x, e.pos.y + 0.3, e.pos.z, 10, { speed: 3, up: 3, life: 0.7, size: 0.3, color: [0.08, 0.07, 0.12] }); e.pos.set(nx, groundY(nx, nz, 99), nz); e.state = 'rise'; e.st = 0; e.o.scale.set(1, 0.01, 1); } }
    // height
    const gy = groundY(e.pos.x, e.pos.z, e.pos.y);
    if (e.fly) { e.flyY += ((e.state === 'strike' ? 1.2 : e.fly + Math.sin(now * 2 + e.id) * 0.8) - e.flyY) * Math.min(1, dt * 3); e.pos.y = gy + e.flyY; }
    else e.pos.y += (gy - e.pos.y) * Math.min(1, dt * 14);
    // yaw smoothing, hit pop
    let dy = e.yaw - e.o.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); e.o.rotation.y += dy * Math.min(1, dt * 10);
    if (e.state !== 'rise') { const pop = 1 + e.hitT * 1.2; e.o.scale.set(pop, e.stagger > 0 ? 0.92 : pop, pop); }
    if (e.stagger > 0) e.o.rotation.z = Math.sin(now * 30) * 0.08; else e.o.rotation.z = 0;
    animate(e, dt, moving);
  }
  updateShots(dt);
}

// ---- ink projectiles ---------------------------------------------------------------------------------
const orbGeo = new THREE.SphereGeometry(0.32, 12, 8);
const orbMat = new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.2, emissive: 0x6a1038, emissiveIntensity: 0.6 }); orbMat.userData.noPaint = true;
export function lob(e, target, { speed = 16, big = 1, dmg = null } = {}) {
  const from = new THREE.Vector3(e.pos.x, e.pos.y + e.t.height * 0.85, e.pos.z);
  const to = new THREE.Vector3(target.x + P.vel.x * 0.4, target.y, target.z + P.vel.z * 0.4);
  const dx = to.x - from.x, dz = to.z - from.z, dh = Math.hypot(dx, dz), tt = Math.max(0.6, dh / speed);
  const g = 14, vy = (to.y - from.y + 0.5 * g * tt * tt) / tt;
  const m = new THREE.Mesh(orbGeo, orbMat); m.scale.setScalar(big); m.position.copy(from); scene.add(m);
  SHOTS.push({ m, v: new THREE.Vector3(dx / tt, vy, dz / tt), g, dmg: dmg ?? e.t.dmg, big, life: 6 });
}
function updateShots(dt) {
  for (let i = SHOTS.length - 1; i >= 0; i--) {
    const s = SHOTS[i]; s.life -= dt; s.v.y -= s.g * dt; s.m.position.addScaledVector(s.v, dt);
    if (Math.random() < 0.5) emit('ink', s.m.position.x, s.m.position.y, s.m.position.z, 1, { speed: 0.5, up: 0, life: 0.5, size: 0.22 * s.big, color: [0.1, 0.08, 0.14], grav: 2 });
    const p = s.m.position, gy = T.height(p.x, p.z);
    const pd = Math.hypot(p.x - P.pos.x, p.y - (P.pos.y + 1.0), p.z - P.pos.z);
    if (pd < 1.0 + 0.4 * s.big) { if (hurt(s.dmg, p.x, p.z)) sfx.hurt(); burst(s, i); continue; }
    if (p.y <= gy || s.life <= 0) { const gd = Math.hypot(p.x - P.pos.x, p.z - P.pos.z); if (gd < 2.2 * s.big && hurt(Math.round(s.dmg * 0.6), p.x, p.z)) sfx.hurt(); burst(s, i); }
  }
}
function burst(s, i) {
  const p = s.m.position; emit('ink', p.x, p.y + 0.2, p.z, 18, { speed: 5, up: 3, life: 0.7, size: 0.3, color: [0.08, 0.07, 0.12] });
  creep(p.x, p.z, 2.2 * s.big, 120); sfx.splat(); scene.remove(s.m); SHOTS.splice(i, 1);
}

export function clearEnemies(filter = () => true) {
  for (const e of ENEMIES) if (filter(e)) { e.alive = false; }
}
