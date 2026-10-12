# CRY WOLF! — Flat Pop Art Direction v0.1

**対象:** 『CRY WOLF! Romantic Variant』／Storybook Slide UI v0.1／v0.5「二人だけの遠吠え」独立Playable Experiment  
**位置づけ:** ビジュアルの正本。物語・状態遷移・ロジックは既存の `CRY_WOLF_STORYBOOK_SLIDE_UI_IMPLEMENTATION_TASK_v0.1.md` を正とし、本書でゲームルールを変更しない。  
**目的:** 小さなスマホ画面でも「オオカミ少年の童話」「ベルとルナ」「今見るべきもの」が一目で伝わり、調査・判断を妨げないアートに統一する。

## 0. デザインの一行定義

> **月明かりで読む、二人の小さな嘘。**  
> 夜紺の森、大きな月、ボーダーコリーの片折れ耳、オオカミの赤いリボン。**豪華に描くより、描かないことで物語を伝える。**

### 守る4原則

1. **キャラクターが主役。** 背景の細密描写や装飾でベルとルナの顔・耳・尻尾を埋めない。
2. **1画面1つの視線誘導。** 会話ページは表情、調査は手がかり、報告は鐘、結果は反応。要素の重要度は場面によって変える。
3. **フラットポップは「背景だけ」の処理にしない。** キャラクターの髪、服、毛束、陰影も大胆に簡略化する。既存のフラットポップ比較画像も**方向性の参照**であって、精細な髪・衣装は削減対象。
4. **絵の中にUIを描かない。** 日本語・英語テキスト、選択肢、HUD、字幕、ステータス、ロゴは原則ブラウザ側で別レイヤー描画する。

### 画面のキーワード

`童話 / ひみつ / 夜 / あたたかい灯 / ぎこちない恋 / かわいい強がり`  
**避ける:** 重厚ダークファンタジー、超精細アニメカード、きらきらした粒子の過多、ゴシック装飾の反復、リアルな陰影、汎用恋愛ソシャゲ画面。

---

## 1. カラーパレットと使い分け

この作品の画面基本色は**夜紺・月白・黒・銀・赤**の5役。真鍮色は鐘・ランタン専用の**機能的な第6色**として限定する。1画面の目立つ色数は原則3〜5に抑える。下記はv0.1固定のデザイントークン。

| トークン | HEX | 役割 | 面積目安（夜の場面） |
|---|---|---|---:|
| `--cw-night` | `#19283F` | 夜空、森、UIの濃色、輪郭 | 約50〜60% |
| `--cw-cream` | `#F4EAD9` | 月、絵本の紙、明るいテキスト背景 | 約25〜35% |
| `--cw-coal` | `#303239` | ベルの黒毛、影、見出し文字 | 約5〜12% |
| `--cw-silver` | `#B8BEC8` | ルナの髪と毛、月夜の明るい面 | 約5〜12% |
| `--cw-ribbon` | `#D54760` | **ルナの赤リボン**、恋愛の小さなアクセント | 約2〜5% |
| `--cw-brass` | `#C8954F` | **鐘／ランタン／窓の灯**の一点ハイライト | 約1〜4% |

- **赤の意味を守る:** 赤をUI全体に塗らない。ルナのリボンや感情の小さな変化が主役。エラー・警告の赤には、アイコン／説明文を必ず併用する。
- **金を節約する:** 金装飾の細い縁取りを量産しない。金属らしいツヤは**ベルの警報鐘だけ**（多くても一画面1箇所）。通常のランタンの明かりは平面のシンプルな色面。
- **昼/夕方:** 専用オレンジを増やしすぎない。クリーム背景に夜紺の木と薄い真鍮色の円を配置して時間帯を示す。
- **夜の読字:** 明るい紙地に濃い文字。写真・細密画の上に小文字を直置きしない。ボタン・HUDも同様。
- 色だけで正解/失敗、信用値、注意を判別させない。形・ラベル・数値を併用する。

### カラーの実装ルール

CSS変数は `cry-wolf-tokens.css` に定義。スライドタイトル／選択／結果などの新UIは**同じ変数を参照**し、適当な青・赤・金を混ぜない。作品の画面外にある比較資料・デバッグツールはこの制約の対象外。

