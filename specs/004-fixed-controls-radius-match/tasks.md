---

description: "Task list for Persistent Bottom Controls and Matching Status Radius"
---

# Tasks: Persistent Bottom Controls and Matching Status Radius

**Input**: Design documents from `/specs/004-fixed-controls-radius-match/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: This repo has a dev-only Playwright suite (`tests/*.spec.js`). This feature must update `tests/minimal-redesign.spec.js`'s existing assertion that `#bottom-controls` hides when ready — it now contradicts FR-001 — plus add new coverage.

**Organization**: US1 (P1) and US2 (P2) are fully independent — no shared setup between them, so there's no Foundational phase this time.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to US1 or US2 from spec.md
- All file paths are relative to the repository root: `css/styles.css`, `js/scripts.js`, `tests/`, and `specs/003-minimal-aesthetic-redesign/contracts/control-overlay-behavior.md`

---

## Phase 1: Setup

- [X] T001 Run the existing Playwright suite (`npm test`) to confirm a clean baseline before making changes. Baseline: 21/21 passing.

**Checkpoint**: Baseline recorded.

---

## Phase 2: User Story 1 - Playback controls stay visible at all times (Priority: P1)

**Goal**: `#bottom-controls` never hides or fades, regardless of load state, play/pause state, or hover — while `#top-controls` keeps its existing hide/reveal behavior unchanged.

**Independent Test**: Load a video to "ready," leave the mouse away from the bottom of the screen indefinitely (through both playing and paused states) — the playback/loop controls must stay fully visible and clickable throughout.

### Implementation for User Story 1

- [X] T002 [US1] Remove the `body.state-ready #bottom-controls > *` and `body.state-ready #bottom-controls.revealed > *` CSS rules in `css/styles.css`. `#bottom-controls` keeps its existing `position: absolute` overlay placement, gradient scrim, and z-index unchanged — only the opacity/pointer-events hiding rules are removed.
- [X] T003 [US1] Remove the `initControlZoneHover('bottom-controls')` call in `js/scripts.js` (dead code once T002 lands — nothing consumes the `.revealed` class it toggled for that zone anymore). The shared `initControlZoneHover()` function and the `initControlZoneHover('top-controls')` call are untouched (depends on T002).
- [X] T004 [US1] Amend `specs/003-minimal-aesthetic-redesign/contracts/control-overlay-behavior.md` to reflect that the hide/reveal contract now governs only `#top-controls` — update the "Hotzones" description and any language that currently describes both zones symmetrically, per research.md's decision to amend in place rather than publish a duplicate contract.
- [X] T005 [US1] Manually validate User Story 1 using `quickstart.md` Scenarios 1–2 (bottom controls never hide through inactivity or during playback; top loading controls still hide/reveal exactly as before). Verified live in-browser with a real YouTube video: after 3+s with the mouse away, `#bottom-controls` children stay at `opacity: 1` (confirmed via computed style, not just visual inspection), while `#top-controls` correctly still hides (`opacity: 0`, `body.state-ready` true, no `.revealed` class on either).

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 3: User Story 2 - Status indicator's corners match the loading-control boxes (Priority: P2)

**Goal**: `.load-state-indicator` and `.video-source` share one `border-radius` value, so they can never drift apart again.

**Independent Test**: With nothing loaded, compare the load-state indicator's corners against the video-loading control boxes' corners — they must match exactly, and both must be driven by the same CSS variable.

### Implementation for User Story 2

- [X] T006 [US2] Add `--radius-panel: 8px;` to the existing `:root` custom-property block in `css/styles.css` (alongside the color variables from the Minimal Aesthetic Redesign feature).
- [X] T007 [US2] Change `.load-state-indicator`'s `border-radius` from the hardcoded `20px` to `var(--radius-panel)`, and `.video-source`'s `border-radius` from the hardcoded `8px` to `var(--radius-panel)` (depends on T006).
- [X] T008 [US2] Manually validate User Story 2 using `quickstart.md` Scenarios 3–4 (visual corner match; confirm both selectors reference `--radius-panel` in the source rather than independent hardcoded numbers). Verified visually in-browser: the load-state indicator and the two video-source boxes now show identical corner rounding.

**Checkpoint**: Both User Stories are independently functional.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T009 [P] Update `tests/minimal-redesign.spec.js`: the `'both overlays hide once ready...'` test (currently asserts `#bottom-controls .action-button.start-stop` reaches opacity `0`) must be rewritten — that assertion now contradicts FR-001. Split it: keep the `#top-controls` hide/restore assertions, and replace the `#bottom-controls` opacity-`0` assertions with an assertion that it stays at opacity `1` throughout (loading, ready, and failed states) (depends on T002). Split into two tests: one renamed to focus purely on the loading-controls overlay, and a new dedicated test for "the playback/loop controls overlay is always visible, regardless of load state or hover" (also checks it never gains a `.revealed` class, since nothing should be trying to toggle one).
- [X] T010 [P] Update the `'hovering each hotzone reveals it independently of the other'` test in `tests/minimal-redesign.spec.js`: remove the assertions and `dispatchEvent` calls for `#bottom-controls` (there's no hover-hide behavior left to test there); keep the `#top-controls` hover assertions (depends on T003). Renamed to "hovering the loading-controls hotzone reveals it."
- [X] T011 [P] Add a new test to `tests/minimal-redesign.spec.js` asserting `.load-state-indicator` and `.video-source` compute the same `border-radius` value (e.g. via `getComputedStyle`), guarding FR-003/FR-004 going forward (depends on T007).
- [X] T012 Run the full Playwright suite (`npm test`) after all changes; confirm no regressions (depends on T009, T010, T011). Result below.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **User Story 1 (Phase 2)** and **User Story 2 (Phase 3)**: Both depend only on Setup — fully independent of each other, can proceed in parallel.
- **Polish (Phase 4)**: T009/T010 depend on User Story 1's changes; T011 depends on User Story 2's changes; T012 depends on all of them.

### Within Each User Story

- User Story 1: T002 → T003 → T004 → T005
- User Story 2: T006 → T007 → T008

### Parallel Opportunities

- User Story 1 (Phase 2) and User Story 2 (Phase 3) can be done fully in parallel by two contributors — no shared files or rules between them.
- T009, T010, and T011 in Polish are independent test edits and can proceed in parallel with each other, once their respective source-story tasks are done.

---

## Parallel Example: User Stories 1 & 2

```bash
# After Setup (T001), these can proceed independently:
Task: "Remove #bottom-controls hide rules and hover wiring (US1: T002-T004)"
Task: "Add --radius-panel and apply it to both boxes (US2: T006-T007)"
```

---

## Implementation Strategy

Both stories are small and independent; there's no meaningful "MVP first" sequencing
question here — complete both, then Polish:

1. Complete Phase 1: Setup
2. Complete Phase 2 (US1) and Phase 3 (US2) — in either order, or in parallel if staffed
3. Complete Phase 4: Polish — update existing tests, add the radius-match test, full regression run
4. **STOP and VALIDATE**: Walk through `quickstart.md` end-to-end in a real browser

---

## Notes

- No Foundational phase — US1 and US2 share no code or files.
- `[P]` is only applied where files/regions genuinely differ and there's no ordering dependency.
- Commit after each task or logical group, consistent with existing repository practice.
