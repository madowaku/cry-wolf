# 絵本UI / Flat Pop 素材制作記録

制作日: 2026-10-12。ツール: Codex built-in `image_gen`、透過背景。

ユーザー提供の設定画とFlat Pop資料は人物・配色・構図の参照。画像に含まれる文字・UI・衣装の細密装飾はゲーム素材として転載していない。

人物ごとに1枚の共通キャンバスを用い、2×2表情シートをCSSで表示する。背景、小物、台詞、ボタンは別レイヤー。画像の水平反転は使わない。

## ベル

採用: `public/storybook/assets/bell-flat-expressions.png`。左上: 通常 / 右上: 考え中 / 左下: 照れ / 右下: 決意。

元の生成画像を参照して服飾と描写を簡略化した。髪の3塊と顔筋は完全な図形化には達しておらず、今後の美術調整余地を残す。画面では折れ耳・黒白の髪・尻尾・鐘・ランタンで人物を区別できる。

```text
Use case: style-transfer. Edit this transparent Bell character sheet for a minimalist FLAT POP FAIRYTALE GAME. Keep the same identifiable gentle black-and-cream border collie boy, one folded dog ear (on viewer left), amber eyes, little lantern, four distinct expressions in the EXACT same evenly spaced 2x2 layout. Redraw radically simpler: dark hair EXACTLY THREE large solid rounded shapes, small cream blaze CONTINUING from forehead to nose, NO individual hair strands, NO embroidery, NO chains, NO ornate clasp, NO filigree, NO realistic rendering. Plain navy short night-watch cape over simple ivory shirt and charcoal vest, small pouch. Broad flat unbroken color areas, uniform clean dark navy outlines, ONLY one hard-edged shadow tone, absolutely no gradients, shine, texture or hatch marks. Add a large simple black-and-cream fluffy dog tail clearly visible next to waist/thigh. Knees-up portrait framing, gentle age-appropriate character, about 5-head proportions, youthful but not chibi. Identical pose/scale/clothes and baseline in all quadrants; only face, ears and hand acting differ. Top left neutral kind; top right thinking; bottom left flustered shy ears down; bottom right resolved earnest, steady eyes (NOT shocked). Palette navy #19283F ivory #F4EAD9 charcoal #303239 muted amber eyes; brass #C8954F used ONLY for simple lantern and little bell. Each exact quadrant must contain one entire standalone figure with all ears and tails inside it and at least 5 percent transparent padding. NO red decoration. NO background at all: true full transparent alpha between and around each of the four figures. NO typography, NO labels, NO frames, NO UI. This must look like bold clean modern children storybook character art, not a detailed anime card. Strong shape simplicity is the most important requirement.
```

## ルナ

初回の簡略化試作: `luna-flat-expressions.png`（不採用）。左上: 強がり / 右上: からかい / 左下: 照れ / 右下: 待っていた。

元の生成画像を参照して細い毛束、金刺繍、フリルを除去。銀髪・耳・尾・一つの赤いリボンを中心にした。透過PNGは透明領域にもRGB色が残る形式なので、アルファ値を確認して採用する。

```text
Use case: style-transfer. Edit this Luna character sheet for a minimalist FLAT POP FAIRYTALE GAME. Keep the same identifiable gentle silver wolf girl with large triangular ears and a SINGLE small red ribbon on viewer right, four distinct expressions in the EXACT same evenly spaced 2x2 layout. REMOVE ALL gray background and atmospheric halos, true full transparent alpha between and around characters. Redraw radically simpler: silver hair EXACTLY FOUR large solid smooth shapes (one fringe, two side locks, one back mass), NO fine flowing strands, NO embroidery, NO lace, NO many-layer ruffles, NO chains, NO belt ornaments, NO realistic rendering. Plain asymmetric navy cape over simple ivory high-neck tunic/dress, fully clothed. Broad flat unbroken color areas, uniform clean dark navy outlines, ONLY one hard-edged shadow tone, absolutely no gradients, shine, texture or hatch marks. A large simple silver fluffy wolf tail clearly visible next to waist/thigh, drawn as one broad curve. Knees-up portrait framing, gentle age-appropriate character, about 5-head proportions, youthful but not chibi. Identical pose/scale/clothes and baseline in all quadrants; only face, ears and hand acting differ. Top left tsun proud pretending not to care, eyes averted; top right teasing warm smile, chin a little up; bottom left shy gentle blush, ears slightly lowered; bottom right waiting relieved tender smile, small hand by chest. Palette navy #19283F ivory #F4EAD9 silver #B8BEC8. Red #D54760 is ONLY the ONE SMALL ribbon beside ear. No other red clothing, NO gold anywhere. Each exact quadrant must contain one entire standalone figure with all ears hair and tails inside it and at least 5 percent transparent padding. NO background, NO typography, NO labels, NO frames, NO UI. This must look like bold clean modern children storybook character art, not a detailed anime card. Strong shape simplicity is the most important requirement.
```

## ルナの勝気な表情 — 最終採用

