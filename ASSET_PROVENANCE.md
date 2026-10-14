# 素材記録 — T001〜T003

## 七夜版の表紙仕上げ v0.9.2 — 2026-10-14

Codex built-in Imagegenで、既存ベル・ルナ・村背景・月を参照した表紙の構図見本を1点生成。原本コピーは `docs/moon/design-v092/title-reference.png`、正確なプロンプト・参照・SHA-256・採用判断は `docs/moon/design-v092/provenance.json`。見本は比較用で、ゲーム配布へ追加しない。構図と文字階層をHTML/CSSへ反映し、37点の既存画像は変更・再生成していない。見本の満月は仕様に合わせて半月とし、描き直されたポーズや装飾は採用しない。

## 七夜とエピローグ v0.9 — 2026-10-12

ユーザーの後半実装依頼により、`public/moon/` を第七夜・4END・エピローグまで拡張。人物の承認済みの姿は維持し、次の2素材をCodex built-in Imagegenで追加した。

| 素材 | 原本 | プロンプトと参照 | 配布先 |
| --- | --- | --- | --- |
| 赤い糸を結んだ木の月形チャーム | `assets/illustrations/moon/moon-charm.png` | `docs/moon/charm-prompt-v0.9.json`。新規生成、透過背景指定 | `public/moon/assets/charm.webp` |
| 村と見張り台の朝 | `assets/illustrations/moon/environment-village-dawn.png` | `docs/moon/dawn-prompt-v0.9.json`。夜の村背景を参照して時間帯を編集 | `public/moon/assets/dawn.webp` |

Codex生成フォルダーの原本も保持。Sharpのリサイズ・WebP変換を行い、チャームのalphaを保持。画像中の文字はなし。配布素材は37点。ソース／変換物のSHA-256・サイズ・alpha有無は `public/moon/asset-manifest.json`。旧版の画像とZIPは維持する。

## 月あかりの約束 v0.8.1 — 2026-10-12

`public/moon/` の生成素材はCodex built-in Imagegenを使用。最終指定は日本語のユーザー依頼と当日の追加修正。第三者サイトからの画像取得はありません。元の3夜版と1夜版の素材は維持しています。

| 採用素材 | 生成原本 | 用途 |
| --- | --- | --- |
| ピップ（子ども、人の顔・体＋ウサギ耳） | `assets/illustrations/moon/pip-child-v3.png` | 郵便屋の登場と第三夜。ベル・ルナを参照し擬人化、さらに幼くする編集 |
| 村長（人の顔・体＋ヒツジの耳・角） | `assets/illustrations/moon/mayor-human-v2.png` | 仕事の説明、村の調査と報告 |
| ベル追加8表情 | `assets/illustrations/moon/bell-emotions.png`, `bell-reactions.png` | 既存ベルの参照編集。驚き・気まずさ・安堵・勇気・困る・たじたじ・考え込む・気づかう |
| ルナ追加4表情 | `assets/illustrations/moon/luna-emotions.png` | 既存のユーザー提供デザインの参照編集。驚き・心配・安堵・笑顔 |
| ルナ追加8表情（v0.8.1） | `assets/illustrations/moon/luna-pride.png`, `luna-heart.png` | 既存ルナを参照編集。誇り、からかい、いたずら笑い、怒り、真剣、悲しみ、寂しさ、素直になりかける顔。元画像・リボンの左右を保持 |
| 村・見張り台と森、森の泉 | `assets/illustrations/moon/environment-village-tower.png`, `environment-forest-spring.png` | 人物と独立した背景。文字・UIは焼き込まない |
| 警報鐘、足跡、月 | `assets/illustrations/moon/alarm-bell.png`, `wolf-tracks.png`, `moon-disc.png` | 独立した小物レイヤー。月相はコード側で重ねる |

