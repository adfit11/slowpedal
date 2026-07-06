# Feature Specification: Persistent Bottom Controls and Matching Status Radius

**Feature Branch**: `004-fixed-controls-radius-match`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "A couple more aesthetic changes. The round control buttons at the bottom of the page should also be always be visible and never fade away. The radius on the status box next to the video loading controls at the top should always have the same radius on its corners as those that contain the video controls."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Playback controls stay visible at all times (Priority: P1)

A guitarist practicing with a loaded video wants the play/pause, speed, and loop
controls to always be on screen and clickable, never hidden or faded away, regardless
of whether the video is playing, paused, or how long it's been since they last touched
the mouse.

**Why this priority**: This directly reverses a behavior introduced by the Minimal
Aesthetic Redesign feature that the user has found undesirable in practice — these
controls are used continuously during practice, unlike the video-loading controls
(which are only needed once, at the start), so hiding them adds friction rather than
removing clutter.

**Independent Test**: Load a video and let it reach "ready." Without hovering over the
bottom of the screen, confirm the playback/loop controls remain fully visible and
clickable — before, during, and after playback, indefinitely.

**Acceptance Scenarios**:

1. **Given** a video is "ready," **When** the user does not interact with the page for
   an extended period, **Then** the playback/loop controls (play-pause, speed up/down,
   loop shift/length/set/control) remain fully visible, at full opacity, and clickable.
2. **Given** a video is playing, **When** the user moves the mouse away from the bottom
   of the screen, **Then** the playback/loop controls do not fade or hide.
3. **Given** the loading controls (YouTube URL field, local-file picker, load-state
   indicator) at the top of the screen, **When** a video reaches "ready," **Then** they
   continue to hide-and-reveal-on-hover exactly as before — this feature only changes
   the bottom playback/loop controls, not the top loading controls.

---

### User Story 2 - Status indicator's corners match the loading-control boxes (Priority: P2)

A visitor notices the load-state indicator ("Nothing loaded" / "Ready" / etc.) has
more rounded corners than the boxes next to it that contain the YouTube-link and
local-file controls, which reads as visually inconsistent.

**Why this priority**: A small but noticeable visual polish issue on the same row of
controls; lower priority than User Story 1 since it's cosmetic only, with no functional
impact.

**Independent Test**: With nothing loaded, compare the corner rounding of the
load-state indicator box against the boxes containing the YouTube-URL and local-file
controls — they should look like they belong to the same family of shapes.

**Acceptance Scenarios**:

1. **Given** the load-state indicator and the two video-loading control boxes are all
   visible, **When** a user compares their corners, **Then** the load-state
   indicator's corner radius matches the video-loading control boxes' corner radius
   exactly.
2. **Given** any future change to the video-loading control boxes' corner rounding,
   **When** that change is made, **Then** the load-state indicator's corner rounding
   updates to match automatically (i.e., both are driven by the same underlying value,
   not two separately-maintained numbers that can drift apart again).

---

### Edge Cases

- Because the bottom playback/loop controls no longer hide, the video player will
  reclaim somewhat less screen space than it did immediately after the Minimal
  Aesthetic Redesign feature shipped — this is an accepted, intentional tradeoff of
  this change, not a defect. The top loading controls still hide/reveal as before, so
  the player still gains space there.
- The playback/loop controls remain visually presented the same way they are now
  (as a control bar along the bottom edge of the player) — this feature makes them
  permanently visible, it does not otherwise redesign their appearance or position.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The playback/loop controls (play-pause, speed up/down, loop shift/length/
  set/control, and the manual speed/loop entry fields) MUST always be visible and
  clickable whenever a video is loaded, regardless of load state, play/pause state, or
  mouse/hover activity.
- **FR-002**: The hide-and-reveal-on-hover behavior for the top loading controls
  (YouTube URL field, local-file picker, and load-state indicator), as established by
  the Minimal Aesthetic Redesign feature, is unchanged by this feature.
- **FR-003**: The load-state indicator's container MUST use the same corner-radius
  value as the containers wrapping the YouTube-URL and local-file controls.
- **FR-004**: The corner-radius values in FR-003 MUST be defined so that changing one
  updates the other automatically, rather than being two independently-set values that
  happen to match today and can silently drift apart in a future change.
- **FR-005**: This feature MUST NOT change the keyboard shortcut key mapping
  (Constitution Principle II) and MUST NOT introduce any new external dependency
  (Constitution Principle I).

### Key Entities

- No new data entities. This feature adjusts the existing hide/reveal behavior (from
  the Minimal Aesthetic Redesign feature) and CSS styling only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The playback/loop controls are visible and clickable in 100% of manual
  checks performed across all load states (nothing loaded / loading / ready / failed)
  and both play and pause states, with no hover required.
- **SC-002**: The load-state indicator's rendered corner radius is pixel-identical to
  the video-loading control boxes' corner radius.
- **SC-003**: Zero regressions to the top loading controls' existing hide/reveal
  behavior, verified against the existing automated test suite for that feature.

## Assumptions

- The playback/loop controls keep their current visual treatment and position (a
  control bar overlaid along the bottom edge of the player, with its background scrim)
  — this feature only removes the fade-out/hide behavior, it does not move these
  controls back into the page's normal document flow below the player. Making them
  permanently visible as an always-on overlay is the simplest change that satisfies
  "always visible, never fade away," and matches how many video players present a
  persistent control bar.
- "The same radius on its corners as those that contain the video controls" refers to
  the existing boxes wrapping the YouTube-URL and local-file affordances (currently a
  more rounded-rectangle style); the load-state indicator (currently a more pill-shaped
  style) will be changed to match those, not the other way around.
