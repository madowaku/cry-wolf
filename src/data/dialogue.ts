import type { GameState, Line, Night, Night5Answer, Ending } from '../core/types';
import { INTRO_CHAPTERS, ONBOARDING, resultFeedback } from './onboarding';

const bell = (text: string): Line => ({ speaker: 'ベル', text });
const luna = (text: string): Line => ({ speaker: 'ルナ', text });
const scene = (text: string): Line => ({ speaker: '情景', text });
export const NIGHT_TITLES: Record<Night, string> = {
  1: '鳴らす？ 鳴らさない？', 2: '今日は行かない', 3: '本当に今日は行けない',
  4: '知らない。私じゃない', 5: 'もう来ない方がいい？', 6: 'もう来ない', 7: 'CRY WOLF',
};
export const INTRO: Line[] = INTRO_CHAPTERS.flatMap(chapter => chapter.lines);

export function eveningLines(state: GameState): Line[] {
  switch (state.night) {
    case 1: return [bell(ONBOARDING.n1Choice)];
    case 2: return [luna('今日は行かない。……なに、その顔。'), bell('べつに。仕事で見てるだけ。'), luna('ふーん？ じゃあ、今夜は耳を澄ましてみなさい。')];
    case 3: return [luna('今日は本当に行けないから。'), bell('……昨日もそう言ってたよね。'), luna('だからって、毎回疑わないでよ。')];
    case 4: return [scene('今日は、ルナの姿を見なかった。\n夕暮れの森は、いつもより静かだった。')];
    case 5: return [
      { speaker: '村人', text: state.history.some(record => record.atPatrolPath) ? '最近、見張り道に足跡があるな。' : '今夜も、見張り道を頼むよ。' },
      { speaker: '村人', text: state.trust <= 2 ? '最近、報告が合わないな。' : '頼りにしているよ。' },
      luna('……私、もう来ない方がいい？'),
    ];
    case 6: return [luna('もう来ない。'), luna(night6Reaction(state))];
    case 7: return [scene('署名のないメモが、ランタンのそばに置かれていた。\n「今夜は行かない。」')];
  }
}

export function night6Reaction(state: Pick<GameState, 'trust' | 'affection' | 'honesty'>): string {
  if (state.trust >= 4 && state.affection <= 2) return '結局、村の方が大事なんでしょ。';
  if (state.affection >= 4 && state.trust <= 2) return 'なんでも黙ってればいいと思ってない？';
  if (state.honesty === 0) return '何考えてるのか、全然分かんない。';
  return '私たち、嘘ついてばっかりだね。';
}

export const NIGHT5_REPLIES: Record<Night5Answer, Line[]> = {
  COME: [luna('今の、もう一回言って。')],
  DONT_COME: [luna('……分かってる。')],
  YOU_DECIDE: [luna('ずるい。')],
};

export const SIGN_TEXT = {
  QUIET: { label: '静か', text: '聞こえるのは、風の音だけ。\n静かだからといって、誰もいないとは限らない。' },
  RUSTLE: { label: 'ガサッ……', text: '森の方で、小さな葉音がした。\n風かもしれない。誰かかもしれない。' },
  TRACE: { label: '痕跡 · 赤いリボン', text: '枝に、赤いリボンが残っている。\n今夜のものか、前の夜のものかは分からない。' },
};

export function signLines(state: GameState): Line[] {
  if (state.night === 1) return [bell(ONBOARDING.n1Choice)];
  if (state.night === 4) return [scene('見張り道の外側に、月形の木製チャーム。\nそばのメモには「落ちてた。」とだけ書いてある。')];
  if (state.night === 7) return [scene('静けさ。……ガサッ。\n森側の枝に、赤いリボンが揺れた。')];
  return [bell(SIGN_TEXT[state.currentEvent!.sign].text)];
}

