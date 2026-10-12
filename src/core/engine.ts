import { SIGN_WEIGHTS, visitProbability } from './config';
import { nextRandom, normalizeSeed, weightedSign } from './rng';
import { applyNight5Answer, resolveNight } from './rules';
import type { GameState, DebugScenario, PhaseToken, Night5Answer, NightChoice, Night } from './types';

export function createGame(seed: number, limit: 3 | 7 = 3): GameState {
  const normalized = normalizeSeed(seed);
  return { night: 1, limit, trust: 3, affection: 0, honesty: 0, readCount: 0, seed: normalized, rngState: normalized, phase: 'INTRO', history: [], cleared: false };
}

export function prepareNight(state: GameState, debug: DebugScenario = {}): GameState {
  if (state.phase !== 'EVENING' && state.phase !== 'EVENING_CHOICE') return state;
  if (state.night === 5 && !state.night5Answer) return state;
  if (state.currentEvent) return state;
  // Two draws per night, even on fixed nights or forced debug outcomes.
  const visitRoll = nextRandom(state.rngState);
  const signRoll = nextRandom(visitRoll.state);
  const fixed = [1, 4, 7].includes(state.night);
  const lunaComes = fixed ? true : debug.visit ?? visitRoll.value < visitProbability(state);
  const atPatrolPath = state.night !== 4 && state.night !== 7 && lunaComes;
  const weights = SIGN_WEIGHTS[state.night][lunaComes ? 'present' : 'absent'];
  const sign = state.night === 1 ? 'RUSTLE' : state.night === 4 || state.night === 7 ? 'TRACE' : debug.sign ?? weightedSign(signRoll.value, weights);
  return { ...state, phase: 'SIGN', rngState: signRoll.state, currentEvent: { lunaComes, atPatrolPath, sign } };
}

export function advance(state: GameState, expected: PhaseToken, debug: DebugScenario = {}): GameState {
  if (state.night !== expected.night || state.phase !== expected.phase) return state;
  switch (state.phase) {
    case 'INTRO': return { ...state, phase: 'EVENING' };
    case 'EVENING': return state.night === 5 ? { ...state, phase: 'EVENING_CHOICE' } : prepareNight(state, debug);
    case 'SIGN': return { ...state, phase: 'CHOICE' };
    case 'REVEAL': return { ...state, phase: 'REPORT' };
    case 'REPORT':
      if (state.night === state.limit) return { ...state, phase: state.limit === 3 ? 'DEMO_COMPLETE' : 'ENDING' };
      return { ...state, night: (state.night + 1) as Night, phase: 'EVENING', currentEvent: undefined };
    default: return state;
  }
}

export type Action =
  | { type: 'ADVANCE'; expected: PhaseToken; debug?: DebugScenario }
  | { type: 'CHOOSE'; night: Night; choice: NightChoice }
  | { type: 'ANSWER'; answer: Night5Answer; debug?: DebugScenario };

export function gameReducer(state: GameState, action: Action): GameState {
  if (action.type === 'ADVANCE') return advance(state, action.expected, action.debug);
  if (action.type === 'CHOOSE') return resolveNight(state, action.choice, action.night);
  const answered = applyNight5Answer(state, action.answer);
  return answered === state ? state : prepareNight(answered, action.debug);
}
