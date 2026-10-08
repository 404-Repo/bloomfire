// Touch (floating stick, drag to look, buttons) and desktop (WASD, pointer-locked mouse) in one state.
export const IN = {
  mx: 0, my: 0,            // move: strafe right +, forward +
  lookX: 0, lookY: 0,      // accumulated look in radians since last read
  fire: false, dash: false, bloom: false,  // fire is held; dash and bloom are edges (cleared on read)
  touched: false, lastTouchLook: 0, stickActive: false, lookActive: false,
  sens: 1, enabled: false,
};
const keys = new Set();
const TOUCH_SENS = 0.0047, MOUSE_SENS = 0.0022;

export function readLook() { const x = IN.lookX, y = IN.lookY; IN.lookX = 0; IN.lookY = 0; return [x, y]; }
export function takeDash() { const d = IN.dash; IN.dash = false; return d; }
export function takeBloom() { const b = IN.bloom; IN.bloom = false; return b; }

// ---- touch ----------------------------------------------------------------------------------------
const touchEl = document.getElementById('touch');
const stickEl = document.getElementById('stick'), stickB = document.getElementById('stickb'), stickK = document.getElementById('stickk');
const fireB = document.getElementById('bfire');
const owners = new Map();   // touch id -> { kind, x0, y0, x, y }
const R = 52;

function inRect(el, x, y) { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
function placeStick(x, y) {
  const r = stickEl.getBoundingClientRect();
  stickB.style.left = (x - r.left) + 'px'; stickB.style.bottom = (r.bottom - y) + 'px';
}
function resetStick() { stickB.style.left = ''; stickB.style.bottom = ''; stickK.style.transform = ''; }

touchEl.addEventListener('touchstart', (e) => {
  if (e.cancelable) e.preventDefault(); IN.touched = true;
  for (const t of e.changedTouches) {
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const btn = el && el.closest && el.closest('.tb');
    if (btn) {
      owners.set(t.identifier, { kind: btn.id });
      if (btn.id === 'bfire') { IN.fire = true; fireB.classList.add('on'); }
      else if (btn.id === 'bdash') IN.dash = true;
      else if (btn.id === 'bbloom') IN.bloom = true;
      continue;
    }
    const hasStick = [...owners.values()].some((o) => o.kind === 'stick');
    if (!hasStick && inRect(stickEl, t.clientX, t.clientY)) {
      owners.set(t.identifier, { kind: 'stick', x0: t.clientX, y0: t.clientY });
      placeStick(t.clientX, t.clientY); IN.stickActive = true;
    } else {
      owners.set(t.identifier, { kind: 'look', x: t.clientX, y: t.clientY }); IN.lookActive = true;
    }
  }
}, { passive: false });
touchEl.addEventListener('touchmove', (e) => {
  if (e.cancelable) e.preventDefault();
  for (const t of e.changedTouches) {
    const o = owners.get(t.identifier); if (!o) continue;
    if (o.kind === 'stick') {
      let dx = (t.clientX - o.x0) / R, dy = (t.clientY - o.y0) / R; const l = Math.hypot(dx, dy);
      if (l > 1) { dx /= l; dy /= l; }
      IN.mx = dx; IN.my = -dy;
      stickK.style.transform = `translate(${dx * R * 0.8}px, ${dy * R * 0.8}px)`;
    } else if (o.kind === 'look') {
      const dx = t.clientX - o.x, dy = t.clientY - o.y; o.x = t.clientX; o.y = t.clientY;
      // a little acceleration: slow drags stay precise, fast flicks turn far
      const sp = Math.hypot(dx, dy), acc = 1 + Math.min(1.2, Math.max(0, sp - 6) * 0.045);
      IN.lookX += dx * TOUCH_SENS * acc * IN.sens; IN.lookY += dy * TOUCH_SENS * 0.8 * acc * IN.sens;
      IN.lastTouchLook = performance.now();
    }
  }
}, { passive: false });
function endTouch(e) {
  if (e.cancelable) e.preventDefault();
  for (const t of e.changedTouches) {
    const o = owners.get(t.identifier); if (!o) continue;
    owners.delete(t.identifier);
    if (o.kind === 'stick') { IN.mx = 0; IN.my = 0; IN.stickActive = false; resetStick(); }
    else if (o.kind === 'bfire') { IN.fire = false; fireB.classList.remove('on'); }
    else if (o.kind === 'look') IN.lookActive = [...owners.values()].some((q) => q.kind === 'look');
  }
}
touchEl.addEventListener('touchend', endTouch, { passive: false });
touchEl.addEventListener('touchcancel', endTouch, { passive: false });

// ---- desktop --------------------------------------------------------------------------------------
const canvas = document.getElementById('c');
addEventListener('keydown', (e) => {
  if (e.repeat) return; keys.add(e.code);
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') IN.dash = true;
  if (e.code === 'KeyE' || e.code === 'KeyQ') IN.bloom = true;
  syncKeys();
});
addEventListener('keyup', (e) => { keys.delete(e.code); syncKeys(); });
addEventListener('blur', () => { keys.clear(); syncKeys(); IN.fire = false; });
function syncKeys() {
  if (IN.stickActive) return;
  IN.mx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
  IN.my = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  const l = Math.hypot(IN.mx, IN.my); if (l > 1) { IN.mx /= l; IN.my /= l; }
}
canvas.addEventListener('mousedown', (e) => {
  if (!IN.enabled) return;
  if (document.pointerLockElement !== canvas) { canvas.requestPointerLock?.(); }
  if (e.button === 0) IN.fire = true;
  if (e.button === 2) IN.bloom = true;
});
addEventListener('mouseup', (e) => { if (e.button === 0) IN.fire = false; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  IN.lookX += e.movementX * MOUSE_SENS * IN.sens; IN.lookY += e.movementY * MOUSE_SENS * IN.sens;
});
export const hasPointerLock = () => document.pointerLockElement === canvas;
