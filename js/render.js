// =============================================
//  四ツ目のダルマ  描画（立体：漆と金の盤・ダルマ・小槌・縁日の夜）
//  ルールや進行には一切さわらない。見せ方だけを受け持つ。
//  盤の正面（z=0）の位置は 2D のときと同じ計算なので、タップの場所や
//  落ちる時間などは元のまま。
// =============================================
(function () {
  const C = DG.CONFIG;
  const COLORS = {
    1: { body: '#c4161f', light: '#e8463c', dark: '#7a0a12', line: '#4d0409', mark: '#e9c46a', name: '赤' },
    2: { body: '#24409f', light: '#4a6fd6', dark: '#11205c', line: '#0a1238', mark: '#e6ecf5', name: '青' }
  };
  DG.COLORS = COLORS;
  const FONT_BRUSH = '"Yuji Syuku", "Shippori Mincho B1", "Hiragino Mincho ProN", "Yu Mincho", serif';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------------------------------------------
  //  ダルマの形（回転体）。高さ 0.96・幅 0.88（1マス＝1）
  // ---------------------------------------------
  const PROF_N = 40, HALF = 0.48;
  const KN_Y = [-0.48, -0.45, -0.38, -0.26, -0.12, 0.02, 0.14, 0.25, 0.33, 0.395, 0.44, 0.48];
  const KN_R = [0.27, 0.335, 0.395, 0.432, 0.44, 0.432, 0.408, 0.368, 0.315, 0.25, 0.17, 0.05];
  function profR(y) {
    let i = 0; while (i < KN_Y.length - 2 && y > KN_Y[i + 1]) i++;
    const t = clamp((y - KN_Y[i]) / (KN_Y[i + 1] - KN_Y[i]), 0, 1);
    const p0 = KN_R[Math.max(0, i - 1)], p1 = KN_R[i], p2 = KN_R[i + 1], p3 = KN_R[Math.min(KN_R.length - 1, i + 2)];
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  }
  const vOfY = y => (1 + (y + HALF) / (2 * HALF) * (PROF_N - 1)) / (PROF_N + 1);

  // ---------------------------------------------
  //  ダルマの絵（円筒に巻く1枚絵）。単位は「1マス」、y は上向き
  // ---------------------------------------------
  const TEX = 1024, RBAR = 0.425;
  function paintDaruma(cv, p, eyes) {
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, red = p === 1;
    const col = COLORS[p];
    const metal = red ? ['#fff0b8', '#e9c46a', '#b98a2c'] : ['#ffffff', '#dfe6f2', '#9aa7c2'];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, red ? '#d42a2a' : '#3556c4'); g.addColorStop(0.45, col.body); g.addColorStop(1, red ? '#8d0d15' : '#16296e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sx = W / (TAU * RBAR), sy = H * (PROF_N - 1) / (PROF_N + 1) / (2 * HALF);
    ctx.setTransform(sx, 0, 0, -sy, W / 2, H * (1 - vOfY(0)));
    const mg = (y0, y1) => { const q = ctx.createLinearGradient(0, y1, 0, y0); q.addColorStop(0, metal[0]); q.addColorStop(0.5, metal[1]); q.addColorStop(1, metal[2]); return q; };
    const text = (s, x, y, size, fill, weight) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(1 / 1000, -1 / 1000);
      ctx.font = (weight || 400) + ' ' + Math.round(size * 1000) + 'px ' + FONT_BRUSH; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = fill; ctx.fillText(s, 0, 0); ctx.restore();
    };
    // 肩の金（銀）の帯
    ctx.fillStyle = mg(0.372, 0.392); ctx.fillRect(-2, 0.372, 4, 0.02);
    ctx.fillStyle = mg(-0.43, -0.415); ctx.fillRect(-2, -0.43, 4, 0.015);
    // 背中側の飾り（うしろを向いたときにも寂しくないように）
    for (let i = -6; i <= 6; i++) { if (Math.abs(i) < 3) continue; ctx.fillStyle = mg(-0.3, 0.2); ctx.globalAlpha = 0.5; ctx.fillRect(i * 0.19 - 0.006, -0.36, 0.012, 0.66); ctx.globalAlpha = 1; }
    // 顔の窓
    ctx.beginPath(); ctx.ellipse(0, 0.135, 0.285, 0.205, 0, 0, TAU);
    const fg = ctx.createRadialGradient(0, 0.2, 0.02, 0, 0.135, 0.3); fg.addColorStop(0, '#fff7e3'); fg.addColorStop(1, '#ead6ae');
    ctx.fillStyle = fg; ctx.fill(); ctx.lineWidth = 0.022; ctx.strokeStyle = mg(-0.07, 0.34); ctx.stroke();
    ctx.lineWidth = 0.006; ctx.strokeStyle = 'rgba(60,10,10,.55)'; ctx.beginPath(); ctx.ellipse(0, 0.135, 0.272, 0.192, 0, 0, TAU); ctx.stroke();
    // まゆ（鶴）と ひげ（亀）
    ctx.fillStyle = '#17110f';
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(s * 0.022, 0.222);
      ctx.bezierCurveTo(s * 0.06, 0.318, s * 0.2, 0.345, s * 0.262, 0.268);
      ctx.bezierCurveTo(s * 0.2, 0.282, s * 0.11, 0.25, s * 0.022, 0.222); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.012, 0.064);
      ctx.bezierCurveTo(s * 0.09, 0.082, s * 0.2, 0.036, s * 0.25, 0.104);
      ctx.bezierCurveTo(s * 0.222, -0.022, s * 0.1, -0.014, s * 0.012, 0.022); ctx.fill();
    }
    // 目（片目だけ入っている。勝った列は両目が入る）
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.arc(s * 0.114, 0.152, 0.07, 0, TAU); ctx.fillStyle = '#fffdf6'; ctx.fill();
      ctx.lineWidth = 0.015; ctx.strokeStyle = '#17110f'; ctx.stroke();
      if (eyes === 2 || s === 1) {
        ctx.beginPath(); ctx.arc(s * 0.114 - s * 0.006, 0.148, 0.046, 0, TAU); ctx.fillStyle = '#0d0808'; ctx.fill();
        ctx.beginPath(); ctx.arc(s * 0.114 + 0.014, 0.168, 0.012, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
      }
    }
    // 鼻と口
    ctx.lineCap = 'round'; ctx.lineWidth = 0.014; ctx.strokeStyle = '#17110f';
    ctx.beginPath(); ctx.arc(-0.018, 0.078, 0.014, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(0.018, 0.078, 0.014, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.lineWidth = 0.02; ctx.strokeStyle = '#b3202a'; ctx.beginPath(); ctx.moveTo(-0.04, -0.012); ctx.quadraticCurveTo(0, -0.026, 0.04, -0.012); ctx.stroke();
    // おなかの紋（赤＝金の丸に「福」／青＝銀の輪に「寿」）… 色が見分けにくくても形で分かる
    if (red) {
      ctx.beginPath(); ctx.arc(0, -0.225, 0.128, 0, TAU); ctx.fillStyle = mg(-0.36, -0.09); ctx.fill();
      text('福', 0, -0.232, 0.19, '#8d0d15', 400);
    } else {
      ctx.beginPath(); ctx.arc(0, -0.225, 0.118, 0, TAU); ctx.lineWidth = 0.024; ctx.strokeStyle = mg(-0.36, -0.09); ctx.stroke();
      text('寿', 0, -0.232, 0.16, metal[1], 400);
    }
    // わきの飾り線
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      ctx.lineWidth = 0.02 - i * 0.004; ctx.strokeStyle = mg(-0.4, 0.0);
      ctx.beginPath(); ctx.moveTo(s * (0.2 + i * 0.07), -0.075 + i * 0.012);
      ctx.bezierCurveTo(s * (0.3 + i * 0.075), -0.14, s * (0.31 + i * 0.07), -0.28, s * (0.22 + i * 0.075), -0.385); ctx.stroke();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ---------------------------------------------
  //  平面のダルマ（立体が使えない端末と、絵が用意できるまでの代わり）
  // ---------------------------------------------
  function drawDaruma2D(ctx, cx, cy, r, p, opt) {
    const col = COLORS[p]; if (!col) return;
    ctx.save(); ctx.translate(cx, cy);
    if (opt.rot) ctx.rotate(opt.rot);
    if (opt.sx || opt.sy) ctx.scale(opt.sx || 1, opt.sy || 1);
    ctx.globalAlpha *= opt.alpha == null ? 1 : opt.alpha;
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
    g.addColorStop(0, col.light); g.addColorStop(0.5, col.body); g.addColorStop(1, col.dark);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, r * 0.03, r * 0.94, r * 1.0, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f3e3c0'; ctx.beginPath(); ctx.ellipse(0, -r * 0.2, r * 0.6, r * 0.44, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = col.mark; ctx.lineWidth = Math.max(1, r * 0.06); ctx.stroke();
    ctx.fillStyle = '#17110f';
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(s * r * 0.26, -r * 0.42, r * 0.22, r * 0.06, -s * 0.35, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * r * 0.25, -r * 0.22, r * 0.14, 0, TAU); ctx.fill();
      ctx.fillStyle = '#17110f';
      if (opt.win || s === 1) { ctx.beginPath(); ctx.arc(s * r * 0.25, -r * 0.22, r * 0.08, 0, TAU); ctx.fill(); }
    }
    ctx.fillStyle = col.mark; ctx.strokeStyle = col.mark;
    if (p === 1) { ctx.beginPath(); ctx.arc(0, r * 0.55, r * 0.2, 0, TAU); ctx.fill(); }
    else { ctx.lineWidth = Math.max(1.5, r * 0.08); ctx.beginPath(); ctx.arc(0, r * 0.55, r * 0.17, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }

  // ---------------------------------------------
  //  立体の舞台
  // ---------------------------------------------
  const T3 = window.THREE;
  const Stage = DG.Stage = { ok: false, icons: null, mode: 'title' };

  function tex(cv, repeat) {
    const t = new T3.CanvasTexture(cv); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4;
    if (repeat) { t.wrapS = t.wrapT = T3.RepeatWrapping; }
    return t;
  }
  function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  function goldLeaf() {
    const W = 1024, H = 888, cv = mkCanvas(W, H), x = cv.getContext('2d');
    const g = x.createRadialGradient(W * 0.42, H * 0.36, 40, W / 2, H / 2, W * 0.75);
    g.addColorStop(0, '#f0cf78'); g.addColorStop(0.55, '#cf9f42'); g.addColorStop(1, '#8d6220');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // 箔の継ぎ目
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cw = W / 9, ch = H / 8;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 8; j++) {
      x.fillStyle = `rgba(${rnd() > 0.5 ? '255,236,170' : '90,55,10'},${0.03 + rnd() * 0.07})`;
      x.fillRect(i * cw + rnd() * 3, j * ch + rnd() * 3, cw, ch);
    }
    x.strokeStyle = 'rgba(255,240,190,.22)'; x.lineWidth = 1.2;
    for (let i = 1; i < 9; i++) { x.beginPath(); x.moveTo(i * cw + rnd() * 2, 0); x.lineTo(i * cw + rnd() * 2, H); x.stroke(); }
    for (let j = 1; j < 8; j++) { x.beginPath(); x.moveTo(0, j * ch + rnd() * 2); x.lineTo(W, j * ch + rnd() * 2); x.stroke(); }
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${rnd() > 0.6 ? '255,245,205' : '80,45,5'},${rnd() * 0.16})`; x.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2.2, 1 + rnd() * 2.2); }
    // 霞（金雲）
    const kasumi = (cx, cy, w, h, a) => {
      x.save(); x.beginPath();
      const r = h / 2; x.moveTo(cx - w / 2 + r, cy - r); x.lineTo(cx + w / 2 - r, cy - r); x.arc(cx + w / 2 - r, cy, r, -Math.PI / 2, Math.PI / 2); x.lineTo(cx - w / 2 + r, cy + r); x.arc(cx - w / 2 + r, cy, r, Math.PI / 2, Math.PI * 1.5); x.closePath();
      const q = x.createLinearGradient(0, cy - r, 0, cy + r); q.addColorStop(0, `rgba(255,244,196,${a})`); q.addColorStop(1, `rgba(255,214,120,${a * 0.5})`);
      x.fillStyle = q; x.fill(); x.lineWidth = 1.5; x.strokeStyle = `rgba(255,248,214,${a * 1.3})`; x.stroke(); x.restore();
    };
    kasumi(W * 0.3, H * 0.13, W * 0.5, 34, 0.2); kasumi(W * 0.48, H * 0.17, W * 0.42, 30, 0.18); kasumi(W * 0.2, H * 0.21, W * 0.3, 24, 0.14);
    kasumi(W * 0.76, H * 0.46, W * 0.4, 32, 0.16); kasumi(W * 0.9, H * 0.5, W * 0.34, 26, 0.14);
    kasumi(W * 0.22, H * 0.74, W * 0.46, 34, 0.15); kasumi(W * 0.4, H * 0.785, W * 0.36, 26, 0.13);
    // マスの目印（うすい輪）
    const px = v => (v + 3.78) / 7.56 * W, py = v => (3.28 - v) / 6.56 * H, s = W / 7.56;
    for (let c = 0; c < C.COLS; c++) for (let r = 0; r < C.ROWS; r++) {
      const cx = px(c - 3), cy = py(r - 2.5);
      x.beginPath(); x.arc(cx, cy, 0.41 * s, 0, TAU); x.fillStyle = 'rgba(70,38,6,.1)'; x.fill();
      x.lineWidth = 1.6; x.strokeStyle = 'rgba(60,30,0,.26)'; x.stroke();
      x.beginPath(); x.arc(cx, cy + 1.5, 0.41 * s, 0.1 * Math.PI, 0.9 * Math.PI); x.strokeStyle = 'rgba(255,240,190,.26)'; x.stroke();
    }
    const sh = x.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(40,18,0,.34)'); sh.addColorStop(0.16, 'rgba(40,18,0,0)'); sh.addColorStop(0.8, 'rgba(40,18,0,0)'); sh.addColorStop(1, 'rgba(40,18,0,.42)');
    x.fillStyle = sh; x.fillRect(0, 0, W, H);
    const sv = x.createLinearGradient(0, 0, W, 0); sv.addColorStop(0, 'rgba(40,18,0,.36)'); sv.addColorStop(0.08, 'rgba(40,18,0,0)'); sv.addColorStop(0.92, 'rgba(40,18,0,0)'); sv.addColorStop(1, 'rgba(40,18,0,.36)');
    x.fillStyle = sv; x.fillRect(0, 0, W, H);
    return tex(cv);
  }
  // 蒔絵（麻の葉）
  function makie(w, h, n) {
    const cv = mkCanvas(w, h), x = cv.getContext('2d'); x.clearRect(0, 0, w, h);
    const u = h / n * 2, g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6dc8b'); g.addColorStop(1, '#b98a2c');
    x.strokeStyle = g; x.lineWidth = Math.max(1, h / 90); x.globalAlpha = 0.85;
    const hx = u * Math.sqrt(3) / 2;
    for (let i = -1; i * hx < w + hx; i++) for (let j = -1; j * u < h + u; j++) {
      const cx = i * hx, cy = j * u + (i % 2 ? u / 2 : 0);
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3 + Math.PI / 6;
        x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * u / Math.sqrt(3), cy + Math.sin(a) * u / Math.sqrt(3)); x.stroke();
      }
      x.beginPath(); for (let k = 0; k <= 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6, X = cx + Math.cos(a) * u / Math.sqrt(3), Y = cy + Math.sin(a) * u / Math.sqrt(3); k ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke();
    }
    return tex(cv);
  }
  function glowTex(inner, mid) {
    const cv = mkCanvas(128, 128), x = cv.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner || 'rgba(255,255,255,1)'); g.addColorStop(0.35, mid || 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return tex(cv);
  }
  function lanternTex(kind, kanji) {
    const cv = mkCanvas(256, 256), x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 256);
    if (kind === 0) { g.addColorStop(0, '#ff7a3a'); g.addColorStop(0.45, '#ff3a2a'); g.addColorStop(1, '#b3121a'); }
    else { g.addColorStop(0, '#fff3cf'); g.addColorStop(0.5, '#ffd98a'); g.addColorStop(1, '#f0a850'); }
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const c = x.createRadialGradient(128, 150, 10, 128, 140, 150); c.addColorStop(0, 'rgba(255,255,220,.75)'); c.addColorStop(1, 'rgba(255,255,220,0)');
    x.fillStyle = c; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = kind === 0 ? 'rgba(90,0,0,.38)' : 'rgba(150,80,10,.3)'; x.lineWidth = 2;
    for (let i = 1; i < 14; i++) { x.beginPath(); x.moveTo(0, i * 18.3); x.lineTo(256, i * 18.3); x.stroke(); }
    x.font = '400 104px ' + FONT_BRUSH; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = kind === 0 ? '#fff4d8' : '#1a0d08';
    x.save(); x.translate(128, 132); x.scale(0.5, 1); x.fillText(kanji, 0, 0); x.translate(256, 0); x.restore();
    x.save(); x.translate(0, 132); x.scale(0.5, 1); x.fillText(kanji, 0, 0); x.restore();
    x.save(); x.translate(256, 132); x.scale(0.5, 1); x.fillText(kanji, 0, 0); x.restore();
    return tex(cv);
  }
  function skyTex() {
    const cv = mkCanvas(64, 512), x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#04050f'); g.addColorStop(0.35, '#0a0d26'); g.addColorStop(0.7, '#1b1230'); g.addColorStop(0.9, '#3a1620'); g.addColorStop(1, '#4a1a16');
    x.fillStyle = g; x.fillRect(0, 0, 64, 512); return tex(cv);
  }
  function streakTex() {
    const W = 512, H = 256, cv = mkCanvas(W, H), x = cv.getContext('2d'); x.clearRect(0, 0, W, H);
    let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const cols = ['255,170,90', '255,110,60', '255,215,150', '255,90,60', '255,190,110'];
    for (let i = 0; i < 26; i++) {
      const cx = rnd() * W, w = 5 + rnd() * 16, h = H * (0.35 + rnd() * 0.65), a = 0.1 + rnd() * 0.2;
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(${cols[i % 5]},${a})`); g.addColorStop(1, `rgba(${cols[i % 5]},0)`);
      x.fillStyle = g; x.filter = 'blur(5px)'; x.fillRect(cx - w / 2, 0, w, h);
    }
    x.filter = 'none'; const t = tex(cv, true); return t;
  }
  function reflTex() {
    const cv = mkCanvas(64, 128), x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(255,196,96,.5)'); g.addColorStop(0.3, 'rgba(240,160,70,.2)'); g.addColorStop(1, 'rgba(240,160,70,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 128);
    const h = x.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.12, 'rgba(0,0,0,0)'); h.addColorStop(0.88, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)');
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 64, 128); return tex(cv);
  }
  function sheenTex() {
    const cv = mkCanvas(128, 8), x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 128, 0);
    g.addColorStop(0, 'rgba(255,246,210,0)'); g.addColorStop(0.5, 'rgba(255,246,210,1)'); g.addColorStop(1, 'rgba(255,246,210,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 8); return tex(cv);
  }
  function badgeTex() { const cv = mkCanvas(128, 128); const t = tex(cv); t.userData = { cv, n: -1, hot: null }; return t; }
  function paintBadge(t, n, hot) {
    if (t.userData.n === n && t.userData.hot === hot) return; t.userData.n = n; t.userData.hot = hot;
    const x = t.userData.cv.getContext('2d'); x.clearRect(0, 0, 128, 128);
    const g = x.createRadialGradient(50, 44, 6, 64, 64, 60);
    if (hot) { g.addColorStop(0, '#ff6a4a'); g.addColorStop(1, '#b30f1c'); } else { g.addColorStop(0, '#3a2a22'); g.addColorStop(1, '#120b09'); }
    x.beginPath(); x.arc(64, 64, 54, 0, TAU); x.fillStyle = g; x.fill();
    x.lineWidth = 7; x.strokeStyle = '#e9c46a'; x.stroke();
    x.font = '800 78px "Kaisei Tokumin", "Shippori Mincho B1", serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#fff3cf'; x.fillText(String(n), 64, 69); t.needsUpdate = true;
  }

  // 角を丸めた箱（x-y が丸い板を z に押し出す）
  function rbox(w, h, d, r, bevel) {
    const s = new T3.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const b = bevel == null ? 0.02 : bevel;
    const g = new T3.ExtrudeGeometry(s, { depth: d - b * 2, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 8 });
    g.translate(0, 0, -(d - b * 2) / 2); return g;
  }

  // ---------- 粒（火花・金粉・花火） ----------
  class Sparks {
    constructor(max, parent) {
      this.max = max; this.n = 0; this.p = [];
      const g = this.geo = new T3.BufferGeometry();
      this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 4); this.siz = new Float32Array(max);
      g.setAttribute('position', new T3.BufferAttribute(this.pos, 3));
      g.setAttribute('color', new T3.BufferAttribute(this.col, 4));
      g.setAttribute('size', new T3.BufferAttribute(this.siz, 1));
      this.mat = new T3.ShaderMaterial({
        uniforms: { uScale: { value: 1 } }, transparent: true, depthWrite: false, blending: T3.AdditiveBlending,
        vertexShader: 'attribute float size; attribute vec4 color; varying vec4 vC; uniform float uScale; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size*uScale/(-mv.z); gl_Position=projectionMatrix*mv; }',
        fragmentShader: 'varying vec4 vC; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.05,d); gl_FragColor=vec4(vC.rgb, vC.a*a); }'
      });
      this.obj = new T3.Points(g, this.mat); this.obj.frustumCulled = false; this.obj.renderOrder = 20; parent.add(this.obj);
    }
    add(o) { if (this.p.length >= this.max) this.p.shift(); o.t = 0; this.p.push(o); }
    update(dt) {
      const P = this.p; let k = 0;
      for (let i = 0; i < P.length; i++) {
        const q = P[i]; q.t += dt; if (q.t >= q.life) continue;
        const dr = Math.pow(q.drag == null ? 0.985 : q.drag, dt * 60);
        q.vx *= dr; q.vy *= dr; q.vz *= dr; q.vy -= (q.g || 0) * dt;
        q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
        const u = q.t / q.life; let a = (q.a == null ? 1 : q.a) * (u < 0.1 ? u / 0.1 : 1) * Math.pow(1 - u, q.fade || 1);
        if (q.tw) a *= 0.55 + 0.45 * Math.sin(q.t * q.tw + q.x);
        this.pos[k * 3] = q.x; this.pos[k * 3 + 1] = q.y; this.pos[k * 3 + 2] = q.z;
        this.col[k * 4] = q.r; this.col[k * 4 + 1] = q.gr; this.col[k * 4 + 2] = q.b; this.col[k * 4 + 3] = a;
        this.siz[k] = q.s * (q.grow ? 1 + u * q.grow : 1);
        P[k++] = q;
      }
      P.length = k; this.geo.setDrawRange(0, k);
      this.geo.attributes.position.needsUpdate = this.geo.attributes.color.needsUpdate = this.geo.attributes.size.needsUpdate = true;
    }
  }

  function init() {
    if (!T3) return false;
    const cv = document.getElementById('gl'); if (!cv) return false;
    let renderer;
    try { renderer = new T3.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return false; }
    const S = Stage; S.cv = cv; S.r = renderer;
    renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
    const scene = S.scene = new T3.Scene();
    const cam = S.cam = new T3.PerspectiveCamera(42, 1, 10, 9000);

    // ---- 映りこみ用の小さな部屋（提灯の灯りが漆に映る） ----
    (function () {
      const es = new T3.Scene(); es.background = new T3.Color(0x05060f);
      const bx = new T3.Mesh(new T3.SphereGeometry(50, 24, 16), new T3.MeshBasicMaterial({ color: 0x0a0c1e, side: T3.BackSide })); es.add(bx);
      const add = (x, y, z, r, c, i) => { const m = new T3.Mesh(new T3.SphereGeometry(r, 16, 12), new T3.MeshBasicMaterial({ color: new T3.Color(c).multiplyScalar(i) })); m.position.set(x, y, z); es.add(m); };
      add(-14, 16, 22, 7, 0xffb46a, 7); add(15, 20, 18, 6, 0xff6a3a, 6); add(0, 30, 6, 9, 0xffd9a0, 4); add(-30, 4, 4, 5, 0xff9a4a, 3); add(30, 6, 8, 5, 0xffc27a, 3);
      add(24, -6, 26, 4, 0x6f8cff, 3); add(-22, -18, 20, 8, 0x2a1a30, 2); add(0, 8, 40, 10, 0xfff0d0, 1.6); add(0, -30, 0, 22, 0x1a0a08, 1);
      const pm = new T3.PMREMGenerator(renderer); S.env = pm.fromScene(es, 0.035).texture; scene.environment = S.env; pm.dispose();
    })();

    // ---- 灯り ----
    scene.add(new T3.HemisphereLight(0x5466b8, 0x3a120a, 0.55));
    const key = S.key = new T3.DirectionalLight(0xffdcae, 2.0); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.6; key.shadow.radius = 3;
    scene.add(key); scene.add(key.target);
    const rim = S.rim = new T3.DirectionalLight(0x7f9cff, 0.9); scene.add(rim); scene.add(rim.target);
    const fill = S.fill = new T3.DirectionalLight(0xff8a4a, 0.55); scene.add(fill); scene.add(fill.target);

    // ---- 絵 ----
    S.dt = {}; S.dcv = {};
    for (const p of [1, 2]) for (const e of [1, 2]) { const c = mkCanvas(TEX, TEX); paintDaruma(c, p, e); S.dcv[p + '' + e] = c; S.dt[p + '' + e] = tex(c); }
    const lacq = S.lacq = new T3.MeshPhysicalMaterial({ color: 0x0b090c, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.5 });
    const gold = S.gold = new T3.MeshStandardMaterial({ color: 0xd9a038, roughness: 0.34, metalness: 1, envMapIntensity: 1.15 });
    const vermil = new T3.MeshPhysicalMaterial({ color: 0xb5121b, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.3 });
    const wood = new T3.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.6, metalness: 0, envMapIntensity: 0.6 });

    // ---- ダルマ ----
    const pts = [new T3.Vector2(0.0001, -HALF)];
    for (let i = 0; i < PROF_N; i++) { const y = -HALF + i / (PROF_N - 1) * 2 * HALF; pts.push(new T3.Vector2(Math.max(0.0001, profR(y)), y)); }
    pts.push(new T3.Vector2(0.0001, HALF));
    const dgeo = S.dgeo = new T3.LatheGeometry(pts, 44, Math.PI, TAU);
    S.dmatBase = new T3.MeshPhysicalMaterial({ map: S.dt['11'], roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.25 });
    const mkPiece = () => { const m = new T3.Mesh(dgeo, S.dmatBase.clone()); m.castShadow = true; m.receiveShadow = true; m.visible = false; return m; };

    // ---- 盤（単位は 1マス。あとで拡大する） ----
    const B = S.board = new T3.Group(); scene.add(B);
    const leaf = new T3.MeshStandardMaterial({ map: goldLeaf(), roughness: 0.42, metalness: 0.75, envMapIntensity: 0.9 });
    const back = new T3.Mesh(new T3.BoxGeometry(7.56, 6.56, 0.08), [lacq, lacq, lacq, lacq, leaf, lacq]); back.position.set(0, 0, -0.56); back.receiveShadow = true; B.add(back);
    for (const s of [-1, 1]) {
      const w = new T3.Mesh(rbox(0.28, 6.74, 1.16, 0.06, 0.025), lacq); w.position.set(s * 3.66, 0.05, -0.02); w.castShadow = true; w.receiveShadow = true; B.add(w);
      const e1 = new T3.Mesh(new T3.BoxGeometry(0.035, 6.74, 0.035), gold); e1.position.set(s * 3.535, 0.05, 0.545); B.add(e1);
      const e2 = new T3.Mesh(new T3.BoxGeometry(0.035, 6.74, 0.035), gold); e2.position.set(s * 3.785, 0.05, 0.545); B.add(e2);
      const f = new T3.Mesh(new T3.SphereGeometry(0.13, 20, 14), gold); f.position.set(s * 3.66, 3.5, -0.02); f.scale.set(1, 1.25, 1); f.castShadow = true; B.add(f);
      const fc = new T3.Mesh(new T3.CylinderGeometry(0.16, 0.16, 0.05, 20), gold); fc.position.set(s * 3.66, 3.41, -0.02); B.add(fc);
    }
    const base = new T3.Mesh(rbox(8.1, 0.3, 1.5, 0.07, 0.03), lacq); base.position.set(0, -3.15, 0.05); base.castShadow = true; base.receiveShadow = true; B.add(base);
    const baseTop = new T3.Mesh(new T3.BoxGeometry(8.14, 0.035, 1.54), gold); baseTop.position.set(0, -3.0, 0.05); baseTop.receiveShadow = true; B.add(baseTop);
    const mk = new T3.Mesh(new T3.PlaneGeometry(7.9, 0.21), new T3.MeshBasicMaterial({ map: makie(1024, 28, 1), transparent: true, opacity: 0.9, toneMapped: false })); mk.position.set(0, -3.165, 0.803); B.add(mk);
    const rail = new T3.Mesh(new T3.BoxGeometry(7.7, 0.07, 0.13), gold); rail.position.set(0, 3.31, -0.55); B.add(rail);
    // 次に抜ける段の光
    const bandMat = S.bandMat = new T3.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.25, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false });
    S.band = new T3.Mesh(new T3.PlaneGeometry(7.3, 1), bandMat); S.band.position.z = -0.515; S.band.visible = false; B.add(S.band);
    S.bandF = new T3.Mesh(new T3.PlaneGeometry(7.56, 0.05), new T3.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.6, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false }));
    S.bandF2 = S.bandF.clone(); S.bandF.visible = S.bandF2.visible = false; B.add(S.bandF); B.add(S.bandF2);
    S.sheen = new T3.Mesh(new T3.PlaneGeometry(2.2, 6.5), new T3.MeshBasicMaterial({ map: sheenTex(), transparent: true, opacity: 0, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false })); S.sheen.position.z = -0.513; B.add(S.sheen);
    // 列の予告
    S.colBand = new T3.Mesh(new T3.PlaneGeometry(1, 6.3), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false })); S.colBand.position.z = -0.512; S.colBand.visible = false; B.add(S.colBand);
    // コマ
    S.pieces = []; for (let i = 0; i < 60; i++) { const m = mkPiece(); S.pieces.push(m); B.add(m); }
    // 勝った列の光
    S.halo = []; const hm = new T3.SpriteMaterial({ map: glowTex('rgba(255,236,170,1)', 'rgba(255,190,80,.45)'), blending: T3.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false });
    for (let i = 0; i < 16; i++) { const s = new T3.Sprite(hm.clone()); s.visible = false; s.renderOrder = 5; S.halo.push(s); B.add(s); }

    // ---- 小槌（打ち出の小槌） ----
    const K = S.koz = new T3.Group(); B.add(K);
    const kh = new T3.Group(); K.add(kh);
    const drum = new T3.Mesh(new T3.CylinderGeometry(0.2, 0.2, 0.5, 28, 1), gold); drum.rotation.z = Math.PI / 2; drum.castShadow = true; kh.add(drum);
    for (const s of [-1, 1]) {
      const ring = new T3.Mesh(new T3.CylinderGeometry(0.215, 0.215, 0.05, 28, 1), vermil); ring.rotation.z = Math.PI / 2; ring.position.x = s * 0.17; kh.add(ring);
      const capm = new T3.Mesh(new T3.CylinderGeometry(0.17, 0.2, 0.03, 28, 1), gold); capm.rotation.z = Math.PI / 2; capm.position.x = s * 0.262; kh.add(capm);
    }
    const mid = new T3.Mesh(new T3.CylinderGeometry(0.212, 0.212, 0.09, 28, 1), lacq); mid.rotation.z = Math.PI / 2; kh.add(mid);
    const hd = new T3.Mesh(new T3.CylinderGeometry(0.035, 0.045, 0.62, 12), wood); hd.position.y = -0.47; hd.castShadow = true; K.add(hd);
    const kn = new T3.Mesh(new T3.SphereGeometry(0.06, 12, 10), gold); kn.position.y = -0.79; K.add(kn);
    const tas = new T3.Mesh(new T3.CylinderGeometry(0.02, 0.05, 0.2, 8), vermil); tas.position.set(0.0, -0.93, 0); K.add(tas);
    K.visible = false;
    S.badgeT = badgeTex(); S.badge = new T3.Sprite(new T3.SpriteMaterial({ map: S.badgeT, transparent: true, depthWrite: false, toneMapped: false })); S.badge.scale.set(0.46, 0.46, 1); S.badge.visible = false; S.badge.renderOrder = 8; B.add(S.badge);

    // ---- タイトルのダルマ ----
    const Hh = S.hero = new T3.Group(); scene.add(Hh); S.heroP = [];
    for (let i = 0; i < 4; i++) { const m = mkPiece(); m.visible = true; m.material.map = S.dt[(i % 2 ? '2' : '1') + '1']; S.heroP.push(m); Hh.add(m); }

    // ---- 台（黒漆の卓） ----
    const tm = new T3.MeshPhysicalMaterial({ color: 0x0a0708, roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.7 });
    S.table = new T3.Mesh(new T3.PlaneGeometry(1, 1), tm); S.table.rotation.x = -Math.PI / 2; S.table.receiveShadow = true; scene.add(S.table);
    S.tableEdge = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ color: 0xe0b04a, toneMapped: false })); scene.add(S.tableEdge);
    S.streak = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ map: streakTex(), transparent: true, blending: T3.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false })); S.streak.renderOrder = 3; scene.add(S.streak);
    S.refl = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ map: reflTex(), transparent: true, blending: T3.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false })); S.refl.renderOrder = 3; scene.add(S.refl);
    S.pool = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ map: glowTex('rgba(255,190,110,.55)', 'rgba(255,140,60,.18)'), transparent: true, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false })); S.pool.rotation.x = -Math.PI / 2; S.pool.renderOrder = 2; scene.add(S.pool);

    // ---- 夜空・提灯・ぼけた灯り ----
    S.sky = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ map: skyTex(), depthWrite: false, toneMapped: false })); S.sky.renderOrder = -10; scene.add(S.sky);
    S.bokehTex = glowTex('rgba(255,255,255,.9)', 'rgba(255,255,255,.75)');
    S.bokeh = []; let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const bcol = [0xffb060, 0xff7a3a, 0xffd9a0, 0xff5a3a, 0xffc87a, 0x8fa8ff];
    for (let i = 0; i < 46; i++) {
      const m = new T3.Sprite(new T3.SpriteMaterial({ map: S.bokehTex, color: bcol[i % bcol.length], transparent: true, opacity: 0.1 + rnd() * 0.16, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false }));
      m.userData = { u: rnd(), v: rnd(), s: 0.02 + rnd() * 0.06, ph: rnd() * 9, sp: 0.2 + rnd() * 0.8, o: m.material.opacity }; m.renderOrder = -8; S.bokeh.push(m); scene.add(m);
    }
    S.lanGeo = (function () { const q = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; q.push(new T3.Vector2(0.14 + Math.sin(a) * 0.36, -Math.cos(a) * 0.5)); } return new T3.LatheGeometry(q, 20); })();
    S.lanMat = [lanternTex(0, '祭'), lanternTex(1, '福'), lanternTex(0, '四'), lanternTex(1, '目'), lanternTex(0, '寿'), lanternTex(1, '祭')].map(t => new T3.MeshBasicMaterial({ map: t, toneMapped: false }));
    S.lanGlow = glowTex('rgba(255,200,130,.55)', 'rgba(255,120,50,.16)');
    S.capGeo = new T3.CylinderGeometry(0.2, 0.2, 0.09, 14); S.capMat = new T3.MeshBasicMaterial({ color: 0x0a0606 });
    S.lans = []; S.ropes = [];
    for (let row = 0; row < 2; row++) {
      const L = []; for (let i = 0; i < 26; i++) {
        const gph = new T3.Group();
        const body = new T3.Mesh(S.lanGeo, S.lanMat[(i + row * 3) % S.lanMat.length].clone()); gph.add(body);
        const c1 = new T3.Mesh(S.capGeo, S.capMat); c1.position.y = 0.52; gph.add(c1); const c2 = new T3.Mesh(S.capGeo, S.capMat); c2.position.y = -0.52; gph.add(c2);
        const gl = new T3.Sprite(new T3.SpriteMaterial({ map: S.lanGlow, transparent: true, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0.9 })); gl.scale.set(3.2, 3.2, 1); gl.renderOrder = -2; gph.add(gl);
        gph.userData = { body, gl, ph: i * 1.7 + row * 2.2 }; gph.visible = false; scene.add(gph); L.push(gph);
      }
      S.lans.push(L);
      const rg = new T3.BufferGeometry(); rg.setAttribute('position', new T3.BufferAttribute(new Float32Array(27 * 3), 3));
      const rope = new T3.Line(rg, new T3.LineBasicMaterial({ color: 0x1a0c08 })); rope.frustumCulled = false; scene.add(rope); S.ropes.push(rope);
    }
    S.dim = 1; S.dimTo = 1;

    // ---- 粒 ----
    S.sparks = new Sparks(900, scene);
    S.fw = new Sparks(1600, scene); S.fw.obj.renderOrder = -6;
    S.cells = {}; S.items = []; S.lastNow = 0; S.shake = 0; S.fwQueue = []; S.motes = 0; S.titleT = 0;

    S.ok = true;
    resize(); window.addEventListener('resize', resize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    makeIcons();
    // 筆文字が読みこめたら、絵を描きなおす
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load('400 64px "Yuji Syuku"', '福寿祭四目'), document.fonts.load('800 64px "Kaisei Tokumin"', '123')]).then(repaint, () => {});
      setTimeout(repaint, 2500);
    }
    return true;
  }

  function repaint() {
    const S = Stage; if (!S.ok) return;
    for (const k in S.dcv) { paintDaruma(S.dcv[k], +k[0], +k[1]); S.dt[k].needsUpdate = true; }
    const kj = ['祭', '福', '四', '目', '寿', '祭'];
    S.lanMat.forEach((m, i) => { const t = lanternTex(i % 2, kj[i]); m.map.dispose(); m.map = t; });
    for (let row = 0; row < 2; row++) S.lans[row].forEach((gph, i) => { gph.userData.body.material.map = S.lanMat[(i + row * 3) % S.lanMat.length].map; gph.userData.body.material.needsUpdate = true; });
    S.badgeT.userData.n = -1;
    makeIcons();
  }

  // ダルマ1体の絵（名札・結果・アイコン用）。立体を小さく描いて写し取る
  function makeIcons() {
    const S = Stage, r = S.r, N = 320;
    const sc = new T3.Scene(); sc.environment = S.env;
    sc.add(new T3.HemisphereLight(0x8090d0, 0x40140a, 0.7));
    const k = new T3.DirectionalLight(0xffe2b8, 2.6); k.position.set(-1.2, 1.6, 2.4); sc.add(k);
    const k2 = new T3.DirectionalLight(0x7f9cff, 1.0); k2.position.set(2, 0.4, -1); sc.add(k2);
    const m = new T3.Mesh(S.dgeo, S.dmatBase.clone()); m.rotation.y = -0.16; sc.add(m);
    const cam = new T3.PerspectiveCamera(22, 1, 0.1, 20); cam.position.set(0, 0.06, 2.75); cam.lookAt(0, 0, 0);
    const pr = r.getPixelRatio(), sz = r.getSize(new T3.Vector2());
    r.setPixelRatio(1); r.setSize(N, N, false); r.setClearColor(0x000000, 0);
    const icons = {};
    for (const key of ['11', '12', '21', '22']) {
      m.material.map = S.dt[key]; r.clear(); r.render(sc, cam);
      const c = mkCanvas(N, N); c.getContext('2d').drawImage(r.domElement, 0, 0); icons[key] = c;
    }
    m.material.dispose();
    r.setPixelRatio(pr); r.setSize(sz.x, sz.y, false);
    S.icons = icons;
    try { document.dispatchEvent(new CustomEvent('daruma-icons')); } catch (e) {}
  }
  Stage.icon = (p, eyes) => Stage.icons ? Stage.icons[p + '' + (eyes === 2 ? 2 : 1)] : null;

  function resize() {
    const S = Stage; if (!S.ok) return;
    const W = S.W = window.innerWidth, H = S.H = window.innerHeight;
    const dpr = S.dpr = Math.min(2, window.devicePixelRatio || 1);
    S.r.setPixelRatio(dpr); S.r.setSize(W, H, false);
    S.cam.aspect = W / H; S.D = (H / 2) / Math.tan(S.cam.fov * Math.PI / 360);
    S.cam.position.set(0, 0, S.D); S.cam.near = Math.max(10, S.D * 0.08); S.cam.far = S.D * 8; S.cam.updateProjectionMatrix();
    S.sparks.mat.uniforms.uScale.value = S.D * dpr; S.fw.mat.uniforms.uScale.value = S.D * dpr;
  }
  // 画面上の点（中心が0、上が＋）を、奥行き z の世界の点へ
  const at = (sx, sy, z) => { const k = (Stage.D - z) / Stage.D; return [sx * k, sy * k, z]; };

  // ---------- 背景（夜空・提灯・ぼけ）を毎フレーム置く ----------
  function background(now, dt) {
    const S = Stage, W = S.W, H = S.H, t = now / 1000;
    S.dim += (S.dimTo - S.dim) * Math.min(1, dt * 2.5);
    const zs = -S.D * 3; const k = (S.D - zs) / S.D;
    S.sky.position.set(0, 0, zs); S.sky.scale.set(W * k * 1.05, H * k * 1.05, 1);
    for (const m of S.bokeh) {
      const u = m.userData, z = -S.D * (1.2 + u.u * 1.2), p = at((u.u - 0.5) * W * 1.25 + Math.sin(t * 0.07 * u.sp + u.ph) * 14, (0.56 - u.v * 0.95) * H * (u.v > 0.6 ? 1 : 0.9), z);
      m.position.set(p[0], p[1], p[2]); const s = u.s * Math.max(W, 520) * (S.D - z) / S.D; m.scale.set(s, s, 1);
      m.material.opacity = u.o * (0.7 + 0.3 * Math.sin(t * u.sp + u.ph)) * (0.45 + 0.55 * S.dim);
    }
    // 提灯の列（上のほうに2本）
    const unit = clamp(Math.min(W, 760) / 9.2, 34, 62) * (S.lanY0 < 60 ? 0.72 : 1);
    for (let row = 0; row < 2; row++) {
      const L = S.lans[row], z = row === 0 ? -S.D * 0.22 : -S.D * 0.75, sz = unit * (row === 0 ? 1 : 0.78) * (S.D - z) / S.D;
      const sp = unit * (row === 0 ? 1.32 : 1.2), n = Math.min(L.length, Math.ceil(W / sp) + 2), x0 = -(n - 1) / 2 * sp + (row ? sp * 0.5 : 0);
      const top = H / 2 - (row === 0 ? S.lanY0 : S.lanY1), sag = unit * (row === 0 ? 0.5 : 0.36);
      const pos = S.ropes[row].geometry.attributes.position;
      for (let i = 0; i < L.length; i++) {
        const gph = L[i]; if (i >= n) { gph.visible = false; pos.setXYZ(i + 1, pos.getX(i), pos.getY(i), pos.getZ(i)); continue; }
        gph.visible = true;
        const sx = x0 + i * sp, ph = (i % 4) / 4, hang = Math.sin(((i + (row ? 0.5 : 0)) % 4) / 4 * Math.PI) * sag;
        const sw = Math.sin(t * 0.9 + gph.userData.ph) * 0.05 + Math.sin(t * 0.37 + gph.userData.ph * 1.3) * 0.03;
        const p = at(sx, top - hang, z), rp = at(sx, top - hang + unit * (row === 0 ? 0.62 : 0.5), z);
        gph.position.set(p[0] + sw * sz * 0.5, p[1], p[2]); gph.scale.setScalar(sz); gph.rotation.z = sw; gph.rotation.y = Math.sin(t * 0.25 + gph.userData.ph) * 0.5;
        const fl = (0.86 + 0.14 * Math.sin(t * 3.1 + gph.userData.ph * 5) * Math.sin(t * 1.3 + i)) * (0.35 + 0.65 * S.dim) * (row ? 0.72 : 1);
        gph.userData.body.material.color.setScalar(fl); gph.userData.gl.material.opacity = 0.85 * fl;
        if (i === 0) pos.setXYZ(0, rp[0] - sp * 2, rp[1] + sag, rp[2]);
        pos.setXYZ(i + 1, rp[0], rp[1], rp[2]);
      }
      pos.needsUpdate = true; S.ropes[row].geometry.setDrawRange(0, Math.min(n + 1, 27));
    }
    // ただよう金粉
    S.motes -= dt;
    if (S.motes <= 0) {
      S.motes = 0.16; const z = -60 - Math.random() * 300, p = at((Math.random() - 0.5) * W * 1.1, (Math.random() - 0.6) * H, z);
      S.sparks.add({ x: p[0], y: p[1], z: p[2], vx: (Math.random() - 0.5) * 8, vy: 8 + Math.random() * 16, vz: 0, life: 5 + Math.random() * 4, s: 1.6 + Math.random() * 2.4, r: 1, gr: 0.78, b: 0.42, a: 0.5, tw: 2 + Math.random() * 3, drag: 1, fade: 0.6 });
    }
    // 花火
    for (let i = S.fwQueue.length - 1; i >= 0; i--) { const q = S.fwQueue[i]; q.t -= dt; if (q.t <= 0) { S.fwQueue.splice(i, 1); burst(q); } }
    S.fw.update(dt); S.sparks.update(dt);
  }
  const FWC = [[1, 0.82, 0.4], [1, 0.36, 0.25], [1, 0.95, 0.85], [0.55, 0.8, 1], [1, 0.55, 0.75], [0.6, 1, 0.7]];
  function burst(q) {
    const S = Stage, z = -S.D * 1.6, p = at(q.x, q.y, z), k = (S.D - z) / S.D, c = FWC[q.c % FWC.length], c2 = FWC[(q.c + 2) % FWC.length];
    const n = q.big ? 170 : 110, sp = (q.big ? 400 : 290) * k * clamp(Math.min(S.W, S.H * 0.6) / 390, 1, 1.7);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, e = Math.acos(2 * Math.random() - 1), v = sp * (0.82 + Math.random() * 0.22) * (i % 3 === 0 ? 0.55 : 1), cc = i % 3 === 0 ? c2 : c;
      S.fw.add({ x: p[0], y: p[1], z: p[2], vx: Math.sin(e) * Math.cos(a) * v, vy: Math.sin(e) * Math.sin(a) * v, vz: 0, g: 46 * k, drag: 0.95, life: 1.5 + Math.random() * 0.8, s: (q.big ? 8 : 6.5) * k, r: cc[0], gr: cc[1], b: cc[2], a: 1, fade: 1.6, tw: i % 2 ? 24 : 0 });
    }
    S.fw.add({ x: p[0], y: p[1], z: p[2], vx: 0, vy: 0, vz: 0, life: 0.4, s: 260 * k, r: c[0], gr: c[1], b: c[2], a: 0.45, fade: 2 });
    if (DG.Sound && DG.Sound.firework) DG.Sound.firework(q.big);
  }
  Stage.fireworks = function (n, good) {
    const S = Stage; if (!S.ok) return;
    for (let i = 0; i < n; i++) S.fwQueue.push({ t: i * 0.42 + Math.random() * 0.2, x: (Math.random() - 0.5) * S.W * 0.86, y: S.H * (0.1 + Math.random() * 0.3), c: (Math.random() * 6) | 0, big: i % 3 === 0 });
  };
  // 勝ち負けの演出（進行には関わらない）
  Stage.celebrate = function (good) { if (good) confetti(); if (!Stage.ok) return; if (good) Stage.fireworks(9, true); else Stage.dimTo = 0.45; };
  Stage.reset = function () { conf.stop = true; if (!Stage.ok) return; Stage.dimTo = 1; Stage.fwQueue.length = 0; };

  const conf = { p: [], on: false, stop: false };
  function confetti() {
    const cv = document.getElementById('confetti'); if (!cv) return;
    const x = cv.getContext('2d'), d = Math.min(2, window.devicePixelRatio || 1), W = window.innerWidth, H = window.innerHeight;
    cv.width = W * d; cv.height = H * d; x.setTransform(d, 0, 0, d, 0, 0);
    const cols = ['#f6dc8b', '#e3bb5c', '#fff3c4', '#d2232d', '#f6dc8b', '#ffffff'];
    conf.p.length = 0; conf.stop = false;
    for (let i = 0; i < 110; i++) conf.p.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.9, w: 5 + Math.random() * 6, h: 7 + Math.random() * 8, vy: 90 + Math.random() * 120, vx: (Math.random() - 0.5) * 40, a: Math.random() * TAU, va: (Math.random() - 0.5) * 7, ph: Math.random() * TAU, c: cols[i % cols.length] });
    if (conf.on) return; conf.on = true; let last = performance.now();
    const step = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; x.clearRect(0, 0, W, H); let alive = 0;
      for (const q of conf.p) {
        q.y += q.vy * dt; q.x += (q.vx + Math.sin(now / 400 + q.ph) * 30) * dt; q.a += q.va * dt;
        if (q.y > H + 20) { if (conf.stop || now - conf.t0 > 3200) continue; q.y = -20; q.x = Math.random() * W; }
        alive++; const f = Math.cos(now / 180 + q.ph);
        x.save(); x.translate(q.x, q.y); x.rotate(q.a); x.scale(1, f); x.globalAlpha = 0.9; x.fillStyle = q.c; x.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
        if (f > 0.6) { x.globalAlpha = 0.5; x.fillStyle = '#fff'; x.fillRect(-q.w / 2, -q.h / 2, q.w, q.h * 0.3); } x.restore();
      }
      if (alive && !conf.stop) requestAnimationFrame(step); else { conf.on = false; x.clearRect(0, 0, W, H); }
    };
    conf.t0 = last; requestAnimationFrame(step);
  }
  function lights(cx, cy, s) {
    const S = Stage;
    S.key.position.set(cx - s * 3.2, cy + s * 5.2, s * 8.5); S.key.target.position.set(cx, cy, 0);
    const c = S.key.shadow.camera; c.left = -s * 5.6; c.right = s * 5.6; c.top = s * 5.4; c.bottom = -s * 5.4; c.near = s * 2; c.far = s * 22; c.updateProjectionMatrix();
    S.rim.position.set(cx + s * 6, cy + s * 1.5, -s * 2); S.rim.target.position.set(cx, cy, 0);
    S.fill.position.set(cx + s * 2, cy - s * 4, s * 6); S.fill.target.position.set(cx, cy, 0);
    S.key.intensity = 2.0 * (0.6 + 0.4 * S.dim);
  }
  function table(y, cx, w, show, refl) {
    const S = Stage, depth = S.D * 0.92, zb = -Math.max(40, w * 0.16);
    S.table.visible = S.tableEdge.visible = S.pool.visible = S.streak.visible = show; if (!show) { S.refl.visible = false; return; }
    S.table.position.set(0, y, zb + depth / 2); S.table.scale.set(S.W * 2.4, depth, 1);
    S.tableEdge.position.set(0, y + 0.75, zb); S.tableEdge.scale.set(S.W * 2.6, 1.5, 1);
    const sh = Math.min(S.H * 0.3, 260); S.streak.visible = show; S.streak.position.set(0, y - sh / 2 - 1, 2); S.streak.scale.set(Math.max(S.W, 520) * 1.1, sh, 1); S.streak.material.opacity = 0.75 * (0.4 + 0.6 * S.dim);
    S.refl.visible = show && !!refl; if (refl) { S.refl.position.set(cx, y - refl * 0.5 - 2, 3); S.refl.scale.set(w * 0.9, refl, 1); S.refl.material.opacity = 0.55 * (0.4 + 0.6 * S.dim); }
    S.pool.position.set(cx, y + 0.5, w * 0.12); S.pool.scale.set(w * 1.5, w * 0.62, 1); S.pool.material.opacity = 0.5 * S.dim;
  }
  function frameEnd(now) {
    const S = Stage;
    if (S.shake > 0.01) { S.cam.position.x = (Math.random() - 0.5) * S.shake; S.cam.position.y = (Math.random() - 0.5) * S.shake; S.shake *= 0.86; } else { S.cam.position.x = S.cam.position.y = 0; S.shake = 0; }
    S.r.setClearColor(0x05060f, 1); S.r.render(S.scene, S.cam);
  }
  function tick(now) { const S = Stage; let dt = (now - (S.lastNow || now)) / 1000; S.lastNow = now; if (!(dt > 0)) dt = 0; return Math.min(dt, 0.05); }

  // ---------- タイトル ----------
  Stage.title = function (now) {
    const S = Stage; if (!S.ok) return;
    const dt = tick(now), el = document.getElementById('logo-canvas'), r = el.getBoundingClientRect();
    S.board.visible = false; S.hero.visible = r.width > 0;
    const s = Math.min(r.height * 0.9, r.width / 4.5), cx = r.left + r.width / 2 - S.W / 2, by = S.H / 2 - (r.top + r.height);
    S.lanY0 = clamp(r.top - 34, 44, 96); S.lanY1 = S.lanY0 * 0.5;
    S.hero.position.set(cx, by, 0); S.hero.scale.setScalar(s);
    S.titleT += dt; const t = S.titleT;
    for (let i = 0; i < 4; i++) {
      const m = S.heroP[i], cyc = (t * 0.55 + i * 0.25) % 4, hop = cyc < 0.5 ? Math.sin(cyc / 0.5 * Math.PI) : 0;
      const rock = Math.sin(t * 2.2 + i * 1.3) * 0.07 * (1 + (cyc > 0.5 && cyc < 2 ? Math.exp(-(cyc - 0.5) * 2.4) * 3 : 0));
      m.rotation.set(0, Math.sin(t * 0.8 + i) * 0.22, rock);
      m.position.set((i - 1.5) * 1.02 - Math.sin(rock) * HALF, HALF + hop * 0.34 + (Math.cos(rock) - 1) * HALF, 0);
    }
    lights(cx, by + s * 0.5, s * 0.75); table(by, cx, s * 4.6, r.width > 0);
    background(now, dt); frameEnd(now);
  };

  // ---------- 盤 ----------
  class BoardView {
    constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.label = document.getElementById('fx-label'); this.lastLabel = ''; }
    resize(cell) {
      this.cell = cell;
      this.pad = Math.round(cell * 0.28);
      const touch = matchMedia('(pointer: coarse)').matches;
      this.side = Math.round(cell * 0.8);                  // 左の小槌の場所
      this.top = Math.round(cell * (touch ? 0.45 : 1.0));  // 上の落とす場所
      const dpr = Stage.ok ? 1 : Math.min(3, window.devicePixelRatio || 1);
      this.w = this.side + this.pad * 2 + C.COLS * cell + Math.round(cell * 0.2);
      this.h = this.top + this.pad * 2 + C.ROWS * cell;
      this.canvas.width = Math.round(this.w * dpr); this.canvas.height = Math.round(this.h * dpr);
      this.canvas.style.width = this.w + 'px'; this.canvas.style.height = this.h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.bx = this.side + this.pad; this.by = this.top + this.pad;
    }
    cx(c) { return this.bx + (c + 0.5) * this.cell; }
    cy(r) { return this.by + (C.ROWS - r - 0.5) * this.cell; }
    colAt(px) { const c = Math.floor((px - this.bx) / this.cell); return c >= 0 && c < C.COLS ? c : -1; }

    draw(s, now) {
      if (!Stage.ok) return this.draw2d(s, now);
      const S = Stage, game = s.game; if (!game) return;
      const dt = tick(now), fx = s.fx || {}, cell = this.cell;
      const rc = this.canvas.getBoundingClientRect();
      // 盤の中心（マス目のまんなか）を画面の位置から決める
      const gx = rc.left + this.bx + C.COLS * cell / 2 - S.W / 2, gy = S.H / 2 - (rc.top + this.by + C.ROWS * cell / 2);
      S.hero.visible = false; S.board.visible = true; S.board.position.set(gx, gy, 0); S.board.scale.setScalar(cell);
      S.lanY0 = clamp(rc.top * 0.42, 40, 120); S.lanY1 = S.lanY0 * 0.5;
      // 2Dの座標（キャンバスの中のピクセル）→ 盤の中の座標（1マス＝1）
      const X = px => (px - this.bx) / cell - C.COLS / 2, Y = py => C.ROWS / 2 - (py - this.by) / cell;
      const items = S.items; items.length = 0;
      const hide = fx.hide || {}, fall = fx.fall || null, t = now / 1000;
      const hr = fx.hammerRow != null ? fx.hammerRow : (game.winner ? -1 : game.nextRow);
      const soon = hr >= 0 && game.roundsLeft === 1 && !fx.hammer && !game.winner;
      const seen = {};
      for (let c = 0; c < C.COLS; c++) for (let r = 0; r < C.ROWS; r++) {
        const p = game.g[c][r], k = c + ',' + r; if (!p || hide[k]) continue;
        seen[k] = 1;
        let st = S.cells[k]; if (!st || st.p !== p) { st = S.cells[k] = { p, born: now, fell: 0 }; }
        let y = this.cy(r), falling = false;
        if (fall && fall.map[k] != null) { y -= fall.map[k] * cell * (1 - fall.t); falling = true; st.fell = now; }
        const it = { x: X(this.cx(c)), y: Y(y), z: 0, p, rz: 0, ry: 0, rx: 0, sx: 1, sy: 1, a: 1, eyes: 1 };
        // 落ちたあと・積みなおしたあとの「ゆらっ」（見た目だけ）
        const age = (now - Math.max(st.born, st.fell)) / 1000;
        if (!falling && age < 1.1) { const w = Math.sin(age * 17) * Math.exp(-age * 4.2) * 0.11 * (((c * 7 + r * 3) % 2) ? 1 : -1); it.rz = w; it.x -= Math.sin(w) * HALF * 0.9; }
        it.ry = Math.sin(c * 2.1 + r * 1.3) * 0.07;
        if (soon && r === hr) { it.x += Math.sin(t * 38 + c * 2) * 0.012; it.rz += Math.sin(t * 31 + c) * 0.02; }
        if (fx.win && fx.win[k]) { const q = Math.sin(now / 110); it.sx = 1 + 0.07 * q; it.sy = 1 - 0.07 * q; it.eyes = 2; it.win = 1; it.ry = Math.sin(now / 260 + c) * 0.25; }
        if (fx.pop && fx.pop.map[k]) { const q = fx.pop.t; it.a = 1 - q; it.sx = it.sy = 1 + q * 0.6; it.eyes = 2; it.z = q * 0.8; }
        items.push(it);
      }
      for (const k in S.cells) if (!seen[k]) delete S.cells[k];
      // 落ちてくるコマ
      if (fx.drop) {
        const d = fx.drop; items.push({ x: X(this.cx(d.c)), y: Y(d.y), z: 0, p: d.p, rz: 0, ry: 0, rx: 0, sx: d.sx || 1, sy: d.sy || 1, a: 1, eyes: 1 });
        if (d.sx && !d._hit) { d._hit = 1; this.puff(X(this.cx(d.c)), Y(d.y) - HALF, 8, 0.9); S.shake = Math.max(S.shake, 1.2); }
      }
      // 小槌で抜けて飛んでいくコマ（手前へ飛び出して、右へ）
      if (fx.fly) for (const f of fx.fly.list) {
        const q = fx.fly.t, pop = Math.min(1, q / 0.22), e = 1 - (1 - pop) * (1 - pop), i = f.c;
        items.push({ x: X(this.cx(f.c)) + q * q * 9 + q * 0.6, y: Y(this.cy(fx.fly.row)) + Math.sin(q * Math.PI) * 0.4 + q * 0.3 * Math.sin(i * 1.7), z: e * 1.25 + q * 2.2, p: f.p, rz: -q * 7, ry: q * 5 * (i % 2 ? 1 : -1), rx: q * 3, sx: 1, sy: 1, a: 1 - q * 0.6, eyes: 1 });
      }
      if (fx.fly && !fx.fly._hit) { fx.fly._hit = 1; S.shake = 9; for (const f of fx.fly.list) this.puff(X(this.cx(f.c)), Y(this.cy(fx.fly.row)), 7, 2.2, 0.5); this.puff(-3.6, Y(this.cy(fx.fly.row)), 34, 3.4, 0.4); }
      if (fall && !fall._seen) fall._seen = 1;
      // 上の「ここに落とす」予告
      S.colBand.visible = false;
      if (s.hoverCol >= 0 && s.canInput && !fx.drop) {
        const c = s.hoverCol; S.colBand.visible = true; S.colBand.position.x = X(this.cx(c)); S.colBand.position.y = 0.05;
        items.push({ x: X(this.cx(c)), y: Y(this.top * 0.52), z: 0, p: game.turn, rz: Math.sin(t * 3) * 0.05, ry: 0, rx: 0, sx: 0.92, sy: 0.92, a: 0.95, eyes: 1 });
      }
      // 実際に置く
      let hi = 0;
      for (let i = 0; i < S.pieces.length; i++) {
        const m = S.pieces[i], it = items[i]; if (!it) { m.visible = false; continue; }
        m.visible = true; m.position.set(it.x, it.y, it.z); m.rotation.set(it.rx, it.ry, it.rz); m.scale.set(it.sx, it.sy, it.sx);
        const map = S.dt[it.p + '' + it.eyes]; if (m.material.map !== map) m.material.map = map;
        const tr = it.a < 0.999; if (m.material.transparent !== tr) { m.material.transparent = tr; m.material.needsUpdate = true; }
        m.material.opacity = it.a; m.castShadow = !tr;
        m.material.emissive.setRGB(it.win ? 0.1 : 0, it.win ? 0.06 : 0, it.win ? 0.01 : 0);
        if (it.win && hi < S.halo.length) { const h = S.halo[hi++]; h.visible = true; h.position.set(it.x, it.y, 0.56); const q = 2.3 + 0.3 * Math.sin(now / 160 + it.x); h.scale.set(q, q, 1); h.material.opacity = 0.17 + 0.07 * Math.sin(now / 130 + it.y); }
        if (it.win && Math.random() < dt * 9) this.puff(it.x + (Math.random() - 0.5) * 0.7, it.y + (Math.random() - 0.5) * 0.7, 1, 0.5, 1.2);
      }
      for (; hi < S.halo.length; hi++) S.halo[hi].visible = false;

      // 次に抜ける段の光と小槌
      S.band.visible = S.bandF.visible = S.bandF2.visible = S.koz.visible = S.badge.visible = false;
      if (hr >= 0) {
        const y = Y(this.cy(hr)), left = game.roundsLeft;
        const pulse = left === 1 && !fx.hammer ? 0.5 + 0.5 * Math.sin(now / 120) : 0;
        S.band.visible = S.bandF.visible = S.bandF2.visible = true; S.band.position.y = y; S.bandMat.opacity = 0.2 + pulse * 0.32;
        S.bandMat.color.setRGB(1, left === 1 ? 0.72 : 0.94, left === 1 ? 0.5 : 0.75);
        S.bandF.position.set(0, y + 0.49, -0.51); S.bandF2.position.set(0, y - 0.49, -0.51); S.bandF.material.opacity = S.bandF2.material.opacity = 0.35 + pulse * 0.5;
        // 2Dと同じ位置・同じ振り
        let hx = this.side * 0.5, rot = -0.5, swing = 0;
        if (fx.hammer) { swing = Math.sin(Math.min(1, fx.hammer.t * 2) * Math.PI); hx += swing * cell * 0.5; rot = -0.5 + swing * 1.2; }
        const K = S.koz; K.visible = true;
        const bob = fx.hammer ? 0 : Math.sin(t * 2.4) * 0.03 + (left === 1 ? Math.sin(t * 18) * 0.012 : 0);
        K.position.set(X(hx) - 0.1, Y(this.cy(hr) - cell * 0.05) + 0.2 + bob, 0.62 + swing * 0.1);
        K.rotation.set(0.25 - swing * 0.2, -0.5 + swing * 0.55, -rot - 0.25); K.scale.setScalar(1.22);
        if (!fx.hammer && !game.winner) {
          S.badge.visible = true; paintBadge(S.badgeT, left, left === 1);
          S.badge.position.set(X(this.side * 0.5) - 0.02, Y(this.cy(hr) + cell * 0.43) - 0.1, 0.9);
          const q = left === 1 ? 0.5 + 0.05 * Math.sin(now / 120) : 0.46; S.badge.scale.set(q, q, 1);
        }
      }
      { const u = (t % 7) / 1.6; S.sheen.visible = u < 1; if (u < 1) { S.sheen.position.x = lerp(-2.5, 2.5, u); S.sheen.material.opacity = 0.2 * Math.sin(u * Math.PI); } }
      // 文字の演出（スタート・だるま落とし・サドンデス）
      this.drawLabel(fx.label, rc);
      if (S.dimTo < 1 && !game.winner) S.dimTo = 1;
      lights(gx, gy, cell);
      table(gy - cell * 3.32, gx, cell * 8.2, true, cell * 2.2);
      background(now, dt); frameEnd(now);
    }
    puff(x, y, n, sp, life) {
      const S = Stage, cell = this.cell, bx = S.board.position.x, by = S.board.position.y;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, v = (0.4 + Math.random()) * sp * cell;
        S.sparks.add({ x: bx + x * cell, y: by + y * cell, z: cell * 0.6, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.8 + v * 0.3, vz: Math.random() * v * 0.4, g: cell * 5, drag: 0.93, life: (life || 0.6) * (0.6 + Math.random() * 0.8), s: 2.2 + Math.random() * 3.4, r: 1, gr: 0.8 + Math.random() * 0.15, b: 0.42 + Math.random() * 0.3, a: 1, fade: 1.4, tw: 20 });
      }
    }
    drawLabel(lb, rc) {
      const el = this.label; if (!el) return;
      if (!lb) { if (this.lastLabel) { el.classList.remove('on'); this.lastLabel = ''; el.style.opacity = 0; } return; }
      if (this.lastLabel !== lb.text) {
        this.lastLabel = lb.text; el.querySelector('span').textContent = lb.text;
        el.style.setProperty('--lc', lb.color || '#ffd46b');
        el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
      }
      el.style.left = (rc.left + this.bx + C.COLS * this.cell / 2) + 'px'; el.style.top = (rc.top + this.by + C.ROWS * this.cell * 0.42) + 'px';
      el.style.fontSize = Math.round(this.cell * 0.78) + 'px'; el.style.opacity = Math.min(1, lb.t * 3);
    }

    // 立体が使えない端末用（平面で同じものを描く）
    draw2d(s, now) {
      const ctx = this.ctx, cell = this.cell, R = cell * 0.4;
      ctx.clearRect(0, 0, this.w, this.h);
      const game = s.game; if (!game) return;
      const fx = s.fx || {};
      const bw = C.COLS * cell + this.pad * 2, bh = C.ROWS * cell + this.pad * 2, x0 = this.side, y0 = this.top;
      ctx.fillStyle = '#0d0a0c'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, bw, bh, cell * 0.14) : ctx.rect(x0, y0, bw, bh); ctx.fill();
      const gg = ctx.createLinearGradient(x0, y0, x0 + bw, y0 + bh); gg.addColorStop(0, '#e9c56a'); gg.addColorStop(1, '#a5772a');
      ctx.fillStyle = gg; ctx.fillRect(this.bx, this.by, C.COLS * cell, C.ROWS * cell);
      ctx.strokeStyle = '#e9c46a'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 2, y0 + 2, bw - 4, bh - 4);
      const hr = fx.hammerRow != null ? fx.hammerRow : (game.winner ? -1 : game.nextRow);
      if (hr >= 0) {
        const left = game.roundsLeft, pulse = left === 1 && !fx.hammer ? 0.5 + 0.5 * Math.sin(now / 120) : 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + pulse * 0.3})`; ctx.fillRect(this.bx, this.cy(hr) - cell / 2, C.COLS * cell, cell);
      }
      for (let c = 0; c < C.COLS; c++) for (let r = 0; r < C.ROWS; r++) { ctx.strokeStyle = 'rgba(60,30,0,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(this.cx(c), this.cy(r), R * 1.05, 0, TAU); ctx.stroke(); }
      const hide = fx.hide || {}, fall = fx.fall || null;
      for (let c = 0; c < C.COLS; c++) for (let r = 0; r < C.ROWS; r++) {
        const p = game.g[c][r]; if (!p || hide[c + ',' + r]) continue;
        let y = this.cy(r); if (fall && fall.map[c + ',' + r] != null) y -= fall.map[c + ',' + r] * cell * (1 - fall.t);
        let o = {};
        if (fx.win && fx.win[c + ',' + r]) { const k = Math.sin(now / 110); o = { sx: 1 + 0.08 * k, sy: 1 - 0.08 * k, win: 1 }; }
        if (fx.pop && fx.pop.map[c + ',' + r]) { const t = fx.pop.t; o = { alpha: 1 - t, sx: 1 + t * 0.6, sy: 1 + t * 0.6 }; }
        drawDaruma2D(ctx, this.cx(c), y, R, p, o);
      }
      if (fx.drop) drawDaruma2D(ctx, this.cx(fx.drop.c), fx.drop.y, R, fx.drop.p, { sx: fx.drop.sx, sy: fx.drop.sy });
      if (fx.fly) for (const f of fx.fly.list) { const t = fx.fly.t; drawDaruma2D(ctx, this.cx(f.c) + t * t * cell * 9, this.cy(fx.fly.row) - Math.sin(t * Math.PI) * cell * 0.4, R, f.p, { rot: t * 7, alpha: 1 - t * 0.6 }); }
      if (hr >= 0) {
        const hy = this.cy(hr); let hx = this.side * 0.5, rot = -0.5;
        if (fx.hammer) { const t = fx.hammer.t; hx += Math.sin(Math.min(1, t * 2) * Math.PI) * cell * 0.5; rot = -0.5 + Math.sin(Math.min(1, t * 2) * Math.PI) * 1.2; }
        const sz = cell * 0.8; ctx.save(); ctx.translate(hx, hy - cell * 0.05); ctx.rotate(rot);
        ctx.fillStyle = '#4a2a14'; ctx.fillRect(-sz * 0.05, 0, sz * 0.1, sz * 0.8);
        ctx.fillStyle = '#e0b04a'; ctx.fillRect(-sz * 0.42, -sz * 0.28, sz * 0.84, sz * 0.3); ctx.fillStyle = '#b5121b'; ctx.fillRect(-sz * 0.3, -sz * 0.28, sz * 0.07, sz * 0.3); ctx.fillRect(sz * 0.23, -sz * 0.28, sz * 0.07, sz * 0.3); ctx.restore();
        if (!fx.hammer && !game.winner) {
          const left = game.roundsLeft; ctx.fillStyle = left === 1 ? '#c8102e' : '#1a100c';
          ctx.beginPath(); ctx.arc(this.side * 0.5, hy + cell * 0.42, cell * 0.2, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e9c46a'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.fillStyle = '#fff3cf'; ctx.font = `800 ${Math.round(cell * 0.26)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(left, this.side * 0.5, hy + cell * 0.43);
        }
      }
      if (s.hoverCol >= 0 && s.canInput && !fx.drop) {
        const c = s.hoverCol; ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(this.cx(c) - cell / 2, this.by - this.pad * 0.5, cell, C.ROWS * cell + this.pad);
        drawDaruma2D(ctx, this.cx(c), this.top * 0.52, R * 0.92, game.turn, { alpha: 0.95 });
      }
      this.drawLabel(fx.label, this.canvas.getBoundingClientRect());
    }
  }
  DG.BoardView = BoardView;

  // 名札や結果に使う、ダルマ1体の絵
  DG.drawDaruma = function (ctx, cx, cy, r, p, opt = {}) {
    const ic = Stage.icon(p, opt.win ? 2 : 1);
    if (!ic) return drawDaruma2D(ctx, cx, cy, r, p, opt);
    ctx.save(); ctx.translate(cx, cy); if (opt.rot) ctx.rotate(opt.rot);
    ctx.globalAlpha *= opt.alpha == null ? 1 : opt.alpha;
    const s = r * 2.5; ctx.drawImage(ic, -s / 2, -s / 2 - r * 0.03, s, s); ctx.restore();
  };

  try { Stage.ok = false; init(); } catch (e) { Stage.ok = false; try { console.warn('3d off', e); } catch (_) {} }
  if (!Stage.ok) document.documentElement.classList.add('no3d');
})();
