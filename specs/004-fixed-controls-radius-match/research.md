# Phase 0 Research: Persistent Bottom Controls and Matching Status Radius

Both changes are small and unambiguous once grounded in the current code
(`css/styles.css`, `js/scripts.js` as of the Minimal Aesthetic Redesign feature). No
open questions remain; this documents the mechanical approach.

## Decision: Remove `#bottom-controls` from the state-gated hiding rule, don't rearchitect its layout

**Rationale**: The current rules are:

```css
body.state-ready #bottom-controls > * { opacity: 0; pointer-events: none; ... }
body.state-ready #bottom-controls.revealed > * { opacity: 1; pointer-events: auto; }
```

Deleting both rules (and the parallel ones don't exist for anything else scoped to
`#bottom-controls`) means its children are simply always at their default `opacity: 1`
with normal pointer-events — "always visible" falls out of *removing* code, not adding
any. `#bottom-controls` keeps its existing `position: absolute` overlay placement,
gradient scrim, and z-index exactly as feature 003 left them — per spec Assumptions,
this feature doesn't move it back into document flow.

**Alternatives considered**:
- *Move `#bottom-controls` back into normal document flow below the player (its
  pre-003 layout)*: rejected — bigger diff, changes the player's reclaimed-space
  calculation, and wasn't what was asked ("always visible," not "put it back where it
  was"). The overlay-but-permanent presentation is a common, well-understood pattern
  (e.g. a persistent video-player control bar).

## Decision: Also remove the `initControlZoneHover('bottom-controls')` call, not just the CSS

**Rationale**: With the CSS hiding rule gone, the hover-driven `.revealed` class this
call toggles on `#bottom-controls` no longer affects anything — leaving the listener
registered would be dead code (a `mouseenter`/`mouseleave` pair silently toggling a
class with no visual effect). Removing the call is the "keep it simple" choice; the
shared `initControlZoneHover()` function itself is untouched and still used for
`#top-controls`, which keeps its existing hide/reveal behavior unchanged (spec FR-002).

## Decision: A shared `--radius-panel` custom property, applied to both boxes

**Rationale**: `.load-state-indicator` currently has `border-radius: 20px` (pill-shaped)
while `.video-source` has `border-radius: 8px` (rounded rectangle) — two independently
hardcoded values that happen to differ today and could drift further apart in either
direction in a future edit. Per spec FR-004 ("changing one updates the other
automatically"), the fix is one new variable in the existing `:root` palette block
(alongside the color variables from feature 003) — `--radius-panel: 8px` — applied to
both selectors' `border-radius`, replacing the two hardcoded numbers.

**Alternatives considered**:
- *Just change `.load-state-indicator`'s hardcoded `20px` to `8px` directly*: rejected
  — satisfies FR-003 alone but not FR-004; the two values would still be free to drift
  apart again in a later, unrelated edit to either rule.

## Decision: Amend `contracts/control-overlay-behavior.md` (feature 003) in place, no new contract file

**Rationale**: That file documents the hotzone/hide contract for *both* zones; since
this feature removes one zone (`#bottom-controls`) from that contract entirely, the
accurate record is to update the existing document to reflect that only `#top-controls`
is still governed by it, rather than publish a second, overlapping contract file for a
feature this small.
