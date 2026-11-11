// =============================================
//  ルール本体（画面とは切り離し。CPUの先読みやオンラインでも同じものを使う）
//
//  盤：g[列][段]  段0が一番下   0=空  1=赤ダルマ  2=青ダルマ
//  1ターン＝2人が1回ずつ落とす。HAMMER_EVERYターンごとに予告した段が抜ける
// =============================================
(function () {
  const C = DG.CONFIG;
  const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

  // 同じ種(seed)なら、どの端末でも同じ段が選ばれる
  function rand01(seed, n) {
    let a = (seed ^ Math.imul(n + 1, 0x9E3779B1)) >>> 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function pickRow(seed, cycle) {
    const w = C.HAMMER_WEIGHTS, total = w.reduce((a, b) => a + b, 0);
    let r = rand01(seed, cycle) * total;
    for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return i; }
    return 0;
  }

  class Game {
    constructor(seed, first = 1) {
      this.seed = seed >>> 0;
      this.first = first;           // 先手（1 or 2）
      this.g = Array.from({ length: C.COLS }, () => new Array(C.ROWS).fill(0));
      this.moves = 0;               // これまでに落とした数
      this.rounds = 0;              // 終わったターン数
      this.turn = first;
      this.winner = 0;              // 0=まだ 1/2=勝ち 3=引き分け
      this.winLines = [];
      this.hammers = 0;             // これまで何回抜けたか
    }
    clone() {
      const n = Object.create(Game.prototype);
      Object.assign(n, this);
      n.g = this.g.map(c => c.slice());
      n.winLines = [];
      return n;
    }
    // 次に抜ける段と、あと何ターンか
    get nextRow() { return pickRow(this.seed, this.hammers); }
    get roundsLeft() { return C.HAMMER_EVERY - (this.rounds % C.HAMMER_EVERY); }
    height(c) { let h = 0; while (h < C.ROWS && this.g[c][h]) h++; return h; }
    canDrop(c) { return !this.winner && c >= 0 && c < C.COLS && this.g[c][C.ROWS - 1] === 0; }
    legal() { const a = []; for (let c = 0; c < C.COLS; c++) if (this.canDrop(c)) a.push(c); return a; }
    get(c, r) { return c < 0 || c >= C.COLS || r < 0 || r >= C.ROWS ? -1 : this.g[c][r]; }

    // 4つ以上並んだ列（ひとつながりを1本と数える）
    lines(p) {
      const out = [];
      for (let c = 0; c < C.COLS; c++) for (let r = 0; r < C.ROWS; r++) {
        if (this.g[c][r] !== p) continue;
        for (const [dc, dr] of DIRS) {
          if (this.get(c - dc, r - dr) === p) continue; // 始まりのマスだけ数える
          const cells = [];
          let x = c, y = r;
          while (this.get(x, y) === p) { cells.push([x, y]); x += dc; y += dr; }
          if (cells.length >= C.CONNECT) out.push(cells);
        }
      }
      return out;
    }
    // その1個を置いたことで並んだか（速い判定：CPU用）
    winsAt(c, r, p) {
      for (const [dc, dr] of DIRS) {
        let n = 1;
        for (let k = 1; this.get(c + dc * k, r + dr * k) === p; k++) n++;
        for (let k = 1; this.get(c - dc * k, r - dr * k) === p; k++) n++;
        if (n >= C.CONNECT) return true;
      }
      return false;
    }

    // 重力で下に詰める（動いたコマを返す）
    gravity() {
      const moves = [];
      for (let c = 0; c < C.COLS; c++) {
        let w = 0;
        for (let r = 0; r < C.ROWS; r++) {
          const v = this.g[c][r];
          if (!v) continue;
          if (r !== w) { this.g[c][w] = v; this.g[c][r] = 0; moves.push({ c, from: r, to: w, p: v }); }
          w++;
        }
      }
      return moves;
    }

    // 1手打つ。演出用の出来事の並びを返す。fast=true ならCPU用に出来事を作らない
    play(col, fast) {
      const ev = fast ? null : [];
      if (!this.canDrop(col)) return ev;
      const p = this.turn, r = this.height(col);
      this.g[col][r] = p;
      this.moves++;
      if (ev) ev.push({ type: 'drop', c: col, r, p });
      if (this.winsAt(col, r, p)) {
        this.winner = p;
        if (ev) { this.winLines = this.lines(p); ev.push({ type: 'win', p, lines: this.winLines }); }
        return ev;
      }
      this.turn = 3 - p;
      if (this.moves % 2 === 0) {
        this.rounds++;
        if (this.rounds % C.HAMMER_EVERY === 0) this.hammer(ev);
        if (!this.winner && ev) ev.push({ type: 'announce', row: this.nextRow, left: this.roundsLeft });
      }
      if (!this.winner && this.legal().length === 0) {
        this.winner = 3;
        if (ev) ev.push({ type: 'draw' });
      }
      return ev;
    }

    // だるま落とし：予告の段を抜いて、上をストンと落とす
    hammer(ev) {
      const row = this.nextRow;
      this.hammers++;
      const removed = [];
      for (let c = 0; c < C.COLS; c++) if (this.g[c][row]) { removed.push({ c, p: this.g[c][row] }); this.g[c][row] = 0; }
      const moves = this.gravity();
      if (ev) ev.push({ type: 'hammer', row, removed, moves });
      this.judge(ev);
    }

    // 落ちたあとの判定：そろった本数が多いほうの勝ち。同じ本数ならそろったコマを消して続行
    judge(ev) {
      for (let guard = 0; guard < 20; guard++) {
        const a = this.lines(1), b = this.lines(2);
        if (!a.length && !b.length) return;
        if (a.length !== b.length) {
          this.winner = a.length > b.length ? 1 : 2;
          this.winLines = this.winner === 1 ? a : b;
          if (ev) ev.push({ type: 'win', p: this.winner, lines: this.winLines, count: [a.length, b.length], byHammer: true });
          return;
        }
        const cells = [];
        for (const L of a.concat(b)) for (const [c, r] of L) cells.push([c, r, this.g[c][r]]);
        for (const [c, r] of cells) this.g[c][r] = 0;
        const moves = this.gravity();
        if (ev) ev.push({ type: 'sudden', cells, count: a.length, moves });
      }
    }
  }

  DG.Game = Game;
  DG.pickRow = pickRow;
})();
