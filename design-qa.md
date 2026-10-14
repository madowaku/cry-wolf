# Moon v0.9.2 design QA

Latest follow-up, 2026-10-15: the user requested a sly opening Luna, more distance and a paired full-moon TRUE END cover. `title-reference-v2.png` is now the source guide; `comparison-v2.png` places it together with the rendered opening at the same 1440×900 viewport/density 1 (full page 1440×929), normalized to 720px width. `promise-comparison.png` compares the opening and completed HONEST at the same size and shared composition. Native mobile/desktop captures in `screenshots/cover-promise/` were opened for readable face/copy review. Existing Georgia/Mincho fonts, spacing, navy/paper colors, original assets and editable copy are retained; the intentional changes are the sly existing portrait, wider opening distance and warmer final proximity/full moon. No actionable P0/P1/P2 findings remain. Latest checks: 239 unit tests, 55 focused browser checks, 1,517 full-route checks, 155 production/file checks and 59 actual-audio checks all pass. Saved home stays half-moon even after HONEST; the close cover appears only after the final epilogue. See `docs/moon/COVER_PROMISE_v0.9.2.md`.

Source visual truth: `docs/moon/design-v092/title-reference.png` (Codex built-in Imagegen; exact prompt and SHA-256 in `provenance.json`). Implementation: `docs/moon/screenshots/v092/after-title-1440.png`, 360/390/720 variants and the four other required scenes in the same directory. State: fresh home, motion OFF, sound OFF, no bookmark. Browser viewport: 1440×900, density 1. Source pixels: 1586×992; implementation full-page pixels: 1440×929. The reference is a composition guide under the user's existing-art and half-moon constraints, not a contract to regenerate poses, textures or adopt its incorrect full moon.

Full-view comparison: `docs/moon/design-v092/comparison.png` places both images together in the same input at width 720 each, preserving aspect ratios and containing the complete images. `comparison.html` is the reproducible comparison surface. Native full-resolution views of the title/copy/buttons and 360px screenshots were also opened to inspect smaller text; these are readable without relying on the scaled comparison. This is visual review, not a claim of pixel-identical reproduction.

Required fidelity surfaces:

- Typography: Georgia and existing device Mincho for display/prose, system UI for smaller descriptions. Large title, separate Japanese subtitle and short premise remain selectable HTML. 18px mobile prose; result reasons 15px and meaning lines 13px. Copy wraps fully, rather than shrinking to 11px.
- Spacing/layout: desktop artwork and paper form a balanced spread; phones and 661–900px covers stack. New primary CTA is visible within the 360×800 first viewport. Saved home adds a confirmed restart below the resume CTA and can scroll naturally.
- Colors: retained navy `#19283F`, paper `#F4EAD9`, brass accents. Boundary uses position, labels and text as well as different backgrounds. The half moon is intentionally different from the generated reference's full moon.
- Asset quality: all 37 game WebPs remain unchanged. Original portraits/expressions/background and real bell artwork are reused, not replaced with generated lookalikes. Generated reference texture, new poses and decorative trees are intentionally not adopted. Shared moon texture/model remain the visible phase source, including the investigation diagram.
- Copy: formal title, premise, bookmark label, no END-name spoilers on the cover. Prologue adds one Bell thought after Pip's letter problem. Reaction still precedes explanation; all three result rows explain actual numbers and reasons.

Comparison history:

1. Initial 360px capture caught asynchronous portrait decode before capture. Loader now waits for the five critical image decodes and actual title img decode, while the capture script also waits for decode. Replacement screenshot shows both original portraits. No artificial minimum delay.
2. Reviewer P2: 720×1280 put a stage-anchored bell above the small portrait. Cover at 661–900px now stacks with a 400px artwork panel. Replacement `after-title-720.png` was opened and shows the bell by Bell, large readable faces and a visible primary button.
3. Reviewer P2: skip link was focusable under the loader. Moved inside the hidden/inert book. Delayed-image keyboard QA checks that Tab cannot enter the hidden book, and that the skip link becomes visibly reachable afterward. Recovery QA: 30/30, including completed-bookmark restart confirmation.

Primary interactions tested: fresh opening, resume, restart cancel, settings/help Escape, all seven-night routes and ENDs, reading position, audio controls, retry/image-free recovery. Game console/page errors: 0 in successful-path suites. Injected resource failures are intentional; recovery reports no unexpected JavaScript errors. The comparison HTML initially lacked a favicon; it is a review artifact, not the game.

Open questions: no blocking product questions. Physical devices, Safari/Firefox, assistive-technology users, listening balance and emotional impact require later human tests.

Implementation checklist: completed title/loading/story/status/boundary changes, required screenshots, relevant automatic/browser verification, reviewer fixes. Minor accepted differences: existing fonts and art limit exact correspondence to the generated reference; the specification takes priority.

final result: passed
