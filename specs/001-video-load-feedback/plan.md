# Implementation Plan: Video Load Feedback

**Branch**: `001-video-load-feedback` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-video-load-feedback/spec.md`

## Summary

Users currently can't tell whether a video has loaded, and the local-file input isn't
discoverable next to the YouTube URL box. This plan adds a single, persistent load-state
indicator (nothing loaded / loading / ready / failed, shown via icon + text, not color
alone) driven uniformly by the existing `VideoPlayer` class for both YouTube and local-file
playback, plus a visual restyle that makes the YouTube-URL and local-file affordances
read as two distinct, discoverable options. No new dependencies, build steps, or parallel
player-tracking mechanism are introduced — the indicator is wired to `VideoPlayer` itself
so both playback paths report state through the one abstraction that already exists.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES6+) — no transpilation, no build step

**Primary Dependencies**: Remix Icons (CDN) and YouTube IFrame API (CDN) — the two dependencies already in use; this feature adds none

**Storage**: N/A — no persistence; load state is in-memory only and resets on page reload

**Testing**: No automated test framework in this repo; verified manually in-browser per `quickstart.md` (see Development Workflow in the constitution: served via `python3 -m http.server`, not `file://`, since the YouTube IFrame API requires HTTP/HTTPS)

**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge), deployed statically via GitHub Pages

**Project Type**: Single static web page — three-file architecture (`index.html`, `css/styles.css`, `js/scripts.js`); no `src/` tree, no modules

**Performance Goals**: Loading state must appear within 1s of user action (SC-002); indicator/style changes add no perceptible overhead to an already-lightweight page

**Constraints**: Zero build step; no new runtime dependencies; all load-state logic MUST go through the `VideoPlayer` class (Constitution Principle III) rather than reading `youtubePlayer`/`html5Player` directly from feature code; keyboard shortcut mapping (Constitution Principle II) is untouched by this feature

**Scale/Scope**: Single-user, client-side only; no concurrency or multi-user considerations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Zero-Build, CDN-Only Dependencies** — PASS. No new library, framework, or CDN
  resource is added. All work is new markup/CSS/vanilla JS in the existing three files.
- **II. Pedal-Synced Keyboard Shortcuts** — PASS / not applicable. This feature does not
  add, remove, or change any keyboard shortcut. `slowPedalArduino.ino` requires no change.
- **III. VideoPlayer as the Only Player Interface** — PASS, with a required extension.
  Today, YouTube readiness/errors flow through the `YT.Player` `events` config
  (`onReady`, `onStateChange`, `onPlaybackRateChange` — no `onError` registered), while
  HTML5 readiness flows through a `loadedmetadata` listener attached directly to the
  `#html5-player` element in global setup code (no `error` listener registered either).
  Neither path is exposed *through* `VideoPlayer` today. This plan adds `onReady(callback)`
  and `onError(callback)` registration methods to the `VideoPlayer` class itself (see
  `contracts/video-player-interface.md`), and routes the new load-state logic through
  those methods instead of adding a second, parallel way to observe playback state. No
  feature code outside the class will reference `youtubePlayer` or `html5Player` directly.

No violations requiring justification — Complexity Tracking is not needed.

**Post-Phase 1 re-check**: Design artifacts (`research.md`, `data-model.md`,
`contracts/video-player-interface.md`) confirm the approach stays within the three
existing files, adds no dependency, leaves keyboard shortcuts untouched, and channels
all new readiness/error signals through two new `VideoPlayer` methods rather than
exposing `youtubePlayer`/`html5Player` to feature code. All three gates still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-video-load-feedback/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── video-player-interface.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
index.html        # Add load-state indicator markup; restyle the two input-group
                   # blocks (YouTube URL, local file) so they read as distinct affordances
css/styles.css     # Style the new indicator (icon + text per state) and the
                   # restyled input-group affordances; no new stylesheet/file
js/scripts.js      # Extend VideoPlayer with onReady()/onError() hooks; add a small
                   # load-state module (nothing-loaded/loading/ready/failed + 15s
                   # timeout + duplicate-load guard); wire loadVideo()/loadLocalVideo()
                   # and the YT.Player/html5-player event registration to it
```

**Structure Decision**: This is a three-file static app (per the constitution's
"Additional Constraints") — there is no separate frontend/backend or `src/`/`tests/`
split. All changes land directly in the existing `index.html`, `css/styles.css`, and
`js/scripts.js`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Adding `package.json` + Playwright (`node_modules`, npm) as a **devDependency-only** toolchain, violating Principle I's "no build step, package manager, or bundler" | Automated browser tests are needed to verify the load-state indicator (YouTube/local-file/error paths) without a human re-running `quickstart.md` by hand on every change; manual testing already missed a real bug (`onPlayerReady` firing at page load instead of per-video-load) that a test would catch immediately | Continuing with manual-only verification was considered and rejected: it already let a genuine bug ship past `/speckit-implement` undetected. The shipped site itself is unaffected — `index.html`/`css/styles.css`/`js/scripts.js` still have zero runtime dependencies beyond Remix Icons and the YouTube IFrame API, and GitHub Pages deployment ignores `package.json`/`node_modules` entirely. This is scoped as dev-only tooling, not a change to the deployed app, and is recorded here per Governance rather than silently added. |
