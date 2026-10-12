import type { GameState, Stats, NightChoice, Night5Answer, Ending, NightRecord } from './types';

export function statsOf(state: Stats): Stats {
  return { trust: state.trust, affection: state.affection, honesty: state.honesty, readCount: state.readCount };
}
export const clamp = (value: number) => Math.max(0, Math.min(5, value));

export function canCallLuna(state: Stats): boolean {
  return state.affection >= 4 && state.trust >= 2 && state.honesty >= 1;
}

export function availableChoices(state: GameState): NightChoice[] {
  if (state.phase !== 'CHOICE' || !state.currentEvent) return [];
  if (state.night === 4) return ['CRY', 'SILENT', 'THANK'];
  if (state.night === 7 && canCallLuna(state)) return ['CRY', 'SILENT', 'CALL_LUNA'];
  return ['CRY', 'SILENT'];
}

export function determineEnding(state: Pick<GameState, 'trust' | 'affection' | 'lastChoice'>): Ending {
  if (state.lastChoice === 'CALL_LUNA') return 'HONEST';
  if (state.trust === 0) return 'BAD_LIAR';
  if (state.affection >= 4) return 'SECRET_MEETING';
  return 'GOOD_DOG';
}

export function morningReport(atPatrolPath: boolean, choice: NightChoice): string {
  if (atPatrolPath) return choice === 'CRY'
    ? '朝、見張り道の足跡が確認された。昨夜の報告と一致していた。'
    : '朝、見張り道の足跡が確認された。「何もいない」という報告との不一致が分かった。';
  return choice === 'CRY'
    ? '朝、見張り道に足跡はなかった。警報は空振りだった。'
    : '朝、見張り道に足跡はなかった。報告が必要な来訪はなかった。';
}

export function applyNight5Answer(state: GameState, answer: Night5Answer): GameState {
  if (state.night !== 5 || state.phase !== 'EVENING_CHOICE' || state.night5Answer !== undefined) return state;
  if (!['COME', 'DONT_COME', 'YOU_DECIDE'].includes(answer)) return state;
  return {
    ...state, night5Answer: answer,
    affection: clamp(state.affection + (answer === 'COME' ? 2 : answer === 'DONT_COME' ? -1 : 0)),
    honesty: state.honesty + (answer === 'COME' ? 1 : 0),
  };
}

export function resolveNight(state: GameState, choice: NightChoice, expectedNight = state.night): GameState {
  if (state.night !== expectedNight || !availableChoices(state).includes(choice)) return state;
  // The event was drawn before the choice. No random draw occurs here.
  const event = state.currentEvent!;
  let trust = 0, affection = 0, honesty = 0, readCount = 0;
  if (state.night === 4) {
    if (choice === 'CRY') { trust = -1; affection = -1; }
    if (choice === 'THANK') { affection = 2; honesty = 1; readCount = 1; }
  } else if (state.night === 7) {
    if (choice === 'CRY') { trust = -1; affection = -1; }
    else { affection = 1; honesty = choice === 'CALL_LUNA' ? 1 : 0; }
  } else if (event.atPatrolPath) {
    trust = choice === 'CRY' ? 1 : -1;
    affection = choice === 'CRY' ? -1 : 1;
    // readCount records recognition, without becoming a hidden ending guard.
    readCount = choice === 'SILENT' ? 1 : 0;
    if (state.night === 6 && choice === 'SILENT') honesty = 1;
  } else if (choice === 'CRY') {
    trust = -1;
    if (state.night === 2 && state.affection >= 1) affection = 1;
  }
  const before = statsOf(state);
  const after = { trust: clamp(state.trust + trust), affection: clamp(state.affection + affection), honesty: state.honesty + honesty, readCount: state.readCount + readCount };
  const record: NightRecord = {
    ...event, night: state.night, choice, before, after,
    ...(state.night === 5 ? { night5Answer: state.night5Answer } : {}),
    delta: { trust: after.trust - before.trust, affection: after.affection - before.affection, honesty, readCount },
    report: morningReport(event.atPatrolPath, choice),
  };
  const next: GameState = { ...state, ...after, lastChoice: choice, phase: 'REVEAL', history: [...state.history, record] };
  return state.night === 7 ? { ...next, ending: determineEnding(next), cleared: true } : next;
}
