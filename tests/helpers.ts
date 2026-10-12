import { createGame, advance, gameReducer, prepareNight } from '../src/core/engine';
import { resolveNight } from '../src/core/rules';
import type { GameState, NightChoice, Night5Answer, DebugScenario } from '../src/core/types';

export const step = (state: GameState, debug?: DebugScenario) => advance(state, { night: state.night, phase: state.phase }, debug);

export function atChoice(night = 1, debug: DebugScenario = {}, stats: Partial<GameState> = {}): GameState {
  const state = { ...createGame(123, 7), ...stats, night: night as GameState['night'], phase: 'EVENING' as const };
  return step(prepareNight(state, debug));
}

export function play(seed: number, choices: NightChoice[], answer: Night5Answer = 'YOU_DECIDE'): GameState {
  let state = step(createGame(seed, choices.length === 3 ? 3 : 7));
  for (const choice of choices) {
    state = step(state);
    if (state.phase === 'EVENING_CHOICE') state = gameReducer(state, { type: 'ANSWER', answer });
    state = step(state);
    const resolved = resolveNight(state, choice);
    if (resolved === state) throw new Error(`Illegal choice ${choice} at N${state.night}`);
    state = step(step(resolved));
  }
  return state;
}
