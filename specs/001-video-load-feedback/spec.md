# Feature Specification: Video Load Feedback

**Feature Branch**: `001-video-load-feedback`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Improve feedback when loading a video, whether from YouTube or a local file. Right now it's unclear whether a video has actually loaded or how to load a local file at all. Users should get clear visual confirmation of load state (nothing loaded / loading / loaded and ready) and clear affordance for choosing a local file vs. pasting a YouTube URL."

## Clarifications

### Session 2026-07-06

- Q: FR-004 says a load fails after "a reasonable time" with no playable result — what's the actual timeout threshold? → A: 15 seconds
- Q: When a new load starts while a previous video is loaded, does the old video keep playing until the new one is ready, or clear immediately? → A: Clears immediately — old video/player disappears the instant a new load starts, replaced by the "loading" state
- Q: Must the state indicator convey state through more than color alone? → A: Yes — icon + short text label always shown, color is secondary reinforcement only

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See confirmation that a video is ready to practice with (Priority: P1)

A guitarist pastes a YouTube URL (or picks a local video file) and needs to know, without guessing, the moment the video is actually loaded and ready to play, slow down, and loop — as opposed to still being fetched, or having silently failed.

**Why this priority**: This is the core problem reported: users currently can't tell if a video loaded at all. Without this, every other feature (looping, speed control, pedal shortcuts) is unusable because the user doesn't trust the app is ready to receive their input.

**Independent Test**: Load a valid YouTube URL and, separately, a valid local video file. In both cases, confirm a visible "ready" state appears once (and only once) the video can actually be played, without needing to press play first to find out.

**Acceptance Scenarios**:

1. **Given** no video has been loaded yet, **When** the page loads, **Then** the load-state indicator clearly shows "nothing loaded" (not blank, not ambiguous).
2. **Given** the "nothing loaded" state, **When** the user submits a valid YouTube URL, **Then** the indicator immediately switches to a "loading" state, and switches again to a "ready" state once the video is actually playable.
3. **Given** the "nothing loaded" state, **When** the user selects a valid local video file, **Then** the indicator immediately switches to "loading" and then to "ready" once the file is actually playable, using the same visual language as the YouTube path.
4. **Given** a video is already "ready", **When** the user loads a different video (YouTube or local), **Then** the previous video clears immediately and the indicator resets to "loading" — it does not continue showing or playing the previous video while the new one loads.

---

### User Story 2 - Discover how to load a local video file (Priority: P2)

A user who wants to practice with a video file stored on their computer needs to recognize, at a glance, that this is possible and how to do it — distinct from the YouTube URL box.

**Why this priority**: Reported directly as a problem: it's currently unclear how to load a local file at all. This blocks an entire supported use case for affected users, but is secondary to P1 because it only affects the local-file path, not YouTube.

**Independent Test**: Show the page to someone unfamiliar with the app and confirm they can identify, without external instructions, that there are two distinct ways to load a video and correctly choose "local file" when asked to practice with a file on their own computer.

**Acceptance Scenarios**:

1. **Given** the page has just loaded, **When** the user looks at the video-loading area, **Then** the YouTube URL option and the local-file option are visually distinct, clearly labeled, and both look interactive (not mistaken for decoration or disabled controls).
2. **Given** the user intends to load a local file, **When** they interact with the local-file affordance, **Then** the operating system's file picker opens, scoped to video files.

---

### User Story 3 - Understand and recover from a failed load (Priority: P3)

A user pastes a broken/invalid YouTube URL, or selects a file the browser can't play, and needs to know the load failed (rather than assuming it's still loading or that the app is frozen) so they can try again.

**Why this priority**: Failure feedback matters but affects fewer sessions than the core "did it load" and "how do I load a file" problems; without it, users are only inconvenienced (they retry), not fully blocked.

**Independent Test**: Submit a malformed YouTube URL and, separately, select a non-video file (if the file picker allows it) or an unplayable video file. Confirm a distinct "failed to load" state appears with an understandable reason, and that the app remains usable immediately afterward.

**Acceptance Scenarios**:

1. **Given** the "nothing loaded" or "ready" state, **When** the user submits an invalid or unreachable YouTube URL, **Then** the indicator shows a distinct "failed to load" state with a short, understandable reason, and reverts to accepting a new attempt.
2. **Given** the "nothing loaded" or "ready" state, **When** the user selects a local file the browser cannot play, **Then** the indicator shows the same "failed to load" state with a short, understandable reason.

