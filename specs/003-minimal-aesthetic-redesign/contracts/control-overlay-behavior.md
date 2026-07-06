# Contract: Control Overlay Hide/Reveal Behavior

> **Amended by the Persistent Bottom Controls and Matching Status Radius feature
> (specs/004-fixed-controls-radius-match)**: this contract now governs only
> `#top-controls`. `#bottom-controls` was removed from it — the playback/loop controls
> are permanently visible and no longer participate in `body.state-ready` or any hover
> hotzone. `#bottom-controls` keeps the overlay *position*/scrim this feature gave it,
> just not the hiding behavior. The sections below describe the current (post-004)
> contract; where useful, the prior two-zone behavior is noted for history.

This is the internal contract between the load-state machine (existing,
`js/scripts.js`), the hover hotzone, and the CSS that reacts to it. Not a network/API
contract — this is a static site — but it's the seam future changes to either the
load-state logic or the layout need to respect.

## State input: `body.state-ready`

- **Set by**: `setLoadReady()` — add the class.
- **Cleared by**: `setLoadLoading()` and `setLoadFailed()` — remove the class.
- **Consumed by**: the CSS rule `body.state-ready #top-controls > * { opacity: 0; pointer-events: none; }` (overridden by `.revealed`, below). `#bottom-controls` no longer has an equivalent rule as of feature 004.
- **Guarantee**: This class reflects `loadState === 'ready'` at all times; any of the
  three functions above running is sufficient to keep it in sync — no other code path
  may set `loadState` without going through one of them (already true today).

## Hover input: `.revealed` on the hotzone

- **Hotzone**: `#top-controls` itself — spans the full width of the top edge of the
  enlarged player area, so the mouse can find it without precision-aiming at the
  (possibly invisible) controls within. (Prior to feature 004, `#bottom-controls` was a
  second, independent hotzone using the same mechanism; it no longer is.)
- **`mouseenter`**: add `.revealed` to the hotzone immediately, and cancel any pending
  hide timer.
- **`mouseleave`**: start a timer (~600ms); when it fires, remove `.revealed`. If
  `mouseenter` fires again before the timer elapses, the timer is cancelled (per the
  `mouseenter` behavior above).
- **Consumed by**: the same CSS rule as above — `.revealed` on the hotzone overrides
  the `body.state-ready` hiding rule for the controls nested inside it.
- **Implementation**: `initControlZoneHover(zoneId)` in `js/scripts.js`, called once,
  for `'top-controls'` only.

## Non-goals

- No new methods are added to `VideoPlayer`. No changes to `loadVideo()`,
  `loadLocalVideo()`, or any playback/loop function's *behavior* — only whether their
  corresponding on-screen controls are currently visible.
- No keyboard-shortcut changes. Pressing `space`/`a`/`s`/`d`/`f`/`g`/`h`/`j` (or the
  physical pedal sending the same keys) continues to work identically regardless of
  `body.state-ready` or the `.revealed` class's state.
- No touch/tap-based reveal mechanism (see spec Assumptions — out of scope this
  iteration).
