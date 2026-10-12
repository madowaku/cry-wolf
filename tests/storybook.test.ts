import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

type NightAction = 'track' | 'listen' | 'signal';
type Report = 'cry' | 'silent';
interface StoryState {
  phase: string; slideId: string; ticks: number; actions: NightAction[];
  signal: string; heard: boolean; notes: string[]; ending: string | null;
  score: { trust: number; bond: number } | null; report: Report | null;
  help: boolean; modal: string | null;
}
interface StoryModel {
  initial: () => StoryState;
  advanceSlide: (s: StoryState) => StoryState;
  applyNightAction: (s: StoryState, a: string) => StoryState;
  resolveReport: (s: StoryState, r: string) => StoryState;
}
const html = readFileSync('public/storybook/index.html', 'utf8');
const source = html.match(/<script id="storybook-model">([\s\S]*?)<\/script>/)![1];
const model = runInNewContext(`${source}\n({initial, advanceSlide, applyNightAction, resolveReport})`) as StoryModel;
const actions: NightAction[] = ['track', 'listen', 'signal'];
const reports: Report[] = ['cry', 'silent'];
const routes = actions.flatMap(first => actions.flatMap(second => reports.map(report => ({ first, second, report }))));

function toChoice(): StoryState {
  // Intro/story pages advance without consuming a tick.
  return { ...model.initial(), phase: 'night', slideId: 'S03_CLUE' };
}
function play(first: NightAction, second: NightAction, report: Report): StoryState {
  let s = model.applyNightAction(toChoice(), first);
  s = model.advanceSlide(s);
  s = model.applyNightAction(s, second);
  s = model.advanceSlide(s);
  return model.resolveReport(s, report);
}
function baseline(first: NightAction, second: NightAction, report: Report) {
  const app = { innerHTML: '', querySelectorAll: () => [] };
  const window: Record<string, unknown> = { addEventListener: () => {} };
  const context = { document: { getElementById: () => app }, window, setTimeout: () => 0 };
  const baselineHtml = readFileSync('public/v05-baseline/index.html', 'utf8');
  runInNewContext(baselineHtml.match(/<script>([\s\S]*?)<\/script>/)![1], context);
  const hook = window.CRYWOLF_TEST as { click: (key: string) => void; get: () => StoryState };
  ['start', 'to-night', first, second, report].forEach(hook.click);
  return hook.get();
}

describe('independent storybook NIGHT 2 — original v0.5 rules', () => {
  it.each(routes)('$first → $second → $report preserves ending and exact deltas', ({ first, second, report }) => {
    const s = play(first, second, report), original = baseline(first, second, report);
    const held = second === 'signal';
    const ending = held ? (report === 'cry' ? 'false' : 'best') : (report === 'cry' ? 'duty' : 'secret');
    const expected = { best: [0, 1], false: [-2, 0], duty: [1, 0], secret: [-1, 1] }[ending];
    expect(s.ending).toBe(ending);
    expect(s.ending).toBe(original.ending);
    expect(s.signal).toBe(original.signal);
    expect(s.ticks).toBe(original.ticks);
    expect(s.actions).toEqual(original.actions);
    expect(s.score).toEqual({ trust: expected[0], bond: expected[1] });
    expect(s.phase).toBe('result');
  });

  it('all story pages leave both ticks intact and preserve the original phase ordering', () => {
    let s = model.initial();
    const seen = [s.slideId];
    for (let i = 0; i < 5; i++) { s = model.advanceSlide(s); seen.push(s.slideId); expect(s.ticks).toBe(2); }
    expect(seen).toEqual(['S00_TITLE', 'S01_EVENING_A', 'S01_EVENING_B', 'S01_RULE', 'S02_NIGHT', 'S03_CLUE']);
    expect(model.advanceSlide(s)).toBe(s);
  });

  it.each(actions)('observation for %s is read before the next action, without double consumption', action => {
    const s = model.applyNightAction(toChoice(), action);
    expect(s.ticks).toBe(1);
    expect(s.slideId).toBe('S04_OBSERVATION');
    expect(model.applyNightAction(s, action)).toBe(s);
    const decision = model.advanceSlide(s);
    expect(decision.ticks).toBe(1);
    expect(decision.slideId).toBe('S05_DECISION');
    expect(model.advanceSlide(decision)).toBe(decision);
    const second = model.applyNightAction(decision, action);
    expect(second.ticks).toBe(0);
    expect(second.phase).toBe('night');
    expect(second.slideId).toBe('S04_OBSERVATION_2');
    expect(model.applyNightAction(second, action)).toBe(second);
    const report = model.advanceSlide(second);
    expect(report.phase).toBe('report');
    expect(report.ticks).toBe(0);
  });

  it('a first-tick signal fails; a second-tick signal works even after that failure', () => {
    const first = model.applyNightAction(toChoice(), 'signal');
    expect(first.signal).toBe('miss');
    const second = model.applyNightAction(model.advanceSlide(first), 'signal');
    expect(second.signal).toBe('held');
    expect(second.notes).toHaveLength(2);
  });

  it.each(['help', 'notes'])('%s blocks all progress while keeping game state unchanged', modal => {
    const s = { ...toChoice(), modal };
    expect(model.advanceSlide(s)).toBe(s);
    expect(model.applyNightAction(s, 'track')).toBe(s);
    const report = { ...s, slideId: 'S06_REPORT', phase: 'report', ticks: 0 };
    expect(model.resolveReport(report, 'cry')).toBe(report);
  });

  it('rejects early reports, invalid actions, and repeated final submissions', () => {
    const s = toChoice();
    expect(model.resolveReport(s, 'silent')).toBe(s);
    expect(model.applyNightAction(s, 'other')).toBe(s);
    const result = play('track', 'signal', 'silent');
    expect(model.resolveReport(result, 'cry')).toBe(result);
    const recap = model.advanceSlide(result);
    expect(recap.slideId).toBe('S08_RECAP');
    expect(recap.score).toEqual(result.score);
    expect(model.advanceSlide(recap)).toBe(recap);
  });

  it('pure transitions never mutate their input; initial state isolates retry history', () => {
    const s = toChoice(), snapshot = JSON.stringify(s);
    model.applyNightAction(s, 'track');
    expect(JSON.stringify(s)).toBe(snapshot);
    const fresh = model.initial();
    fresh.notes.push('test');
    expect(model.initial().notes).toEqual([]);
    expect(model.initial().ending).toBeNull();
  });
});