---

## 2. シルエット設計・統一キャラクター

### ベル / Bell（ボーダーコリー少年）

**第一印象:** 小柄で誠実、緊張しやすい、少し頼りないけど大切なことには強い。

- **必須シルエット:** 黒白の毛／髪、額から鼻筋の白い筋、**片方だけ折れた耳**、ふさふさ尻尾、肩から下がるランタン。正面・横・縮小サムネで判別できること。
- **形の言語:** 丸み／少し下がり気味の肩／小さな楕円目。全体は**小さな丸と柔らかい四角**。
- **髪:** 黒を大きな2〜3個の塊として描く。白い額のラインだけ目立たせる。1本ずつの毛束描写を避ける。
- **衣装:** 夜番のネイビーの短いマント＋簡素なベスト＋小さなポーチ。金刺繍、大量の留め具、鎖、重装備は不要。
- **小物:** 警報鐘とランタン。両方描く場面でも強調するのは**どちらか一つ**。
- **演技:** 嘘をつくと折れ耳がさらに沈む、驚くと立つ方の耳がピン、好きが顔に出ると尻尾が勝手に動く。
- **演出注意:** ベルの感情を「ゲージの赤点滅」だけで示さない。耳・目・姿勢で語る。

### ルナ / Luna（灰銀オオカミ少女）

**第一印象:** 少し背が高く、いたずらっぽいが、本音に弱い。気丈な先輩の顔と照れ屋の素顔がある。

- **必須シルエット:** 三角の立ったオオカミ耳、**銀髪の大きな塊**、大きな尾、**小さな真紅のリボン**。ベルより頭一つではなく**約5〜10%背が高い程度**の印象でよい。
- **形の言語:** 三角（耳）／長い曲線（尾・髪）／非対称の三角ケープ。ベルと並べると形が違う。
- **髪:** 「大きな前髪」「横の束」「後ろ髪」の最大3〜4塊。細いハイライト線や大量の風になびく毛束は不要。
- **衣装:** 暗色のケープ＋簡潔なドレス／チュニック。赤リボンを唯一目立つ装飾にする。フリルの階層や細かいレースは削る。
- **演技:** からかい時は顎を少し上げる、強がり時は目をそらす、照れる時は耳が下がる、気持ちが漏れると尻尾が**短く揺れる**。
- **テルの注意:** 尻尾が動けば必ず嘘、という世界設定には**しない**。照れ・動揺・嘘は別の手がかりと組み合わせて表す。アニメ自体を攻略の決定的証拠にする場合は先にゲームルール側で明文化する。

### 共通描画ルール

| 要素 | 必須仕様 |
|---|---|
| 頭身 | シンプルなアニメ絵本調、目安4.5〜5.5頭身。SD化しすぎない |
| 線 | 均一〜やや強い輪郭。輪郭色は真っ黒ではなく夜紺／黒毛色 |
| 影 | 一段の硬い平面影のみ。必要な部分に限定 |
| 反射 | 目のハイライトは小さく1点。肌・髪の多段グラデーションは不要 |
| 背景との分離 | ベルの黒が森と同化しないよう、月白の大きな面を背後に置く／薄い輪郭で切り分ける |
| 一貫性 | 立ち絵を左右反転すると折れ耳やリボン位置が入れ替わる。**安易なCSS水平反転を禁止** |
| 演出 | 軽い上下動、耳ぴく、目線差分、尻尾の短い揺れ程度。過度のエフェクト不要 |

### 表情差分の制作順

**P0（合計8種類）**

| キャラ | ステート | ゲームで使う場面 |
|---|---|---|
| ベル | `neutral` 通常 | 独白・仕事 |
| ベル | `think` 考え中 | 足跡・遠吠えの推理 |
| ベル | `flustered` 照れ／耳ぺた | ルナのからかい |
| ベル | `resolve` 決意 | 鐘・報告 |
| ルナ | `tease` からかい | 夕方の予告 |
| ルナ | `tsun` 強がり | 「今日は行かない」 |
| ルナ | `shy` 照れ | 嘘や本音がバレたとき |
| ルナ | `wait` 待っていた | BESTの結果 |

