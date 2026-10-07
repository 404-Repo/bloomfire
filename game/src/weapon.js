// The prism rifle: viewmodel, hitscan sunlight, aim assist with auto-fire on touch, lenses, BLOOM.
import * as THREE from 'three';
import { ASSET } from '../assetlib.js';
import { camera, vmScene, isTouch, post } from './render.js';
import { rayColliders } from './collide.js';
import { tracer, emit } from './fx.js';
import { P } from './player.js';
import { sfx } from './audio.js';

export const WPN = {
  lenses: [], rate: 9, heat: 0, fireT: 0, shots: 0, shotIdx: 0, lock: null, lockAngle: 99,
  bloom: 0, assist: true, firing: false, vm: null, muzzle: null, prism: null, kick: 0, swayX: 0, swayY: 0,
};
let T = null, targetsFn = () => [], onHit = () => {};
const RANGE = 120;

export async function initWeapon(terrain, have, targets, hitCb) {
  T = terrain; targetsFn = targets; onHit = hitCb;
  const holder = new THREE.Group(); vmScene.add(holder); WPN.vm = holder;
  let gun;
  if (have.has('prism_rifle')) {
    gun = await ASSET('./assets/prism_rifle.js', { keepHierarchy: true });
    const size = new THREE.Box3().setFromObject(gun).getSize(new THREE.Vector3());
    const L = Math.max(size.x, size.z); gun.scale.multiplyScalar(0.72 / L);
    WPN.prism = gun.userData.joints?.prism || null; WPN.muzzleNode = gun.userData.joints?.muzzle || null;
    gun.traverse((o) => { if (o.material && o.material.name === 'prism') { o.material = o.material.clone(); WPN.prismMat = o.material; } });
  } else {
    gun = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.8), new THREE.MeshStandardMaterial({ color: 0xb8913a, metalness: 0.8, roughness: 0.35 }));
  }
  gun.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  // the asset is built along -Z (muzzle away from the eye) with its base at y=0
  gun.position.set(0, -0.06, -0.17); gun.rotation.y = 0.12;
  holder.add(gun);
  const flash = new THREE.PointLight(0xffc070, 0, 6, 2); flash.position.set(0, 0.1, -0.9); holder.add(flash); WPN.flash = flash;
  layoutViewmodel();
}
export function layoutViewmodel() {
  const portrait = innerHeight > innerWidth;
  WPN.base = portrait ? new THREE.Vector3(0.12, -0.21, -0.44) : new THREE.Vector3(0.22, -0.2, -0.44);
}

const _o = new THREE.Vector3(), _d = new THREE.Vector3(), _t = new THREE.Vector3(), _c = new THREE.Vector3();
// Ray against the ground: march then bisect.
function rayGround(o, d, maxT) {
  let prev = 0, step = 1.2;
  for (let t = step; t < maxT; t += step) {
    const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
    if (y < T.height(x, z)) { let a = prev, b = t; for (let k = 0; k < 6; k++) { const m = (a + b) / 2; if (o.y + d.y * m < T.height(o.x + d.x * m, o.z + d.z * m)) b = m; else a = m; } return b; }
    prev = t; if (t > 30) step = 2.5;
  }
  return Infinity;
}
export function worldRay(o, d, maxT) { return Math.min(rayGround(o, d, maxT), rayColliders(o, d, maxT)); }

// The best target near the crosshair: smallest angle, in range, in sight.
function findLock() {
  camera.getWorldDirection(_d); _o.copy(camera.position);
  const cone = THREE.MathUtils.degToRad(isTouch ? 9 : 3.2);
  let best = null, bestA = cone;
  for (const tg of targetsFn()) {
    _t.copy(tg.pos).sub(_o); const dist = _t.length(); if (dist > RANGE || dist < 0.5) continue;
    _t.divideScalar(dist);
    const ang = Math.acos(THREE.MathUtils.clamp(_t.dot(_d), -1, 1)) - Math.atan(tg.r / dist) * 0.8;
    if (ang < bestA) {
      if (worldRay(_o, _t, dist - tg.r) < dist - tg.r - 0.3) continue;   // something in the way
      best = tg; bestA = ang;
    }
  }
  WPN.lockAngle = best ? bestA : 99;
  return best;
}

// Aim assist: slow the look over a target and pull gently toward it while the player is aiming or moving.
export function assistLook(lx, ly, dt, moving) {
  if (!WPN.assist) return [lx, ly];
  const lock = WPN.lock; if (!lock) return [lx, ly];
  const friction = isTouch ? 0.55 : 0.8;
  lx *= friction; ly *= friction;
  const active = Math.abs(lx) + Math.abs(ly) > 0.0005 || moving;
  if (active || isTouch) {
    _t.copy(lock.pos).sub(camera.position).normalize();
    const wantYaw = Math.atan2(-_t.x, -_t.z), wantPitch = Math.asin(THREE.MathUtils.clamp(_t.y, -1, 1));
    let dy = wantYaw - P.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const dp = wantPitch - P.pitch;
    const rate = (isTouch ? (active ? 2.6 : 0.9) : 1.2) * dt;
    lx -= THREE.MathUtils.clamp(dy, -rate, rate); ly -= THREE.MathUtils.clamp(dp, -rate, rate);
  }
  return [lx, ly];
}

