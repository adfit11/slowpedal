# Implementation Plan: Bottom Controls Always Fit Within the Browser Window

**Branch**: `005-viewport-fit-bottom-controls` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-viewport-fit-bottom-controls/spec.md`

## Summary

Fix a regression left over from the Persistent Bottom Controls feature: `#bottom-controls`
no longer fades out, but it is still `position: absolute; bottom: 0;` relative to
`#player-area`, which can grow taller than the viewport on short browser windows —
pushing the controls below the fold, requiring a scroll to reach them at all. Per the
clarification recorded in spec.md, the fix is to anchor `#bottom-controls` to the
browser's viewport instead of to `#player-area`, using `position: fixed`. The video
player's own sizing behavior is untouched; on very short windows the page may need
scrolling to see the whole player, but the controls themselves stay pinned to the
bottom of the window and are never part of what scrolls away.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES6+) — no transpilation, no build step

**Primary Dependencies**: Remix Icons (CDN) and YouTube IFrame API (CDN) — unchanged; this feature adds none

**Storage**: N/A

**Testing**: Playwright (`tests/*.spec.js`, dev-only per the Video Load Feedback feature's
documented Constitution exception). New coverage is needed for "controls stay pinned to
the viewport bottom regardless of window height or scroll position."

**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge), deployed statically via GitHub Pages

**Project Type**: Single static web page — three-file architecture (`index.html`, `css/styles.css`, `js/scripts.js`)

**Performance Goals**: N/A — pure CSS positioning change, no new runtime cost

**Constraints**: Zero build step; no new dependencies; keyboard shortcuts unchanged
(Constitution Principle II); no changes to `VideoPlayer`, `loadVideo()`, or
`loadLocalVideo()` (Constitution Principle III) — this touches only the presentation
layer's positioning, not playback logic

**Scale/Scope**: Single-user, client-side only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Zero-Build, CDN-Only Dependencies** — PASS. No new dependency; this is a
  one-property CSS positioning change (`position: absolute` → `position: fixed`, plus
  removing the now-redundant explicit `bottom: 0` coupling to `#player-area`'s box).
- **II. Pedal-Synced Keyboard Shortcuts** — PASS / not applicable. No shortcut key or
  behavior is touched — the buttons keep responding to the same clicks/keys; only their
  CSS positioning changes.
- **III. VideoPlayer as the Only Player Interface** — PASS. No touch point in
  `VideoPlayer`, `loadVideo()`, `loadLocalVideo()`, or the load-state functions —
  this is a pure CSS layout fix to a presentation-layer regression from feature 004.

No violations requiring justification — Complexity Tracking is not needed.

**Post-Phase 1 re-check**: Design artifacts confirm the change is a single CSS
positioning edit (`#bottom-controls` becomes viewport-anchored instead of
player-area-anchored) with no new dependency, no JS logic change, and no new
architecture. All three gates still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/005-viewport-fit-bottom-controls/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── bottom-controls-viewport-anchor.md  # Phase 1 output — new, small contract
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
css/styles.css     # Change #bottom-controls from `position: absolute` (anchored to
                   # #player-area's box) to `position: fixed` (anchored to the
                   # browser viewport). No other selector changes.
js/scripts.js      # No changes expected — this is a pure CSS positioning fix.
tests/             # Add coverage to tests/minimal-redesign.spec.js (or a new spec
                   # file) asserting the controls stay pinned to the viewport's
                   # bottom edge across a range of window heights and scroll
                   # positions.
```

**Structure Decision**: Same three-file static app; this is a single, targeted CSS
positioning fix — no new files, no new architecture.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