既存ベル4表情とルナ4表情も使用。原本の出典は本書のFlat Pop v0.1節と `public/storybook/asset-manifest.json`。採用した生成／編集プロンプトは `docs/moon/generation-prompts.json`。`scripts/moon/pack-assets.mjs` は表情シートの均等セル切り出しとWebPへのリサイズ・圧縮だけを行い、透過を保持。左右反転なし。原本と処理物のSHA-256・寸法・alpha有無は `public/moon/asset-manifest.json` に記録。ベルの右列由来の一部表情は隣の尾の微小なはみ出しを隠すため、表示時にCSSで左端4%をマスク。原本・WebPの画素は変えません。

最初の動物顔のピップと村長、および青年寄りのピップv2は不採用。前者の生成原本はCodex生成フォルダーに保持、後者は制作資料としてのみ保存し配布に含めない。第三者の商用利用許諾を取得・認証したという意味ではありません。

v0.8.1の追加生成の正確なプロンプトと参照画像は `docs/moon/luna-expression-prompts-v0.8.1.json`。原本はCodex生成フォルダーからコピーして保持。配布画像は全35点（ルナ16、ベル12、ピップ・村長2、背景2、小物3）。ルナ新規シートの右列4表情には、隣の髪のはみ出しを隠す左端8%のCSS表示マスクを使用。左右反転・画素の手直しはなし。

動きはオリジナルCSS（表情差分、呼吸、困り・たじたじ・考える反応、鐘、合図）。Figma対象ファイルが未指定のためFigma由来のモーションデータは使っていません。音は短いWeb Audio合成SE、初期OFF。今回の版に第三者BGMは追加していません。

| 素材 | 出典・制作 | AI生成 | 使用範囲・許諾 |
| --- | --- | --- | --- |
| ベル / ルナの仮立ち絵 | `src/ui/Scene.tsx` のオリジナルSVGコード | AIによるコード作成。Imagegen生成画像ではない | 今回の試作用に作成。第三者の画像をトレース・転載していない |
| 月・森・村・ランタン・リボン・INTROで返す小さな鐘 | オリジナルCSS/SVG | AIによるコード作成 | 今回の試作用に作成。鐘はv0.4で追加した仮素材 |
| UI装飾とアイコン | テキスト記号、オリジナルCSS/SVG | AIによるコード作成 | ゲームに画像中文字を焼き込んでいない |
| フォント | 端末にインストール済みの明朝系フォント / Georgia、OSフォールバック | いいえ | フォントファイルは配布せず、ローカルの表示に利用 |
| 会話・ルール | ユーザー提供v0.3仕様、Onboarding Hotfix v0.4、共通分岐・結果理由を補う短い台詞 | AIによる実装・補完あり | 本プロジェクトの実装指示に基づく |
| BGM / SE | 今回はなし | — | T008で商用利用条件と表示義務を確認して選定 |

視覚的参照として、ユーザー提供の `ChatGPT 画像 2026年10月10日 15_49_42.png`、`15_49_54.png`、`15_50_02.png` を確認。紺・金・ランタンの暖色・赤リボンを参考にした。画像そのもの、画像の文字やボタンはゲームに組み込んでいない。設定画専用のファイルは提供フォルダで未確認。

3夜版の初回T001〜T003は仮UIのみとして制作し、Imagegen呼び出しは実施していない。音源サイト、Kenney、itch.io、AssetsSharedからの素材採用・ダウンロードも未実施。第三者素材の商用利用許諾を確認済みと扱わない。

## 絵本UI / Flat Pop v0.1 — 2026-10-12

| 素材 | 出典・制作 | 使用・編集 |
| --- | --- | --- |
| `public/storybook/assets/bell-flat-expressions.png` | Codex built-in Imagegenで生成したベル表情シートを同ツールで簡略化 | 4表情をCSS表示。透過PNG。折れ耳・黒白・ランタン・鐘・尻尾。細密刺繍を削減 |
| `public/storybook/assets/luna-assertive-expressions.png` | ユーザー提供「ルナの四つの表情シート.png」をImagegenで透過背景に編集 | 勝気な表情・半眼・指先のからかい・そっぽ・待っていた表情を保持。ユーザー指示に基づく編集・ゲーム内利用 |
| 初回のベル／ルナ生成、穏やかなルナの簡略化試作 | Imagegen生成・編集 | 不採用。Codex生成画像フォルダの原本を残し、配布物に含めない |
| 月夜・夕方・境界・朝、小物（鐘／ランタン／足跡） | オリジナルSVG、ユーザー提供 `cry-wolf-tokens.css` の配色 | HTMLの人物・文章・選択と別レイヤー。背景に人物やUIの文字を焼き込まない |
| ルナの台詞・表情の配置 | v0.5と絵本仕様、ユーザーの「勝気で少し悪ぶるお姉さん」という修正 | 元の意味とルールを維持し、夕方のからかいを補強 |
| SE | Web Audioの小音量の合成音 | 外部音源なし。初期OFF、操作開始後のみ。ミュートでも文字情報を維持 |

