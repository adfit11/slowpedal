# Feature Specification: Bottom Controls Always Fit Within the Browser Window

**Feature Branch**: `005-viewport-fit-bottom-controls`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "The control buttons at the bottom of the screen need to always be visible, despite the size of the browser window. Right now, if the browser window is too shallow, they will disappear off the bottom, below the fold."

## Clarifications

### Session 2026-07-06

- Q: When the browser window is too short for the video player at its normal size plus the bottom controls, should the player shrink to make room (so nothing needs scrolling), or should the bottom controls stay fixed to the bottom of the browser window regardless (so the player may extend further down, off-screen, while the controls float in front of it)? → A: Pin the controls to the bottom of the browser window (viewport-fixed) — the controls are always visible without scrolling, but the video player keeps its normal sizing and may extend beyond the visible window on short windows, requiring a scroll to see the parts of the player that don't fit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bottom controls stay reachable on any window size (Priority: P1)

A guitarist resizes their browser window to a short, wide shape (e.g., to fit alongside
sheet music or a tab on the same screen) and expects the play/pause, speed, and loop
controls to remain visible and clickable without needing to scroll the page.

**Why this priority**: This is a regression against the "always visible" behavior
delivered by the Persistent Bottom Controls feature — those controls are permanently
shown, but can still end up positioned below the visible area on a short window,
which defeats the purpose of making them permanent in the first place.

**Independent Test**: Resize the browser window to a short height (e.g., a third of a
typical laptop screen) with a video loaded, and confirm the playback/loop controls are
still fully visible and clickable without scrolling — at every window height down to a
reasonable practical minimum.

**Acceptance Scenarios**:

1. **Given** a video is loaded, **When** the browser window is resized shorter, **Then**
   the playback/loop controls remain pinned to the bottom edge of the browser window
   itself (not the bottom of the page content), staying fully visible and clickable
   without any scrolling.
2. **Given** the browser window is too short to show the entire video player at its
   normal size above the pinned controls, **When** the user wants to see the parts of
   the player that don't fit, **Then** the page may be scrolled to reveal them, but the
   playback/loop controls stay fixed in place at the bottom of the window throughout
   that scroll — they are never part of what scrolls away.
3. **Given** the window is resized back to a taller size, **When** there is once again
   enough room for the video player at its normal size, **Then** no scrolling is needed
   and the layout looks exactly as it did before this feature (per the Minimal
   Aesthetic Redesign and Persistent Bottom Controls features' existing behavior).

---

### Edge Cases

- Resizing the window while a loop is set or the video is playing must not interrupt
  playback or reset the loop — only the controls' fixed positioning responds to the
  resize.
- This applies to both the YouTube and local-file playback paths equally, since both
  render into the same player area.
- The pinned controls bar must not permanently obscure part of the video player on tall
  windows — it should only become a fixed overlay in front of the player when there
  isn't enough vertical room, consistent with its current overlay presentation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The playback/loop controls at the bottom of the screen MUST remain
  pinned to the bottom of the browser's visible viewport at all times, regardless of
  the window's height or how far the page content is scrolled — they must never be
  scrollable out of view.
- **FR-002**: The video player and page layout otherwise keep their existing sizing
  behavior (per the Minimal Aesthetic Redesign feature) unchanged; this feature does
  not alter how large the player grows or shrinks.
- **FR-003**: When the browser window is too short to show the full page (header,
  player, timeline, and pinned controls) at once, the page MAY require scrolling to
  view all of the video player, but the playback/loop controls themselves MUST remain
  visible and clickable throughout, without needing to be scrolled into view.
- **FR-004**: This feature MUST NOT change the keyboard shortcut key mapping
  (Constitution Principle II) or introduce any new external dependency (Constitution
  Principle I).
- **FR-005**: This feature MUST NOT change whether the playback/loop controls are
  hidden/shown based on load state — they remain permanently visible per the
  Persistent Bottom Controls feature; this feature only ensures that "visible" also
  means "within the browser window," not just "not faded out."

### Key Entities

- No new data entities. This feature adjusts layout/positioning behavior only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With a video loaded, the playback/loop controls are fully visible and
  clickable without any scrolling at every browser window height from a typical
  full-screen laptop display down to a small fraction of that height, verified across
  a range of window sizes.
- **SC-002**: Resizing the browser window taller or shorter does not interrupt video
  playback or reset an active loop.
- **SC-003**: Zero regressions to the existing player-sizing behavior (growing to a
  generous maximum width) or the loading-controls hide/reveal behavior on normal,
  full-height windows.

## Assumptions

- "The size of the browser window" refers to the browser's viewport (visible content
  area), not the physical screen resolution — the same behavior applies whether the
  window is short because the screen itself is small or because the user has manually
  resized/repositioned the window.
- On short windows, some vertical scrolling of the page content (to see the full video
  player) is acceptable; what's not acceptable is the playback/loop controls being part
  of what scrolls away.
