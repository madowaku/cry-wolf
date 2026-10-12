import { DEFAULT_SEED, SIGN_ORDER } from './config';
import type { Sign } from './types';

export function normalizeSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : DEFAULT_SEED;
}

// Mulberry32, with its entire state returned instead of hidden in a closure.
export function nextRandom(state: number): { value: number; state: number } {
  const next = (state + 0x6D2B79F5) >>> 0;
  let value = Math.imul(next ^ (next >>> 15), next | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return { value: ((value ^ (value >>> 14)) >>> 0) / 4294967296, state: next };
}

export function weightedSign(roll: number, weights: number[]): Sign {
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i] / 100;
    if (roll < cumulative) return SIGN_ORDER[i];
  }
  return 'TRACE';
}
