# Implementation Plan: Minimal Aesthetic Redesign

**Branch**: `003-minimal-aesthetic-redesign` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-minimal-aesthetic-redesign/spec.md`

## Summary

The site currently mixes a dark header, a light-grey body background, and bright
per-button accent colors (blue/green/red/yellow) on the transport controls — while the
logo itself is already a clean two-tone dark-navy/off-white design. This plan extends
the logo's existing monochrome palette across the whole page, and restructures the
loading controls and playback/loop controls from normal document flow into hover-revealed
overlays anchored to the top and bottom of an enlarged player area — so hiding them
actually reclaims layout space for the player, not just visual opacity. The header and
timeline stay in normal flow, always visible, unaffected. No new dependencies; `loadVideo()`/
`loadLocalVideo()`/`VideoPlayer` are untouched — this is a CSS/HTML/small-JS-glue change.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES6+) — no transpilation, no build step

**Primary Dependencies**: Remix Icons (CDN) and YouTube IFrame API (CDN) — unchanged; this feature adds none, including no web-font CDN (stays on the existing system font stack)

**Storage**: N/A — no persistence; hover-reveal state is transient UI state, reset on page reload

**Testing**: Playwright (`tests/*.spec.js`, dev-only per the Video Load Feedback feature's
documented Constitution exception). This feature adds tests for: the reveal/hide CSS-class
toggling on hover, the state-driven default-hidden-when-ready behavior, and a pixel-identity
check on the logo image. Visual/aesthetic quality itself (SC-004, "looks modern") is
inherently a human-judgment criterion and isn't automated.

**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge), deployed statically via GitHub Pages

**Project Type**: Single static web page — three-file architecture (`index.html`, `css/styles.css`, `js/scripts.js`)

**Performance Goals**: Hide/reveal transitions are smooth CSS opacity/transform transitions (~200–300ms), no layout thrash; hover response feels instant (no added debounce on the reveal edge, only on the hide-after-leave edge per FR-007/FR-010)

**Constraints**: Zero build step; no new runtime dependencies; logo image file byte-identical;
keyboard shortcuts (Constitution Principle II) unchanged; all playback/loop/load logic
continues to route through the existing `VideoPlayer` class and load-state functions
(Constitution Principle III) — this feature only adds presentation-layer CSS classes and
hover listeners, never new playback logic

**Scale/Scope**: Single-user, client-side only; desktop/mouse-first (touch-reveal fallback explicitly out of scope per spec Assumptions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Zero-Build, CDN-Only Dependencies** — PASS. No new dependency of any kind
  (including fonts). Pure CSS/HTML restructuring plus a small amount of vanilla JS to
  toggle hover/state classes.
- **II. Pedal-Synced Keyboard Shortcuts** — PASS. FR-014 explicitly forbids changing the
  key mapping; this feature only changes whether controls are visible, never what keys do.
- **III. VideoPlayer as the Only Player Interface** — PASS. The hide/reveal logic hooks
  into the *existing* `setLoadLoading()`/`setLoadReady()`/`setLoadFailed()` functions
  (adding one class-toggle line to each) to drive the "hidden only when ready" behavior —
  it does not add new methods to `VideoPlayer` or reach into `youtubePlayer`/`html5Player`.
  Hover-driven reveal/hide is pure DOM/CSS, entirely outside the player abstraction.

No violations requiring justification — Complexity Tracking is not needed.

**Post-Phase 1 re-check**: Design artifacts (below) confirm the approach stays within
the three existing files plus test updates, introduces no dependency, and the one touch
point in `js/scripts.js`'s existing load-state functions is a single class-toggle per
function — not a new capability on `VideoPlayer`. All three gates still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/003-minimal-aesthetic-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── control-overlay-behavior.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
index.html        # No new elements needed beyond what exists; #top-controls and
                   # #bottom-controls become hover-revealed overlay regions; #timeline-container
                   # stays in normal flow; header markup unchanged (only restyled)
css/styles.css     # Full palette refresh (dark monochrome derived from the logo);
                   # #top-controls/#bottom-controls repositioned to absolute overlays
                   # anchored to the enlarged player area, with opacity/pointer-events
                   # driven by a `.controls-hidden` (state) and `.revealed` (hover) class;
                   # #player-container's max-width increased to a generous cap and its
                   # container restructured to fill available vertical space
js/scripts.js      # Add mouseenter/mouseleave listeners on the two control zones
                   # (instant reveal, delayed hide per FR-007/FR-010); add one class-toggle
                   # line each to setLoadLoading()/setLoadReady()/setLoadFailed() to drive
                   # the "hidden only when ready" state (FR-005/FR-006/FR-008). No changes
                   # to VideoPlayer, loadVideo(), or loadLocalVideo().
tests/             # New: tests/minimal-redesign.spec.js for the reveal/hide behavior and
                   # logo pixel-identity check. Existing specs are unaffected (they don't
                   # depend on control layout/visibility, only on element presence/state).
```

**Structure Decision**: Same three-file static app; this feature is scoped to
`css/styles.css` (majority of the change), small additions to `js/scripts.js`, and no
structural changes to `index.html` beyond what's already there.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
