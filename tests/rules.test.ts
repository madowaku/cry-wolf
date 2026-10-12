import { describe, it, expect } from 'vitest';
import { SIGN_WEIGHTS, visitProbability, DEFAULT_SEED } from '../src/core/config';
import { nextRandom, normalizeSeed, weightedSign } from '../src/core/rng';
import { createGame, prepareNight, gameReducer } from '../src/core/engine';
import { resolveNight, applyNight5Answer, availableChoices, canCallLuna, determineEnding } from '../src/core/rules';
import { atChoice, step, play } from './helpers';
import type { NightChoice } from '../src/core/types';

describe('configuration and seed', () => {
  it('all sign rows total 100 and have three legal nonnegative weights', () => {
    for (const entry of Object.values(SIGN_WEIGHTS)) for (const weights of Object.values(entry)) {
      expect(weights).toHaveLength(3); expect(weights.reduce((a,b) => a+b, 0)).toBe(100);
      expect(weights.every(value => Number.isInteger(value) && value >= 0 && value <= 100)).toBe(true);
    }
  });
  it('visit thresholds match every specified night and answer', () => {
    const state = createGame(1,7);
    const probability = (night: typeof state.night, affection = 0, night5Answer?: typeof state.night5Answer) => visitProbability({ night, affection, night5Answer });
    expect([1,4,7].map(n => probability(n as typeof state.night))).toEqual([1,1,1]);
    expect([probability(2), probability(2,1), probability(3,1), probability(3,2)]).toEqual([.75,.85,.25,.4]);
    expect([probability(5,0,'COME'),probability(5,0,'DONT_COME'),probability(5,0,'YOU_DECIDE')]).toEqual([.9,.1,.5]);
    expect([probability(6,3),probability(6,4),probability(6,5,'DONT_COME')]).toEqual([.35,.55,.2]);
  });
  it('seed normalization handles zero, NaN, negative, large and fractional seeds', () => {
    expect(normalizeSeed(0)).toBe(0); expect(normalizeSeed(NaN)).toBe(DEFAULT_SEED);
    expect(normalizeSeed(-1)).toBe(4294967295); expect(normalizeSeed(4294967296)).toBe(0); expect(normalizeSeed(4.9)).toBe(4);
  });
  it('RNG is deterministic and remains in [0,1)', () => {
    let state = 0;
    for(let i=0;i<10000;i++) { const draw=nextRandom(state); expect(draw).toEqual(nextRandom(state)); expect(draw.value).toBeGreaterThanOrEqual(0); expect(draw.value).toBeLessThan(1); state=draw.state; }
  });
  it('weighted draws respect exact interval boundaries', () => {
    expect([0,.149999,.15,.749999,.75,.999999].map(roll => weightedSign(roll,[15,60,25]))).toEqual(['QUIET','QUIET','RUSTLE','RUSTLE','TRACE','TRACE']);
  });
  it('1,000 complete fixed-seed runs reproduce RNG, visits, signs, stats and history', () => {
    const choices: NightChoice[] = ['SILENT','CRY','SILENT','THANK','CRY','SILENT','SILENT'];
    for(let seed=0;seed<1000;seed++) expect(play(seed,choices,'COME')).toEqual(play(seed,choices,'COME'));
  });
  it('preparation is idempotent and consumes exactly two RNG draws per night', () => {
    const start = {...createGame(123),phase:'EVENING' as const};
    const prepared=prepareNight(start); expect(prepared.rngState).toBe(nextRandom(nextRandom(start.rngState).state).state);
    expect(prepareNight(prepared)).toBe(prepared); expect(start.currentEvent).toBeUndefined();
  });
  it.each([1,4,7])('fixed N%s overrides debug attendance and keeps path semantics', night => {
    const state=atChoice(night,{visit:false,sign:'QUIET'});
    expect(state.currentEvent?.lunaComes).toBe(true); expect(state.currentEvent?.atPatrolPath).toBe(night===1);
    expect(state.currentEvent?.sign).toBe(night===1 ? 'RUSTLE' : 'TRACE');
  });
  it('forced visits and signs preserve the underlying RNG consumption', () => {
    const state={...createGame(5,7),night:2 as const,phase:'EVENING' as const};
    const forced=prepareNight(state,{visit:false,sign:'TRACE'});
    expect(forced.rngState).toBe(prepareNight(state).rngState);
    expect(forced.currentEvent).toEqual({lunaComes:false,atPatrolPath:false,sign:'TRACE'});
  });
});

