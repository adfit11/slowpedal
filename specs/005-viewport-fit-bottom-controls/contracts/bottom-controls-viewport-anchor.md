# Contract: `#bottom-controls` Viewport Anchoring

This is the internal contract for how the playback/loop controls overlay is positioned.
Not a network/API contract — this is a static site — but it's the seam future layout
changes need to respect so this bug (controls disappearing below the fold on short
windows) cannot silently reappear.

This contract is independent of, and does not modify,
`specs/003-minimal-aesthetic-redesign/contracts/control-overlay-behavior.md` (which
governs `#top-controls`' hide/reveal opacity behavior only). `#bottom-controls`'
visibility (always shown, never fades — feature 004) is unaffected by this contract;
this contract governs only its *positioning*.

## Positioning rule

- **Selector**: `#bottom-controls`
- **Anchor**: the browser viewport (`position: fixed`), not `#player-area` or any other
  scrollable ancestor.
- **Placement**: `bottom: 0; left: 0; right: 0;` — spans the full width of the window,
  pinned to its bottom edge.
- **Guarantee**: At every browser window height, and at every scroll position of
  `#main-content`, `#bottom-controls` and its children remain within the visible
  viewport and clickable. No scroll action can move it out of view.
- **z-index**: Stays above the player (`z-index: 10`, unchanged from feature 003) so it
  remains visible as an overlay in front of the video when the two overlap on short
  windows.

## Non-goals

- Does not change whether `#bottom-controls` is visible/hidden (feature 004: always
  visible, no hide/reveal logic applies to it).
- Does not change the video player's own sizing rules (`#player-container`,
  `#timeline-container` keep their existing max-width/aspect-ratio behavior from the
  Minimal Aesthetic Redesign feature).
- Does not introduce any scroll-locking, resize listener, or other JavaScript — the
  guarantee is achieved purely through CSS positioning.
- No keyboard-shortcut changes. Pressing `space`/`a`/`s`/`d`/`f`/`g`/`h`/`j` (or the
  physical pedal sending the same keys) is unaffected by this positioning change.
