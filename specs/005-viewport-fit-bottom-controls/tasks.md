---

description: "Task list for Bottom Controls Always Fit Within the Browser Window"
---

# Tasks: Bottom Controls Always Fit Within the Browser Window

**Input**: Design documents from `/specs/005-viewport-fit-bottom-controls/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/bottom-controls-viewport-anchor.md, quickstart.md

**Tests**: This repo has a dev-only Playwright suite (`tests/*.spec.js`). This feature adds
new coverage for viewport-anchored positioning; no existing test currently asserts
anything about `#bottom-controls`' positioning (only its opacity/visibility, which is
untouched here), so nothing needs to be rewritten — only added.

**Organization**: Spec.md has a single user story (US1, P1) — no Foundational phase is
needed since there's nothing shared to set up beyond the baseline check.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to US1 from spec.md
- All file paths are relative to the repository root: `css/styles.css`, `tests/`

---

## Phase 1: Setup

- [X] T001 Run the existing Playwright suite (`npm test`) to confirm a clean baseline before making changes. Baseline: 23/23 passing.

**Checkpoint**: Baseline recorded.

---

## Phase 2: User Story 1 - Bottom controls stay reachable on any window size (Priority: P1)

**Goal**: `#bottom-controls` stays pinned to the bottom edge of the browser's viewport at
every window height and scroll position, per `contracts/bottom-controls-viewport-anchor.md`.
The video player's own sizing behavior (Minimal Aesthetic Redesign feature) is untouched.

**Independent Test**: Load a video, resize the browser window to a short height, and
confirm the playback/loop controls stay fully visible and clickable at the bottom of the
window without any scrolling — and that scrolling the page (if the player extends
beyond the fold) never carries the controls away with it.

### Implementation for User Story 1

- [X] T002 [US1] In `css/styles.css`, change `#bottom-controls`'s `position` from `absolute` to `fixed` (keep `bottom: 0; left: 0; right: 0; z-index: 10;` and the existing gradient scrim unchanged). This anchors the controls to the browser viewport instead of to `#player-area`'s box, per `contracts/bottom-controls-viewport-anchor.md`.
- [X] T003 [US1] Add a new test file `tests/viewport-fit.spec.js`: using `page.setViewportSize({ width: 1280, height: 350 })` (a short window) with a video loaded via the existing `openApp`/`loadYouTubeUrlAndGetState` helpers, assert `#bottom-controls`'s `getBoundingClientRect()` places it fully within `[0, viewportHeight]` and that its start/stop button is visible and clickable (`toBeInViewport()` or equivalent), with no scrolling of the page performed. Passes.
- [X] T004 [US1] [P] In the same new file, add a test that scrolls `#main-content` (e.g. `mainContent.evaluate(el => el.scrollTop = el.scrollHeight)`) at the same short viewport size, then re-checks `#bottom-controls`'s bounding rect is unchanged and still within the viewport — proving the fixed positioning is independent of scroll position (depends on T002). Passes.
- [X] T005 [US1] [P] In the same new file, add a test at a normal/tall viewport size (e.g. `1280x900`) confirming the existing behavior is unchanged: no scrolling is needed (`document.documentElement.scrollHeight <= window.innerHeight` for `#main-content`, or equivalent), and `#bottom-controls` still sits at the bottom of the player exactly as before (depends on T002). Passes. Also added a fourth test covering SC-002 (resize doesn't interrupt playback).
- [X] T006 [US1] Manually validate User Story 1 using `quickstart.md` Scenarios 1–4 live in-browser: short-window pinning, scroll independence, normal-window regression check, and loop/playback surviving a resize. Verified live: at a ~1111×614 viewport, `#bottom-controls`' bounding rect bottom exactly equals `window.innerHeight` (confirmed via `getBoundingClientRect()`), and stays equal after forcing `#main-content` to scroll to its max `scrollTop`. Screenshots confirm the controls remain visible as an overlay in front of the (now-cramped) loading controls, and a normal 1400×900 window shows the layout unchanged from before this feature.

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 3: Polish & Cross-Cutting Concerns

- [X] T007 Run the full Playwright suite (`npm test`) after all changes; confirm no regressions (depends on T003, T004, T005). Result: 27/27 passing (23 baseline + 4 new). Stress-tested with `--repeat-each=8`: 216/216 passing, no flakiness.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **User Story 1 (Phase 2)**: Depends only on Setup.
- **Polish (Phase 3)**: Depends on all of User Story 1's tasks.

### Within User Story 1

- T002 → T003 → {T004, T005 in parallel} → T006

### Parallel Opportunities

- T004 and T005 are independent test additions to the same new file but cover disjoint
  scenarios with no shared mutable state within a single test run — can be written in
  parallel once T002/T003 exist, though as `test()` blocks in one file they'll still run
  sequentially within Playwright's own scheduling.

---

## Implementation Strategy

Single user story, no MVP-scoping question — it's one CSS property change plus test
coverage:

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1 (the fix + tests + manual validation)
3. Complete Phase 3: Polish — full regression run
4. **STOP and VALIDATE**: Walk through `quickstart.md` end-to-end in a real browser

---

## Notes

- No Foundational phase — there's only one story and nothing shared to set up beyond
  the baseline check.
- `[P]` is only applied where it's genuinely safe — see the caveat under Parallel
  Opportunities about same-file test additions.
- Commit after each task or logical group, consistent with existing repository practice.
