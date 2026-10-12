import { useEffect, useRef, useState } from 'react';
import { INTRO_CHAPTERS } from '../data/onboarding';

export function Intro({ onComplete, canSkip, onSkip, onChapter }: {
  onComplete: () => void; canSkip: boolean; onSkip: () => void; onChapter?: (chapter: number) => void;
}) {
  const [chapter, setChapter] = useState(0);
  const page = useRef<HTMLElement>(null);
  const content = INTRO_CHAPTERS[chapter];
  useEffect(() => { page.current?.focus({ preventScroll: true }); }, [chapter]);
  const next = () => {
    if (chapter < INTRO_CHAPTERS.length - 1) { setChapter(chapter + 1); onChapter?.(chapter + 1); }
    else onComplete();
  };
  return <div className="intro-wrap" data-intro-chapter={chapter + 1}>
    <article className="intro-page" ref={page} tabIndex={0} role="button" aria-label="物語を進める" onClick={event => { if (event.detail <= 1) next(); }} onKeyDown={event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) { event.preventDefault(); next(); }
    }}>
      <span className="intro-count">PROLOGUE {chapter + 1} / 3</span>
      <h2>{content.title}</h2>
      {content.lines.map((line, index) => <p key={index} className={line.speaker === '情景' ? 'intro-description' : ''}><b>{line.speaker}</b><span>{line.text}</span></p>)}
    </article>
    <button className="choice next" onClick={event => { if (event.detail <= 1) next(); }}>{chapter === 2 ? '夜番をはじめる' : '次へ'}<span aria-hidden="true">›</span></button>
    {canSkip ? <button className="choice secondary intro-skip" onClick={event => { if (event.detail <= 1) onSkip(); }}>既読の物語をスキップ</button> : <p className="intro-hint">タップ / クリック / Enterで次へ</p>}
  </div>;
}
