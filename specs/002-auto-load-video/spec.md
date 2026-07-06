# Feature Specification: Intuitive Video Load Trigger

**Feature Branch**: `002-auto-load-video`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "When the youtube link is pasted, or the local video is selected, it isn't obvious to the user that they need to click the red, round button next to the input to load either. I'm open to other methods, but we must make loading the video intuitive."

## Clarifications

### Session 2026-07-06

- Q: What specifically triggers loading a YouTube video — auto-detect a valid URL, pressing Enter, or something else? → A: Auto-load as soon as a valid YouTube URL is detected in the field (debounced against partial input), and the video MUST load automatically into the player with no further user action.
- Q: Should pasting a complete URL trigger the load instantly, while manual typing waits for a pause — or should both be treated identically? → A: Paste triggers instantly (no delay); manually typed input waits for a short pause (~500ms of no further keystrokes) before validating and loading.

## Revision: 2026-07-06 (post-implementation)

Real-world testing after implementing pure auto-load surfaced two problems serious
enough to revise this spec rather than just patch the code:

1. **Black screen after auto-load.** `loadVideo()` calls `loadVideoById()` then
   immediately `pause()`. When triggered by a fresh, direct user gesture (the old
   button click), this reliably rendered a paused frame. Triggered from a
   `setTimeout` debounce callback or in other non-gesture contexts, the browser's
   autoplay policy could block the implicit autoplay attempt entirely, leaving the
   player showing solid black — visually indistinguishable from "nothing loaded,"
   even though the video state indicator correctly said "Ready" and the video
   played fine once the user pressed Play. **Fix**: `loadVideo()` now calls
   `youtubePlayer.cueVideoById()` instead of `loadVideoById()` + `pause()` —
   `cueVideoById` loads and displays the video's thumbnail without ever attempting
   to autoplay, so it renders correctly regardless of what triggered the load.
   This is a strictly better fix than the prior pause-after-load approach and
   applies regardless of the trigger-mechanism decision below.

