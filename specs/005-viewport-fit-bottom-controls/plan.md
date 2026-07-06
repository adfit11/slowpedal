# Implementation Plan: Bottom Controls Always Fit Within the Browser Window

**Branch**: `005-viewport-fit-bottom-controls` | **Date**: 2026-07-07 (revised from 2026-07-06) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-viewport-fit-bottom-controls/spec.md`

## Summary

Fix a regression left over from the Persistent Bottom Controls feature: on short
browser windows, the video player (sized only from width, via `aspect-ratio`) could
grow taller than the viewport, pushing the bottom playback/loop controls below the
fold. The current approach (revised 2026-07-07 from an earlier, already-implemented
"pin the controls to the viewport" fix — see spec.md's Clarifications and research.md
for the full history) is to shrink the player instead: a small `fitPlayerToViewport()`
function in `js/scripts.js` measures the header, timeline, and window height on load
and on resize, and sets `#player-container`'s and `#timeline-container`'s width (in px)
to whatever 16:9 size fits the remaining vertical space — capped at the existing
96%/1500px maximum. `#bottom-controls` reverts to its original `position: absolute`
(anchored to `#player-area`, which now always fits the viewport).

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES6+) — no transpilation, no build step

**Primary Dependencies**: Remix Icons (CDN) and YouTube IFrame API (CDN) — unchanged; this feature adds none

**Storage**: N/A

**Testing**: Playwright (`tests/*.spec.js`, dev-only per the Video Load Feedback feature's
documented Constitution exception). Coverage in `tests/viewport-fit.spec.js`: no page
overflow at a short viewport, player/timeline width tracking, no regression at a normal
viewport, and playback/loop surviving a resize.

**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge), deployed statically via GitHub Pages

**Project Type**: Single static web page — three-file architecture (`index.html`, `css/styles.css`, `js/scripts.js`)

**Performance Goals**: N/A — a `resize` listener doing a handful of property reads and
two style writes; no measurable runtime cost

**Constraints**: Zero build step; no new dependencies; keyboard shortcuts unchanged
(Constitution Principle II); no changes to `VideoPlayer`, `loadVideo()`, or
`loadLocalVideo()` (Constitution Principle III) — `fitPlayerToViewport()` only reads
layout geometry and sets CSS `width` on two elements; it never touches playback state

**Scale/Scope**: Single-user, client-side only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Zero-Build, CDN-Only Dependencies** — PASS. No new dependency; hand-rolled vanilla
  JS (a `resize` listener plus a plain function), consistent with "prefer hand-rolled
  code first."
- **II. Pedal-Synced Keyboard Shortcuts** — PASS / not applicable. No shortcut key or
  behavior is touched — `fitPlayerToViewport()` only changes CSS `width` on the player
  and timeline; the buttons keep responding to the same clicks/keys regardless of size.
- **III. VideoPlayer as the Only Player Interface** — PASS. `fitPlayerToViewport()`
  never references `youtubePlayer`, `html5Player`, or any `VideoPlayer` method — it only
  reads `offsetHeight`/`clientWidth` and sets `.style.width` on plain layout elements.

No violations requiring justification — Complexity Tracking is not needed.

**Post-Phase 1 re-check**: Design artifacts confirm the change is a small, self-contained
JS function plus two supporting CSS fixes (`min-height: 0` on `#main-content` and
`#player-container`, needed to let them actually shrink — see research.md's
"`min-height: auto` pitfall" section) and one reverted CSS rule (`#bottom-controls` back
to `position: absolute`). No new dependency, no touch point in `VideoPlayer` or any
playback function. All three gates still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/005-viewport-fit-bottom-controls/
├── plan.md              # This file
├── research.md          # Phase 0 output (includes the superseded pin-controls research)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── viewport-fit-sizing.md  # Phase 1 output — sizing contract (supersedes the
│                                # earlier bottom-controls-viewport-anchor.md contract)
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
css/styles.css     # #main-content and #player-container get explicit `min-height: 0`
                   # (required — see research.md's min-height pitfall). #bottom-controls
                   # reverts to `position: absolute` (from the superseded `fixed`
                   # approach). #player-container's old `min-height: 200px` is removed.
                   # Comments updated to point at fitPlayerToViewport() and the new
                   # contract file.
js/scripts.js      # New `fitPlayerToViewport()` function + a `resize` listener + an
                   # initial call, placed alongside the existing hover-reveal setup.
tests/             # tests/viewport-fit.spec.js rewritten to match the shrink-to-fit
                   # behavior (no-overflow checks, width-tracking check) instead of the
                   # earlier pin-to-viewport assertions.
```

**Structure Decision**: Same three-file static app; this is a small, self-contained
resize-driven sizing function plus a couple of supporting CSS fixes — no new files
beyond the test/contract docs, no new architecture.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
