# Phase 0 Research: Bottom Controls Always Fit Within the Browser Window

> **Revision (2026-07-07)**: The original decision below (pin `#bottom-controls` to the
> viewport via `position: fixed`) was implemented, committed, and verified working. The
> user then changed their mind: shrinking the player to fit is preferred instead. That
> original research is kept below for history; the current decision follows it.

## Current decision: Shrink the player to fit via a small resize handler

**Decision**: Add a `fitPlayerToViewport()` function in `js/scripts.js` that computes,
from live measurements (`window.innerHeight`, header height, timeline height, and
relevant paddings/margins), the largest 16:9 width that lets the header, player,
timeline, and playback/loop controls all fit within the browser window's height. It
sets that width (in px) on both `#player-container` and `#timeline-container`, so they
always match; `#player-container`'s height then follows automatically from its existing
`aspect-ratio: 16/9`. Runs once on load and on every `resize` event. `#bottom-controls`
reverts to `position: absolute` (its original, pre-005 behavior) since `#player-area` is
now guaranteed to fit within the browser window at all times.

**Rationale**: A pure-CSS attempt was tried first (see "CSS-only attempt" below) but hit
a real browser limitation. The small JS resize handler is simple, has no debounce or
state-machine complexity, doesn't touch `VideoPlayer` or any playback logic, and gives
exact, predictable control over both the player's and timeline's widths so they can be
kept in sync trivially (both just get the same computed pixel value).

**CSS-only attempt (tried and abandoned)**: Modern CSS container query units (`cqw`/
`cqh`) can express "shrink an aspect-ratio box to fit within a container's height," and
this was verified to work correctly in an isolated test case. However, when applied to
the real page — where the container's height comes from `flex: 1` (flex-grow
distribution) rather than an explicit/definite CSS height — `cqh` reliably resolved to
`0` in live testing (`cqw` worked fine; only the block-axis unit failed). Giving the
container an explicit `calc(100vh - <header height>px)` height fixed `cqh`, but that
requires knowing the header's height as a hardcoded pixel constant, which is exactly the
kind of magic number the project avoids, and is also not robust to the header
occasionally reflowing (e.g. button wrapping at unusual widths). Chasing this further
would have meant either hardcoding a fragile constant or measuring the header's height
with JavaScript anyway — at which point the pure-CSS approach had lost its main
advantage, so the small resize-handler approach was used directly instead.

**Alternatives considered**:

- **Container query units on `#main-content`, no JS** — see above; abandoned due to the
  `cqh`-in-flex-grow browser limitation encountered in live testing.
- **Hardcoding pixel breakpoints/media queries** — rejected; the header, and therefore
  the space available to the player, isn't a fixed set of sizes, and media queries can't
  express "whatever height is left after the header," only fixed thresholds.

## Previous decision (2026-07-06, superseded): Anchor `#bottom-controls` to the viewport via `position: fixed`

**Decision**: Change `#bottom-controls` in `css/styles.css` from
`position: absolute; bottom: 0; left: 0; right: 0;` (positioned relative to
`#player-area`, its nearest positioned ancestor) to `position: fixed; bottom: 0; left: 0;
right: 0;` (positioned relative to the browser's viewport). No JavaScript changes are
needed — the regression is purely a CSS positioning-context problem.

**Rationale**: `#player-area` is `flex: 1` inside `#main-content`, which has
`overflow: auto`. On a normal (tall-enough) window, `#player-area`'s box bottom edge
coincides with the viewport's bottom edge, so `position: absolute; bottom: 0` on
`#bottom-controls` happens to look identical to being pinned to the window. But on a
short window, `#player-container` (16:9 aspect ratio, up to 1500px wide → up to ~844px
tall) can force `#player-area` taller than the viewport, and `#main-content`'s
`overflow: auto` lets the whole player area scroll — meaning the "bottom" of
`#player-area` (where `#bottom-controls` is anchored) is now below the visible fold.
`position: fixed` removes this coupling entirely: the controls are anchored to the
viewport itself, not to a box that can grow taller than the viewport, so they are
visible and clickable at every window height with zero JavaScript required to compute
or react to sizes.

**Alternatives considered at the time**:

- **Constrain the whole layout to `100vh`, shrinking the player to fit** — this was the
  initial draft approach and would also solve the bug (nothing would ever need to
  scroll). Rejected per the user's explicit choice in spec.md's Clarifications at the
  time: it was judged a bigger, riskier change (touching the player's sizing behavior
  established by the Minimal Aesthetic Redesign feature) for a bug whose simpler fix is
  a single CSS property. This is the option the user later reversed course on.
- **JavaScript resize-listener recalculating a max-height/transform** — rejected at the
  time as unnecessary complexity; this is exactly what the current (2026-07-07) decision
  above ended up using, once the pure-CSS shrink-to-fit route proved necessary.
- **`position: sticky` on `#bottom-controls`** — `sticky` still requires space to be
  reserved in normal flow for the element to stick within, and its containing block is
  still `#player-area`; it would not reliably stay within the visible viewport once
  `#player-area` itself overflows the viewport. `fixed` was the correct primitive for
  that (now superseded) approach.

## Interaction with the existing overlay/hover contract (feature 003/004)

`#bottom-controls` already has `z-index: 10` and its translucent gradient scrim; these
are unaffected by any of the sizing/positioning changes above. The hide/reveal contract
(`specs/003-minimal-aesthetic-redesign/contracts/control-overlay-behavior.md`, amended
by feature 004) governs only `#top-controls` — `#bottom-controls` was already removed
from it in feature 004 and stays untouched here. This feature does not amend that
contract; it has its own, separately-scoped contract for the sizing behavior (see
`contracts/viewport-fit-sizing.md`).

## The `min-height: auto` pitfall (discovered during implementation)

Removing `#player-container`'s old `min-height: 200px` (needed so the aspect-ratio-
derived height could shrink below 200px) wasn't sufficient on its own — flex items
default to `min-height: auto`, which invokes the "automatic minimum size" algorithm and
floors the item at its content's intrinsic minimum size. In this case, the `<video>`
element (`#html5-player`)'s intrinsic default size (300×150) floored the flex item at
~150px tall regardless of the `aspect-ratio`-derived value, causing the page to overflow
the viewport on short windows even though the JS math was correct. The fix was to set
`min-height: 0` explicitly on `#player-container` (and, separately, on `#main-content`,
which had the same issue at the outer flex level). Both are recorded as explicit
requirements in `contracts/viewport-fit-sizing.md` so they aren't silently reintroduced.