**P1追加:** ベル `surprise`／ルナ `worried`／ルナ `relief`。**すべてを新規フルボディ生成しない。** マスター立ち絵はキャラごと1点、差分は顔・耳・腕などの局所変更で統一感を維持する。

---

## 3. 背景と象徴の設計

**基本レイヤー:** 単色の空 → 円い月／シンプルな建築・樹木シルエット → キャラクター → 必要な小物 → UI。遠近はグラデーションより**重なり**で示す。

| シーン | 描くもの | 描かないもの | 焦点 |
|---|---|---|---|
| `bg_title_night` | **巨大な月**、村の三角屋根、見張り台、森の線 | 数十の窓、無数の花、複雑な山城 | ベルとルナの対比 |
| `bg_evening_edge` | 夕方の円い太陽／月、境界の木、低い草 | 遠景の細密集落 | 強がるルナの目線 |
| `bg_watchtower_night` | 見張り台の2本柱、吊るしたランタン、見張り道 | 顔が潰れるほどの背景光 | ベルと鐘 |
| `bg_forest_boundary` | 境界を示す柵／白い石／道の色面、木の影 | ルナ本人や狼耳のシルエット（調査フェーズ） | **内側と外側の違い** |
| `bg_track_close` | 地面を2色面で整理、ウサギとオオカミ足跡の見分け | 小石・落ち葉の無数の点 | **足跡の形と位置** |
| `bg_morning_path` | 薄いクリーム空、見張り道の足跡、村長の影 | 広大な村の全景 | 報告の食い違い |

### モチーフ使用ルール

- **満月:** 安心・時間の流れ・二人が見上げる共通物。背景の大きな無地円が基本。
- **赤いリボン:** ルナの個性と、プレイヤーの視線の目印。背景に同色の飾りを散らさない。
- **警報ベル:** 社会への約束・真実。金属のリアルな一点アクセントを許可。ただし小画面で輪郭が読める単純な形に。
- **ランタンの灯:** 個人間の合図・希望。淡い金色の**大きな色面**を2回点灯させる。過度の光条や粒子は使わない。
- **足跡:** 「道に入ったか」を判断する**機能的な情報**。一目で位置・サイズの違いが分かるよう、線や境界標識を加える。

---

## 4. タイトル画面の設計（360×800 基準）

**表示目的:** 1秒で「村を見守る犬少年と森のオオカミ娘の、少し甘い童話」。ゲームで使う中央の主役を奪う文字・装飾を減らす。

```text
┌────────────────────────────┐
│                    [音]    │  余白・操作
│   CRY WOLF!                │  ロゴはHTML/ SVGで別レイヤー
│   Romantic Variant         │
│         ○ 大きな月          │
│    [ベル]      [ルナ]       │  大きな形・片折れ耳と赤リボン
│  村の屋根       森の影       │
│                            │  台詞・細部を詰めない
│ ┌──────────────────────┐   │
│ │     はじめから       │   │  48px以上のボタン
│ └──────────────────────┘   │
│ ┌──────────────────────┐   │
│ │     つづきから       │   │  セーブなしならdisabled
│ └──────────────────────┘   │
│      ⚙ 設定               │
└────────────────────────────┘
```

- 構図は**非対称**。ベルを左やや手前、ルナを右やや高く、二人の視線だけを近づける。
- ロゴは**濃紺の太めセリフ**を第一候補。UI文字は読みやすい日本語サンセリフ。ロゴの狼シルエットは一個だけ。
- 「CRY WOLF!」だけで視認できること。副題は小さく。小さな説明コピーを無理に入れず、必要なら開始前の物語1ページに移動する。
- タイトル用**文字入り1枚絵をゲームUIとして使わない**。背景＋ベル＋ルナ＋UIに分割。

---

## 5. Storybook Slide UIの設計

### 共通フレーム

