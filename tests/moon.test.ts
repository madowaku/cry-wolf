import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

type State = { version: number; revision: number; stage: string; phase: string; beat: number; trust: number; bond: number; insight: number; ticks: number; flags: Record<string, boolean | string | null>; events: string[]; notes: unknown[]; history: { stage: string; code: string }[]; result: { code: string } | null };
type Model = { fresh(): State; transition(s: State, a: string, revision?: number): State; legal(s: State): string[]; serialize(s: State): string; restore(raw: string): State | null; counts: Record<string, number>; moon(stage: string): number };
const context: Record<string, unknown> = {};
runInNewContext(readFileSync('public/moon/model.js', 'utf8'), context);
runInNewContext(readFileSync('public/moon/story.js', 'utf8'), context);
runInNewContext(readFileSync('public/moon/story-late.js', 'utf8'), context);
const M = context.CWModel as Model;
const story = context.CWStory as { chapters: Record<string, unknown[]>; observations: Record<string, unknown>; results: Record<string, Record<string, unknown>> };
const step = (s: State, a: string) => M.transition(s, a);
function toChoice(s = step(M.fresh(), 'start')): State {
  while (['story', 'observe', 'result'].includes(s.phase)) s = step(s, 'next');
  return s;
}
function n2(n1: string, first: string, second: string, report: string) {
  let s = toChoice(); s = toChoice(step(s, n1 + '1'));
  s = toChoice(step(s, first + '2')); s = toChoice(step(s, second + '2'));
  return step(s, report + '2');
}
function baseline(n1: string, first: string, second: string, report: string, acts3: string[] = [], report3 = 'facts') {
  const sandbox = { localStorage: { getItem: () => null, setItem: () => {} }, render: () => {} };
  const src = readFileSync('tests/fixtures/moon-v071-reference.js', 'utf8');
  return runInNewContext(`${src}\ngo('night1');g.phase='choice1';night1Choice(${JSON.stringify(n1)});go('night2');g.phase='explore2';do2(${JSON.stringify(first)});g.phase='explore2';do2(${JSON.stringify(second)});g.phase='report2';report2(${JSON.stringify(report)});${acts3.length ? `go('night3');for(const a of ${JSON.stringify(acts3)}){g.phase='explore3';act3(a)}g.phase='report3';report3(${JSON.stringify(report3)});` : ''}\n({trust:g.trust,bond:g.bond,insight:g.insight,flags:g.flags})`, sandbox);
}
const metrics = (s: State) => ({ trust: s.trust, bond: s.bond, insight: s.insight, flags: s.flags });
const combinations = ['ring', 'hide'].flatMap(n1 => ['track', 'listen', 'signal'].flatMap(first => ['track', 'listen', 'signal'].flatMap(second => ['ring', 'silent'].map(report => ({ n1, first, second, report })))));

