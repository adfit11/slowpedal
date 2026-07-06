# Contract: Viewport-Fit Player Sizing

> **Revision (2026-07-07)**: This contract replaces an earlier version of the same file
> (previously named `bottom-controls-viewport-anchor.md`), which specified pinning
> `#bottom-controls` to the viewport via `position: fixed`. That approach was
> implemented, committed, and verified working, but the user changed their mind
> afterward: shrinking the player to fit is preferred instead, so nothing ever requires
> scrolling — not even the video itself. This document describes the current
> (shrink-to-fit) contract only.

This is the internal contract for how the video player is sized to guarantee the whole
page fits the browser window. Not a network/API contract — this is a static site — but
it's the seam future layout changes need to respect so this bug (controls/player
disappearing below the fold on short windows) cannot silently reappear.

## Sizing rule: `fitPlayerToViewport()` (`js/scripts.js`)

- **Inputs measured live**: `window.innerHeight`, `header.offsetHeight`,
  `timelineContainer.offsetHeight`, `#main-content`'s computed `padding-top`,
  `#timeline-container`'s computed `margin-top`, and `#main-content`'s `clientWidth`.
- **Computation**:
  - `reservedHeight` = header height + timeline height + main-content's top padding +
    timeline's top margin (the vertical space that isn't available to the player).
  - `availableHeight` = `window.innerHeight - reservedHeight`, floored at `40px` so the
    computed size never goes to zero or negative.
  - `width` = the smallest of: 96% of `#main-content`'s width, `1500px` (the existing
    generous max-width cap from the Minimal Aesthetic Redesign feature), and
    `availableHeight * (16 / 9)` (the width that would make a 16:9 player exactly fill
    the available height).
- **Applied to**: `#player-container.style.width` and `#timeline-container.style.width`
  — both set to the same computed pixel value, so they always track each other exactly.
  `#player-container`'s height follows automatically from its CSS `aspect-ratio: 16/9`.
- **Triggered**: once on script load, and on every `window resize` event. No debounce —
  the computation is cheap (a few property reads and two style writes).
- **Guarantee**: At every browser window height, the header, player, timeline, and
  playback/loop controls overlay are all simultaneously visible with no scrolling
  required, at either the page or `#main-content` level.

## Supporting CSS requirements

These are easy to silently break by "cleaning up" the CSS later, so they're recorded
explicitly:

- `#main-content` MUST have `min-height: 0` — a flex item's default `min-height: auto`
  floors it at its content's natural size, which would prevent it from shrinking below
  that even when `fitPlayerToViewport()` asks for less room.
- `#player-container` MUST have `min-height: 0` — same issue, but specifically because
  the `<video>` element (`#html5-player`) has an intrinsic default size (300×150) that
  otherwise floors the flex item's automatic minimum height regardless of the
  `aspect-ratio`-derived size. Without this, the player cannot shrink below ~150px tall
  no matter how short the window is.
- `#bottom-controls` stays `position: absolute` (anchored to `#player-area`'s own box,
  not the viewport) — safe again now that `#player-area` is guaranteed to fit within the
  browser window.

## Non-goals

- No new methods are added to `VideoPlayer`. No changes to `loadVideo()`,
  `loadLocalVideo()`, or any playback/loop function's *behavior*.
- No keyboard-shortcut changes. Pressing `space`/`a`/`s`/`d`/`f`/`g`/`h`/`j` (or the
  physical pedal sending the same keys) is unaffected by this sizing logic.
- No minimum player size is enforced beyond the `40px`-floored `availableHeight` — on an
  extremely short window the player may become quite small; the guarantee is that
  nothing requires scrolling, not that the video stays above some comfortable size.
