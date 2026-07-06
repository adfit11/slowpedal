---

description: "Task list for Intuitive Video Load Trigger"
---

# Tasks: Intuitive Video Load Trigger

> **Revision (2026-07-06, post-implementation)**: T001–T014 below implemented the
> original auto-load design and all passed their validation at the time. Real
> browser testing afterward found it insufficient — see spec.md's Revision
> section and the new **Phase 7: Revision** at the end of this file, which
> documents what was actually changed (a black-screen-after-load fix, and
> replacing auto-load with appearing "Load" buttons). T001–T014 are left
> checked as an accurate record of that first pass; do not redo them.

**Input**: Design documents from `/specs/002-auto-load-video/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auto-load-triggers.md, quickstart.md

**Tests**: This repo has a dev-only Playwright suite (`tests/*.spec.js`, established in the Video Load Feedback feature). This feature must update it, not just extend it — see Polish phase.

**Organization**: Both user stories in spec.md are Priority P1 (the reported problem applies equally to both inputs). Tasks are grouped by story so each is independently deliverable; either alone fixes half the reported problem.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to US1 or US2 from spec.md
- All file paths are relative to the repository root: `index.html`, `css/styles.css`, `js/scripts.js`, `tests/`

## Path Conventions

Same three-file static app as the Video Load Feedback feature, plus the existing dev-only `tests/` directory (Playwright).

---

## Phase 1: Setup

**Purpose**: Establish a pre-change reference point.

- [X] T001 Run the existing Playwright suite (`npm test`) to record the current pass/fail state before making any changes — several existing specs click the buttons this feature removes and are expected to break until Polish phase fixes them. Baseline: 13/13 passing.

**Checkpoint**: Baseline recorded; ready to modify source files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared trigger-tracking state both user stories reference, per `data-model.md`.

**⚠️ CRITICAL**: Both user stories depend on this phase.

- [X] T002 Add module-level `lastAutoLoadedVideoId` (initially `null`) and `urlDebounceTimeoutId` (initially `null`) variables in `js/scripts.js`, per `data-model.md`.

**Checkpoint**: Shared trigger state exists — User Story 1 and User Story 2 can both begin.

---

## Phase 3: User Story 1 - Load a YouTube video without a hidden step (Priority: P1)

**Goal**: Pasting or typing a valid YouTube URL loads the video automatically — instantly on paste, after a ~500ms pause when typed — with no button to discover.

**Independent Test**: Give the page to someone unfamiliar with it and ask them to practice with a specific YouTube video. Confirm they get it loading without being told about any button.

### Implementation for User Story 1

- [X] T003 [US1] Remove the `document.getElementById('load-video').addEventListener('click', loadVideo)` registration in `js/scripts.js`. Do this **before** T004 so there's no intermediate state where JS tries to bind a removed DOM element (which would throw and could halt the rest of the script's top-level setup).
- [X] T004 [US1] Remove the `#load-video` button markup from `index.html` (depends on T003).
- [X] T005 [US1] Add an `input` event listener on `#video-url` in `js/scripts.js` per `contracts/auto-load-triggers.md`: if `event.inputType === 'insertFromPaste'`, call `loadVideo()` immediately; otherwise clear/reschedule `urlDebounceTimeoutId` for a ~500ms delay before calling `loadVideo()`. Before calling, extract the video ID from the field and skip the call if it equals `lastAutoLoadedVideoId`; otherwise update `lastAutoLoadedVideoId` after a successful extraction. `loadVideo()` itself is not modified (depends on T002, T003).
- [X] T006 [US1] Manually validate User Story 1 using `quickstart.md` Scenarios 1, 2, 3, 4, and 7 (instant load on paste, debounced load on typing, partial input never loads, replacing a previous video, no redundant reload from an inconsequential edit). Verified in-browser: typing a valid URL auto-loads to "Ready" with no button present (Scenario 2). Full coverage of all 5 scenarios (including the paste-specific and dedup paths) is captured deterministically by the new `tests/auto-load-trigger.spec.js` in Polish (T013).

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Load a local video file in one step (Priority: P1)

**Goal**: Selecting a local file loads it immediately — no second click.

**Independent Test**: Ask an unfamiliar user to practice with a video file from their computer. Confirm it loads as soon as they finish selecting it in the OS file picker.

### Implementation for User Story 2

- [X] T007 [US2] Remove the `document.getElementById('load-local-video').addEventListener('click', loadLocalVideo)` registration in `js/scripts.js`, for the same reason/ordering as T003. (Removed together with T003 in one edit, before either button's markup was removed.)
- [X] T008 [US2] Remove the `#load-local-video` button markup from `index.html` (depends on T007).
- [X] T009 [US2] Add a `change` event listener on `#local-video-file` in `js/scripts.js` per `contracts/auto-load-triggers.md`: call `loadLocalVideo()` immediately and reset `lastAutoLoadedVideoId` to `null` (so a later YouTube paste for a previously-loaded video isn't mistakenly skipped as unchanged). `loadLocalVideo()` itself is not modified (depends on T002, T007).
- [X] T010 [US2] Manually validate User Story 2 using `quickstart.md` Scenarios 5 and 6 (immediate load on selection, replacing a previous file). Verified in-browser: `#load-local-video` button no longer renders, no console errors. Full behavioral coverage (selecting a file actually auto-loads it) is captured deterministically by `tests/auto-load-trigger.spec.js` and the fixed `tests/load-state.spec.js` in Polish (T012/T013), using the same generated-tiny-video approach as the Video Load Feedback feature's suite.

**Checkpoint**: Both User Stories are independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Clean up now-dead styling, fix the tests this feature breaks, add coverage for the new trigger behavior, and confirm no regressions.

- [X] T011 [P] Remove the now-dead `.action-button.red-button` CSS rule in `css/styles.css` — it was only ever used by the two buttons removed in T004/T008 (depends on T004, T008).
- [X] T012 [P] Fix the existing Playwright tests broken by button removal (depends on T009). Actual scope was larger than originally estimated — a full `grep -rn 'load-video\|load-local-video' tests/` turned up **four** call sites, not two:
  - `tests/load-state.spec.js`: removed the `page.click('#load-local-video')` call (file selection alone now triggers the load); replaced a direct `page.fill` + `page.click('#load-video')` pair with the `loadYouTubeUrlAndGetState` helper.
  - `tests/failure-recovery.spec.js`: replaced two direct `page.fill` + `page.click('#load-video')` pairs with `loadYouTubeUrlAndGetState`; removed the `page.click('#load-local-video')` call; dropped the now-unused `getLoadState` import.
  - `tests/regression.spec.js`: replaced a direct `page.fill` + `page.click('#load-video')` pair with `loadYouTubeUrlAndGetState` — this file was incorrectly assumed clean when this task was originally written.
  - `tests/discoverability.spec.js`: confirmed clean, no changes needed (it never clicked either button).
- [X] T013 Add `tests/auto-load-trigger.spec.js` covering the new trigger mechanism itself: pasting triggers instantly (dispatch a synthetic `input` event with `inputType: 'insertFromPaste'` via `page.evaluate` rather than relying on OS clipboard integration), typed input triggers only after the ~500ms debounce (dispatched with `inputType: 'insertText'`), partial/invalid typed input never loads, an edit that doesn't change the extracted video ID doesn't trigger a reload, and neither `#load-video` nor `#load-local-video` exists in the DOM anymore (depends on T005, T009). One initial assertion (polling for the ~50ms-wide transient "loading" state mid-debounce) was too tight to poll reliably and was simplified to check the eventual "ready" outcome instead — stress-tested at 10x repeats (60 runs), all passing.
- [X] T014 Run the full Playwright suite (`npm test`) after all changes; confirm everything passes with no regressions (depends on T012, T013). Result: 19 tests, stress-tested at 5x repeats (95/95 passing). Note: `tests/regression.spec.js` *did* need a fix (see corrected T012 note above) — the original assumption it was clean was wrong.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks both user stories.
- **User Story 1 (Phase 3)** and **User Story 2 (Phase 4)**: Both depend only on Foundational — independent of each other, can proceed in parallel.
- **Polish (Phase 5)**: T011 and T012 each depend on both stories being complete (they touch shared CSS / cross-story test files); T013 depends on both stories' new listeners existing; T014 depends on T012 and T013.

### Within Each User Story

- User Story 1: T003 → T004 → T005 → T006
- User Story 2: T007 → T008 → T009 → T010

### Parallel Opportunities

- User Story 1 (Phase 3) and User Story 2 (Phase 4) can be worked on in parallel by two contributors — different inputs, different buttons, no shared files until Polish.
- T011 (CSS) and T012 (test fixes) can run alongside each other within Polish — different files.

---

## Parallel Example: User Stories 1 & 2

```bash
# After Foundational (T002), these can proceed independently:
Task: "Remove #load-video wiring and add auto-load input listener (US1: T003-T005)"
Task: "Remove #load-local-video wiring and add auto-load change listener (US2: T007-T009)"
```

---

## Implementation Strategy

### Both Stories Are P1 — No Single MVP Slice

Unlike a typical P1/P2/P3 spread, both stories here directly fix the one reported problem
(for the two different input types). Shipping just one story still leaves half the
original complaint unresolved, so both are expected to land together:

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (shared trigger-state variables)
3. Complete Phase 3 (US1) and Phase 4 (US2) — in parallel if staffed, or sequentially
4. Complete Phase 5: Polish — dead CSS removal, test fixes, new trigger-specific tests
5. **STOP and VALIDATE**: Run `quickstart.md` end-to-end, then the full Playwright suite

### Parallel Team Strategy

With two contributors:

- Contributor A: Foundational (Phase 2) → User Story 1 (Phase 3)
- Contributor B: waits for Foundational, then User Story 2 (Phase 4)
- Either contributor: Polish (Phase 5), once both stories land

---

## Notes

- `[P]` is only applied where files genuinely differ and there's no ordering dependency.
- T003/T007 (remove JS listener) are sequenced before T004/T008 (remove HTML button)
  specifically to avoid a broken intermediate state — see each task's note.
- No test-framework setup tasks are included; the Playwright suite already exists from
  the Video Load Feedback feature. This feature's tests are about updating/extending it,
  not standing it up.
- Commit after each task or logical group, consistent with existing repository practice.

---

## Phase 7: Revision (2026-07-06, post-implementation)

**Why**: Real browser testing after T001–T014 shipped found two problems — see
spec.md's Revision section. Both are now fixed; tasks below record what changed.

- [X] R1 Fix the black-screen-after-load bug in `loadVideo()` (`js/scripts.js`): replaced
  `videoPlayer.youtubePlayer.loadVideoById(videoId); videoPlayer.pause();` with a single
  `videoPlayer.youtubePlayer.cueVideoById(videoId);` call. `cueVideoById` loads and
  displays the video's thumbnail without attempting to autoplay, so it renders correctly
  regardless of what triggered the load (fixing the case where the prior autoplay-then-
  pause sequence got blocked by the browser's autoplay policy when not triggered by a
  fresh, direct user gesture).
- [X] R2 Remove the auto-load wiring added in T005/T009: the `#video-url` `input` listener
  (paste-instant/debounce logic) and `#local-video-file` `change` listener that called
  `loadVideo()`/`loadLocalVideo()` directly. Removed the now-unused `lastAutoLoadedVideoId`/
  `urlDebounceTimeoutId` state and the `attemptAutoLoadYouTube()`/`handleVideoUrlInput()`
  functions.
- [X] R3 Restore `#load-video` and `#load-local-video` buttons in `index.html`, styled with
  a new `.load-trigger-button` class (`css/styles.css`) — a clear text-labeled "Load"
  button rather than the original unlabeled icon — initially hidden (`display: none`).
- [X] R4 Add `updateVideoUrlButtonVisibility()` / `updateLocalFileButtonVisibility()` in
  `js/scripts.js`, wired to the `#video-url` `input` event and `#local-video-file` `change`
  event respectively; each toggles its button's visibility based on whether its input
  currently has content. Re-wired both buttons' `click` listeners to `loadVideo()`/
  `loadLocalVideo()` (unchanged functions, per R1's internal fix).
- [X] R5 Update the test suite for the reverted trigger mechanism:
  - `tests/helpers/fake-youtube.js`: renamed the mocked method from `loadVideoById` to
    `cueVideoById` (kept as an alias) to match R1; fires `onStateChange` with state `CUED`
    (5) instead of `PAUSED` (2).
  - `tests/load-state.spec.js`, `tests/failure-recovery.spec.js`: restored the
    `page.click('#load-local-video')` step after `page.setInputFiles(...)` — selecting a
    file no longer auto-loads.
  - `tests/auto-load-trigger.spec.js`: replaced entirely (old contents tested paste-instant/
    debounce/dedup behavior that no longer exists) with tests for the new appearing-button
    behavior: both buttons hidden by default, `#load-video` appears/hides as `#video-url`
    gains/loses content, `#load-local-video` appears once a file is selected, and — the
    key regression guard — typing/pasting alone never loads a video without an explicit
    click.
  - `tests/discoverability.spec.js`, `tests/regression.spec.js`: confirmed unaffected (no
    button references / already call `loadVideo()` directly via the `loadYouTubeUrlAndGetState`
    helper, bypassing the UI trigger mechanism entirely).
- [X] R6 Full suite re-run: 17 tests, stress-tested at 8x repeats (136/136 passing).
- [ ] R7 Not automated: the black-screen fix (R1) was verified manually in-browser with a
  real YouTube video (thumbnail now renders correctly after clicking Load), but not via
  Playwright — the fake YouTube API has no real visual rendering to assert against, and a
  genuine visual-regression check was judged out of scope for this suite. Local-file
  visual rendering after load was not independently re-verified in-browser this session
  (a file-upload tool limitation blocked it); the existing automated local-file tests
  passing is the available evidence there.