採用: `public/storybook/assets/luna-assertive-expressions.png`、1086×1448。ユーザー提供「ルナの四つの表情シート.png」をマスターとして使用。built-in Imagegenで紙の背景を透過に編集した。左上: 余裕のある笑み / 右上: 爪をまねたからかい / 左下: そっぽを向く強がり / 右下: 待っていたあとの柔らかさ。柔らかい表情を序盤で使わず、夕方は左上・右上を表示する。

```text
Use case: background-extraction with tiny facial acting refinement. This is the approved Luna four-expression sprite sheet for a game. Preserve the SAME silver wolf girl, exact poses, proportions, clothing, navy/ivory/silver/red palette, simple flat cel-shaded illustration and exact 2 by 2 evenly aligned four-portrait layout. Preserve her older-sister confidence, half-lidded mischievous eyes, raised chin, assertive body language and sly smile. Top left: knowing smug teasing smile, finger at chin. Top right: mock wolf claw teasing gesture, impish confident open-mouth grin; show ONE tiny canine fang, playful, never violent. Bottom left: proud averted eyes and crossed arms, pretending she does not care. Bottom right: restrained soft warmth after waiting, keep some confident half-lidded eyes, not a meek innocent smile. Do not soften the top three faces into gentle good-girl expressions. Main edit: completely remove ALL warm cream background, producing actual fully transparent alpha surrounding and between the four figures. Keep clothes ivory opaque, all silver hair and tails, gloves, ears and the single red ribbon intact. Keep each entire portrait including ear tips and tail INSIDE its exact quadrant with clear transparent margins; do not overlap adjacent portraits. Identical cell size and character baseline. No text, no labels, no UI, no border, no scenery, no ground, no background halo. Change only the background and the one tiny fang; keep the approved expressive identity and shape simplicity.
```

## 初回試作のプロンプト（不採用）

描き込みが多いため不採用。原本はCodex生成画像フォルダに残し、配布物に含めない。

```text
Use case: illustration-story. Asset type: transparent visual novel character expression sheet for CRY WOLF Romantic Variant, no UI. Create ONE clean 2 by 2 evenly spaced sprite sheet, transparent alpha background, four identical waist-up portraits of the SAME gentle youthful anthropomorphic border collie boy Bell, wholly clothed, age-appropriate fairytale romance. Beautiful anime storybook illustration, expressive amber eyes, tousled dark brown black hair with a small cream white forelock, black dog ears with one folded ear, navy hooded cape with restrained gold embroidered edging over a cream shirt, little golden bell at collar, black gloves and a lantern near waist. Top left expression: calm earnest with small smile. Top right: serious thoughtful, looking toward the right. Bottom left: shy blush, tender smile. Bottom right: surprised and a little regretful. Every portrait identical scale and framing head to hips, ears completely in view, centered in its own exact quadrant with 8 percent clear transparent padding on all sides; no overlaps and no objects or tails crossing quadrants. Navy #19283F cream #F4EAD9 restrained antique gold palette. Elegant flat color masses with delicate anime facial detail, soft warm highlights, clean crisp silhouette. Match the romantic moonlit illustrated storybook look, detailed enough for big mobile standee portraits. Exactly four portraits, no text, no letters, no frames, no logos, no scenery, no borders, no shadows behind character. Actual transparent background.
```

```text
Use case: illustration-story. Asset type: transparent visual novel character expression sheet for CRY WOLF Romantic Variant, no UI. Create ONE clean 2 by 2 evenly spaced sprite sheet, transparent alpha background, four identical waist-up portraits of the SAME gentle youthful anthropomorphic silver wolf girl Luna, wholly clothed, age-appropriate fairytale romance. Beautiful anime storybook illustration, silver flowing hair, large soft silver triangular wolf ears, warm reddish amber eyes, a vivid red ribbon beside ear, navy black cloak with restrained gold embroidery over a high neck cream ruffled blouse and red bow, full covered torso, black gloves, glimpse of fluffy silver tail by hip. Top left expression: proud pretending not to care, chin up, a tiny blush. Top right: playful teasing warm smile. Bottom left: very shy blush, tender slightly embarrassed smile, waiting for a friend. Bottom right: earnest and wistful, gentle serious closed mouth. Every portrait identical scale and framing head to hips, ears completely in view, centered in its own exact quadrant with 8 percent clear transparent padding on all sides; no overlaps and no hair or tail crossing quadrants. Navy #19283F cream #F4EAD9 red #D54760 restrained antique gold palette. Elegant flat color masses with delicate anime facial detail, soft warm highlights, clean crisp silhouette. Match the romantic moonlit illustrated storybook look, detailed enough for big mobile standee portraits. Exactly four portraits, no text, no letters, no frames, no logos, no scenery, no borders, no shadows behind character. Actual transparent background.
```

背景3種（月夜・夕方・境界）、朝の差分、足跡・鐘・ランタンはトークンを参照するオリジナルSVG。文字・ボタンはDOM。外部フォント、外部音源、第三者の素材は追加していない。SEは操作後のみ小音量のWeb Audio合成音。
