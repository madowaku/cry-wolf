# CRY WOLF! — 月あかりの約束 / v0.9.2

## Current playable
- Primary target: `public/moon/`, the deterministic seven-night storybook with four endings, three-page epilogues, road ready/not-ready variants, bookmarks, portraits and three BGM tracks. Read `README.md`, relevant `docs/moon/SEVEN_NIGHTS_v0.9.md`, `IMPORT_STORYBOOK_v0.9.1.md` and `FINISHING_TASK_v0.9.2.md` before changes.
- Root React/Vite and `public/storybook/` are separate historical experiments. T001–T003 and probability tables in `docs/CRY_WOLF_ROMANTIC_JAM_IMPLEMENTATION_TASK_v0.3.md` apply only to the old React prototype.

## Architecture and boundaries
- `model.js`: pure deterministic transitions; no DOM, storage or randomness. `story.js` / `story-late.js`: narrative and reasons. `presentation.js`: presentation helpers. `app.js`: DOM, interactions and saves. `audio.js`: music controller. `index.html`: initial loading and recovery. `style.css`: responsive layout and motion.
- Presentation pages, title and help must never advance ticks, revision or events. Preserve seven nights, four END guards, road variants, epilogues and existing assets. No new dependencies, engine migration, backend, modes or randomness without direction.
- Bell is a dutiful night-watch border collie; Luna is proud and initially provocative. Only wolf entry into the village patrol path requires a report. Forest presence does not. No violence or predation.
- Public values: `trust` / 村の信用 0–5; `bond` / ルナとのきずな 0–5; `insight` / 合図の理解 0–3. Internal `honesty` is separate; `canCall` uses bond >= 4, trust >= 2, honesty >= 1. Ask before changing numeric or system meaning.

## Saves, assets and music
- Preserve `crywolf_moon_v09`, v8 migration without overwriting the old key, `crywolf_moon_reading_v091`, independent `crywolf_moon_endings_v09` and `crywolf_moon_preferences_v08`. Storage refusal must leave the game playable. Restart requires confirmation when a bookmark exists; ending collection survives.
- Standalone `public/moon/` must run through local `file://` and static hosting without external runtime dependencies. Keep legacy builds intact.
- Preserve original portraits and the shared model-based half-to-full moon progression. Keep text/buttons separate from art, provenance and hashes current. New bitmap assets use the requested Imagegen workflow; no large regeneration for presentation changes.
- Preserve `the fairy tale` / `Storyteller` / `月夜`, credits, volumes, mute, visibility pause and user-gesture autoplay. Follow `BGM/README.md`, `CREDITS.md`, `music-manifest.json` and `IMPORT_STORYBOOK_v0.9.1.md`. Do not collect new audio or distribute standalone originals. Sync generated audio with `npm run music:moon`; check source conditions before repackaging.
- Show the title without waiting for every asset or music decoding. Loading failures need a usable recovery path; respect reduced motion and saved motion OFF.

## Verification and delivery
- Run `npm test`, `npm run typecheck`, `npm run build` and relevant browser QA after UI/rule changes. Vitest uses threads for Windows sandbox compatibility.
- Use `docs/skills/romantic-branch-qa/SKILL.md` with the current Moon rules, not its old prototype examples. Check 7-night playthroughs, four ENDs, both road variants, epilogues, saves/migration/restart, audio and low motion.
- Check 360×800, 390×844, 720×1280 and wide desktop; readable prose, >=44px controls, focus/keyboard and image failure behavior.
- Report executed checks, screenshots and limitations. Automatic tests, browser checks, physical devices and human playtesting are distinct evidence. Never infer emotional impact or fun from automated PASS.
