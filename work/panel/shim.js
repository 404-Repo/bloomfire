// Injected before any game script (evaluateOnNewDocument). Two jobs:
// 1. A virtual clock. performance.now, Date.now, requestAnimationFrame, setTimeout and setInterval only advance
//    when the harness calls __PANEL__.step(frames). The game is frozen while the tester agent thinks, so a slow
//    agent is not punished in game time. AudioContext.currentTime is NOT virtualised (it stays real).
// 2. A sound log. Every WebAudio source start, oscillator pitch, buffer name and HTMLAudio play is recorded with
//    game time, so a tester that cannot hear gets a text account of what a player would hear.
(() => {
  if (window.__PANEL__) return;
  const W = window, realPerfNow = performance.now.bind(performance), realDateNow = Date.now;
  const realRAF = W.requestAnimationFrame.bind(W), realST = W.setTimeout.bind(W), realCT = W.clearTimeout.bind(W);
  const dateBase = realDateNow();
  let vt = realPerfNow(); // virtual ms, starts at the real value so pre-arm deltas are sane
  const FRAME = 1000 / 60;
  let rafQ = [], rafId = 1, timers = new Map(), timerId = 1, frames = 0;
  const audio = []; // {t, kind, ...}
  const cons = [];
  const P = (W.__PANEL__ = { audio, cons, get t() { return vt; }, get frames() { return frames; }, ctxs: [] });

  // each read nudges the clock by 1 microsecond, so a busy-wait loop ("spin until 5 ms passed") ends instead of
  // freezing the page; the nudge is discarded at the next frame (vfloor), so it never accumulates
  let vfloor = vt;
  const REAL = !!W.__PANEL_REALTIME__; // diagnostic mode: real clock, sound log only
  if (REAL) { const tick = () => { vt = realPerfNow(); vfloor = vt; realRAF(tick); }; realRAF(tick); } else {
  performance.now = () => (vt += 0.001);
  Date.now = () => Math.floor(dateBase + (vt += 0.001));
  try { Object.defineProperty(Event.prototype, 'timeStamp', { get() { return vt; }, configurable: true }); } catch (e) {}
  W.requestAnimationFrame = (cb) => { const id = rafId++; rafQ.push({ id, cb }); return id; };
  W.cancelAnimationFrame = (id) => { rafQ = rafQ.filter((r) => r.id !== id); };
  W.webkitRequestAnimationFrame = W.requestAnimationFrame;
  W.setTimeout = (fn, ms, ...a) => { const id = timerId++; timers.set(id, { fn, at: vt + Math.max(0, +ms || 0), a, every: 0 }); return id; };
  W.setInterval = (fn, ms, ...a) => { const id = timerId++; const every = Math.max(4, +ms || 0); timers.set(id, { fn, at: vt + every, a, every }); return id; };
  W.clearTimeout = W.clearInterval = (id) => { timers.delete(id); };
  }
  const runTimers = () => {
    for (let guard = 0; guard < 500; guard++) {
      let best = null;
      for (const [id, tm] of timers) if (tm.at <= vt && (!best || tm.at < best[1].at)) best = [id, tm];
      if (!best) return;
      const [id, tm] = best;
      if (tm.every) tm.at += tm.every; else timers.delete(id);
      try { typeof tm.fn === 'function' ? tm.fn(...tm.a) : (0, eval)(tm.fn); } catch (e) { cons.push({ t: vt, type: 'pageerror', text: String(e && e.stack || e).slice(0, 300) }); }
    }
  };
  P.step = (k = 1) => {
    if (REAL) return vt;
    for (let i = 0; i < k; i++) {
      vfloor += FRAME; vt = vfloor; frames++;
      runTimers();
      const q = rafQ; rafQ = [];
      for (const r of q) { try { r.cb(vt); } catch (e) { cons.push({ t: vt, type: 'pageerror', text: String(e && e.stack || e).slice(0, 300) }); } }
    }
    return vt;
  };
  P.realFrame = () => new Promise((r) => realRAF(() => realRAF(r))); // judge_final: wait for two real compositor frames before a capture
  P.pending = () => ({ raf: rafQ.length, timers: timers.size });

  // ---------- sound log ----------
  const rec = (o) => { o.t = vt; audio.push(o); if (audio.length > 20000) audio.splice(0, 5000); return o; };
  let srcId = 0; const bufName = new WeakMap(), abName = new WeakMap(), oscOf = new WeakMap(), srcRec = new WeakMap();
  const base = (u) => { try { return decodeURIComponent(String(u).split('?')[0].split('/').pop()) || 'audio'; } catch (e) { return 'audio'; } };
  // remember which URL an ArrayBuffer came from, so decoded buffers carry a file name
  const rArr = Response.prototype.arrayBuffer;
  Response.prototype.arrayBuffer = function () { const u = this.url; return rArr.call(this).then((ab) => { try { abName.set(ab, base(u)); } catch (e) {} return ab; }); };
  const xo = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) { this.__u = u; return xo.apply(this, arguments); };
  const xr = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
  if (xr && xr.get) Object.defineProperty(XMLHttpRequest.prototype, 'response', { get() { const r = xr.get.call(this); try { if (r instanceof ArrayBuffer) abName.set(r, base(this.__u)); } catch (e) {} return r; }, configurable: true });

  const AC = W.AudioContext || W.webkitAudioContext;
  if (AC) {
    const BAC = W.BaseAudioContext ? W.BaseAudioContext.prototype : AC.prototype;
    const dec = BAC.decodeAudioData;
    BAC.decodeAudioData = function (ab, ok, bad) {
      const nm = abName.get(ab) || 'decoded audio';
      const wrapOk = ok ? (b) => { bufName.set(b, nm); ok(b); } : ok;
      const pr = ok || bad ? dec.call(this, ab, wrapOk, bad) : dec.call(this, ab);
      return pr && pr.then ? pr.then((b) => { bufName.set(b, nm); rec({ kind: 'decode', name: nm, len: +b.duration.toFixed(2) }); return b; }, (e) => { rec({ kind: 'decode', name: nm, err: String(e) }); throw e; }) : pr;
    };
    const cb = BAC.createBuffer;
    BAC.createBuffer = function () { const b = cb.apply(this, arguments); bufName.set(b, 'procedural buffer'); return b; };
    const co = BAC.createOscillator;
    BAC.createOscillator = function () { const o = co.apply(this, arguments); oscOf.set(o.frequency, o); return o; };
    // v2: the audio clock follows the virtual clock too, so a music scheduler sees the same time as the game and
    // notes scheduled ahead land at the right game moment (v1 left it real, which bunched music into bursts)
    const ctBase = new WeakMap();
    const ctDesc = Object.getOwnPropertyDescriptor(BAC, 'currentTime');
    if (!REAL && ctDesc && ctDesc.get) Object.defineProperty(BAC, 'currentTime', { configurable: true, get() {
      if (typeof OfflineAudioContext !== 'undefined' && this instanceof OfflineAudioContext) return ctDesc.get.call(this);
      let b = ctBase.get(this); if (!b) { b = { v0: vfloor, c0: ctDesc.get.call(this) }; ctBase.set(this, b); }
      return b.c0 + (vfloor - b.v0) / 1000; } });
    const ctxSeen = new WeakSet();
    const note = (ctx) => { if (ctx && !ctxSeen.has(ctx)) { ctxSeen.add(ctx); P.ctxs.push(ctx); rec({ kind: 'ctx', state: ctx.state }); try { ctx.addEventListener('statechange', () => rec({ kind: 'ctx', state: ctx.state })); } catch (e) {} } };
    if (W.OscillatorNode) {
      const OC = W.OscillatorNode;
      W.OscillatorNode = function (ctx, opt) { const o = new OC(ctx, opt); oscOf.set(o.frequency, o); return o; };
      W.OscillatorNode.prototype = OC.prototype;
    }
    const S = (W.AudioScheduledSourceNode || {}).prototype;
    // AudioBufferSourceNode has its OWN start(), so every prototype that defines start is wrapped; a guard stops double logs
    const wrapStart = (proto) => {
      if (!proto || !Object.prototype.hasOwnProperty.call(proto, 'start')) return;
      const st = proto.start;
      proto.start = function (when = 0, offset, dur) {
        if (!srcRec.has(this)) {
          const ctx = this.context; note(ctx);
          const ahead = ctx ? Math.max(0, (when || 0) - ctx.currentTime) : 0;
          let o;
          if (this instanceof OscProto) { o = { kind: 'osc', wave: this.type, f0: this.__f0 !== undefined ? this.__f0 : this.frequency.value, f1: this.__f1 !== undefined ? this.__f1 : null, ahead, dur: null, when: when || 0 }; }
          else if (this instanceof AudioBufferSourceNode) o = { kind: 'buf', name: this.buffer ? bufName.get(this.buffer) || 'buffer' : 'buffer', len: this.buffer ? +this.buffer.duration.toFixed(2) : null, loop: this.loop, rate: +this.playbackRate.value.toFixed(3), ahead, dur: dur || null };
          else o = { kind: 'src', node: this.constructor.name, ahead };
          o.ctxState = ctx ? ctx.state : '?'; o.id = ++srcId;
          rec(o); o.t = vt + ahead * 1000; srcRec.set(this, o);
          try { this.addEventListener('ended', () => { if (o.loop || (o.len || 0) >= 6) rec({ kind: 'stop', id: o.id, name: o.name }); }); } catch (e) {}
        }
        return st.apply(this, arguments);
      };
    };
    const OscProto = W.OscillatorNode ? W.OscillatorNode.prototype.constructor : function () {};
    wrapStart(S); if (W.AudioBufferSourceNode) wrapStart(AudioBufferSourceNode.prototype); if (W.OscillatorNode) wrapStart(OscProto.prototype); if (W.ConstantSourceNode) wrapStart(ConstantSourceNode.prototype);
    if (S) {
      const sp = S.stop;
      S.stop = function (when = 0) { const o = srcRec.get(this); if (o && (o.loop || (o.len || 0) >= 6)) rec({ kind: 'stop', id: o.id, name: o.name }); if (o && o.dur === null && this.context) { const w0 = o.when || 0; o.dur = +Math.max(0, (when || this.context.currentTime) - Math.max(w0, this.context.currentTime)).toFixed(2); } return sp.apply(this, arguments); };
    }
    const AP = AudioParam.prototype;
    for (const m of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime']) {
      const f = AP[m];
      AP[m] = function (v) { const o = oscOf.get(this); if (o) { const r = srcRec.get(o); if (r) r.f1 = v; else if (m === 'setValueAtTime' && o.__f0 === undefined) o.__f0 = v; else o.__f1 = v; } return f.apply(this, arguments); };
    }
    const Wr = (Ctor) => { if (!Ctor) return Ctor; const N = function (...a) { const c = new Ctor(...a); note(c); return c; }; N.prototype = Ctor.prototype; return N; };
    if (W.AudioContext) W.AudioContext = Wr(W.AudioContext);
    if (W.webkitAudioContext) W.webkitAudioContext = Wr(W.webkitAudioContext);
  }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!this.__pid) { this.__pid = ++srcId; this.addEventListener('ended', () => rec({ kind: 'stop', id: this.__pid, name: base(this.currentSrc || this.src) })); }
    if (this.paused) rec({ kind: 'media', id: this.__pid, name: base(this.currentSrc || this.src), loop: this.loop, vol: +this.volume.toFixed(2), muted: this.muted, len: isFinite(this.duration) ? +this.duration.toFixed(1) : null, rate: this.playbackRate });
    const pr = play.apply(this, arguments);
    if (pr && pr.catch) pr.catch((e) => rec({ kind: 'media_blocked', name: base(this.currentSrc || this.src), err: String(e && e.name) }));
    return pr;
  };
  const pause = HTMLMediaElement.prototype.pause;
  HTMLMediaElement.prototype.pause = function () { if (!this.paused) rec({ kind: 'stop', id: this.__pid, name: base(this.currentSrc || this.src) }); return pause.apply(this, arguments); };
  if (W.navigator && W.navigator.vibrate) { const vb = W.navigator.vibrate.bind(W.navigator); W.navigator.vibrate = (p) => { rec({ kind: 'vibrate', p: JSON.stringify(p) }); try { return vb(p); } catch (e) { return false; } }; }
})();
