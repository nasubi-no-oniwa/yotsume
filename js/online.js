// =============================================
//  合言葉オンライン対戦（Firebase Realtime Database）
//
//  データの形： daruma/{合言葉}/
//    players/{0|1}  : { id, name }           対戦者（最初に来た2人）
//    watchers/{id}  : { name }               観戦者（3人目以降）
//    ready/{0|1}    : 何回戦をやりたいか      （両方そろうと開始）
//    game           : { round, seed, startAt }（0番の人が書く）
//    mv/r{回戦}/{自動ID} : { c: 列, s: 席, i: 何手目 }  打った手（全員が同じ順で受け取る）
//    result/r{回戦} : { loser, why }          相手が抜けたときだけ使う
// =============================================
(function () {
  const clean = s => String(s || '').replace(/[.#$\[\]\/\s]/g, '').slice(0, 20);
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  class OnlineRoom {
    constructor(db, code, name, cb) {
      this.db = db;
      this.code = clean(code);
      this.name = (window.QM ? QM.ng(name) : String(name || '').trim().slice(0, 8)) || (window.I18N ? I18N.t('noname') : 'ななし');
      this.cb = cb || {};
      this.id = uid();
      this.slot = -1;
      this.players = {}; this.watchers = {};
      this.game = null; this.round = 0; this.results = {};
      this.subs = []; this.evSubs = [];
      this.offset = 0;
      this.root = db.ref('daruma/' + this.code);
      this.left = false;
    }
    call(name, ...a) { if (this.cb[name]) this.cb[name](...a); }
    now() { return Date.now() + this.offset; }
    on(ref, ev, fn) { ref.on(ev, fn); this.subs.push([ref, ev, fn]); }

    async join() {
      if (!this.code) throw new Error(window.I18N ? I18N.t('err_code_short') : '合言葉を入れてください');
      this.on(this.db.ref('.info/serverTimeOffset'), 'value', s => { this.offset = s.val() || 0; });
      for (const s of [0, 1]) {
        const ref = this.root.child('players/' + s);
        const res = await ref.transaction(cur => (cur ? undefined : { id: this.id, name: this.name }));
        if (res.committed && res.snapshot.val() && res.snapshot.val().id === this.id) { this.slot = s; break; }
      }
      if (this.slot >= 0) {
        const s = this.slot;
        this.root.child('players/' + s).onDisconnect().remove();
        this.root.child('ready/' + s).onDisconnect().remove();
        const g0 = (await this.root.child('game').once('value')).val();
        this.joinRound = ((g0 && g0.round) || 0) + 1;
      } else {
        const w = this.root.child('watchers/' + this.id);
        await w.set({ name: this.name });
        w.onDisconnect().remove();
      }
      this.on(this.root.child('players'), 'value', snap => {
        const prev = this.players;
        this.players = snap.val() || {};
        this.call('onPeople', this.people());
        if (this.slot >= 0 && this.game && !this.results['r' + this.round]) {
          const o = 1 - this.slot;
          if (prev[o] && !this.players[o]) this.report(o, 'left');
        }
        this.tryStart();
      });
      this.on(this.root.child('watchers'), 'value', snap => { this.watchers = snap.val() || {}; this.call('onPeople', this.people()); });
      this.on(this.root.child('ready'), 'value', snap => { this.ready = snap.val() || {}; this.tryStart(); });
      this.on(this.root.child('game'), 'value', snap => this.onGame(snap.val()));
      if (this.slot >= 0) await this.root.child('ready/' + this.slot).set(this.joinRound);
      return { slot: this.slot, code: this.code };
    }

    people() {
      const names = [0, 1].map(s => (this.players[s] ? (window.QM ? QM.ng(this.players[s].name) : this.players[s].name) : null));
      return { names, watchers: Object.keys(this.watchers).length, slot: this.slot };
    }

    tryStart() {
      if (this.slot !== 0 || this.left || !this.joinRound) return;
      const r = this.ready || {};
      const next = (this.game ? this.game.round : 0) + 1;
      if (!this.players[0] || !this.players[1]) return;
      if (!(r[0] >= next && r[1] >= next)) return;
      if (this.starting === next) return;
      this.starting = next;
      const seed = (Math.random() * 2147483647) | 0;
      this.root.child('game').set({ round: next, seed, startAt: this.now() + 1800 });
      if (next > 2) this.root.child('mv/r' + (next - 2)).remove();
    }

    onGame(g) {
      if (!g || this.left) { this.game = g; return; }
      if (this.game && this.game.round === g.round) return;
      this.game = g;
      if (this.slot >= 0 && this.joinRound && g.round < this.joinRound) return;
      this.round = g.round;
      for (const [ref, ev, fn] of this.evSubs) ref.off(ev, fn);
      this.evSubs = [];
      const R = 'r' + g.round;
      // 開始を先に知らせてから、手を受け取り始める（途中参加の観戦者は最初から再生される）
      this.call('onStart', { round: g.round, seed: g.seed, slot: this.slot, wait: Math.max(0, g.startAt - this.now()), names: this.people().names });
      const mref = this.root.child('mv/' + R);
      const mfn = snap => this.call('onMove', snap.val());
      mref.on('child_added', mfn); this.evSubs.push([mref, 'child_added', mfn]);
      const rref = this.root.child('result/' + R);
      const rfn = snap => { const v = snap.val(); if (!v || this.results[R]) return; this.results[R] = v; this.call('onResult', v); };
      rref.on('value', rfn); this.evSubs.push([rref, 'value', rfn]);
    }

    sendMove(c, i) { if (this.slot >= 0) this.root.child('mv/r' + this.round).push({ c, s: this.slot, i }); }
    report(loser, why) { this.root.child('result/r' + this.round).transaction(cur => (cur ? undefined : { loser, why: why || 'left' })); }
    rematch() { if (this.slot >= 0) this.root.child('ready/' + this.slot).set(this.round + 1); }

    leave() {
      if (this.left) return;
      this.left = true;
      for (const [ref, ev, fn] of this.subs.concat(this.evSubs)) ref.off(ev, fn);
      this.subs = []; this.evSubs = [];
      if (this.slot >= 0) { this.root.child('players/' + this.slot).remove(); this.root.child('ready/' + this.slot).remove(); }
      else this.root.child('watchers/' + this.id).remove();
    }
  }
  DG.OnlineRoom = OnlineRoom;
  DG.cleanCode = clean;
})();
