# Feature Specification: Bottom Controls Always Fit Within the Browser Window

**Feature Branch**: `005-viewport-fit-bottom-controls`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "The control buttons at the bottom of the screen need to always be visible, despite the size of the browser window. Right now, if the browser window is too shallow, they will disappear off the bottom, below the fold."

## Clarifications

### Session 2026-07-06

- Q: When the browser window is too short for the video player at its normal size plus the bottom controls, should the player shrink to make room (so nothing needs scrolling), or should the bottom controls stay fixed to the bottom of the browser window regardless (so the player may extend further down, off-screen, while the controls float in front of it)? → A: Pin the controls to the bottom of the browser window (viewport-fixed) — the controls are always visible without scrolling, but the video player keeps its normal sizing and may extend beyond the visible window on short windows, requiring a scroll to see the parts of the player that don't fit.

### Session 2026-07-07 (Revision)

- The pinned-controls approach above was implemented, committed, and verified working —
  but on reflection the user changed their mind: **the player shrinking to fit is
  preferred instead**. This session's decision supersedes the 2026-07-06 answer above
  (left in place for history, per this project's practice of recording rather than
  erasing prior decisions). The rest of this document reflects the new, current
  direction: the whole page (header, player, timeline, controls) is constrained to fit
  within the browser window's height, with the video player shrinking as needed so
  nothing ever requires scrolling — not even on short windows.

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
typical laptop screen) with a video loaded, and confirm the entire page — including the
playback/loop controls — remains fully visible and clickable without any scrolling, with
the video player shrinking as needed to make room.

**Acceptance Scenarios**:

1. **Given** a video is loaded, **When** the browser window is resized shorter, **Then**
   the video player shrinks as needed so that the header, player, timeline, and
   playback/loop controls all remain visible within the window at once, with no
   vertical scrolling required.
2. **Given** an extremely short browser window, **When** there isn't enough room for
   everything at a normal, usable size, **Then** the video player continues shrinking
   rather than the page requiring a scroll — the playback/loop controls must never be
   the part that gets compromised; if anything gives, it's the video player's size.
3. **Given** the window is resized back to a taller size, **When** there is once again
   enough room, **Then** the video player grows back to its normal, larger size (per the
   Minimal Aesthetic Redesign feature's sizing behavior), and the layout looks exactly
   as it did before this feature.

---

### Edge Cases

- Very short windows (e.g., under a few hundred pixels tall) may not have room for a
  "usable" video size at all — the controls remaining visible and clickable, and no
  scrolling ever being required, takes priority over the video maintaining a
  comfortable minimum size in that extreme case.
- Resizing the window while a loop is set or the video is playing must not interrupt
  playback or reset the loop — only the layout's sizing responds to the resize.
- This applies to both the YouTube and local-file playback paths equally, since both
  render into the same player area.
- The video player's width and the timeline's width must shrink together and stay
  visually aligned — the timeline must not end up wider or narrower than the
  now-smaller player above it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The playback/loop controls at the bottom of the screen MUST remain
  fully visible and clickable within the browser window at all times, regardless of
  the window's height, without requiring the user to scroll.
- **FR-002**: The video player MUST reduce its size as needed to keep the header,
  player, timeline, and playback/loop controls simultaneously visible within the
  browser window's current height, with no vertical scrolling ever required.
- **FR-003**: The video player MUST return to its normal, larger sizing (as
  established by the Minimal Aesthetic Redesign feature) once the window is tall
  enough again to accommodate it.
- **FR-004**: This feature MUST NOT change the keyboard shortcut key mapping
  (Constitution Principle II) or introduce any new external dependency (Constitution
  Principle I).
- **FR-005**: This feature MUST NOT change whether the playback/loop controls are
  hidden/shown based on load state — they remain permanently visible per the
  Persistent Bottom Controls feature; this feature only ensures that "visible" also
  means "within the browser window," not just "not faded out."
- **FR-006**: The timeline's width MUST track the video player's current (possibly
  shrunk) width, so the two remain visually aligned at every window size.

### Key Entities

- No new data entities. This feature adjusts layout/sizing behavior only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With a video loaded, the entire page — header, player, timeline, and
  playback/loop controls — is fully visible and clickable without scrolling at every
  browser window height from a typical full-screen laptop display down to a small
  fraction of that height, verified across a range of window sizes.
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
- No specific minimum player size is mandated; the video may become quite small on an
  extremely short window. The requirement is that the controls stay visible and usable
  and that nothing ever requires scrolling, not that the video stays above some minimum
  size.