export function revealLines(state: GameState): Line[] {
  const record = state.history.at(-1);
  if (!record) return [];
  const { night, choice, lunaComes } = record;
  if (night === 4) {
    if (choice === 'THANK') return [bell('ありがとう。'), luna('……知らないって言ってるでしょ。')];
    return choice === 'CRY' ? [scene('警報が夜に響いた。\n森の木陰から、ルナはそっと去った。')] : [scene('月形のチャームを、そっとポケットにしまった。')];
  }
  if (night === 7) {
    if (choice === 'CALL_LUNA') return [bell('……ルナ。'), scene('警報ベルを下ろして、名前を呼ぶ。\n木陰から出てきた彼女も、僕も、目を合わせられなかった。')];
    if (choice === 'SILENT') return [luna('嘘つき。'), bell('……今日はそういうことにしたい。')];
    return [scene('警報が夜に響く。\n見張り道は空っぽのまま、彼女の気配が遠ざかった。')];
  }
  const outcome = night <= 3 ? [scene(resultFeedback(record).outcome)] : [];
  if (night === 1) return choice === 'CRY'
    ? [...outcome, bell('オ、オオカミだ！'), scene('カラン、カラン！ 村に灯りがともる。'), luna('へえ、本当に鳴らすんだ。……ちゃんと仕事するのね。'), bell('僕、見張りだから。'), luna('そっか。またね、ベル。'), scene('鐘を聞いて村人が来た。ルナは森へ帰った。')]
    : [...outcome, bell('……もう少しだけ、話してもいい？'), luna('え。ベルって、案外大胆なのね。'), bell('ち、違う！ ただ、その……'), luna('ふふっ。じゃあ少しだけ。')];
  if (lunaComes) {
    if (choice === 'CRY') return night === 2 ? [...outcome, luna('来ないって言ったのに。'), bell('来てるじゃん。')] : [...outcome, luna('ちゃんと仕事するんだ。'), bell('仕事だから。')];
    if (night === 2) return [...outcome, luna('やっぱり分かった？'), bell('あと耳。'), luna('見るな！')];
    if (night === 3) return [...outcome, luna('……来ちゃった。'), bell('自分で行かないって言ったのに。'), luna('うるさい。')];
    if (night === 6) return [bell('いるんだろ。'), luna('呼ばないの？'), bell('今日は話したいから。')];
    return [luna('……来たよ。'), bell('少し、話そう。')];
  }
  if (choice === 'CRY') return [...outcome, scene('警報に集まった村の人は、何も見つけなかった。')];
  return [...outcome, scene('誰も来なかった。\nランタンの灯りを守りながら、朝を待った。')];
}

export function reportLines(state: GameState): Line[] {
  const record = state.history.at(-1);
  if (!record) return [];
  if (record.night === 1) return record.choice === 'SILENT'
    ? [{ speaker: '村長', text: '見張り道にオオカミの足跡があった。昨日の報告は「異常なし」だったね？' }, bell('……はい。')]
    : [{ speaker: '村長', text: '見張り道の足跡と、昨夜の警報は一致していた。よく知らせてくれたね。' }];
  const report = record.night <= 3 ? record.report.replace('「何もいない」', '「異常なし」') : record.report;
  const lines = [scene(report)];
  if (record.night === 2 && !record.lunaComes) {
    lines.push(scene(record.choice === 'CRY' ? '後日。警報の噂を聞いたルナが、ベルに声をかけた。' : '翌日の夕方。ルナと、また顔を合わせた。'));
    lines.push(...(record.choice === 'CRY' ? [luna('昨日、私いなかったけど。'), bell('……来ると思った。')] : [luna('……分かるんだ。')]));
  }
  if (record.night === 3 && !record.lunaComes && record.choice === 'CRY') lines.push(scene('翌日の夕方。昨日は来なかったルナに会った。'), luna('私、そんなに信用ない？'));
  return lines;
}

export const ENDING_LINES: Record<Ending, Line[]> = {
  HONEST: [bell('……君に会いたかった。'), luna('……私も。')],
  BAD_LIAR: [scene('夜番は、しばらくお休みになった。'), luna('明るいうちなら、会ってもいいんでしょ。')],
  SECRET_MEETING: [scene('言えないことは、まだある。\nそれでも、二人の小さな約束はつづく。')],
  GOOD_DOG: [scene('今夜もランタンを灯す。\n彼女との距離は、まだ少しだけ遠い。')],
};
