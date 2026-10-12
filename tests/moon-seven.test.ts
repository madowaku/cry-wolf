import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

type State = {
  stage: string; phase: string; beat: number; revision: number; version: number;
  trust: number; bond: number; insight: number; honesty: number; ticks: number;
  flags: Record<string, string | boolean | null>; events: string[]; ending: string | null;
  history: { stage: string; code: string }[]; notes: { id: string }[];
  result: { code: string; before: { trust: number; bond: number; insight: number }; after: { trust: number; bond: number; insight: number } } | null;
};
type Scene = { title: string; text: string; cast?: string[]; prop?: string; reason?: string };
type Model = { fresh(): State; transition(s: State, a: string, revision?: number): State; legal(s: State): string[]; serialize(s: State): string; restore(raw: string): State | null; canCall(s: State): boolean; roadReady(s: State): boolean; location5(s: State): string; endingFor(s: State, a: string): string; moon(stage: string): number };
type Story = { readChapter(s: State): Scene; readResult(s: State): Scene; readEpilogue(s: State): Scene; observations: Record<string, Scene>; answers5: Record<string, Scene>; historyLabel(h: State['history'][number]): string };
const box: Record<string, unknown> = {};
for (const f of ['model.js', 'story.js', 'story-late.js']) runInNewContext(readFileSync('public/moon/' + f, 'utf8'), box);
const M = box.CWModel as Model, S = box.CWStory as Story;
const oldBox: Record<string, unknown> = {};
runInNewContext(readFileSync('tests/fixtures/moon-v08-model.js', 'utf8'), oldBox);
const V8 = oldBox.CWModel as Model;
const automatic = ['story', 'observe', 'result', 'interlude', 'answer', 'epilogue'];
function forward(state: State, model = M) {
  let s = state;
  for (let i = 0; i < 80; i++) { if (!automatic.includes(s.phase)) return s; s = model.transition(s, 'next'); }
  throw new Error('Automatic pages must terminate');
}
function play(actions: string[], model = M) {
  let s = forward(model.transition(model.fresh(), 'start'), model);
  for (const a of actions) {
    if (!model.legal(s).includes(a)) throw new Error(`${a} illegal at ${s.stage}/${s.phase}: ${model.legal(s)}`);
    s = forward(model.transition(s, a), model);
  }
  return s;
}
const united = ['ring1', 'track2', 'signal2', 'silent2', 'forest3', 'speak3', 'signal3', 'proposal3'];
const reserved = ['ring1', 'track2', 'track2', 'ring2', 'forest3', 'speak3', 'signal3', 'facts3'];
const fractured = ['hide1', 'track2', 'track2', 'silent2', 'village3', 'speak3', 'signal3', 'false3'];
const routes: Record<string, string[]> = {
  HONEST: [...united, 'thank4', 'want5', 'track5', 'signal5', 'silent5', 'village6', 'forest6', 'heart6', 'plan6', 'call7'],
  SECRET_MEETING: [...united, 'thank4', 'want5', 'track5', 'signal5', 'silent5', 'wait6', 'wait6', 'wait6', 'hush6', 'silent7'],
  GOOD_DOG: [...reserved, 'pocket4', 'away5', 'track5', 'listen5', 'silent5', 'survey6', 'village6', 'forest6', 'plan6', 'ring7'],
  BAD_LIAR: [...fractured, 'ring4', 'decide5', 'track5', 'listen5', 'silent5', 'wait6', 'wait6', 'wait6', 'hush6', 'silent7']
};
const n4 = () => play(united);
const n5 = () => play([...reserved, 'pocket4']);
const clamp = (n: number) => Math.min(5, Math.max(0, n));

