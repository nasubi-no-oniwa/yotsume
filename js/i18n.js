// =============================================
//  ことば（日本語・English・繁體中文・한국어）
//  ===========================================

(function () {
  var LANGS = ['ja', 'en', 'zh', 'ko'];
  var KEY = 'daruma-lang';   // 古い「4つ目のダルマ」と同じ設定を使う
  var D = {
 "lang_label": [
  "ことば",
  "Language",
  "語言",
  "언어"
 ],
 "home": [
  "なすびのお庭へ",
  "Nasubi's Garden (more games)",
  "前往茄子的庭院",
  "가지의 정원으로"
 ],
 "howto": [
  "あそびかた",
  "How to play",
  "玩法",
  "플레이 방법"
 ],
 "close": [
  "とじる",
  "Close",
  "關閉",
  "닫기"
 ],
 "back": [
  "もどる",
  "Back",
  "返回",
  "돌아가기"
 ],
 "to_title": [
  "タイトルへ",
  "Back to title",
  "回到標題",
  "타이틀로"
 ],
 "again": [
  "もう一回",
  "Play again",
  "再來一局",
  "한 판 더"
 ],
 "easy": [
  "よわい",
  "Easy",
  "簡單",
  "약함"
 ],
 "normal": [
  "ふつう",
  "Normal",
  "普通",
  "보통"
 ],
 "hard": [
  "つよい",
  "Hard",
  "困難",
  "강함"
 ],
 "vs_cpu": [
  "CPUとたいせん",
  "VS CPU",
  "對戰CPU",
  "CPU와 대전"
 ],
 "online": [
  "あいことばで対戦",
  "Play with a passcode",
  "用暗號對戰",
  "암호로 대전"
 ],
 "passcode": [
  "あいことば",
  "Passcode",
  "暗號",
  "암호"
 ],
 "name": [
  "なまえ",
  "Name",
  "名字",
  "이름"
 ],
 "noname": [
  "ななし",
  "Anonymous",
  "無名氏",
  "익명"
 ],
 "online_hint": [
  "同じあいことばを入れた人と対戦。3人目からは観戦になります。",
  "Play against whoever enters the same passcode. From the 3rd person on, you watch.",
  "和輸入相同暗號的人對戰。第3個人開始為觀戰。",
  "같은 암호를 입력한 사람과 대전. 3번째 사람부터는 관전이 됩니다."
 ],
 "join": [
  "はいる",
  "Join",
  "進入",
  "입장"
 ],
 "wait_pre": [
  "あいことば「",
  "Passcode: ",
  "暗號「",
  "암호 「"
 ],
 "wait_post": [
  "」",
  "",
  "」",
  "」"
 ],
 "waiting": [
  "あいてを待っています…",
  "Waiting for an opponent…",
  "等待對手中…",
  "상대를 기다리는 중…"
 ],
 "copy_link": [
  "さそうリンクをコピー",
  "Copy invite link",
  "複製邀請連結",
  "초대 링크 복사"
 ],
 "copied": [
  "コピーしました！",
  "Copied!",
  "已複製！",
  "복사했어요!"
 ],
 "send_link": [
  "このリンクを送ってください",
  "Send this link",
  "請傳送這個連結",
  "이 링크를 보내 주세요"
 ],
 "err_code": [
  "あいことばを入れてください（. # $ / [ ] は使えません）",
  "Enter a passcode (. # $ / [ ] are not allowed)",
  "請輸入暗號（不能使用 . # $ / [ ]）",
  "암호를 입력해 주세요 (. # $ / [ ] 는 사용할 수 없어요)"
 ],
 "err_code_short": [
  "あいことばを入れてください",
  "Enter a passcode",
  "請輸入暗號",
  "암호를 입력해 주세요"
 ],
 "connecting": [
  "つないでいます…",
  "Connecting…",
  "連線中…",
  "연결 중…"
 ],
 "err_net": [
  "通信できませんでした。電波のよいところでもう一度ためしてください",
  "Couldn't connect. Please try again where the signal is better.",
  "無法連線。請在訊號好的地方再試一次。",
  "연결하지 못했어요. 신호가 좋은 곳에서 다시 시도해 주세요."
 ],
 "err_notready": [
  "オンライン対戦はまだ準備中です",
  "Online play isn't ready yet",
  "線上對戰還在準備中",
  "온라인 대전은 아직 준비 중이에요"
 ],
 "err_conn": [
  "つながりませんでした",
  "Couldn't connect",
  "無法連線",
  "연결되지 않았어요"
 ],
 "left_win": [
  "相手が抜けたので、あなたの勝ち！",
  "Your opponent left, so you win!",
  "對手離開了，你贏了！",
  "상대가 나가서 당신의 승리!"
 ],
 "left": [
  "あいてが退室しました",
  "Your opponent left",
  "對手已離開",
  "상대가 퇴장했어요"
 ],
 "watch_in": [
  "観戦で入りました。試合が始まるのを待っています…",
  "You joined as a spectator. Waiting for the game to start…",
  "已用觀戰身分進入。等待比賽開始…",
  "관전으로 입장했어요. 경기 시작을 기다리는 중…"
 ],
 "wait_next": [
  "次の試合が始まるのを待っています…",
  "Waiting for the next game…",
  "等待下一局開始…",
  "다음 경기를 기다리는 중…"
 ],
 "wait_rematch": [
  "あいての「もう一回」を待っています…",
  "Waiting for your opponent to choose \"Play again\"…",
  "等待對手按「再來一局」…",
  "상대의 '한 판 더'를 기다리는 중…"
 ],
 "you": [
  "あなた",
  "You",
  "你",
  "나"
 ],
 "cpu": [
  "CPU",
  "CPU",
  "CPU",
  "CPU"
 ],
 "your_turn": [
  "あなたの番",
  "Your turn",
  "輪到你",
  "내 차례"
 ],
 "cpu_wait_label": [
  "CPU（ふつう）と遊びながら待つ",
  "Play the CPU (Normal) while waiting",
  "一邊和CPU（普通）玩一邊等",
  "기다리는 동안 CPU(보통)와 플레이"
 ],
 "qm_btn": [
  "だれかと対戦",
  "Play someone online",
  "隨機對戰",
  "아무나와 대전"
 ],
 "qm_stat": [
  "対戦待ち <b>{w}</b>人・対戦中 <b>{p}</b>組",
  "<b>{w}</b> waiting · <b>{p}</b> playing",
  "等待中 <b>{w}</b>人・對戰中 <b>{p}</b>組",
  "대기 <b>{w}</b>명 · 대전 중 <b>{p}</b>쌍"
 ],
 "qm_prime_hot": [
  "🔥 いま対戦タイム！（22時まで）",
  "🔥 Battle time now! (until 22:00 JST)",
  "🔥 現在是對戰時間！（到日本時間22點）",
  "🔥 지금은 대전 타임! (일본 시간 22시까지)"
 ],
 "qm_prime": [
  "🌙 毎晩21時〜22時は対戦タイム",
  "🌙 Battle time every night 21:00–22:00 JST",
  "🌙 每晚日本時間21〜22點是對戰時間",
  "🌙 매일 밤 일본 시간 21~22시는 대전 타임"
 ],
 "qm_sub": [
  "いま待っている人と、自動でつながります。",
  "You'll be matched automatically with someone who's waiting.",
  "自動和正在等待的人配對。",
  "기다리고 있는 사람과 자동으로 연결돼요."
 ],
 "qm_go": [
  "さがす",
  "Find a match",
  "尋找",
  "찾기"
 ],
 "qm_badname": [
  "その名前は使えません。ほかの名前にしてね",
  "That name can't be used. Please choose another.",
  "這個名字不能使用，請換一個。",
  "그 이름은 사용할 수 없어요. 다른 이름으로 해 주세요."
 ],
 "qm_searching": [
  "相手をさがしています",
  "Looking for an opponent",
  "正在尋找對手",
  "상대를 찾는 중"
 ],
 "qm_wait_pre": [
  "いま対戦待ち ",
  "Waiting now: ",
  "目前等待中 ",
  "현재 대기 "
 ],
 "qm_wait_post": [
  "人",
  "",
  "人",
  "명"
 ],
 "qm_cpu": [
  "CPUと遊びながら待つ",
  "Play the CPU while waiting",
  "一邊和CPU玩一邊等",
  "기다리는 동안 CPU와 플레이"
 ],
 "qm_cancel": [
  "やめる",
  "Cancel",
  "取消",
  "그만두기"
 ],
 "qm_retry": [
  "もう一度さがす",
  "Search again",
  "再找一次",
  "다시 찾기"
 ],
 "qm_searching_t": [
  "相手をさがしています… {t}",
  "Looking for an opponent… {t}",
  "正在尋找對手… {t}",
  "상대를 찾는 중… {t}"
 ],
 "qm_calling": [
  "CPUと遊んでいる人に声をかけています…",
  "Inviting someone who is playing the CPU…",
  "正在邀請正在和CPU玩的人…",
  "CPU와 플레이 중인 사람에게 신청하는 중…"
 ],
 "qm_declined": [
  "相手が見送りました。ほかの人をさがします",
  "They passed. Looking for someone else.",
  "對方跳過了，改找其他人。",
  "상대가 넘겼어요. 다른 사람을 찾을게요."
 ],
 "qm_found": [
  "相手が見つかりました！",
  "Opponent found!",
  "找到對手了！",
  "상대를 찾았어요!"
 ],
 "qm_avail": [
  "対戦できる相手がいます！",
  "Someone is ready to play!",
  "有可以對戰的對手！",
  "대전할 수 있는 상대가 있어요!"
 ],
 "qm_play": [
  "対戦する",
  "Play",
  "對戰",
  "대전하기"
 ],
 "qm_pass": [
  "見送る",
  "Pass",
  "跳過",
  "넘기기"
 ],
 "qm_taken": [
  "さっきの相手は、ほかの人と対戦を始めました。もう少し待ってね",
  "That player started a match with someone else. Please wait a little longer.",
  "剛才的對手已經和別人開始對戰了。請再等一下。",
  "방금 상대는 다른 사람과 대전을 시작했어요. 조금만 더 기다려 주세요."
 ],
 "qm_fail": [
  "相手とつながりませんでした（{c}）",
  "Couldn't connect to your opponent ({c})",
  "無法和對手連線（{c}）",
  "상대와 연결되지 않았어요 ({c})"
 ],
 "qm_nojoin": [
  "入れませんでした",
  "Couldn't join",
  "無法進入",
  "들어가지 못했어요"
 ],
 "qm_next": [
  "次の相手をさがす",
  "Find next opponent",
  "尋找下一位對手",
  "다음 상대 찾기"
 ],
 "x_post": [
  "Xに投稿",
  "Post on X",
  "分享到 X",
  "X에 올리기"
 ],
 "x_cpu_win": [
  "「四ツ目のダルマ」でCPU（{lv}）に勝った！",
  "Beat the CPU ({lv}) in The Fourth Daruma!",
  "在「第四尊達摩」打敗了CPU（{lv}）！",
  "「네 번째 달마」에서 CPU({lv})를 이겼다!"
 ],
 "x_cpu_lose": [
  "「四ツ目のダルマ」でCPU（{lv}）に負けた…",
  "Lost to the CPU ({lv}) in The Fourth Daruma…",
  "在「第四尊達摩」輸給了CPU（{lv}）…",
  "「네 번째 달마」에서 CPU({lv})에게 졌다…"
 ],
 "x_on_win": [
  "「四ツ目のダルマ」の対戦で勝った！",
  "Won an online match in The Fourth Daruma!",
  "在「第四尊達摩」的對戰中獲勝！",
  "「네 번째 달마」 대전에서 이겼다!"
 ],
 "x_on_lose": [
  "「四ツ目のダルマ」の対戦で負けた…",
  "Lost an online match in The Fourth Daruma…",
  "在「第四尊達摩」的對戰中落敗…",
  "「네 번째 달마」 대전에서 졌다…"
 ],
 "x_local": [
  "「四ツ目のダルマ」で{name}の勝ち！",
  "{name} wins in The Fourth Daruma!",
  "「第四尊達摩」{name}獲勝！",
  "「네 번째 달마」 {name} 승리!"
 ],
 "x_draw": [
  "「四ツ目のダルマ」で引き分け！",
  "A draw in The Fourth Daruma!",
  "「第四尊達摩」平手！",
  "「네 번째 달마」 무승부!"
 ],
 "x_stat": [
  "{n}手・だるま落とし{h}回",
  "{n} moves, {h} rows knocked out",
  "{n}手・敲掉{h}層",
  "{n}수 · 달마 떨어뜨리기 {h}회"
 ],
 "doc_title": [
  "四ツ目のダルマ",
  "The Fourth Daruma",
  "第四尊達摩",
  "네 번째 달마"
 ],
 "doc_desc": [
  "交互にダルマを落として4つ並べたら勝ち。3ターンごとに、予告された段がだるま落としで抜ける！",
  "Take turns dropping darumas — line up 4 to win. Every 3 turns, a hammer knocks out the announced row!",
  "輪流投下達摩，連成4個就贏。每3回合，預告的那一層會被敲掉！",
  "번갈아 달마를 떨어뜨려 4개를 이으면 승리. 3턴마다 예고된 줄이 망치에 맞아 빠진다!"
 ],
 "logo": [
  "<small>四ツ目の</small>ダルマ",
  "<small>THE FOURTH</small>DARUMA",
  "<small>第四尊</small>達摩",
  "<small>네 번째</small>달마"
 ],
 "tagline": [
  "交互に落として、4つ並べたら勝ち。<br>でも3ターンごとに、<b>だるま落とし</b>で段が抜ける。",
  "Take turns dropping. Line up 4 to win.<br>But every 3 turns, a <b>hammer knocks out a row</b>.",
  "輪流投下，連成4個就贏。<br>但每3回合，<b>小槌會敲掉一整層</b>。",
  "번갈아 떨어뜨려 4개를 이으면 승리.<br>하지만 3턴마다 <b>망치가 한 줄을 쳐서 빼낸다</b>."
 ],
 "local": [
  "ふたりで（この端末）",
  "2 players (this device)",
  "雙人（同一裝置）",
  "둘이서 (이 기기)"
 ],
 "menu": [
  "メニュー",
  "Menu",
  "選單",
  "메뉴"
 ],
 "ex_code": [
  "例：だるま123",
  "e.g. daruma123",
  "例：daruma123",
  "예: daruma123"
 ],
 "h1": [
  "赤と青が<b>交互に</b>、好きな列の上からダルマを落とす。",
  "Red and Blue <b>take turns</b> dropping a daruma into any column.",
  "紅和藍<b>輪流</b>從任意一直行的上方投下達摩。",
  "빨강과 파랑이 <b>번갈아</b> 원하는 줄 위에서 달마를 떨어뜨린다."
 ],
 "h2": [
  "縦・横・ななめのどれかで<b>4つ並べたら勝ち</b>。",
  "Get <b>4 in a row</b> — vertical, horizontal or diagonal — to win.",
  "直、橫、斜任一方向<b>連成4個就贏</b>。",
  "세로·가로·대각선 중 하나로 <b>4개를 이으면 승리</b>."
 ],
 "h3": [
  "2人が1回ずつ落として1ターン。<b>3ターンごとに、小槌が指している段がだるま落としで抜けて</b>、上のダルマがストンと落ちる。",
  "One drop each = 1 turn. <b>Every 3 turns, the row the hammer points at gets knocked out</b>, and the darumas above drop down.",
  "兩人各投一次為1回合。<b>每3回合，小槌指著的那一層會被敲掉</b>，上面的達摩會掉下來。",
  "두 사람이 한 번씩 떨어뜨리면 1턴. <b>3턴마다 망치가 가리키는 줄이 빠지고</b>, 위의 달마가 툭 떨어진다."
 ],
 "h4": [
  "小槌の下の数字は「あと何ターンで抜けるか」。下の段ほど選ばれやすい。",
  "The number under the hammer shows how many turns until it strikes. Lower rows are picked more often.",
  "小槌下面的數字是「還有幾回合會敲掉」。越下面的層越容易被選中。",
  "망치 아래 숫자는 \"몇 턴 뒤에 빠지는지\". 아래 줄일수록 잘 선택된다."
 ],
 "h5": [
  "抜けた拍子に2人とも4つ並んだら、<b>並んだ列が多いほうの勝ち</b>。同じ数なら、並んだダルマが全部消えて続行（サドンデス）。",
  "If both players get 4 in a row after a knockout, <b>whoever has more lines wins</b>. If tied, all lined-up darumas vanish and play continues (sudden death).",
  "敲掉後如果兩人都連成4個，<b>連線較多的一方獲勝</b>。數量相同時，連成的達摩全部消失並繼續（驟死戰）。",
  "빠진 순간 둘 다 4개가 이어지면 <b>이어진 줄이 많은 쪽이 승리</b>. 같으면 이어진 달마가 모두 사라지고 계속 (서든데스)."
 ],
 "k_phone": [
  "スマホ",
  "Phone",
  "手機",
  "스마트폰"
 ],
 "k_phone_d": [
  "落としたい列をタップ",
  "Tap the column to drop into",
  "點選要投下的直行",
  "떨어뜨릴 줄을 탭"
 ],
 "k_pc_d": [
  "列をクリック<br>または ← → で選んで スペース<br>数字キー 1〜7 でも落とせる",
  "Click a column<br>or pick with ← → and press Space<br>Number keys 1–7 also work",
  "點擊直行<br>或用 ← → 選擇再按空白鍵<br>也可以用數字鍵 1〜7",
  "줄을 클릭<br>또는 ← → 로 고르고 스페이스<br>숫자 키 1~7 로도 가능"
 ],
 "cpu_easy": ["CPU よわい", "CPU Easy", "CPU 簡單", "CPU 약함"],
 "cpu_normal": ["CPU ふつう", "CPU Mid", "CPU 普通", "CPU 보통"],
 "cpu_hard": ["CPU つよい", "CPU Hard", "CPU 困難", "CPU 강함"],
 "red": [
  "赤",
  "Red",
  "紅",
  "빨강"
 ],
 "blue": [
  "青",
  "Blue",
  "藍",
  "파랑"
 ],
 "start": [
  "スタート！",
  "START!",
  "開始！",
  "시작!"
 ],
 "row_bottom": ["いちばん下", "Bottom row", "最下層", "맨 아래 줄"],
 "row_n": ["下から{n}段目", "Row {n}", "由下往上第{n}層", "아래 {n}번째 줄"],
 "hammer_none": [
  "だるま落としまで —",
  "Next knockout —",
  "下次敲擊 —",
  "다음 망치 —"
 ],
 "hammer_now": ["このターンで {row}が抜ける！", "{row} goes out this turn!", "這回合{row}會被敲掉！", "이번 턴 {row} 빠짐!"],
 "hammer_left": ["あと{n}ターンで {row}が抜ける", "{row} goes out in {n} turns", "再{n}回合，{row}會被敲掉", "{n}턴 뒤 {row} 빠짐"],
 "turn_of": [
  "{name} の番",
  "{name}'s turn",
  "輪到{name}",
  "{name} 차례"
 ],
 "cpu_thinking": [
  "CPUが考え中…",
  "CPU is thinking…",
  "CPU思考中…",
  "CPU 생각 중…"
 ],
 "sudden": [
  "サドンデス！",
  "SUDDEN DEATH!",
  "驟死戰！",
  "서든데스!"
 ],
 "hammer_label": [
  "だるま落とし！",
  "KNOCKOUT!",
  "敲掉！",
  "쾅! 빠졌다!"
 ],
 "draw": [
  "引き分け",
  "Draw",
  "平手",
  "무승부"
 ],
 "you_win": [
  "あなたの勝ち！",
  "You win!",
  "你贏了！",
  "승리!"
 ],
 "cpu_win": [
  "CPUの勝ち…",
  "CPU wins…",
  "CPU贏了…",
  "CPU 승리…"
 ],
 "x_wins_sad": [
  "{name} の勝ち…",
  "{name} wins…",
  "{name}贏了…",
  "{name} 승리…"
 ],
 "x_wins": [
  "{name} の勝ち！",
  "{name} wins!",
  "{name}贏了！",
  "{name} 승리!"
 ],
 "by_hammer": [
  "だるま落としで勝負がついた！（{a} 対 {b}）",
  "Decided by the knockout! ({a} vs {b})",
  "敲掉後分出勝負！（{a} 比 {b}）",
  "망치로 승부가 났다! ({a} 대 {b})"
 ],
 "lined": [
  "{name} が4つそろえた！",
  "{name} got 4 in a row!",
  "{name}連成4個了！",
  "{name} 4개 연결!"
 ],
 "watchers": [
  "👀 {n}人が観戦中",
  "👀 {n} watching",
  "👀 {n}人觀戰中",
  "👀 {n}명 관전 중"
 ],
 "wins_u": [
  " 勝",
  " W",
  " 勝",
  "승"
 ],
 "timer": [
  "のこり {n}秒",
  "{n}s left",
  "剩 {n} 秒",
  "{n}초 남음"
 ]
};
  function pick() {
    try { var q = new URLSearchParams(location.search).get('lang'); if (q && LANGS.indexOf(q) >= 0) { try { localStorage.setItem(KEY, q); } catch (e) {} return q; } } catch (e) {}
    try { var s = localStorage.getItem(KEY); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || 'ja').toLowerCase();
    if (n.indexOf('ja') === 0) return 'ja'; if (n.indexOf('ko') === 0) return 'ko'; if (n.indexOf('zh') === 0) return 'zh'; return 'en';
  }
  var L = pick();
  function t(k, v) {
    var row = D[k]; var i = LANGS.indexOf(L);
    var s = row ? (row[i] != null ? row[i] : row[0]) : k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  function koFont() {
    var id = L === 'ko' ? 'ko-font' : L === 'zh' ? 'zh-font' : ''; if (!id || document.getElementById(id)) return;
    var l = document.createElement('link'); l.id = id; l.rel = 'stylesheet';
    l.href = L === 'ko' ? 'https://fonts.googleapis.com/css2?family=Song+Myung&family=Gowun+Batang:wght@400;700&display=swap'
                        : 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700;900&display=swap';
    document.head.appendChild(l);
  }
  function apply() {
    koFont();
    var de = document.documentElement;
    de.lang = L === 'zh' ? 'zh-Hant' : L; de.setAttribute('data-lang', L);
    document.querySelectorAll('[data-i]').forEach(function (e) { e.textContent = t(e.dataset.i); });
    document.querySelectorAll('[data-ih]').forEach(function (e) { e.innerHTML = t(e.dataset.ih); });
    document.querySelectorAll('[data-ip]').forEach(function (e) { e.placeholder = t(e.dataset.ip); });
    document.querySelectorAll('[data-ia]').forEach(function (e) { e.setAttribute('aria-label', t(e.dataset.ia)); });
    document.querySelectorAll('.langs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === L ? 'true' : 'false'); });
    document.title = t('doc_title');
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('doc_desc'));
    try { document.dispatchEvent(new CustomEvent('langchange', { detail: L })); } catch (e) {}
  }
  function set(l) { if (LANGS.indexOf(l) < 0) return; L = l; try { localStorage.setItem(KEY, l); } catch (e) {} apply(); }
  function bind() {
    document.querySelectorAll('.langs button').forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
    apply();
  }
  window.I18N = { t: t, set: set, apply: apply, get lang() { return L; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
