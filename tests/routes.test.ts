import { it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createGame, gameReducer } from '../src/core/engine';
import { availableChoices, resolveNight } from '../src/core/rules';
import { SIGN_WEIGHTS } from '../src/core/config';
import { eveningLines, revealLines, reportLines } from '../src/data/dialogue';
import { step, play } from './helpers';
import type { GameState, NightChoice, Night5Answer, Ending, Sign } from '../src/core/types';

const SIGNS: Sign[] = ['QUIET','RUSTLE','TRACE'];
// All fields used by future transitions/guards. Full history is retained on the
// representative state; only its used projection is included in this hash.
function stateHash(state: GameState): string {
  const { history, currentEvent, ...fields } = state;
  return JSON.stringify({ ...fields, currentEvent, hadPatrolVisit: history.some(record=>record.atPatrolPath) });
}

it('enumerates every legal outcome/choice and verifies terminal reachability with state pruning', () => {
  let states=[step(createGame(0,7))];
  const layers: {night:number;entryStates:number;transitions:number;nextStates:number;branches:string[]}[]=[];
  const endings=new Set<Ending>();
  for(let night=1;night<=7;night++) {
    const nextStates=new Map<string,GameState>(), branches=new Set<string>(); let transitions=0;
    for(const state of states) {
      expect(state.night).toBe(night); expect(eveningLines(state).length).toBeGreaterThan(0);
      const answers: (Night5Answer | undefined)[]=night===5 ? ['COME','DONT_COME','YOU_DECIDE'] : [undefined];
      const visits=[1,4,7].includes(night) ? [true] : [true,false];
      for(const answer of answers) for(const visit of visits) {
        const weights=SIGN_WEIGHTS[state.night][visit ? 'present' : 'absent'];
        for(const sign of SIGNS.filter((_,i)=>weights[i]>0)) {
          let choiceState=step(state,{visit,sign});
          if(answer) choiceState=gameReducer(choiceState,{type:'ANSWER',answer,debug:{visit,sign}});
          choiceState=step(choiceState);
          const choices=availableChoices(choiceState); expect(choices.length).toBeGreaterThanOrEqual(2);
          for(const choice of choices) {
            const resolved=resolveNight(choiceState,choice); transitions++;
            expect(resolved.history).toHaveLength(night);
            expect(resolveNight(resolved,choice)).toBe(resolved);
            expect(resolved.trust).toBeGreaterThanOrEqual(0); expect(resolved.trust).toBeLessThanOrEqual(5);
            expect(resolved.affection).toBeGreaterThanOrEqual(0); expect(resolved.affection).toBeLessThanOrEqual(5);
            expect(revealLines(resolved).length).toBeGreaterThan(0); expect(reportLines(resolved).length).toBeGreaterThan(0);
            const next=step(step(resolved));
            branches.add(`${visit ? 'present' : 'absent'}/${sign}/${answer ?? '-'}/${choice}`);
            if(night===7) { expect(next.phase).toBe('ENDING'); expect(next.ending).toBeDefined(); endings.add(next.ending!); }
            else { expect(next.phase).toBe('EVENING'); expect(next.night).toBe(night+1); }
            nextStates.set(stateHash(next),next);
          }
        }
      }
    }
    layers.push({night,entryStates:states.length,transitions,nextStates:nextStates.size,branches:[...branches].sort()});
    states=[...nextStates.values()];
  }
  expect([...endings].sort()).toEqual(['BAD_LIAR','GOOD_DOG','HONEST','SECRET_MEETING']);
  mkdirSync('docs',{recursive:true});
  writeFileSync('docs/qa-exhaustive.json',JSON.stringify({method:'All legal attendance/sign outcomes and choices with future-relevant state pruning; probability weights not sampled.',historyProjection:'Any prior patrol visit for N5 dialogue. No ending guard reads full history.',layers,endings:[...endings].sort()},null,2)+'\n');
});

it('finds and replays a concrete fixed-seed route to each of the four endings', () => {
  const plans: {ending:Ending;choices:NightChoice[];answer:Night5Answer}[]=[
    {ending:'GOOD_DOG',choices:['CRY','CRY','SILENT','SILENT','CRY','SILENT','CRY'],answer:'DONT_COME'},
    {ending:'BAD_LIAR',choices:['SILENT','SILENT','SILENT','CRY','SILENT','SILENT','CRY'],answer:'COME'},
    {ending:'SECRET_MEETING',choices:['SILENT','CRY','SILENT','THANK','SILENT','SILENT','SILENT'],answer:'COME'},
    {ending:'HONEST',choices:['SILENT','CRY','SILENT','THANK','CRY','SILENT','CALL_LUNA'],answer:'COME'},
  ];
  const routes=[];
  for(const plan of plans) {
    let found:GameState|undefined;
    for(let seed=0;seed<10000;seed++) {
      let candidate:GameState;
      try { candidate=play(seed,plan.choices,plan.answer); } catch { continue; }
      if(candidate.ending===plan.ending) { found=candidate; break; }
    }
    expect(found,`route ${plan.ending}`).toBeDefined();
    expect(play(found!.seed,plan.choices,plan.answer)).toEqual(found);
    routes.push({ending:plan.ending,seed:found!.seed,choices:plan.choices,night5Answer:plan.answer,final:{trust:found!.trust,affection:found!.affection,honesty:found!.honesty},visits:found!.history.map(record=>record.lunaComes),signs:found!.history.map(record=>record.sign),observedPhase:found!.phase,verification:'Pure engine, 7 nights. This milestone UI stops after N3.'});
  }
  mkdirSync('docs',{recursive:true});
  writeFileSync('docs/qa-routes.json',JSON.stringify(routes,null,2)+'\n');
});