describe('Moon seven-night continuation', () => {
  it.each(Object.entries(routes))('%s completes seven nights and all three epilogue pages', (ending, actions) => {
    const s = play(actions);
    expect(s.phase).toBe('finish'); expect(s.ending).toBe(ending); expect(s.beat).toBe(2);
    expect(s.history.map(h => h.stage)).toEqual(Array.from({ length: 7 }, (_, i) => 'night' + (i + 1)));
    expect(M.legal(s)).toEqual([]); expect(M.restore(M.serialize(s))).toEqual(s);
    for (let beat = 0; beat < 3; beat++) expect(S.readEpilogue({ ...s, beat }).text.length).toBeGreaterThan(30);
  });
  it.each(['ring4', 'pocket4', 'thank4'])('N4 %s changes gift response exactly once, never rewards a false alarm', a => {
    const s = n4(), text = JSON.stringify(s), next = M.transition(s, a);
    expect(JSON.stringify(s)).toBe(text);
    expect(next.trust).toBe(clamp(s.trust - (a === 'ring4' ? 1 : 0)));
    expect(next.bond).toBe(clamp(s.bond + (a === 'thank4' ? 2 : a === 'ring4' ? -1 : 0)));
    expect(next.honesty).toBe(a === 'thank4' ? 1 : 0);
    expect(M.transition(next, a)).toBe(next); expect(M.transition(next, 'next', s.revision)).toBe(next);
  });
  const fifth = ['want5', 'away5', 'decide5'].flatMap(answer => ['track5', 'listen5', 'signal5'].flatMap(a => ['track5', 'listen5', 'signal5'].flatMap(b => ['ring5', 'silent5'].map(report => ({ answer, a, b, report })))));
  it.each(fifth)('N5 $answer / $a / $b / $report has coherent location and reporting', ({ answer, a, b, report }) => {
    const before = n5(), answered = M.transition(before, answer);
    expect(answered.trust).toBe(before.trust);
    expect(answered.honesty).toBe(answer === 'want5' ? 1 : 0);
    expect(answered.bond).toBe(clamp(before.bond + (answer === 'want5' ? 2 : answer === 'away5' ? -1 : 0)));
    expect(M.restore(M.serialize(answered))).toEqual(answered);
    let s = forward(answered);
    s = forward(M.transition(s, a));
    expect(M.location5(s)).not.toBe('inside'); // cannot retroactively erase an entry with the later signal
    s = forward(M.transition(s, b));
    const inside = answer === 'decide5' && a !== 'signal5' && b !== 'signal5';
    const place = answer === 'away5' ? 'absent' : inside ? 'inside' : 'outside';
    expect(M.location5(s)).toBe(place); expect(s.ticks).toBe(0);
    const next = M.transition(s, report);
    const expected = inside ? report === 'ring5' ? 'duty5' : 'miss5' : report === 'ring5' ? 'false5' : place === 'absent' ? 'quiet5' : 'promise5';
    expect(next.flags.n5).toBe(expected);
    expect(next.trust).toBe(clamp(s.trust + (inside ? report === 'ring5' ? 1 : -1 : report === 'ring5' ? -1 : 0)));
    expect(M.restore(M.serialize(next))).toEqual(next);
  });
  it('the proposal saves a N6 tick; completed tasks and stale actions cannot repeat', () => {
    const s = play([...united, 'thank4', 'want5', 'track5', 'listen5', 'silent5']);
    expect(s.flags.survey6).toBe(true); expect(M.transition(s, 'survey6')).toBe(s);
    const heart = M.transition(s, 'heart6');
    expect(heart.honesty).toBe(s.honesty + 1); expect(heart.bond).toBe(clamp(s.bond + 1));
    expect(M.transition(heart, 'heart6')).toBe(heart);
    const after = forward(heart); expect(M.legal(after)).not.toContain('heart6');
    expect(M.transition(after, 'village6', s.revision)).toBe(after);
    expect(s.ticks).toBe(3);
  });
  it('N6 proposal requires all three confirmations and falls back to honest facts', () => {
    let s = play([...reserved, 'pocket4', 'away5', 'track5', 'listen5', 'silent5']);
    expect(s.flags.survey6).toBe(false);
    for (const a of ['village6', 'heart6', 'wait6']) s = forward(M.transition(s, a));
    expect(M.roadReady(s)).toBe(false); expect(M.transition(s, 'plan6')).toBe(s);
    const result = M.transition(s, 'facts6'); expect(result.flags.road).toBe(false);
    expect(result.trust).toBe(clamp(s.trust + 1));
  });
  it('N7 call eligibility has exact three-way boundaries, and the ending priority is total', () => {
    const s = play(routes.HONEST.slice(0, -1));
    for (const [trust, bond, honesty, allowed] of [[2, 4, 1, true], [1, 4, 1, false], [2, 3, 1, false], [2, 4, 0, false]] as const) {
      const candidate = { ...s, trust, bond, honesty };
      expect(M.canCall(candidate)).toBe(allowed);
      expect(M.legal(candidate).includes('call7')).toBe(allowed);
      if (!allowed) expect(M.transition(candidate, 'call7')).toBe(candidate);
    }
    for (let trust = 0; trust <= 5; trust++) for (let bond = 0; bond <= 5; bond++) {
      const state = { ...s, trust, bond };
      expect(M.endingFor(state, 'call7')).toBe('HONEST');
      expect(M.endingFor(state, 'silent7')).toBe(trust === 0 ? 'BAD_LIAR' : bond >= 4 ? 'SECRET_MEETING' : 'GOOD_DOG');
    }
    const chosen = M.transition(s, 'call7');
    expect(M.transition(chosen, 'ring7')).toBe(chosen); expect(M.transition(chosen, 'next', s.revision)).toBe(chosen);
  });
  it.each(['ring7', 'silent7', 'call7'])('N7 %s keeps Luna outside the patrol path', a => {
    const s = play(routes.HONEST.slice(0, -1)), result = M.transition(s, a);
    expect(result.trust).toBe(s.trust - (a === 'ring7' ? 1 : 0));
    expect(result.honesty).toBe(s.honesty + (a === 'call7' ? 1 : 0));
  });
  it('real v8 midway and finished bookmarks migrate without dropping or repeating a result', () => {
    const midway = play(['hide1', 'signal2'], V8), finished = play(united, V8);
    writeFileSync('docs/moon/legacy-save-fixtures.json', JSON.stringify({ midway: JSON.parse(V8.serialize(midway)), finished: JSON.parse(V8.serialize(finished)) }, null, 2) + '\n');
    expect(finished.phase).toBe('finish');
    for (const old of [midway, finished]) {
      const s = M.restore(V8.serialize(old))!;
      expect(s).not.toBeNull(); expect(s.trust).toBe(old.trust); expect(s.bond).toBe(old.bond);
      expect(s.events).toEqual(old.events); expect(s.history).toEqual(old.history); expect(s.flags).toEqual(old.flags);
      expect(s.phase).toBe(old.phase === 'finish' ? 'interlude' : old.phase);
    }
    const migrated = M.restore(V8.serialize(finished))!;
    expect(M.transition(migrated, 'next').stage).toBe('night4');
    expect(M.restore(JSON.stringify({ version: 8, events: [...finished.events, 'next'] }))).toBeNull();
    for (const raw of ['null', '{', '{"version":9,"events":["call7"]}', '{"version":9,"events":[null]}', JSON.stringify({ version: 9, events: Array(241).fill('next') })]) expect(M.restore(raw)).toBeNull();
  });
  it('seven moons reach full only on the seventh night', () => {
    expect(Array.from({ length: 7 }, (_, i) => M.moon('night' + (i + 1)))).toEqual([.5, .59, .68, .77, .86, .95, 1]);
  });
  it('every future-relevant decision state has a legal path, valid story and a reachable epilogue', () => {
    const assets = new Set((JSON.parse(readFileSync('public/moon/asset-manifest.json', 'utf8')).assets as { id: string }[]).map(a => a.id));
    let pages = 0, transitions = 0;
    const validate = (s: State) => {
      if (s.trust < 0 || s.trust > 5 || s.bond < 0 || s.bond > 5 || s.insight < 0 || s.insight > 3 || s.ticks < 0) throw new Error('Invalid state bounds');
      const scene = s.phase === 'story' ? S.readChapter(s) : s.phase === 'result' ? S.readResult(s) : s.phase === 'observe' ? S.observations[s.notes.at(-1)!.id] : s.phase === 'epilogue' ? S.readEpilogue(s) : s.phase === 'answer' ? S.answers5[String(s.flags.answer5)] : null;
      if (scene) {
        pages++;
        if (!scene.title || !scene.text) throw new Error(`Missing text ${s.stage}/${s.phase}/${s.beat}`);
        for (const cast of scene.cast || []) if (!assets.has(cast.replace(':', '-'))) throw new Error('Missing character asset ' + cast);
        if (scene.prop && !assets.has(scene.prop === 'bell' ? 'bell-prop' : scene.prop)) throw new Error('Missing prop ' + scene.prop);
      }
      if (s.phase === 'result' && !S.historyLabel(s.history.at(-1)!)) throw new Error('Missing history label');
    };
    const advance = (state: State) => {
      let s = state;
      for (let i = 0; i < 80; i++) {
        validate(s); if (!automatic.includes(s.phase)) return s;
        s = M.transition(s, 'next'); transitions++;
      }
      throw new Error('Endless automatic transition');
    };
    // Drop old facts only once neither future rules nor narrative variants read them.
    // Keep a representative complete event history at every node for save and ending evidence.
    const key = (s: State) => {
      const n = Number(s.stage.slice(-1)) || 0, f = s.flags;
      const relevant = n <= 3 ? f : n === 4 ? { n3: f.n3 } : n === 5 ? { n3: f.n3, kept: f.n4 !== 'ring', answer: f.answer5, held: f.held5, crossed: f.crossed5 } : n === 6 ? { kept: f.n4 !== 'ring', n3: f.n3, survey: f.survey6, village: f.village6, forest: f.forest6, heart: f.heart6 } : { kept: f.n4 !== 'ring', road: f.road, last: f.n7 };
      return JSON.stringify([s.stage, s.phase, s.ticks, s.trust, s.bond, s.insight, s.honesty, s.ending, relevant]);
    };
    const pending = [advance(M.transition(M.fresh(), 'start'))], seen = new Set<string>();
    const examples: Record<string, { actions: string[]; road: boolean; trust: number; bond: number; honesty: number }> = {}, outcomes = new Set<string>();
    while (pending.length) {
      const s = pending.pop()!, id = key(s);
      if (seen.has(id)) continue; seen.add(id);
      if (s.phase === 'finish') {
        if (s.history.length !== 7) throw new Error('Duplicate or missing night result');
        outcomes.add(`${s.ending}/${!!s.flags.road}`);
        if (!examples[s.ending!]) {
          expect(M.restore(M.serialize(s))).toEqual(s);
          examples[s.ending!] = { actions: s.events.filter(a => !['start', 'next'].includes(a)), road: !!s.flags.road, trust: s.trust, bond: s.bond, honesty: s.honesty };
        }
        continue;
      }
      const legal = M.legal(s); if (!legal.length) throw new Error(`Dead end ${id}`);
      for (const a of legal) { const next = M.transition(s, a); if (next.revision !== s.revision + 1) throw new Error('Revision error'); transitions++; pending.push(advance(next)); }
    }
    expect(Object.keys(examples).sort()).toEqual(['BAD_LIAR', 'GOOD_DOG', 'HONEST', 'SECRET_MEETING']);
    expect(outcomes.size).toBe(8);
    const evidence = { method: 'Exhaustive future-relevant decision states, deterministic page chains; history permutations are merged only after their facts are no longer read by future logic or prose.', decisionStates: seen.size, transitions, validatedPages: pages, outcomes: [...outcomes].sort(), examples, browserRoutes: routes };
    writeFileSync('docs/moon/seven-night-model-qa.json', JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify({ sevenNightTraversal: { decisionStates: seen.size, transitions, validatedPages: pages, outcomes: [...outcomes].sort() } }));
  }, 60000);
});
