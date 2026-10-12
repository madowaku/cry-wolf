import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

interface State { stage: string; phase: string; beat: number; ticks: number; flags: Record<string, unknown>; observation?: { id: string; crossed: boolean }; result?: { code: string }; }
interface View { kind: string; near?: boolean; location?: string; held?: boolean; }
const P = runInNewContext(readFileSync('public/moon/presentation.js', 'utf8') + '\nCWPresentation') as {
  musicRole: (state: State, home: boolean) => string;
  visual: (state: State, home: boolean, step: number) => View;
  hasReveal: (state: State, step: number) => boolean;
};
const M = runInNewContext(readFileSync('public/moon/model.js', 'utf8') + '\nCWModel') as {
  fresh: () => State; transition: (state: State, action: string) => State; serialize: (state: State) => string;
};
const n2 = (phase = 'explore2'): State => ({ ...M.fresh(), stage: 'night2', phase, ticks: 2 });

describe('Moon imports storybook presentation without changing seven-night rules', () => {
  it.each([
    ['intro', 'story', false, 'opening'], ['night3', 'story', true, 'opening'],
    ['night2', 'report2', false, 'gameplay'], ['night2', 'result', false, 'gameplay'],
    ['night7', 'choice7', false, 'gameplay'], ['night7', 'result', false, 'ending'],
    ['night7', 'epilogue', false, 'ending'], ['night7', 'finish', false, 'ending'],
  ])('%s/%s home=%s selects %s', (stage, phase, home, expected) => {
    expect(P.musicRole({ ...M.fresh(), stage, phase }, home)).toBe(expected);
  });
  it('reads distant sound before footprints without spending a tick or creating an event', () => {
    const state = { ...n2('story'), beat: 2 }, saved = M.serialize(state);
    expect(P.visual(state, false, 0).kind).toBe('howl');
    expect(P.hasReveal(state, 0)).toBe(true);
    expect(P.visual(state, false, 1).kind).toBe('tracks');
    expect(P.hasReveal(state, 1)).toBe(false);
    expect(M.serialize(state)).toBe(saved);
  });
  it.each(['track2', 'listen2', 'signal2'])('%s displays the observed first distance, then the current near distance', action => {
    const first = M.transition(n2(), action);
    expect(first.ticks).toBe(1);
    expect(P.visual(first, false, 0).near).toBe(false);
    const choice = M.transition(first, 'next');
    expect(P.visual(choice, false, 0).near).toBe(true);
    const second = M.transition(choice, action), view = P.visual(second, false, 0);
    expect(view.near).toBe(true);
    expect(view.location).toBe(action === 'signal2' ? 'outside' : 'inside');
    const report = M.transition(second, 'next');
    expect(P.visual(report, false, 0).location).toBe(view.location);
  });
  it('shows the failed first signal, then the successful second signal', () => {
    const first = M.transition(n2(), 'signal2');
    expect(P.visual(first, false, 0).held).toBe(false);
    const second = M.transition(M.transition(first, 'next'), 'signal2');
    expect(P.visual(second, false, 0).held).toBe(true);
  });
  it('reactions and their explanation retain the same result and bookmark', () => {
    let state = M.transition(M.fresh(), 'start');
    for (let i = 0; i < 7; i++) state = M.transition(state, 'next');
    state = M.transition(state, 'ring1');
    const saved = M.serialize(state);
    expect(state.phase).toBe('result');
    expect(P.visual(state, false, 0).kind).toBe('reaction');
    expect(P.hasReveal(state, 0)).toBe(true);
    expect(P.visual(state, false, 1).kind).toBe('explanation');
    expect(P.hasReveal(state, 1)).toBe(false);
    expect(M.serialize(state)).toBe(saved);
  });
});
