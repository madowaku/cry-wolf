import { describe, expect, it } from 'vitest';
import { createGame, gameReducer } from '../src/core/engine';
import { resolveNight } from '../src/core/rules';
import { INTRO_CHAPTERS, ONBOARDING, RULE_HELP, choiceText, historyChoiceText, resultFeedback, showLunaInScene } from '../src/data/onboarding';
import { eveningLines, reportLines, revealLines } from '../src/data/dialogue';
import { atChoice, step } from './helpers';

describe('v0.4 onboarding without changing the v0.3 engine', () => {
  it('introduces the fable, Bell’s duty and Luna’s identity in three chapters', () => {
    expect(INTRO_CHAPTERS).toHaveLength(3);
    const text = INTRO_CHAPTERS.map(chapter => chapter.lines.map(line => line.text).join(''));
    expect(text[0]).toContain('信じなく');
    expect(text[1]).toContain('見張り道に入ったら、鐘を鳴らす');
    expect(text[2]).toContain('落とした小さな鐘');
    expect(text[2]).toContain('オオカミ娘');
    expect(text[2]).toContain('ルナよ');
    expect(text[2]).toContain('鐘、鳴らす？');
  });

  it('N1 publishes Luna’s presence while later choices describe a report', () => {
    expect(ONBOARDING.n1Presence).toContain('見張り道にいる');
    expect(choiceText(1, 'SILENT').label).toBe('見逃して、少し話す');
    expect(choiceText(1, 'SILENT').detail).toContain('「異常なし」');
    for (const night of [2, 3]) expect(choiceText(night, 'SILENT').label).toBe('今夜は「異常なし」と報告');
    expect(historyChoiceText(1, 'SILENT')).not.toContain('何もいない');
    expect(RULE_HELP.join('')).toContain('翌朝の足跡確認');
  });

  it('entering N1 after the intro uses the same draws and fixed event as v0.3', () => {
    const original = createGame(0);
    const evening = gameReducer(original, { type: 'ADVANCE', expected: { night: 1, phase: 'INTRO' } });
    const night = gameReducer(evening, { type: 'ADVANCE', expected: { night: 1, phase: 'EVENING' }, debug: { visit: false, sign: 'QUIET' } });
    expect(night).toEqual(step(step(original)));
    expect(night.currentEvent).toEqual({ lunaComes: true, atPatrolPath: true, sign: 'RUSTLE' });
  });

  it.each(['CRY', 'SILENT'] as const)('N1 %s has exact stats, dialogue and morning causes', choice => {
    const result = resolveNight(atChoice(1), choice);
    const feedback = resultFeedback(result.history[0]);
    expect([result.trust, result.affection]).toEqual(choice === 'CRY' ? [4, 0] : [2, 1]);
    const reveal = revealLines(result).map(line => line.text).join('');
    const report = reportLines(result).map(line => line.text).join('');
    if (choice === 'CRY') {
      expect(reveal).toContain('カラン、カラン');
      expect(reveal).toContain('ルナは森へ帰った');
      expect(feedback.affection).toMatchObject({ value: 0, limit: '下限0' });
      expect(feedback.trust.reason).toContain('正しく報告');
    } else {
      expect(reveal).toContain('もう少しだけ、話してもいい？');
      expect(report).toContain('足跡');
      expect(report).toContain('異常なし');
      expect(feedback.trust.reason).toContain('食い違った');
    }
  });

  it('shows Luna before N1’s choice and hides her during inference on N2/3', () => {
    for (const night of [1, 2, 3]) for (const visit of [true, false]) {
      const choice = atChoice(night, { visit });
      expect(showLunaInScene({ ...choice, phase: 'SIGN' })).toBe(night === 1);
      expect(showLunaInScene(choice)).toBe(night === 1);
      expect(showLunaInScene({ ...choice, phase: 'EVENING' })).toBe(true);
      const result = resolveNight(choice, 'SILENT');
      expect(showLunaInScene(result)).toBe(night === 1 || visit);
      expect(showLunaInScene({ ...result, phase: 'REPORT' })).toBe(false);
    }
  });

  for (const night of [2, 3]) for (const visit of [true, false]) for (const choice of ['CRY', 'SILENT'] as const) {
    it(`N${night} visit=${visit} ${choice}: truth precedes dialogue and reasons match the delta`, () => {
      const result = resolveNight(atChoice(night, { visit }, { affection: 2 }), choice);
      const record = result.history[0], feedback = resultFeedback(record);
      expect(feedback.trust.value).toBe(visit ? choice === 'CRY' ? 1 : -1 : choice === 'CRY' ? -1 : 0);
      expect(feedback.affection.value).toBe(visit ? choice === 'CRY' ? -1 : 1 : night === 2 && choice === 'CRY' ? 1 : 0);
      expect(revealLines(result)[0].text).toBe(feedback.outcome);
      expect(reportLines(result)[0].text).toContain('足跡');
      if (visit && choice === 'SILENT') expect(feedback.trust.reason).toContain('報告が食い違った');
      if (visit && choice === 'CRY') expect(feedback.affection.reason).toContain('話す時間はなくなった');
      if (!visit) expect(revealLines(result).some(line => line.speaker === 'ルナ')).toBe(false);
      if (!visit && choice === 'CRY') expect(feedback.trust.reason).toContain('誤認');
      if (!visit && choice === 'SILENT') expect(feedback.trust.reason).toContain('正しく報告');
    });
  }

  it('N2 bonus still requires prior affection, appears as later news and respects the cap', () => {
    for (const affection of [0, 1, 5]) {
      const result = resolveNight(atChoice(2, { visit: false }, { affection }), 'CRY');
      const feedback = resultFeedback(result.history[0]);
      expect(result.affection).toBe(affection === 0 ? 0 : Math.min(5, affection + 1));
      if (affection >= 1) expect(feedback.affection.reason).toContain('後日ルナが警報の噂を聞き');
      if (affection === 5) expect(feedback.affection.limit).toBe('上限5');
      expect(reportLines(result).some(line => line.text.includes('後日。警報の噂'))).toBe(true);
      expect(resolveNight(JSON.parse(JSON.stringify(result)), 'CRY')).toEqual(result);
    }
  });

  it('N3 state round trip keeps the exact phase, history and already-drawn event', () => {
    const state = atChoice(3, { visit: false, sign: 'TRACE' }, { history: resolveNight(atChoice(1), 'SILENT').history });
    const resumed = JSON.parse(JSON.stringify(state));
    expect(resumed).toEqual(state);
    expect(resolveNight(resumed, 'CRY')).toEqual(resolveNight(state, 'CRY'));
    expect(resumed.phase).toBe('CHOICE'); // State compatibility only; save/continue UI does not exist.
  });

  it('N2 starts inference and N3 challenges repeated suspicion without adding a rule', () => {
    expect(ONBOARDING.n2Hint).toContain('予告と夜の兆候');
    expect(eveningLines(atChoice(2))[0].text).toBe('今日は行かない。……なに、その顔。');
    expect(eveningLines(atChoice(3)).at(-1)?.text).toBe('だからって、毎回疑わないでよ。');
  });
});
