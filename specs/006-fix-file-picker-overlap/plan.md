# Implementation Plan: Fix Local File Picker Label Overlap

**Branch**: `006-fix-file-picker-overlap` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-fix-file-picker-overlap/spec.md`

## Summary

The "Choose a file from your computer" control's custom `<label>` ("Select Local
Video") is positioned over the native `<input type="file">` using hardcoded negative
pixel offsets (`left: -170px; margin-right: -120px;`), so it always visually collides
with the native input's own rendered text ("No file chosen", or the selected file's
name) — there's no CSS property that can suppress just that native text while keeping
the native "Choose file" button, so any fixed-offset overlay approach is inherently
fragile. The fix: visually hide the native file input (kept functional/accessible, not
`display: none`), restyle its `<label>` as the sole visible trigger button, and add one
new dedicated element that JavaScript updates with the current file's name (or "No file
chosen") on the input's existing `change` event — the same event `updateLocalFileButtonVisibility()`
already listens to. This removes the overlap structurally rather than tuning offsets.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES6+) — no transpilation, no build step

**Primary Dependencies**: Remix Icons (CDN) and YouTube IFrame API (CDN) — unchanged; this feature adds none

**Storage**: N/A

**Testing**: Playwright (`tests/*.spec.js`, dev-only per the Video Load Feedback feature's
documented Constitution exception). New coverage needed: the displayed filename text
and the label/button text never overlap (via bounding-rect checks) in both the empty
and file-selected states, and that selecting a file updates the displayed name.

**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge), deployed statically via GitHub Pages

**Project Type**: Single static web page — three-file architecture (`index.html`, `css/styles.css`, `js/scripts.js`)

**Performance Goals**: N/A — a few DOM/CSS changes and one small event-handler addition, no measurable runtime cost

**Constraints**: Zero build step; no new dependencies; keyboard shortcuts unchanged
(Constitution Principle II, not touched by this feature at all); no changes to
`VideoPlayer`, `loadLocalVideo()`, or any playback function (Constitution Principle
III) — this only changes how the *already-selected* file's name is displayed, never
how the file is loaded or played

**Scale/Scope**: Single-user, client-side only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Zero-Build, CDN-Only Dependencies** — PASS. No new dependency; this is a small
  HTML/CSS restructuring plus one JS event-handler addition using only native DOM APIs
  (`input.files[0].name`, already-available browser features).
- **II. Pedal-Synced Keyboard Shortcuts** — PASS / not applicable. No shortcut key or
  behavior is touched.
- **III. VideoPlayer as the Only Player Interface** — PASS. No touch point in
  `VideoPlayer`, `loadLocalVideo()`, or any load-state function — this only changes how
  the file's name is *displayed* before loading is even triggered; `loadLocalVideo()`
  itself is untouched.

No violations requiring justification — Complexity Tracking is not needed.

**Post-Phase 1 re-check**: Design artifacts confirm the change is confined to
`index.html` (restructure the local-file control's markup), `css/styles.css` (hide the
native input, style the label as a button, style the new filename element), and
`js/scripts.js` (one small addition to the existing `change`-event handler). No new
dependency, no touch point in `VideoPlayer` or any playback function. All three gates
still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-file-picker-overlap/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

(No `contracts/` — this feature has no new interface/contract; it's a presentation
fix to existing, already-documented local-file-loading markup with no new seam other
projects/features need to depend on.)

### Source Code (repository root)

```text
index.html         # Restructure the "Choose a file from your computer" control:
                   # keep the native <input type="file">, restyle its <label> as the
                   # visible trigger button, add one new element to display the
                   # current filename status (replacing the old overlapping label
                   # positioning).
css/styles.css     # Visually hide the native file input (not display:none — stays
                   # functional/accessible); style the label as a button; style the
                   # new filename-status element (including long-filename overflow
                   # handling); remove the old hardcoded negative-offset positioning.
js/scripts.js      # Extend the existing `change` listener on #local-video-file
                   # (already calls updateLocalFileButtonVisibility()) to also update
                   # the new filename-status element's text. No change to
                   # loadLocalVideo() or any VideoPlayer method.
tests/             # Add coverage (new spec file or an addition to an existing one)
                   # asserting no text overlap in both states, and that the
                   # displayed filename updates on selection.
```

**Structure Decision**: Same three-file static app; this is a small, targeted
presentation fix — no new files beyond the test/spec docs, no new architecture.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
