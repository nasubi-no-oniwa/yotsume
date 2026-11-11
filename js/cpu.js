// =============================================
//  CPU（よわい／ふつう／つよい）
//  先読みの中で「だるま落とし」も同じルールで起きるので、抜ける段も計算に入る
// =============================================
(function () {
  const C = DG.CONFIG;
  const ORDER = [3, 2, 4, 1, 5, 0, 6];
  const LEVELS = {
    easy:   { depth: 2, mistake: 0.35, think: 500 },
    normal: { depth: 4, mistake: 0.08, think: 600 },
    hard:   { depth: 7, mistake: 0,    think: 700 }
  };

  // 盤面の良さ（p から見て）
  function evaluate(g, p) {
    const o = 3 - p;
    let s = 0;
    // 真ん中の列は強い
    for (let r = 0; r < C.ROWS; r++) { if (g.g[3][r] === p) s += 4; else if (g.g[3][r] === o) s -= 4; }
    const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let c = 0; c < C.COLS; c++) for (let r = 0; r < C.ROWS; r++) for (const [dc, dr] of dirs) {
      const ec = c + dc * 3, er = r + dr * 3;
      if (ec < 0 || ec >= C.COLS || er < 0 || er >= C.ROWS) continue;
      let mp = 0, mo = 0;
      for (let k = 0; k < 4; k++) { const v = g.g[c + dc * k][r + dr * k]; if (v === p) mp++; else if (v === o) mo++; }
      if (mp && mo) continue;
      if (mp === 3) s += 12; else if (mp === 2) s += 4;
      if (mo === 3) s -= 14; else if (mo === 2) s -= 4;
    }
    return s;
  }

  function search(g, depth, alpha, beta, p, deadline) {
    if (g.winner) return g.winner === p ? 100000 + depth : g.winner === 3 ? 0 : -100000 - depth;
    if (depth === 0 || Date.now() > deadline) return evaluate(g, p);
    const me = g.turn === p;
    let best = me ? -Infinity : Infinity;
    for (const c of ORDER) {
      if (!g.canDrop(c)) continue;
      const n = g.clone(); n.play(c, true);
      const v = search(n, depth - 1, alpha, beta, p, deadline);
      if (me) { if (v > best) best = v; if (best > alpha) alpha = best; }
      else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }

  DG.cpuMove = function (game, level) {
    const L = LEVELS[level] || LEVELS.normal;
    const p = game.turn, legal = game.legal();
    if (!legal.length) return -1;
    // よわい・ふつう：ときどき適当に置く（ただし目の前の勝ちは逃さない）
    for (const c of legal) { const n = game.clone(); n.play(c, true); if (n.winner === p) return c; }
    if (Math.random() < L.mistake) return legal[Math.floor(Math.random() * legal.length)];
    const deadline = Date.now() + 900;
    let best = legal[0], bestV = -Infinity;
    const scored = [];
    for (const c of ORDER) {
      if (!game.canDrop(c)) continue;
      const n = game.clone(); n.play(c, true);
      const v = search(n, L.depth - 1, -Infinity, Infinity, p, deadline) + (Math.random() - 0.5) * (level === 'hard' ? 0.5 : 3);
      scored.push([c, v]);
      if (v > bestV) { bestV = v; best = c; }
    }
    return best;
  };
  DG.CPU_LEVELS = LEVELS;
})();