export function updateWeapon(dt, wantFire, now) {
  WPN.fireT -= dt; WPN.kick *= Math.exp(-dt * 16);
  WPN.lock = findLock();
  const auto = isTouch && WPN.assist && WPN.lock && WPN.lockAngle < THREE.MathUtils.degToRad(5.5);
  WPN.firing = (wantFire || auto) && P.alive;
  const rate = WPN.rate * (WPN.lenses.includes('rapid') ? 1.4 : 1);
  while (WPN.firing && WPN.fireT <= 0) { WPN.fireT += 1 / rate; fire(); }
  if (WPN.fireT < 0) WPN.fireT = 0;
  // viewmodel: bob, sway, recoil
  const v = WPN.vm; if (!v) return;
  const b = WPN.base, bob = Math.sin(P.bob * 2.0) * 0.012 * Math.min(1, P.speed / 6), bob2 = Math.abs(Math.cos(P.bob)) * 0.01 * Math.min(1, P.speed / 6);
  v.position.set(b.x + bob + WPN.swayX, b.y - bob2 + WPN.swayY + P.landDip * 0.2, b.z + WPN.kick * 0.09);
  v.rotation.set(WPN.kick * 0.18, WPN.swayX * -1.2, 0);
  WPN.swayX *= Math.exp(-dt * 8); WPN.swayY *= Math.exp(-dt * 8);
  if (WPN.prism) WPN.prism.rotation.z += dt * (2 + WPN.bloom * 8);
  if (WPN.prismMat) WPN.prismMat.emissiveIntensity = 0.9 + WPN.bloom * 2.5 + (WPN.firing ? 1.5 : 0);
  WPN.flash.intensity *= Math.exp(-dt * 30);
}
export function swayFromLook(lx, ly) { WPN.swayX = THREE.MathUtils.clamp(WPN.swayX - lx * 0.08, -0.04, 0.04); WPN.swayY = THREE.MathUtils.clamp(WPN.swayY + ly * 0.06, -0.03, 0.03); }

function muzzleWorld(out) {
  // the muzzle as seen by the world camera: below-right of the eye, forward
  // where the beam starts in the world: a little ahead of the muzzle, so the near end of the beam is not a wedge across the screen
  out.set(isTouch && innerHeight > innerWidth ? 0.1 : 0.16, -0.13, -2.4).applyQuaternion(camera.quaternion).add(camera.position);
  return out;
}

function fire() {
  WPN.shots++; WPN.shotIdx++; WPN.kick = 1; P.kick = Math.min(P.kick + 0.006, 0.02);
  WPN.flash.intensity = 6; sfx.shot();
  camera.getWorldDirection(_d); _o.copy(camera.position);
  const split = WPN.lenses.includes('split') && WPN.shotIdx % 3 === 0;
  const dirs = [_d.clone()];
  if (split) { const r = new THREE.Vector3().crossVectors(_d, camera.up).normalize(); dirs.push(_d.clone().addScaledVector(r, 0.06).normalize(), _d.clone().addScaledVector(r, -0.06).normalize()); }
  dirs.forEach((dir, k) => shoot(_o, dir, k === 0));
}

const SPREAD = 0.006;
function shoot(o, dir, primary) {
  const d = dir.clone(); d.x += (Math.random() - 0.5) * SPREAD; d.y += (Math.random() - 0.5) * SPREAD; d.z += (Math.random() - 0.5) * SPREAD; d.normalize();
  // bullet magnetism: a locked target close to the crosshair takes the shot
  let hit = null, hitT = Infinity;
  const tgs = targetsFn();
  for (const tg of tgs) {
    _t.copy(tg.pos).sub(o); const proj = _t.dot(d); if (proj < 0 || proj > RANGE) continue;
    _c.copy(o).addScaledVector(d, proj); const miss = _c.distanceTo(tg.pos);
    if (miss < tg.r && proj < hitT) { hit = tg; hitT = proj; }
  }
  if (primary && !hit && WPN.lock && WPN.assist && WPN.lockAngle < THREE.MathUtils.degToRad(isTouch ? 4.5 : 1.6)) { hit = WPN.lock; hitT = WPN.lock.pos.distanceTo(o); d.copy(WPN.lock.pos).sub(o).normalize(); }
  const wall = worldRay(o, d, Math.min(hitT, RANGE));
  const from = muzzleWorld(new THREE.Vector3());
  if (hit && wall >= hitT - 0.2) {
    const p = o.clone().addScaledVector(d, hitT);
    tracer(from, p);
    emit('add', p.x, p.y, p.z, 5, { speed: 5, up: 1, life: 0.25, size: 0.12, color: hit.core ? [1.6, 0.4, 0.9] : [1.4, 1.0, 0.5], grav: 6 });
    onHit(hit, p, hitT);
  } else {
    const t = Math.min(wall, RANGE); const p = o.clone().addScaledVector(d, t);
    tracer(from, p);
    if (t < RANGE) emit('add', p.x, p.y, p.z, 3, { speed: 3, up: 1, life: 0.2, size: 0.1, color: [1.2, 0.9, 0.5], grav: 6 });
  }
}

// Arc lens: a kill sends a bolt to the nearest other target.
export function arcFrom(pos, exclude) {
  let best = null, bd = 9;
  for (const tg of targetsFn()) { if (tg.ent === exclude) continue; const d = tg.pos.distanceTo(pos); if (d < bd) { bd = d; best = tg; } }
  if (best) { tracer(pos, best.pos, 0.05, [1.2, 1.4, 2.0]); onHit(best, best.pos.clone(), 0, { arc: true }); }
}
