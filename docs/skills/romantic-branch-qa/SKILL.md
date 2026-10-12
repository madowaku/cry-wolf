---
name: romantic-branch-qa
description: Audit and test a short branching romance or visual novel game for reachable endings, correct stat changes, consistent night-by-night story flags, deterministic random choices, and mobile UI flow. Use after implementing or modifying narrative events, branching game rules, save/load, ending conditions, or interaction flow in CRY WOLF! or a similar story game.
---

# Romantic Branch QA

## Goal

Verify the *implemented* game, not merely its written design. Specifically, ensure that all advertised routes and endings can be reached, no state is broken, and narrative dialogue reflects the player's actual choices. For CRY WOLF!, the player is Bell, the border-collie night-watch boy, and Luna is the wolf girl. Romance is age-appropriate, nonviolent, and consensual.

## Inspect before running

1. Read `AGENTS.md` and the repository's actual implementation task / narrative specification, if available. Prefer `CRY_WOLF_ROMANTIC_JAM_IMPLEMENTATION_TASK_v0.3.md` when present. Do not treat this skill as overriding project-specific decisions.
2. Locate the game-state types, event definitions, route resolver, ending resolver, random source, persistence boundary, and existing test commands. Do not invent missing files or pretend they exist.
3. Identify the source of truth for `night`, `trust`, `affection`, `tension`, flags, Luna presence, signs, player choices, and past decisions. If values differ from the spec, report the discrepancy before altering any behavior.
4. Reuse the test framework already used by the repo. If none exists, propose or add the lightest suitable runner only if the task allows changes. Prefer Vitest for pure TypeScript logic and Playwright for browser flow, when available.

## Required audit

### A. Rules and invariants

- Start state and variable bounds are valid: `0 <= trust <= trustMax`, `0 <= affection <= affectionMax`, `night` advances exactly once per completed night.
- An event produces the specified stat change exactly once. Repeated taps, double submits, Back, refresh, and restored saves do not apply the same change again.
- Nonviolent output is maintained: no wolf attacking, devouring or harming Bell; no blood, weapons, or threatening imagery in game paths.
- The reasons for changing village trust are internally coherent (e.g. next-morning patrol evidence). If a scene intentionally bypasses reporting (such as a special honest response), the effect is explained and consistent.
- Where the design intentionally allows uncertainty, a sign is evidence, not proof of present-night attendance; a red ribbon may remain from an earlier night.

### B. Branch and ending reachability

- List all entry points, choices, random outcomes, flags, stat effects, and ending guards for Nights 1–7.
- For each ending (GOOD DOG, BAD LIAR, SECRET MEETING, HONEST) find at least one *concrete reproducible path* (seed and all player choices), not just a theoretical statement that an inequality can be true.
- Check ending priority when multiple guards are simultaneously true, and test both positive and negative guard boundaries.
- Verify that the special Night 4 `ありがとう` choice appears only under the intended conditions, and that the Night 7 `……ルナ` choice appears only when its full documented predicate holds.
- Test Night 7 with the third option both unlocked and locked. Confirm the UI state and resulting route agree.
- Report whether a playthrough can reach dead ends, blank dialogue, duplicated scenes, or nights with no possible choice.
- If randomness is involved, make it injectable/seedable; for exhaustive reachability, enumerate legal outcomes separately from their probability weights.

### C. Narrative consistency

- Character names remain Bell and Luna throughout, with consistent age-appropriate dynamics: Bell is a shy, earnest border-collie boy; Luna is a slightly older-feeling, teasing but equally shy wolf girl.
- A line like 'I didn't come' must be treated as a character statement, not mistaken for engine truth.
- All retrospective dialogue uses actual event history (e.g. no line that claims Bell sounded the alarm if Bell stayed silent).
- Special event and scene flags are either consumed once or explicitly repeatable.
- Missing Japanese strings, broken speaker labels, contradictory result messages, and spoiler text are recorded as issues.

### D. Persistence and UI

- If save/continue exists, compare the resumed state, event index, RNG state/seed or preserved outcome, and all stats with the pre-save state.
- Test fresh start, restart, interrupted Night 3/Night 7, saved-game load, and all endings if browser automation is available.
- Check at 360x800 and 720x1280, plus one desktop size; use screenshots at the actual native viewport, inspect tap target size, choice availability, truncation, scroll traps, and character/overlay overlap.
- Respect project asset provenance files and preserve approved character art. Do not regenerate character assets merely to perform QA.

## Process

1. Produce a compact route matrix from actual event data.
2. Run deterministic logic tests first; use a fixed seed and include one failing-case reproduction for each issue.
3. If feasible, enumerate every legal state transition at each night with state hashing and pruning. State hashing must include all flags/history fields used by route guards, not just trust and affection.
4. Run property tests / seeded simulations after deterministic coverage, measuring paths and unreachable states. Do not report a seed count as exhaustive coverage.
5. Run browser UI tests, capture screenshots when supported, and visually inspect at least one early, one middle, one final-night, and one ending state.
6. Fix only issues within the user's requested scope, keep changes minimal, and rerun affected tests.

## Required output

Provide:

- Commands run and actual pass/fail counts (never invent results).
- Ending table: name, reachable? concrete seed/choice path, guard, observed result.
- Branch coverage summary by Night 1–7 and special choices.
- Bugs by priority: BLOCKER (unplayable/unreachable required ending), HIGH (contradictory or incorrect state), MEDIUM (UI/text), LOW (cosmetic).
- Screen sizes actually checked and screenshots captured, or `not tested` with reason.
- File changes and any remaining uncertainties, separating automated verification from human playtest.

## When no runnable project is available

Return a *spec-only audit*, clearly label it as such, and provide a test plan. Do not claim any game code, screen, ending or browser test has passed.