- **HUD上端:** `NIGHT 2 / 7` と残り刻の●●、必要なら信用ランタンの小アイコン。強い装飾枠を禁止。
- **絵領域:** 高さ50〜62%目安。ページの感情／手がかりの中心。中央の主役が常に分かるように。
- **本文:** 月白の紙帯に夜紺の文字。話者を短く明記、本文は原則**1〜2文**、多くても3行。次へで送り、画像には焼かない。
- **操作:** 最下部の明瞭な選択ボタン、または「次へ」。選択画面だけ絵を縮めてもよい。**選択肢は基本16px以上／タップ高さ48px以上**。
- **メモ:** 右上に任意で開く補助カード。調査結果は必要な場面で再読可能。メモを開いても刻を消費しない。
- **余白:** 台詞と人物の間、選択肢同士は十分空ける。花・星・金装飾を空白埋めに使わない。
- **レスポンシブ:** 360×800と720×1280を確認。ノッチ・安全領域・縦スクロール。狭い高さで立ち絵の足元が切れても**耳・顔・尻尾の演技と操作が残る**ようトリミング。
- **色コントラスト:** 本文・ボタンラベルは十分な明暗差。状態表示は色＋文字／図形。`prefers-reduced-motion`、ミュート時の情報保障。

### 同じ舞台、別の見せ場

| スライド | カメラと主役 | 立ち絵 | UI | ネタバレ制約 |
|---|---|---|---|---|
| `S01_EVENING` | 二人の顔と耳が大きく | ベル＋ルナ | 台詞＋次へ | 言葉と表情の矛盾を示す |
| `S02_NIGHT` | 見張り台のベル＋遠吠えの擬音 | ベルのみ | 次へ | 夜の実際の来訪状態は見せない |
| `S03_CLUE` | **足跡を画面中央** | ベルを小さく | 調査3択 | 正解フラグを一枚絵に混ぜない |
| `S04_OBSERVATION` | 足跡拡大／耳・音／灯りの二点滅 | ベルのみ | 発見＋次へ | 取得情報は嘘にしない |
| `S05_DECISION` | 境界、ランタンが届く距離 | ベルのみ | 残り1刻・行動3択 | 境界内外は視覚的に判定可能に |
| `S06_REPORT` | **警報ベルを大きく** | ベルの横顔 | 警報／異常なし | **ルナの姿を出さない** |
| `R_BEST` | **待っていたルナの小さな赤リボン** | 両者 | 台詞→結果理由 | 結果が確定してからルナを見せる |
| `R_DUTY` | 村の明かり、ルナの後姿 | 両者可 | 台詞→結果理由 | 正しい報告を「悪事」のように描かない |
| `R_FALSE / SECRET` | 鐘／翌朝の足跡 | ベル中心 | 理由と数値 | 過剰な失敗演出より説明 |

**既存の進行は改変禁止。** `2刻`、1刻目の合図は距離不足、2刻目なら届く、2刻終了後に報告、結果は `BEST/FALSE/DUTY/SECRET` の4種。`track→signal`も`listen→signal`もBEST、`signal→signal`もBESTになり得る。数値変化も既存v0.5を保持する。本書は**アートとUIの仕様であってロジック再設計ではない**。

---

## 6. UIパーツとタイポグラフィ

| パーツ | 統一仕様 |
|---|---|
| 紙帯・カード | クリーム地。角丸8〜14px。濃紺の**単線1〜2px**。金の唐草装飾は禁止 |
| ボタン | 月白地＋濃紺文字の大きな長方形。選択時は濃紺地＋月白文字。装飾は小アイコン1点まで |
| 見出し | セリフ系の書体。本文UIでは装飾字体を用いない |
| 本文 | OS標準日本語サンセリフ優先。本文16〜18pxを目安。日本語の詰まった小文字を避ける |
| HUD | 静かで平たい形。夜番・残り刻・信用値を「短い文字＋形」で伝える |
| メモ | 最初から常時全面表示しない。タップで開閉、閉じても推理情報は失われない |
| SE/動き | 合図＝小さな二度の明滅。鐘＝短いSEと一拍の揺れ。耳＝小さな回転。基本150〜250ms程度 |

フォントの優先順位：まず端末の日本語既定フォントで崩れない設計にする。後から日本語書体を配布物へ同梱するなら**ライセンスとWebフォントの容量を確認**する。画像生成したロゴ文字は正式データにしない。HTML/SVGのベクターロゴを第一候補とする。

