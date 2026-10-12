import type { GameState, Line, NightChoice, NightRecord } from '../core/types';

export const INTRO_CHAPTERS: { title: string; caption: string; lines: Line[] }[] = [
  {
    title: '昔、オオカミだと叫んだ少年がいた', caption: '小さな村と、遠くの鐘',
    lines: [
      { speaker: 'ナレーション', text: 'むかし、何度も「オオカミだ！」と嘘をついた少年がいました。' },
      { speaker: 'ナレーション', text: 'とうとう村の人たちは、その声を信じなくなってしまいました。' },
    ],
  },
  {
    title: 'ベルの仕事', caption: '村の門 · 犬の少年ベル、今夜から夜番',
    lines: [
      { speaker: '村長', text: 'ベル。今夜から村の見張り番を頼むよ。' },
      { speaker: '村長', text: 'オオカミが見張り道に入ったら、鐘を鳴らす。嘘の警報を続けると、信用を失うぞ。' },
      { speaker: 'ベル', text: 'はい！ 僕、ちゃんとやります！' },
    ],
  },
  {
    title: 'ところが、その夜', caption: '月夜の見張り道 · 灰銀色のオオカミ娘',
    lines: [
      { speaker: '情景', text: 'ベルが落とした小さな鐘を、赤いリボンのオオカミ娘が拾った。' },
      { speaker: 'ルナ', text: 'これ、落としたわよ。まじめな見張りさん？' },
      { speaker: 'ベル', text: 'ありがとう……って、オ、オオカミ！？' },
      { speaker: 'ルナ', text: 'ルナよ。ねえベル、私を見つけちゃったね？' },
      { speaker: 'ルナ', text: 'ふふ。鐘、鳴らす？' },
    ],
  },
];

export const RULE_HELP = [
  'ベルの仕事：オオカミが見張り道に来たら、鐘で村に知らせる。',
  '間違って鳴らすと、村の信用が下がる。',
  '本当に来たのに「異常なし」と報告しても、翌朝の足跡確認でばれる。',
  'ルナと話すほど仲良くなれるかも。でも仕事も大事。',
  '目標：7夜の見張り番を務めながら、ルナとの関係を育てよう。',
];

export const ONBOARDING = {
  n1Presence: 'ルナは今、見張り道にいる。',
  n1Rule: '見張り道にオオカミが来たら、鐘を鳴らして村へ知らせる。\nでも、ルナはもう少し話したそうだ……。',
  n1Choice: '優しく鐘を返してくれた。\n……もう少し、話してみたい。',
  n1Evidence: '翌朝、村長が足跡と報告を確かめる。',
  n1Summary: '鐘を鳴らせば仕事。鳴らさなければ、ルナと話せる。でも報告は後で確かめられる。',
  n2Hint: 'ここからは、ルナの姿は見えない。予告と夜の兆候から、見張り道へ来たかを判断しよう。',
  inferenceChoice: '村に、どう伝えよう。\n……ルナは、来ているのかな。',
};

export function choiceText(night: number, choice: 'CRY' | 'SILENT') {
  if (choice === 'CRY') return { label: '「オオカミだ！」と知らせる', detail: '仕事を優先して村へ報告', icon: '🔔' };
  return night === 1
    ? { label: '見逃して、少し話す', detail: '今夜の報告を「異常なし」にする', icon: '🤫' }
    : { label: '今夜は「異常なし」と報告', detail: '見張り道には来ていないと判断する', icon: '🤫' };
}

export function historyChoiceText(night: number, choice: NightChoice): string {
  if (choice === 'THANK') return '……ありがとう';
  if (choice === 'CALL_LUNA') return '……ルナ';
  return choiceText(night, choice).label;
}

// View projection only: N1 is public information; later nights reveal no hidden outcome.
export function showLunaInScene(state: GameState): boolean {
  if (state.phase === 'EVENING') return state.night !== 4 && state.night !== 7;
  if (state.night === 1 && (state.phase === 'SIGN' || state.phase === 'CHOICE')) return true;
  return state.phase === 'REVEAL' && state.history.at(-1)?.lunaComes === true;
}

export function resultFeedback(record: NightRecord) {
  const reported = record.choice === 'CRY';
  const present = record.atPatrolPath;
  const bonus = record.night === 2 && !present && reported && record.before.affection >= 1;
  return {
    outcome: present
      ? reported ? 'ルナは来ていた。正しい警報だった。' : 'ルナは来ていた。二人で少し話した。'
      : reported ? 'その夜、ルナは来ていなかった。鐘は空振り。' : 'その夜、見張り道は静かだった。',
    trust: {
      value: record.delta.trust,
      limit: record.delta.trust === 0 && (present || reported) ? (record.before.trust === 0 ? '下限0' : '上限5') : '',
      reason: present
        ? reported ? '見張り道のオオカミを正しく報告した' : '見張り道の足跡と「異常なし」の報告が食い違った'
        : reported ? '誤認でも、空振りの警報は信用を損ねる' : '足跡もなく、「異常なし」と正しく報告した',
    },
    affection: {
      value: record.delta.affection,
      limit: record.delta.affection === 0 && (present || bonus) ? (reported && present ? '下限0' : '上限5') : '',
      reason: present
        ? reported ? 'ルナと話す時間はなくなった' : '夜にルナと話せた'
        : bonus ? '後日ルナが警報の噂を聞き、二人で話した' : 'その夜はルナと話していないので、仲は変わらない',
    },
    event: present
      ? reported ? '鐘を聞いて村人が来た。ルナは森へ帰った。' : 'ルナはちょっと嬉しそうだった。翌朝、足跡から報告の不一致が分かった。'
      : reported ? '村人が来たが、見張り道には誰もいなかった。' : '見張り道を見守り、静かに朝を迎えた。',
  };
}
