import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createGame, gameReducer, type Action } from '../core/engine';
import { DEFAULT_SEED } from '../core/config';
import type { GameState, Line, DebugScenario, NightRecord } from '../core/types';
import { NIGHT_TITLES, SIGN_TEXT, eveningLines, signLines, revealLines, reportLines } from '../data/dialogue';
import { INTRO_CHAPTERS, RULE_HELP, ONBOARDING, choiceText, historyChoiceText, showLunaInScene, resultFeedback } from '../data/onboarding';
import { Scene } from '../ui/Scene';
import { Intro } from '../ui/Intro';
import { Modal } from '../ui/Modal';

const params = new URLSearchParams(window.location.search);
const INTRO_READ_KEY = 'cry-wolf:intro-read:v0.4';
function hasReadIntro(): boolean {
  try { return localStorage.getItem(INTRO_READ_KEY) === 'true'; } catch { return false; }
}
function seedFromUrl(): number {
  const raw = params.get('seed');
  if (raw !== null && /^\d{1,10}$/.test(raw)) return Number(raw);
  return window.crypto?.getRandomValues ? window.crypto.getRandomValues(new Uint32Array(1))[0] : DEFAULT_SEED;
}
function debugFor(night: number): DebugScenario {
  if (!import.meta.env.DEV) return {};
  const visit = params.get(`visit${night}`), sign = params.get(`sign${night}`);
  return { ...(visit === '0' || visit === '1' ? { visit: visit === '1' } : {}), ...(sign === 'QUIET' || sign === 'RUSTLE' || sign === 'TRACE' ? { sign } : {}) };
}

function Hearts({ label, value }: { label: string; value: number }) {
  return <div className="stat" aria-label={`${label} ${value} / 5`}><span className="stat-label">{label}<small>{value} / 5</small></span><span className="hearts" aria-hidden="true">{'♥'.repeat(value)}<span>{'♡'.repeat(5 - value)}</span></span></div>;
}

function Dialogue({ lines, onComplete, nextLabel = '次へ', children }: { lines: Line[]; onComplete: () => void; nextLabel?: string; children?: ReactNode }) {
  const [index, setIndex] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.focus({ preventScroll: true }); }, []);
  const line = lines[index];
  const next = () => index + 1 < lines.length ? setIndex(index + 1) : onComplete();
  return <div className="dialogue-wrap">
    <div className="dialogue" tabIndex={0} role="button" aria-label="会話を進める" ref={box} onClick={event => { if (event.detail <= 1) next(); }} onKeyDown={event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) { event.preventDefault(); next(); }
    }}>
      <span className={`speaker ${line.speaker === 'ルナ' ? 'luna-speaker' : ''}`}>{line.speaker}<small>{line.speaker === 'ベル' ? 'Bell' : line.speaker === 'ルナ' ? 'Luna' : ''}</small></span>
      <p>{line.text}</p>
      <span className="line-progress" aria-label={`会話 ${index + 1} / ${lines.length}`}>{index + 1} / {lines.length}</span>
    </div>
    {children}
    <button className="choice next" onClick={event => { if (event.detail <= 1) next(); }}>{index + 1 < lines.length ? '次へ' : nextLabel}<span aria-hidden="true">›</span></button>
  </div>;
}

