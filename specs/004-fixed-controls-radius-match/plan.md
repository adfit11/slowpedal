# Implementation Plan: Persistent Bottom Controls and Matching Status Radius

**Branch**: `004-fixed-controls-radius-match` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-fixed-controls-radius-match/spec.md`

## Summary

Two small, independent amendments to the Minimal Aesthetic Redesign feature: (1) the
bottom playback/loop controls (`#bottom-controls`) stop hiding/fading — they keep their
current overlay position and scrim, they just no longer participate in the
`body.state-ready` hide rule or the hover-reveal wiring; the top loading controls are
untouched. (2) the load-state indicator's `border-radius` (currently `20px`, pill-shaped)
is changed to match the video-source boxes' `border-radius` (`8px`), both driven by one
shared CSS custom property so they can't drift apart again.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES6+) — no transpilation, no build step

**Primary Dependencies**: Remix Icons (CDN) and YouTube IFrame API (CDN) — unchanged; this feature adds none

**Storage**: N/A

**Testing**: Playwright (`tests/*.spec.js`, dev-only per the Video Load Feedback feature's
documented Constitution exception). `tests/minimal-redesign.spec.js` has an existing test
asserting `#bottom-controls` hides when `state-ready` — that assertion must be removed/
updated since it now contradicts this feature's FR-001. New coverage is needed for
"bottom controls always visible" and the radius match.

**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge), deployed statically via GitHub Pages

**Project Type**: Single static web page — three-file architecture (`index.html`, `css/styles.css`, `js/scripts.js`)

**Performance Goals**: N/A — pure CSS/small-JS removal, no new runtime cost

**Constraints**: Zero build step; no new dependencies; keyboard shortcuts unchanged
(Constitution Principle II); no changes to `VideoPlayer`, `loadVideo()`, or
`loadLocalVideo()` (Constitution Principle III) — this touches only the presentation
layer added by the Minimal Aesthetic Redesign feature

**Scale/Scope**: Single-user, client-side only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Zero-Build, CDN-Only Dependencies** — PASS. No new dependency; removes a small
  amount of existing CSS/JS, adds one shared CSS custom property.
- **II. Pedal-Synced Keyboard Shortcuts** — PASS / not applicable. No shortcut is
  touched — the buttons this feature affects already respond to the same keys
  regardless of visibility; this only changes whether they're visible.
- **III. VideoPlayer as the Only Player Interface** — PASS. No touch point in
  `VideoPlayer`, `loadVideo()`, `loadLocalVideo()`, or the load-state functions at all
  — this feature only removes a CSS rule scope and a JS hover-listener registration
  that were themselves pure presentation additions from the prior feature.

No violations requiring justification — Complexity Tracking is not needed.

**Post-Phase 1 re-check**: Design artifacts confirm the change is a subtractive CSS/JS
edit (removing `#bottom-controls` from the state-gated hiding rule and removing its
hover-listener registration) plus one shared radius variable — no dependency, no new
architecture. All three gates still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/004-fixed-controls-radius-match/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

(No `contracts/` — this feature has no new interface/contract; it removes a `.revealed`/
`state-ready` consumer for one zone and unifies a CSS value. The existing
`contracts/control-overlay-behavior.md` from feature 003 is updated in place instead of
duplicated.)

### Source Code (repository root)

```text
css/styles.css     # Remove `body.state-ready #bottom-controls > *` / `.revealed` rules
                   # (both moot once bottom-controls no longer hides); add a shared
                   # `--radius-panel` custom property; apply it to both
                   # `.load-state-indicator` and `.video-source`
js/scripts.js      # Remove the `initControlZoneHover('bottom-controls')` call (the
                   # top zone's call is untouched); the shared `initControlZoneHover`
                   # function itself stays, since #top-controls still uses it
tests/             # Update tests/minimal-redesign.spec.js: remove/rewrite the
                   # assertion that #bottom-controls hides when ready; add coverage
                   # for "always visible" and the radius match
```

**Structure Decision**: Same three-file static app; this is a small, targeted
subtractive edit to feature 003's CSS/JS plus one new shared variable, not a new
architecture.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
