import type { Night, Sign, GameState } from './types';

export const DEFAULT_SEED = 20261010;
export const SIGN_ORDER: Sign[] = ['QUIET', 'RUSTLE', 'TRACE'];
// Each entry is QUIET / RUSTLE / TRACE; these are evidence, never proof.
export const SIGN_WEIGHTS: Record<Night, { present: number[]; absent: number[] }> = {
  1: { present: [0, 100, 0], absent: [0, 100, 0] },
  2: { present: [15, 60, 25], absent: [60, 30, 10] },
  3: { present: [30, 50, 20], absent: [50, 35, 15] },
  4: { present: [0, 0, 100], absent: [0, 0, 100] },
  5: { present: [20, 50, 30], absent: [55, 35, 10] },
  6: { present: [70, 25, 5], absent: [55, 35, 10] },
  7: { present: [0, 0, 100], absent: [0, 0, 100] },
};

export function visitProbability(state: Pick<GameState, 'night' | 'affection' | 'night5Answer'>): number {
  switch (state.night) {
    case 1: case 4: case 7: return 1;
    case 2: return state.affection >= 1 ? .85 : .75;
    case 3: return state.affection >= 2 ? .40 : .25;
    case 5: return state.night5Answer === 'COME' ? .90 : state.night5Answer === 'DONT_COME' ? .10 : .50;
    case 6: {
      const probability = state.affection >= 4 ? .55 : .35;
      return state.night5Answer === 'DONT_COME' ? Math.min(.20, probability) : probability;
    }
  }
}
