# Contract: Control Overlay Hide/Reveal Behavior

This is the internal contract between the load-state machine (existing,
`js/scripts.js`), the two new hover hotzones, and the CSS that reacts to both. Not a
network/API contract — this is a static site — but it's the seam future changes to
either the load-state logic or the layout need to respect.

## State input: `body.state-ready`

- **Set by**: `setLoadReady()` — add the class.
- **Cleared by**: `setLoadLoading()` and `setLoadFailed()` — remove the class.
- **Consumed by**: CSS rules of the form `body.state-ready #top-controls:not(.revealed) { opacity: 0; pointer-events: none; }` (and the equivalent for `#bottom-controls`).
- **Guarantee**: This class reflects `loadState === 'ready'` at all times; any of the
  three functions above running is sufficient to keep it in sync — no other code path
  may set `loadState` without going through one of them (already true today).

## Hover input: `.revealed` on each hotzone

- **Hotzones**: two containers, one wrapping `#top-controls`, one wrapping
  `#bottom-controls` (or the containers themselves, if no extra wrapper is needed once
  they're repositioned as overlays) — each spans the full width of its edge (top/bottom
  of the enlarged player area) so the mouse can find it without precision-aiming at the
  (possibly invisible) controls within.
- **`mouseenter`**: add `.revealed` to that hotzone immediately, and cancel any pending
  hide timer for it.
- **`mouseleave`**: start a timer (500–800ms); when it fires, remove `.revealed` from
  that hotzone. If `mouseenter` fires again before the timer elapses, the timer is
  cancelled (per the `mouseenter` behavior above).
- **Consumed by**: the same CSS rules as above — `.revealed` on the hotzone overrides
  the `body.state-ready` hiding rule for the controls nested inside it.
- **Independence**: the top and bottom hotzones/timers are entirely independent of
  each other — hovering one never affects the other's visibility.

## Non-goals

- No new methods are added to `VideoPlayer`. No changes to `loadVideo()`,
  `loadLocalVideo()`, or any playback/loop function's *behavior* — only whether their
  corresponding on-screen controls are currently visible.
- No keyboard-shortcut changes. Pressing `space`/`a`/`s`/`d`/`f`/`g`/`h`/`j` (or the
  physical pedal sending the same keys) continues to work identically regardless of
  `body.state-ready` or either `.revealed` class's state.
- No touch/tap-based reveal mechanism (see spec Assumptions — out of scope this
  iteration).
