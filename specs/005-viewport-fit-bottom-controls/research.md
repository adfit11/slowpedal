# Phase 0 Research: Bottom Controls Always Fit Within the Browser Window

## Decision: Anchor `#bottom-controls` to the viewport via `position: fixed`

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

**Alternatives considered**:

- **Constrain the whole layout to `100vh`, shrinking the player to fit** — this was the
  initial draft approach and would also solve the bug (nothing would ever need to
  scroll). Rejected per the user's explicit choice in spec.md's Clarifications: it was
  judged a bigger, riskier change (touching the player's sizing behavior established by
  the Minimal Aesthetic Redesign feature) for a bug whose simpler fix is a single CSS
  property. The user explicitly accepted that the video player may require scrolling to
  view in full on very short windows, as long as the controls themselves never do.
- **JavaScript resize-listener recalculating a max-height/transform** — rejected as
  unnecessary complexity; native CSS positioning already solves this declaratively with
  no listener, no layout thrashing, and no edge cases around resize-event timing.
- **`position: sticky` on `#bottom-controls`** — `sticky` still requires space to be
  reserved in normal flow for the element to stick within, and its containing block is
  still `#player-area`; it would not reliably stay within the visible viewport once
  `#player-area` itself overflows the viewport. `fixed` is the correct primitive here
  because the anchor needs to be the viewport, not any scrollable ancestor.

## Interaction with the existing overlay/hover contract (feature 003/004)

`#bottom-controls` already has `z-index: 10` and its translucent gradient scrim; these
are unaffected by the position change. The hide/reveal contract
(`specs/003-minimal-aesthetic-redesign/contracts/control-overlay-behavior.md`, amended
by feature 004) governs only `#top-controls` — `#bottom-controls` was already removed
from it in feature 004 and stays untouched here. This feature does not amend that
contract; it adds a new, narrowly-scoped one for the positioning behavior specifically
(see `contracts/bottom-controls-viewport-anchor.md`).

## Scrolling behavior on short windows

Per spec.md FR-003, when the window is too short to show the full page at once,
scrolling `#main-content` (which already has `overflow: auto`) remains the mechanism for
viewing the parts of the player that don't fit. No new scroll container or scroll-lock
logic is introduced — this already works today; the only bug was that the controls
scrolled away *with* the content instead of staying fixed.
