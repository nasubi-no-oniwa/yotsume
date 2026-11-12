// =============================================
//  画面の進行（CPU・この端末で2人・合言葉オンライン＋観戦）
// =============================================
(function () {
  const C = DG.CONFIG;
  const $ = s => document.querySelector(s);
  const T = I18N.t;
  const levelName = lv => T('cpu_' + lv);

  // ---------- 効果音と音楽（js/sound.js） ----------
  const Sound = DG.Sound;
  const Stage = DG.Stage;

  const st = {
    screen: 'title', mode: 'cpu', level: 'normal',
    game: null, view: null, busy: false, fx: {}, hoverCol: -1,
    control: { 1: 'me', 2: 'cpu' }, names: { 1: T('you'), 2: 'CPU' }, wins: { 1: 0, 2: 0 },
    gameNo: 0, room: null, watch: false, queue: [], turnStart: 0, over: false
  };
  DG.state = st; // デバッグ用

  const board = new DG.BoardView($('#board'));

  // ---------- 画面 ----------
  function show(id) {
    st.screen = id;
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    if (id === 'game') layout();
  }
  function overlay(id, on) { $(id).classList.toggle('show', on); }

  function layout() {
    const area = $('#board-area');
    // 盤以外（プレイヤー・状態・予告バーなど）の高さを引いた残りに収める
    const stage = document.querySelector('.stage');
    const W = Math.min(window.innerWidth, 720) - 20;
    let other = 0;
    for (const el of stage.children) if (el !== area && el.offsetParent !== null) other += el.offsetHeight + 10;
    const H = stage.clientHeight - other - 10;
    const cell = Math.floor(Math.min((W - 8) / (C.COLS + 1.6), H / (C.ROWS + 1.2), 84));
    board.resize(Math.max(28, cell));
  }
  window.addEventListener('resize', () => { if (st.screen === 'game') layout(); });

  // ---------- 試合の開始 ----------
  function startGame(opts) {
    st.gameNo++; st.leftNote = "";
    const first = opts.first || 1;
    st.game = new DG.Game(opts.seed != null ? opts.seed : (Math.random() * 2147483647) | 0, first);
    st.view = st.game.clone();
    st.fx = {}; st.busy = false; st.over = false; st.queue = []; st.hoverCol = -1; st.turnStart = performance.now();
    overlay('#ov-result', false); overlay('#ov-menu', false);
    Stage.reset(); Sound.tension(false); Sound.level(1); Sound.music(true);
    $('#name1').textContent = st.names[1]; $('#name2').textContent = st.names[2];
    showWins();
    show('game');
    label(T('start'), '#ffd46b', 900); Sound.label();
    updateStatus();
    nextTurn();
  }

  function label(text, color, dur = 1100) {
    st.fx.label = { text, color, t: 1 };
    const start = performance.now();
    const tick = now => {
      if (!st.fx.label || st.fx.label.text !== text) return;
      st.fx.label.t = Math.max(0, 1 - (now - start) / dur);
      if (st.fx.label.t > 0) requestAnimationFrame(tick); else st.fx.label = null;
    };
    requestAnimationFrame(tick);
  }

  function isMyTurn() {
    return st.game && !st.game.winner && !st.busy && !st.over && (st.control[st.game.turn] === 'me' || st.control[st.game.turn] === 'local');
  }

  function showWins() { $('#wins1').textContent = st.wins[1]; $('#wins2').textContent = st.wins[2]; }
  // 盤の下の「だるま落としまで あと○ターン」
  function updateHammerBar() {
    const v = st.view; if (!v) return;
    const left = v.roundsLeft, row = v.nextRow;
    const rowName = row === 0 ? T('row_bottom') : T('row_n', { n: row + 1 });
    const bar = $('#hammer-bar');
    if (st.game && st.game.winner) { $('#hammer-text').textContent = T('hammer_none'); bar.classList.remove('soon'); Sound.tension(false); return; }
    $('#hammer-text').textContent = left === 1 ? T('hammer_now', { row: rowName }) : T('hammer_left', { n: left, row: rowName });
    bar.classList.toggle('soon', left === 1); Sound.tension(left === 1);
    $('#hammer-dots').innerHTML = [0, 1, 2].map(i => '<i class="' + (i < C.HAMMER_EVERY - left ? 'on' : '') + '"></i>').join('');
  }
  function updateStatus() {
    updateHammerBar();
    const g = st.game; if (!g) return;
    $('#pl1').classList.toggle('turn', !g.winner && g.turn === 1);
    $('#pl2').classList.toggle('turn', !g.winner && g.turn === 2);
    if (g.winner) return;
    const who = st.control[g.turn];
    let text;
    if (st.watch) text = T('turn_of', { name: st.names[g.turn] });
    else if (who === 'me') text = T('your_turn');
    else if (who === 'cpu') text = T('cpu_thinking');
    else if (who === 'local') text = T('turn_of', { name: st.names[g.turn] });
    else text = T('turn_of', { name: st.names[g.turn] });
    $('#status').innerHTML = text + (st.mode === 'online' ? ' <span class="t" id="timer"></span>' : '');
    $('#hint-line').textContent = isMyTurn() || (who === 'me') ? T('k_phone_d') : '';
  }

  function nextTurn() {
    updateStatus();
    const g = st.game;
    if (g.winner || st.over) return;
    st.turnStart = performance.now();
    if (st.control[g.turn] === 'cpu') {
      const lv = st.level;
      setTimeout(() => {
        if (st.game !== g || g.winner) return;
        const c = DG.cpuMove(g, lv);
        if (c >= 0) applyMove(c);
      }, DG.CPU_LEVELS[lv].think * (0.6 + Math.random() * 0.6));
    }
  }

  // ---------- 入力 ----------
  function requestMove(c) {
    if (!isMyTurn() || !st.game.canDrop(c)) return;
    Sound.init();
    if (st.mode === 'online') {
      if (st.sentIndex === st.game.moves) return; // 二重送信を防ぐ
      st.sentIndex = st.game.moves;
      st.room.sendMove(c, st.game.moves);
    } else applyMove(c);
  }
  const cv = $('#board');
  const colFromEvent = e => { const r = cv.getBoundingClientRect(); return board.colAt(e.clientX - r.left); };
  cv.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') st.hoverCol = colFromEvent(e); });
  cv.addEventListener('pointerleave', () => { st.hoverCol = -1; });
  cv.addEventListener('pointerup', e => { const c = colFromEvent(e); if (c >= 0) requestMove(c); });
  window.addEventListener('keydown', e => {
    if (st.screen !== 'game') return;
    if (e.key >= '1' && e.key <= String(C.COLS)) { requestMove(+e.key - 1); return; }
    if (e.key === 'ArrowLeft') { st.hoverCol = Math.max(0, (st.hoverCol < 0 ? 3 : st.hoverCol) - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { st.hoverCol = Math.min(C.COLS - 1, (st.hoverCol < 0 ? 3 : st.hoverCol) + 1); e.preventDefault(); }
    else if ((e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') && st.hoverCol >= 0) { requestMove(st.hoverCol); e.preventDefault(); }
  });

  // ---------- 1手を反映して演出する ----------
  function tween(dur, fn) {
    return new Promise(res => {
      const start = performance.now();
      const step = now => {
        const t = Math.min(1, (now - start) / dur);
        fn(t);
        if (t < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function applyMove(c) {
    const g = st.game;
    if (!g.canDrop(c)) return;
    st.busy = true; st.hoverCol = -1; updateStatus();
    const events = g.play(c);
    const v = st.view;
    for (const ev of events) {
      if (ev.type === 'drop') {
        const y0 = board.top * 0.52, y1 = board.cy(ev.r);
        const dur = Math.sqrt(2 * (y1 - y0) / C.DROP_GRAVITY);
        st.fx.drop = { c: ev.c, p: ev.p, y: y0 };
        await tween(dur, t => { st.fx.drop.y = y0 + (y1 - y0) * t * t; });
        Sound.drop();
        await tween(140, t => { const k = Math.sin(t * Math.PI); st.fx.drop.sx = 1 + 0.15 * k; st.fx.drop.sy = 1 - 0.18 * k; });
        st.fx.drop = null;
        v.g[ev.c][ev.r] = ev.p;
        v.moves = g.moves; v.turn = 3 - ev.p;
        if (v.moves % 2 === 0) v.rounds++;
        updateHammerBar();
      } else if (ev.type === 'hammer') {
        await doHammer(ev, v);
      } else if (ev.type === 'sudden') {
        label(T('sudden'), '#ffffff', 1200);
        const map = {}; for (const [cc, r] of ev.cells) map[cc + ',' + r] = 1;
        st.fx.win = map;
        await wait(700);
        st.fx.win = null;
        st.fx.pop = { map, t: 0 };
        Sound.pop();
        await tween(C.SUDDEN_TIME * 0.5, t => { st.fx.pop.t = t; });
        for (const [cc, r] of ev.cells) v.g[cc][r] = 0;
        st.fx.pop = null;
        await doFall(ev.moves, v);
      } else if (ev.type === 'win') {
        const map = {}; for (const L of ev.lines) for (const [cc, r] of L) map[cc + ',' + r] = 1;
        st.fx.win = map;
      }
    }
    st.view = g.clone();
    st.busy = false;
    updateHammerBar();
    if (g.winner) finish(events.find(e => e.type === 'win'));
    else { nextTurn(); runQueue(); }
  }

  async function doHammer(ev, v) {
    st.fx.hammerRow = ev.row;
    label(T('hammer_label'), '#ffd46b', 1100);
    let knocked = false;
    st.fx.hammer = { t: 0 };
    await tween(C.HAMMER_TIME, t => {
      st.fx.hammer.t = t;
      if (!knocked && t > 0.35) {
        knocked = true; Sound.hammer();
        for (const r of ev.removed) v.g[r.c][ev.row] = 0;
        st.fx.fly = { row: ev.row, list: ev.removed, t: 0 };
      }
      if (st.fx.fly) st.fx.fly.t = Math.min(1, (t - 0.35) / 0.65);
    });
    st.fx.fly = null; st.fx.hammer = null;
    await doFall(ev.moves, v);
    st.fx.hammerRow = null;
    v.hammers = st.game.hammers;
    updateHammerBar();
  }

  async function doFall(moves, v) {
    if (!moves.length) return;
    // 先に全部動かして、落ちた分だけ上にずらして表示 → だんだん下へ
    for (const m of moves) v.g[m.c][m.from] = 0;
    const map = {};
    for (const m of moves) { v.g[m.c][m.to] = m.p; map[m.c + ',' + m.to] = m.from - m.to; }
    st.fx.fall = { map, t: 0 };
    await tween(C.FALL_TIME, t => { st.fx.fall.t = t * t; });
    st.fx.fall = null;
    Sound.fall();
  }

  function finish(winEv) {
    const g = st.game;
    st.over = true;
    let title, sub = '';
    if (g.winner === 3) { title = T('draw'); }
    else {
      st.wins[g.winner]++;
      const nm = st.names[g.winner];
      if (st.mode === 'cpu') title = g.winner === 1 ? T('you_win') : T('cpu_win');
      else if (st.mode === 'online' && !st.watch) title = st.control[g.winner] === 'me' ? T('you_win') : T('x_wins_sad', { name: nm });
      else title = T('x_wins', { name: nm });
      if (winEv && winEv.byHammer) sub = T('by_hammer', { a: winEv.count[0], b: winEv.count[1] });
    }
    showWins();
    const good = g.winner !== 3 && (st.mode === 'local' || st.watch || st.control[g.winner] === 'me');
    good ? Sound.win() : Sound.lose();
    Stage.celebrate(good);
    st.last = { winner: g.winner, moves: g.moves, hammers: g.hammers || 0, mode: st.mode, level: st.level, watch: st.watch, mine: g.winner !== 3 && st.control[g.winner] === 'me', lost: g.winner !== 3 && st.mode !== 'local' && !st.watch && st.control[g.winner] !== 'me', name: g.winner === 3 ? '' : st.names[g.winner] };
    updateStatus();
    $('#status').textContent = g.winner === 3 ? T('draw') : T('lined', { name: st.names[g.winner] });
    setTimeout(() => {
      if (st.game !== g) return;
      $('#result-title').textContent = title;
      $('#result-sub').textContent = sub || st.leftNote || '';
      $('#again-msg').textContent = st.watch ? T('wait_next') : '';
      $('#btn-again').disabled = false; $('#btn-again').style.display = st.leftNote ? 'none' : '';
      const rc = $('#result-daruma'), rx = rc.getContext('2d');
      rx.clearRect(0, 0, 120, 120);
      if (g.winner === 3) { DG.drawDaruma(rx, 36, 64, 27, 1); DG.drawDaruma(rx, 84, 64, 27, 2); }
      else DG.drawDaruma(rx, 60, 62, 44, g.winner, { win: 1 });
      rc.dataset.w = g.winner;
      $('#ov-result').dataset.r = g.winner === 3 ? 'draw' : (good ? 'win' : 'lose');
      overlay('#ov-result', true);
    }, 1300);
  }

  // ---------- 各モード ----------
  document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => {
    Sound.init();
    setOnline(false);
    st.mode = 'cpu'; st.level = b.dataset.level;
    st.control = { 1: 'me', 2: 'cpu' }; st.names = { 1: T('you'), 2: levelName(st.level) }; st.wins = { 1: 0, 2: 0 }; st.gameNo = 0;
    startGame({ first: 1 });
  }));
  $('#btn-local').addEventListener('click', () => {
    Sound.init();
    setOnline(false);
    st.mode = 'local';
    st.control = { 1: 'local', 2: 'local' }; st.names = { 1: T('red'), 2: T('blue') }; st.wins = { 1: 0, 2: 0 }; st.gameNo = 0;
    startGame({ first: 1 });
  });
  $('#btn-again').addEventListener('click', () => {
    Sound.init();
    if (st.mode === 'online') {
      if (st.watch) return;
      st.room.rematch();
      $('#btn-again').disabled = true;
      $('#again-msg').textContent = T('wait_rematch');
    } else startGame({ first: st.gameNo % 2 === 0 ? 1 : 2 });
  });
  $('#btn-back').addEventListener('click', toTitle);
  $('#btn-quit').addEventListener('click', toTitle);
  $('#btn-menu').addEventListener('click', () => overlay('#ov-menu', true));
  $('#btn-resume').addEventListener('click', () => overlay('#ov-menu', false));
  $('#btn-howto').addEventListener('click', () => overlay('#ov-howto', true));
  $('#btn-howto2').addEventListener('click', () => { overlay('#ov-menu', false); overlay('#ov-howto', true); });
  $('#btn-howto-close').addEventListener('click', () => overlay('#ov-howto', false));
  $('#btn-sound').addEventListener('click', () => { Sound.toggle(); $('#btn-sound').classList.toggle('off', !Sound.on); });

  function toTitle() {
    if (st.room) { st.room.leave(); st.room = null; }
    QM.ended();
    setOnline(false);
    st.game = null; st.over = true;
    overlay('#ov-result', false); overlay('#ov-menu', false);
    Stage.reset(); Sound.tension(false); Sound.level(0.6);
    show('title');
  }
  function setOnline(on, watch) {
    st.watch = !!watch;
    document.body.classList.toggle('watching', !!watch);
    $('#watchers').textContent = '';
    if (!on) st.mode = st.mode === 'online' ? 'cpu' : st.mode;
  }

  // ---------- 合言葉オンライン ----------
  function loadScript(src) {
    return new Promise((res, rej) => {
      const el = document.createElement('script');
      el.src = src; el.onload = res; el.onerror = () => rej(new Error(T('err_net')));
      document.head.appendChild(el);
    });
  }
  async function getDb() {
    if (DG._db) return DG._db;
    if (!DG.FIREBASE_CONFIG) throw new Error(T('err_notready'));
    const v = '10.12.2';
    await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-database-compat.js');
    if (!firebase.apps.length) firebase.initializeApp(DG.FIREBASE_CONFIG);
    DG._db = firebase.database();
    return DG._db;
  }
  function lobby(wait) { $('#online-form').hidden = wait; $('#online-wait').hidden = !wait; }
  $('#btn-online').addEventListener('click', () => {
    Sound.init(); lobby(false); $('#online-err').textContent = '';
    try { $('#in-name').value = localStorage.getItem('daruma-name') || ''; } catch (e) {}
    overlay('#ov-online', true);
  });
  $('#btn-online-close').addEventListener('click', () => { if (st.room) { st.room.leave(); st.room = null; } QM.ended(); overlay('#ov-online', false); });
  $('#btn-copy').addEventListener('click', async () => {
    const url = location.origin + location.pathname + '?room=' + encodeURIComponent(st.room ? st.room.code : '');
    try { await navigator.clipboard.writeText(url); $('#btn-copy').textContent = T('copied'); }
    catch (e) { prompt(T('send_link'), url); }
    setTimeout(() => { $('#btn-copy').textContent = T('copy_link'); }, 2000);
  });
  $('#btn-join').addEventListener('click', joinOnline);
  $('#in-code').addEventListener('keydown', e => { if (e.key === 'Enter') joinOnline(); });

  async function joinOnline() {
    const code = DG.cleanCode($('#in-code').value);
    const name = $('#in-name').value.trim().slice(0, 8) || T('noname');
    if (!code) { $('#online-err').textContent = T('err_code'); return; }
    try { localStorage.setItem('daruma-name', name); } catch (e) {}
    $('#online-err').textContent = ''; $('#btn-join').disabled = true; $('#btn-join').textContent = T('connecting');
    try {
      const db = await getDb();
      st.wins = { 1: 0, 2: 0 }; st.gameNo = 0;
      const room = new DG.OnlineRoom(db, code, name, {
        onPeople: p => {
          $('#watchers').textContent = p.watchers ? T('watchers', { n: p.watchers }) : '';
          if (room.slot >= 0 && !p.names[1 - room.slot]) $('#wait-msg').textContent = T('waiting');
        },
        onStart: onlineStart,
        onMove: m => { st.queue.push(m); runQueue(); },
        onResult: r => {
          if (!st.game || st.game.winner) return;
          // 相手がいなくなった
          st.game.winner = r.loser === 0 ? 2 : 1;
          st.busy = false;
          st.leftNote = QM.isRandom() ? T('left_win') : T('left');
          finish(null);
        }
      });
      st.room = room;
      await room.join();
      st.mode = 'online';
      setOnline(true, room.slot < 0);
      $('#wait-code').textContent = room.code;
      $('#wait-msg').textContent = room.slot < 0 ? T('watch_in') : T('waiting');
      lobby(true);
    } catch (e) {
      $('#online-err').textContent = e.message || T('err_conn');
      if (st.room) { st.room.leave(); st.room = null; }
    }
    $('#btn-join').disabled = false; $('#btn-join').textContent = T('join');
  }

  function onlineStart(g) {
    QM.started({ code: st.room && st.room.code, watch: g.slot < 0 });
    const names = g.names.map(n => n || '？');
    st.mode = 'online';
    st.names = { 1: names[0], 2: names[1] };
    if (g.slot === 0) st.control = { 1: 'me', 2: 'remote' };
    else if (g.slot === 1) st.control = { 1: 'remote', 2: 'me' };
    else st.control = { 1: 'remote', 2: 'remote' };
    st.sentIndex = -1;
    overlay('#ov-online', false);
    // 奇数回戦は赤が先手、偶数回戦は青が先手
    setTimeout(() => startGame({ seed: g.seed, first: g.round % 2 === 1 ? 1 : 2 }), Math.min(g.wait, 1500));
    st.pendingStart = true;
    setTimeout(() => { st.pendingStart = false; runQueue(); }, Math.min(g.wait, 1500) + 20);
  }

  // 受け取った手を順番に反映（観戦で途中から入った人は、最初から早送りで再生）
  function runQueue() {
    if (st.mode !== 'online' || st.busy || st.pendingStart || !st.game) return;
    while (st.queue.length) {
      const m = st.queue[0];
      const g = st.game;
      if (!m || m.i !== g.moves) { st.queue.shift(); continue; }
      const turnSlot = g.turn === 1 ? 0 : 1;
      if (m.s !== turnSlot || !g.canDrop(m.c)) { st.queue.shift(); continue; }
      st.queue.shift();
      if (st.queue.length > 2) { g.play(m.c, true); st.view = g.clone(); if (g.winner) { st.view = g.clone(); finish(null); return; } continue; }
      applyMove(m.c);
      return;
    }
    updateStatus();
  }

  // オンラインの持ち時間：自分の番で時間切れなら、ランダムな列に自動で落とす
  setInterval(() => {
    if (st.mode !== 'online' || !st.game || st.game.winner || st.busy || st.over) return;
    const left = Math.max(0, C.TURN_TIME - Math.floor((performance.now() - st.turnStart) / 1000));
    const el = $('#timer'); if (el) el.textContent = T('timer', { n: left });
    if (left <= 5 && left > 0 && st.control[st.game.turn] === 'me') Sound.tick();
    if (left === 0 && st.control[st.game.turn] === 'me') {
      const L = st.game.legal();
      if (L.length) requestMove(L[Math.floor(Math.random() * L.length)]);
    }
  }, 1000);

  // ---------- だれかと対戦（ランダム対戦） ----------
  QM.setup({
    game: 'daruma', ver: 'v1', name: '四ツ目のダルマ',
    getDb, anchor: '#btn-online', anchorWhere: 'before', btnClass: 'btn wide indigo', nextClass: 'btn wide', nameKey: 'daruma-name',
    join: (code, name) => { Sound.init(); $('#in-code').value = code; $('#in-name').value = name; joinOnline(); },
    cpu: () => document.querySelector('[data-level="normal"]').click(), cpuLabel: () => T('cpu_wait_label'),
    quit: toTitle,
    colors: { main: 'var(--red)', alt: 'var(--indigo)', bg: 'var(--card)', fg: 'var(--ink)' },
  });
  QM.resultSlot('#ov-result .dialog', '#btn-back');

  (function () {
    const q = new URLSearchParams(location.search).get('room');
    if (q) { $('#in-code').value = q; setTimeout(() => $('#btn-online').click(), 50); }
  })();

  // ---------- 毎フレーム描画 ----------
  function frame(now) {
    if (st.screen === 'game' && st.view) {
      board.draw({ game: st.view, fx: st.fx, hoverCol: st.hoverCol, canInput: isMyTurn() }, now);
    } else if (st.screen === 'title') drawLogo(now);
    requestAnimationFrame(frame);
  }

  // タイトルのダルマ4つ（立体の舞台が描く。使えない端末では平面で）
  const lc = $('#logo-canvas'), lx = lc.getContext('2d');
  function drawLogo(now) {
    if (Stage.ok) { Stage.title(now); return; }
    const d = Math.min(2, window.devicePixelRatio || 1), w = lc.clientWidth, h = lc.clientHeight;
    if (lc.width !== Math.round(w * d)) { lc.width = Math.round(w * d); lc.height = Math.round(h * d); }
    lx.setTransform(d, 0, 0, d, 0, 0); lx.clearRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const jump = Math.max(0, Math.sin(now / 300 - i * 0.7)) * h * 0.1;
      DG.drawDaruma(lx, w / 2 + (i - 1.5) * h * 0.62, h * 0.6 - jump, h * 0.28, i % 2 ? 2 : 1);
    }
  }
  // 名札の顔
  function drawFaces() {
    document.querySelectorAll('.pface').forEach(cv => { const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); DG.drawDaruma(x, 48, 50, 38, +cv.dataset.p); });
    const rc = $('#result-daruma'); if (rc.dataset.w && $('#ov-result').classList.contains('show')) { const rx = rc.getContext('2d'), w = +rc.dataset.w; rx.clearRect(0, 0, 120, 120); if (w === 3) { DG.drawDaruma(rx, 36, 64, 27, 1); DG.drawDaruma(rx, 84, 64, 27, 2); } else DG.drawDaruma(rx, 60, 62, 44, w, { win: 1 }); }
  }
  drawFaces(); document.addEventListener('daruma-icons', drawFaces);

  // ---------- 結果をXに投稿（勝敗の文を作るだけ。進行にはかかわらない） ----------
  $('#btn-x').addEventListener('click', () => {
    const L = st.last; if (!L) return;
    const v = { n: L.moves, h: L.hammers, name: L.name, lv: T(L.level) };
    let key;
    if (L.winner === 3) key = 'x_draw';
    else if (L.mode === 'cpu') key = L.mine ? 'x_cpu_win' : 'x_cpu_lose';
    else if (L.mode === 'online' && !L.watch) key = L.mine ? 'x_on_win' : 'x_on_lose';
    else key = 'x_local';
    const text = T(key, v) + '\n' + T('x_stat', v) + '\n#四ツ目のダルマ #ブラウザゲーム';
    const url = 'https://nasubi-no-oniwa.github.io/yotsume/';
    window.open('https://x.com/intent/post?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank', 'noopener');
  });
  // ボタンを押した手ごたえ（音だけ）
  document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.btn, .icon-btn, .langs button')) { Sound.init(); Sound.tap(); } }, true);
  Sound.wantMusic = true; Sound.level(0.6);

  requestAnimationFrame(frame);
})();
