// =============================================
//  四ツ目のダルマ  音（効果音と祭囃子ふうの音楽。ファイル不要、その場で鳴らす）
//  進行には一切かかわらない。
// =============================================
(function () {
  const Sound = DG.Sound = {
    ctx: null, on: true, out: null, sfx: null, mus: null, noise: null,
    playing: false, beat: 0, nextT: 0, timer: null, hot: false, quiet: 1,
    init() {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
        this.build(this.ctx);
      }
      try { if (navigator.audioSession) navigator.audioSession.type = 'ambient'; } catch (e) {}
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (this.on && this.wantMusic) this.music(true);
    },
    // 鳴らす道具を組む（PVの音を書き出すときにも同じものを使う）
    build(ctx) {
      this.ctx = ctx;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.2;
      this.out = ctx.createGain(); this.out.gain.value = 0.9; this.out.connect(comp); comp.connect(ctx.destination);
      this.sfx = ctx.createGain(); this.sfx.gain.value = 1; this.sfx.connect(this.out);
      this.mus = ctx.createGain(); this.mus.gain.value = 0.0001; this.mus.connect(this.out);
      const n = ctx.sampleRate * 1.5, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      let s = 1234567; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; }
      this.noise = b;
    },
    ok() { return this.on && this.ctx; },
    // ---- 部品 ----
    osc(f, d, type, v, o) {
      o = o || {}; const ctx = this.ctx, t = ctx.currentTime + (o.at || 0), os = ctx.createOscillator(), g = ctx.createGain();
      os.type = type || 'sine'; os.frequency.setValueAtTime(f, t);
      if (o.to) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + (o.toT || d));
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      os.connect(g); g.connect(o.bus || this.sfx); os.start(t); os.stop(t + d + 0.03);
    },
    nz(d, v, o) {
      o = o || {}; const ctx = this.ctx, t = ctx.currentTime + (o.at || 0), src = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      src.buffer = this.noise; src.loop = true; f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1000, t); f.Q.value = o.q || 1;
      if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      src.connect(f); f.connect(g); g.connect(o.bus || this.sfx); src.start(t, (o.off || 0) % 1.4); src.stop(t + d + 0.03);
    },
    // 木をたたく音
    wood(f, v, at, bus, d) {
      d = d || 0.09;
      this.osc(f, d, 'sine', v, { at, bus, to: f * 0.93 }); this.osc(f * 2.76, d * 0.55, 'sine', v * 0.35, { at, bus });
      this.nz(d * 0.5, v * 0.7, { at, bus, f: f * 2.2, q: 2.5 }); this.nz(0.012, v * 0.6, { at, bus, f: 5200, q: 0.7 });
    },
    bell(f, v, at, bus, d) { d = d || 0.5; for (const [m, a] of [[1, 1], [2.76, 0.45], [5.4, 0.22], [8.93, 0.1]]) this.osc(f * m, d / (0.6 + m * 0.4), 'sine', v * a, { at, bus }); },
    taiko(v, at, bus, f) { f = f || 62; this.osc(f * 2.3, 0.34, 'sine', v, { at, bus, to: f, toT: 0.08, a: 0.003 }); this.nz(0.08, v * 0.5, { at, bus, f: 240, q: 0.8, type: 'lowpass' }); },
    shime(v, at, bus) { this.osc(330, 0.07, 'triangle', v * 0.7, { at, bus, to: 250 }); this.nz(0.05, v, { at, bus, f: 1500, q: 1.2 }); },
    kane(v, at, bus, damp) { const d = damp ? 0.06 : 0.22; this.osc(2093, d, 'square', v * 0.16, { at, bus }); this.osc(3136, d * 0.8, 'sine', v * 0.5, { at, bus }); this.osc(4410, d * 0.6, 'sine', v * 0.32, { at, bus }); this.osc(5870, d * 0.4, 'sine', v * 0.18, { at, bus }); },
    // 篠笛
    fue(midi, d, v, at, bus) {
      const ctx = this.ctx, t = ctx.currentTime + (at || 0), f = 440 * Math.pow(2, (midi - 69) / 12);
      const os = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      os.type = 'sine'; o2.type = 'triangle'; os.frequency.setValueAtTime(f * 0.972, t); os.frequency.exponentialRampToValueAtTime(f, t + 0.045);
      o2.frequency.setValueAtTime(f * 2 * 0.972, t); o2.frequency.exponentialRampToValueAtTime(f * 2, t + 0.045); g2.gain.value = 0.16;
      lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(d, 0.3)); lfo.connect(lg); lg.connect(os.frequency); lg.connect(o2.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.035); g.gain.setValueAtTime(v, t + Math.max(0.04, d - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.03);
      os.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus || this.sfx);
      os.start(t); o2.start(t); lfo.start(t); os.stop(t + d + 0.06); o2.stop(t + d + 0.06); lfo.stop(t + d + 0.06);
      this.nz(Math.min(d, 0.12), v * 0.22, { at, bus, f: f * 2, q: 1.5 }); this.nz(d, v * 0.05, { at, bus, f: f * 3, q: 0.8, a: 0.03 });
    },
    // ---- 効果音（名前は元のまま） ----
    drop(at) { if (!this.ok()) return; this.wood(540, 0.34, at); this.osc(120, 0.12, 'sine', 0.3, { at, to: 70 }); },
    hammer(at) {
      if (!this.ok()) return; at = at || 0;
      this.wood(1250, 0.5, at, null, 0.16); this.wood(1870, 0.34, at + 0.004, null, 0.12); this.nz(0.05, 0.4, { at, f: 3200, q: 0.6 });
      this.taiko(0.6, at + 0.01, null, 70); for (let i = 0; i < 5; i++) this.wood(420 + i * 90, 0.12, at + 0.08 + i * 0.05 + Math.random() * 0.02, null, 0.06);
    },
    fall(at) { if (!this.ok()) return; at = at || 0; this.wood(400, 0.3, at); this.wood(330, 0.22, at + 0.045); this.osc(95, 0.14, 'sine', 0.26, { at, to: 60 }); },
    pop(at) { if (!this.ok()) return; at = at || 0; for (let i = 0; i < 6; i++) this.bell(1568 * Math.pow(2, [0, 2, 4, 7, 9, 12][i] / 12), 0.1, at + i * 0.05, null, 0.5); },
    win(at) {
      if (!this.ok()) return; at = at || 0; this.duck(2.6);
      this.taiko(0.7, at); this.taiko(0.7, at + 0.16); this.taiko(0.9, at + 0.42, null, 56); this.kane(0.3, at + 0.42);
      [[81, 0.14], [83, 0.14], [86, 0.14], [88, 0.14], [91, 0.7]].forEach((n, i) => this.fue(n[0], n[1], 0.26, at + 0.5 + i * 0.15));
      for (let i = 0; i < 4; i++) this.kane(0.2, at + 0.62 + i * 0.15, null, i < 3);
      this.bell(1760, 0.14, at + 1.28, null, 1.2);
    },
    lose(at) {
      if (!this.ok()) return; at = at || 0; this.duck(2.2);
      this.taiko(0.7, at, null, 50); this.fue(76, 0.34, 0.2, at + 0.12); this.fue(74, 0.34, 0.2, at + 0.5); this.fue(69, 0.8, 0.2, at + 0.88);
    },
    tick(at) { if (!this.ok()) return; this.wood(1500, 0.12, at, null, 0.04); },
    tap(at) { if (!this.ok()) return; this.wood(900, 0.14, at, null, 0.05); },
    label(at) { if (!this.ok()) return; at = at || 0; this.taiko(0.55, at); this.kane(0.22, at + 0.01); },
    firework(big, at) {
      if (!this.ok()) return; at = (at || 0) + 0.05;
      this.nz(0.5, big ? 0.5 : 0.34, { at, f: 160, fTo: 50, type: 'lowpass', q: 0.7 }); this.osc(90, 0.4, 'sine', big ? 0.4 : 0.26, { at, to: 38 });
      for (let i = 0; i < (big ? 16 : 9); i++) this.nz(0.02, 0.05 + Math.random() * 0.05, { at: at + 0.25 + Math.random() * 0.9, f: 4000 + Math.random() * 4000, q: 2, off: Math.random() });
    },
    // ---- 音楽（祭囃子ふう・オリジナル） ----
    BPM: 104,
    MEL: [[81, 2], [83, 1], [81, 1], [79, 2], [76, 2], [79, 1], [81, 1], [83, 2], [86, 2], [83, 2], [81, 2], [79, 1], [76, 1], [74, 2], [76, 2], [79, 3], [81, 1], [79, 2], [0, 2],
      [86, 2], [83, 1], [86, 1], [88, 2], [86, 2], [83, 1], [81, 1], [79, 2], [81, 2], [83, 2], [81, 1], [79, 1], [76, 2], [79, 1], [81, 1], [79, 2], [76, 2], [74, 4], [0, 2]],
    melAt: null,
    step(i, t, bus) {   // i＝16分音符の番号、t＝鳴らす時刻（いまからの秒）
      const s = i % 16, bar = (i >> 4) % 8, hot = this.hot, e = this.BPM;
      if (!this.melAt) { this.melAt = {}; let p = 0; for (const [n, l] of this.MEL) { if (n) this.melAt[p] = [n, l]; p += l * 2; } this.melLen = p; }
      // 大太鼓
      if (s === 0 || s === 10 || (s === 6 && bar % 2) || (hot && s === 8)) this.taiko(s === 0 ? 0.5 : 0.34, t, bus);
      // 締太鼓
      if ((s % 4 === 2) || (bar % 4 === 3 && s >= 12) || (hot && s % 2 === 1)) this.shime(hot ? 0.16 : 0.11, t, bus);
      // 鉦（チャンチキ）
      if (s % 8 === 0) this.kane(0.1, t, bus); else if (s % 8 === 4 || s % 8 === 6 || (hot && s % 2 === 0)) this.kane(0.06, t, bus, true);
      // 篠笛
      const m = this.melAt[i % this.melLen];
      if (m) this.fue(m[0], m[1] * 2 * 60 / e / 4 * 0.94, 0.13, t, bus);
    },
    schedule() {
      if (!this.playing || !this.ctx) return;
      const sp = 60 / this.BPM / 4, now = this.ctx.currentTime;
      if (this.nextT < now) this.nextT = now + 0.05;
      while (this.nextT < now + 0.35) { this.step(this.beat, this.nextT - now, this.mus); this.beat++; this.nextT += sp; }
    },
    music(on) {
      this.wantMusic = on;
      if (!this.ctx) return;
      if (on && this.on && !this.playing) {
        this.playing = true; this.nextT = this.ctx.currentTime + 0.12;
        this.mus.gain.cancelScheduledValues(this.ctx.currentTime); this.mus.gain.setValueAtTime(0.0001, this.ctx.currentTime); this.mus.gain.exponentialRampToValueAtTime(0.62 * this.quiet, this.ctx.currentTime + 1.2);
        clearInterval(this.timer); this.timer = setInterval(() => this.schedule(), 90); this.schedule();
      } else if ((!on || !this.on) && this.playing) {
        this.playing = false; clearInterval(this.timer);
        this.mus.gain.cancelScheduledValues(this.ctx.currentTime); this.mus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.12);
      }
    },
    // タイトルでは控えめ、試合中はふつう
    level(q) { this.quiet = q; if (this.ctx && this.playing) this.mus.gain.setTargetAtTime(0.62 * q, this.ctx.currentTime, 0.5); },
    duck(sec) { if (!this.ctx || !this.playing) return; const t = this.ctx.currentTime; this.mus.gain.cancelScheduledValues(t); this.mus.gain.setTargetAtTime(0.1 * this.quiet, t, 0.05); this.mus.gain.setTargetAtTime(0.62 * this.quiet, t + sec, 0.6); },
    tension(h) { this.hot = !!h; },
    toggle() { this.on = !this.on; if (!this.on) { this.music(false); this.wantMusic = true; } else { this.init(); this.music(true); } return this.on; }
  };
  document.addEventListener('visibilitychange', () => {
    const S = Sound; if (!S.ctx) return;
    if (document.hidden) { try { S.ctx.suspend(); } catch (e) {} } else if (S.on) { try { S.ctx.resume(); } catch (e) {} }
  });
})();
