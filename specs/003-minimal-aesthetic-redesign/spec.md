# Feature Specification: Minimal Aesthetic Redesign

**Feature Branch**: `003-minimal-aesthetic-redesign`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Redesign the site's visual aesthetic toward a modern, ultra-minimal, monochrome look, with the video player made as large as possible by minimizing the visual footprint of every other element. The existing logo image must be kept exactly as-is; every other visual element (colors, layout, control styling) is open for reconsideration, within the project's constitution (no new external dependencies, no build step, existing keyboard shortcuts unchanged). Specific behavioral requirements: the header (logo, title, About/Build buttons) remains persistently visible at all times, restyled to match the new minimal palette, but not hidden or shrunk when a video is loaded. The video-loading controls (YouTube URL field, local file picker, and the load-state indicator) are visible by default, but once a video has successfully loaded, they hide themselves so the player can claim that space. They reappear when the user hovers near their area, and hide again when the user moves away. The playback/loop controls behave the same way: visible by default, but once a video is loaded they shrink/fade out of view regardless of whether the video is playing or paused, reappearing on hover and hiding again afterward. All existing functionality and keyboard shortcuts must keep working identically while controls are hidden. The loop timeline stays always visible, never hiding with the other controls. The video player itself should grow as large as the layout allows, capped at a generous maximum size on very large/ultrawide screens rather than stretching edge-to-edge. Keep the current dark theme as the aesthetic base, refined into a more modern, higher-contrast monochrome palette. The prior color-coding that matched on-screen buttons to the physical foot pedal's colored buttons is not a requirement to preserve. Success looks like: a first-time visitor perceives the site as clean, modern, and video-focused, with no loaded video losing screen real estate to controls that aren't currently needed, while every existing feature continues to work exactly as it does today."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Practice with an unobstructed, maximized video player (Priority: P1)

A guitarist loads a video to practice with and wants it to take up as much of the screen
as possible while practicing, with the loading and playback controls out of the way
until actually needed, but instantly available again with a simple hover.

**Why this priority**: This is the core, explicitly requested outcome — the video player
becoming as large as possible is the primary driver of this redesign. Without it, the
aesthetic refresh alone doesn't deliver the requested space-maximization.

**Independent Test**: Load a video, stop interacting with the controls, and confirm the
player visibly grows into the space the loading and playback controls previously
occupied, with the timeline and header remaining visible. Hover over where those hidden
controls used to be and confirm they reappear; move away and confirm they hide again.

**Acceptance Scenarios**:

1. **Given** no video is loaded, **When** the page is viewed, **Then** the YouTube URL
   field, local-file picker, load-state indicator, and all playback/loop controls are
   visible, exactly as discoverable as before.
2. **Given** a video has just reached the "ready" state, **When** the user is not
   hovering over the loading-controls area, **Then** the YouTube URL field, local-file
   picker, and load-state indicator hide, and the player grows to occupy that reclaimed
   space.
3. **Given** a video is "ready" and the loading controls are hidden, **When** the user
   moves the mouse into the area where those controls would appear, **Then** they
   reappear; **When** the user moves away, **Then** they hide again after a brief pause.
4. **Given** a video is "ready", **When** the user is not hovering over the
   playback/loop-controls area, **Then** those controls (play/pause, speed, loop
   shift/length/set, and the manual speed/loop fields) shrink or fade out of view,
   regardless of whether the video is currently playing or paused.
5. **Given** a video is "ready" and the playback controls are hidden, **When** the user
   moves the mouse into the area where those controls would appear, **Then** they
   reappear; **When** the user moves away, **Then** they hide again after a brief pause.
6. **Given** the loading or playback controls are hidden, **When** the user presses any
   existing keyboard shortcut or uses the physical foot pedal, **Then** it behaves
   exactly as it does today — hiding controls only changes visual presentation, never
   functionality.
7. **Given** a video is "ready" and its loading controls are hidden, **When** the user
   loads a new video and that load fails or is still in progress, **Then** the loading
   controls (and the load-state indicator showing "loading"/"failed") automatically
   become visible again, without requiring a hover — since the user needs to see that
   feedback and, for a failure, may need to correct the input.
8. **Given** any state (loaded or not), **When** the user looks at the page, **Then**
   the header (logo, title, About/Build buttons) and the loop timeline are always
   visible, never hidden by this behavior.

---

### User Story 2 - A modern, clean, minimal visual style (Priority: P1)

A visitor's first impression of the site should read as modern, deliberate, and
uncluttered, rather than the current mix of bright accent colors and boxy controls.

**Why this priority**: Explicitly requested alongside the space-maximization goal — the
user described these as inseparable ("as large as possible... without compromising
aesthetic beauty"). A larger player in an unrefreshed visual shell would not satisfy the
request.

**Independent Test**: Show the redesigned site to someone and confirm they describe it
as modern, clean, and minimal/monochrome, without needing the space-maximization
behavior from User Story 1 to be present to form that impression (e.g., testable even
with no video loaded, where everything is still visible).

**Acceptance Scenarios**:

1. **Given** the site with no video loaded, **When** a visitor views it, **Then** the
   overall look uses a refined, higher-contrast dark monochrome palette rather than the
   current mix of bright red/blue/green/yellow accent colors on the transport controls.
2. **Given** the existing logo image, **When** the redesign is applied, **Then** the
   logo image itself is pixel-for-pixel unchanged.
3. **Given** the redesigned controls (buttons, inputs, indicator), **When** compared to
   today's versions, **Then** they are visually simplified/restyled to match the new
   palette, without changing their labels' meaning or their function.

---

### Edge Cases

- A user hovers over the loading-controls area, then immediately starts typing/pasting
  a new URL — the controls must stay visible throughout that interaction, not hide
  mid-edit.
- A user's mouse passes briefly over a hidden-controls area without stopping (e.g.,
  moving the cursor across the screen to another part of the page) — this should not
  cause jarring flicker; a brief hover is enough to reveal, and a brief exit shouldn't
  instantly hide (see Assumptions for the specific delay behavior).
