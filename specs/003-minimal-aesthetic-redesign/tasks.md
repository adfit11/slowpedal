---

description: "Task list for Minimal Aesthetic Redesign"
---

# Tasks: Minimal Aesthetic Redesign

**Input**: Design documents from `/specs/003-minimal-aesthetic-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/control-overlay-behavior.md, quickstart.md

**Tests**: This repo has a dev-only Playwright suite (`tests/*.spec.js`). Existing specs don't depend on control layout/visibility (only element presence and load-state values), so they should be unaffected — Polish adds new coverage for the hide/reveal mechanism itself and the logo pixel-identity guarantee.

**Organization**: Both user stories in spec.md are Priority P1. US1 (hide/reveal + player growth) and US2 (palette refresh) are conceptually independent, but both make extensive edits to `css/styles.css`, so tasks are sequenced US1 → US2 to avoid rework, even though either could in principle be validated on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to US1 or US2 from spec.md
- All file paths are relative to the repository root: `index.html`, `css/styles.css`, `js/scripts.js`, `tests/`

## Path Conventions

Same three-file static app as prior features, plus the existing dev-only `tests/` directory.

---

## Phase 1: Setup

**Purpose**: Establish a pre-change reference point for what is a large visual rewrite.

- [X] T001 Run the existing Playwright suite (`npm test`) to confirm a clean baseline, and take a few manual screenshots of the current site (empty state, and with a video loaded) to serve as a "before" reference during the redesign. Baseline: 17/17 passing; before-screenshot captured.

**Checkpoint**: Baseline recorded; ready to modify `css/styles.css`, `index.html`, `js/scripts.js`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure both user stories build on.

**⚠️ CRITICAL**: Both user stories depend on this phase.

- [X] T002 Define CSS custom properties at `:root` in `css/styles.css` for the new palette, derived from `img/slowLogo.png`'s existing dark-navy/off-white two-tone design plus one muted accent color (e.g. `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`), per research.md. Do not yet apply them anywhere — this task only establishes the shared source of truth.

  Defined: `--color-bg` (#1c1b22), `--color-surface` (#2a2933), `--color-surface-translucent`, `--color-text` (#f2efe9), `--color-text-muted`, `--color-border`, `--color-accent` (#e2483d) + `--color-accent-hover`, plus three functional (non-brand) status colors `--color-state-loading/ready/failed` for the existing load-state indicator.
- [X] T003 Add the `body.state-ready` class toggle to the three existing load-state functions in `js/scripts.js` per contracts/control-overlay-behavior.md: `setLoadReady()` adds the class, `setLoadLoading()` and `setLoadFailed()` remove it. This is the only touch point in existing load-state logic this feature requires — `VideoPlayer`, `loadVideo()`, and `loadLocalVideo()` are not modified.

**Checkpoint**: Palette variables and the state-driven class both exist — User Story 1 and User Story 2 can both begin.

---

## Phase 3: User Story 1 - Practice with an unobstructed, maximized video player (Priority: P1)

**Goal**: Once a video is "ready," the loading and playback controls hide (reclaiming real layout space, not just fading), revealing on hover per-zone with a delayed hide; the header, timeline, and all existing functionality are unaffected; the player grows to fill the reclaimed space up to a generous cap.

**Independent Test**: Load a video, stop interacting, and confirm the player grows into the space the controls used to occupy, with the header and timeline still visible. Hover the top/bottom edges and confirm each control group reveals/hides independently. Confirm every keyboard shortcut still works with controls hidden.

### Implementation for User Story 1

- [X] T004 [US1] Restructure `#top-controls` in `index.html`/`css/styles.css` into an absolutely-positioned hotzone overlay spanning the top edge of the enlarged player area, containing the existing load-state indicator and both video-source groups unchanged internally (depends on T002). Moved out of `<header>` into a new `#player-area` wrapper (required — hiding it while still nested in the header row wouldn't free up any vertical space for the player).
- [X] T005 [US1] Restructure `#bottom-controls` similarly into a bottom-anchored hotzone overlay containing the existing transport buttons and loop-inputs unchanged internally (depends on T002). Moved into the same `#player-area` wrapper as T004.
- [X] T006 [US1] Add CSS rules gating both overlays' visibility: implemented as `body.state-ready #top-controls > *` / `#bottom-controls > *` (fading direct children, not the hotzone container itself, so the container keeps normal pointer-events for hover detection even while hidden) with `.revealed` overriding back to visible (depends on T003, T004, T005).
- [X] T007 [US1] Add `mouseenter`/`mouseleave` listeners in `js/scripts.js` for the top and bottom hotzones: `mouseenter` cancels any pending hide timer and adds `.revealed` immediately; `mouseleave` starts a ~500–800ms timer that removes `.revealed` when it fires. The two zones' timers are independent (depends on T004, T005, T006). Implemented as a shared `initControlZoneHover(zoneId)` helper called once per zone (600ms hide delay), rather than duplicating the listener logic twice.
- [X] T008 [US1] Increase `#player-container`'s `max-width` from 900px to a generous cap (research.md suggests 1400–1600px as a starting point, to be tuned visually) and adjust the surrounding layout so the player fills available vertical space once the overlays no longer reserve flow space (depends on T004, T005). Set to 1500px (matched on `#timeline-container` too, which already shared this value); `#player-area` added as a `flex:1` column-centered container so the player expands into available vertical space.
- [X] T009 [US1] Verify `header` and `#timeline-container` remain ordinary, always-visible flow elements with no new classes or hide logic applied to them, and that the new overlay positioning for T004/T005 doesn't visually overlap or clip them (depends on T004, T005, T008). Confirmed visually — header (logo, About/Build) and the timeline strip stay visible throughout every state.
- [X] T010 [US1] Manually validate User Story 1 using `quickstart.md` Scenarios 1–6 (default visible state, loading-controls hide/reveal, playback-controls hide/reveal regardless of play state, keyboard shortcuts unaffected, auto-restore on new load/failure, header/timeline always visible). All verified live in-browser with a real YouTube video: hide-on-ready, hover-reveal (both zones, independently), keyboard shortcut ('s' → speed 100→110) works while controls are hidden, and a failed reload automatically restores the loading controls without hover.

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - A modern, clean, minimal visual style (Priority: P1)

**Goal**: The site reads as a cohesive, modern, monochrome-based dark design derived from the existing logo, with the current bright per-button rainbow replaced — while the logo image itself stays pixel-identical.

**Independent Test**: Show the page (with no video loaded, so User Story 1's behavior isn't a factor) to someone and confirm they describe it as modern/clean/minimal, and confirm the logo is visually unchanged.

### Implementation for User Story 2

- [X] T011 [US2] Apply the new palette (via the T002 custom properties) to `body`'s background and the header, replacing the light-grey `#f0f0f0` body background and refining the header's existing dark tone for consistency (depends on T002).
- [X] T012 [US2] Restyle the transport/loop buttons (play-pause, speed up/down, loop shift/length/set/control) to the new monochrome palette, removing the current per-button rainbow (blue/green/red/yellow), reserving the single accent color for one clear point of emphasis per research.md (depends on T002; sequenced after T005/T006 to avoid conflicting edits to `#bottom-controls` CSS). Start/pause is the one accent-colored button at rest; all others are neutral `--color-surface` with the accent used as shared hover feedback.
- [X] T013 [US2] Restyle the remaining smaller elements — video-source input groups, the "Load" trigger buttons, the load-state indicator, and the About modal — to match the refreshed palette, preserving all existing labels/text and functionality (depends on T002; sequenced after T004/T006 for the same reason as T012). Also darkened the YouTube-URL/local-file text inputs and the manual speed/loop entry fields, and the tooltip styling, for full cohesion — these weren't explicitly called out in the task but were clearly part of "restyle the remaining smaller elements."
- [X] T014 [US2] Confirm `img/slowLogo.png` itself is untouched by this feature (e.g. `git status`/`git diff --stat img/slowLogo.png` shows no change) — this feature only restyles surrounding CSS, never the logo file. Confirmed: no diff.
- [ ] T015 [US2] Manually validate User Story 2 using `quickstart.md` Scenario 7 (overall visual style) and the logo pixel-identity check from Scenario 8. **Partially done**: the logo pixel-identity check is covered (T014's `git diff` check, plus the automated SHA-256 test in T017). The qualitative "does it look modern/clean" visual check could not be completed — the browser automation tool became unavailable (transient outage) partway through this session, after User Story 1's behavior was already visually confirmed but before a full-page look at the applied palette. Code review confirms all old hardcoded colors were migrated to the new palette variables (`grep` found zero leftover instances), but this needs a live look before considering the feature fully done.

**Checkpoint**: Both User Stories are independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Automated coverage for the new behavior, and a final regression pass.

- [X] T016 [P] Add `tests/minimal-redesign.spec.js`: toggling `loadState` to "ready" (via the existing `loadYouTubeUrlAndGetState`-style direct call) applies `body.state-ready` and hides both control overlays (checked via computed opacity or the `.revealed`/`state-ready` class, not literal pixel comparison); dispatching `mouseenter`/`mouseleave` on each hotzone reveals/hides it independently of the other; a load failure or new load while "ready" restores visibility without needing hover; the header and timeline remain visible throughout. Used `expect(...).toHaveCSS('opacity', ...)` (auto-retrying) rather than a one-shot computed-style read, since the ~250ms CSS transition made one-shot reads flaky.
- [X] T017 [P] Add a logo pixel-identity check to `tests/minimal-redesign.spec.js` or a small Node script: compare `img/slowLogo.png`'s file hash before/after (or simply assert `git diff` reports no change), guarding SC-005 going forward. Implemented as a SHA-256 hash comparison against a golden value computed from the current (confirmed-untouched) file.
- [X] T018 Run the full Playwright suite (`npm test`) after all changes; confirm no regressions in the existing specs (T016/T017 depend on T006/T007 and T014 respectively; T018 depends on all prior tasks). Result: 21 tests, stress-tested at 8x repeats (168/168 passing).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks both user stories.
- **User Story 1 (Phase 3)** and **User Story 2 (Phase 4)**: Both depend on Foundational. Conceptually independent of each other, but US2's tasks that touch `#top-controls`/`#bottom-controls`-adjacent styling (T012, T013) are sequenced after US1's structural changes to those same regions (T004–T006) to avoid conflicting edits within `css/styles.css`.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### Within Each User Story

- User Story 1: T004 & T005 (parallel-ish, same file but different rule blocks) → T006 → T007 → T008 → T009 → T010
- User Story 2: T011 (parallel with US1) → T012 & T013 (after US1's T004–T006) → T014 → T015

### Parallel Opportunities

- T004 and T005 (top vs. bottom overlay) touch different, non-overlapping sections of `css/styles.css`/`index.html` and can be done alongside each other.
- T011 (body/header palette) has no dependency on US1's structural work and can proceed in parallel with all of Phase 3.
- T016 and T017 (Polish) are independent test additions and can run alongside each other.

---

## Parallel Example: Foundational → User Stories

```bash
# After Foundational (T002, T003), these can proceed together:
Task: "Restructure #top-controls into a hover-reveal overlay (US1: T004)"
Task: "Apply the new palette to body/header (US2: T011)"
```

---

## Implementation Strategy

### Both Stories Are P1 — Land Together

Same as the Video Load Feedback feature's precedent for equally-weighted P1 stories:
shipping only the layout/hide-reveal behavior (US1) without the palette refresh (US2),
or vice versa, would leave the redesign visibly half-finished. Both are expected in the
same change:

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (palette variables, state-ready class wiring)
3. Complete Phase 3 (US1) — structural/behavioral changes first, since Phase 4 depends on them for two tasks
4. Complete Phase 4 (US2) — palette application
5. Complete Phase 5: Polish — new automated coverage, full regression run
6. **STOP and VALIDATE**: Walk through `quickstart.md` end-to-end in a real browser

### Parallel Team Strategy

With two contributors:

- Contributor A: Foundational (Phase 2) → User Story 1 structural work (T004–T010)
- Contributor B: User Story 2's body/header palette (T011) immediately after Foundational, then waits for A's T004–T006 before doing T012/T013
- Either contributor: Polish (Phase 5), once both stories land

---

## Notes

- `[P]` is only applied where the files/regions genuinely differ and there's no
  ordering dependency; most `css/styles.css` tasks are otherwise sequenced to avoid
  conflicting edits to the same rule blocks.
- No test-framework setup tasks are included; the Playwright suite already exists.
  This feature only adds new spec coverage for behavior that didn't exist before.
- Commit after each task or logical group, consistent with existing repository practice.
