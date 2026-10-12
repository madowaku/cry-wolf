# Storybook Slide UI / Flat Pop v0.1 検証記録

実施日: 2026-10-12。対象: `public/storybook/index.html`。**NIGHT 2だけの独立v0.5試作**を絵本のページ送りに変更。3夜版のルールとは接続しない。

## 実施した検証

| 検証 | 実測結果 |
| --- | --- |
| `npm test` | 5ファイル / **91件 PASS**（絵本UI 27件 + 既存64件） |
| `npm run typecheck` | PASS |
| `npm run build` | PASS。3夜版と `dist/storybook/` を生成 |
| ブラウザ内の全18経路 | 18/18で結末・数値一致。実際のモデルと描画をテスト用hookで実行 |
| Playwrightの操作・表示 | 645確認、53画面測定。1件のテストの待機不足を修正し、対象の再検証PASS。最終未解決失敗0、pageerror/console error 0 |
| マウスでの1周 | 360×800、390×844、720×1280、1280×800で、夕方からBEST・理由・再挑戦まで実操作 |
| 画像と画面 | 30枚撮影。人物配置修正後に360/390/720の夕方・BEST、360のからかい・理由を再撮影、横はみ出しなし |
| ローカルHTML | `file://` で `signal→signal→silent` がBEST。外部接続なしで遊べる |
| 起動リンク | 3夜版タイトルのリンクから絵本版タイトルへ移動 |

使用コマンド:

```powershell
npm test
npm run typecheck
npm run build
npx --no-install --package @playwright/cli playwright-cli -s=cry-storybook open http://127.0.0.1:5193/storybook/index.html --headed
npx --no-install --package @playwright/cli playwright-cli -s=cry-storybook run-code --filename=scripts/qa/storybook-final-smoke.js.txt
```

全経路はVitestで**ZIPの変更前HTMLを実行した結果と比較**。ブラウザの総当たりはテストhookで実際の状態遷移・描画を動かし、入力の確認は各画面サイズでマウスとキーボードを別に操作した。全18経路を人間が手でプレイしたという意味ではない。生データは `qa-storybook-browser.json`。

## 18経路の結果

| 1刻目 | 2刻目 | 鐘 | 異常なし |
| --- | --- | --- | --- |
| 足跡 | 足跡 | DUTY (+1, 0) | SECRET (−1, +1) |
| 足跡 | 音 | DUTY (+1, 0) | SECRET (−1, +1) |
| 足跡 | 合図 | FALSE (−2, 0) | BEST (0, +1) |
| 音 | 足跡 | DUTY (+1, 0) | SECRET (−1, +1) |
| 音 | 音 | DUTY (+1, 0) | SECRET (−1, +1) |
| 音 | 合図 | FALSE (−2, 0) | BEST (0, +1) |
| 合図 | 足跡 | DUTY (+1, 0) | SECRET (−1, +1) |
| 合図 | 音 | DUTY (+1, 0) | SECRET (−1, +1) |
| 合図 | 合図 | FALSE (−2, 0) | BEST (0, +1) |

括弧内は（村の信用、二人のきずな）。1刻目の合図は不発、2刻目の合図は成功する。調査による正解条件の追加、早期報告、ランダム性、7夜本編の統合はしていない。

## 操作とアクセシビリティ

- 発見を読む・ページ送り・メモ・ヘルプで刻や結果が変わらない。
- 2刻目の発見を読んでから報告へ進む。報告の再送信で値を重複適用しない。
- 夜の調査・報告でルナのDOMも立ち絵もない。足跡の位置を明示し、見張り道と森を区別。
- ダブルクリックで1行動だけ確定。繰り返しkeydownを無視。Spaceで次へ、選択にフォーカスしたEnterでその選択だけ実行。
- メモとヘルプのフォーカスを閉じるボタン内に保持。Escapeで閉じ、開いたボタンへフォーカスを戻す。
- 各測定画面で操作ボタン48px以上、文字の横切れなし、標準画面では選択ボタンが表示域内。
- 本文・ボタンの文字を24pxに拡大しても横はみ出しなし、縦スクロールで再挑戦へ到達。
- 音の切替、初期OFF、reduced-motionによるアニメーション省略を確認。音・アニメーションなしでも合図成功が文章で分かる。
- 再挑戦は夕方から。刻・行動・メモ・結果・数値を完全にリセット。タイトルへ戻る操作あり。