- A user on a touch device (no hover capability) needs some way to reveal hidden
  controls — see Assumptions; a tap-based fallback is out of scope for this iteration
  but noted for future consideration.
- The video player's maximum size cap must still leave enough room for the
  always-visible header and timeline without overlapping them, on both very large and
  smaller/laptop-sized screens.
- If a user reloads the page while a video was previously "ready", the page returns to
  its default state (loading controls and playback controls visible, nothing loaded) —
  consistent with existing behavior; no new persistence is introduced by this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site's visual design MUST be refreshed to a modern, higher-contrast,
  monochrome-based dark theme, replacing the current bright per-button accent colors
  with a cohesive minimal palette.
- **FR-002**: The existing logo image MUST remain visually unchanged.
- **FR-003**: The header (logo, title, "About" and "Build" buttons) MUST remain visible
  at all times, restyled to match the new palette, and MUST NOT hide or shrink based on
  load state.
- **FR-004**: The loop timeline MUST remain visible at all times, and MUST NOT be
  included in any hide/reveal behavior introduced by this feature.
- **FR-005**: The YouTube URL field, local-file picker, and load-state indicator MUST be
  visible whenever the load state is anything other than "ready" (i.e., nothing loaded,
  loading, or failed), matching today's default visibility.
- **FR-006**: Once the load state becomes "ready", the YouTube URL field, local-file
  picker, and load-state indicator MUST hide, unless the user is hovering over the area
  they occupy.
- **FR-007**: While the load state is "ready" and those controls are hidden, moving the
  mouse into their area MUST reveal them; moving away MUST hide them again after a brief
  pause (not instantly, to avoid flicker from incidental cursor movement).
- **FR-008**: If the load state changes away from "ready" (a new load begins, fails, or
  the page is reset), the loading controls MUST automatically become visible again,
  without requiring a hover.
- **FR-009**: Once the load state becomes "ready", the playback/loop controls
  (play-pause, speed up/down, loop shift/length/set, loop control, and the manual
  speed/loop entry fields) MUST shrink or fade out of view, regardless of whether the
  video is currently playing or paused.
- **FR-010**: While the playback/loop controls are hidden, moving the mouse into their
  area MUST reveal them; moving away MUST hide them again after a brief pause, mirroring
  FR-007.
- **FR-011**: All existing functionality — keyboard shortcuts, the physical foot pedal,
  and every button's behavior — MUST continue to work identically whether the controls
  it corresponds to are currently visible or hidden. This feature changes visual
  presentation only, never behavior.
- **FR-012**: The video player MUST grow to occupy the space reclaimed when the loading
  and/or playback controls hide, up to a generous maximum size; it MUST NOT stretch
  edge-to-edge on very large or ultrawide screens.
- **FR-013**: No new external dependencies (fonts, icon libraries, scripts, or
  stylesheets) may be introduced; the redesign MUST be achievable with the existing
  Remix Icons and YouTube IFrame API resources and the existing system font stack, per
  the project constitution's Zero-Build, CDN-Only Dependencies principle.
- **FR-014**: This feature MUST NOT change the keyboard shortcut key mapping, per the
  project constitution's Pedal-Synced Keyboard Shortcuts principle.

### Key Entities

- No new data entities. This feature is a visual/layout redesign and reuses the
  existing "Load State" entity (from the Video Load Feedback feature) purely as the
  trigger condition for the hide/reveal behavior described above.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With a video loaded and the controls not being hovered, the video player
  occupies at least 80% of the vertical space between the header and the bottom of the
  browser viewport, on a standard desktop window size.
- **SC-002**: In an unguided walkthrough, at least 90% of users who move their mouse
  toward the top or bottom of the screen while a video is loaded successfully reveal
  the hidden controls without being told how.
- **SC-003**: 100% of existing keyboard shortcuts and pedal-driven interactions continue
  to function identically after this redesign, with zero regressions against the
  existing automated test suite.
- **SC-004**: In an informal review, first-time viewers describe the redesigned site as
  "modern," "clean," or "minimal" without being prompted with those words.
- **SC-005**: The logo image is verified pixel-identical to the pre-redesign version.

## Assumptions

- "Hovering near their area" means the user's mouse is positioned over the region of
  the page where the relevant hidden controls would render when visible (e.g., the top
  region for loading controls, the bottom region for playback controls) — not the
  player itself.
- The "brief pause" before hiding controls again after the mouse leaves their area is an
  implementation detail to be tuned for feel (e.g., in the half-second-to-one-second
  range), not a precise contractual value.
- Touch-device support for revealing hidden controls (no hover capability) is out of
  scope for this iteration; this redesign is optimized for the desktop/mouse experience
  this app is primarily used in (paired with a USB foot pedal), consistent with the
  project's existing scope.
- The prior color-coding that matched on-screen transport buttons to the physical
  pedal's colored buttons (per the README) is intentionally not preserved, per explicit
  instruction — the pedal's physical button colors and the on-screen palette may now
  diverge.
- "Generous maximum size" for the player (FR-012) is an implementation detail to be
  chosen during planning/design, not a specific pixel value fixed by this spec.