describe('Moon v0.9: first three nights preserve attachment rules', () => {
  it.each(combinations)('$n1 / $first → $second / $report matches v0.7.1', ({ n1, first, second, report }) => {
    expect(metrics(n2(n1, first, second, report))).toEqual(baseline(n1, first, second, report));
  });
  it.each(['ring', 'hide'])('N3 proposal preserves rules after N1 %s', n1 => {
    let s = toChoice(n2(n1, 'track', 'signal', 'silent'));
    const acts = n1 === 'ring' ? ['forest', 'speak', 'signal'] : ['village', 'speak', 'signal'];
    for (const a of acts) s = toChoice(step(s, a + '3'));
    expect(M.legal(s)).toContain('proposal3'); s = step(s, 'proposal3');
    expect(metrics(s)).toEqual(baseline(n1, 'track', 'signal', 'silent', acts, 'proposal'));
  });
  it('failed common signal keeps a reachable honest route; unavailable proposal is inert', () => {
    let s = toChoice(n2('ring', 'signal', 'listen', 'ring'));
    for (const a of ['forest3', 'speak3', 'signal3']) s = toChoice(step(s, a));
    expect(M.legal(s)).not.toContain('proposal3');
    expect(step(s, 'proposal3')).toBe(s);
    expect(s.flags.n3).toBe(null);
    expect(metrics(step(s, 'facts3'))).toEqual(baseline('ring', 'signal', 'listen', 'ring', ['forest', 'speak', 'signal'], 'facts'));
  });
  it('duplicate or stale UI input and invalid action do not consume a tick or apply a second result', () => {
    const s = toChoice(n2('ring', 'track', 'signal', 'silent'));
    expect(step(s, 'village3')).toBe(s); // inherited, already known
    const before = JSON.stringify(s), after = step(s, 'forest3');
    expect(JSON.stringify(s)).toBe(before);
    expect(M.transition(after, 'forest3', s.revision)).toBe(after);
    expect(M.transition(after, 'next', s.revision)).toBe(after);
    expect(step(after, 'not-an-action')).toBe(after);
    const choice = toChoice(); const result = step(choice, 'ring1');
    expect(step(result, 'ring1')).toBe(result);
  });
  it('replay saves validate every action; corrupted, forged and legacy saves are rejected', () => {
    const s = n2('hide', 'signal', 'signal', 'silent');
    expect(M.restore(M.serialize(s))).toEqual(s);
    for (const raw of ['null', '{', '{}', '{"version":7,"events":["start"]}', '{"version":8,"events":["proposal3"]}', '{"version":8,"events":[null]}']) expect(M.restore(raw)).toBe(null);
    expect(M.restore(JSON.stringify({ version: 8, events: Array(101).fill('next') }))).toBe(null);
    expect(M.restore(JSON.stringify({ version: 8, events: s.events, trust: 999 }))).toEqual(s);
  });
  it('each chapter count matches the story, moons stop short of full, all rendered observations exist', () => {
    for (const [stage, count] of Object.entries(M.counts)) expect(story.chapters[stage]).toHaveLength(count);
    expect(['night1', 'night2', 'night3'].map(M.moon)).toEqual([.5, .59, .68]);
    const pending = [M.fresh()]; let transitions = 0, finishes = 0;
    const endings = new Set<string>(), n2ends = new Set<string>();
    while (pending.length) {
      const s = pending.pop()!;
      expect(s.trust).toBeGreaterThanOrEqual(0); expect(s.trust).toBeLessThanOrEqual(5);
      expect(s.bond).toBeGreaterThanOrEqual(0); expect(s.bond).toBeLessThanOrEqual(5);
      expect(s.insight).toBeGreaterThanOrEqual(0); expect(s.insight).toBeLessThanOrEqual(3);
      expect(s.ticks).toBeGreaterThanOrEqual(0);
      if (s.result) expect(story.results[s.stage][s.result.code]).toBeTruthy();
      for (const note of s.notes as { id: string }[]) expect(story.observations[note.id]).toBeTruthy();
      if (s.phase === 'interlude') { finishes++; endings.add(String(s.flags.n3)); n2ends.add(String(s.flags.n2)); expect(s.history).toHaveLength(3); expect(M.restore(M.serialize(s))).toEqual(s); continue; }
      const actions = M.legal(s); expect(actions.length).toBeGreaterThan(0);
      for (const action of actions) { const next = step(s, action); expect(next.revision).toBe(s.revision + 1); transitions++; pending.push(next); }
    }
    expect([...endings].sort()).toEqual(['facts', 'false', 'proposal', 'secret']);
    expect([...n2ends].sort()).toEqual(['best', 'duty', 'false', 'miss']);
    expect(finishes).toBeGreaterThan(1000);
    console.log(JSON.stringify({ moonTraversal: { transitions, completePlaythroughs: finishes, night2Results: [...n2ends], night3Reports: [...endings] } }));
  });
});
