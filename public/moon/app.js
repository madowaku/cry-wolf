(function () {
  'use strict';
  const M = CWModel, S = CWStory, P = CWPresentation;
  const KEY = 'crywolf_moon_v09', LEGACY = 'crywolf_moon_v08', CLEARS = 'crywolf_moon_endings_v09', PREFS = 'crywolf_moon_preferences_v08';
  const READING = 'crywolf_moon_reading_v091';
  const $ = selector => document.querySelector(selector);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  let state = M.fresh(), saved = null, home = true, modal = null, returnFocus = null, lastAction = -Infinity;
  let preferences = { sound: false, motion: true, bgm: .22, effects: .7 }, storageOK = true, audio = null, effectBus = null, cleared = [];
  let audioUnlocked = false, readingStep = 0, viewRevision = -1, savedView = null;
  const volume = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
  try { saved = M.restore(localStorage.getItem(KEY)) || M.restore(localStorage.getItem(LEGACY)); } catch { storageOK = false; }
  try { const p = JSON.parse(localStorage.getItem(PREFS)); if (p) preferences = { sound: p.sound === true, motion: p.motion !== false, bgm: volume(p.bgm, .22), effects: volume(p.effects, .7) }; } catch { /* Invalid preferences do not discard a valid bookmark. */ }
  try { const c = JSON.parse(localStorage.getItem(CLEARS)); if (Array.isArray(c)) cleared = [...new Set(c.filter(id => Object.hasOwn(S.endingNames, id)))]; } catch { /* Collection is independent of the bookmark. */ }
  try { const v = JSON.parse(localStorage.getItem(READING)); if (v?.step === 1 && typeof v.bookmark === 'string') savedView = v; } catch { /* Reading position is optional; the core bookmark remains valid. */ }
  const musicSources = new Map();
  function musicSource(key) {
    if (musicSources.has(key)) return musicSources.get(key);
    const entry = window.CRYWOLF_MUSIC_PACK?.tracks?.[key];
    if (!entry) return '';
    const bytes = Uint8Array.from(atob(entry.data), c => c.charCodeAt(0) ^ 0x6d);
    const url = URL.createObjectURL(new Blob([bytes], { type: entry.mime }));
    musicSources.set(key, url); return url;
  }
  const music = CWAudio.createController({ createAudio: src => new Audio(src), sourceFor: musicSource, now: () => performance.now(), raf: callback => requestAnimationFrame(callback), caf: id => cancelAnimationFrame(id), onChange: updateMusicStatus });
  music.setVolume(preferences.bgm);
  function musicStatus() {
    const status = music.get().status;
    return ({ playing: '再生中', muted: preferences.sound && !audioUnlocked ? '操作すると音が始まります' : '音はOFF', paused: '一時停止', loading: '読み込み中', missing: 'BGMは追加待ち', blocked: '音をONにして再生してください', error: 'BGMを読み込めませんでした' })[status];
  }
  function updateMusicStatus() { const node = $('[data-music-status]'); if (node) node.textContent = musicStatus(); }
  function savePreferences() { try { localStorage.setItem(PREFS, JSON.stringify(preferences)); } catch { /* Controls work without storage. */ } }
  const asset = name => `assets/${name}.webp`;
  const night = () => Number(state.stage.slice(-1)) || 1;
  const label = () => ['epilogue', 'finish'].includes(state.phase) ? 'エピローグ' : S.stageNames[state.stage];
  function moon(id) {
    const k = ((home ? 1 : M.moon(state.stage)) - .5) * 2;
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="50" cy="50" r="42"/></clipPath></defs><image href="${asset('moon')}" width="100" height="100" clip-path="url(#${id})"/>${k >= 1 ? '' : `<path d="M50 8 A42 42 0 0 0 50 92 Q${50 - 84 * k} 50 50 8Z" fill="#23344b" opacity=".96"/>`}</svg>`;
  }
  const expressions = { smile: '微笑む', think: '考える', shy: '照れる', serious: '真剣な', surprise: '驚く', apology: '気まずそうな', relief: 'ほっとする', courage: '勇気を出す', worried: '困った', flustered: 'たじたじになる', thinking: '深く考え込む', concern: '気づかう', smirk: 'からかう', challenge: '強気な', guarded: '強がる', wait: '待っていた', laugh: '思わず笑う', proud: '誇り高く勝ち気な', tease: 'からかう', mischief: 'いたずらっぽく笑う', angry: '怒った', sad: '悲しみをこらえる', lonely: 'さみしげな', softened: '素直になりかけた' };
  function portrait(spec, index, total, speaker) {
    const [who, expression] = spec.split(':');
    const speaking = S.names[who] === speaker;
    return `<div class="actor actor-${who} ${total === 1 ? 'solo' : index === 0 ? 'left' : 'right'} ${speaking ? 'speaking' : ''}" data-character="${who}" data-expression="${expression || 'normal'}"><div class="actor-enter"><img class="portrait emotion-${expression || 'normal'}" src="${asset(who + (expression ? '-' + expression : ''))}" alt="${safe((expressions[expression] || '') + S.names[who])}" decoding="async" draggable="false"></div></div>`;
  }
  function stage(scene) {
    const view = P.visual(state, home, readingStep);
    if (view.kind === 'report') scene = { ...scene, caption: view.location === 'inside' ? '今夜の足跡：見張り道へ入った。' : '今夜の足跡：境界の外で止まった。' };
    const cast = view.kind === 'report' ? [] : scene.cast || ['bell:thinking'];
    const props = { bell: ['bell-prop', '村へ知らせる真鍮の鐘'], tracks: ['tracks', '境界に残るオオカミの足跡'], charm: ['charm', '赤い糸を結んだ、手彫りの月形チャーム'] };
    const element = $('#stage');
    element.className = `stage backdrop-${scene.backdrop || 'forest'} ${scene.effect ? 'effect-' + scene.effect : ''} ${home ? 'cover-stage' : ''} presentation-${view.kind} ${view.kind === 'reaction' && state.stage === 'night2' ? 'reaction-' + view.code : ''}`;
    element.dataset.presentation = view.kind; element.dataset.location = view.location || '';
    if (['howl', 'tracks', 'distance', 'listen', 'signal'].includes(view.kind)) { element.innerHTML = P.diagram(view); return; }
    element.innerHTML = `<img class="landscape" src="${asset(scene.backdrop === 'dawn' ? 'dawn' : scene.backdrop === 'forest' ? 'forest' : 'village')}" alt="${scene.backdrop === 'dawn' ? '朝日の差す村と見張り台、森へ続く道' : scene.backdrop === 'forest' ? '白い境界石と、古い泉へ続く森の道' : '灯りのともる村、木の見張り台、森へ向かう道'}"><div class="stage-shade"></div><div class="sky-moon">${moon('stage-moon')}</div><div class="scene-tag">${safe(home ? 'A LITTLE FABLE UNDER THE MOON' : label() + '  /  ' + (scene.backdrop === 'dawn' ? '村の朝' : scene.backdrop === 'forest' ? '森の境界' : '村の見張り道'))}</div>${scene.prop ? `<img class="prop prop-${scene.prop}" src="${asset(props[scene.prop][0])}" alt="${props[scene.prop][1]}">` : ''}${scene.effect === 'ring' && !scene.prop ? `<img class="prop prop-bell small-bell" src="${asset('bell-prop')}" alt="揺れる警報の鐘">` : ''}<div class="cast">${cast.map((c, i) => portrait(c, i, cast.length, scene.speaker)).join('')}</div>${scene.effect === 'signal' ? '<div class="signal-glow" aria-hidden="true"></div>' : ''}<div class="stage-caption">${safe(scene.caption || (home ? '叫ばない夜にも、ほんとうはある。' : ''))}</div>`;
  }
  function button(title, action, detail = '', primary = false, disabled = false) {
    return `<button class="choice ${primary ? 'primary' : ''}" data-act="${action}" data-revision="${state.revision}" ${disabled ? 'disabled' : ''}><span><strong>${safe(title)}</strong>${detail ? `<small>${safe(detail)}</small>` : ''}</span><span class="arrow" aria-hidden="true">${disabled ? '—' : '↗'}</span></button>`;
  }
  function hud() {
    return `<div class="stats" aria-label="今の関係">${[['trust', '村の信用', '村が報告を信じる度合い', 5], ['bond', '二人のきずな', 'ルナとの親しさと信頼', 5], ['insight', '合図の理解', '気持ちや意図の通じやすさ', 3]].map(([key, name, meaning, max]) => `<div class="stat ${key}"><div><span>${name}</span><b>${state[key]}<i> / ${max}</i></b></div><span class="stat-track" role="meter" aria-label="${name}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${state[key]}"><span style="width:${state[key] / max * 100}%"></span></span><small>${meaning}</small></div>`).join('')}</div>`;
  }
  function clock() {
    const max = ['night2', 'night5'].includes(state.stage) ? 2 : 3;
    return `<div class="clock"><span>残り <b>${state.ticks}</b> 刻</span><span class="clock-dots" aria-hidden="true">${Array.from({ length: max }, (_, i) => `<i class="${i < state.ticks ? 'available' : ''}"></i>`).join('')}</span><small>1行動で1刻 · 時間制限なし</small></div>`;
  }
  function evidence() {
    const f = state.flags;
    const rows = state.stage === 'night6' ? [[f.survey6, '道筋：羊小屋を避けて泉へ'], [f.village6, '村：一緒に確かめることに同意'], [f.forest6, '森：一緒に確かめることに同意']] : [[f.village3, '村：羊小屋は西、迂回路は東'], [f.forest3, '森：泉へ続く道が必要'], [f.agreement3, 'ルナ：東の丘を通ることに同意']];
    return `<ul class="evidence">${rows.map(([found, text]) => `<li class="${found ? 'found' : ''}">${found ? '✓' : '○'} ${text}${found ? '' : '（未確認）'}</li>`).join('')}</ul>`;
  }
  function boundary() {
    const known = ['report2', 'choice1', 'choice4', 'report5', 'choice7'].includes(state.phase);
    const inside = state.phase === 'choice1' || (state.phase === 'report2' && !state.flags.held2) || (state.phase === 'report5' && M.location5(state) === 'inside');
    const absent = state.phase === 'report5' && M.location5(state) === 'absent';
    return `<div class="boundary" aria-label="見張り道と森の境界"><span class="side">村・見張り道${known && inside ? '<b>ルナが入った</b>' : known ? '<b>侵入なし</b>' : '<small>入ったら鐘で報告</small>'}</span><span class="boundary-stone">境界石</span><span class="side">森${absent ? '<b>今夜は来ていない</b>' : known && !inside ? '<b>ルナは境界の外</b>' : '<small>森にいるだけなら鳴らさない</small>'}</span></div>`;
  }
  function noteMarkup(notes) {
    if (!notes.length) return '<p>手がかりは、見つけるとここに残ります。</p>';
    return notes.map(n => `<section class="note"><small>${S.stageNames[n.stage]}</small><h3>${safe(S.observations[n.id].title)}</h3><p>${safe(S.observations[n.id].text)}${n.crossed ? '\n最後の刻、ルナは見張り道へ入りました。' : ''}</p></section>`).join('');
  }
  function page(scene, buttons, body = '', eyebrow = '', hint = '') {
    $('#page').innerHTML = `<div class="page-inner"><div class="eyebrow">${safe(eyebrow || label())}</div><h1>${safe(scene.title)}</h1>${scene.speaker ? `<div class="speaker ${scene.speaker === 'ルナ' ? 'luna' : ''}"><span></span>${safe(scene.speaker)}</div>` : ''}${scene.text ? `<div class="prose">${safe(scene.text)}</div>` : ''}${hint || scene.hint ? `<p class="hint">${safe(hint || scene.hint)}</p>` : ''}${body}<div class="actions">${buttons}</div></div>`;
    stage(scene);
  }
  function render(focus = true) {
    if (viewRevision !== state.revision) { viewRevision = state.revision; readingStep = savedView?.bookmark === M.serialize(state) && P.hasReveal(state, 0) ? 1 : 0; }
    const role = P.musicRole(state, home);
    music.setPhase(({ opening: 'title', gameplay: 'night', ending: 'result' })[role]);
    $('#book').classList.toggle('motion-off', !preferences.motion);
    $('#chapter').innerHTML = `<div class="moon-nav">${moon('nav-moon')}<span>${home ? '七夜の絵本' : label()}<small>${home ? '25–40 MIN' : `${night()} / 7 夜`}</small></span></div>`;
    $('.footer > span').textContent = state.phase === 'finish' && !home ? 'おしまい。次は、あなたの言葉で。' : '月あかりの下、ほんとうを探す。';
    $('#save-status').textContent = storageOK ? (state.phase === 'title' ? '音は設定でONにできます' : 'しおりを保存しました') : 'この環境では保存できません · このまま遊べます';
    if (home) {
      const resumable = state.phase !== 'title' ? state : saved;
      const scene = { title: '嘘つきの夜に、\nほんとうの気持ち。', text: '村を守る、まじめな番犬ベル。\n森を守る、誇り高く勝ち気なオオカミ娘ルナ。\n\n鐘を鳴らすか。彼女の言葉を聞くか。\n満月までの七夜を、あなたの選択で。', cast: ['bell:worried', 'luna:proud'], backdrop: 'village' };
      page(scene, (resumable ? button('しおりから読む', 'resume', resumable.phase === 'interlude' ? '三夜のしおりから、第四夜へ' : resumable.phase === 'finish' ? '読み終えた結末へ' : `${S.stageNames[resumable.stage]}のつづき`, true) : '') + button('絵本をひらく', 'new', resumable ? '最初から新しく読む' : 'はじめから · タップでゆっくり進みます', !resumable), '<div class="cover-details"><span>観察する</span><i>→</i><span>気持ちを伝える</span><i>→</i><span>報告する</span></div><p class="edition">七夜とエピローグ · 4つの結末<br>いつでもしおりを挟んで、続きを読めます。</p>', 'CRY WOLF!  /  月あかりの約束');
    } else if (state.phase === 'story') {
      const scene = { ...S.readChapter(state) };
      if (state.stage === 'night2' && state.beat === 2) {
        Object.assign(scene, readingStep === 0 ? { title: '森の奥から、遠吠え。', text: '森の奥から、長い遠吠えがひとつ。\n姿は見えない。\nいまはまだ、遠い森の気配。', prop: undefined, hint: 'まずは、声の方角と距離を覚えておこう。' } : { title: '道の入口に、ふたつの足跡。', text: '道の入口には、大小の足跡。\n白い境界石の向こうは、森。\n\nいま、どこにいるんだろう。' });
      }
      if (state.stage === 'night3' && state.beat === 0 && state.flags.n1 === 'ring') scene.hint = '第一夜の正しい警報を覚えていた村長が、古地図を預けてくれました。村の調査は済んでいます。';
      if (state.stage === 'night3' && state.beat === 1 && state.flags.n1 === 'hide') scene.hint = '第一夜に話を聞いたベルにだけ、ルナが打ち明けました。仲間には泉への道が必要。森の調査は済んでいます。';
      page(scene, button(state.stage === 'night2' && state.beat === 2 && readingStep === 0 ? '足跡のページへ' : state.beat === M.counts[state.stage] - 1 ? (state.stage === 'intro' ? '第一夜へ' : state.stage === 'night1' ? '鐘の前に立つ' : '何をするか選ぶ') : 'つぎのページへ', 'next', '', true), '', `${label()}  /  ${state.beat + 1} — ${M.counts[state.stage]}`);
    } else if (state.phase === 'choice1') {
      page({ title: 'その鐘を、鳴らしますか。', speaker: 'ベル', text: 'ルナは、見張り道の内側にいる。\n仕事を守るか。理由を聞くために隠すか。', cast: ['bell:flustered', 'luna:proud'], backdrop: 'forest' }, button('「オオカミだ！」と知らせる', 'ring1', '正しい警報。村の信用が上がる') + button('見逃して、理由を聞く', 'hide1', '話せるけれど、翌朝の足跡で見逃しが分かる'), boundary() + hud(), '第一夜  /  最初の決断');
    } else if (state.phase === 'explore2') {
      page({ title: state.ticks === 2 ? '来ないって、言ったのに。' : '近づいてきた。あと一刻。', speaker: 'ベル', text: state.ticks === 2 ? 'ルナの言葉と、森の気配。\n今どこにいるか、確かめよう。' : '近い足音。\n今なら、ランタンの光が届くかもしれない。', cast: ['bell:thinking'], backdrop: 'village' }, button('足跡を調べる', 'track2', '境界の内側と外側を確かめる · 1刻') + button('耳を澄ます', 'listen2', '声と足音から距離を知る · 1刻') + button('灯りで「そこで待って」を送る', 'signal2', state.ticks === 2 ? 'まだ遠いと届かない · 1刻' : '光が届く距離になった · 1刻'), clock(), '第二夜  /  観察と合図');
    } else if (state.phase === 'observe') {
      const o = state.observation;
      const scene = { backdrop: 'forest', cast: ['bell:thinking'], ...S.observations[o.id] };
      if (o.crossed) scene.text += '\n\n最後の刻。ルナが見張り道の内側へ、一歩踏み入れた。';
      if (o.id === 'signal-far') scene.cast = ['bell:worried'];
      if (o.id === 'signal-near') scene.cast = ['bell:relief'];
      page(scene, button(state.ticks > 0 ? '次の一手を考える' : '村へ報告する', 'next', '', true), clock(), `${label()}  /  手帳に書きとめたこと`);
    } else if (state.phase === 'report2') {
      page({ title: '見たことを、言葉にする。', speaker: 'ベル', text: '交代の時間だ。\n見張り道へオオカミは入った？', cast: ['bell:concern'], backdrop: 'village', prop: 'bell' }, button('「オオカミだ！」と知らせる', 'ring2', '見張り道に入った場合だけ、正しい警報') + button('「異常なし」と報告する', 'silent2', '境界の外に留まっていれば、正しい報告'), boundary() + `<details><summary>今夜の手がかりを読み返す</summary>${noteMarkup(state.notes.filter(n => n.stage === 'night2'))}</details>`, '第二夜  /  報告');
    } else if (state.phase === 'explore3') {
      const f = state.flags;
      page({ title: 'どちらにも、理由がある。', speaker: 'ベル', text: '四夜後に閉じる、古い道。\n決めつける前に、何を確かめよう。', cast: ['bell:thinking'], backdrop: 'village' }, button('村の古地図を調べる', 'village3', f.village3 ? '調査済み · 刻は使いません' : '村が守りたいものを知る · 1刻', false, f.village3) + button('森の足跡をたどる', 'forest3', f.forest3 ? '調査済み · 刻は使いません' : 'ルナたちの道の先を知る · 1刻', false, f.forest3) + button('ルナ本人と話す', 'speak3', f.talk3 ? '会話済み' : '強がりの奥にある思いを聞く · 1刻', false, f.talk3) + button('東の丘を、灯りで提案する', 'signal3', f.agreement3 ? 'ルナが同意してくれた' : !f.held2 ? '前夜の共通の合図はまだない · 1刻' : f.village3 && f.forest3 ? '両方の事情がそろった。ルナの返事を待とう · 1刻' : '村と森を調べてからなら、行き先が伝わる · 1刻', false, f.agreement3), clock() + evidence(), '第三夜  /  ふたつの道');
    } else if (state.phase === 'report3') {
      const ready = M.legal(state).includes('proposal3');
      page({ title: '道の未来を、どう伝える？', speaker: 'ベル', text: '今夜、見張り道の内側に狼はいない。\n村長へ、確かめたことを伝えよう。', cast: ['bell:courage', 'mayor'], backdrop: 'village' }, button('東の丘を通る、新しい道を提案する', 'proposal3', ready ? '村の安全・森の泉・ルナの同意がそろった' : '村の事情・森の事情・ルナの同意が必要', ready, !ready) + button('分かった事実だけ、正直に話す', 'facts3', '分からないところも、そのまま伝える') + button('「オオカミが来た」と鐘を鳴らす', 'false3', '今夜は入っていない。根拠のない警報になる') + button('何も言わず、見守る', 'secret3', '相談は進まない'), evidence(), '第三夜  /  村長への報告');
    } else if (state.phase === 'choice4') {
      page({ title: '贈り物に、どんな言葉を。', speaker: 'ベル', text: '木の月は、誰かが時間をかけて削ったもの。\n森の側から、返事を待つ気配がする。', cast: ['bell:think', 'luna:guarded'], backdrop: 'forest' }, button('「オオカミだ！」と知らせる', 'ring4', '侵入はない。根拠のない警報になる') + button('「異常なし」と報告し、しまう', 'pocket4', '仕事の報告は正確。気持ちはまだ伝えない') + button('森へ「……ありがとう」と伝える', 'thank4', '贈ってくれた相手へ、まっすぐに'), boundary() + hud(), '第四夜  /  鐘のほかにある言葉');
    } else if (state.phase === 'evening5') {
      page({ title: '今夜、君に会いたい？', speaker: 'ベル', text: 'ルナが聞いているのは、僕の気持ち。\n誰かのせいにせずに、答えたい。', cast: ['bell:flustered', 'luna:serious'], backdrop: 'forest' }, button('会いたい。境界の外で待っていて', 'want5', '本音と、守りたい約束を一緒に伝える') + button('今夜は、来ない方がいい', 'away5', '今夜は距離を置くと伝える') + button('ルナが決めて', 'decide5', '自分の答えは、まだ渡せない'), hud(), '第五夜  /  夕方の返事', 'この返事だけでは村の信用は変わりません。夜の観察と報告は、このあとです。');
    } else if (state.phase === 'answer') {
      const scene = S.answers5[state.flags.answer5];
      page(scene, button('夜の見張りへ', 'next', '', true), `<p class="reason">${safe(scene.reason)}</p>${hud()}`, '第五夜  /  伝えた言葉');
    } else if (state.phase === 'explore5') {
      const text = state.flags.answer5 === 'want' ? '境界の外で待っていて、と伝えた。\n今夜の道を、自分の目と耳で確かめよう。' : state.flags.answer5 === 'away' ? '今夜は来ないで、と伝えた。\n残っている跡が、今夜のものか確かめよう。' : '気持ちも、待つ約束も、まだ伝えていない。\n今夜は最初から、光が届く距離だ。';
      page({ title: state.ticks === 2 ? '自分の言葉の、つづき。' : '報告の前に、あと一刻。', speaker: 'ベル', text, cast: ['bell:thinking'], backdrop: 'village' }, button('今夜の足跡を確かめる', 'track5', '境界の内側と外側を調べる · 1刻') + button('声と足音を聞く', 'listen5', '昔の言葉だけで決めつけない · 1刻') + button('灯りで「外で待って」を伝える', 'signal5', state.flags.answer5 === 'away' ? '今夜は来ないと答えている · 1刻' : '今夜は最初から光が届く · 1刻'), clock(), '第五夜  /  観察と合図');
    } else if (state.phase === 'report5') {
      page({ title: '気持ちと、事実を分けて。', speaker: 'ベル', text: '交代の前に、境界をもう一度見渡した。\n会いたかったかではなく、見張り道に入ったかを伝えよう。', cast: ['bell:serious'], backdrop: 'village', prop: 'bell' }, button('「オオカミだ！」と知らせる', 'ring5', '見張り道へ入ったときの警報') + button('「異常なし」と報告する', 'silent5', '来ていない、または境界の外にいる'), boundary() + `<details><summary>今夜の返事と手がかり</summary>${noteMarkup(state.notes.filter(n => n.stage === 'night5'))}</details>`, '第五夜  /  夜の報告');
    } else if (state.phase === 'explore6') {
      const f = state.flags;
      page({ title: '僕から、つなぐ。', speaker: 'ベル', text: '満月の夜が明けた朝、一緒に道を確かめられるように。\nそして、言えないまま終わらないように。', cast: ['bell:courage'], backdrop: 'village' }, button('東の丘の道筋を調べる', 'survey6', f.survey6 ? '地図あり · 刻は使いません' : '羊小屋を避けて泉へ行けるか · 1刻', false, f.survey6) + button('村長に、一緒に確かめてもらう', 'village6', f.village6 ? '村の同意を確認済み' : '村の意見を聞く · 1刻', false, f.village6) + button('ルナに、森の意見を聞く', 'forest6', f.forest6 ? '森の同意を確認済み' : '対等な約束を交わす · 1刻', false, f.forest6) + button('ルナに、自分の本音を話す', 'heart6', f.heart6 ? '自分の気持ちを伝えた' : '君と話す夜をなくしたくない · 1刻', false, f.heart6) + button('言葉を探して、待つ', 'wait6', '調査や約束は進まない · 1刻'), clock() + evidence(), '第六夜  /  最後の三刻');
    } else if (state.phase === 'report6') {
      const ready = M.roadReady(state);
      page({ title: '地図を、みんなの手へ。', speaker: 'ベル', text: '調べたことと、聞けた返事を伝えよう。\nそろっていない約束まで、できたことにはしない。', cast: ['bell:courage', 'mayor'], backdrop: 'village' }, button('満月の朝、村と森で道を確かめる', 'plan6', ready ? '道筋と双方の同意がそろった' : '道筋・村の同意・森の同意が必要', ready, !ready) + button('分かったことだけ、正直に残す', 'facts6', '共同確認は決まらない。信用を積み直す') + button('何も言わず、地図をしまう', 'hush6', '相談は進まない'), evidence() + hud(), '第六夜  /  満月の朝への約束');
    } else if (state.phase === 'choice7') {
      const eligible = M.canCall(state);
      page({ title: 'いま、誰を呼びたい。', speaker: 'ベル', text: '指先に、冷たい鐘。\n森の向こうには、七夜を過ごした相手。\n僕の口から出るのは、どんな言葉だろう。', cast: ['bell:thinking', 'luna:wait'], backdrop: 'forest', caption: '満月の下で、あなたの最後の言葉。' }, button('「オオカミだ！」', 'ring7', '侵入はない。警報で彼女を呼んでしまう') + button('「見張り道には、誰もいない」', 'silent7', '正しい報告。気持ちの名前はまだ呼ばない') + (eligible ? `<div class="final-word">${button('「……ルナ」', 'call7', '鐘を下ろして、会いたかったと伝える', true)}</div>` : ''), boundary(), '第七夜  /  CRY WOLF', eligible ? '伝え合った言葉を思い出す。急がなくて大丈夫。' : '村への信用、二人のきずな、素直に話した経験。積み重ねたものが、最後の言葉を変えます。');
    } else if (state.phase === 'result') {
      const scene = S.readResult(state);
      const changes = [['trust', '信用'], ['bond', 'きずな'], ['insight', '合図']].map(([key, name]) => `${name} ${state.result.before[key]} → ${state.result.after[key]}`).join('　/　');
      if (readingStep === 0) page(scene, button('この夜の理由を読む', 'next', '', true), '', `${label()}  /  二人に残った言葉`);
      else page({ ...scene, title: '今夜の選択が、残したこと。', speaker: '語り手', text: scene.reason, cast: ['bell:thinking'], prop: undefined, effect: undefined }, button(state.stage === 'night7' ? 'エピローグを読む' : state.stage === 'night3' ? 'ここまでを、振り返る' : '次の夜へ', 'next', '', true), `<p class="changes">${changes}</p>${hud()}`, `${label()}  /  選んだことが、残っていく`);
    } else if (state.phase === 'interlude') {
      const ideal = state.flags.n3 === 'proposal', honest = state.flags.n3 === 'facts';
      const scene = { title: ideal ? 'まだ、閉じていない道。' : honest ? '話し合いの、はじまり。' : '遠いままの、境界。', speaker: '語り手', text: ideal ? 'ピップは手紙を、かばんへ戻した。\n「まだ、届けられるかもしれないね」\n\nルナはベルの隣に立った。\n「今度は、私から合図する。見逃したら承知しないわよ」\nそう言って、先に歩かずベルを待った。' : honest ? 'まだ、道が残る約束はない。\nそれでも村長は、調べる時間をくれた。\n\n分からない、と正直に言えたことが、\n小さなはじまりになった。' : '道を閉じる日が近づいている。\nふたりの間には、まだ境界がある。\n\n次は、どんな言葉なら届くだろう。', cast: ideal ? ['bell:relief', 'luna:softened'] : ['bell:concern', honest ? 'luna:serious' : 'luna:lonely'], backdrop: 'village' };
      page(scene, button('第四夜へ、ページをめくる', 'next', '残り四夜。ふたりの言葉は、ここから変わる', true), `<div class="bookmark"><p>月はまだ、満ちる途中。</p><small>ここまでの選択をしおりに残しました。<br>今日はここで閉じても、続きから読めます。</small></div><details><summary>あなたが選んだ三夜</summary>${state.history.map(h => `<p>${S.stageNames[h.stage]}：${S.historyLabel(h)}</p>`).join('')}</details>${hud()}`, '三夜のしおり  /  折り返し');
    } else if (state.phase === 'epilogue') {
      page(S.readEpilogue(state), button(state.beat === 2 ? '絵本を、とじる' : 'つぎのページへ', 'next', '', true), '', `${S.endingTags[state.ending]}  /  エピローグ ${state.beat + 1} — 3`);
    } else if (state.phase === 'finish') {
      const scene = { title: S.endingNames[state.ending], text: '七つの夜と、そのあとの日々。\nあなたの言葉で、この絵本はここまで届きました。', cast: ['bell:smile', state.ending === 'HONEST' ? 'luna:softened' : state.ending === 'BAD_LIAR' ? 'luna:tease' : state.ending === 'SECRET_MEETING' ? 'luna:wait' : 'luna:smirk'], backdrop: state.ending === 'GOOD_DOG' ? 'village' : 'forest' };
      page(scene, button('後日談を、読み返す', 'epilogue') + button('もう一度、別の言葉で', 'new', '新しいしおりで、第一夜から', true) + button('読んだ結末を見る', 'collection'), `<div class="bookmark"><p>おしまい</p><small>${state.flags.road ? '村と森の共同確認で、東の丘の道が開きました。' : '古道は閉じました。遠回りをしながら、道の相談は続きます。'}</small></div><details><summary>あなたが選んだ七夜</summary>${state.history.map(h => `<p>${S.stageNames[h.stage]}：${S.historyLabel(h)}</p>`).join('')}<p>第五夜の夕方：${{ want: '会いたいと伝えた', away: '距離を置いた', decide: '答えを預けた' }[state.flags.answer5]}</p></details>${hud()}`, `${S.endingTags[state.ending]}  /  THE END`);
    }
    if (!home) {
      savedView = { bookmark: M.serialize(state), step: readingStep };
      try { localStorage.setItem(READING, JSON.stringify(savedView)); } catch { /* Extra reading pages also work without storage. */ }
    }
    if (focus) { $('#page').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }
  function persist() {
    if (state.phase === 'finish' && state.ending && !cleared.includes(state.ending)) cleared.push(state.ending);
    saved = state;
    try { localStorage.setItem(KEY, M.serialize(state)); localStorage.setItem(CLEARS, JSON.stringify(cleared)); storageOK = true; } catch { storageOK = false; }
  }
  function tone(kind) {
    if (!preferences.sound || preferences.effects === 0 || document.hidden) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
      if (!effectBus) { effectBus = audio.createGain(); effectBus.connect(audio.destination); }
      effectBus.gain.setValueAtTime(preferences.effects, audio.currentTime);
      for (const [i, freq] of (kind === 'ring' ? [784, 1176, 1568] : [523, 659]).entries()) {
        const osc = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime + i * .07;
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.024, at + .012); gain.gain.exponentialRampToValueAtTime(.0001, at + (kind === 'ring' ? 1.4 : .32));
        osc.connect(gain); gain.connect(effectBus); osc.start(at); osc.stop(at + 1.6);
      }
    } catch { /* Silent play remains fully usable. */ }
  }
  function act(action, revision) {
    if (modal) return;
    if (['gallery', 'collection'].includes(action) || (action === 'epilogue' && state.phase === 'finish')) { openModal(action); return; }
    if (action === 'new') {
      if ((state.phase !== 'title' && state.phase !== 'finish') || (home && saved && saved.phase !== 'finish')) { openModal('restart'); return; }
      start(); return;
    }
    if (action === 'resume') { if (state.phase === 'title' && saved) state = saved; home = false; render(); return; }
    if (home || performance.now() - lastAction < 220) return;
    if (action === 'next' && revision === state.revision && P.hasReveal(state, readingStep)) { readingStep = 1; lastAction = performance.now(); tone('page'); render(); return; }
    const next = M.transition(state, action, revision);
    if (next === state) return;
    lastAction = performance.now(); state = next; persist(); tone(action.startsWith('ring') || action === 'false3' ? 'ring' : 'page'); render();
  }
  function start() { savedView = null; viewRevision = -1; state = M.transition(M.fresh(), 'start'); home = false; lastAction = performance.now(); persist(); render(); }
  function closeModal() {
    modal = null; $('#modal-host').innerHTML = ''; $('#book').inert = false; document.body.classList.remove('modal-open');
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
  function openModal(kind) {
    if (!modal) returnFocus = document.activeElement;
    modal = kind;
    let title = '', body = '';
    if (kind === 'help') {
      title = '夜番の、小さな心得';
      body = '<p>あなたは夜番のベル。読む → 観察する → 報告する、の順に進みます。読む時間に制限はありません。</p><h3>鐘を鳴らすのは、どんなとき？</h3><p>オオカミが見張り道の内側に入ったとき。森にいるだけなら鳴らしません。翌朝の足跡で、報告と合っているか分かります。第四夜の贈り物、第七夜のルナは境界の外です。</p><h3>第二夜：距離を知って、合図する</h3><p>行動は2刻。最初は遠く、次の刻には近づきます。ランタンの合図は届く距離でだけ伝わります。</p><h3>第三夜：どちらの事情も聞く</h3><p>村・森・ルナの同意がそろうと、新しい道を提案できます。分かった事実だけを正直に伝える道もあります。</p><h3>第四夜・第五夜：本音と仕事</h3><p>贈り物には、お礼を言うこともできます。第五夜の夕方の返事だけでは村の信用は変わりません。「境界の外で会いたい」と頼めば外で待ち、「来ない方がいい」と伝えれば来ません。答えを預けた場合は、合図がなければ最後の刻に見張り道へ入ります。今夜の合図は最初から届きます。</p><h3>第六夜：明日の道をつくる</h3><p>道筋・村の同意・森の同意が必要です。第三夜に提案した地図は引き継ぎます。残り3刻で、自分から話しに行きましょう。本音を伝える一刻も選べます。</p><h3>第七夜：最後の呼びかけ</h3><p>村への信用、二人のきずな、素直に話した経験がそろうと、もうひとつの言葉が浮かびます。待たずに別の言葉を選んでも大丈夫。選んだあとは、結末ごとに3ページの後日談があります。</p>' + hud() + '<p>信用ときずなは0〜5、合図の理解は0〜3。信用0でも物語は続き、正直な報告で積み直せます。通り道の決着と二人の関係は、それぞれ後日談に反映されます。</p><h3>月と、しおり</h3><p>半月から第七夜の満月へ。月は得点ではなく時間の印です。ページと選択を自動保存し、読み終えた結末も別に記録します。三夜版v0.8のしおりからも続けられます。</p><p>Tabで選ぶ、Enter / Spaceで決定、読む画面ではEnterで次へ。Escapeでこの窓を閉じます。</p>';
    } else if (kind === 'notes') {
      title = 'ベルの手がかり手帳'; body = noteMarkup(state.notes) + (state.history.length ? '<h3>これまでの夜</h3>' + state.history.map(h => `<p>${S.stageNames[h.stage]}：${S.historyLabel(h)}</p>`).join('') : '');
    } else if (kind === 'settings') {
      title = '音と、ページの動き'; body = `<button class="choice" data-ui="sound" aria-pressed="${preferences.sound}"><span><strong>音：${preferences.sound ? 'ON' : 'OFF'}</strong><small>BGMと、鐘・ページの効果音</small></span></button><p class="audio-state"><span data-music-status role="status">${musicStatus()}</span> · ${CWAudio.tracks[music.get().target].title}</p><div class="audio-levels"><label for="moon-bgm"><span>BGM <output id="moon-bgm-level" for="moon-bgm">${Math.round(preferences.bgm * 100)}%</output></span><input id="moon-bgm" data-volume="bgm" type="range" min="0" max="100" value="${Math.round(preferences.bgm * 100)}"></label><label for="moon-effects"><span>効果音 <output id="moon-effects-level" for="moon-effects">${Math.round(preferences.effects * 100)}%</output></span><input id="moon-effects" data-volume="effects" type="range" min="0" max="100" value="${Math.round(preferences.effects * 100)}"></label></div><button class="choice" data-ui="motion"><span><strong>動き：${preferences.motion ? 'ON' : 'OFF'}</strong><small>端末の「視差効果を減らす」設定も優先します</small></span></button><details class="music-credits"><summary>音楽のクレジット</summary><ul>${Object.values(CWAudio.tracks).map(t => `<li>${t.role}：<a href="${t.page}" target="_blank" rel="noopener noreferrer">${t.title}</a><br>${t.author} / OpenTracks</li>`).join('')}</ul></details><button class="choice" data-ui="gallery"><strong>登場人物と絵を見る</strong><span>↗</span></button><button class="choice" data-ui="collection"><strong>読んだ結末 ${cleared.length} / 4</strong><span>↗</span></button>`;
    } else if (kind === 'restart') {
      title = '新しいしおりに、替えますか？'; body = '<p>いまのしおりを置き換えて、序章から読み直します。読み終えた結末の記録は残ります。</p><button class="choice primary" data-ui="confirm-restart"><strong>最初から読む</strong></button><button class="choice" data-ui="close"><strong>今のしおりを残す</strong></button>';
    } else if (kind === 'collection') {
      title = `読んだ結末 ${cleared.length} / 4`;
      body = '<p>あなたが最後まで読んだ結末のしおりです。</p><div class="ending-collection">' + Object.entries(S.endingNames).map(([id, name]) => `<section class="ending-stamp ${cleared.includes(id) ? 'read' : ''}"><small>${cleared.includes(id) ? S.endingTags[id] : 'まだ読んでいない結末'}</small><h3>${cleared.includes(id) ? name : '閉じたしおり'}</h3></section>`).join('') + '</div>';
    } else if (kind === 'epilogue' && state.ending) {
      title = S.endingNames[state.ending];
      body = [0, 1, 2].map(beat => { const scene = S.readEpilogue({ ...state, beat }); return `<section class="note"><small>エピローグ ${beat + 1} / 3</small><h3>${safe(scene.title)}</h3><p>${safe(scene.text)}</p></section>`; }).join('');
    } else if (kind === 'gallery') {
      title = '月あかりの、登場人物';
      const entries = [['luna-proud', 'ルナ · 誇り高く、勝ち気'], ['luna-tease', 'ルナ · からかう'], ['luna-mischief', 'ルナ · いたずらっぽい笑み'], ['luna-angry', 'ルナ · 怒る'], ['luna-serious', 'ルナ · 真剣な約束'], ['luna-sad', 'ルナ · 悲しみをこらえる'], ['luna-lonely', 'ルナ · さみしげな横顔'], ['luna-softened', 'ルナ · 素直になりかけて'], ['luna-surprise', 'ルナ · 驚き'], ['luna-worried', 'ルナ · 心配'], ['luna-relief', 'ルナ · 安堵'], ['luna-laugh', 'ルナ · 思わず笑う'], ['pip', 'ピップ · 小さなウサギの郵便屋'], ['mayor', '村長 · 村の暮らしを気にかける人'], ['bell-worried', 'ベル · 困った顔'], ['bell-flustered', 'ベル · たじたじ'], ['bell-thinking', 'ベル · 考え込む'], ['bell-concern', 'ベル · 気づかう'], ['bell-surprise', 'ベル · 驚き'], ['bell-apology', 'ベル · 気まずい'], ['bell-relief', 'ベル · 安堵'], ['bell-courage', 'ベル · 勇気']];
      body = `<p>誰にも負けたくない。けれど、ひとりでは届かない夜もある。<br>ルナの強さと、その奥にある気持ち。</p><div class="gallery">${entries.map(([id, text]) => `<figure><div><img src="${asset(id)}" alt="${text}" loading="lazy"></div><figcaption>${text}</figcaption></figure>`).join('')}</div>`;
    }
    $('#modal-host').innerHTML = `<div class="veil"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">${title}</h2><button data-ui="close" aria-label="閉じる">×</button></header>${body}<button class="choice" data-ui="close"><strong>絵本へ戻る</strong></button></section></div>`;
    $('#book').inert = true; document.body.classList.add('modal-open'); $('#modal-host [data-ui="close"]').focus();
  }
  document.addEventListener('click', event => {
    if (event.isTrusted && !audioUnlocked) { audioUnlocked = true; music.setMuted(!preferences.sound); }
    const control = event.target.closest('button, [data-ui]'); if (!control || control.disabled) return;
    const ui = control.dataset.ui;
    if (ui) {
      event.preventDefault();
      if (ui === 'close') closeModal();
      else if (ui === 'home') { home = true; render(); }
      else if (ui === 'confirm-restart') { closeModal(); start(); }
      else if (ui === 'sound' || ui === 'motion') {
        preferences[ui] = !preferences[ui];
        savePreferences();
        if (ui === 'sound') { music.setMuted(!preferences.sound || !audioUnlocked); if (effectBus) effectBus.gain.setValueAtTime(preferences.sound ? preferences.effects : 0, audio.currentTime); }
        $('#book').classList.toggle('motion-off', !preferences.motion);
        openModal('settings'); $(`[data-ui="${ui}"]`).focus(); if (ui === 'sound') tone('page');
      } else openModal(ui);
    } else if (control.dataset.act) act(control.dataset.act, Number(control.dataset.revision));
  });
  document.addEventListener('input', event => {
    const node = event.target;
    if (!node.matches('input[data-volume]')) return;
    const key = node.dataset.volume;
    preferences[key] = volume(Number(node.value) / 100, preferences[key]);
    if (key === 'bgm') music.setVolume(preferences.bgm);
    else if (effectBus) effectBus.gain.setValueAtTime(preferences.sound ? preferences.effects : 0, audio.currentTime);
    $(`#moon-${key}-level`).textContent = Math.round(preferences[key] * 100) + '%'; savePreferences();
  });
  document.addEventListener('keydown', event => {
    if (event.isTrusted && ['Enter', ' '].includes(event.key) && !audioUnlocked) { audioUnlocked = true; music.setMuted(!preferences.sound); }
    if (modal) {
      if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
      if (event.key === 'Tab') {
        const items = [...$('#modal-host').querySelectorAll('button:not(:disabled),input,summary,a[href]')].filter(node => node.getClientRects().length);
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (event.key === 'Enter' && !event.repeat && !event.target.closest('button,a,summary,input') && !home && M.legal(state).includes('next')) {
      event.preventDefault(); act('next', state.revision);
    }
  });
  window.addEventListener('crywolf-music-ready', () => music.refresh());
  document.addEventListener('visibilitychange', () => { music.setSuspended(document.hidden); if (document.hidden) audio?.suspend(); });
  window.addEventListener('pagehide', event => { music.setSuspended(true); audio?.suspend(); if (!event.persisted) { music.dispose(); for (const url of musicSources.values()) URL.revokeObjectURL(url); } });
  window.addEventListener('pageshow', () => music.setSuspended(document.hidden));
  Object.defineProperty(window, '__cwMoon', { get: () => JSON.parse(JSON.stringify({ ...state, home, modal, storageOK, presentationStep: readingStep })) });
  Object.defineProperty(window, '__cwMoonAudio', { get: () => ({ ...music.get(), preferences: { ...preferences } }) });
  render(false);
})();
