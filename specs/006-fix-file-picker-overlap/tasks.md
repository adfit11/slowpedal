---

description: "Task list for Fix Local File Picker Label Overlap"
---

# Tasks: Fix Local File Picker Label Overlap

**Input**: Design documents from `/specs/006-fix-file-picker-overlap/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: This repo has a dev-only Playwright suite (`tests/*.spec.js`). This feature
adds new coverage for the fixed local-file control; no existing test currently asserts
anything about this control's text layout, so nothing needs to be rewritten — only added.

**Organization**: Spec.md has a single user story (US1, P1) — no Foundational phase is
needed since there's nothing shared to set up beyond the baseline check.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to US1 from spec.md
- All file paths are relative to the repository root: `index.html`, `css/styles.css`, `js/scripts.js`, `tests/`

---

## Phase 1: Setup

- [X] T001 Run the existing Playwright suite (`npm test`) to confirm a clean baseline before making changes. Baseline: 27/27 passing.

**Checkpoint**: Baseline recorded.

---

## Phase 2: User Story 1 - Local file status is always legible (Priority: P1)

**Goal**: The "Choose a file from your computer" control never shows overlapping
text, in either the empty ("No file chosen") or file-selected state, per
`research.md`'s decision to hide the native input and take over both its trigger (via
the `<label>`) and its status display (via one small JS update).

**Independent Test**: Open the app, inspect the control before and after selecting a
local video file — in both cases every piece of text must be fully legible with no
overlap, and the filename must update correctly when a different file is chosen.

### Implementation for User Story 1

- [X] T002 [US1] In `index.html`, restructure the local-file control: keep `<input type="file" id="local-video-file">`, keep `<label for="local-video-file">` (repurposed as the visible trigger, its text can stay "Select Local Video" or be simplified to match the button-like role — see T003 for styling), and add one new element (e.g. `<span id="local-video-filename">No file chosen</span>`) to hold the file-selection status text.
- [X] T003 [US1] In `css/styles.css`: visually hide `#local-video-file` (a non-`display:none` technique — e.g. `position: absolute; opacity: 0; width/height matching or exceeding the label's clickable area` — so the `<label>` can still activate it and it stays in the accessibility tree); restyle `.local-video-file-label` to look like a visible trigger button (remove the old `left: -170px; margin-right: -120px;` positioning entirely); style `#local-video-filename` with `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` and a `max-width` matching the control's existing width budget (depends on T002).
- [X] T004 [US1] In `js/scripts.js`, extend the existing `change` listener on `#local-video-file` (currently just `updateLocalFileButtonVisibility()`) to also set `#local-video-filename`'s text content to `input.files[0]?.name || 'No file chosen'`. No change to `loadLocalVideo()` or any `VideoPlayer` method (depends on T002).
- [X] T005 [US1] Add a new test file `tests/local-file-picker.spec.js`: assert no bounding-rect overlap between the label/button and the filename-status element in both the empty state and after selecting a file (use `tests/helpers/tiny-video.js`'s generated file via `page.setInputFiles`); assert the displayed filename updates when a different file is selected; assert a very long filename is truncated (not overflowing) via a `max-width`/`overflow` computed-style check rather than pixel-perfect overlap (depends on T002, T003, T004).
- [X] T006 [US1] Manually validate User Story 1 using `quickstart.md` Scenarios 1-4 live in-browser: empty-state legibility, file-selected legibility, re-selection updates cleanly, long filename truncates without overflow (depends on T002, T003, T004). Verified live: empty state shows a clean "Select Local Video" button beside legible "No file chosen" text with zero overlap (screenshot confirmed); simulated a long filename and confirmed it truncates with an ellipsis, fully legible, no overlap with the button. Automated re-selection/long-filename coverage in T005 confirms the underlying behavior beyond what a single live screenshot can show.

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 3: Polish & Cross-Cutting Concerns

- [X] T007 Run the full Playwright suite (`npm test`) after all changes; confirm no regressions (depends on T005). Result: 31/31 passing (27 baseline + 4 new). Stress-tested with `--repeat-each=8`: 248/248 passing, no flakiness.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **User Story 1 (Phase 2)**: Depends only on Setup.
- **Polish (Phase 3)**: Depends on all of User Story 1's tasks.

### Within User Story 1

- T002 → T003 → T004 → {T005, T006} (T005 and T006 both depend on T002-T004 but not on each other)

### Parallel Opportunities

- T005 (automated test) and T006 (manual validation) can proceed in parallel once
  T002-T004 are done, since they're independent verification activities.

---

## Implementation Strategy

Single user story, no MVP-scoping question — it's one small markup/CSS/JS change plus
verification:

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1 (the fix + tests + manual validation)
3. Complete Phase 3: Polish — full regression run
4. **STOP and VALIDATE**: Walk through `quickstart.md` end-to-end in a real browser

---

## Notes

- No Foundational phase — there's only one story and nothing shared to set up beyond
  the baseline check.
- Commit after each task or logical group, consistent with existing repository practice.