2. **Pure auto-load was still confusing in practice.** Despite passing all
   automated tests (which use a fake, instant-responding YouTube API), real
   testing showed users couldn't tell whether anything had happened after
   pasting/typing/selecting, partly because of the black-screen issue above and
   partly because there was no longer any deliberate action to anchor the
   expectation that "now something is loading." **Revised decision**: FR-002,
   FR-003, FR-004, and FR-006 (below) are superseded — auto-load-on-recognized-URL
   and auto-load-on-file-selection are removed. In their place: both `#load-video`
   and `#load-local-video` buttons are restored, but hidden (`display: none`)
   until their corresponding input actually has content (a non-empty URL field
   value, or a selected file), at which point they appear. Loading remains an
   explicit click. This directly satisfies the original ask ("must make loading
   the video intuitive") by removing the always-present-but-unlabeled control
   that caused the original complaint, without introducing a new "did this
   actually work?" ambiguity.

The Functional Requirements, Success Criteria, and Assumptions sections below are
left as originally written for the historical record of what was tried and why;
treat FR-002/003/004/006 and SC-001/003/005 as superseded by this revision.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load a YouTube video without a hidden step (Priority: P1)

A user pastes a YouTube URL into the input field, expecting the video to start loading, without needing to notice or understand that a separate small icon button next to the field must also be clicked.

**Why this priority**: This is the exact problem reported: users don't discover the current explicit "load" button, so pasting a URL currently appears to do nothing. This blocks the primary way most users bring a video into the app.

**Independent Test**: Give the page to someone unfamiliar with it and ask them to practice with a specific YouTube video. Confirm they get the video loading without being told a separate button exists.

**Acceptance Scenarios**:

1. **Given** the "nothing loaded" state, **When** the user pastes a complete, valid YouTube URL into the field, **Then** the video automatically begins loading into the player instantly, with no click or keypress required.
2. **Given** the "nothing loaded" state, **When** the user manually types a valid YouTube URL character-by-character, **Then** the video automatically begins loading once about half a second passes with no further keystrokes — not while keys are still being pressed.
3. **Given** the user is still actively typing or editing the URL field (not yet finished), **When** partial text is present, **Then** the system does not begin loading against that incomplete input.
4. **Given** a video is already "ready", **When** the user pastes a different YouTube URL, **Then** the new video begins loading the same intuitive way, replacing the previous one.

---

### User Story 2 - Load a local video file in one step (Priority: P1)

A user selects a video file from their computer, expecting that selection alone to load it, without needing a second, separate click on another control.

**Why this priority**: Equally central to the reported problem — selecting a file currently requires an additional, non-obvious click to actually load it. This is a one-step action in almost every comparable file-based tool, so the extra step is the most likely point of confusion.

**Independent Test**: Ask an unfamiliar user to practice with a video file from their computer. Confirm the video loads as soon as they finish selecting the file in the OS file picker, with no further action needed.

**Acceptance Scenarios**:

1. **Given** the "nothing loaded" state, **When** the user selects a valid video file via the file picker, **Then** the video begins loading immediately upon selection, with no additional click required.
2. **Given** a video is already "ready", **When** the user selects a different local file, **Then** the new video begins loading immediately, replacing the previous one.

---

### Edge Cases

- User pastes a URL, then keeps editing it (e.g., pastes over part of it) before it would trigger — the system must not load an incomplete/intermediate value.
- User selects a file, then immediately opens the file picker again and selects a different file before the first one starts loading — only the final selection should load.
- User types a YouTube URL character-by-character rather than pasting — this must still trigger a load via the ~500ms debounce path; the paste-detection used for the instant-trigger case must not be the *only* way to reach a load.
- All existing load-state feedback behavior (immediate "loading" indicator, only reaching "ready" once actually playable, clearing the previous video immediately, the 15-second failure timeout, and the duplicate-load guard) must continue to apply no matter what triggers the load — this feature changes *how loading starts*, not what happens once it does.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST begin loading a local video file as soon as the user selects it via the file picker, without requiring any additional confirmation click.
- **FR-002**: System MUST automatically begin loading a YouTube video into the player once a valid YouTube URL is recognized in the field, with no click, keypress, or other confirmation required from the user. A pasted complete URL MUST trigger loading instantly; a manually typed URL MUST trigger loading once approximately 500ms pass with no further keystrokes.
- **FR-003**: System MUST NOT begin loading a YouTube URL while the user is still actively typing (i.e., within the ~500ms debounce window) or while the field holds an incomplete or invalid value.
- **FR-004**: System MUST remove the now-redundant explicit "load" buttons for both the YouTube URL and local-file inputs, since both paths load automatically; no unlabeled trigger control should remain for users to have to discover.
- **FR-005**: All load-state behavior already established (immediate "loading" state, "ready" only once actually playable, immediate clearing of a previous video on a new load, the 15-second failure timeout, the duplicate-load guard, and failure reasons) MUST continue to apply regardless of what triggers the load.
- **FR-006**: System MUST support both pasting and manually typing a YouTube URL as valid ways to arrive at the triggering condition. Detecting a paste event is used only to skip the debounce delay for an instant response — manual typing MUST still independently trigger a load via the debounce path, not be excluded because the mechanism also recognizes paste.

### Key Entities

- No new data entities. This feature changes how the existing "Load State" (from the Video Load Feedback feature) gets triggered, not the state model itself.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In an unguided walkthrough, at least 90% of first-time users successfully get a YouTube video loading without being told about any specific button or control.
- **SC-002**: In an unguided walkthrough, at least 95% of first-time users successfully get a local video file loading immediately after selecting it, without a separate confirmation step.
- **SC-003**: Zero premature/incomplete loads are triggered while a user is still actively typing or editing the YouTube URL field.
- **SC-004**: The number of distinct actions required to load a local file drops from two (select, then click load) to one (select).
- **SC-005**: The number of distinct actions required to load a YouTube video drops from two (paste, then click load) to one (paste or type).

## Assumptions

- This feature only changes *how* a load is triggered; the four load states (nothing loaded / loading / ready / failed), the 15-second timeout, the duplicate-load guard, and the visual indicator from the Video Load Feedback feature are all reused unchanged.
- Local-file auto-load (FR-001) is treated as a safe default rather than a clarification question: selecting a file is a single, deliberate, atomic action with no risk of firing on a partial/incomplete value, unlike free-text URL entry.
- The existing round icon buttons for both inputs are removed as part of this change, since auto-load makes them redundant and leaving them in place would add clutter without adding value.