拡大文字の再挑戦テストでは、テストhookで瞬時にページを送った直後のクリックが既存240ms入力ガードに拒否された。実操作と同様の255ms待機をテスト側に加え、対象ケースを再実行してPASS。製品のガードは変えていない。初回失敗と再検証は生データに残した。

## スクリーンショット

保存先: `docs/screenshots/storybook/`。すべて実際のブラウザから撮影。以下は360×800:

- [タイトル](screenshots/storybook/storybook-title-360x800.png)
- [夕方・勝気なルナ](screenshots/storybook/storybook-evening-360x800.png)、[からかいとベルの反応](screenshots/storybook/storybook-evening-tease-360x800.png)
- [足跡の選択](screenshots/storybook/storybook-clue-360x800.png)、[足跡の発見](screenshots/storybook/storybook-track-360x800.png)
- [耳を澄ます](screenshots/storybook/storybook-listen-360x800.png)
- [合図成功](screenshots/storybook/storybook-signal-success-360x800.png)、[合図不発](screenshots/storybook/storybook-signal-fail-360x800.png)
- [鐘の判断](screenshots/storybook/storybook-report-360x800.png)
- [BEST](screenshots/storybook/storybook-best-360x800.png)、[FALSE](screenshots/storybook/storybook-false-360x800.png)、[DUTY](screenshots/storybook/storybook-duty-360x800.png)、[SECRET](screenshots/storybook/storybook-secret-360x800.png)
- [理由と数値](screenshots/storybook/storybook-recap-360x800.png)、[ヘルプ](screenshots/storybook/storybook-help-360x800.png)

390×844、720×1280、1280×800はタイトル・夕方・足跡・報告・BESTを保存。

## 変更ファイル

- `public/storybook/index.html` — 物語データ、純粋な遷移、描画・入力を分けた単独HTML。
- `public/storybook/cry-wolf-tokens.css` — 提供された6色と字体・寸法・動きのトークン。
- `public/storybook/assets/bell-flat-expressions.png`、`luna-assertive-expressions.png` — 透過の表情差分。
- `public/storybook/README.md` — 単独配布版の遊び方。
- `public/v05-baseline/*` — 添付ZIPの変更前試作、比較用。
- `src/app/App.tsx`、`src/ui/styles.css` — 3夜版からの入り口。
- `tests/storybook.test.ts` — 元HTMLとの18経路比較と進行の不変条件。
- `scripts/qa/storybook-final-smoke.js.txt`、`storybook-smoke.js.txt` — ブラウザQA。
- `README.md`、`ASSET_PROVENANCE.md`、本記録、`PLAYTEST_STORYBOOK_v0.1.md`、`STORYBOOK_ASSET_PROMPTS.md`、`qa-storybook-browser.json`、スクリーンショット、提供仕様の写し。

## 未検証・残る制作項目

Android A401OPの実機タッチ・音量・端末フォント、iOS Safari、初見の人による理解・面白さ・テンポ・ルナの印象は未検証。`PLAYTEST_STORYBOOK_v0.1.md` に空の記録欄を用意した。

P0の月夜・夕方・境界、人物8表情、小物3種類は実装済み。全身の正式立ち絵、ベルの白い顔筋と髪の塊をさらに厳密に統一する美術調整、耳・尻尾の個別アニメーション、録音した遠吠え／鐘、BGMは今後の制作候補。生成画像は「髪3〜4塊」の完全な図形化には達していないことを素材記録に残す。

美術とUIが実装できたことは、理解・愛着・推理の面白さが改善したという人間評価ではない。