---

### Edge Cases

- User clicks the load control again (or resubmits) while a load is already in progress — the system must not start a second overlapping load or show conflicting states.
- User loads a valid video, then loads a second, different video before finishing watching/practicing the first — the indicator must reflect the new load, not the old one.
- YouTube URL points to a private, deleted, region-blocked, or otherwise unplayable video — this must surface as a failure, not a silent "ready" state.
- Local file is a valid video container but uses a codec the browser can't decode — this must surface as a failure once playback readiness fails, not report false "ready".
- User's network is slow or drops entirely while a YouTube video is loading — the "loading" state must persist (not silently disappear) until it resolves to "ready" or "failed".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a single, persistent load-state indicator with four distinguishable states: nothing loaded, loading, ready, and failed. Each state MUST be conveyed through an icon and short text label (not color alone), with color used only as secondary reinforcement, so the state is legible to colorblind users.
- **FR-002**: System MUST switch the indicator to the "loading" state immediately upon the user submitting a YouTube URL or selecting a local file — before the video itself is confirmed playable.
- **FR-003**: System MUST switch the indicator to the "ready" state only once the video is actually confirmed playable (not merely once a URL is accepted or a file is selected), for both YouTube and local-file sources.
- **FR-004**: System MUST switch the indicator to a "failed" state, with a short human-readable reason, when a load does not resolve to playable within 15 seconds or is reported as an error by the video source.
- **FR-005**: System MUST use the same visual language (indicator states) for both the YouTube and local-file loading paths, so users learn the states once and apply them to either source.
- **FR-006**: System MUST visually present the YouTube URL input and the local-file input as two distinct, clearly labeled, interactive affordances, both discoverable without external instructions.
- **FR-007**: System MUST prevent a new load from being started while another load is already in progress, until that load resolves to "ready" or "failed".
- **FR-008**: System MUST clear the previously loaded video immediately and reset the indicator to "loading" the instant a new load attempt begins, discarding any prior "ready" or "failed" state and not continuing to show or play the earlier video during the new load.
- **FR-009**: System MUST return to an actionable state (able to accept a new load attempt) immediately after showing "failed", without requiring a page reload.

### Key Entities

- **Load State**: The current status of the video-loading process at any given time. One of: nothing loaded, loading, ready, failed (with an associated short reason when failed). Applies uniformly regardless of whether the source is a YouTube URL or a local file.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can correctly identify the current load state (nothing loaded / loading / ready / failed) within 2 seconds of looking at the page, without taking any action.
- **SC-002**: 100% of load attempts (YouTube or local file) produce a visible "loading" indicator within 1 second of the user submitting the URL or selecting the file.
- **SC-003**: 0% of loads leave a stale "ready" indicator visible from a previously loaded video after a new load has been started.
- **SC-004**: In an unguided walkthrough, at least 90% of first-time users correctly locate and use the local-file loading affordance when asked to practice with a file from their own computer.
- **SC-005**: When a load fails, users can, without external help, understand that it failed and successfully attempt another load on their first retry at least 90% of the time.

## Assumptions

- This feature is a feedback/UI-clarity improvement, not a change to what can be loaded: YouTube URLs and local video files remain the only two supported sources.
- "Ready" means the existing player abstraction reports the video is actually playable (e.g., YouTube player-ready/cued state, or the local `<video>` element reporting it can play) — not merely that a URL was accepted or a file was chosen.
- The load-state indicator communicates state only (icon + short text label, with color as secondary reinforcement); it is not required to display the video's title or filename as part of this feature.
- The local-file affordance is clarified and made visually discoverable using the existing file-picker mechanism (styled button/label triggering the OS file picker); adding drag-and-drop file loading is out of scope for this feature.
- Playback and loop controls are expected to be visually inert or clearly non-functional while the state is "nothing loaded", "loading", or "failed", to avoid users interacting with controls that have no video to act on. Exact control-disabling behavior is left to implementation, provided it doesn't contradict the states above.
- No persistence of load history across page reloads is required; the indicator always starts at "nothing loaded" on a fresh page load.
