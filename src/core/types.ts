export type Night = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Sign = 'QUIET' | 'RUSTLE' | 'TRACE';
export type NightChoice = 'CRY' | 'SILENT' | 'THANK' | 'CALL_LUNA';
export type Night5Answer = 'COME' | 'DONT_COME' | 'YOU_DECIDE';
export type Ending = 'HONEST' | 'BAD_LIAR' | 'SECRET_MEETING' | 'GOOD_DOG';
export type Phase = 'INTRO' | 'EVENING' | 'EVENING_CHOICE' | 'SIGN' | 'CHOICE' | 'REVEAL' | 'REPORT' | 'DEMO_COMPLETE' | 'ENDING';
export type Line = { speaker: 'ベル' | 'ルナ' | '村人' | '村長' | 'ナレーション' | '夜番の心得' | '情景'; text: string };
export type Stats = { trust: number; affection: number; honesty: number; readCount: number };
export type NightEvent = { lunaComes: boolean; atPatrolPath: boolean; sign: Sign };
export type Delta = Stats;
export type NightRecord = NightEvent & {
  night: Night; choice: NightChoice; night5Answer?: Night5Answer;
  before: Stats; after: Stats; delta: Delta; report: string;
};
export type GameState = Stats & {
  night: Night; limit: 3 | 7; phase: Phase;
  seed: number; rngState: number;
  currentEvent?: NightEvent; night5Answer?: Night5Answer;
  lastChoice?: NightChoice; history: NightRecord[]; ending?: Ending; cleared: boolean;
};
export type DebugScenario = { visit?: boolean; sign?: Sign };
export type PhaseToken = { night: Night; phase: Phase };