## 7. レイヤー・書き出し・アセット名

**P0はレイヤー分離を必須とする。** 背景に立ち絵・台詞・ボタンが一体化している生成ポスターをゲーム画面へ貼らない。

| 種別 | 推奨命名 | 出力形式・要点 |
|---|---|---|
| 背景 | `bg_<scene>.webp` | 例 `bg_forest_boundary.webp`。縦長2:3付近か汎用大判。端末比率変更に耐える余白。UIなし |
| 立ち絵 | `ch_bell_<state>.webp` / `ch_luna_<state>.webp` | **アルファ透過**、同キャラは同じキャンバス寸法と足元基準線 |
| 表情差分 | `face_bell_<state>.webp` 等 | 必要時のみ。可能ならマスター立ち絵から差分を制作 |
| 小物 | `prop_bell.svg`, `prop_lantern.svg`, `prop_footprint.svg` | 色がトークンに沿う軽量SVG。メモ等はCSSで |
| ロゴ | `logo_cry_wolf.svg` | 背景透明。幅360pxで縮小して判読できる |

- **まず最低限の素材で通す:** 背景3種（月夜／夕方／境界）＋ベル4表情＋ルナ4表情＋鐘／ランタン／足跡の3アイコン。朝・詳細カット・アニメはP1以降。
- 画像最適化は見た目と端末のメモリに合わせる。透過でWebPが不適ならPNGを使い、後でWebP化する。**同キャラの立ち絵にサイズ差があるとスライドで跳ねる**ので、描画枠と基準位置を固定。
- 既存生成アートは**参照用**。制作記録に生成日・ツール・編集工程・使用目的を残す。公開プラットフォームのAI表記は提出時の現行規約を確認。

## 8. 画像生成用プロンプト雛形（アセット分割前提）

以下の英語はモデルへの例示。**画像生成の出力はそのまま採用せず、シルエット・耳・毛色・指・リボン位置・透明性を確認**する。キャラマスターの参照画像を毎回添えて統一性を保つ。

### 共通Style Lock

```text
Flat pop fairytale storybook illustration for a romantic indie puzzle game,
bold simple readable shapes, clean character silhouette, limited palette
(navy #19283F, warm ivory #F4EAD9, charcoal #303239, silver gray #B8BEC8,
a single small crimson accent #D54760), broad uninterrupted color areas,
simplified grouped hair masses, flat graphic color blocking, minimal internal lines,
one-step cel shading, playful but restrained facial acting, clear negative space,
no overly detailed anime rendering, no gradients, no glitter, no ornate filigree,
no busy floral decorations, no text, no typography, no HUD, no buttons, no watermark.
```

### Bell MASTER

```text
Full-body character sprite, Bell, a shy gentle border-collie-eared young male
fantasy village night watchman, shorter and modest stance, black and white hair/fur,
one folded ear and one upright ear, distinct white facial blaze, fluffy tail,
simple navy short cape, cream undershirt, practical belt pouch,
one small brass warning bell, expressive amber eyes.
Flat pop storybook style, large readable silhouette, 3 large hair shapes,
very simple clothing, no embroidered armor, no elaborate jewelry,
transparent background, centered full body, consistent proportions,
ample padding around tail and ears, no cast shadow, no text.
```

### Luna MASTER

```text
Full-body character sprite, Luna, a silver-gray wolf-eared young woman,
a little taller than Bell, confident teasing pose with subtle hidden shyness,
large pointed wolf ears, long silver-gray hair grouped into 3 or 4 broad shapes,
one large fluffy tail, a single small bright red ribbon near her hair,
simple dark navy cape and modest clean-lined outfit, warm amber eyes.
Flat pop fairytale illustration, clean triangular/curved silhouette,
minimal clothing patterns, one-step shading, transparent background,
centered full body, ample padding around tail and ears,
no decorative frame, no text, no HUD.
```

### Background / `bg_forest_boundary`