生成・編集プロンプトと工程は `docs/STORYBOOK_ASSET_PROMPTS.md`。参照のポスター・設定画を操作画面の背景として組み込んでいない。ゲーム内に画像の水平反転はない。

## 絵本UIのブラッシュアップ v0.2 — 2026-10-12

採用PNGの画素は変更していない。RGBA・透過範囲・2×2の寸法を読み取り、`public/storybook/asset-manifest.json` に出典とSHA-256を記録。表情を同じ描画枠と縮尺で表示する。

距離の図（ランタン、光の届く範囲、足跡、道と森の境界）、誤報・仕事を守った結果の人物配置、報告の事実表示はオリジナルSVG/CSS/HTMLの更新。追加生成画像・外部素材・外部音源はない。Game Development Studio CLIでの正規パッケージ検証は未実施。

## 絵本UI BGM v0.3 — 2026-10-12

| 使用場面 | 曲 / 作者 | 出典 | 原音 |
| --- | --- | --- | --- |
| タイトル・夕方 | the fairy tale / のる | https://opentracks.com/bgm/detail/19133 | `BGM/the_fairy_tale.mp3` |
| 夜・調査・報告 | Storyteller / のる | https://opentracks.com/bgm/detail/21959 | `BGM/Storyteller.mp3` |
| 結果・振り返り | 月夜 / チョコミント | https://opentracks.com/bgm/detail/6987 | `BGM/月夜.mp3` |

ユーザーが公式ページから手動で入手し、上記フォルダへ保存したMP3を採用。AI生成音楽ではない。原音を変更せずFFmpegでAAC/M4Aへ変換し、ゲーム専用JSコンテナ `public/storybook/assets/audio/music-pack.js` に格納。原音および単独M4Aを配布ZIPに含めない。ソース・変換物のSHA-256、曲の長さ、作者、出典は `docs/storybook-music-receipt.json` に記録。変換スクリプトにネットワーク処理はない。

確認した公式条件: [音源利用ライセンス](https://opentracks.com/help/articles/license/)のゲーム／アプリのBGM利用と形式変換・フェード編集、[利用規約](https://opentracks.com/help/articles/terms/)の自動収集・直リンクの禁止。作者プロフィール: [のる](https://opentracks.com/creator/detail/432)、[チョコミント](https://opentracks.com/creator/detail/215)。音量設定内に曲名・作者・公式曲ページへのリンクを表示。

コンテナは単純な難読化で、DRMではない。抽出を完全に防止する保証や、音源ライセンスの条件を超える権利の取得を意味しない。合成SEは従来のWeb Audioを継続。3夜版の本編には音楽を追加していない。

## 七夜Moon版への取り込み v0.9.1 — 2026-10-12

ユーザー指定のコミット `510626d333e5a11fdc31f748a72d31b39bdb20f2` を土台に、上記3曲とstorybook版の再生制御を `public/moon/` へ取り込み。元の変換済み音楽パックをコピーし、ハッシュは同一。曲名・作者・出典はMoonの設定画面と `public/moon/CREDITS.md`、`music-manifest.json` に記録。再取り込みは `npm run music:pack`、変換済みパックの同期だけなら `npm run music:moon`。

第二夜の手がかり、ランタンの届く範囲・気配の距離、報告の鐘、結果の人物配置は、オリジナルSVG／CSS／HTMLの演出移植。追加生成・外部画像素材の採用はなし。Moonの37点のWebPと原本、独立storybook版の画像・ルールは変更していない。
