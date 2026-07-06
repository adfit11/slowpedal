# Implementation Plan: Intuitive Video Load Trigger

**Branch**: `002-auto-load-video` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-auto-load-video/spec.md`

## Summary

Pasting a YouTube URL or selecting a local file currently does nothing visible until the
user also clicks a small, unlabeled round button next to the input — the exact problem
reported. This plan removes both buttons and wires the existing `loadVideo()` /
`loadLocalVideo()` functions (unchanged internally, still built on the Video Load Feedback
feature's `VideoPlayer` hooks and load-state machine) to fire automatically: instantly on
paste, after a ~500ms typing pause for manual entry, and immediately on file selection.
No new dependencies, no change to what happens once a load starts — only what starts it.

> **Revision (2026-07-06, post-implementation)** — see spec.md's Revision section. Real
> testing surfaced a black-screen-after-load bug (fixed by switching `loadVideo()` from
> `loadVideoById()` + `pause()` to `cueVideoById()`) and confirmed pure auto-load was still
> confusing without a deliberate trigger action. The approach below (auto-load, buttons
> removed) was superseded: both buttons are restored, hidden until their input has
> content, then appear. Sections below describe the original approach for the historical
> record; the actual shipped behavior is the appearing-button model.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES6+) — no transpilation, no build step

**Primary Dependencies**: Remix Icons (CDN) and YouTube IFrame API (CDN) — unchanged; this feature adds none

**Storage**: N/A — no persistence; reuses the existing in-memory `loadState`/`loadReason` from the Video Load Feedback feature

**Testing**: Playwright (`tests/*.spec.js`), established as a dev-only Constitution Principle I
exception in the Video Load Feedback feature's plan.md — no new exception needed here, but
the existing suite currently drives loads via `#load-video`/`#load-local-video` button
clicks, which this feature removes. Those tests MUST be updated to use the new triggers
(fill+debounce, paste event, file selection) or they will fail immediately after this change.

**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge), deployed statically via GitHub Pages

**Project Type**: Single static web page — three-file architecture (`index.html`, `css/styles.css`, `js/scripts.js`)

**Performance Goals**: Paste-triggered load starts instantly (no artificial delay); typed-URL load starts ~500ms after the last keystroke (SC-003, SC-005); local-file load starts immediately on selection (SC-002, SC-004)

**Constraints**: Zero build step; no new runtime dependencies; all loading still goes through the unchanged `loadVideo()`/`loadLocalVideo()` functions and the `VideoPlayer` class (Constitution Principle III); keyboard shortcut mapping (Principle II) untouched; the four load states, 15s timeout, and duplicate-load guard from the Video Load Feedback feature are reused as-is (FR-005)

**Scale/Scope**: Single-user, client-side only; no concurrency considerations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Zero-Build, CDN-Only Dependencies** — PASS. No new dependency is added. The
  dev-only Playwright suite already exists as a documented exception (Video Load Feedback
  plan.md Complexity Tracking) — this feature only updates existing test files, it doesn't
  introduce new tooling, so no new Complexity Tracking entry is needed.
- **II. Pedal-Synced Keyboard Shortcuts** — PASS / not applicable. No keyboard shortcut is
  added, removed, or changed.
- **III. VideoPlayer as the Only Player Interface** — PASS. `loadVideo()` and
  `loadLocalVideo()` are unchanged internally (they already route through `VideoPlayer`
  and the load-state hooks). This feature only changes what *calls* them — new `input`/
  `paste` listeners on `#video-url` and a `change` listener on `#local-video-file` — no
  code touches `youtubePlayer`/`html5Player` directly.

No violations requiring justification — Complexity Tracking is not needed.

**Post-Phase 1 re-check**: Design artifacts confirm the approach only adds event listeners
and removes two buttons/their now-dead CSS class; no dependency, no new architecture, no
principle at risk. All three gates still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-auto-load-video/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── auto-load-triggers.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
index.html        # Remove the #load-video and #load-local-video buttons; the
                   # #video-url input and #local-video-file input remain as-is
css/styles.css     # Remove the now-dead .action-button.red-button rule (only ever
                   # used by the two removed buttons)
js/scripts.js      # Add debounced input/paste handling for #video-url and a change
                   # listener for #local-video-file; loadVideo()/loadLocalVideo()
                   # themselves are NOT modified — only what invokes them changes
tests/             # Update existing specs (load-state, discoverability,
                   # failure-recovery, regression) to trigger loads via the new
                   # auto-load mechanism instead of clicking the removed buttons
```

**Structure Decision**: Same three-file static app as the Video Load Feedback feature;
this change is additive/subtractive within the existing files, plus updates to the
already-established dev-only test suite.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