describe('ordinary-night rules', () => {
  it.each([
    [true,'CRY',4,1], [true,'SILENT',2,3], [false,'CRY',2,2], [false,'SILENT',3,2],
  ] as const)('visit=%s choice=%s', (visit,choice,trust,affection) => {
    const start=atChoice(3,{visit},{affection:2}); const before=structuredClone(start);
    const result=resolveNight(start,choice);
    expect([result.trust,result.affection]).toEqual([trust,affection]);
    expect(result.rngState).toBe(start.rngState); expect(result.currentEvent).toBe(start.currentEvent);
    expect(start).toEqual(before); expect(result.history).toHaveLength(1);
    expect(result.history[0].report).toContain(visit ? '足跡が確認' : '足跡はなかった');
  });
  it.each([0,1])('N2 absent CRY affection bonus uses pre-choice affection=%s once', affection => {
    const result=resolveNight(atChoice(2,{visit:false},{affection}),'CRY');
    expect(result.affection).toBe(affection===0 ? 0 : 2); expect(resolveNight(result,'CRY')).toBe(result);
  });
  it('N3 absent CRY never applies the N2 bonus', () => expect(resolveNight(atChoice(3,{visit:false},{affection:2}),'CRY').affection).toBe(2));
  it('values clamp and deltas show the applied change, including zero', () => {
    const max=resolveNight(atChoice(1,{}, {trust:5,affection:0}),'CRY'); expect([max.trust,max.affection]).toEqual([5,0]);
    expect([max.history[0].delta.trust,max.history[0].delta.affection]).toEqual([0,0]);
    const min=resolveNight(atChoice(1,{}, {trust:0,affection:5}),'SILENT'); expect([min.trust,min.affection]).toEqual([0,5]);
  });
  it('trust 0 still advances to the next night', () => {
    const result=resolveNight(atChoice(1,{}, {trust:0}),'SILENT'); const next=step(step(result));
    expect([next.phase,next.night,next.trust]).toEqual(['EVENING',2,0]);
  });
  it('present SILENT explains the morning evidence rather than omniscient detection', () => {
    const report=resolveNight(atChoice(1),'SILENT').history[0].report;
    expect(report).toContain('朝'); expect(report).toContain('見張り道の足跡'); expect(report).toContain('不一致');
  });
});

