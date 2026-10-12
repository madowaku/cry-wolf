# 絵本UI ブラッシュアップ v0.2

日付: 2026-10-12。対象は独立NIGHT 2、v0.5の2刻・3行動・4結果。ルールの変更なし。

## 使用したスキル

`game-studio` で既存の2D絵本への適合を判断し、`game-playtest` の実操作・状態・スクリーンショット点検、`game-ui-frontend` の視線誘導、`web-game-foundations` の状態と描画の分離を適用。`sprite-pipeline` の共通キャンバス・縮尺・透過の点検項目も既存表情シートに使用。

指定された13スキルはすべて参照。`game-dev` CLIはこの環境に見つからず、Game Development Studioの専用パッケージ検証・封印付きGPU実行・性能比較は実施していない。Three.js/R3F/Tripoは3D用で、現在のHTML/SVG/PNGの絵本に導入する必要はない。新規依存、外部素材、生成サービスへの課金は追加していない。

## 見つけた点と変更

| 優先度 | 再現・見える問題 | 対応 |
| --- | --- | --- |
| HIGH | In-app Browserの5193番でカメラゲームが表示され、同URLへのHTTP確認はCRY WOLFを返す食い違い | 5197番に別の開発サーバーを起動。同じブラウザタブでCRY WOLFのタイトルを確認。食い違いの根本原因は確定していない |
| MEDIUM | 1行動後の判断で「灯りが届く」を棒と点だけで表示。位置と光の範囲の対応が曖昧 | ランタンから伸びる平面の光、境界、近い／遠い気配の足跡を同じ図に配置 |
| MEDIUM | 合図・音の場面で距離の時刻が絵から分からない | 1刻目の観察は遠い森、次の判断と2刻目の観察は近い木陰。観察時点の距離を描く |
| MEDIUM | 報告で道への立ち入りを前ページから思い出す必要がある | 合図が届いた場合は「足音は境界の外で止まった」、他は「道の内側へ続く足跡」を提示。元のv0.5で報告時に提供していた事実を戻した |
| MEDIUM | FALSEで遠くのルナが通常の大きさになり、半透明で村が透ける | CSSの競合を修正。ベルを前、ルナを小さく森側へ。透明度は通常に戻す |
| LOW | 4結果の感情ページが同じ構図に見える | DUTYは森へ戻るルナ、FALSEは距離、BESTは二人の会話として構図を分け、結果名を静かな見出しで表示 |

灯りを送る場面のランタンは二度だけ明滅。成功・不発は文章でも区別できる。背景と人物と台詞・操作のレイヤー分離、夜のルナ非表示、勝気な表情、reduced-motionを維持している。

人物2枚を先読みする指定を追加。これは読み込みを早く始める措置であり、実機の速度・FPS改善を数値で証明したものではない。

## 実測検証

- Vitest: **91/91 PASS**、5ファイル。絵本部分は27件（元HTMLとの全18経路比較を含む）。
- `npm run typecheck`: PASS。
- `npm run build`: PASS。
- Playwright: **705確認、18経路、53画面測定、失敗0、ブラウザエラー0**。
- 360×800、390×844、720×1280、1280×800で、選択ボタン・本文・各場面を点検。
- 各18経路で報告に表示する内側／外側が終了時の実際の状態に一致。
- 1刻目の観察はfar、1行動後の判断はnear、2刻目の観察はnear。特に `signal→signal` は不発から成功。
- ルナの非表示、ヘルプとメモ、キーボード、連打、音OFF、reduced-motion、拡大文字、再挑戦、ローカルHTMLを再確認。
- 開いているIn-app BrowserでもUIをクリックして `signal→signal→silent` を試遊。不発→成功→外側で止まった報告事実→BEST→信用±0／きずな+1→タイトルまで確認。これはAIによる操作確認で、人間の初見試遊ではない。
- 最後の月位置調整は、距離の図のキャプションとの重なりを避ける見た目だけの変更。対象画面を再撮影して確認。

生データ: `qa-storybook-polish.json`。再実行: `scripts/qa/storybook-final-smoke.js.txt`（5197番を使用）。同じデータの経路はブラウザの検証用hookで、入力は4サイズの実クリック・キーボードで確認。人間による18周の試遊を意味しない。

## アセットの点検

PNGを読み取り、RGBA、アルファ最小0／最大255、2×2表情のキャンバスを確認。ベルは1145×1374、ルナは1086×1448。同キャラの差分に共通のCSS縮尺・描画枠を使う。画像の再生成・水平反転・個別差分の拡大縮小は行っていない。

`public/storybook/asset-manifest.json` に採用画像の識別名、寸法、表情の順序、SHA-256と出典を記録する。これはプロジェクト内の記録で、`game-dev`による正規パッケージの許諾・整合性検査を実施したという意味ではない。

## 比較画像

`screenshots/storybook-polish/` に before / after を保存。

- [合図の距離・修正前](screenshots/storybook-polish/polish-before-lamp-far.png) / [修正後](screenshots/storybook-polish/polish-after-lamp-far.png)
- [近づいた気配・修正前](screenshots/storybook-polish/polish-before-boundary.png) / [修正後](screenshots/storybook-polish/polish-after-boundary.png)
- [報告・修正後](screenshots/storybook-polish/polish-after-report-held.png)
- [誤報の反応・修正前](screenshots/storybook-polish/polish-before-false.png) / [修正後](screenshots/storybook-polish/polish-after-false.png)

## 未確認

Android実機、iOS Safari、音量の聴感、初見の人の理解・ルナへの印象・物語のテンポ・再挑戦意欲は未確認。人間の記録欄は `PLAYTEST_STORYBOOK_v0.1.md`。4結果を維持できたことと、ゲームがより面白くなったことは別の評価。
