# itch.io の固定iframe対応 — v0.9.2

2026-10-15。対象ブランチは `codex/moon-v092-finishing`、修正前は `34a7f62`。

PC向けの itch.io 埋め込み設定は **幅960px・高さ640px** を推奨。900×600でも確認した。レイアウトが参照するのはモニターではなくiframeの寸法なので、PCで開いても430px幅のiframeは縦積みになる。itch.ioの管理画面・公開設定は今回変更していない。

## 画面の変更

- 幅760px以上は横長の見開き。本全体をiframeの高さに合わせ、左の絵に600〜650pxの最小高さを押しつけない。表紙にも同じ方針を適用。
- 通常ページの右側は本文・手がかりと操作領域に分ける。長文を読んでいる間もページ送りに届く。選択肢が多い場合は操作領域もスクロールでき、最後のボタンまでマウス・キーボードで操作できる。ページをめくると読み位置を先頭へ戻す。
- 幅759px以下は縦積み。絵の高さは通常ページで画面高の36%・最大320px、表紙で32%・最大280px。本文は18px以上を保ち、文書全体を自然に縦スクロールする。
- 高さ440px以下の横長画面では、文書全体の縦スクロールへ戻す。文章拡大や短いiframeでも、操作を閉じ込めない。
- 変更対象は `style.css` と `app.js` の表示構成・スクロール位置のみ。七夜・4ENDの条件、セーブ形式、道の分岐、物語、立ち絵、半月から満月、BGM3曲は維持。

## 実施した検証

Chromiumのデスクトップ画面内に実際の固定iframeを作り、960×640、900×600、430×800、390×844、360×800の各サイズで、表紙・序章・長文・第六夜の5択・結果の理由と数値・TRUE ENDの後日談・満月の終了画面を確認した。正規モデルで作ったしおりを実際の「しおりから読む」で開き、ホイール、Tab/Enter、ボタンのクリックを使った。

文字の横方向の切れ、横スクロール、44px未満の操作領域、末尾のボタンとフッターに到達できるかを検査。PCでは本文と操作領域の双方をホイールで末尾までスクロールし、次の画面で読み位置が戻ることも確認した。5サイズ×7場面の修正前後35組と、修正後のスクロール末尾の画像を保存している。

| 検証 | 結果 |
| --- | --- |
| 指定5サイズの固定iframe操作 | 373 / 373 PASS |
| 境界・低い画面・文字拡大・画像復帰・PC七夜完走 | 258 / 258 PASS |
| `npm test -- --reporter=dot` | 10ファイル・239 / 239 PASS |
| `npm run typecheck` / `npm run build` | PASS |
| 既存の七夜・4ENDブラウザQA | 1,517 / 1,517 PASS。道の成立/不成立、3ページの後日談、セーブ復帰、v8移行、再開始確認、動きOFFを含む |
| 配布ビルド・`file://`・保存拒否 | 155 / 155 PASS |
| BGMのデコード・時間進行・設定・保存・曲切り替え | 59 / 59 PASS |

追加で760/759px・661/660pxの境界、430×500、960×360、720×1280、1440×900、24pxへの文字拡大、画像失敗からの復帰を検査。960×640と900×600ではそれぞれ実際の画面操作で七夜、TRUE END、道の成立、後日談を完走した（各53回の文章ページ送り）。追加検査の件数・各画面の寸法・再現経路は [機械可読の結果](itch-embed-qa.json) に記録する。

修正前の960×640では文書高が場面により841〜1,447pxになっていた。修正後は7場面すべて640px。900×600でも修正後はすべて600pxで、外側の縦スクロールは発生しない。長い文章・選択肢を読むスクロールは右ページ内に残す。

## スクリーンショットと再実行

- 全比較: `output/playwright/moon-embed/comparison.html`。サイズ・場面・末尾表示を切り替えて原寸画像を確認できる。
- 固定iframeで試す: 開発サーバーの `/output/playwright/moon-embed/preview.html`。
- 元画像・ログ: `output/playwright/moon-embed/`。比較用の画像はローカル検証成果物で、配布フォルダーへは追加しない。
- [修正前の900×600表紙](screenshots/itch-embed/before-title-900x600.png) / [修正後](screenshots/itch-embed/after-title-900x600.png)。
- [430×800の表紙](screenshots/itch-embed/after-title-430x800.png) / [900×600の選択肢末尾](screenshots/itch-embed/after-multiple-choices-scrolled-900x600.png)。

`npm run dev -- --port 5198` と、ビルド後の `npm run preview -- --port 5199` を起動する。独立したPlaywright CLIセッションで、以下を順に実行する。結果はそれぞれ `output/playwright/moon-embed/{after,edges,routes,production,audio}.log` に保存する。

```text
playwright-cli -s=moon-embed run-code --filename scripts/qa/moon-embed.js.txt
playwright-cli -s=moon-edges run-code --filename scripts/qa/moon-embed-edges.js.txt
playwright-cli -s=moon-routes run-code --filename scripts/qa/moon-seven-browser.js.txt
playwright-cli -s=moon-production run-code --filename scripts/qa/moon-seven-production.js.txt
playwright-cli -s=moon-audio run-code --filename scripts/qa/moon-import-audio.js.txt
node scripts/qa/moon-embed-report.mjs
```

CLIは既存の運用どおり `npx --no-install --package @playwright/cli playwright-cli` で実行できる。比較生成には修正前に採取した `before.log` と画像も必要。単独の修正後QAはそれらがなくても実行できる。

itch.io上の実際の公開ページ、Android/iOS実機、Safari/Firefox、人間の読書時の快適さ・面白さは未検証。ブラウザ上の固定iframe操作と、実機・人間の試遊は区別する。
