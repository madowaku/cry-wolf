import { it, expect } from 'vitest';
import { INTRO, eveningLines, revealLines, reportLines, signLines, night6Reaction, ENDING_LINES, NIGHT5_REPLIES } from '../src/data/dialogue';
import { atChoice } from './helpers';
import { availableChoices, resolveNight } from '../src/core/rules';

it('every legal night outcome and choice has nonempty dialogue and an evidence report', () => {
  for(let night=1;night<=7;night++) for(const visit of [true,false]) for(const sign of ['QUIET','RUSTLE','TRACE'] as const) {
    const state=atChoice(night,{visit,sign},{trust:3,affection:4,honesty:1,night5Answer:'COME'});
    const validLines = (lines: typeof INTRO) => expect(lines.every(line => ['ベル','ルナ','情景','村人','村長','ナレーション','夜番の心得'].includes(line.speaker) && line.text.trim().length>0)).toBe(true);
    validLines(eveningLines(state)); validLines(signLines(state));
    for(const choice of availableChoices(state)) {
      const result=resolveNight(state,choice);
      expect(revealLines(result).length).toBeGreaterThan(0); expect(reportLines(result).length).toBeGreaterThan(0);
      validLines(revealLines(result)); validLines(reportLines(result));
    }
  }
  for(const lines of [...Object.values(ENDING_LINES),...Object.values(NIGHT5_REPLIES)]) expect(lines.length).toBeGreaterThan(0);
});

it('N6 dialogue follows priority at overlapping and boundary conditions', () => {
  expect(night6Reaction({trust:4,affection:2,honesty:0})).toContain('村の方');
  expect(night6Reaction({trust:2,affection:4,honesty:0})).toContain('黙って');
  expect(night6Reaction({trust:3,affection:3,honesty:0})).toContain('何考えてる');
  expect(night6Reaction({trust:3,affection:3,honesty:1})).toContain('嘘ついて');
});

it('N2 absent dialogue appears the next morning, never as present-night Luna', () => {
  const result=resolveNight(atChoice(2,{visit:false},{affection:1}),'CRY');
  expect(revealLines(result).every(line => line.speaker!=='ルナ')).toBe(true);
  expect(reportLines(result).some(line => line.text==='昨日、私いなかったけど。')).toBe(true);
});

it('N3 absent CRY gets its specific morning response', () => {
  expect(reportLines(resolveNight(atChoice(3,{visit:false}),'CRY')).some(line=>line.text==='私、そんなに信用ない？')).toBe(true);
});

it('no absent reveal claims an arrival or displays a Luna line', () => {
  for(const night of [2,3,5,6]) for(const choice of ['CRY','SILENT'] as const) {
    const result=resolveNight(atChoice(night,{visit:false},{night5Answer:'COME'}),choice);
    expect(revealLines(result).every(line=>line.speaker!=='ルナ')).toBe(true);
  }
});
