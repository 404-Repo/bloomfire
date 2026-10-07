// First-person controller: walk, auto-mantle onto anything up to 1.7 m, dash, take damage.
import * as THREE from 'three';
import { pushOut, surfaceAt } from './collide.js';
import { HALF } from './layout.js';

export const EYE = 1.65, RADIUS = 0.42;
const SPEED = 7.2, ACCEL = 42, AIR_ACCEL = 10, GRAV = 24, STEP_UP = 0.5, MANTLE_MAX = 1.75;
const DASH_SPEED = 26, DASH_TIME = 0.2, DASH_RECHARGE = 1.6;

export const P = {
  pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, pitch: 0,
  onGround: true, hp: 100, maxHp: 100, alive: true,
  dashCharges: 2, dashT: 0, dashRecharge: 0, dashDir: new THREE.Vector3(), invuln: 0,
  mantle: null, bob: 0, landDip: 0, recoil: 0, kick: 0, speed: 0, travelled: 0,
  hurtT: 0, lastHurtDir: 0, inWater: false,
};
let T = null; let waterAt = () => -99;
export function initPlayer(terrain, waterFn) { T = terrain; waterAt = waterFn; }

const res = {};
export function placePlayer(x, z, yaw) {
  P.pos.set(x, T.height(x, z), z); P.vel.set(0, 0, 0); P.yaw = yaw; P.pitch = -0.04; P.mantle = null; P.onGround = true;
}

export function groundAt(x, z, feetY) { return surfaceAt(x, z, feetY + STEP_UP, T.height(x, z)); }

export function dash(mx, my) {
  if (P.dashCharges < 1 || P.dashT > 0 || !P.alive) return false;
  P.dashCharges -= 1; P.dashT = DASH_TIME; P.invuln = Math.max(P.invuln, DASH_TIME + 0.1);
  let fx = mx, fz = -my; if (Math.hypot(fx, fz) < 0.2) { fx = 0; fz = -1; }
  const l = Math.hypot(fx, fz); fx /= l; fz /= l;
  const c = Math.cos(P.yaw), s = Math.sin(P.yaw);
  P.dashDir.set(fx * c + fz * s, 0, -fx * s + fz * c);
  return true;
}

export function updatePlayer(dt, mx, my) {
  P.invuln = Math.max(0, P.invuln - dt); P.hurtT = Math.max(0, P.hurtT - dt);
  if (P.dashCharges < 2) { P.dashRecharge += dt; if (P.dashRecharge >= DASH_RECHARGE) { P.dashRecharge = 0; P.dashCharges += 1; } }
  const p = P.pos;
  if (P.mantle) {   // climbing onto a ledge
    const m = P.mantle; m.t += dt / m.dur; const t = Math.min(1, m.t), e = t * t * (3 - 2 * t);
    p.y = m.y0 + (m.y1 - m.y0) * Math.min(1, e * 1.4); p.x = m.x0 + (m.x1 - m.x0) * e; p.z = m.z0 + (m.z1 - m.z0) * e;
    if (t >= 1) { P.mantle = null; P.vel.set(0, 0, 0); P.landDip = 0.12; }
    return;
  }
  // wish direction from the stick, rotated by yaw (yaw 0 looks along -z)
  const c = Math.cos(P.yaw), s = Math.sin(P.yaw);
  const fx = mx, fz = -my;
  const wx = (fx * c + fz * s) * SPEED, wz = (-fx * s + fz * c) * SPEED;
  const water = waterAt(p.x, p.z); P.inWater = water > p.y + 0.4;
  const slow = P.inWater ? 0.6 : 1;
  if (P.dashT > 0) {
    P.dashT -= dt; P.vel.x = P.dashDir.x * DASH_SPEED; P.vel.z = P.dashDir.z * DASH_SPEED;
  } else {
    const a = (P.onGround ? ACCEL : AIR_ACCEL) * dt;
    P.vel.x += THREE.MathUtils.clamp(wx * slow - P.vel.x, -a, a); P.vel.z += THREE.MathUtils.clamp(wz * slow - P.vel.z, -a, a);
  }
  const ox = p.x, oz = p.z;
  p.x += P.vel.x * dt; p.z += P.vel.z * dt;
  // walls
  pushOut(p, RADIUS, p.y + STEP_UP, p.y + 1.8, res);
  if (res.blockTop !== null && P.onGround && Math.hypot(wx, wz) > 1 && P.dashT <= 0) {
    const rise = res.blockTop - p.y;
    // pushing into a ledge we can climb: mantle onto it
    const into = -(res.nx * wx + res.nz * wz) / SPEED;
    if (rise > STEP_UP && rise <= MANTLE_MAX && into > 0.5) {
      const tx = p.x - res.nx * 0.9, tz = p.z - res.nz * 0.9;
      const top = surfaceAt(tx, tz, res.blockTop + 0.05, T.height(tx, tz));
      if (top > p.y + STEP_UP - 0.01 && top - p.y <= MANTLE_MAX) P.mantle = { t: 0, dur: 0.18 + rise * 0.12, y0: p.y, y1: top, x0: p.x, z0: p.z, x1: tx, z1: tz };
    }
  }
  // the edge of the world
  const lim = HALF - 18; p.x = THREE.MathUtils.clamp(p.x, -lim, lim); p.z = THREE.MathUtils.clamp(p.z, -lim, lim);
  // ground, gravity, slopes too steep to walk up push you back
  const g = groundAt(p.x, p.z, p.y);
  const ng = T.normal(p.x, p.z);
  if (ng[1] < 0.62 && g > p.y + 0.05 && g === T.height(p.x, p.z)) { p.x = ox; p.z = oz; P.vel.x *= 0.3; P.vel.z *= 0.3; }
  const g2 = groundAt(p.x, p.z, p.y);
  if (p.y <= g2 + 0.06 || (P.onGround && p.y - g2 < 0.7 && P.vel.y <= 0)) {
    if (!P.onGround && P.vel.y < -6) P.landDip = Math.min(0.25, -P.vel.y * 0.015);
    p.y = g2; P.vel.y = 0; P.onGround = true;
  } else {
    P.onGround = false; P.vel.y -= GRAV * dt; p.y += P.vel.y * dt; if (p.y < g2) { p.y = g2; P.vel.y = 0; P.onGround = true; }
  }
  const moved = Math.hypot(p.x - ox, p.z - oz);
  P.travelled += moved; P.speed = moved / Math.max(dt, 1e-4);
  P.bob += P.speed * dt * (P.onGround ? 1.25 : 0);
  P.landDip *= Math.exp(-dt * 7);
}

export function hurt(amount, fromX, fromZ) {
  if (P.invuln > 0 || !P.alive) return false;
  P.hp = Math.max(0, P.hp - amount); P.hurtT = 0.5; P.invuln = 0.25;
  P.lastHurtDir = Math.atan2(fromX - P.pos.x, fromZ - P.pos.z);
  if (P.hp <= 0) P.alive = false;
  return true;
}
export function heal(n) { P.hp = Math.min(P.maxHp, P.hp + n); }

export function applyCamera(cam, dt) {
  const bob = Math.sin(P.bob * 2.0) * 0.045 * Math.min(1, P.speed / 6), sway = Math.cos(P.bob) * 0.03 * Math.min(1, P.speed / 6);
  cam.position.set(P.pos.x, P.pos.y + EYE + bob - P.landDip - (P.mantle ? 0.15 : 0), P.pos.z);
  P.kick *= Math.exp(-dt * 14);
  cam.rotation.set(P.pitch + P.kick, P.yaw, sway * 0.04 + (P.dashT > 0 ? 0.0 : 0));
}