describe('special nights and guards', () => {
  it.each([['CRY',2,1,0,0],['SILENT',3,2,0,0],['THANK',3,4,1,1]] as const)('N4 %s', (choice,trust,affection,honesty,readCount) => {
    const result=resolveNight(atChoice(4,{}, {affection:2}),choice);
    expect([result.trust,result.affection,result.honesty,result.readCount]).toEqual([trust,affection,honesty,readCount]);
    expect(result.history[0].atPatrolPath).toBe(false);
  });
  it.each([['COME',4,1,.9],['DONT_COME',1,0,.1],['YOU_DECIDE',2,0,.5]] as const)('N5 evening %s changes no trust and applies once', (answer,affection,honesty,probability) => {
    const state={...createGame(1,7),night:5 as const,phase:'EVENING_CHOICE' as const,affection:2};
    const result=applyNight5Answer(state,answer);
    expect([result.trust,result.affection,result.honesty]).toEqual([3,affection,honesty]);
    expect(visitProbability(result)).toBe(probability); expect(applyNight5Answer(result,answer)).toBe(result);
  });
  it('N5 records both evening answer and night report independently', () => {
    const state={...createGame(1,7),night:5 as const,phase:'EVENING_CHOICE' as const};
    const answered=gameReducer(state,{type:'ANSWER',answer:'COME',debug:{visit:true}});
    expect(answered.trust).toBe(3);
    expect(gameReducer(answered,{type:'ANSWER',answer:'COME'})).toBe(answered);
    const result=resolveNight(step(answered),'SILENT');
    expect(result.history[0].night5Answer).toBe('COME'); expect(result.history[0].choice).toBe('SILENT');
    expect([result.trust,result.affection,result.honesty]).toEqual([2,3,1]);
  });
  it('N5 cannot draw a night before an evening answer', () => {
    expect(atChoice(5).currentEvent).toBeUndefined();
  });
  it('N6 visit + silence adds exactly one affection and one honesty', () => {
    const result=resolveNight(atChoice(6,{visit:true},{affection:2}),'SILENT');
    expect([result.trust,result.affection,result.honesty]).toEqual([2,3,1]);
  });
  it.each([['CRY',2,1,0],['SILENT',3,3,0]] as const)('N7 %s treats Luna as outside the path', (choice,trust,affection,honesty) => {
    const result=resolveNight(atChoice(7,{}, {affection:2}),choice);
    expect([result.trust,result.affection,result.honesty]).toEqual([trust,affection,honesty]);
    expect(result.history[0].atPatrolPath).toBe(false); expect(result.history[0].report).toContain('足跡はなかった');
  });
  it('CALL_LUNA requires every boundary and is unavailable in all other nights', () => {
    for(let trust=0;trust<=5;trust++) for(let affection=0;affection<=5;affection++) for(let honesty=0;honesty<=2;honesty++) {
      const state=atChoice(7,{}, {trust,affection,honesty}); const legal=trust>=2 && affection>=4 && honesty>=1;
      expect(canCallLuna(state)).toBe(legal); expect(availableChoices(state).includes('CALL_LUNA')).toBe(legal);
      const result=resolveNight(state,'CALL_LUNA'); expect(result===state).toBe(!legal);
      if(legal) expect([result.ending,result.affection,result.honesty]).toEqual(['HONEST',Math.min(5,affection+1),honesty+1]);
    }
    for(let night=1;night<=6;night++) expect(availableChoices(atChoice(night,{}, {affection:5,trust:5,honesty:2,night5Answer:'COME'}))).not.toContain('CALL_LUNA');
  });
  it('THANK is available and executable only on N4', () => {
    for(let night=1;night<=7;night++) { const state=atChoice(night,{}, {night5Answer:'COME'}); expect(availableChoices(state).includes('THANK')).toBe(night===4); if(night!==4) expect(resolveNight(state,'THANK')).toBe(state); }
  });
  it('ending priority is total and unique for all bounded stats', () => {
    for(let trust=0;trust<=5;trust++) for(let affection=0;affection<=5;affection++) {
      expect(determineEnding({trust,affection,lastChoice:'CALL_LUNA'})).toBe('HONEST');
      expect(determineEnding({trust,affection,lastChoice:'SILENT'})).toBe(trust===0 ? 'BAD_LIAR' : affection>=4 ? 'SECRET_MEETING' : 'GOOD_DOG');
    }
  });
});

describe('state progression and duplicate events', () => {
  it('repeated choices and cross-night stale actions are ignored', () => {
    const start=atChoice(1), result=resolveNight(start,'SILENT');
    expect(resolveNight(result,'CRY')).toBe(result);
    const next=step(step(result)); const nextChoice=step(step(next));
    expect(gameReducer(nextChoice,{type:'CHOOSE',night:1,choice:'CRY'})).toBe(nextChoice);
  });
  it('repeated advance actions cannot skip phases or nights', () => {
    const start=createGame(1), action={type:'ADVANCE' as const,expected:{night:start.night,phase:start.phase}};
    const next=gameReducer(start,action); expect(gameReducer(next,action)).toBe(next);
    expect(step(atChoice(1)).phase).toBe('CHOICE');
  });
  it('3-night demo ends without an ending or a fourth-night transition', () => {
    const result=play(20261010,['SILENT','CRY','SILENT']);
    expect([result.phase,result.night,result.history.length,result.ending,result.cleared]).toEqual(['DEMO_COMPLETE',3,3,undefined,false]);
    expect(step(result)).toBe(result);
  });
  it('7-night core ends without an eighth night', () => {
    const result=play(0,['CRY','CRY','CRY','CRY','CRY','CRY','CRY']);
    expect([result.phase,result.night,result.history.length,result.cleared]).toEqual(['ENDING',7,7,true]); expect(step(result)).toBe(result);
  });
  it('JSON round trip preserves the already-drawn event and duplicate guard (not a save UI test)', () => {
    const choice=atChoice(2,{visit:false,sign:'TRACE'},{affection:1});
    const resumed=JSON.parse(JSON.stringify(choice));
    expect(resolveNight(resumed,'CRY')).toEqual(resolveNight(choice,'CRY'));
    const resolved=resolveNight(resumed,'CRY'); expect(resolveNight(JSON.parse(JSON.stringify(resolved)),'CRY')).toEqual(resolved);
  });
});
