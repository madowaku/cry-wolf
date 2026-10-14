# Moon v0.9.2 Implementation Plan

**Goal:** 添付仕様に従って、現行七夜絵本版の表紙・起動・意味の伝達を改善する。
**Architecture:** 既存の静的HTMLと分離された描画・物語・演出・音楽を継続する。モデルと37点の配布画像、音源を保持する。
**Spec:** `docs/moon/FINISHING_TASK_v0.9.2.md`
**Baseline:** clean `main` / local HEAD and GitHub HEAD both `64d59bf43435a39369287e13935454d0e2e687cc`, verified with `git ls-remote origin HEAD refs/heads/main` on 2026-10-14 JST. Work branch `codex/moon-v092-finishing`.

- [x] 現行対象にAGENTS/READMEを更新。
- [x] 既存素材による見開き表紙、しおり優先、再開確認、半月。
- [x] 初期DOMローダー、最小画像待ち、音楽非同期、失敗・遅延の復帰と低モーション。
- [x] ピップの頁にベルの目的、鐘と境界の重点表示、意味/実際の前後差/理由。
- [x] 7夜4ENDと道の両分岐、保存/移行、音、各画面サイズ、直接HTML、失敗時の回帰確認。
- [x] Imagegen参考と実装の比較、指定5場面、結果報告。検証済み変更をコミットする。

重点: 起動中の画像遅延/失敗、JS失敗、保存拒否、完成済みしおりからの再開/再読、上限下限での実差分、未知の居場所を出さない。
生成見本は構図参考。既存画像をそのまま使い、見本の満月は仕様に従い半月へ修正、装飾・人物の描き直しは採用しない。
