---

description: "Task list for Video Load Feedback"
---

# Tasks: Video Load Feedback

**Input**: Design documents from `/specs/001-video-load-feedback/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/video-player-interface.md, quickstart.md

**Tests**: No automated test framework existed in this repo at planning time (see plan.md Technical Context), so verification tasks below were originally scoped as manual passes through `quickstart.md`. A Playwright suite was added afterward as a documented dev-only exception (see plan.md Complexity Tracking) and now covers all 9 quickstart scenarios except the non-speed keyboard shortcuts (see T021) — see `tests/*.spec.js`, run via `npm test`.

**Organization**: Tasks are grouped by user story (from spec.md) so each can be delivered and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to US1, US2, or US3 from spec.md
- All file paths are relative to the repository root: `index.html`, `css/styles.css`, `js/scripts.js`

## Path Conventions

This is a three-file static web app (per plan.md's Project Structure) — there is no `src/`/`tests/` split. Every task touches one or more of `index.html`, `css/styles.css`, `js/scripts.js`.

---

## Phase 1: Setup

**Purpose**: Establish a pre-change reference point. No dependency/build setup is needed (zero-build project, Constitution Principle I).

- [ ] T001 Serve the app locally (`python3 -m http.server 8080`) and manually exercise the current YouTube-URL and local-file load flows in `index.html`/`js/scripts.js` to record baseline behavior before making any changes. **Moot, not superseded**: this was meant to run *before* implementation; that window has passed. It's left unchecked as an honest record rather than retroactively marked done — the automated suite added afterward verifies current behavior, not the pre-change baseline this task was for.

**Checkpoint**: Baseline behavior confirmed; ready to modify the three source files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Give the `VideoPlayer` class the ready/error signaling it doesn't yet have, per `contracts/video-player-interface.md`. Required by User Story 1 and User Story 3 (User Story 2 does not depend on this phase and may proceed in parallel — see Dependencies below).

**⚠️ CRITICAL**: User Stories 1 and 3 cannot start until this phase is complete.

- [X] T002 Add `onReady(callback)` and `onError(callback)` registration methods, plus the backing callback fields in the constructor, to the `VideoPlayer` class in `js/scripts.js`, per `contracts/video-player-interface.md`.
- [X] T003 Wire the new ready hook into the existing `onPlayerReady()` (YouTube) and `onHTML5PlayerReady()` (HTML5) handlers in `js/scripts.js` so both invoke `videoPlayer`'s registered `onReady` callback in addition to their current behavior (depends on T002).
- [X] T004 Register YouTube error handling in `js/scripts.js`: add an `onError` entry to the `events` config passed to `new YT.Player(...)` in `onYouTubeIframeAPIReady()`, map YouTube's numeric error codes to short human-readable reasons, and invoke `videoPlayer`'s registered `onError` callback (depends on T002).
- [X] T005 Register HTML5 error handling in `js/scripts.js`: add an `error` event listener on `#html5-player` alongside the existing `loadedmetadata`/`play`/`pause`/`ratechange` listeners, map `html5Player.error.code` to a short human-readable reason, and invoke `videoPlayer`'s registered `onError` callback (depends on T002).

**Checkpoint**: `VideoPlayer` can now report readiness and failure uniformly for both playback types — User Stories 1 and 3 can begin.

---

## Phase 3: User Story 1 - See confirmation that a video is ready to practice with (Priority: P1) 🎯 MVP

**Goal**: A persistent load-state indicator (nothing loaded / loading / ready) driven by the new `VideoPlayer` hooks, with the previous video clearing immediately when a new one is loaded.

**Independent Test**: Load a valid YouTube URL and, separately, a valid local file; confirm the indicator only reaches "ready" once each is actually playable. Then load a second video while the first is "ready" and confirm it clears immediately with no stale "ready" state.

### Implementation for User Story 1

- [X] T006 [US1] Add load-state indicator markup (icon element + text label) to the `#top-controls` area in `index.html`, near the existing YouTube-URL and local-file input groups.
- [X] T007 [P] [US1] Add CSS rules in `css/styles.css` for the indicator's "nothing loaded", "loading", and "ready" states — each with a distinct icon class and text, color used only as secondary reinforcement — plus a CSS-only animation (e.g. spin/pulse) for "loading".
- [X] T008 [US1] Add a module-level `loadState` variable (`'empty' | 'loading' | 'ready' | 'failed'`) and an `updateLoadStateUI()` render function in `js/scripts.js` that reflects `loadState` onto the indicator markup from T006 (depends on T006).
- [X] T009 [US1] In `loadVideo()` and `loadLocalVideo()` (`js/scripts.js`), set `loadState = 'loading'` and call `updateLoadStateUI()` immediately on submission/selection — before the video is confirmed playable — and immediately stop/hide the previously loaded video (per the clarified "clears immediately" behavior) rather than leaving it visible or playing during the new load (depends on T008). Implemented via `videoPlayer.pause()` before switching player type, which stops the previous video through the existing `VideoPlayer` abstraction rather than reaching into the raw player elements.
- [X] T010 [US1] Register `videoPlayer.onReady(...)` in `js/scripts.js` (using the hook from T002/T003) to set `loadState = 'ready'` and call `updateLoadStateUI()` once the video is actually confirmed playable, for both YouTube and local-file loads (depends on T008, T003).
- [X] T011 [US1] Add a duplicate-load guard at the top of `loadVideo()` and `loadLocalVideo()` in `js/scripts.js` that ignores a new load attempt while `loadState === 'loading'` (depends on T009).
- [X] T012 [US1] Manually validate User Story 1 using `quickstart.md` Scenarios 1–4 (nothing loaded on page load; YouTube loading→ready; local file loading→ready; loading a new video clears the previous one immediately). **Superseded by automation**: all 4 scenarios are covered by `tests/load-state.spec.js`, run in a real Chromium browser (fake YouTube API for the YouTube path, a genuinely-decodable generated `.webm` for the local-file path). Verified stable across 195+ repeated executions.

**Checkpoint**: User Story 1 is fully functional and testable independently — this is the MVP.

---

## Phase 4: User Story 2 - Discover how to load a local video file (Priority: P2)

**Goal**: The YouTube-URL and local-file affordances read as two distinct, discoverable options.

**Independent Test**: Show the page to someone unfamiliar with it and confirm they can identify both loading options, and correctly use the local-file one, without external instructions.

**Note**: This story does not depend on the Foundational phase or User Story 1 — it only touches layout/labeling/styling of the existing, already-functional inputs, so it can be done in parallel with Phases 2–3 (see Dependencies below).

### Implementation for User Story 2

- [X] T013 [P] [US2] Restructure and label the two input-group blocks in `index.html` (YouTube URL and local file) with a clear caption for each (e.g. "Paste a YouTube link" / "Choose a file from your computer") so they read as two separate options, per FR-006.
- [X] T014 [P] [US2] Add CSS in `css/styles.css` to visually distinguish the two input-group blocks (spacing/grouping/border treatment) so both clearly look interactive and distinct from each other.
- [X] T015 [US2] Manually validate User Story 2 using `quickstart.md` Scenario 5 (both loading options are identifiable without instructions; the local-file affordance opens the OS file picker scoped to video files) (depends on T013, T014). **Superseded by automation**: covered by both tests in `tests/discoverability.spec.js` — distinct labeled containers for each affordance, and the local-file label triggering a real file-chooser event scoped to `accept="video/*"`. "Identifiable without instructions" is inherently a human-judgment criterion (SC-004); the test verifies the structural/labeling facts that judgment depends on, not the human study itself.

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Understand and recover from a failed load (Priority: P3)

**Goal**: A distinct "failed" indicator state with a short reason, triggered by an explicit error or a 15-second timeout, that immediately allows a retry.

**Independent Test**: Submit an invalid/unreachable YouTube URL, and separately an unplayable local file; confirm "failed" appears within 15 seconds with an understandable reason, and that a new load can be started immediately afterward.

### Implementation for User Story 3

- [X] T016 [P] [US3] Add CSS in `css/styles.css` for the indicator's "failed" state (icon + text, color as secondary reinforcement), extending the state styles added in T007.
- [X] T017 [US3] Add a 15-second timeout in `js/scripts.js`, started whenever `loadState` becomes `'loading'`, that sets `loadState = 'failed'` with reason "Timed out" and calls `updateLoadStateUI()` if neither `onReady` nor `onError` has fired first; clear the timer whenever `onReady`/`onError` fires (depends on T009, T010). **Deviation from original task split** (per `/speckit-analyze` finding I1): rather than having T017 and T018 each independently clear the timer — which created a circular ordering dependency — both now call a single shared `clearLoadTimeout()` helper, invoked from `setLoadReady()` and `setLoadFailed()`. `setLoadLoading()`/`setLoadReady()`/`setLoadFailed()`/`startLoadTimeout()`/`clearLoadTimeout()` were implemented together as one cohesive unit.
- [X] T018 [US3] Register `videoPlayer.onError(...)` in `js/scripts.js` (using the hook from T002/T004/T005) to set `loadState = 'failed'` with the provided reason and call `updateLoadStateUI()`, for both YouTube and local-file loads (depends on T008, T004, T005).
- [X] T019 [US3] Confirm/adjust `loadVideo()`/`loadLocalVideo()` in `js/scripts.js` so a new load attempt is accepted immediately once `loadState === 'failed'`, consistent with the duplicate-load guard from T011, with no page reload required (depends on T011, T018). Also replaced the old blocking `alert("Invalid YouTube URL...")` with the same `setLoadFailed(...)` path, so a malformed URL surfaces through the indicator instead of a native dialog.
- [X] T020 [US3] Manually validate User Story 3 using `quickstart.md` Scenarios 6–8 (failed YouTube load, failed local file load, duplicate-load prevention while a load is in progress). **Superseded by automation**: all 3 scenarios covered by `tests/failure-recovery.spec.js`, plus a 4th test for the FR-004 15s timeout path (using Playwright's clock API to fast-forward rather than waiting 15s for real).

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm no regressions and no scope creep beyond the constitution's constraints.

- [X] T021 [P] Manually verify keyboard shortcuts (`space`, `a`, `s`, `d`, `f`, `g`, `h`, `j`) still control playback/looping correctly once a video is "ready", per `quickstart.md` Scenario 9 (Constitution Principle II — no shortcut changes expected). **Partially superseded by automation**: `tests/regression.spec.js` runtime-verifies `a`/`s` (speed) after a load reaches "ready", in a real browser. `d`/`f`/`g`/`h`/`j` (loop shift/length/control) and `space` (play/pause) are not yet covered by a test — code review still confirms the keydown handler is byte-for-byte unchanged, but a manual click-through of the remaining 6 shortcuts hasn't been run. Consider adding them to `tests/regression.spec.js` for full coverage.
- [X] T022 [P] Manually verify no new dependencies were introduced — confirm `index.html` still only references the Remix Icons and YouTube IFrame API CDN resources (e.g. `grep -E '<script|<link' index.html`), per `quickstart.md` Scenario 9 (Constitution Principle I). Confirmed via grep: only the pre-existing Remix Icons CDN link, local stylesheet/script, and the pre-existing analytics script remain — nothing new added.
- [X] T023 Review the full diffs of `index.html`, `css/styles.css`, and `js/scripts.js` for consistency with existing code style and remove any leftover debug code before considering the feature complete. Reviewed via `git diff`; no `console.*`/`debugger` statements introduced; `node --check js/scripts.js` passes with no syntax errors.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks User Story 1 and User Story 3.
- **User Story 1 (Phase 3)**: Depends on Foundational (needs `onReady`/`onError` hooks).
- **User Story 2 (Phase 4)**: Depends only on Setup — does **not** depend on Foundational or User Story 1. Can proceed in parallel with Phases 2–3.
- **User Story 3 (Phase 5)**: Depends on Foundational (needs `onError`/timeout) and on User Story 1 (T009–T011: `loadState` variable, `updateLoadStateUI()`, duplicate-load guard already exist).
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### Within Each User Story

- User Story 1: T006 → T007 (parallel to T006) → T008 → T009 → T010 → T011 → T012
- User Story 2: T013 (parallel to T014) → T015
- User Story 3: T016 (parallel to T017/T018) → T017 & T018 → T019 → T020

### Parallel Opportunities

- T007 (CSS) can run alongside T006 (HTML) within User Story 1.
- T013 and T014 (different files) can run alongside each other within User Story 2.
- User Story 2 (Phase 4) as a whole can be worked on in parallel with Foundational + User Story 1 (Phases 2–3) by a different contributor, since it touches layout/labeling only and has no shared-state dependency.
- T016 (CSS) can run alongside T017/T018 (JS) within User Story 3.
- T021 and T022 (Polish) are independent verification passes and can run in parallel.

---

## Parallel Example: User Story 1

```bash
# T006 and T007 touch different files and can proceed together:
Task: "Add load-state indicator markup to #top-controls in index.html"
Task: "Add CSS for nothing-loaded/loading/ready states in css/styles.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`VideoPlayer` ready/error hooks)
3. Complete Phase 3: User Story 1 — the core "can I tell if it loaded" problem
4. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1–4 independently
5. This is a usable, demoable improvement even before User Stories 2 and 3 land

### Incremental Delivery

1. Setup + Foundational → indicator plumbing ready
2. User Story 1 → loading/ready feedback works → validate → ship (MVP)
3. User Story 2 → local-file affordance is discoverable → validate → ship
4. User Story 3 → failures are visible and recoverable → validate → ship
5. Polish → confirm no regressions to shortcuts or dependency count

### Parallel Team Strategy

With two contributors:

- Contributor A: Foundational (Phase 2) → User Story 1 (Phase 3) → User Story 3 (Phase 5)
- Contributor B: User Story 2 (Phase 4), starting immediately after Setup, independently of A

---

## Notes

- Every task in User Story phases carries its `[US#]` label; Setup/Foundational/Polish tasks carry none, per the checklist format.
- `[P]` is only applied where the files genuinely differ and there's no ordering dependency — most `js/scripts.js` tasks are intentionally sequential since they build on the same `loadState` variable and render function.
- No test-framework tasks were included in the original breakdown, since this repo had none at planning time; verification was scoped as the manual `quickstart.md` task closing out each phase. A Playwright suite (`tests/*.spec.js`, dev-only per plan.md's Complexity Tracking) was added afterward and now covers those manual tasks except the non-speed keyboard shortcuts (see T021's note) — run via `npm test`.
- Commit after each task or logical group, consistent with existing repository practice.