```text
Vertical flat pop storybook background for a mobile game,
a moonlit village watch path divided from a dark forest by a clearly readable
stone boundary marker and fence, giant warm ivory moon, broad deep navy tree shapes,
minimal geometric village rooftops in the distance, restrained tiny warm lamp lights,
strong foreground/midground/background separation through overlap,
large uncluttered negative space around the center for separately composited sprites,
NO characters, NO animals, NO footprints revealing game truth,
NO words, NO buttons, NO text, NO border, NO ornate decoration.
```

### Close-up / tracks

```text
Simple high-clarity storybook investigation close-up,
two clearly distinguishable animal track shapes in flat graphic soil,
clear marked border between the forest side and village watch path,
large readable forms, 3-color navy ivory charcoal composition,
no tiny gravel, no random clutter, no character, no words, no HUD.
```

**禁止語彙・抑制指定:** `ultra detailed / masterpiece / intricate clothing / intricate hair / cinematic particles / hyperrealistic lighting / floral border / glowing bokeh / decorative filigree / ornate gothic UI`。スタイルワードより、**「描くべき主役と描かないもの」**を明確にする。

## 9. 制作フロー（安く・早く・品質を保つ）

1. **トークンとSVGの平面モック**を最初に制作。立ち絵が未完成でも360×800で読めるか検証。
2. ベル・ルナの**2つのマスター立ち絵**だけを同時にデザイン確認。片折れ耳とリボンが縮小でも読めるか、背景と溶けないかを見る。
3. 承認後、各4表情を同じマスターから派生。すべて別キャラとして生成し直さない。
4. 背景は月夜・夕方・境界の3種に限定してP0完成。足跡・警報鐘・ランタンは小さなSVGを流用。
5. 第2夜のStorybook UIへ差し込み、**夕方→調査→報告→BEST／DUTY**を比較撮影。必要ならFALSE/SECRETを追加確認。
6. 実機で**3秒視認性テスト**：「ベルとルナは誰？」「調べるべき足跡は？」「押すボタンはどれ？」。説明しない状態で確認。
7. アート完成の判定と「ゲームとして面白いか」は別のQAとして扱う。スライドが美しくなっても、推理／選択の楽しさが改善したとは断言しない。

### 最低受け入れ条件 / QA

- [ ] 360×800／720×1280のタイトル・夕方・調査・報告・結果の画面が崩れない。
- [ ] ゲーム用の**背景画像にはキャラ・日本語・選択ボタン・ステータスを描き込まない**。
- [ ] 縮小表示でベルの片折れ耳・白い顔筋、ルナの尖り耳・赤リボンが区別できる。
- [ ] ルナの夜間非表示ルールが守られ、調査画面で真相をネタバレしない。
- [ ] 足跡・境界・警報鐘・ランタン合図は情報として判別できる。装飾と誤認されない。
- [ ] 台詞1〜3行、操作ボタン48px以上、選択時は誤タップしにくい間隔。
- [ ] フェーズを戻っても表情差分の位置・サイズが跳ねない。
- [ ] reduced-motion・ミュートでも手がかりと結果の意味が変わらない。
- [ ] `BEST/FALSE/DUTY/SECRET` と数値の判定は従来通りで、アート改修でゲームロジックを変更していない。
- [ ] 顔・耳・尻尾の「演技」が美術上の重要情報として伝わる。

## 10. 過去の参考画像の扱いと次の判断

- **参照A:** `月夜のロマンス表現比較ボード.png` 右側フラットポップ案。**承認済み方向性**：大きな月、夜紺の広い面、赤リボン、シンプルなシルエット、童話らしさ。
- **参照B:** `月夜のベルとルナ設定画.png`。**キャラクターの雰囲気・小物・表情**の参照。フリル、毛束、刺繍などの情報量は減らす。
- **注意:** 過去画像の日本語UI、金装飾、細密な花、複雑な服飾はスタイルロックとして引き継がない。特に「フラット背景＋精細アニメ人物」で止めない。

**このv0.1の終了条件:** 1夜の各ページが**同じ作品に見え**、しかも「見たい情報が自然に目に入る」こと。モックとゲームのキャラクターの形が食い違う場合、UIの豪華さよりマスター立ち絵の一貫性を優先する。
