import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

type State = { stage: string; phase: string; result: {code: string; before: Record<string,number>; after: Record<string,number>}; flags: Record<string,unknown> };
const context: Record<string, unknown> = {};
for (const file of ['model.js','story.js','story-late.js','presentation.js']) runInNewContext(readFileSync('public/moon/'+file,'utf8'),context);
const P = context.CWPresentation as { resultChanges(s:State): {key:string; before:number; after:number; delta:number}[]; visual(s:State,home:boolean,step:number): {kind:string;location?:string}; isPromiseCover(s:{phase:string;ending:string|null},home:boolean):boolean };
const S = context.CWStory as { changeReason(s:State,key:string):string };
const state = (before:Record<string,number>,after:Record<string,number>):State => ({stage:'night1',phase:'result',flags:{},result:{code:'ring',before,after}});
describe('Moon finishing: actual result differences and concealed location', () => {
  it('reports actual clamped differences, including zero at the upper limit', () => {
    const s=state({trust:5,bond:0,insight:0},{trust:5,bond:0,insight:0});
    expect(P.resultChanges(s).map(c=>c.delta)).toEqual([0,0,0]);
    expect(S.changeReason(s,'trust')).toContain('上限');
    expect(S.changeReason(s,'bond')).toContain('距離');
  });
  it('reports first-night positive trust and unchanged bond separately', () => {
    const s=state({trust:3,bond:0,insight:0},{trust:4,bond:0,insight:0});
    expect(P.resultChanges(s).map(c=>[c.before,c.after,c.delta])).toEqual([[3,4,1],[0,0,0],[0,0,0]]);
    expect(S.changeReason(s,'trust')).toContain('正しく');
  });
  it('reports actual lower-limit loss rather than the planned minus two', () => {
    const s=state({trust:1,bond:0,insight:0},{trust:0,bond:0,insight:0});s.stage='night2';s.result.code='false';
    expect(P.resultChanges(s)[0].delta).toBe(-1);
    expect(S.changeReason(s,'trust')).toContain('誤報');
  });
  it('keeps second-night location unknown before investigation', () => {
    const s=state({},{});s.stage='night2';s.phase='explore2';
    expect(P.visual(s,false,0).location).toBeUndefined();
  });
  it('focuses the bell on first-night decision without ringing it', () => {
    const s=state({},{});s.phase='choice1';
    expect(P.visual(s,false,0).kind).toBe('decision');
  });
  it('reserves the close full-moon cover for completed HONEST, not home or earlier epilogue', () => {
    expect(P.isPromiseCover({phase:'finish',ending:'HONEST'},false)).toBe(true);
    expect(P.isPromiseCover({phase:'finish',ending:'HONEST'},true)).toBe(false);
    expect(P.isPromiseCover({phase:'epilogue',ending:'HONEST'},false)).toBe(false);
    for(const ending of ['GOOD_DOG','SECRET_MEETING','BAD_LIAR',null]) expect(P.isPromiseCover({phase:'finish',ending},false)).toBe(false);
  });
});