function ResultCard({ record }: { record: NightRecord }) {
  const feedback = resultFeedback(record);
  return <section className="result-card" aria-label="今回の結果と理由">
    <p className="result-outcome">{feedback.outcome}</p>
    <dl>{([['村の信用', feedback.trust], ['ルナとの仲', feedback.affection]] as const).map(([label, stat]) => <div key={label}>
      <dt>{label} <strong className={stat.value < 0 ? 'negative' : ''}>{stat.value > 0 ? '+' : ''}{stat.value}</strong>{stat.limit ? <small>（{stat.limit}）</small> : null}</dt><dd>{stat.reason}</dd>
    </div>)}</dl>
    <p className="result-event">{feedback.event}</p>
    {record.night === 1 ? <p className="lesson-summary">{ONBOARDING.n1Summary}</p> : null}
  </section>;
}

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [modal, setModal] = useState<'menu' | 'help' | 'story' | null>(null);
  const [introRead, setIntroRead] = useState(hasReadIntro);
  const [introChapter, setIntroChapter] = useState(0);
  const [firstTutorial, setFirstTutorial] = useState(true);
  const send = (action: Action) => setGame(current => current ? gameReducer(current, action) : current);
  const start = (seed = seedFromUrl()) => { setModal(null); setIntroChapter(0); setFirstTutorial(!introRead); setGame(createGame(seed, 3)); };
  const rememberIntro = () => {
    setIntroRead(true);
    try { localStorage.setItem(INTRO_READ_KEY, 'true'); } catch { /* Reading still works when storage is unavailable. */ }
  };
  const finishIntro = () => {
    rememberIntro();
    setGame(current => {
      if (!current || current.phase !== 'INTRO') return current;
      const evening = gameReducer(current, { type: 'ADVANCE', expected: { night: current.night, phase: 'INTRO' } });
      return gameReducer(evening, { type: 'ADVANCE', expected: { night: evening.night, phase: 'EVENING' }, debug: debugFor(evening.night) });
    });
  };
  const advance = () => {
    if (game) send({ type: 'ADVANCE', expected: { night: game.night, phase: game.phase }, debug: debugFor(game.night) });
  };
  const closeModal = () => setModal(null);
  const modalView = modal ? <Modal title={modal === 'story' ? '物語とルール' : modal === 'help' ? '見張りの決まり' : '夜番のメニュー'} onClose={closeModal}>
    {modal === 'story' ? <Intro canSkip={introRead} onSkip={() => setModal('help')} onComplete={() => { rememberIntro(); setModal('help'); }} /> : <>
      <ul className="rule-help">{RULE_HELP.map(text => <li key={text}>{text}</li>)}</ul>
      <p className="fine-print">この試作版はNIGHT 3まで。音・ゲームの保存は未実装です。{game ? 'タイトルへ戻ると進行はリセットされます。' : ''}</p>
      <button className="choice" autoFocus onClick={closeModal}>{game ? '夜番に戻る' : 'タイトルに戻る'}</button>
      <button className="choice secondary" onClick={() => setModal('story')}>物語とルールを見る</button>
      {modal === 'menu' ? <button className="choice secondary" onClick={() => { closeModal(); setGame(null); }}>タイトルへ戻る</button> : null}
    </>}
  </Modal> : null;

  if (!game) return <main className="game-shell title-screen">
    <Scene showLuna evening={false} />
    <div className="title-content">
      <span className="eyebrow">A LITTLE LIE, A LITTLE LOVE</span>
      <h1>CRY<br /><span>WOLF!</span></h1>
      <p className="subtitle">Romantic Variant</p>
      <span className="ornament" aria-hidden="true">✧ ─── ☾ ─── ✧</span>
      <p className="tagline">「オオカミだ！」と叫ぶのが仕事。<br />叫ばないのは、<em>恋。</em></p>
      <div className="title-actions"><button className="choice" onClick={() => start()}><span aria-hidden="true">🔔</span>はじめから<span aria-hidden="true">›</span></button><button className="choice secondary" onClick={() => setModal('story')}>物語とルールを見る</button></div>
      <a className="choice secondary storybook-link" href={`${import.meta.env.BASE_URL}moon/index.html`}>月あかりの約束を遊ぶ <small>七夜とエピローグ · 4つの結末</small><span aria-hidden="true">›</span></a>
      <a className="choice secondary storybook-link" href={`${import.meta.env.BASE_URL}storybook/index.html`}>絵本のひと夜を遊ぶ <small>NIGHT 2 · 独立試作</small><span aria-hidden="true">›</span></a>
      <p className="edition">3夜の試作版 <span>BOY SIDE · NIGHT 1—3</span></p>
      <p className="fine-print">音・保存は次の制作段階で追加します。<br />タップ / クリック / Tab・Enterで操作</p>
    </div>
    {modalView}
  </main>;

  const record = game.history.at(-1);
  const intro = game.phase === 'INTRO';
  const evening = game.phase === 'EVENING';
  const inference = game.phase === 'SIGN' || game.phase === 'CHOICE';
  const n1Tutorial = game.night === 1 && inference;
  const chapter = INTRO_CHAPTERS[introChapter];
  let lines: Line[] = [];
  if (evening) lines = eveningLines(game);
  if (game.phase === 'SIGN') lines = signLines(game);
  if (game.phase === 'REVEAL') lines = revealLines(game);
  if (game.phase === 'REPORT') lines = reportLines(game);

  return <main className="game-shell playing" data-phase={game.phase} data-night={game.night}>
    <header className="hud">
      <div className="night-heading"><span className="moon-icon" aria-hidden="true">☾</span><div><span className="night-count">NIGHT {game.night} <small>/ 7</small></span><h1>{NIGHT_TITLES[game.night]}</h1></div></div>
      <div className="hud-controls"><button className="help-trigger" aria-label="ルールヘルプを開く" onClick={() => setModal('help')}>？</button><button className="menu-trigger" aria-label="メニューを開く" onClick={() => setModal('menu')}>☷</button></div>
      <div className="stats"><Hearts label="村の信用" value={game.trust} /><Hearts label="ルナとの仲" value={game.affection} /><span className="remaining-nights">残り{7 - game.history.length}夜<small>試作は3夜まで</small></span></div>
    </header>
    <Scene showLuna={intro ? introChapter === 2 : showLunaInScene(game)} showBell={!intro || introChapter > 0} evening={intro ? introChapter === 1 : evening} sign={inference && !n1Tutorial ? game.currentEvent?.sign : undefined} caption={intro ? chapter.caption : undefined} returnedBell={intro && introChapter === 2} />
    <div className="story-area">
      <div className="phase-label">{intro ? '物語のはじまり' : evening ? 'EVENING · 彼女の予告' : game.phase === 'REPORT' ? 'MORNING · 足跡の確認' : game.phase === 'REVEAL' ? 'その夜のこと' : game.phase === 'DEMO_COMPLETE' ? '3夜を終えて' : n1Tutorial ? 'NIGHT 1 · 鳴らす？ 鳴らさない？' : 'NIGHT · 予告と兆候から考える'}</div>
      {intro ? <Intro onComplete={finishIntro} canSkip={introRead} onSkip={finishIntro} onChapter={setIntroChapter} /> : null}
      {n1Tutorial ? <div className="tutorial-card"><strong>{ONBOARDING.n1Presence}</strong>{firstTutorial ? <p><b>見張りの決まり</b>{ONBOARDING.n1Rule}</p> : null}<small>{ONBOARDING.n1Evidence}</small></div> : null}
      {inference && !n1Tutorial ? <>
        {game.night === 2 && game.phase === 'SIGN' ? <p className="inference-hint">{ONBOARDING.n2Hint}</p> : null}
        <p className="forecast"><span>夕方の予告</span>「{eveningLines(game).find(line => line.speaker === 'ルナ')?.text}」</p>
        <div className="sign-card"><span>夜の兆候</span><strong>{SIGN_TEXT[game.currentEvent!.sign].label}</strong><small>{SIGN_TEXT[game.currentEvent!.sign].text}</small></div>
      </> : null}
      {lines.length > 0 ? <Dialogue key={`${game.night}-${game.phase}`} lines={lines} onComplete={advance} nextLabel={evening ? '夜を待つ' : game.phase === 'SIGN' ? n1Tutorial ? '鐘を鳴らす？' : 'どう伝える？' : game.phase === 'REVEAL' ? '翌朝の報告へ' : game.night === 3 ? '3夜の振り返りへ' : '次の夜へ'}>
        {game.phase === 'REPORT' && record ? <ResultCard record={record} /> : null}
      </Dialogue> : null}
      {game.phase === 'CHOICE' ? <div className="choice-stage">
        <div className="dialogue"><span className="speaker">ベル <small>Bell</small></span><p>{n1Tutorial ? ONBOARDING.n1Choice : ONBOARDING.inferenceChoice}</p></div>
        <div className="choices">{(['CRY', 'SILENT'] as const).map(choice => {
          const text = choiceText(game.night, choice);
          return <button key={choice} className="choice" data-choice={choice} autoFocus={choice === 'CRY'} onClick={() => send({ type: 'CHOOSE', choice, night: game.night })}><span aria-hidden="true">{text.icon}</span><span>{text.label}<small>{text.detail}</small></span><span aria-hidden="true">›</span></button>;
        })}</div>
      </div> : null}
      {game.phase === 'DEMO_COMPLETE' ? <div className="demo-result">
        <div className="dialogue"><span className="speaker">月明かりの記録</span><p>三つの夜を、見届けた。<br />ルナの言葉を、どう受け止めた？</p><small>この試作版は、ここまで。物語は7夜へつづきます。</small></div>
        <ol className="history">{game.history.map(item => <li key={item.night}><span>N{item.night}</span><span>{historyChoiceText(item.night, item.choice)}<small>{resultFeedback(item).outcome}</small><small>村の信用 {item.delta.trust > 0 ? '+' : ''}{item.delta.trust} / ルナとの仲 {item.delta.affection > 0 ? '+' : ''}{item.delta.affection}</small></span></li>)}</ol>
        <div className="choices"><button className="choice" onClick={() => start(game.seed)}>同じ3夜をもう一度<span aria-hidden="true">›</span></button><button className="choice secondary" onClick={() => setGame(null)}>タイトルへ<span aria-hidden="true">›</span></button></div>
      </div> : null}
    </div>
    <footer className="play-footer">BOY SIDE · 3夜の試作版 <span aria-hidden="true">✦</span> {import.meta.env.DEV ? `seed ${game.seed}` : '月の満ちる夜'}</footer>
    {modalView}
  </main>;
}
